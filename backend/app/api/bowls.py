from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.modules.food import service
from backend.app.modules.food.schemas import (
    BowlCreate,
    BowlResponse,
    BowlUpdate,
    ConsumptionEstimate,
    ServingCreate,
    ServingResponse,
)

router = APIRouter(tags=["Bowls"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


# --- Bowls ---


@router.post("/bowls", status_code=status.HTTP_201_CREATED, response_model=BowlResponse)
def create_bowl(data: BowlCreate, db: DbSession):
    return service.create_bowl(db, data)


@router.get("/bowls", response_model=list[BowlResponse])
def list_bowls(db: DbSession):
    return service.get_bowls(db)


@router.put("/bowls/{bowl_id}", response_model=BowlResponse)
def update_bowl(bowl_id: str, data: BowlUpdate, db: DbSession):
    bowl = service.update_bowl(db, bowl_id, data)
    if bowl is None:
        raise HTTPException(status_code=404, detail="Bowl not found")
    return bowl


@router.delete("/bowls/{bowl_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bowl(bowl_id: str, db: DbSession):
    deleted = service.delete_bowl(db, bowl_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Bowl not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Servings ---


@router.post(
    "/bowls/{bowl_id}/fill",
    status_code=status.HTTP_201_CREATED,
    response_model=ServingResponse,
)
def fill_bowl(bowl_id: str, data: ServingCreate, db: DbSession):
    # Validate bowl exists
    bowl = service.get_bowl(db, bowl_id)
    if bowl is None:
        raise HTTPException(status_code=404, detail="Bowl not found")
    return service.create_serving(db, bowl_id, data)


@router.get("/bowls/{bowl_id}/servings", response_model=list[ServingResponse])
def list_bowl_servings(bowl_id: str, db: DbSession):
    return service.get_servings_for_bowl(db, bowl_id)


@router.get("/pets/{pet_id}/servings", response_model=list[ServingResponse])
def list_pet_servings(pet_id: str, db: DbSession):
    return service.get_servings_for_pet(db, pet_id)


# --- Consumption Estimate ---


@router.get("/food/bags/{bag_id}/estimate", response_model=ConsumptionEstimate)
def get_consumption_estimate(bag_id: str, db: DbSession):
    estimate = service.estimate_consumption(db, bag_id)
    if estimate is None:
        raise HTTPException(status_code=404, detail="Bag not found")
    return estimate
