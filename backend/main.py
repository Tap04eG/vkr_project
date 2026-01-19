from fastapi import FastAPI, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List
from os import getenv
from jose import JWTError, jwt
from pydantic import BaseModel

# ОГРАНИЧЕНИЕ ЗАПРОСОВ (RATE LIMITING)
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Импорт логгера из вашего конфига
from logging_config import logger
import models, schemas, database, auth

# НАСТРОЙКА LIMITER
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Educational Platform API")

# Подключить limiter к приложению
app.state.limiter = limiter

# ОБРАБОТЧИК ОШИБОК ОГРАНИЧЕНИЯ ЗАПРОСОВ
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    """
    Обработка ошибки когда превышен лимит запросов
    Возвращает код 429 (Too Many Requests)
    """
    return JSONResponse(
        status_code=429,
        content={"detail": "Слишком много запросов. Попробуйте позже."}
    )

# Миграции управляются через Alembic
# Смотрите README для инструкций по миграциям
# Для разработки: alembic upgrade head

origins = ["http://localhost:5173", "http://localhost:3000"]

ALLOWED_ORIGINS = [
    origin.strip() 
    for origin in getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") 
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_origin_regex=None,
)

# ============================================================================
# МАРШРУТЫ АВТОРИЗАЦИИ
# ============================================================================

@app.post("/register", response_model=schemas.UserResponse)
@limiter.limit("5/minute")  # Максимум 5 регистраций в минуту на один IP
def register_user(request: Request, user: schemas.UserCreate, db: Session = Depends(database.get_db)):

    try:
        # Проверка существования пользователя
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            logger.warning(f"Попытка регистрации с существующим username: {user.username}")
            raise HTTPException(
                status_code=400, 
                detail="Пользователь с таким именем уже существует"
            )
        
        # Проверка Email, если он указан
        if user.email:
            db_email = db.query(models.User).filter(models.User.email == user.email).first()
            if db_email:
                logger.warning(f"Попытка регистрации с существующим email: {user.email}")
                raise HTTPException(
                    status_code=400, 
                    detail="Этот Email уже зарегистрирован"
                )
        
        # Хеширование пароля
        hashed_password = auth.get_password_hash(user.password)
        
        # Создание нового пользователя
        new_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name
        )
        
        # Сохранение в БД
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Новый пользователь зарегистрирован: {user.username} (Роль: {user.role})")
        return new_user

    except HTTPException as he:
        # Пробрасываем ошибку валидации (400) дальше
        raise he
    
    except Exception as e:
        # Логируем критические ошибки базы данных или кода
        logger.error(f"Ошибка при регистрации {user.username}: {str(e)}")
        db.rollback()  # Откатываем транзакцию при ошибке
        raise HTTPException(
            status_code=500, 
            detail="Внутренняя ошибка сервера при регистрации"
        )


# ============================================================================
# ВХОД И ПОЛУЧЕНИЕ ТОКЕНА
# ============================================================================
@app.post("/token", response_model=schemas.Token)
@limiter.limit("10/minute")  # Максимум 10 попыток входа в минуту
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            logger.warning(f"Неудачная попытка входа: {form_data.username}")
            raise HTTPException(
                status_code=401, 
                detail="Неверное имя пользователя или пароль"
            )
        
        # Создание access token
        access_token = auth.create_access_token(
            data={"sub": user.username, "role": user.role.value}
        )
        refresh_token = auth.create_refresh_token(
            data={"sub": user.username}
        )
        
        logger.info(f"Успешный вход: {user.username}")
        
        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    except HTTPException as he:
        raise he
    
    except Exception as e:
        logger.error(f"❌ Ошибка при попытке входа: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Ошибка при обработке входа"
        )


@app.get("/users/me", response_model=schemas.UserResponse)
@limiter.limit("60/minute")  # 60 запросов в минуту = 1 запрос в секунду
async def read_users_me(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user)
):
    logger.debug(f"📋 Запрос профиля: {current_user.username}")
    return current_user

class RefreshTokenRequest(BaseModel):
    refresh_token: str
    
@app.post("/refresh-token", response_model=schemas.Token)
@limiter.limit("20/minute")
def refresh_access_token(
    request: Request,
    token_data: RefreshTokenRequest, 
    db: Session = Depends(database.get_db)
):
    
    refresh_token = token_data.refresh_token
    try:
        # Декодировать refresh токен
        payload = jwt.decode(
            refresh_token, 
            auth.SECRET_KEY, 
            algorithms=[auth.ALGORITHM]
        )
        
        # Проверить что это refresh токен
        if payload.get("type") != "refresh":
            logger.warning(f"Попытка использовать неправильный тип токена")
            raise HTTPException(
                status_code=401, 
                detail="Invalid token type"
            )
        
        # Получить username из токена
        username = payload.get("sub")
        if not username:
            logger.warning(f"Refresh токен без username")
            raise HTTPException(
                status_code=401, 
                detail="Invalid token"
            )
        
        # Найти пользователя в БД
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            logger.warning(f"Пользователь не найден при обновлении токена: {username}")
            raise HTTPException(
                status_code=404, 
                detail="User not found"
            )
        
        # Создать новый access token
        new_access_token = auth.create_access_token(
            data={"sub": user.username, "role": user.role.value}
        )
        
        logger.info(f"Токен обновлен для пользователя: {username}")
        
        return {
            "access_token": new_access_token, 
            "token_type": "bearer"
        }
    
    except JWTError as je:
        logger.warning(f"Ошибка JWT при обновлении токена: {str(je)}")
        raise HTTPException(
            status_code=401, 
            detail="Invalid refresh token"
        )
    
    except HTTPException as he:
        raise he
    
    except Exception as e:
        logger.error(f"Ошибка при обновлении токена: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Ошибка при обновлении токена"
        )


# ============================================================================
# МАРШРУТЫ КЛАССОВ И УЧИТЕЛЕЙ
# ============================================================================

# ============================================================================
# МАРШРУТЫ КЛАССОВ И УЧИТЕЛЕЙ
# ============================================================================

@app.get("/students", response_model=List[schemas.UserResponse])
@limiter.limit("30/minute")
def get_all_students(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Получить список всех учеников (для учителя)
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can view student list")
    
    return db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).all()

@app.post("/classes", response_model=schemas.ClassResponse)
@limiter.limit("10/minute")
def create_class(
    request: Request,
    class_data: schemas.ClassCreate, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Создать новый класс (только для учителей)
    
    Rate Limit: 10/minute
    """
    if current_user.role != models.UserRole.TEACHER:
        logger.warning(f"⚠️ Попытка создать класс не-учителем: {current_user.username}")
        raise HTTPException(
            status_code=403, 
            detail="Только учителя могут создавать классы"
        )
    
    new_class = models.ClassGroup(
        name=class_data.name, 
        teacher_id=current_user.id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    logger.info(f"Класс создан: {class_data.name} (Учитель: {current_user.username})")
    
    return new_class


@app.get("/teachers/stats")
@limiter.limit("30/minute")
def get_teacher_stats(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Получить статистику для дашборда учителя
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")

    # 1. Active Classes
    classes_count = db.query(models.ClassGroup).filter(models.ClassGroup.teacher_id == current_user.id).count()

    # 2. Total Students (in my classes)
    # Join ClassGroup to ensure we only count students in MY classes
    # Explicitly specify join condition to avoid ambiguous foreign key error
    students_count = db.query(models.User).join(
        models.ClassGroup, 
        models.User.class_id == models.ClassGroup.id
    ).filter(
        models.ClassGroup.teacher_id == current_user.id,
        models.User.role == models.UserRole.STUDENT
    ).count()

    # 3. Tasks on Review
    tasks_on_review = db.query(models.Task).filter(
        models.Task.teacher_id == current_user.id, 
        models.Task.status == models.TaskStatus.ON_REVIEW
    ).count()

    return {
        "classes_count": classes_count,
        "students_count": students_count,
        "tasks_on_review": tasks_on_review
    }


@app.get("/teachers/my-classes", response_model=List[schemas.ClassResponse])
@limiter.limit("30/minute")  
def get_my_classes(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Получить все классы текущего учителя
    
    Rate Limit: 30/minute
    """
    from sqlalchemy.orm import joinedload
    return db.query(models.ClassGroup).options(
        joinedload(models.ClassGroup.students)
    ).filter(models.ClassGroup.teacher_id == current_user.id).all()


@app.post("/classes/{class_id}/students")
@limiter.limit("20/minute")  #  Максимум 20 добавлений в минуту
def add_student_to_class(
    request: Request,
    class_id: int, 
    link_request: schemas.LinkChildRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Добавление ученика в класс (Учитель).
    Теперь передаем username в теле запроса (json).
    
    Rate Limit: 20/minute
    """
    if current_user.role != models.UserRole.TEACHER:
        logger.warning(f"Попытка добавить ученика не-учителем: {current_user.username}")
        raise HTTPException(
            status_code=403, 
            detail="Only teachers"
        )
    
    student = db.query(models.User).filter(
        models.User.username == link_request.child_username, 
        models.User.role == models.UserRole.STUDENT
    ).first()
    
    if not student:
        logger.warning(f"Ученик не найден: {link_request.child_username}")
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )
    
    # Check if student is already in a class
    if student.class_id:
         # Lazy load the class if needed (it should be accessible via relationship)
         current_class_name = student.class_group.name if student.class_group else f"ID {student.class_id}"
         raise HTTPException(
             status_code=400,
             detail=f"Ученик уже в классе: {current_class_name}"
         )

    # Check if class exists
    class_group = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
        
    # Check ownership
    if class_group.teacher_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not your class")

    student.class_id = class_id
    db.commit()
    
    logger.info(f"Ученик {link_request.child_username} добавлен в класс {class_id}")
    return {"message": f"Student {link_request.child_username} added to class {class_id}"}


# ============================================================================
# МАРШРУТЫ РОДИТЕЛЕЙ
# ============================================================================

@app.post("/parents/link-child")
@limiter.limit("20/minute")
def link_child_to_parent(
    request: Request,
    link_request: schemas.LinkChildRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Привязать ребенка (ученика) к родителю
    
    Rate Limit: 20/minute
    """
    if current_user.role != models.UserRole.PARENT:
        logger.warning(f"Попытка привязать ребенка не-родителем: {current_user.username}")
        raise HTTPException(
            status_code=403,
            detail="Только родители могут привязывать детей"
        )
    
    # Найти ученика по username
    student = db.query(models.User).filter(
        models.User.username == link_request.child_username,
        models.User.role == models.UserRole.STUDENT
    ).first()
    
    if not student:
        logger.warning(f"Ученик не найден: {link_request.child_username}")
        raise HTTPException(
            status_code=404,
            detail="Ученик с таким логином не найден"
        )
    
    # Проверить, не привязан ли уже этот ребенок к этому родителю
    if student in current_user.children:
        raise HTTPException(
            status_code=400,
            detail="Этот ребенок уже привязан к вашему аккаунту"
        )
    
    # Добавить связь
    current_user.children.append(student)
    db.commit()
    
    logger.info(f"Родитель {current_user.username} привязал ребенка {student.username}")
    return {"message": f"Ребенок {student.username} успешно добавлен"}


@app.get("/parents/my-children", response_model=List[schemas.UserResponse])
@limiter.limit("30/minute")
def get_my_children(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Получить список детей текущего родителя
    
    Rate Limit: 30/minute
    """
    if current_user.role != models.UserRole.PARENT:
        raise HTTPException(
            status_code=403,
            detail="Только родители могут просматривать список детей"
        )
    
    return current_user.children


# ============================================================================
# МАРШРУТЫ ЗАДАЧ
# ============================================================================

@app.post("/tasks", response_model=schemas.TaskResponse)
@limiter.limit("20/minute")
def create_task(
    request: Request,
    task: schemas.TaskCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Создать задание для ученика (только учитель)
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(
            status_code=403, 
            detail="Only teachers can assign tasks"
        )
    
    # Проверка существования ученика
    student = db.query(models.User).filter(models.User.id == task.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # ПРОВЕРКА БЕЗОПАСНОСТИ: Предотвращение IDOR
    # Проверяем, что ученик находится в классе, которым руководит текущий учитель
    if not student.class_group or student.class_group.teacher_id != current_user.id:
        logger.warning(f"⚠️ Security Alert: Учитель {current_user.username} попытался выдать задание чужому ученику {student.username}")
        raise HTTPException(
            status_code=403,
            detail="Вы можете выдавать задания только ученикам своих классов"
        )

    new_task = models.Task(
        title=task.title,
        description=task.description,
        reward_xp=task.reward_xp,
        student_id=task.student_id,
        teacher_id=current_user.id,
        status=models.TaskStatus.PENDING,
        task_type=task.task_type,
        task_data=task.task_data
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    logger.info(f"Задание '{task.title}' выдано ученику {student.username} (xp: {task.reward_xp})")
    return new_task

@app.post("/tasks/bulk")
@limiter.limit("10/minute") # 10 mass assignments per minute
def create_tasks_bulk(
    request: Request,
    task_data: schemas.TaskBulkCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Массовая выдача заданий (только учитель)
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")
    
    if not task_data.student_ids:
        raise HTTPException(status_code=400, detail="No students selected")

    # 1. Fetch all target students with class_group loaded
    from sqlalchemy.orm import joinedload
    students = db.query(models.User).options(
        joinedload(models.User.class_group)
    ).filter(models.User.id.in_(task_data.student_ids)).all()
    
    if len(students) != len(task_data.student_ids):
        raise HTTPException(status_code=400, detail="Some students not found")

    # 2. Проверка безопасности: Убеждаемся, что ВСЕ ученики принадлежат классам этого учителя
    # Проверяем, есть ли хоть один студент НЕ из классов учителя
    for student in students:
        if not student.class_group or student.class_group.teacher_id != current_user.id:
            logger.warning(f"⚠️ Security Alert: Mass assign to outsider {student.username}")
            raise HTTPException(
                status_code=403, 
                detail=f"Student {student.username} is not in your class"
            )

    # 3. Создание задач
    new_tasks = []
    for student in students:
        new_task = models.Task(
            title=task_data.title,
            description=task_data.description,
            reward_xp=task_data.reward_xp,
            student_id=student.id,
            teacher_id=current_user.id,
            status=models.TaskStatus.PENDING,
            task_type=task_data.task_type,
            task_data=task_data.task_data
        )
        db.add(new_task)
        new_tasks.append(new_task)
    
    db.commit()
    logger.info(f"Mass assignment: '{task_data.title}' to {len(students)} students by {current_user.username}")
    
    return {"message": f"Successfully assigned to {len(students)} students"}

@app.get("/tasks/my", response_model=List[schemas.TaskResponse])
@limiter.limit("30/minute")
def get_my_tasks(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Получить задания текущего ученика
    """
    return db.query(models.Task).filter(models.Task.student_id == current_user.id).all()

import json

@app.post("/tasks/{task_id}/check")
@limiter.limit("20/minute")
def check_task(
    request: Request,
    task_id: int,
    check_data: schemas.TaskCheckRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Проверка ответа задачи на сервере
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your task")
        
    if task.status == models.TaskStatus.COMPLETED:
        return {"correct": True, "message": "Already completed", "new_xp": current_user.xp}

    # Вспомогательная функция для парсинга данных
    try:
        data = json.loads(task.task_data) if isinstance(task.task_data, str) else task.task_data
    except:
        data = {}

    is_correct = False
    user_answer = check_data.user_answer

    # Логика валидации
    if task.task_type == "selection":
        # Ожидаем список индексов выбранных элементов
        if isinstance(user_answer, list):
            selected_vals = [data.get('items')[i] for i in user_answer if 0 <= i < len(data.get('items', []))]
            correct_vals = data.get('correctItems', [])
            is_correct = sorted(selected_vals) == sorted(correct_vals)
            
    elif task.task_type == "ordering":
        # Ожидаем строку (собранное слово)
        if isinstance(user_answer, str):
            is_correct = user_answer == data.get('targetWord')
            
    elif task.task_type == "input":
        if isinstance(user_answer, str):
            is_correct = user_answer.strip().lower() == data.get('correctAnswer', '').strip().lower()

    elif task.task_type == "fill_blanks":
        # Ожидаем словарь {index: answer}
        if isinstance(user_answer, dict):
            all_correct = True
            for b in data.get('blanks', []):
                idx = str(b['index']) # JSON keys are strings
                user_val = user_answer.get(idx) or user_answer.get(int(idx)) or ""
                if user_val.lower() != b['correct'].lower():
                    all_correct = False
                    break
            is_correct = all_correct

    elif task.task_type == "essay":
        # Эссе не проверяется автоматически, а отправляется учителю
        if isinstance(user_answer, str) and len(user_answer.strip()) > 0:
            task.student_answer = user_answer
            task.status = models.TaskStatus.ON_REVIEW
            task.attempts += 1
            db.commit()
            return {
                "correct": True, 
                "message": "Отправлено на проверку", 
                "status": "on_review", 
                "new_xp": current_user.xp
            }
        else:
            return {"correct": False, "message": "Напишите что-нибудь!"}

    else:
        # Текстовые или логические задачи для ручной проверки (пока авто-зачет)
        is_correct = True

    if is_correct:
        # Расчет XP с учетом штрафа за попытки (Server-Side Tracking)
        # Штраф: -2 XP за каждую попытку после первой, но не меньше 1 XP
        
        # Увеличиваем счетчик попыток (даже если правильно)
        task.attempts += 1
        
        # Считаем штраф на основе УЖЕ сделанных попыток
        # 1-я попытка (attempts=1) -> штраф 0
        # 2-я попытка (attempts=2) -> штраф 2
        penalty = (task.attempts - 1) * 2
        earned_xp = max(1, task.reward_xp - penalty)

        task.status = models.TaskStatus.COMPLETED
        current_user.xp += earned_xp
        
        # Логика повышения уровня
        current_user.level = (current_user.xp // 100) + 1
        
        db.commit()
        return {"correct": True, "message": "Правильно!", "new_xp": current_user.xp, "earned_xp": earned_xp}
    else:
        # Увеличиваем счетчик попыток при ошибке
        task.attempts += 1
        db.commit()
        
        return {"correct": False, "message": "Incorrect, try again"}


@app.post("/tasks/{task_id}/complete")
@limiter.limit("10/minute")
def complete_task(
    request: Request,
    task_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Отметить задание как выполненное и получить XP
    Разрешено только для задач типа 'theory' или 'manual'
    """
    print(f"DEBUG: complete_task called for id={task_id} by user={current_user.username} (id={current_user.id})")
    
    # Debug: list all tasks
    all_tasks = db.query(models.Task).all()
    print(f"DEBUG: All tasks in DB: {[t.id for t in all_tasks]}")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        print(f"DEBUG: Task {task_id} NOT FOUND.")
        raise HTTPException(status_code=404, detail="Task not found")
        
    print(f"DEBUG: Found task {task.id}, student_id={task.student_id}, type={task.task_type}")

    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your task")

    # ПРОВЕРКА БЕЗОПАСНОСТИ: Запретить ручное завершение интерактивных задач
    if task.task_type not in ["theory", "manual"]:
        raise HTTPException(
            status_code=400, 
            detail="Тип задачи требует автоматической проверки (используйте /check)"
        )
        
    if task.status == models.TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task already completed")
        
    # Обновляем статус
    task.status = models.TaskStatus.COMPLETED
    
    # Начисляем XP
    current_user.xp += task.reward_xp
    
    # Логика повышения уровня (каждые 100 XP)
    old_level = current_user.level
    current_user.level = (current_user.xp // 100) + 1
    
    if current_user.level > old_level:
        logger.info(f"🎉 Пользователь {current_user.username} повысил уровень до {current_user.level}!")
    
    db.commit()
    
    logger.info(f"Задание {task_id} выполнено пользователем {current_user.username}. +{task.reward_xp} XP")
    
    return {
        "message": "Task completed", 
        "new_xp": current_user.xp,
        "new_level": current_user.level
    }

# ============================================================================
# МАРШРУТЫ ДЛЯ ПРОВЕРКИ ЗАДАНИЙ УЧИТЕЛЕМ
# ============================================================================

@app.get("/teacher/reviews", response_model=List[schemas.TaskResponse])
@limiter.limit("30/minute")
def get_reviews(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Получить список заданий со статусом ON_REVIEW, которые назначены ученикам этого учителя
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")
    
    logger.info(f"Checking reviews for teacher {current_user.id} ({current_user.username})")
    
    # DEBUG: Check total ON_REVIEW tasks
    total_reviews = db.query(models.Task).filter(models.Task.status == models.TaskStatus.ON_REVIEW).count()
    logger.info(f"Total ON_REVIEW tasks in DB: {total_reviews}")

    # Можно просто фильтровать по teacher_id, так как этот id проставляется при создании задачи
    tasks = db.query(models.Task).filter(
        models.Task.teacher_id == current_user.id,
        models.Task.status == models.TaskStatus.ON_REVIEW
    ).all()
    
    logger.info(f"Found {len(tasks)} tasks for this teacher.")
    
    return tasks

@app.post("/teacher/tasks/{task_id}/approve")
@limiter.limit("20/minute")
def approve_task(
    request: Request,
    task_id: int,
    approval_data: schemas.TaskApproveRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Принять задание (Учитель).
    Можно начислить bonus_xp.
    """
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers")
        
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your task")
        
    if task.status != models.TaskStatus.ON_REVIEW:
        raise HTTPException(status_code=400, detail="Task is not on review")
        
    student = db.query(models.User).filter(models.User.id == task.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student user not found")

    # 1. Update Task
    task.status = models.TaskStatus.COMPLETED
    # (Optional) Store feedback if we had a column for it
    
    # 2. Award XP
    total_xp = task.reward_xp + (approval_data.bonus_xp or 0)
    student.xp += total_xp
    
    # 3. Level Up Logic
    old_level = student.level
    student.level = (student.xp // 100) + 1
    
    db.commit()
    
    logger.info(f"Задание {task_id} принято учителем {current_user.username}. +{total_xp} XP ученику {student.username}")
    
    return {"message": "Task approved", "student_xp": student.xp, "student_level": student.level}

