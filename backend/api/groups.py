from typing import List, Literal

from fastapi import APIRouter, HTTPException
from models import Group, GroupMember, User, engine
from pydantic import BaseModel
from sqlmodel import Session, select

groups_router = APIRouter(prefix="/groups")
users_router = APIRouter(prefix="/users")


class CreateGroupMessage(BaseModel):
    type: Literal["createGroup"]
    name: str
    symmetric_key: str


class GetUserMessage(BaseModel):
    type: Literal["getUser"]
    username: str


class GroupAddUserRequest(BaseModel):
    user_id: int
    symmetric_key: str
    group_id: int


class OwnGroupsResponse(BaseModel):
    groups: List[Group]


@groups_router.post("/create")
def handle_create_group(group_request: CreateGroupMessage, user_id: int) -> Group:
    with Session(engine) as session:
        # Generating the group
        group = Group(name=group_request.name, owner_id=user_id)
        session.add(group)
        session.commit()
        session.refresh(group)

        # Generating the groupmember
        membership = GroupMember(
            user_id=user_id,
            group_id=group.id,
            symmetric_key=group_request.symmetric_key,
        )
        session.add(membership)
        session.commit()
        session.refresh(membership)

        return group


@users_router.get("/")
def handle_get_user(username: str) -> User:
    with Session(engine) as session:
        # Getting new user's info
        user = session.exec(select(User).where(User.username == username)).one()

        if not user or user.id is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user


@groups_router.post("/add")
def handle_add_group_user(req: GroupAddUserRequest) -> GroupMember:
    with Session(engine) as session:
        # Getting the group's owner id
        group = session.exec(select(Group).where(Group.id == req.group_id)).one()

        if group.owner_id != req.user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        # Generating the groupmember
        membership = GroupMember(
            user_id=req.user_id,
            group_id=group.id,
            symmetric_key=req.symmetric_key,
        )
        session.add(membership)
        session.commit()
        session.refresh(membership)

        return membership


def handle_get_user_groups(user_id: int) -> OwnGroupsResponse:
    with Session(engine) as session:
        # Getting groups
        group_memberships = session.exec(
            select(GroupMember).where(GroupMember.user_id == user_id)
        ).all()

        group_ids = [m.group_id for m in group_memberships]

        # groups = session.exec(select(Group).where(Group.id in (group_ids))).all()
        groups: List[Group] = []
        for gid in group_ids:
            group = session.exec(select(Group).where(Group.id == gid)).one()
            groups.append(group)

        return OwnGroupsResponse(groups=groups)
