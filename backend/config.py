import os
from typing import Literal

ENVIRONMENT: Literal["dev"] | Literal["prod"] = (
    "prod" if os.getenv("ENVIRONMENT") == "prod" else "dev"
)

NATS_URL = "nats://localhost:4444" if ENVIRONMENT == "dev" else "nats://nats:4444"
JWT_SECRET = os.getenv("JWT_SECRET", "change_me_please")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database")
FRONTEND_DIST_DIR = os.getenv("FRONTEND_DIST_DIR", "./dist/")
