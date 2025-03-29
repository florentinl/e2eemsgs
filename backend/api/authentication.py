from random import choice
from string import ascii_letters, digits

from agepy import asym_encrypt
from fastapi import APIRouter, Response
from models import Challenge, User, engine
from pydantic import BaseModel
from sqlalchemy import exc
from sqlmodel import Session, select

router = APIRouter()


def generate_random_string(n: int) -> str:
    symbols = ascii_letters + digits
    return "".join(choice(symbols) for _ in range(n))

class ChallengeRequest(BaseModel):
    username: str


@router.post("/auth/signup")
def signup(user: User, response : Response) -> User:
    with Session(engine) as session:
        session.add(user)
        try :
            session.commit()
        except exc.IntegrityError:
            response.status_code = 409
            return user
        except:
            response.status_code = 500
            return user
        session.refresh(user)
        return user

@router.post("/auth/login_challenge")
def challenge(req: ChallengeRequest, response : Response) -> Challenge:
    with Session(engine) as session:
        # Getting user key
        try :
            user = session.exec(select(User).where(User.username == req.username)).one()
        except :
            response.status_code = 500
            return Challenge(username="",challenge="")
        
        # Generating challenge
        chall = Challenge(username=req.username,challenge=generate_random_string(32))
        session.add(chall)
        try:
            session.commit()
        except:
            response.status_code = 500
            return Challenge(username="",challenge=chall.challenge)
        session.refresh(chall)
        
        # Encrypt challenge with user's key
        chall.challenge = asym_encrypt(chall.challenge, user.public_key)
        return chall
    
@router.post("/auth/login_answer")
def answer(answer: Challenge, response : Response) -> Challenge:
    with Session(engine) as session:
        # Getting challenge
        try :
            chall = session.exec(select(Challenge).where(Challenge.id == answer.id)).one()
        except :
            response.status_code = 500
            return Challenge(id=0,username="",challenge="")
        
        # Comparing answers
        if answer.challenge == chall.challenge:
            return chall
        response.status_code = 403
        return chall