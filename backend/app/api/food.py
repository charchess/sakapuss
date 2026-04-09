from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.modules.food import service
from backend.app.modules.food.schemas import (
    FoodBagCreate,
    FoodBagResponse,
    FoodBagUpdate,
    FoodProductCreate,
    FoodProductResponse,
    FoodProductUpdate,
)

router = APIRouter(tags=["Food"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


# --- Food Products ---


@router.post(
    "/food/products",
    status_code=status.HTTP_201_CREATED,
    response_model=FoodProductResponse,
)
def create_product(data: FoodProductCreate, db: DbSession):
    return service.create_product(db, data)


@router.get("/food/products", response_model=list[FoodProductResponse])
def list_products(db: DbSession):
    return service.get_products(db)


@router.put("/food/products/{product_id}", response_model=FoodProductResponse)
def update_product(product_id: str, data: FoodProductUpdate, db: DbSession):
    product = service.update_product(db, product_id, data)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/food/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: DbSession):
    deleted = service.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Food Bags ---


@router.post("/food/bags", status_code=status.HTTP_201_CREATED, response_model=FoodBagResponse)
def create_bag(data: FoodBagCreate, db: DbSession):
    # Validate product exists
    product = service.get_product(db, data.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return service.create_bag(db, data)


@router.get("/food/bags", response_model=list[FoodBagResponse])
def list_bags(db: DbSession, bag_status: str | None = None):
    return service.get_bags(db, status=bag_status)


@router.put("/food/bags/{bag_id}", response_model=FoodBagResponse)
def update_bag(bag_id: str, data: FoodBagUpdate, db: DbSession):
    bag = service.update_bag(db, bag_id, data)
    if bag is None:
        raise HTTPException(status_code=404, detail="Bag not found")
    return bag


@router.post("/food/bags/{bag_id}/open", response_model=FoodBagResponse)
def open_bag(bag_id: str, db: DbSession):
    bag = service.open_bag(db, bag_id)
    if bag is None:
        raise HTTPException(status_code=404, detail="Bag not found")
    return bag


@router.post("/food/bags/{bag_id}/deplete", response_model=FoodBagResponse)
def deplete_bag(bag_id: str, db: DbSession):
    bag = service.deplete_bag(db, bag_id)
    if bag is None:
        raise HTTPException(status_code=404, detail="Bag not found")
    return bag
