from datetime import date, datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, field_validator

ALLOWED_EVENT_TYPES = [
    "weight",
    "note",
    "vaccine",
    "treatment",
    "litter",
    "food",
    "relation",
]


class EventCreate(BaseModel):
    type: str
    occurred_at: datetime
    payload: dict

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ALLOWED_EVENT_TYPES:
            raise ValueError(f"Event type must be one of: {', '.join(ALLOWED_EVENT_TYPES)}")
        return v


class EventUpdate(BaseModel):
    occurred_at: datetime | None = None
    payload: dict | None = None


class EventResponse(BaseModel):
    id: str
    pet_id: str
    type: str
    occurred_at: datetime
    payload: dict
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


class ReminderResponse(BaseModel):
    id: str
    pet_id: str
    pet_name: str
    event_id: str
    type: str
    name: str
    next_due_date: date
    created_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)
