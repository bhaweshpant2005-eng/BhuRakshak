"""Initial PostGIS persistence schema.

Revision ID: 0001
Revises:
Create Date: 2026-09-09
"""
from typing import Sequence

from alembic import op
from sqlalchemy import inspect

from backend.api.database.base import Base
from backend.api.database import models  # noqa: F401

revision: str = "0001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
        op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    for table in reversed(Base.metadata.sorted_tables):
        table.drop(bind=bind, checkfirst=True)
