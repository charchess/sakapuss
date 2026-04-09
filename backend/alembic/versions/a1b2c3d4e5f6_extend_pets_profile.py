"""extend_pets_profile

Revision ID: a1b2c3d4e5f6
Revises: 057c1dfccd68
Create Date: 2026-03-09 02:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "057c1dfccd68"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("pets", sa.Column("breed", sa.String(100), nullable=True))
    op.add_column("pets", sa.Column("sterilized", sa.Boolean(), nullable=True))
    op.add_column("pets", sa.Column("microchip", sa.String(50), nullable=True))
    op.add_column("pets", sa.Column("vet_name", sa.String(100), nullable=True))
    op.add_column("pets", sa.Column("vet_phone", sa.String(30), nullable=True))


def downgrade() -> None:
    op.drop_column("pets", "vet_phone")
    op.drop_column("pets", "vet_name")
    op.drop_column("pets", "microchip")
    op.drop_column("pets", "sterilized")
    op.drop_column("pets", "breed")
