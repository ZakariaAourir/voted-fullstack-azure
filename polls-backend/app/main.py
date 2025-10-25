from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.auth.routes import router as auth_router
from app.polls.routes import router as polls_router

app = FastAPI(
    title="Polls Voting API",
    description="A real-time polls voting application API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(polls_router)


@app.get("/")
def read_root():
    return {"message": "Polls Voting API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

