from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List
from os import getenv
from jose import JWTError, jwt

# ===== RATE LIMITING =====
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Импорт логгера из вашего конфига
from logging_config import logger
import models, schemas, database, auth

# ===== СОЗДАНИЕ LIMITER =====
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Educational Platform API")

# Подключить limiter к приложению
app.state.limiter = limiter

# ===== ОБРАБОТЧИК ОШИБОК RATE LIMITING =====
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
    allow_origin_regex=None,
)

# ============================================================================
# ============================= AUTH ROUTES ================================
# ============================================================================

@app.post("/register", response_model=schemas.UserResponse)
@limiter.limit("5/minute")  # 🛡️ Максимум 5 регистраций в минуту на один IP
def register_user(request, user: schemas.UserCreate, db: Session = Depends(database.get_db)):

    try:
        # Проверка существующего пользователя
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
        
        logger.info(f"✅ Новый пользователь зарегистрирован: {user.username} (Роль: {user.role})")
        return new_user

    except HTTPException as he:
        # Пробрасываем ошибку валидации (400) дальше
        raise he
    
    except Exception as e:
        # Логируем критические ошибки базы данных или кода
        logger.error(f"❌ Ошибка при регистрации {user.username}: {str(e)}")
        db.rollback()  # Откатываем транзакцию при ошибке
        raise HTTPException(
            status_code=500, 
            detail="Внутренняя ошибка сервера при регистрации"
        )


@app.post("/token", response_model=schemas.Token)
@limiter.limit("10/minute")  # 🛡️ Максимум 10 попыток входа в минуту
def login_for_access_token(
    request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            logger.warning(f"⚠️ Неудачная попытка входа: {form_data.username}")
            raise HTTPException(
                status_code=401, 
                detail="Неверное имя пользователя или пароль"
            )
        
        # Создание access token
        access_token = auth.create_access_token(
            data={"sub": user.username, "role": user.role.value}
        )
        
        logger.info(f"✅ Успешный вход: {user.username}")
        
        return {
            "access_token": access_token, 
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
@limiter.limit("60/minute")  # 🛡️ 60 запросов в минуту = 1 запрос в секунду
async def read_users_me(
    request,
    current_user: models.User = Depends(auth.get_current_user)
):
    logger.debug(f"📋 Запрос профиля: {current_user.username}")
    return current_user


@app.post("/refresh-token", response_model=schemas.Token)
@limiter.limit("20/minute")  # 🛡️ 20 запросов на обновление в минуту
def refresh_access_token(
    request,
    refresh_token: str, 
    db: Session = Depends(database.get_db)
):
    try:
        # Декодировать refresh token
        payload = jwt.decode(
            refresh_token, 
            auth.SECRET_KEY, 
            algorithms=[auth.ALGORITHM]
        )
        
        # Проверить что это refresh токен
        if payload.get("type") != "refresh":
            logger.warning(f"⚠️ Попытка использовать неправильный тип токена")
            raise HTTPException(
                status_code=401, 
                detail="Invalid token type"
            )
        
        # Получить username из токена
        username = payload.get("sub")
        if not username:
            logger.warning(f"⚠️ Refresh токен без username")
            raise HTTPException(
                status_code=401, 
                detail="Invalid token"
            )
        
        # Найти пользователя в БД
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            logger.warning(f"⚠️ Пользователь не найден при обновлении токена: {username}")
            raise HTTPException(
                status_code=404, 
                detail="User not found"
            )
        
        # Создать новый access token
        new_access_token = auth.create_access_token(
            data={"sub": user.username, "role": user.role.value}
        )
        
        logger.info(f"✅ Токен обновлен для пользователя: {username}")
        
        return {
            "access_token": new_access_token, 
            "token_type": "bearer"
        }
    
    except JWTError as je:
        logger.warning(f"⚠️ Ошибка JWT при обновлении токена: {str(je)}")
        raise HTTPException(
            status_code=401, 
            detail="Invalid refresh token"
        )
    
    except HTTPException as he:
        raise he
    
    except Exception as e:
        logger.error(f"❌ Ошибка при обновлении токена: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Ошибка при обновлении токена"
        )


# ============================================================================
# ===================== CLASSROOM & TEACHER ROUTES ==========================
# ============================================================================

@app.post("/classes", response_model=schemas.ClassResponse)
@limiter.limit("10/minute")
def create_class(
    request,
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
    
    logger.info(f"✅ Класс создан: {class_data.name} (Учитель: {current_user.username})")
    
    return new_class


@app.get("/teachers/my-classes", response_model=List[schemas.ClassResponse])
@limiter.limit("30/minute")  
def get_my_classes(
    request,
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


@app.post("/classes/{class_id}/add-student/{username}")
@limiter.limit("20/minute")  # 🛡️ Максимум 20 добавлений в минуту
def add_student_to_class(
    request,
    class_id: int, 
    username: str, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Добавить ученика в класс (только учитель может это сделать)
    
    Rate Limit: 20/minute
    """
    if current_user.role != models.UserRole.TEACHER:
        logger.warning(f"⚠️ Попытка добавить ученика не-учителем: {current_user.username}")
        raise HTTPException(
            status_code=403, 
            detail="Only teachers"
        )
    
    student = db.query(models.User).filter(
        models.User.username == username, 
        models.User.role == models.UserRole.STUDENT
    ).first()
    if not student:
        logger.warning(f"⚠️ Ученик не найден: {username}")
        raise HTTPException(
            status_code=404,
