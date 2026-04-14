from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.modules.food.models import Bowl, FoodBag, FoodProduct, Serving
from backend.app.modules.food.schemas import (
    BowlCreate,
    BowlUpdate,
    FoodBagCreate,
    FoodBagUpdate,
    FoodProductCreate,
    FoodProductUpdate,
    ServingCreate,
)

# --- Food Products ---


def create_product(db: Session, data: FoodProductCreate) -> FoodProduct:
    product = FoodProduct(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session) -> list[FoodProduct]:
    result = db.execute(select(FoodProduct).order_by(FoodProduct.created_at.desc()))
    return list(result.scalars().all())


def get_product(db: Session, product_id: str) -> FoodProduct | None:
    result = db.execute(select(FoodProduct).where(FoodProduct.id == product_id))
    return result.scalar_one_or_none()


def update_product(db: Session, product_id: str, data: FoodProductUpdate) -> FoodProduct | None:
    product = get_product(db, product_id)
    if product is None:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str) -> bool:
    product = get_product(db, product_id)
    if product is None:
        return False
    # Detach bowls referencing this product
    from backend.app.modules.food.models import Bowl
    db.query(Bowl).filter(Bowl.current_product_id == product_id).update(
        {"current_product_id": None}
    )
    db.delete(product)
    db.commit()
    return True


# --- Food Bags ---


def create_bag(db: Session, data: FoodBagCreate) -> FoodBag:
    bag = FoodBag(**data.model_dump(), status="stocked")
    db.add(bag)
    db.commit()
    db.refresh(bag)
    return bag


def get_bags(db: Session, status: str | None = None) -> list[FoodBag]:
    stmt = select(FoodBag).order_by(FoodBag.created_at.desc())
    if status:
        stmt = stmt.where(FoodBag.status == status)
    result = db.execute(stmt)
    return list(result.scalars().all())


def get_bag(db: Session, bag_id: str) -> FoodBag | None:
    result = db.execute(select(FoodBag).where(FoodBag.id == bag_id))
    return result.scalar_one_or_none()


def update_bag(db: Session, bag_id: str, data: FoodBagUpdate) -> FoodBag | None:
    bag = get_bag(db, bag_id)
    if bag is None:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(bag, key, value)
    db.commit()
    db.refresh(bag)
    return bag


def open_bag(db: Session, bag_id: str) -> FoodBag | None:
    bag = get_bag(db, bag_id)
    if bag is None:
        return None
    bag.status = "opened"
    bag.opened_at = date.today()
    db.commit()
    db.refresh(bag)
    return bag


def deplete_bag(db: Session, bag_id: str) -> FoodBag | None:
    bag = get_bag(db, bag_id)
    if bag is None:
        return None
    bag.status = "depleted"
    bag.depleted_at = date.today()
    db.commit()
    db.refresh(bag)
    return bag


# --- Bowls ---


def create_bowl(db: Session, data: BowlCreate) -> Bowl:
    bowl = Bowl(**data.model_dump())
    db.add(bowl)
    db.commit()
    db.refresh(bowl)
    return bowl


def get_bowls(db: Session) -> list[Bowl]:
    result = db.execute(select(Bowl).order_by(Bowl.created_at.desc()))
    return list(result.scalars().all())


def get_bowl(db: Session, bowl_id: str) -> Bowl | None:
    result = db.execute(select(Bowl).where(Bowl.id == bowl_id))
    return result.scalar_one_or_none()


def update_bowl(db: Session, bowl_id: str, data: BowlUpdate) -> Bowl | None:
    bowl = get_bowl(db, bowl_id)
    if bowl is None:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(bowl, key, value)
    db.commit()
    db.refresh(bowl)
    return bowl


def delete_bowl(db: Session, bowl_id: str) -> bool:
    bowl = get_bowl(db, bowl_id)
    if bowl is None:
        return False
    db.delete(bowl)
    db.commit()
    return True


# --- Servings ---


def create_serving(db: Session, bowl_id: str, data: ServingCreate) -> Serving:
    serving = Serving(bowl_id=bowl_id, **data.model_dump())
    db.add(serving)
    db.commit()
    db.refresh(serving)
    return serving


def get_servings_for_bowl(db: Session, bowl_id: str) -> list[Serving]:
    result = db.execute(select(Serving).where(Serving.bowl_id == bowl_id).order_by(Serving.served_at.desc()))
    return list(result.scalars().all())


def get_servings_for_pet(db: Session, pet_id: str) -> list[Serving]:
    result = db.execute(select(Serving).where(Serving.pet_id == pet_id).order_by(Serving.served_at.desc()))
    return list(result.scalars().all())


def get_servings_for_bag(db: Session, bag_id: str) -> list[Serving]:
    result = db.execute(select(Serving).where(Serving.bag_id == bag_id).order_by(Serving.served_at.desc()))
    return list(result.scalars().all())


# --- Consumption Estimation (Story 7.3) ---


def estimate_consumption(db: Session, bag_id: str) -> dict | None:
    bag = get_bag(db, bag_id)
    if bag is None:
        return None
    if bag.status == "stocked":
        return {
            "daily_consumption_g": 0,
            "remaining_g": float(bag.weight_g),
            "estimated_depletion_date": None,
            "days_remaining": None,
            "alert": False,
        }

    servings = get_servings_for_bag(db, bag_id)
    total_served = sum(s.amount_g for s in servings if s.amount_g)

    opened = bag.opened_at
    if not opened:
        opened = bag.purchased_at

    days_open = (date.today() - opened).days
    if days_open <= 0:
        days_open = 1

    daily = total_served / days_open if total_served > 0 else 0
    remaining = max(0.0, float(bag.weight_g) - total_served)

    depletion_date = None
    days_remaining = None
    alert = False

    if daily > 0:
        days_remaining = remaining / daily
        depletion_date = (date.today() + timedelta(days=int(days_remaining))).isoformat()
        alert = days_remaining < 7  # alert if < 7 days remaining

    return {
        "daily_consumption_g": round(daily, 1),
        "remaining_g": round(remaining, 1),
        "estimated_depletion_date": depletion_date,
        "days_remaining": round(days_remaining, 1) if days_remaining is not None else None,
        "alert": alert,
    }
