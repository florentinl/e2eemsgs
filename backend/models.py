from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel, create_engine

DATABASE_URL = "sqlite:///./database"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=8, unique=True)
    public_key: str = Field(min_length=1)
    groups: List["GroupMember"] = Relationship(back_populates="user")


class Challenge(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=8)
    challenge: str = Field()


class Group(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1)
    owner_id: int = Field(foreign_key="user.id")
    members: List["GroupMember"] = Relationship(back_populates="group")
    messages: List["Message"] = Relationship(back_populates="group")


class GroupMember(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    group_id: int = Field(foreign_key="group.id", primary_key=True)
    symmetric_key: str
    user: Optional[User] = Relationship(back_populates="groups")
    group: Optional[Group] = Relationship(back_populates="members")


class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    content: str
    sender_id: int = Field(foreign_key="user.id")
    group_id: int = Field(foreign_key="group.id")
    sender: Optional[User] = Relationship()
    group: Optional[Group] = Relationship(back_populates="messages")
