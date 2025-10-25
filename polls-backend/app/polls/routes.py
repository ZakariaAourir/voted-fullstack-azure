from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import PollCreate, PollResponse, PollListResponse, VoteRequest, VoteResponse, PollResults, PollUpdateMessage
from app.polls.service import PollsService
from app.polls.ws import manager
from app.deps import get_current_user, get_current_user_optional
from app.schemas import UserResponse
from typing import Optional

router = APIRouter(prefix="/polls", tags=["polls"])


@router.get("/", response_model=list[PollListResponse])
def get_polls(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    polls_service = PollsService(db)
    user_id = current_user.id if current_user else None
    return polls_service.get_polls(skip=skip, limit=limit, search=search, user_id=user_id)


@router.get("/me", response_model=list[PollListResponse])
def get_my_polls(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    polls_service = PollsService(db)
    return polls_service.get_user_polls(owner_id=current_user.id, skip=skip, limit=limit, search=search, user_id=current_user.id)


@router.post("/", response_model=PollResults, status_code=status.HTTP_201_CREATED)
def create_poll(
    poll_data: PollCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    polls_service = PollsService(db)
    poll = polls_service.create_poll(poll_data, current_user.id)
    return polls_service.get_poll_with_results(poll.id, current_user.id)


@router.get("/{poll_id}", response_model=PollResults)
def get_poll(
    poll_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    polls_service = PollsService(db)
    user_id = current_user.id if current_user else None
    return polls_service.get_poll_with_results(poll_id, user_id)


@router.post("/{poll_id}/vote", response_model=VoteResponse)
async def vote_on_poll(
    poll_id: int,
    vote_data: VoteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    polls_service = PollsService(db)
    result = polls_service.vote_on_poll(poll_id, vote_data.option_id, current_user.id)
    
    # Broadcast update via WebSocket
    update_message = PollUpdateMessage(
        option_id=vote_data.option_id,
        votes_count=result.votes_count,
        total_votes=result.total_votes,
        poll_id=poll_id
    )
    await manager.broadcast_to_poll(poll_id, update_message)
    
    return result


@router.websocket("/ws/{poll_id}")
async def websocket_endpoint(websocket: WebSocket, poll_id: int):
    await manager.connect(websocket, poll_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back or handle any client messages if needed
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)


@router.get("/{poll_id}/results", response_model=PollResults)
def get_poll_results(
    poll_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    polls_service = PollsService(db)
    user_id = current_user.id if current_user else None
    return polls_service.get_poll_results(poll_id, user_id)
