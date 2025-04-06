import logging
from typing import Literal

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

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


class PingMessage(BaseModel):
    type: Literal["ping"]


class PongMessage(BaseModel):
    type: Literal["pong"]


class Message(BaseModel):
    msg: (
        PingMessage
        | PongMessage
        | GetUserGroupsMessage
        | CreateGroupMessage
        | GetUserMessage
        | AddGroupUserMessage
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


def dispatch_message(msg: Message, user_id: int):
    match msg.msg:
        case PingMessage():
            return handle_ping_message(msg.msg)
        case PongMessage():
            return handle_pong_message(msg.msg)
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


def handle_ping_message(msg: PingMessage):
    return PongMessage(type="pong")


def handle_pong_message(msg: PongMessage):
    return PingMessage(type="ping")
