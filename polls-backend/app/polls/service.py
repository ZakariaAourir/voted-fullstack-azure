from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.models import Poll, Option, Vote, User
from app.schemas import PollCreate, PollResponse, PollListResponse, VoteRequest, VoteResponse, PollResults, OptionResponse
from fastapi import HTTPException, status
from typing import List, Optional


class PollsService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_poll(self, poll_data: PollCreate, owner_id: int) -> Poll:
        # Create poll
        poll = Poll(
            title=poll_data.title,
            description=poll_data.description,
            owner_id=owner_id
        )
        self.db.add(poll)
        self.db.flush()  # Get the poll ID
        
        # Create options
        for option_text in poll_data.options:
            option = Option(
                poll_id=poll.id,
                text=option_text
            )
            self.db.add(option)
        
        self.db.commit()
        self.db.refresh(poll)
        return poll
    
    def get_polls(self, skip: int = 0, limit: int = 10, search: Optional[str] = None, user_id: Optional[int] = None) -> List[PollListResponse]:
        query = select(Poll)
        
        if search:
            query = query.where(
                Poll.title.ilike(f"%{search}%") | 
                Poll.description.ilike(f"%{search}%")
            )
        
        polls = self.db.execute(
            query.offset(skip).limit(limit)
        ).scalars().all()
        
        result = []
        for poll in polls:
            # Get options with vote counts
            stmt = (
                select(
                    Option.id,
                    Option.text,
                    func.count(Vote.id).label("votes_count"),
                )
                .outerjoin(Vote, Vote.option_id == Option.id)
                .where(Option.poll_id == poll.id)
                .group_by(Option.id, Option.text)
                .order_by(Option.id)
            )
            
            options_data = self.db.execute(stmt).all()
            total_votes = sum(item.votes_count for item in options_data)
            
            options_response = [
                OptionResponse(id=item.id, text=item.text, votes_count=item.votes_count)
                for item in options_data
            ]
            
            # Check if user has voted
            user_vote = None
            has_voted = False
            if user_id:
                user_vote_result = self.db.execute(
                    select(Vote.option_id)
                    .join(Option, Vote.option_id == Option.id)
                    .where(and_(Vote.user_id == user_id, Option.poll_id == poll.id))
                ).scalar_one_or_none()
                
                if user_vote_result:
                    user_vote = user_vote_result
                    has_voted = True
            
            result.append(PollListResponse(
                id=poll.id,
                title=poll.title,
                description=poll.description,
                owner_id=poll.owner_id,
                created_at=poll.created_at,
                total_votes=total_votes,
                options=options_response,
                hasVoted=has_voted,
                userVote=user_vote
            ))
        
        return result
    
    def get_user_polls(self, owner_id: int, skip: int = 0, limit: int = 10, search: Optional[str] = None, user_id: Optional[int] = None) -> List[PollListResponse]:
        query = select(Poll).where(Poll.owner_id == owner_id)
        
        if search:
            query = query.where(
                Poll.title.ilike(f"%{search}%") | 
                Poll.description.ilike(f"%{search}%")
            )
        
        polls = self.db.execute(
            query.offset(skip).limit(limit)
        ).scalars().all()
        
        result = []
        for poll in polls:
            # Get options with vote counts
            stmt = (
                select(
                    Option.id,
                    Option.text,
                    func.count(Vote.id).label("votes_count"),
                )
                .outerjoin(Vote, Vote.option_id == Option.id)
                .where(Option.poll_id == poll.id)
                .group_by(Option.id, Option.text)
                .order_by(Option.id)
            )
            
            options_data = self.db.execute(stmt).all()
            total_votes = sum(item.votes_count for item in options_data)
            
            options_response = [
                OptionResponse(id=item.id, text=item.text, votes_count=item.votes_count)
                for item in options_data
            ]
            
            # Check if user has voted
            user_vote = None
            has_voted = False
            if user_id:
                user_vote_result = self.db.execute(
                    select(Vote.option_id)
                    .join(Option, Vote.option_id == Option.id)
                    .where(and_(Vote.user_id == user_id, Option.poll_id == poll.id))
                ).scalar_one_or_none()
                
                if user_vote_result:
                    user_vote = user_vote_result
                    has_voted = True
            
            result.append(PollListResponse(
                id=poll.id,
                title=poll.title,
                description=poll.description,
                owner_id=poll.owner_id,
                created_at=poll.created_at,
                total_votes=total_votes,
                options=options_response,
                hasVoted=has_voted,
                userVote=user_vote
            ))
        
        return result
    
    def get_poll_by_id(self, poll_id: int) -> Poll:
        poll = self.db.execute(
            select(Poll).where(Poll.id == poll_id)
        ).scalar_one_or_none()
        
        if not poll:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Poll not found"
            )
        
        return poll
    
    def get_poll_with_results(self, poll_id: int, user_id: Optional[int] = None) -> PollResponse:
        poll = self.get_poll_by_id(poll_id)
        
        # Get options with vote counts
        options_with_votes = self.db.execute(
            select(Option, func.count(Vote.id).label('votes_count'))
            .outerjoin(Vote, Option.id == Vote.option_id)
            .where(Option.poll_id == poll_id)
            .group_by(Option.id)
        ).all()
        
        options = []
        total_votes = 0
        
        for option, votes_count in options_with_votes:
            options.append(OptionResponse(
                id=option.id,
                text=option.text,
                votes_count=votes_count
            ))
            total_votes += votes_count
        
        # Check if user has voted
        user_vote = None
        has_voted = False
        if user_id:
            user_vote_result = self.db.execute(
                select(Vote.option_id)
                .join(Option, Vote.option_id == Option.id)
                .where(and_(Vote.user_id == user_id, Option.poll_id == poll_id))
            ).scalar_one_or_none()
            
            if user_vote_result:
                user_vote = user_vote_result
                has_voted = True
        
        return PollResponse(
            id=poll.id,
            title=poll.title,
            description=poll.description,
            owner_id=poll.owner_id,
            created_at=poll.created_at,
            options=options,
            total_votes=total_votes,
            hasVoted=has_voted,
            userVote=user_vote
        )
    
    def vote_on_poll(self, poll_id: int, option_id: int, user_id: int) -> VoteResponse:
        # Verify poll exists
        poll = self.get_poll_by_id(poll_id)
        
        # Verify option belongs to this poll
        option = self.db.execute(
            select(Option).where(
                and_(Option.id == option_id, Option.poll_id == poll_id)
            )
        ).scalar_one_or_none()
        
        if not option:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid option for this poll"
            )
        
        # Check if user already voted on this poll
        existing_vote = self.db.execute(
            select(Vote)
            .join(Option, Vote.option_id == Option.id)
            .where(
                and_(
                    Vote.user_id == user_id,
                    Option.poll_id == poll_id
                )
            )
        ).scalar_one_or_none()
        
        if existing_vote:
            # Update existing vote
            existing_vote.option_id = option_id
        else:
            # Create new vote
            vote = Vote(
                user_id=user_id,
                option_id=option_id
            )
            self.db.add(vote)
        
        self.db.commit()
        
        # Get updated vote counts
        votes_count = self.db.execute(
            select(func.count(Vote.id))
            .where(Vote.option_id == option_id)
        ).scalar() or 0
        
        total_votes = self.db.execute(
            select(func.count(Vote.id))
            .join(Option, Vote.option_id == Option.id)
            .where(Option.poll_id == poll_id)
        ).scalar() or 0
        
        return VoteResponse(
            option_id=option_id,
            votes_count=votes_count,
            total_votes=total_votes
        )
    
    def get_poll_results(self, poll_id: int, user_id: Optional[int] = None) -> PollResults:
        # Verify poll exists
        poll = self.get_poll_by_id(poll_id)
        
        # Get options with vote counts
        options_with_votes = self.db.execute(
            select(Option, func.count(Vote.id).label('votes_count'))
            .outerjoin(Vote, Option.id == Vote.option_id)
            .where(Option.poll_id == poll_id)
            .group_by(Option.id)
        ).all()
        
        options = []
        total_votes = 0
        
        for option, votes_count in options_with_votes:
            options.append(OptionResponse(
                id=option.id,
                text=option.text,
                votes_count=votes_count
            ))
            total_votes += votes_count
        
        # Check if user has voted
        user_vote = None
        has_voted = False
        if user_id:
            user_vote_result = self.db.execute(
                select(Vote.option_id)
                .join(Option, Vote.option_id == Option.id)
                .where(and_(Vote.user_id == user_id, Option.poll_id == poll_id))
            ).scalar_one_or_none()
            
            if user_vote_result:
                user_vote = user_vote_result
                has_voted = True
        
        return PollResults(
            id=poll.id,
            title=poll.title,
            description=poll.description,
            owner_id=poll.owner_id,
            created_at=poll.created_at,
            options=options,
            total_votes=total_votes,
            hasVoted=has_voted,
            userVote=user_vote
        )
