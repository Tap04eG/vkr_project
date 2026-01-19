from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, Table, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    ON_REVIEW = "on_review"
    COMPLETED = "completed"

# Таблицы связей (Многие-ко-многим)
parent_student = Table(
    'parent_student', Base.metadata,
    Column('parent_id', Integer, ForeignKey('users.id')),
    Column('student_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)

    # Личная информация
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    
    # Геймификация для учеников
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # Связи / Отношения
    tasks_assigned = relationship("Task", foreign_keys="Task.student_id", back_populates="student")
    tasks_created = relationship("Task", foreign_keys="Task.teacher_id", back_populates="teacher")
    
    # Родитель-Ученик
    children = relationship(
        "User", 
        secondary=parent_student,
        primaryjoin=(parent_student.c.parent_id == id),
        secondaryjoin=(parent_student.c.student_id == id),
        backref="parents"
    )
    
    # Учитель-Класс (Явное указание внешних ключей)
    # Позволяет определить "Какими классами владеет этот учитель?"
    classes_owned = relationship("ClassGroup", back_populates="teacher", foreign_keys="ClassGroup.teacher_id")
    
    # Ученик-Класс (Один ученик может быть только в одном классе)
    class_id = Column(Integer, ForeignKey('class_groups.id'), nullable=True)
    class_group = relationship("ClassGroup", back_populates="students", foreign_keys=[class_id])

    @property
    def tasks_completed(self):
        return len([t for t in self.tasks_assigned if t.status == TaskStatus.COMPLETED])

class ClassGroup(Base):
    __tablename__ = "class_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    teacher_id = Column(Integer, ForeignKey('users.id'))
    
    # Явные связи
    teacher = relationship("User", back_populates="classes_owned", foreign_keys=[teacher_id])
    students = relationship("User", back_populates="class_group", foreign_keys=[User.class_id])

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    reward_xp = Column(Integer, default=10)
    
    # Новые поля для интерактивных задач
    task_type = Column(String, default="text") # text, ordering, selection, input, fill_blanks
    task_data = Column(String, default="{}") # JSON строка для конфигурации игры
    
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    student_answer = Column(String, nullable=True) # Ответ ученика (для эссе и ручной проверки)
    attempts = Column(Integer, default=0) # Количество попыток решения
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student_id = Column(Integer, ForeignKey('users.id'))
    teacher_id = Column(Integer, ForeignKey('users.id'))
    
    student = relationship("User", foreign_keys=[student_id], back_populates="tasks_assigned")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="tasks_created")
