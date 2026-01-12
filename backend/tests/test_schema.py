import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base
from sqlalchemy import create_engine
from models import User, ClassGroup, Task

# In-memory DB
engine = create_engine("sqlite:///:memory:")

print("Creating tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
except Exception as e:
    print(f"FAILED to create tables: {e}")
    sys.exit(1)

from sqlalchemy.orm import sessionmaker
from models import UserRole

Session = sessionmaker(bind=engine)
session = Session()

try:
    print("Attempting to create User...")
    new_user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedsecret",
        role=UserRole.STUDENT,
        first_name="Test",
        last_name="User"
    )
    session.add(new_user)
    session.commit()
    print("User created successfully.")
    print(f"Tasks completed: {new_user.tasks_completed}")
    
    print("Attempting to query User...")
    db_user = session.query(User).filter(User.username == "testuser").first()
    print(f"User queried: {db_user.username}")
except Exception as e:
    print(f"FAILED to create User: {e}")
    import traceback
    traceback.print_exc()

