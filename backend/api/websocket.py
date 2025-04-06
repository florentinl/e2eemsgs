import logging

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from nats.aio.msg import Msg
from pydantic import BaseModel, Field

from api.messaging import STREAM_NAME, NATSMultiSubjectConsumer
from api.session import check_cookie
from backend.api.groups import (
    AddGroupUserMessage,
    CreateGroupMessage,
    GetUserGroupsMessage,
    GetUserMessage,
    handle_add_group_user,
    handle_create_group,
    handle_get_user,
    handle_get_user_groups,
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/ws")


class Message(BaseModel):
    msg: (
        GetUserGroupsMessage | CreateGroupMessage | GetUserMessage | AddGroupUserMessage
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
                msg = Message(msg=data)
                logger.info(f"Received message: {msg} from user {user_id}")

                response = dispatch_message(msg, user_id)
                await ws.send_json(response.model_dump_json())
            except ValueError as e:
                logger.error(f"Invalid message: {e}")
        except WebSocketDisconnect as e:
            logger.info("Client disconnected, code: %s, reason: %s", e.code, e.reason)
            break

    await consumer.cleanup()


def dispatch_message(msg: Message, user_id: int):
    match msg.msg:
        case CreateGroupMessage():
            return handle_create_group(msg.msg, user_id)
        case GetUserMessage():
            return handle_get_user(msg.msg)
        case AddGroupUserMessage():
            return handle_add_group_user(msg.msg, user_id)
        case GetUserGroupsMessage():
            return handle_get_user_groups(user_id)
        case _:
            # If pydantic works correctly, this should never happen
            raise ValueError(f"Unhandled message type: {msg.msg.type}")


async def message_handler(msg: Msg):
    # Here we handle messages received from nats:
    logger.info("%s received msg %s", msg.subject, str(msg.data))


async def setup_consumer(uid: int, ws: WebSocket) -> NATSMultiSubjectConsumer:
    # Get the followed groups from the database instead:
    groups = ["group1", "group2"]
    subjects = list(map(lambda g: f"{STREAM_NAME}.groups.{g}", groups))
    subjects.append(f"chat.users.{uid}")  # Personal subject for system messages

    consumer = NATSMultiSubjectConsumer()
    await consumer.init(subjects, ws, message_handler)

    return consumer
