from datetime import date, datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field

# --- Food Product ---


class FoodProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    brand: str = Field(..., min_length=1, max_length=200)
    food_type: str = Field(..., min_length=1, max_length=50)
    food_category: str = Field(..., min_length=1, max_length=50)
    default_bag_weight_g: int | None = None


class FoodProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    brand: str | None = Field(None, min_length=1, max_length=200)
    food_type: str | None = Field(None, min_length=1, max_length=50)
    food_category: str | None = Field(None, min_length=1, max_length=50)
    default_bag_weight_g: int | None = None


class FoodProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    food_type: str
    food_category: str
    default_bag_weight_g: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


# --- Food Bag ---


class FoodBagCreate(BaseModel):
    product_id: str
    weight_g: int = Field(..., gt=0)
    purchased_at: date


class FoodBagUpdate(BaseModel):
    weight_g: int | None = Field(None, gt=0)
    purchased_at: date | None = None


class FoodBagResponse(BaseModel):
    id: str
    product_id: str
    weight_g: int
    purchased_at: date
    opened_at: date | None = None
    depleted_at: date | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


# --- Bowl ---


class BowlCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=100)
    capacity_g: int | None = None
    bowl_type: str = Field(..., pattern="^(food|water)$")
    current_product_id: str | None = None


class BowlUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    location: str | None = Field(None, min_length=1, max_length=100)
    capacity_g: int | None = None
    bowl_type: str | None = Field(None, pattern="^(food|water)$")
    current_product_id: str | None = None


class BowlResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity_g: int | None = None
    bowl_type: str
    current_product_id: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


# --- Serving ---


class ServingCreate(BaseModel):
    bag_id: str | None = None
    pet_id: str | None = None
    served_at: datetime
    amount_g: int | None = None
    notes: str | None = None


class ServingResponse(BaseModel):
    id: str
    bowl_id: str
    bag_id: str | None = None
    pet_id: str | None = None
    served_at: datetime
    amount_g: int | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


# --- Consumption Estimate ---


class ConsumptionEstimate(BaseModel):
    daily_consumption_g: float
    remaining_g: float
    estimated_depletion_date: str | None = None
    days_remaining: float | None = None
    alert: bool = False
