# Polls Voting API

A FastAPI-based backend for a real-time polls voting application with WebSocket support.

## Features

- **User Authentication**: JWT-based authentication with password hashing
- **Poll Management**: Create, read, update polls with options
- **Voting System**: One vote per user per poll with real-time updates
- **WebSocket Support**: Live vote updates via WebSocket connections
- **Database**: PostgreSQL with SQLAlchemy 2.0 and Alembic migrations
- **API Documentation**: Auto-generated OpenAPI docs at `/docs`
- **Testing**: Comprehensive test suite with pytest

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy 2.0** - Python SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Tokens for authentication
- **WebSockets** - Real-time communication
- **pytest** - Testing framework

## Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Run with Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

### Manual Setup

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Setup Database**:
```bash
# Create PostgreSQL database
createdb polls

# Run migrations
alembic upgrade head
```

3. **Configure Environment**:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. **Run the Application**:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token
- `GET /auth/me` - Get current user info

### Polls
- `GET /polls/` - List all polls (with pagination and search)
- `POST /polls/` - Create a new poll (authenticated)
- `GET /polls/{id}` - Get poll details with results
- `POST /polls/{id}/vote` - Vote on a poll (authenticated)
- `GET /polls/{id}/results` - Get poll results
- `WS /polls/ws/{id}` - WebSocket connection for real-time updates

## Database Schema

### Users
- `id` (Primary Key)
- `email` (Unique)
- `name`
- `password_hash`
- `created_at`

### Polls
- `id` (Primary Key)
- `title`
- `description`
- `owner_id` (Foreign Key to Users)
- `created_at`

### Options
- `id` (Primary Key)
- `poll_id` (Foreign Key to Polls)
- `text`

### Votes
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `option_id` (Foreign Key to Options)
- `created_at`
- **Unique Constraint**: `(user_id, poll_id)` - One vote per user per poll

## WebSocket Messages

When a user votes, the following message is broadcast to all connected clients:

```json
{
  "option_id": 1,
  "votes_count": 5,
  "total_votes": 10,
  "poll_id": 1
}
```

## Testing

Run the test suite:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app
```

## Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Code Quality

The project uses:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_MIN` - Access token expiration in minutes
- `REFRESH_EXPIRES_DAYS` - Refresh token expiration in days
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## Security Features

- Password hashing with bcrypt
- JWT access tokens with short expiration
- CORS configuration
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM
- Rate limiting (can be added)

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## License

MIT License

