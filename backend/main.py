import logging
from contextlib import asynccontextmanager

from api import router
from fastapi import FastAPI
from models import create_db_and_tables

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Creating database and tables...")
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router)


if __name__ == "__main__":
    import sys

    import uvicorn

    reload = "--reload" in sys.argv

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=reload)
