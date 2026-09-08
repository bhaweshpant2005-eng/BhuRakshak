"""Async database engine and application lifecycle helpers."""
from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from backend.api.config import settings
from backend.api.database.base import Base

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _ensure_sqlite_directory(url: str) -> None:
    marker = "sqlite+aiosqlite:///"
    if url.startswith(marker):
        database_path = Path(url.removeprefix(marker))
        database_path.parent.mkdir(parents=True, exist_ok=True)


def get_engine() -> AsyncEngine:
    global _engine, _session_factory
    if _engine is None:
        _ensure_sqlite_directory(settings.database_url)
        _engine = create_async_engine(
            settings.database_url,
            pool_pre_ping=True,
            echo=settings.debug,
        )
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    get_engine()
    assert _session_factory is not None
    return _session_factory


async def initialize_database() -> None:
    engine = get_engine()
    if settings.auto_create_schema:
        from backend.api.database import models  # noqa: F401

        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    if settings.seed_demo_data and settings.auto_create_schema:
        from backend.api.database.seed import seed_demo_data

        session_factory = get_session_factory()
        async with session_factory() as session:
            await seed_demo_data(session)


async def check_database() -> bool:
    try:
        async with get_engine().connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


async def get_session() -> AsyncIterator[AsyncSession]:
    session_factory = get_session_factory()
    async with session_factory() as session:
        yield session


async def close_database() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None
