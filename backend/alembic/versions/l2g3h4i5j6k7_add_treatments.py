"""add_treatments
Revision ID: l2g3h4i5j6k7
Revises: k1f2g3h4i5j6
Create Date: 2026-04-28
"""

import sqlalchemy as sa
from alembic import op

revision = "l2g3h4i5j6k7"
down_revision = "k1f2g3h4i5j6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "treatments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pet_id", sa.String(36), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("product", sa.String(200), nullable=True),
        sa.Column("doses_per_day", sa.Integer, nullable=False),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("total_days", sa.Integer, nullable=False),
        sa.Column("moment_morning", sa.String(5), nullable=True),
        sa.Column("moment_noon", sa.String(5), nullable=True),
        sa.Column("moment_evening", sa.String(5), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "treatment_doses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("treatment_id", sa.String(36), sa.ForeignKey("treatments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pet_id", sa.String(36), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("moment", sa.String(20), nullable=False),
        sa.Column("scheduled_at", sa.DateTime, nullable=False),
        sa.Column("day_number", sa.Integer, nullable=False),
        sa.Column("dose_number", sa.Integer, nullable=False),
        sa.Column("total_doses", sa.Integer, nullable=False),
        sa.Column("total_days", sa.Integer, nullable=False),
        sa.Column("treatment_name", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("validated_at", sa.DateTime, nullable=True),
        sa.Column("comment", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    with op.batch_alter_table("reminders") as batch_op:
        batch_op.add_column(sa.Column("comment", sa.String(500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("reminders") as batch_op:
        batch_op.drop_column("comment")
    op.drop_table("treatment_doses")
    op.drop_table("treatments")
