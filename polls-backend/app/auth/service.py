from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import User
from app.schemas import UserCreate, LoginRequest
from app.auth.hashing import verify_password, get_password_hash
from app.auth.jwt import create_access_token
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserCreate) -> User:
        # Check if user already exists
        existing_user = self.db.execute(
            select(User).where(User.email == user_data.email)
        ).scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hashed_password
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def authenticate_user(self, login_data: LoginRequest) -> User:
        user = self.db.execute(
            select(User).where(User.email == login_data.email)
        ).scalar_one_or_none()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        return user
    
    def get_user_by_id(self, user_id: int) -> User:
        user = self.db.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user

