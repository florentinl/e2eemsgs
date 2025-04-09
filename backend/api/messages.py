import logging
import uuid
from typing import Annotated

import fastapi
from fastapi import APIRouter, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from models import File, GroupMember, Message, User, engine
from pydantic import BaseModel
from sqlmodel import Session, select

from api.messaging import STREAM_NAME, get_js
from api.websocket import FileMetadata, MessageContent, MessageNotification

router = APIRouter(prefix="/messages")

logger = logging.getLogger("uvicorn")


class GroupMessageRequest(BaseModel):
    content: str
    nonce: str
    group_id: int
    has_attachment: bool


class DownloadFileRequest(BaseModel):
    message_id: int


@router.post("/")
async def send_message(
    message_request: GroupMessageRequest, request: Request
) -> Message:
    user_id: int = request.state.uid

    # Check if user can send message
    with Session(engine) as session:
        membership = session.exec(
            select(GroupMember).where(
                GroupMember.user_id == user_id,
                GroupMember.group_id == message_request.group_id,
            )
        ).one_or_none()
    if membership is None:
        HTTPException(status_code=403, detail="Unauthorized")

    js = await get_js()

    message = Message(
        content=message_request.content,
        nonce=message_request.nonce,
        has_attachment=message_request.has_attachment,
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

    message_notification = MessageContent(
        id=message.id,
        content=message.content,
        attachment=None,
        nonce=message.nonce,
        sender_id=message.sender_id,
        group_id=message.group_id,
    )
    # Send message notification
    group_message = MessageNotification(
        message=message_notification, sender_name=user.username
    )
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
                            message=MessageContent(
                                id=m.id,
                                content=m.content,
                                attachment=None
                                if m.attachment is None
                                else FileMetadata(
                                    path=m.attachment.path,
                                    size=m.attachment.size,
                                    pretty_name=m.attachment.pretty_name,
                                    nonce=m.attachment.nonce,
                                ),
                                nonce=m.nonce,
                                sender_id=m.sender_id,
                                group_id=m.group_id,
                            ),
                            sender_name=m.sender.username,  # type: ignore
                        ),
                        group.group.messages,
                    )
                )
    return messages


@router.post("/upload")
async def upload(
    req: Request,
    file: Annotated[UploadFile, fastapi.File()],
    file_nonce: Annotated[str, Form()],
    group_id: Annotated[int, Form()],
    message: Annotated[str, Form()],
    message_nonce: Annotated[str, Form()],
):
    user_id: int = req.state.uid

    # Check if user can send message
    with Session(engine) as session:
        membership = session.exec(
            select(GroupMember).where(
                GroupMember.user_id == user_id,
                GroupMember.group_id == group_id,
            )
        ).one_or_none()

    if membership is None:
        raise HTTPException(status_code=403, detail="Unauthorized")

    js = await get_js()

    pretty_name = "file_name"
    if file.filename is not None:
        pretty_name = file.filename

    size = 0
    if file.size is not None:
        size = file.size

    path = "files/" + str(uuid.uuid4())

    try:
        with open(file=path, mode="wb") as f:
            while contents := file.file.read(1024 * 1024):
                f.write(contents)

    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")
    finally:
        file.file.close()

    new_message = Message(
        content=message,
        nonce=message_nonce,
        group_id=group_id,
        has_attachment=True,
        sender_id=user_id,
    )

    # Persist message
    with Session(engine) as session:
        session.add(new_message)
        session.commit()
        session.refresh(new_message)

    if new_message.id is None:
        raise HTTPException(status_code=500, detail="Something went wrong")

    new_file = File(
        message_id=new_message.id,
        path=path,
        size=size,
        pretty_name=pretty_name,
        nonce=file_nonce,
    )

    # Persist file
    with Session(engine) as session:
        session.add(new_file)
        session.commit()
        session.refresh(new_file)

    # Get user name
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == user_id)).one()

    message_notification = MessageContent(
        id=new_message.id,
        content=new_message.content,
        attachment=FileMetadata(
            size=new_file.size,
            path=new_file.path,
            pretty_name=new_file.pretty_name,
            nonce=file_nonce,
        ),
        nonce=new_message.nonce,
        sender_id=new_message.sender_id,
        group_id=new_message.group_id,
    )

    # Send message notification
    group_message = MessageNotification(
        message=message_notification, sender_name=user.username
    )
    subject = f"{STREAM_NAME}.groups.{new_message.group_id}"
    await js.publish(
        subject=subject,
        payload=group_message.model_dump_json().encode(),
        stream=STREAM_NAME,
    )


@router.post("/download")
async def download(req: Request, body: DownloadFileRequest):
    user_id: int = req.state.uid

    # Get message group
    with Session(engine) as session:
        message = session.exec(
            select(Message).where(Message.id == body.message_id)
        ).one_or_none()

    if message is None:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Check if user can download message
    membership = session.exec(
        select(GroupMember).where(
            GroupMember.user_id == user_id,
            GroupMember.group_id == message.group_id,
        )
    ).one_or_none()

    if membership is None:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Get file path
    with Session(engine) as session:
        file = session.exec(
            select(File).where(
                File.message_id == body.message_id,
            )
        ).one_or_none()

    if file is None:
        raise HTTPException(status_code=404, detail="Not found")

    return FileResponse(
        file.path, media_type="application/octet-stream", filename=file.pretty_name
    )
