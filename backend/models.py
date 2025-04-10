from typing import List, Optional

from config import DATABASE_URL
from sqlmodel import Field, Relationship, SQLModel, create_engine

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {},
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=8, unique=True)
    public_key: str = Field(min_length=1)
    description: str | None = Field(default="Hello ! I'm using E2EEMSGS !")
    social_link: str | None = Field(default=None)
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


class File(SQLModel, table=True):
    message_id: int = Field(foreign_key="message.id", primary_key=True)
    path: str
    size: int
    pretty_name: str
    nonce: str
    # Here as a list because otherwise it wouldn't let me run
    messages: List["Message"] = Relationship(back_populates="attachment")


class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str
    has_attachment: bool
    nonce: str
    sender_id: int = Field(foreign_key="user.id")
    group_id: int = Field(foreign_key="group.id")
    sender: Optional[User] = Relationship()
    group: Optional[Group] = Relationship(back_populates="messages")
    # Here for convenience, not strictly needed
    attachment: Optional[File] = Relationship(back_populates="messages")
