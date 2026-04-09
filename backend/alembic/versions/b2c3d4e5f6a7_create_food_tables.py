"""create_food_tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-09 03:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "food_products",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("brand", sa.String(200), nullable=False),
        sa.Column("food_type", sa.String(50), nullable=False),
        sa.Column("food_category", sa.String(50), nullable=False),
        sa.Column("default_bag_weight_g", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "food_bags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "product_id",
            sa.String(36),
            sa.ForeignKey("food_products.id"),
            nullable=False,
        ),
        sa.Column("weight_g", sa.Integer(), nullable=False),
        sa.Column("purchased_at", sa.Date(), nullable=False),
        sa.Column("opened_at", sa.Date(), nullable=True),
        sa.Column("depleted_at", sa.Date(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="stocked"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("food_bags")
    op.drop_table("food_products")
