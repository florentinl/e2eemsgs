import logging
from random import choice
from string import ascii_letters, digits

from agepy import asym_encrypt
from fastapi import APIRouter, HTTPException, Response
from models import Challenge, User, engine
from pydantic import BaseModel, Field
from sqlalchemy import exc
from sqlmodel import Session, select

from api.session import get_jwt

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/auth")


def generate_random_string(n: int) -> str:
    symbols = ascii_letters + digits
    return "".join(choice(symbols) for _ in range(n))


class ChallengeRequest(BaseModel):
    username: str


class ExceptionModel(BaseModel):
    detail: str = Field()


class AuthFailed(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=403, detail="Authentication Error, wrong challenge"
        )


class UserAlreadyExists(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409, detail="A User with the same name already exists"
        )


@router.post("/signup", responses={409: {"model": ExceptionModel}})
def signup(user: User, response: Response) -> User:
    with Session(engine) as session:
        session.add(user)
        try:
            session.commit()
        except exc.IntegrityError:
            raise UserAlreadyExists()
        session.refresh(user)
        return user


@router.post("/login_challenge")
def challenge(req: ChallengeRequest, response: Response) -> Challenge:
    with Session(engine) as session:
        # Getting user key
        user = session.exec(
            select(User).where(User.username == req.username)
        ).one_or_none()
        if user is None:
            fake_public_key = (
                "age1xaucv4dlgv5pvd6qngycg9xzh0q4606ezef0pk8xy50wkjteu3wqk6hek7"
            )
            fake_challenge = Challenge(
                username=req.username,
                challenge=asym_encrypt(generate_random_string(32), fake_public_key),
            )
            return fake_challenge

        # Generating challenge
        chall = Challenge(username=req.username, challenge=generate_random_string(32))
        session.add(chall)
        session.commit()
        session.refresh(chall)

        # Encrypt challenge with user's key
        chall.challenge = asym_encrypt(chall.challenge, user.public_key)
        return chall


@router.post("/login_answer", responses={403: {"model": ExceptionModel}})
def answer(answer: Challenge, response: Response) -> User:
    with Session(engine) as session:
        # Getting challenge
        chall = session.exec(select(Challenge).where(Challenge.id == answer.id)).one()

        # Comparing answers
        if answer.challenge == chall.challenge:
            # Get user from database
            user = session.exec(
                select(User).where(User.username == chall.username)
            ).one()
            if user.id is not None:
                jwt = get_jwt(user.id)
                response.set_cookie(
                    key="access_token", value=jwt, httponly=True
                )  # set HttpOnly cookie in response
                return user
        raise AuthFailed()
