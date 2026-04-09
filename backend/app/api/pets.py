from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.modules.pets import service
from backend.app.modules.pets.schemas import PetCreate, PetResponse, PetUpdate

router = APIRouter(prefix="/pets", tags=["Pets"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=PetResponse)
def create_pet(pet_data: PetCreate, db: DbSession):
    return service.create_pet(db, pet_data)


@router.get("", response_model=list[PetResponse])
def list_pets(db: DbSession):
    return service.get_pets(db)


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: str, db: DbSession):
    pet = service.get_pet(db, pet_id)
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.put("/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: str, pet_data: PetUpdate, db: DbSession):
    pet = service.update_pet(db, pet_id, pet_data)
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(pet_id: str, db: DbSession):
    deleted = service.delete_pet(db, pet_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Pet not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{pet_id}/photo", response_model=PetResponse)
async def upload_pet_photo(pet_id: str, db: DbSession, file: Annotated[UploadFile, File(...)]):
    try:
        pet = service.save_pet_photo(db, pet_id, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")

    return pet
