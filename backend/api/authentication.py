from fastapi import APIRouter
from sqlmodel import Session

from models import User, engine

router = APIRouter()


@router.post("/auth/signup")
def signup(user: User) -> User:
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
