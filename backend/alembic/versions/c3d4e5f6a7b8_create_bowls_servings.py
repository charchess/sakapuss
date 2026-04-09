"""create_bowls_servings

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-09 04:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: str | None = "b2c3d4e5f6a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "bowls",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("location", sa.String(100), nullable=False),
        sa.Column("capacity_g", sa.Integer(), nullable=True),
        sa.Column("bowl_type", sa.String(20), nullable=False),
        sa.Column(
            "current_product_id",
            sa.String(36),
            sa.ForeignKey("food_products.id"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "servings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("bowl_id", sa.String(36), sa.ForeignKey("bowls.id"), nullable=False),
        sa.Column("bag_id", sa.String(36), sa.ForeignKey("food_bags.id"), nullable=True),
        sa.Column("pet_id", sa.String(36), sa.ForeignKey("pets.id"), nullable=True),
        sa.Column("served_at", sa.DateTime(), nullable=False),
        sa.Column("amount_g", sa.Integer(), nullable=True),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("servings")
    op.drop_table("bowls")
