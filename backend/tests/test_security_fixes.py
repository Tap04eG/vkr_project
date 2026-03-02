import pytest
from models import User, Task, UserRole, TaskStatus

def get_auth_headers(client, username, password):
    response = client.post(
        "/token",
        data={"username": username, "password": password}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_server_side_attempts_tracking(client, db_session):
    # 1. Setup Data
    hashed_pw = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW" # "secret"
    teacher = User(username="teacher", hashed_password=hashed_pw, role=UserRole.TEACHER)
    student = User(username="student", hashed_password=hashed_pw, role=UserRole.STUDENT)
    db_session.add(teacher)
    db_session.add(student)
    db_session.commit()
    
    # Create task
    task = Task(
        title="Test Task",
        description="Desc",
        reward_xp=10,
        student_id=student.id,
        teacher_id=teacher.id,
        task_type="selection",
        task_data='{"correctItems": ["A"]}'
    )
    db_session.add(task)
    db_session.commit()
    
    headers = get_auth_headers(client, "student", "secret")
    
    # 2. First attempt (Wrong)
    # Note: we send attempt_count in checking data, but server should IGNORE it for penalty calc
    # but might use it or just ignore. The fix was to use server side count.
    resp = client.post(
        f"/tasks/{task.id}/check",
        json={"user_answer": [999], "attempt_count": 1},
        headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["correct"] is False
    
    db_session.refresh(task)
    assert task.attempts == 1
    
    # 3. Second attempt (Wrong)
    resp = client.post(
        f"/tasks/{task.id}/check",
        json={"user_answer": [999], "attempt_count": 1}, # Maliciously sending 1
        headers=headers
    )
    assert resp.status_code == 200
    
    db_session.refresh(task)
    assert task.attempts == 2
    
    # 4. Third attempt (Correct)
    # Penalty calculation: (attempts - 1) * 2
    # attempts before this correct check is 2.
    # Logic in code:
    # if correct:
    #   task.attempts += 1 (becomes 3)
    #   penalty = (3 - 1) * 2 = 4
    #   reward = 10 - 4 = 6
    
    # Wait, my logic in code was:
    # task.attempts += 1 (even if correct)
    # penalty = (task.attempts - 1) * 2
    
    resp = client.post(
        f"/tasks/{task.id}/check",
        json={"user_answer": [0], "attempt_count": 1},
        headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["correct"] is True
    assert resp.json()["earned_xp"] == 6 # 10 - 4
    
    db_session.refresh(task)
    assert task.attempts == 3
    assert task.status == TaskStatus.COMPLETED

def test_prevent_bypass_via_complete_endpoint(client, db_session):
    # Setup
    hashed_pw = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    teacher = User(username="teacher2", hashed_password=hashed_pw, role=UserRole.TEACHER)
    student = User(username="student2", hashed_password=hashed_pw, role=UserRole.STUDENT)
    db_session.add(teacher)
    db_session.add(student)
    db_session.commit()
    
    headers = get_auth_headers(client, "student2", "secret")
    
    # Case 1: Interactive task (cannot complete manually)
    interactive_task = Task(
        title="Interactive", student_id=student.id, teacher_id=teacher.id,
        task_type="selection", reward_xp=10
    )
    db_session.add(interactive_task)
    
    # Case 2: Manual task (can complete manually)
    manual_task = Task(
        title="Manual", student_id=student.id, teacher_id=teacher.id,
        task_type="manual", reward_xp=10
    )
    db_session.add(manual_task)
    db_session.commit()
    db_session.refresh(manual_task) # Ensure ID and state are loaded
    print(f"DEBUG: Manual Task ID: {manual_task.id}")
    
    # Try to complete interactive task
    resp = client.post(f"/tasks/{interactive_task.id}/complete", headers=headers)
    assert resp.status_code == 400
    assert "автоматической проверки" in resp.json()["detail"]
    
    # Try to complete manual task
    resp = client.post(f"/tasks/{manual_task.id}/complete", headers=headers)
    if resp.status_code != 200:
        print(f"DEBUG: Response: {resp.status_code}, Body: {resp.json()}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Task completed"
