from datetime import date, datetime
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

ALLOWED_SPECIES = [
    "Cat",
    "Dog",
    "Rabbit",
    "Bird",
    "Fish",
    "Hamster",
    "Guinea Pig",
    "Turtle",
    "Other",
]

SPECIES_FR_TO_EN = {
    "chat": "Cat",
    "chatte": "Cat",
    "chien": "Dog",
    "chienne": "Dog",
    "lapin": "Rabbit",
    "lapine": "Rabbit",
    "oiseau": "Bird",
    "poisson": "Fish",
    "hamster": "Hamster",
    "cochon d'inde": "Guinea Pig",
    "cobaye": "Guinea Pig",
    "tortue": "Turtle",
    "autre": "Other",
}


class PetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str
    birth_date: date
    breed: str | None = None
    sterilized: bool | None = None
    microchip: str | None = None
    vet_name: str | None = None
    vet_phone: str | None = None

    @field_validator("species")
    @classmethod
    def validate_species(cls, v: str) -> str:
        normalized = SPECIES_FR_TO_EN.get(v.lower().strip())
        if normalized:
            v = normalized
        if v not in ALLOWED_SPECIES:
            raise ValueError(f"Species must be one of: {', '.join(ALLOWED_SPECIES)}")
        return v

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("birth_date must be in the past")
        return v


class PetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    species: str | None = None
    birth_date: date | None = None
    breed: str | None = None
    sterilized: bool | None = None
    microchip: str | None = None
    vet_name: str | None = None
    vet_phone: str | None = None

    @field_validator("species")
    @classmethod
    def validate_species(cls, v: str | None) -> str | None:
        if v is not None:
            normalized = SPECIES_FR_TO_EN.get(v.lower().strip())
            if normalized:
                v = normalized
            if v not in ALLOWED_SPECIES:
                raise ValueError(f"Species must be one of: {', '.join(ALLOWED_SPECIES)}")
        return v

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: date | None) -> date | None:
        if v is not None and v >= date.today():
            raise ValueError("birth_date must be in the past")
        return v


class PetResponse(BaseModel):
    id: str
    name: str
    species: str
    birth_date: date
    photo_url: str | None = None
    breed: str | None = None
    sterilized: bool | None = None
    microchip: str | None = None
    vet_name: str | None = None
    vet_phone: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)
