from datetime import UTC, date, datetime, time, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user
from backend.app.db.session import SessionLocal
from backend.app.modules.health.models import Event, Treatment, TreatmentDose
from backend.app.modules.pets.models import Pet
from backend.app.modules.users.models import User

router = APIRouter(tags=["Treatments"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


class TreatmentCreate(BaseModel):
    name: str
    product: str | None = None
    doses_per_day: int  # 1, 2 or 3
    start_date: str  # ISO date
    total_days: int
    moment_morning: str | None = None  # "HH:MM"
    moment_noon: str | None = None
    moment_evening: str | None = None


class CompleteRequest(BaseModel):
    comment: str | None = None


def _build_moments(t: Treatment) -> list[tuple[str, str]]:
    """Return (moment_name, HH:MM) tuples for this treatment."""
    morning = t.moment_morning or "08:00"
    noon = t.moment_noon or "13:00"
    evening = t.moment_evening or "20:00"
    if t.doses_per_day == 1:
        return [("morning", morning)]
    if t.doses_per_day == 2:
        return [("morning", morning), ("evening", evening)]
    return [("morning", morning), ("noon", noon), ("evening", evening)]


def _create_doses(
    db: Session, treatment: Treatment, start_dose: int = 1, start_day: int = 1, extra_days: int = 0
) -> None:
    moments = _build_moments(treatment)
    total_days = treatment.total_days + extra_days
    total_doses = total_days * treatment.doses_per_day

    # Update total_doses on existing doses if we're extending
    if extra_days:
        db.query(TreatmentDose).filter(TreatmentDose.treatment_id == treatment.id).update(
            {"total_doses": total_doses, "total_days": total_days}
        )

    dose_number = start_dose
    for day_offset in range(extra_days if extra_days else treatment.total_days):
        day_number = start_day + day_offset
        for moment_name, time_str in moments:
            h, m = map(int, time_str.split(":"))
            scheduled = datetime.combine(
                treatment.start_date + timedelta(days=day_number - 1),
                time(h, m),
            )
            db.add(
                TreatmentDose(
                    treatment_id=treatment.id,
                    pet_id=treatment.pet_id,
                    moment=moment_name,
                    scheduled_at=scheduled,
                    day_number=day_number,
                    dose_number=dose_number,
                    total_doses=total_doses,
                    total_days=total_days,
                    treatment_name=treatment.name,
                )
            )
            dose_number += 1


def _dose_to_dict(dose: TreatmentDose, pet_name: str | None = None) -> dict:
    return {
        "id": dose.id,
        "treatment_id": dose.treatment_id,
        "treatment_name": dose.treatment_name,
        "pet_id": dose.pet_id,
        "pet_name": pet_name,
        "moment": dose.moment,
        "scheduled_at": dose.scheduled_at.isoformat(),
        "day_number": dose.day_number,
        "dose_number": dose.dose_number,
        "total_doses": dose.total_doses,
        "total_days": dose.total_days,
        "status": dose.status,
        "validated_at": dose.validated_at.isoformat() if dose.validated_at else None,
        "comment": dose.comment,
    }


def _treatment_to_dict(t: Treatment, pet_name: str | None = None) -> dict:
    return {
        "id": t.id,
        "pet_id": t.pet_id,
        "pet_name": pet_name,
        "name": t.name,
        "product": t.product,
        "doses_per_day": t.doses_per_day,
        "start_date": str(t.start_date),
        "total_days": t.total_days,
        "total_doses": t.total_days * t.doses_per_day,
        "moment_morning": t.moment_morning,
        "moment_noon": t.moment_noon,
        "moment_evening": t.moment_evening,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
    }


@router.post("/pets/{pet_id}/treatments", status_code=status.HTTP_201_CREATED)
def create_treatment(
    pet_id: str, payload: TreatmentCreate, db: DbSession, current_user: User = Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    try:
        start = date.fromisoformat(payload.start_date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid start_date") from exc

    if payload.doses_per_day not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="doses_per_day must be 1, 2 or 3")

    treatment = Treatment(
        pet_id=pet_id,
        name=payload.name,
        product=payload.product,
        doses_per_day=payload.doses_per_day,
        start_date=start,
        total_days=payload.total_days,
        moment_morning=payload.moment_morning,
        moment_noon=payload.moment_noon,
        moment_evening=payload.moment_evening,
    )
    db.add(treatment)
    db.flush()  # get treatment.id before creating doses

    _create_doses(db, treatment)
    db.commit()
    db.refresh(treatment)
    return _treatment_to_dict(treatment, pet.name)


@router.get("/treatments/pending-doses")
def list_pending_doses(db: DbSession, current_user: User = Depends(get_current_user)):
    """Return doses whose scheduled time has arrived (or within 30min) and are still pending."""
    threshold = datetime.now() + timedelta(minutes=30)
    doses = (
        db.query(TreatmentDose)
        .filter(TreatmentDose.scheduled_at <= threshold, TreatmentDose.status == "pending")
        .order_by(TreatmentDose.scheduled_at)
        .all()
    )
    pet_names: dict[str, str] = {}
    for d in doses:
        if d.pet_id not in pet_names:
            pet = db.query(Pet).filter(Pet.id == d.pet_id).first()
            pet_names[d.pet_id] = pet.name if pet else ""
    return [_dose_to_dict(d, pet_names.get(d.pet_id)) for d in doses]


@router.post("/treatment-doses/{dose_id}/complete")
def complete_dose(
    dose_id: str, payload: CompleteRequest, db: DbSession, current_user: User = Depends(get_current_user)
):
    dose = db.query(TreatmentDose).filter(TreatmentDose.id == dose_id).first()
    if not dose:
        raise HTTPException(status_code=404, detail="Dose not found")

    now = datetime.now(UTC).replace(tzinfo=None)
    dose.status = "done"
    dose.validated_at = now
    dose.comment = payload.comment

    # Log in timeline
    db.add(
        Event(
            pet_id=dose.pet_id,
            type="health_note",
            occurred_at=now,
            payload={
                "product": dose.treatment_name,
                "moment": dose.moment,
                "dose_number": dose.dose_number,
                "total_doses": dose.total_doses,
                "treatment_id": dose.treatment_id,
                "comment": payload.comment,
            },
        )
    )

    is_last = dose.dose_number == dose.total_doses
    if is_last:
        db.query(Treatment).filter(Treatment.id == dose.treatment_id).update({"status": "completed"})

    db.commit()
    db.refresh(dose)

    pet = db.query(Pet).filter(Pet.id == dose.pet_id).first()
    return {**_dose_to_dict(dose, pet.name if pet else None), "is_last_dose": is_last}


@router.post("/treatment-doses/{dose_id}/miss")
def miss_dose(dose_id: str, payload: CompleteRequest, db: DbSession, current_user: User = Depends(get_current_user)):
    dose = db.query(TreatmentDose).filter(TreatmentDose.id == dose_id).first()
    if not dose:
        raise HTTPException(status_code=404, detail="Dose not found")

    now = datetime.now(UTC).replace(tzinfo=None)
    dose.status = "missed"
    dose.validated_at = now
    dose.comment = payload.comment

    # Log missed dose in timeline (orange in frontend)
    db.add(
        Event(
            pet_id=dose.pet_id,
            type="missed_dose",
            occurred_at=now,
            payload={
                "product": dose.treatment_name,
                "moment": dose.moment,
                "dose_number": dose.dose_number,
                "total_doses": dose.total_doses,
                "treatment_id": dose.treatment_id,
                "comment": payload.comment,
            },
        )
    )

    is_last = dose.dose_number == dose.total_doses
    if is_last:
        db.query(Treatment).filter(Treatment.id == dose.treatment_id).update({"status": "completed"})

    db.commit()
    db.refresh(dose)

    pet = db.query(Pet).filter(Pet.id == dose.pet_id).first()
    return {**_dose_to_dict(dose, pet.name if pet else None), "is_last_dose": is_last}


@router.post("/treatments/{treatment_id}/extend")
def extend_treatment(treatment_id: str, extra_days: int, db: DbSession, current_user: User = Depends(get_current_user)):
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")

    if extra_days < 1:
        raise HTTPException(status_code=400, detail="extra_days must be >= 1")

    # Find the next dose_number and day_number to continue from
    last_dose = (
        db.query(TreatmentDose)
        .filter(TreatmentDose.treatment_id == treatment_id)
        .order_by(TreatmentDose.dose_number.desc())
        .first()
    )
    start_dose = (last_dose.dose_number + 1) if last_dose else 1
    start_day = (last_dose.day_number + 1) if last_dose else 1

    treatment.total_days += extra_days
    treatment.status = "active"
    db.flush()

    _create_doses(db, treatment, start_dose=start_dose, start_day=start_day, extra_days=extra_days)
    db.commit()
    db.refresh(treatment)

    pet = db.query(Pet).filter(Pet.id == treatment.pet_id).first()
    return _treatment_to_dict(treatment, pet.name if pet else None)
