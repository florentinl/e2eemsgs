from typing import Sequence

from fastapi import APIRouter, HTTPException, Request
from models import Group, User, engine
from pydantic import BaseModel
from sqlmodel import Session, col, select

from api.groups import is_member

router = APIRouter(prefix="/users")


class EditProfileRequest(BaseModel):
    description: str
    social_link: str


@router.get("/username")
def handle_get_user_by_username(username: str) -> User:
    with Session(engine) as session:
        # Getting new user's info
        user = session.exec(select(User).where(User.username == username)).one()

        if not user or user.id is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user


@router.get("/id")
def handle_get_user_by_id(uid: int) -> User:
    with Session(engine) as session:
        # Getting new user's info
        user = session.exec(select(User).where(User.id == uid)).one()

        if not user or user.id is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user


@router.post("/edit_profile")
def handle_edit_profile(req: Request, edit: EditProfileRequest) -> User:
    uid = req.state.uid
    with Session(engine) as session:
        # Getting user's info
        user = session.exec(select(User).where(User.id == uid)).one_or_none()

        if user is None:
            raise HTTPException(status_code=405, detail="User not found")

        user.description = edit.description
        user.social_link = edit.social_link

        session.commit()
        session.refresh(user)

        return user


@router.get("/all")
def get_all_users(req: Request, group_id: int) -> Sequence[User]:
    uid = req.state.uid
    if not is_member(uid, group_id):
        raise HTTPException(status_code=404, detail="Not found")
    with Session(engine) as session:
        group = session.exec(select(Group).where(Group.id == group_id)).one()
        users = map(lambda m: m.user_id, group.members)
        users = session.exec(select(User).where(col(User.id).not_in(users))).all()
        return users
