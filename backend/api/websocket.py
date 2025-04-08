import json
import logging
from typing import Literal

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from models import Group, Message, User, engine
from nats.aio.msg import Msg
from pydantic import BaseModel, Field

from api.messaging import STREAM_NAME, NATSMultiSubjectConsumer
from api.session import check_cookie

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/ws")


class MessageNotification(BaseModel):
    type: Literal["messageNotification"] = Field(default="messageNotification")
    message: Message
    sender_name: str


class JoinGroupNotification(BaseModel):
    type: Literal["joinedGroupNotification"] = Field(default="joinedGroupNotification")
    group: Group


class QuitGroupNotification(BaseModel):
    type: Literal["quitGroupNotification"] = Field(default="quitGroupNotification")
    group_id: int


class NatsNotifications(BaseModel):
    msg: MessageNotification | JoinGroupNotification | QuitGroupNotification = Field(
        discriminator="type"
    )


@router.websocket("/")
async def websocket_endpoint(ws: WebSocket):
    match check_cookie(ws):
        case User() as user:
            pass
        case jwt.InvalidTokenError():
            await ws.accept()
            await ws.close(code=3000)
            return

    await ws.accept()
    consumer = await setup_consumer(user.id, ws)

    while True:
        try:
            _ = await ws.receive_bytes()
            logger.warning(
                "User %s sent unexpected data through the websocket", user.id
            )
        except WebSocketDisconnect as e:
            logger.info("Client disconnected, code: %s, reason: %s", e.code, e.reason)
            break

    await consumer.cleanup()


def message_handler_builder(ws: WebSocket, consumer: NATSMultiSubjectConsumer):
    async def message_handler(msg: Msg):
        # Here we handle messages received from nats:
        try:
            wsmsg = NatsNotifications(msg=json.loads(msg.data))
            logger.info("%s received msg %s", msg.subject, str(msg.data))

            match wsmsg.msg:
                case JoinGroupNotification(group=group):
                    await consumer.add_subject(f"{STREAM_NAME}.groups.{group.id}")
                case QuitGroupNotification(group_id=group_id):
                    await consumer.remove_subject(f"{STREAM_NAME}.groups.{group_id}")
                case MessageNotification():
                    pass

            await ws.send_text(wsmsg.msg.model_dump_json())
        except ValueError as e:
            logger.error("Invalid message: %s", str(e))
            return

    return message_handler


async def setup_consumer(uid: int | None, ws: WebSocket) -> NATSMultiSubjectConsumer:
    # Get the followed groups from the database instead:
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == uid)).one()
        groups = user.groups

    subjects = list(map(lambda g: f"{STREAM_NAME}.groups.{g.group_id}", groups))
    subjects.append(f"chat.users.{user.id}")  # Personal subject for system messages

    consumer = NATSMultiSubjectConsumer()
    await consumer.init(subjects, message_handler_builder(ws, consumer))

    return consumer
