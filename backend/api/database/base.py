"""SQLAlchemy base classes and shared database types."""
from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SqlEnum, MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Provenance(str, enum.Enum):
    LIVE_OBSERVED = "live_observed"
    LIVE_MODELLED = "live_modelled"
    CACHED_OBSERVED = "cached_observed"
    CACHED_MODELLED = "cached_modelled"
    DERIVED = "derived"
    STATIC_REFERENCE = "static_reference"
    PREPARED_DEMO = "prepared_demo"
    SYNTHETIC_DEMO = "synthetic_demo"
    UNAVAILABLE = "unavailable"


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


PROVENANCE_ENUM = SqlEnum(Provenance, name="provenance_kind", native_enum=False)
