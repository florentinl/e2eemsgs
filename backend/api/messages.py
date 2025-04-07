import logging

from fastapi import APIRouter, Request
from models import Message, User, engine
from pydantic import BaseModel
from sqlmodel import Session, select

from api.messaging import STREAM_NAME, get_js
from api.websocket import MessageNotification

router = APIRouter(prefix="/messages")

logger = logging.getLogger("uvicorn")


class GroupMessageRequest(BaseModel):
    content: str
    nonce: str
    group_id: int


@router.post("/")
async def send_message(
    message_request: GroupMessageRequest, request: Request
) -> Message:
    js = await get_js()

    user_id: int = request.state.uid

    message = Message(
        content=message_request.content,
        nonce=message_request.nonce,
        group_id=message_request.group_id,
        sender_id=user_id,
    )

    # Persist message
    with Session(engine) as session:
        session.add(message)
        session.commit()
        session.refresh(message)

    # Get user name
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == user_id)).one()

    # Send message notification
    group_message = MessageNotification(message=message, sender_name=user.username)
    subject = f"{STREAM_NAME}.groups.{message.group_id}"
    await js.publish(
        subject=subject,
        payload=group_message.model_dump_json().encode(),
        stream=STREAM_NAME,
    )

    return message


@router.get("/")
async def get_group_messages(request: Request) -> list[MessageNotification]:
    user_id: int = request.state.uid

    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == user_id)).one()
        messages: list[MessageNotification] = []
        for group in user.groups:
            if group.group is not None:
                messages.extend(
                    map(
                        lambda m: MessageNotification(
                            message=m,
                            sender_name=m.sender.username,  # type: ignore
                        ),
                        group.group.messages,
                    )
                )
    return messages
