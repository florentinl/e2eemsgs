from typing import List, Literal

from fastapi import HTTPException
from models import Group, GroupMember, User, engine
from pydantic import BaseModel
from sqlmodel import Session, select


class CreateGroupMessage(BaseModel):
    type: Literal["createGroup"]
    name: str
    symmetric_key: str


class GetUserMessage(BaseModel):
    type: Literal["getUser"]
    username: str


class AddGroupUserMessage(BaseModel):
    type: Literal["addGroupUser"]
    user_id: str
    symmetric_key: str
    group_id: int


class GetUserGroupsMessage(BaseModel):
    type: Literal["getUserGroupsMessage"]


class GetUserGroupsResponse(BaseModel):
    groups: List[Group]


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


def handle_get_user(get_user_request: GetUserMessage) -> User:
    with Session(engine) as session:
        # Getting new user's info
        user = session.exec(
            select(User).where(User.username == get_user_request.username)
        ).one()

        if not user or user.id is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user


def handle_add_group_user(
    group_request: AddGroupUserMessage, user_id: int
) -> GroupMember:
    with Session(engine) as session:
        # Getting the group's owner id
        group = session.exec(
            select(Group).where(Group.id == group_request.group_id)
        ).one()

        if group.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        # Generating the groupmember
        membership = GroupMember(
            user_id=user_id,
            group_id=group.id,
            symmetric_key=group_request.symmetric_key,
        )
        session.add(membership)
        session.commit()
        session.refresh(membership)

        return membership


def handle_get_user_groups(user_id: int) -> GetUserGroupsResponse:
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

        return GetUserGroupsResponse(groups=groups)
