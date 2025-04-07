import logging
from typing import Awaitable, Callable

import nats
from config import NATS_URL
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

STREAM_NAME = "chat"

logger = logging.getLogger("uvicorn")


class NATSMultiSubjectConsumer:
    async def init(
        self,
        subjects: list[str],
        handler: Callable[[Msg], Awaitable[None]],
    ):
        self.js = await get_js()
        self.subjects = set(subjects)
        self.handler = handler
        self.identifier = generate_random_string(30)

        await self._create_or_update_consumer()
        await self._subscribe()

    async def _create_or_update_consumer(self):
        config = ConsumerConfig(
            durable_name=self.identifier,
            filter_subjects=list(self.subjects),
            deliver_subject=self.identifier,
        )
        self.ci = await self.js.add_consumer(stream=STREAM_NAME, config=config)  # type: ignore

    async def _subscribe(self):
        self.sub = await self.js.subscribe_bind(
            stream=STREAM_NAME,
            config=self.ci.config,
            consumer=self.ci.name,
            cb=self.handler,
        )

    async def add_subject(self, sub: str):
        if sub in self.subjects:
            return
        self.subjects.add(sub)
        await self._create_or_update_consumer()

    async def remove_subject(self, sub: str):
        if sub not in self.subjects:
            return
        self.subjects.remove(sub)
        await self._create_or_update_consumer()

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
