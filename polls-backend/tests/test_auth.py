import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db import get_db, Base
from app.models import User
from app.auth.hashing import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_register_user(setup_database):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data

def test_register_duplicate_email(setup_database):
    # First registration
    client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    })
    
    # Second registration with same email
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Another User",
        "password": "anotherpassword123"
    })
    assert response.status_code == 400

def test_login_success(setup_database):
    # Register user first
    client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    })
    
    # Login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(setup_database):
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_current_user(setup_database):
    # Register and login
    client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    })
    
    login_response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123"
    })
    
    token = login_response.json()["access_token"]
    
    # Get current user
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"

