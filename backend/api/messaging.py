import logging

import nats
from nats.aio.client import Client
from nats.js.api import DiscardPolicy, RetentionPolicy, StorageType, StreamConfig
from nats.js.client import JetStreamContext

NATS_URL = "nats://localhost:4444"
nc: Client
js: JetStreamContext

logger = logging.getLogger("uvicorn")


async def create_stream():
    global nc, js
    nc = await nats.connect(servers=[NATS_URL])  # type: ignore
    js = nc.jetstream()  # type: ignore

    config = StreamConfig(
        name="chat",
        description="the global stream for the e2eemsgs app",
        subjects=["chat.*"],
        retention=RetentionPolicy.LIMITS,
        discard=DiscardPolicy.OLD,
        max_age=60,
        storage=StorageType.MEMORY,
    )

    _ = await js.add_stream(config)  # type: ignore
    logger.info("Successfully created NATS Stream")
