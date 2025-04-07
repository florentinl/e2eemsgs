from fastapi import APIRouter

from api.authentication import router as authentication_router
from api.groups import router as groups_router
from api.messages import router as message_router
from api.session import router as session_router
from api.users import router as users_router
from api.websocket import router as websocket_router

router = APIRouter(prefix="/api")
router.include_router(authentication_router)
router.include_router(groups_router)
router.include_router(message_router)
router.include_router(session_router)
router.include_router(users_router)
router.include_router(websocket_router)
