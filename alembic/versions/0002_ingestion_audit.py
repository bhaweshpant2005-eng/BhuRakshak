"""Add auditable institutional ingestion metadata.

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("ingestion_runs") as batch:
        batch.add_column(sa.Column("ingestion_method", sa.String(length=50), nullable=True))
        batch.add_column(sa.Column("initiated_by", sa.String(length=180), nullable=True))
        batch.add_column(sa.Column("initiator_role", sa.String(length=40), nullable=True))
        batch.add_column(sa.Column("authorization_reference", sa.String(length=300), nullable=True))
        batch.add_column(sa.Column("license_reference", sa.String(length=500), nullable=True))
        batch.add_column(sa.Column("original_filename", sa.String(length=300), nullable=True))
        batch.add_column(sa.Column("media_type", sa.String(length=120), nullable=True))
        batch.add_column(sa.Column("checksum", sa.String(length=128), nullable=True))
        batch.create_index("ix_ingestion_runs_checksum", ["checksum"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("ingestion_runs") as batch:
        batch.drop_index("ix_ingestion_runs_checksum")
        batch.drop_column("checksum")
        batch.drop_column("media_type")
        batch.drop_column("original_filename")
        batch.drop_column("license_reference")
        batch.drop_column("authorization_reference")
        batch.drop_column("initiator_role")
        batch.drop_column("initiated_by")
        batch.drop_column("ingestion_method")
