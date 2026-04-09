import shutil
import uuid
from datetime import date
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.modules.pets.models import Pet
from backend.app.modules.pets.schemas import PetCreate, PetUpdate


def create_pet(db: Session, pet_data: PetCreate) -> Pet:
    pet = Pet(**pet_data.model_dump())
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet


def get_pets(db: Session) -> list[Pet]:
    result = db.execute(select(Pet).order_by(Pet.created_at.desc()))
    return list(result.scalars().all())


def get_pet(db: Session, pet_id: str) -> Pet | None:
    result = db.execute(select(Pet).where(Pet.id == pet_id))
    return result.scalar_one_or_none()


def update_pet(db: Session, pet_id: str, pet_data: PetUpdate) -> Pet | None:
    pet = get_pet(db, pet_id)
    if pet is None:
        return None
    update_fields: dict[str, str | date | None] = pet_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet


def delete_pet(db: Session, pet_id: str) -> bool:
    pet = get_pet(db, pet_id)
    if pet is None:
        return False
    db.delete(pet)
    db.commit()
    return True


def save_pet_photo(db: Session, pet_id: str, file: UploadFile) -> Pet | None:
    pet = get_pet(db, pet_id)
    if pet is None:
        return None

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise ValueError("Uploaded file must be an image")

    media_root = Path(settings.media_path).expanduser().resolve()
    pet_media_dir = media_root / "pets" / pet_id
    pet_media_dir.mkdir(parents=True, exist_ok=True)

    original_filename = file.filename or "photo"
    extension = Path(original_filename).suffix.lower()
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    output_path = pet_media_dir / unique_filename

    _ = file.file.seek(0)
    with output_path.open("wb") as output_file:
        shutil.copyfileobj(file.file, output_file)

    pet.photo_url = f"/media/pets/{pet_id}/{unique_filename}"
    db.commit()
    db.refresh(pet)
    return pet
