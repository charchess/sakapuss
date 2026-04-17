"""add_water_tracking_fields

Revision ID: j0e1f2g3h4i5
Revises: i9d0e1f2g3h4
Create Date: 2026-04-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "j0e1f2g3h4i5"
down_revision: str | None = "i9d0e1f2g3h4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("bowls") as batch_op:
        batch_op.add_column(sa.Column("capacity_ml", sa.Integer(), nullable=True))

    with op.batch_alter_table("servings") as batch_op:
        batch_op.add_column(sa.Column("amount_ml", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("remaining_ml", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("serving_type", sa.String(20), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("servings") as batch_op:
        batch_op.drop_column("serving_type")
        batch_op.drop_column("remaining_ml")
        batch_op.drop_column("amount_ml")

    with op.batch_alter_table("bowls") as batch_op:
        batch_op.drop_column("capacity_ml")
