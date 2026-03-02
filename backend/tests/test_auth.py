import pytest
from models import UserRole

def test_register_user_success(client):
    response = client.post(
        "/register",
        json={
            "username": "testuser",
            "password": "Password1",
            "role": "student",
            "email": "test@example.com"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_register_user_duplicate_username(client):
    # First registration
    client.post(
        "/register",
        json={
            "username": "duplicate_user",
            "password": "Password1",
            "role": "student"
        }
    )
    # Second registration with same username
    response = client.post(
        "/register",
        json={
            "username": "duplicate_user",
            "password": "Password2",
            "role": "teacher" # Role doesn't matter for duplicate check
        }
    )
    assert response.status_code == 400
    assert "существует" in response.json()["detail"]

def test_login_success(client):
    # Register first
    client.post(
        "/register",
        json={
            "username": "login_user",
            "password": "Password1",
            "role": "student"
        }
    )
    # Login
    response = client.post(
        "/token",
        data={
            "username": "login_user",
            "password": "Password1"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client):
    # Register first
    client.post(
        "/register",
        json={
            "username": "wrong_pass_user",
            "password": "Password1",
            "role": "student"
        }
    )
    # Login with wrong password
    response = client.post(
        "/token",
        data={
            "username": "wrong_pass_user",
            "password": "WrongPassword1"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
