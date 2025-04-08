import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from config import JWT_SECRET
from fastapi import APIRouter, HTTPException, Request, Response, WebSocket
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from models import User, engine
from sqlmodel import Session, select
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRES = timedelta(days=1)

router = APIRouter(prefix="/session")
logger = logging.getLogger("uvicorn")


def get_jwt(user_id: int) -> str:
    payload: dict[str, Any] = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + TOKEN_EXPIRES,
    }
    return jwt.encode(payload=payload, key=JWT_SECRET, algorithm=JWT_ALGORITHM)  # type: ignore


def check_cookie(request: Request | WebSocket) -> User | jwt.InvalidTokenError:
    cookie = request.cookies.get("access_token")
    if cookie is None:
        return jwt.InvalidTokenError()

    match check_jwt(cookie):
        case int(uid):
            with Session(engine) as session:
                user = session.exec(select(User).where(User.id == uid)).one_or_none()
                if user is None:
                    return jwt.InvalidTokenError()

            return user
        case jwt.InvalidTokenError() as e:
            return e


def check_jwt(token: str) -> int | jwt.InvalidTokenError:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])  # type: ignore
        return decoded_token["user_id"]
    except jwt.InvalidTokenError as e:
        return e


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
    ):
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if not request.url.path.startswith(
            ("/api/session", "/api/groups", "/api/users", "/api/messages")
        ):
            response = await call_next(request)
            return response

        match check_cookie(request):
            case User() as user:
                request.state.uid = user.id
                return await call_next(request)
            case jwt.InvalidTokenError():
                return JSONResponse(
                    content=jsonable_encoder({"detail": "Unauthorized"}),
                    status_code=401,
                )


@router.get("/whoami")
def whoami(req: Request, response: Response) -> User:
    uid = req.state.uid

    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == uid)).one_or_none()

    if user is None:
        raise HTTPException(status_code=403, detail="Wrong authentication credentials")

    return user
