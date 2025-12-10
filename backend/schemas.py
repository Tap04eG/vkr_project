from pydantic import BaseModel
from typing import Optional, List
from models import UserRole, TaskStatus

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    xp: int
    level: int
    tasks_completed: int = 0

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: str
    reward_xp: int = 10

class TaskCreate(TaskBase):
    student_id: int

class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    teacher_id: int
    student_id: int

    class Config:
        from_attributes = True

class ClassCreate(BaseModel):
    name: str

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
