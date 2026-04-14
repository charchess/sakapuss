"""add_resource_enabled

Revision ID: i9d0e1f2g3h4
Revises: h8c9d0e1f2g3
Create Date: 2026-04-09
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "i9d0e1f2g3h4"
down_revision: str | None = "h8c9d0e1f2g3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("resources") as batch_op:
        batch_op.add_column(sa.Column("enabled", sa.Boolean(), server_default="1"))


def downgrade() -> None:
    with op.batch_alter_table("resources") as batch_op:
        batch_op.drop_column("enabled")
