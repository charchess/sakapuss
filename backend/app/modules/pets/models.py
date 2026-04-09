import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.db.base import Base


class Pet(Base):
    __tablename__: str = "pets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    species: Mapped[str] = mapped_column(String(50), nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sterilized: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    microchip: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vet_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vet_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
