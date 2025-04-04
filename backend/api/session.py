import time
from typing import Any

import jwt
from fastapi import APIRouter, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

JWT_SECRET = "change_me_please"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRES = 24 * 60 * 60  # Tokens are valid for a day now

router = APIRouter(prefix="/session")


def get_jwt(user_id: int) -> str:
    payload: dict[str, Any] = {
        "user_id": user_id,
        "expires": time.time() + TOKEN_EXPIRES,
    }
    return jwt.encode(payload=payload, key=JWT_SECRET, algorithm=JWT_ALGORITHM)


def check_jwt(token: str) -> int:
    decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    if decoded_token["expires"] >= time.time():
        return decoded_token["user_id"]
    else:
        raise Exception("Expired token")


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
    ):
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if not request.url.path.startswith(("/api/session", "/api/ws")):
            response = await call_next(request)
            return response
        try:
            cookie = request.cookies.get("access_token")
            if cookie is not None:
                id_token: str = cookie
                user_id = check_jwt(id_token)
                request.state.uid = user_id
                response = await call_next(request)
                return response
            else:
                return JSONResponse(
                    content=jsonable_encoder({"detail": "No cookie found"}),
                    status_code=424,
                )
        except (jwt.exceptions.DecodeError, Exception):
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
