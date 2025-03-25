from typing import Literal
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger("uvicorn")

router = APIRouter()


class PingMessage(BaseModel):
    type: Literal["ping"]


class PongMessage(BaseModel):
    type: Literal["pong"]


class Message(BaseModel):
    msg: PingMessage | PongMessage = Field(discriminator="type")


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    while True:
        try:
            data = await ws.receive_json()
            try:
                msg = Message(msg=data)
                logger.info(f"Received message: {msg}")

                response = dispatch_message(msg)
                await ws.send_json(response.model_dump_json())
            except ValueError as e:
                logger.error(f"Invalid message: {e}")
        except WebSocketDisconnect as e:
            logger.info("Client disconnected, code: %s, reason: %s", e.code, e.reason)
            break


def dispatch_message(msg: Message):
    match msg.msg:
        case PingMessage():
            return handle_ping_message(msg.msg)
        case PongMessage():
            return handle_pong_message(msg.msg)
        case _:
            # If pydantic works correctly, this should never happen
            raise ValueError(f"Unhandled message type: {msg.msg.type}")


def handle_ping_message(msg: PingMessage):
    return PongMessage(type="pong")


def handle_pong_message(msg: PongMessage):
    return PingMessage(type="ping")
