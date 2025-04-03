from fastapi import APIRouter

from api.authentication import router as authentication_router
from api.session import router as session_router
from api.websocket import router as websocket_router

router = APIRouter(prefix="/api")
router.include_router(authentication_router)
router.include_router(websocket_router)
router.include_router(session_router)
