import time
from typing import Any

import jwt

JWT_SECRET = "change_me_please"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRES = 24*60*60 # Tokens are valid for a day now



def get_jwt(user_id: int) -> str:
    payload: dict[str,Any] = {
        "user_id": user_id,
        "expires": time.time()+TOKEN_EXPIRES
    }
    return jwt.encode(payload=payload, key=JWT_SECRET, algorithm=JWT_ALGORITHM) # type: ignore


