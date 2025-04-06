import json
import logging
from typing import Literal

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from nats.aio.msg import Msg
from pydantic import BaseModel, Field

from api.messaging import STREAM_NAME, NATSMultiSubjectConsumer
from api.session import check_cookie
from models import Group, Message

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/ws")


class GroupMessageMessage(BaseModel):
    type: Literal["groupMessage"] = Field(default="groupMessage")
    message: Message


class GroupMessageAcknowledgement(BaseModel):
    type: Literal["groupMessageAcknowledgement"] = Field(
        default="groupMessageAcknowledgement"
    )
    message: Message


class JoinedGroupMessage(BaseModel):
    type: Literal["joinedGroup"] = Field(default="joinedGroup")
    group: Group


class WsMessage(BaseModel):
    msg: GroupMessageMessage | JoinedGroupMessage | GroupMessageAcknowledgement = Field(
        discriminator="type"
    )


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
            data = await ws.receive_json()
            try:
                msg = WsMessage(msg=data)
                logger.info(f"Received message: {msg} from user {user_id}")

                dispatch_message(msg, user_id)
            except ValueError as e:
                logger.error(f"Invalid message: {e}")
        except WebSocketDisconnect as e:
            logger.info("Client disconnected, code: %s, reason: %s", e.code, e.reason)
            break

    await consumer.cleanup()


def dispatch_message(msg: WsMessage, user_id: int):
    # Here we handle message received on the websocket:
    match msg.msg:
        case GroupMessageMessage():
            pass
        case GroupMessageAcknowledgement():
            pass
        case JoinedGroupMessage():
            pass


def message_handler_builder(ws: WebSocket):
    async def message_handler(msg: Msg):
        # Here we handle messages received from nats:
        try:
            wsmsg = WsMessage(msg=json.loads(msg.data))
            logger.info("%s received msg %s", msg.subject, str(msg.data))
        except ValueError as e:
            logger.error("Invalid message: %s", str(e))
            return

        match wsmsg.msg:
            case GroupMessageMessage():
                pass
            case GroupMessageAcknowledgement():
                pass
            case JoinedGroupMessage():
                pass

    return message_handler


async def setup_consumer(uid: int, ws: WebSocket) -> NATSMultiSubjectConsumer:
    # Get the followed groups from the database instead:
    groups = ["group1", "group2"]
    subjects = list(map(lambda g: f"{STREAM_NAME}.groups.{g}", groups))
    subjects.append(f"chat.users.{uid}")  # Personal subject for system messages

    consumer = NATSMultiSubjectConsumer()
    await consumer.init(subjects, message_handler_builder(ws))

    return consumer
