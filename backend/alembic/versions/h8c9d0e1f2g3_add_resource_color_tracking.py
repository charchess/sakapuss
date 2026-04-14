"""add_resource_color_tracking

Revision ID: h8c9d0e1f2g3
Revises: g7b8c9d0e1f2
Create Date: 2026-04-09

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "h8c9d0e1f2g3"
down_revision: str | None = "g7b8c9d0e1f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("resources") as batch_op:
        batch_op.add_column(sa.Column("color", sa.String(20), nullable=True))
        batch_op.add_column(sa.Column("tracking_mode", sa.String(20), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("resources") as batch_op:
        batch_op.drop_column("tracking_mode")
        batch_op.drop_column("color")
