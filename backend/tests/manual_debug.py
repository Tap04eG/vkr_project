import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

SQL_URL = "sqlite:///:memory:"
engine = create_engine(SQL_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("--- START DEBUG ---")
try:
    response = client.post(
        "/register",
        json={
            "username": "debuguser",
            "password": "Password123",
            "role": "student",
            "email": "debug@example.com"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
    if response.status_code == 422:
        import json
        try:
            print("Validation Errors:")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print("Could not parse JSON")

except Exception as e:
    print(f"EXCEPTION: {e}")
    import traceback
    with open("backend/traceback.log", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
    traceback.print_exc()
print("--- END DEBUG ---")
