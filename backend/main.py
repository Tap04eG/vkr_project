from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List
from os import getenv

# Импорт логгера из вашего конфига
from logging_config import logger
import models, schemas, database, auth

app = FastAPI(title="Educational Platform API")

# Миграции управляются через Alembic
# Смотрите README для инструкций по миграциям
# Для разработки: alembic upgrade head

origins = ["http://localhost:5173", "http://localhost:3000"]

ALLOWED_ORIGINS = getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_origin_regex=None,  # Для продакшена можно использовать regex
)


# --- AUTH ROUTES ---

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        # Проверка существующего пользователя
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            logger.warning(f"Попытка регистрации с существующим username: {user.username}")
            raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
        
        # Проверка Email, если он указан
        if user.email:
            db_email = db.query(models.User).filter(models.User.email == user.email).first()
            if db_email:
                logger.warning(f"Попытка регистрации с существующим email: {user.email}")
                raise HTTPException(status_code=400, detail="Этот Email уже зарегистрирован")
        
        # Хеширование и создание
        hashed_password = auth.get_password_hash(user.password)
        
        new_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Новый пользователь успешно зарегистрирован: {user.username} (Роль: {user.role})")
        return new_user

    except HTTPException as he:
        # Пробрасываем ошибку валидации (400) дальше
        raise he
    except Exception as e:
        # Логируем критические ошибки базы данных или кода
        logger.error(f"Ошибка при регистрации пользователя {user.username}: {str(e)}")
        db.rollback() # Откатываем транзакцию при ошибке
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера при регистрации")

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- CLASSROOM & TEACHER ROUTES ---

@app.post("/classes", response_model=schemas.ClassResponse)
def create_class(class_data: schemas.ClassCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Только учителя могут создавать классы")
    
    new_class = models.ClassGroup(name=class_data.name, teacher_id=current_user.id)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@app.get("/teachers/my-classes", response_model=List[schemas.ClassResponse])
def get_my_classes(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    from sqlalchemy.orm import joinedload
    return db.query(models.ClassGroup).options(joinedload(models.ClassGroup.students)).filter(models.ClassGroup.teacher_id == current_user.id).all()

@app.post("/classes/{class_id}/add-student/{username}")
def add_student_to_class(class_id: int, username: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")
    
    student = db.query(models.User).filter(models.User.username == username, models.User.role == models.UserRole.STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Ученик не найден")
    
    class_group = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id, models.ClassGroup.teacher_id == current_user.id).first()
    if not class_group:
         raise HTTPException(status_code=404, detail="Класс не найден или нет доступа")
         
    student.class_id = class_id
    db.commit()
    return {"message": "Ученик добавлен в класс"}

# --- TASK ROUTES ---

@app.post("/tasks", response_model=schemas.TaskResponse)
def assign_task(task: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")
    
    new_task = models.Task(
        title=task.title,
        description=task.description,
        reward_xp=task.reward_xp,
        student_id=task.student_id,
        teacher_id=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/tasks/my", response_model=List[schemas.TaskResponse])
def get_my_tasks(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Task).filter(models.Task.student_id == current_user.id).all()

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.student_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
        if task.status != models.TaskStatus.COMPLETED:
            task.status = models.TaskStatus.COMPLETED
            current_user.xp += task.reward_xp
            
            # Проверка повышения уровня
            required_xp = current_user.level * 100
            if current_user.xp >= required_xp:
                overflow_xp = current_user.xp - required_xp  # ✅ СОХРАНЯЕМ ЛИШНИЕ XP
                current_user.level += 1
                current_user.xp = overflow_xp
            
            db.commit()

    
    return {"message": "Задание выполнено!", "new_xp": current_user.xp, "new_level": current_user.level}

# --- PARENT ROUTES ---

@app.post("/parents/link-child")
def link_child(request: schemas.LinkChildRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != models.UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Только для родителей")
    
    child = db.query(models.User).filter(models.User.username == request.child_username, models.User.role == models.UserRole.STUDENT).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок с таким именем не найден")
    
    current_user.children.append(child)
    db.commit()
    return {"message": "Ребенок успешно добавлен!"}

@app.get("/parents/my-children", response_model=List[schemas.UserResponse])
def get_my_children(current_user: models.User = Depends(auth.get_current_user)):
    return current_user.children

# --- GENERAL ---
@app.get("/")
def read_root():
    return {"message": "Educational Platform API v2"}
