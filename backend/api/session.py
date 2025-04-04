from typing import Any
import logging
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import APIRouter, Request, Response, WebSocket
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

JWT_SECRET = "change_me_please"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRES = timedelta(days=1)

router = APIRouter(prefix="/session")
logger = logging.getLogger("uvicorn")


def get_jwt(user_id: int) -> str:
    payload: dict[str, Any] = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + TOKEN_EXPIRES,
    }
    return jwt.encode(payload=payload, key=JWT_SECRET, algorithm=JWT_ALGORITHM)


def check_cookie(request: Request | WebSocket) -> int | jwt.InvalidTokenError:
    cookie = request.cookies.get("access_token")
    if cookie is None:
        return jwt.InvalidTokenError()

    return check_jwt(cookie)


def check_jwt(token: str) -> int | jwt.InvalidTokenError:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
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
        if not request.url.path.startswith(("/api/session")):
            response = await call_next(request)
            return response

        match check_cookie(request):
            case int(i):
                request.state.uid = i
                return await call_next(request)
            case jwt.InvalidTokenError():
                return JSONResponse(
                    content=jsonable_encoder({"detail": "Unauthorized"}),
                    status_code=401,
                )


class GetUidResponse(BaseModel):
    uid: int


@router.post("/get_uid")
def get_uid(req: Request, response: Response) -> GetUidResponse:
    uid = req.state.uid
    return GetUidResponse(uid=uid)
