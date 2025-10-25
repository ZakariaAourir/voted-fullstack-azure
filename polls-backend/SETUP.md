# Polls Backend Setup Guide

## 🚀 Quick Start with Docker (Recommended)

1. **Navigate to the backend directory**:
   ```bash
   cd polls-backend
   ```

2. **Start the services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the API**:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 🔧 Manual Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 12+
- pip

### Installation Steps

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup PostgreSQL database**:
   ```sql
   CREATE DATABASE polls;
   CREATE USER polls_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE polls TO polls_user;
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

4. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start the server**:
   ```bash
   python run.py
   # OR
   uvicorn app.main:app --reload
   ```

## 🧪 Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user (requires auth)

### Polls
- `GET /polls/` - List polls (with pagination & search)
- `POST /polls/` - Create poll (requires auth)
- `GET /polls/{id}` - Get poll details
- `POST /polls/{id}/vote` - Vote on poll (requires auth)
- `GET /polls/{id}/results` - Get poll results
- `WS /polls/ws/{id}` - WebSocket for real-time updates

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT access tokens (15min default)
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ SQL injection protection
- ✅ One vote per user per poll constraint

## 🗄️ Database Schema

```
Users (id, email, name, password_hash, created_at)
  ↓
Polls (id, title, description, owner_id, created_at)
  ↓
Options (id, poll_id, text)
  ↓
Votes (id, user_id, option_id, created_at)
```

## 🌐 WebSocket Messages

When a user votes, all connected clients receive:
```json
{
  "option_id": 1,
  "votes_count": 5,
  "total_votes": 10,
  "poll_id": 1
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_MIN` | Access token expiration (minutes) | 15 |
| `REFRESH_EXPIRES_DAYS` | Refresh token expiration (days) | 7 |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,localhost:5173 |

## 🐳 Docker Services

- **API**: FastAPI application on port 8000
- **Database**: PostgreSQL on port 5432
- **Automatic migrations**: Runs on startup

## 📝 Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black .

# Sort imports
isort .

# Lint
flake8 .

# Type check
mypy .
```

## 🚀 Production Deployment

1. **Update environment variables** for production
2. **Use a production ASGI server** like Gunicorn with Uvicorn workers
3. **Setup reverse proxy** (Nginx) for SSL termination
4. **Configure database connection pooling**
5. **Enable rate limiting** for production use
6. **Setup monitoring and logging**

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔗 Frontend Integration

The backend is designed to work with the React frontend:
- CORS configured for `http://localhost:3000` and `http://localhost:5173`
- WebSocket endpoint: `ws://localhost:8000/polls/ws/{poll_id}`
- JWT authentication compatible with frontend auth store

