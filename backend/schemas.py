from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from models import UserRole, TaskStatus

# --- Классы создания ---

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
        """Проверить сложность пароля"""
        if not any(char.isupper() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Проверить формат username"""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username может содержать только буквы, цифры, _ и -')
        return v

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=5, max_length=5000)
    reward_xp: int = Field(default=10, ge=1, le=1000)  # ge = >=, le = <=
    student_id: int = Field(..., gt=0)

class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

# --- Классы ответов ---

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

    class Config:
        from_attributes = True

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    reward_xp: int
    status: TaskStatus
    teacher_id: int
    student_id: int

    class Config:
        from_attributes = True

class ClassResponse(ClassCreate):
    id: int
    teacher_id: int
    students: List[UserResponse] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LinkChildRequest(BaseModel):
    child_username: str
