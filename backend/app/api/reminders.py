from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, get_optional_user
from backend.app.db.session import SessionLocal
from backend.app.modules.health import service
from backend.app.modules.health.models import Reminder
from backend.app.modules.pets.models import Pet
from backend.app.modules.users.models import User

router = APIRouter(tags=["Reminders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


class ReminderCreate(BaseModel):
    type: str = "health"
    name: str
    frequency_days: int
    product: str | None = None
    next_due_date: str | None = None  # ISO date, defaults to today + frequency_days


class ReminderResponse(BaseModel):
    id: str
    pet_id: str
    type: str
    name: str
    next_due_date: str
    frequency_days: int | None
    product: str | None
    last_done_date: str | None
    status: str  # "today", "overdue", "upcoming"
    pet_name: str | None = None

    model_config = {"from_attributes": True}


class PostponeRequest(BaseModel):
    delay_days: int


def compute_status(r: Reminder) -> str:
    today = date.today()
    due = r.next_due_date
    if isinstance(due, datetime):
        due = due.date()
    if due < today:
        return "overdue"
    if due == today:
        return "today"
    return "upcoming"


def reminder_to_response(r: Reminder, pet_name: str | None = None) -> dict:
    due = r.next_due_date
    if isinstance(due, datetime):
        due = due.date()
    last = r.last_done_date
    if isinstance(last, datetime):
        last = last.date()
    return {
        "id": r.id,
        "pet_id": r.pet_id,
        "type": r.type,
        "name": r.name,
        "next_due_date": str(due),
        "frequency_days": r.frequency_days,
        "product": r.product,
        "last_done_date": str(last) if last else None,
        "status": compute_status(r),
        "pet_name": pet_name,
    }


@router.get("/reminders/pending")
def list_pending_reminders(db: DbSession, current_user: User | None = Depends(get_optional_user)):
    return service.get_pending_reminders(db)


@router.get("/reminders/upcoming")
def list_upcoming_reminders(db: DbSession, current_user: User | None = Depends(get_optional_user), days: int = 7):
    return service.get_upcoming_reminders(db, days=days)


@router.post("/pets/{pet_id}/reminders", status_code=status.HTTP_201_CREATED)
def create_reminder(
    pet_id: str, payload: ReminderCreate, db: DbSession, current_user: User = Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if payload.next_due_date:
        try:
            due = datetime.fromisoformat(payload.next_due_date)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid date format") from exc
    else:
        due = datetime.now(UTC) + timedelta(days=payload.frequency_days)

    reminder = Reminder(
        pet_id=pet_id,
        type=payload.type,
        name=payload.name,
        next_due_date=due,
        frequency_days=payload.frequency_days,
        product=payload.product,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder_to_response(reminder, pet.name)


@router.get("/pets/{pet_id}/reminders")
def list_pet_reminders(pet_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    reminders = db.query(Reminder).filter(Reminder.pet_id == pet_id).all()
    return [reminder_to_response(r, pet.name) for r in reminders]


@router.get("/reminders/{reminder_id}")
def get_reminder(reminder_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    r = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reminder not found")

    pet = db.query(Pet).filter(Pet.id == r.pet_id).first()
    return reminder_to_response(r, pet.name if pet else None)


@router.post("/reminders/{reminder_id}/complete")
def complete_reminder(reminder_id: str, db: DbSession, current_user: User = Depends(get_current_user)):
    r = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reminder not found")

    today = datetime.now(UTC)
    r.last_done_date = today

    if r.frequency_days:
        r.next_due_date = today + timedelta(days=r.frequency_days)

    db.commit()
    db.refresh(r)

    pet = db.query(Pet).filter(Pet.id == r.pet_id).first()
    return reminder_to_response(r, pet.name if pet else None)


@router.post("/reminders/{reminder_id}/postpone")
def postpone_reminder(
    reminder_id: str, payload: PostponeRequest, db: DbSession, current_user: User = Depends(get_current_user)
):
    r = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reminder not found")

    current_due = r.next_due_date
    if isinstance(current_due, datetime):
        r.next_due_date = current_due + timedelta(days=payload.delay_days)
    else:
        r.next_due_date = datetime.combine(current_due, datetime.min.time()) + timedelta(days=payload.delay_days)

    db.commit()
    db.refresh(r)

    pet = db.query(Pet).filter(Pet.id == r.pet_id).first()
    return reminder_to_response(r, pet.name if pet else None)
