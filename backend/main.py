import logging
from contextlib import asynccontextmanager

from api import router
from api.messaging import create_stream
from api.session import AuthMiddleware
from config import ENVIRONMENT, FRONTEND_DIST_DIR
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from models import create_db_and_tables

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Creating database and tables...")
    create_db_and_tables()
    await create_stream()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router)
app.add_middleware(middleware_class=AuthMiddleware)
if ENVIRONMENT == "prod":
    app.mount("/", StaticFiles(directory=FRONTEND_DIST_DIR, html=True))

if __name__ == "__main__":
    import json
    import sys
    from pathlib import Path

    import uvicorn

    reload = "--reload" in sys.argv
    openapi = "--openapi" in sys.argv

    if openapi:
        spec_path = Path(__file__).absolute().parent.__str__()
        print(spec_path)
        with open(spec_path + "/openapi.json", "w") as file:
            file.write(json.dumps(app.openapi()))
        exit()

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=reload)
