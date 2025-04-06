import logging

from fastapi import APIRouter, HTTPException, Request
from models import Message, engine
from pydantic import BaseModel
from sqlmodel import Session

from api.groups import is_member
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

    if not is_member(user_id, message_request.group_id):
        logger.warning(f"{user_id} is trying to send messages outside of his groups")
        raise HTTPException(
            status_code=403, detail="Sent message to a group, you do not belong to"
        )

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

    # Send message notification
    group_message = MessageNotification(message=message)
    await js.publish(
        subject=f"{STREAM_NAME}.groups.{message.group_id}",
        payload=group_message.model_dump_json().encode(),
        stream=STREAM_NAME,
    )

    return message
