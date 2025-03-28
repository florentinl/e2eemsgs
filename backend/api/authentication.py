from random import choice
from string import ascii_letters, digits

from fastapi import APIRouter
from models import User, engine
from sqlmodel import Session

router = APIRouter()


def generate_random_string(n: int) -> str:
    symbols = ascii_letters + digits
    return "".join(choice(symbols) for _ in range(n))


@router.post("/auth/signup")
def signup(user: User) -> User:
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
