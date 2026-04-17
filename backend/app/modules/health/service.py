from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.modules.health.models import Event, Reminder
from backend.app.modules.health.schemas import EventCreate, EventUpdate
from backend.app.modules.pets.models import Pet


def create_event(db: Session, pet_id: str, event_data: EventCreate) -> Event | None:
    pet = db.execute(select(Pet).where(Pet.id == pet_id)).scalar_one_or_none()
    if pet is None:
        return None

    event = Event(
        pet_id=pet_id,
        type=event_data.type,
        occurred_at=event_data.occurred_at,
        payload=event_data.payload,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Auto-create reminder if vaccine/treatment with period_months
    _maybe_create_reminder(db, event)

    return event


def get_event(db: Session, event_id: str) -> Event | None:
    return db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()


def get_events_for_pet(db: Session, pet_id: str, event_type: str | None = None) -> list[Event]:
    stmt = select(Event).where(Event.pet_id == pet_id)
    if event_type is not None:
        stmt = stmt.where(Event.type == event_type)
    stmt = stmt.order_by(Event.occurred_at.desc())
    result = db.execute(stmt)
    return list(result.scalars().all())


def update_event(db: Session, event_id: str, event_data: EventUpdate) -> Event | None:
    event = db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()
    if event is None:
        return None

    update_dict = event_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: str) -> bool:
    event = db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()
    if event is None:
        return False
    db.delete(event)
    db.commit()
    return True


def _maybe_create_reminder(db: Session, event: Event) -> None:
    """Create a reminder if the event has a period_months in its payload."""
    if event.type not in ("vaccine", "treatment"):
        return
    period_months = event.payload.get("period_months")
    if not period_months or not isinstance(period_months, int | float):
        return

    occurred = event.occurred_at
    # Add months manually
    month = occurred.month + int(period_months)
    year = occurred.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    day = min(occurred.day, 28)  # safe for all months
    next_due = date(year, month, day)

    reminder = Reminder(
        pet_id=event.pet_id,
        event_id=event.id,
        type=event.type,
        name=event.payload.get("name", event.type),
        next_due_date=next_due,
    )
    db.add(reminder)
    db.commit()


def _reminder_dict(reminder: Reminder, pet_name: str | None) -> dict:
    """Serialize a Reminder to a dict with all fields the frontend needs."""
    due = reminder.next_due_date
    if isinstance(due, datetime):
        due = due.date()
    last = reminder.last_done_date
    if isinstance(last, datetime):
        last = last.date()
    today = date.today()
    if due < today:
        status = "overdue"
    elif due == today:
        status = "today"
    else:
        status = "upcoming"
    return {
        "id": reminder.id,
        "pet_id": reminder.pet_id,
        "pet_name": pet_name,
        "type": reminder.type,
        "name": reminder.name,
        "next_due_date": str(due),
        "frequency_days": reminder.frequency_days,
        "product": reminder.product,
        "last_done_date": str(last) if last else None,
        "status": status,
    }


def get_pending_reminders(db: Session) -> list[dict]:
    """Get all overdue/today reminders with pet name, sorted by due date ASC."""
    from backend.app.modules.pets.models import Pet

    stmt = (
        select(Reminder, Pet.name.label("pet_name"))
        .join(Pet, Reminder.pet_id == Pet.id)
        .order_by(Reminder.next_due_date.asc())
    )
    results = db.execute(stmt).all()
    return [_reminder_dict(r, pet_name) for r, pet_name in results]


def get_upcoming_reminders(db: Session, days: int = 7) -> list[dict]:
    """Get reminders due within the next N days, sorted by due date ASC."""
    from backend.app.modules.pets.models import Pet

    today = date.today()
    cutoff = today + timedelta(days=days)

    stmt = (
        select(Reminder, Pet.name.label("pet_name"))
        .join(Pet, Reminder.pet_id == Pet.id)
        .where(Reminder.next_due_date <= cutoff)
        .where(Reminder.next_due_date >= today)
        .order_by(Reminder.next_due_date.asc())
    )
    results = db.execute(stmt).all()
    return [_reminder_dict(r, pet_name) for r, pet_name in results]


def validate_reminder(db: Session, pet_id: str, reminder_id: str) -> Event | None:
    """Validate a reminder by creating a confirmation event."""
    reminder = db.execute(select(Reminder).where(Reminder.id == reminder_id)).scalar_one_or_none()
    if reminder is None:
        return None

    # Create a validation event
    event = Event(
        pet_id=pet_id,
        type=reminder.type,
        occurred_at=datetime.utcnow(),
        payload={
            "validated": True,
            "original_name": reminder.name,
            "reminder_id": reminder.id,
            "source": "command",
        },
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


# Symptom event types and anomaly keywords indicating digestive issues
_SYMPTOM_TYPES = {"litter"}
_DIGESTIVE_ANOMALIES = {"diarrhea", "vomiting", "blood_stool", "constipation", "blood"}


def compute_correlations(db: Session, pet_id: str) -> list[dict]:
    """Detect food change → digestive symptom correlations within 72h."""
    events = get_events_for_pet(db, pet_id)
    # Sort chronologically
    events_sorted = sorted(events, key=lambda e: e.occurred_at)

    food_changes = [e for e in events_sorted if e.type == "food" and e.payload.get("change") is True]
    symptom_events = [e for e in events_sorted if e.type in _SYMPTOM_TYPES and _has_digestive_anomaly(e.payload)]

    correlations = []
    window = timedelta(hours=72)

    for food_ev in food_changes:
        food_time = food_ev.occurred_at
        for symptom_ev in symptom_events:
            symptom_time = symptom_ev.occurred_at
            delta = symptom_time - food_time
            if timedelta(0) < delta <= window:
                correlations.append(
                    {
                        "type": "food_health",
                        "trigger_event": _event_summary(food_ev),
                        "symptom_event": _event_summary(symptom_ev),
                        "delay_hours": round(delta.total_seconds() / 3600, 1),
                    }
                )

    return correlations


def _has_digestive_anomaly(payload: dict) -> bool:
    anomalies = payload.get("anomalies", [])
    return bool(set(anomalies) & _DIGESTIVE_ANOMALIES)


def _event_summary(event: Event) -> dict:
    return {
        "id": event.id,
        "type": event.type,
        "occurred_at": event.occurred_at.isoformat(),
        "payload": event.payload,
    }
