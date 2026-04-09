"""extend_reminders

Revision ID: d4e5f6a7b8c9
Revises: 83794c31fa4d
Create Date: 2026-04-09

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: str | None = "83794c31fa4d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("reminders") as batch_op:
        batch_op.add_column(sa.Column("frequency_days", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("product", sa.String(200), nullable=True))
        batch_op.add_column(sa.Column("last_done_date", sa.DateTime(), nullable=True))
        # Make event_id nullable (reminders can now be created without an event)
        batch_op.alter_column("event_id", nullable=True)


def downgrade() -> None:
    with op.batch_alter_table("reminders") as batch_op:
        batch_op.drop_column("last_done_date")
        batch_op.drop_column("product")
        batch_op.drop_column("frequency_days")
        batch_op.alter_column("event_id", nullable=False)
