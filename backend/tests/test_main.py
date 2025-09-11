import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

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

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

def test_health_check(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "NIL Moneyball API is running"}

def test_register_user(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "role": "user"
    }
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
    assert response.json()["email"] == "test@example.com"

def test_login_user(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com", 
        "password": "testpass123",
        "full_name": "Test User",
        "role": "user"
    }
    client.post("/auth/register", json=user_data)
    
    login_data = {"username": "testuser", "password": "testpass123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_protected_endpoint(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123", 
        "full_name": "Test User",
        "role": "user"
    }
    client.post("/auth/register", json=user_data)
    
    login_response = client.post("/auth/login", json={"username": "testuser", "password": "testpass123"})
    token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/athletes", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
