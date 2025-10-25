import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db import get_db, Base
from app.models import User, Poll, Option
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

@pytest.fixture
def auth_headers(setup_database):
    # Register and login user
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
    return {"Authorization": f"Bearer {token}"}

def test_create_poll(auth_headers):
    response = client.post("/polls/", json={
        "title": "Test Poll",
        "description": "This is a test poll",
        "options": ["Option 1", "Option 2", "Option 3"]
    }, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Poll"
    assert data["description"] == "This is a test poll"
    assert len(data["options"]) == 3
    assert data["total_votes"] == 0

def test_get_polls():
    response = client.get("/polls/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_poll_by_id(auth_headers):
    # Create a poll first
    create_response = client.post("/polls/", json={
        "title": "Test Poll",
        "description": "This is a test poll",
        "options": ["Option 1", "Option 2"]
    }, headers=auth_headers)
    
    poll_id = create_response.json()["id"]
    
    # Get the poll
    response = client.get(f"/polls/{poll_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Poll"
    assert len(data["options"]) == 2

def test_vote_on_poll(auth_headers):
    # Create a poll first
    create_response = client.post("/polls/", json={
        "title": "Test Poll",
        "description": "This is a test poll",
        "options": ["Option 1", "Option 2"]
    }, headers=auth_headers)
    
    poll_id = create_response.json()["id"]
    option_id = create_response.json()["options"][0]["id"]
    
    # Vote on the poll
    response = client.post(f"/polls/{poll_id}/vote", json={
        "option_id": option_id
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["votes_count"] == 1
    assert data["total_votes"] == 1

def test_get_poll_results(auth_headers):
    # Create a poll first
    create_response = client.post("/polls/", json={
        "title": "Test Poll",
        "description": "This is a test poll",
        "options": ["Option 1", "Option 2"]
    }, headers=auth_headers)
    
    poll_id = create_response.json()["id"]
    
    # Get results
    response = client.get(f"/polls/{poll_id}/results")
    assert response.status_code == 200
    data = response.json()
    assert "options" in data
    assert "total_votes" in data
    assert len(data["options"]) == 2

