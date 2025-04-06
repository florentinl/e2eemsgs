import logging
from typing import Awaitable, Callable

import nats
from fastapi import WebSocket
from nats.aio.msg import Msg
from nats.js.api import (
    ConsumerConfig,
    DiscardPolicy,
    RetentionPolicy,
    StorageType,
    StreamConfig,
)
from nats.js.errors import BadRequestError

from api.authentication import generate_random_string

NATS_URL = "nats://localhost:4444"
STREAM_NAME = "chat"

logger = logging.getLogger("uvicorn")


class NATSMultiSubjectConsumer:
    async def init(
        self,
        subjects: list[str],
        ws: WebSocket,
        handler: Callable[[Msg], Awaitable[None]],
    ):
        self.js = await get_js()
        self.ws = ws

        identifier = generate_random_string(30)
        config = ConsumerConfig(
            durable_name=identifier,
            filter_subjects=subjects,
            deliver_subject=identifier,
        )
        self.ci = await self.js.add_consumer(stream=STREAM_NAME, config=config)  # type: ignore
        logger.info("CREATING CONSUMER: %s", self.ci.name)
        self.sub = await self.js.subscribe_bind(
            stream=STREAM_NAME,
            config=self.ci.config,
            consumer=self.ci.name,
            cb=handler,
        )

    async def cleanup(self):
        logger.info("CLEANING UP")
        await self.sub.unsubscribe()
        await self.js.delete_consumer(STREAM_NAME, self.ci.name)
        pass


async def get_js():
    nc = await nats.connect(servers=[NATS_URL])  # type: ignore
    js = nc.jetstream()  # type: ignore
    return js


async def create_stream():
    config = StreamConfig(
        name=STREAM_NAME,
        description="the global stream for the e2eemsgs app",
        subjects=[f"{STREAM_NAME}.*.*"],
        retention=RetentionPolicy.LIMITS,
        discard=DiscardPolicy.OLD,
        max_age=60,
        storage=StorageType.MEMORY,
    )

    js = await get_js()
    try:
        _ = await js.add_stream(config)  # type: ignore
        logger.info("Successfully created NATS Stream")
    except BadRequestError:
        _ = await js.update_stream(config)  # type: ignore
        logger.info("Successfully updated NATS Stream")
