from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, get_optional_user
from backend.app.db.session import SessionLocal
from backend.app.modules.health import service
from backend.app.modules.health.schemas import EventCreate, EventResponse, EventUpdate
from backend.app.modules.users.models import User
from backend.app.services.anomaly import detect_weight_anomalies

router = APIRouter(tags=["Events"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/pets/{pet_id}/events",
    status_code=status.HTTP_201_CREATED,
    response_model=EventResponse,
)
def create_event(pet_id: str, event_data: EventCreate, db: DbSession, current_user: User = Depends(get_current_user)):
    event = service.create_event(db, pet_id, event_data)
    if event is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return event


@router.get("/pets/{pet_id}/events", response_model=list[EventResponse])
def list_events(
    pet_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user), type: str | None = None
):
    return service.get_events_for_pet(db, pet_id, event_type=type)


@router.get("/events/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    event = service.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event_data: EventUpdate, db: DbSession, current_user: User = Depends(get_current_user)):
    event = service.update_event(db, event_id, event_data)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, db: DbSession, current_user: User = Depends(get_current_user)):
    deleted = service.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/pets/{pet_id}/correlations")
def get_correlations(pet_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    return service.compute_correlations(db, pet_id)


@router.get("/pets/{pet_id}/anomalies")
def get_anomalies(pet_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    return detect_weight_anomalies(db, pet_id)


@router.get("/pets/{pet_id}/insights")
def get_insights(
    pet_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user), month: str | None = None
):
    """Monthly analytics summary for a pet."""
    from collections import Counter
    from datetime import datetime, timedelta

    # Determine date range
    if month:
        year, m = month.split("-")
        start = datetime(int(year), int(m), 1)
        end = datetime(int(year) + 1, 1, 1) if int(m) == 12 else datetime(int(year), int(m) + 1, 1)
    else:
        now = datetime.now()
        start = datetime(now.year, now.month, 1)
        end = start + timedelta(days=32)
        end = datetime(end.year, end.month, 1)

    from backend.app.modules.health.models import Event

    events = (
        db.query(Event)
        .filter(
            Event.pet_id == pet_id,
            Event.occurred_at >= start,
            Event.occurred_at < end,
        )
        .all()
    )

    # Count by type
    type_counts = Counter(e.type for e in events)

    # Weight trend
    weight_events = [e for e in events if e.type == "weight" and e.payload and e.payload.get("value")]
    weight_trend = None
    if len(weight_events) >= 2:
        weights = sorted(weight_events, key=lambda e: e.occurred_at)
        first_w = float(weights[0].payload["value"])
        last_w = float(weights[-1].payload["value"])
        if first_w > 0:
            change_pct = (last_w - first_w) / first_w * 100
            if change_pct > 2:
                direction = "increasing"
            elif change_pct < -2:
                direction = "declining"
            else:
                direction = "stable"
            weight_trend = {
                "direction": direction,
                "start_value": first_w,
                "end_value": last_w,
                "change_kg": round(last_w - first_w, 2),
                "change_percent": round(change_pct, 1),
            }

    # Correlations
    correlations = service.compute_correlations(db, pet_id)

    return {
        "month": month or f"{start.year}-{start.month:02d}",
        "pet_id": pet_id,
        "event_count": len(events),
        "event_counts": dict(type_counts),
        "weight_trend": weight_trend,
        "correlations": correlations,
        "correlations_remaining": 2,  # Free tier quota placeholder
    }
