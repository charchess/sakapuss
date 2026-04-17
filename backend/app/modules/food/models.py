import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.db.base import Base


class FoodProduct(Base):
    __tablename__: str = "food_products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    food_type: Mapped[str] = mapped_column(String(50), nullable=False)
    food_category: Mapped[str] = mapped_column(String(50), nullable=False)
    default_bag_weight_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class FoodBag(Base):
    __tablename__: str = "food_bags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("food_products.id"), nullable=False)
    weight_g: Mapped[int] = mapped_column(Integer, nullable=False)
    purchased_at: Mapped[date] = mapped_column(Date, nullable=False)
    opened_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    depleted_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="stocked")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Bowl(Base):
    __tablename__: str = "bowls"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    capacity_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capacity_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bowl_type: Mapped[str] = mapped_column(String(20), nullable=False)  # food or water
    current_product_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("food_products.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Serving(Base):
    __tablename__: str = "servings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bowl_id: Mapped[str] = mapped_column(String(36), ForeignKey("bowls.id"), nullable=False)
    bag_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("food_bags.id"), nullable=True)
    pet_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("pets.id"), nullable=True)
    served_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    amount_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amount_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    remaining_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    serving_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
