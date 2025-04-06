import json
import logging
from typing import Literal

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models import Group, Message
from nats.aio.msg import Msg
from pydantic import BaseModel, Field

from api.messaging import STREAM_NAME, NATSMultiSubjectConsumer
from api.session import check_cookie

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/ws")


class MessageNotification(BaseModel):
    type: Literal["messageNotification"] = Field(default="messageNotification")
    message: Message


class JoinGroupNotification(BaseModel):
    type: Literal["joinedGroupNotification"] = Field(default="joinedGroupNotification")
    group: Group


class NatsNotifications(BaseModel):
    msg: MessageNotification | JoinGroupNotification = Field(discriminator="type")


@router.websocket("/")
async def websocket_endpoint(ws: WebSocket):
    match check_cookie(ws):
        case int(user_id):
            pass
        case jwt.InvalidTokenError():
            await ws.accept()
            await ws.close(code=3000)
            return

    await ws.accept()
    consumer = await setup_consumer(user_id, ws)

    while True:
        try:
            _ = await ws.receive_json()
            logger.warning(
                "User %s sent unexpected data through the websocket", user_id
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
                    await consumer.add_subject(f"{STREAM_NAME}.groups.{group.name}")
                case MessageNotification():
                    pass

            await ws.send_json(json.dumps(wsmsg))
        except ValueError as e:
            logger.error("Invalid message: %s", str(e))
            return

    return message_handler


async def setup_consumer(uid: int, ws: WebSocket) -> NATSMultiSubjectConsumer:
    # Get the followed groups from the database instead:
    groups = ["group1", "group2"]
    subjects = list(map(lambda g: f"{STREAM_NAME}.groups.{g}", groups))
    subjects.append(f"chat.users.{uid}")  # Personal subject for system messages

    consumer = NATSMultiSubjectConsumer()
    await consumer.init(subjects, message_handler_builder(ws, consumer))

    return consumer
