"""Test registration directly"""
import sys
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from app.db import SessionLocal, Base, engine
from app.models import User
from app.auth.hashing import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

# Create a test user
db = SessionLocal()

try:
    # Check if user exists
    existing = db.query(User).filter(User.email == "test@example.com").first()
    if existing:
        print(f"User already exists: {existing.email}")
    else:
        # Create new user
        hashed_password = get_password_hash("testpass123")
        print(f"Hashed password: {hashed_password}")
        
        user = User(
            email="test@example.com",
            name="Test User",
            password_hash=hashed_password
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ User created successfully!")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   Created: {user.created_at}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()


