import uuid
from datetime import date, datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from backend.app.db.base import Base


class Event(Base):
    __tablename__: str = "events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Reminder(Base):
    __tablename__: str = "reminders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    event_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    next_due_date: Mapped[date] = mapped_column(DateTime, nullable=False)
    frequency_days: Mapped[int | None] = mapped_column(nullable=True)
    product: Mapped[str | None] = mapped_column(String(200), nullable=True)
    last_done_date: Mapped[date | None] = mapped_column(DateTime, nullable=True)
    comment: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Treatment(Base):
    __tablename__: str = "treatments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    product: Mapped[str | None] = mapped_column(String(200), nullable=True)
    doses_per_day: Mapped[int] = mapped_column(nullable=False)
    start_date: Mapped[date] = mapped_column(nullable=False)
    total_days: Mapped[int] = mapped_column(nullable=False)
    moment_morning: Mapped[str | None] = mapped_column(String(5), nullable=True)
    moment_noon: Mapped[str | None] = mapped_column(String(5), nullable=True)
    moment_evening: Mapped[str | None] = mapped_column(String(5), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class TreatmentDose(Base):
    __tablename__: str = "treatment_doses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    treatment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("treatments.id", ondelete="CASCADE"), nullable=False
    )
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    moment: Mapped[str] = mapped_column(String(20), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    day_number: Mapped[int] = mapped_column(nullable=False)
    dose_number: Mapped[int] = mapped_column(nullable=False)
    total_doses: Mapped[int] = mapped_column(nullable=False)
    total_days: Mapped[int] = mapped_column(nullable=False)
    treatment_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    validated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    comment: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
