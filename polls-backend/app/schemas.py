from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Poll schemas
class OptionBase(BaseModel):
    text: str


class OptionCreate(OptionBase):
    pass


class OptionResponse(OptionBase):
    id: int
    votes_count: int = 0
    
    class Config:
        from_attributes = True


class PollBase(BaseModel):
    title: str
    description: str


class PollCreate(PollBase):
    options: List[str]


class PollResponse(PollBase):
    id: int
    owner_id: int
    created_at: datetime
    options: List[OptionResponse]
    total_votes: int = 0
    hasVoted: bool = False
    userVote: Optional[int] = None
    
    class Config:
        from_attributes = True


class PollListResponse(BaseModel):
    id: int
    title: str
    description: str
    owner_id: int
    created_at: datetime
    total_votes: int = 0
    options: List[OptionResponse] = []
    hasVoted: bool = False
    userVote: Optional[int] = None
    
    class Config:
        from_attributes = True


# Vote schemas
class VoteRequest(BaseModel):
    option_id: int


class VoteResponse(BaseModel):
    option_id: int
    votes_count: int
    total_votes: int


# Results schema
class PollResults(BaseModel):
    id: int
    title: str
    description: str
    owner_id: int
    created_at: datetime
    options: List[OptionResponse]
    total_votes: int
    hasVoted: bool = False
    userVote: Optional[int] = None


# WebSocket message schema
class PollUpdateMessage(BaseModel):
    option_id: int
    votes_count: int
    total_votes: int
    poll_id: int
