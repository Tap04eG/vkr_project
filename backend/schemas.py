from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, TaskStatus

# --- Схемы для создания данных (ввод) ---

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Валидация сложности пароля"""
        if not any(char.isupper() for char in v):
            raise ValueError('Пароль должен содержать заглавную букву')
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать цифру')
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Валидация формата имени пользователя"""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username может содержать только буквы, цифры, _ и -')
        return v

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    reward_xp: int = Field(default=10, ge=1, le=1000)
    student_id: int = Field(..., gt=0)
    task_type: str = "text"
    task_data: Optional[str] = "{}"

class TaskCheckRequest(BaseModel):
    user_answer: object
    attempt_count: Optional[int] = 1

class TaskBulkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    reward_xp: int = Field(default=10, ge=1, le=1000)
    student_ids: List[int]
    task_type: str = "text"
    task_data: Optional[str] = "{}"

class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

# --- Схемы для ответов API (вывод) ---

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    is_active: bool
    xp: int
    level: int
    tasks_completed: int = 0

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    reward_xp: int
    status: TaskStatus
    teacher_id: int
    student_id: int
    class_id: Optional[int] = None
    created_at: datetime
    task_type: str
    task_data: str

    class Config:
        from_attributes = True

class ClassResponse(ClassCreate):
    id: int
    teacher_id: int
    students: List[UserResponse] = []

    class Config:
        from_attributes = True

# --- Схемы для авторизации и связей ---

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LinkChildRequest(BaseModel):
    child_username: str
