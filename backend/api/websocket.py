import json
import logging
from typing import Literal

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models import Group, Message, engine
from nats.aio.msg import Msg
from pydantic import BaseModel, Field
from sqlmodel import Session

from api.groups import is_member
from api.messaging import STREAM_NAME, NATSMultiSubjectConsumer, get_js
from api.session import check_cookie

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/ws")


class GroupMessageMessage(BaseModel):
    type: Literal["groupMessage"] = Field(default="groupMessage")
    content: str
    nonce: str
    group_id: int


class MessageNotification(BaseModel):
    type: Literal["messageNotification"] = Field(default="messageNotification")
    message: Message


class MessageAcknowledgementNotfication(BaseModel):
    type: Literal["messageAcknowledgementNotification"] = Field(
        default="messageAcknowledgementNotification"
    )
    message: Message


class JoinGroupNotification(BaseModel):
    type: Literal["joinedGroupNotification"] = Field(default="joinedGroupNotification")
    group: Group


class WsMessage(BaseModel):
    msg: GroupMessageMessage = Field(discriminator="type")


class NatsNotifications(BaseModel):
    msg: (
        MessageNotification | JoinGroupNotification | MessageAcknowledgementNotfication
    ) = Field(discriminator="type")


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

                await dispatch_message(msg, user_id, ws)
            except ValueError as e:
                logger.error(f"Invalid message: {e}")
        except WebSocketDisconnect as e:
            logger.info("Client disconnected, code: %s, reason: %s", e.code, e.reason)
            break

    await consumer.cleanup()


async def dispatch_message(msg: WsMessage, user_id: int, ws: WebSocket):
    js = await get_js()

    # Here we handle message received on the websocket:
    match msg.msg:
        case GroupMessageMessage(
            type=_, content=content, nonce=nonce, group_id=group_id
        ):
            # Assert user is member of group
            if not is_member(user_id, group_id):
                logger.warning(
                    f"{user_id} is trying to send messages outside of his groups"
                )

            message = Message(
                content=content, nonce=nonce, group_id=group_id, sender_id=user_id
            )

            # Persist message
            with Session(engine) as session:
                session.add(message)
                session.commit()
                session.refresh(message)

            # Send acknowledgement to user
            acknowledgement = MessageAcknowledgementNotfication(message=message)
            await ws.send_json(acknowledgement.model_dump_json())

            # Send message to group
            group_message = MessageNotification(message=message)
            await js.publish(
                subject=f"{STREAM_NAME}.groups.{message.group_id}",
                payload=group_message.model_dump_json().encode(),
                stream=STREAM_NAME,
            )


def message_handler_builder(ws: WebSocket):
    async def message_handler(msg: Msg):
        # Here we handle messages received from nats:
        try:
            wsmsg = NatsNotifications(msg=json.loads(msg.data))
            logger.info("%s received msg %s", msg.subject, str(msg.data))

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
    await consumer.init(subjects, message_handler_builder(ws))

    return consumer
