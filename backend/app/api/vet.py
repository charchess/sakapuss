from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, get_optional_user, hash_password
from backend.app.db.session import get_db
from backend.app.modules.health.models import Event, Reminder
from backend.app.modules.pets.models import Pet
from backend.app.modules.users.models import User
from backend.app.modules.vet.models import VetAccessLink, VetAccount

router = APIRouter(tags=["Vet"])

DbSession = Annotated[Session, Depends(get_db)]


class VetShareCreate(BaseModel):
    pet_ids: list[str]
    vet_email: str


class VetAccountCreate(BaseModel):
    email: str
    name: str
    password: str
    practice_name: str | None = None


# ──── Sharing (Camille side) ────


@router.post("/vet-shares", status_code=status.HTTP_201_CREATED)
def create_vet_share(payload: VetShareCreate, db: DbSession, current_user: User = Depends(get_current_user)):
    links = []
    first_link = None
    for pid in payload.pet_ids:
        pet = db.query(Pet).filter(Pet.id == pid).first()
        if not pet:
            continue
        link = VetAccessLink(pet_id=pid, vet_email=payload.vet_email)
        db.add(link)
        links.append(link)
        if first_link is None:
            first_link = link

    if not first_link:
        raise HTTPException(status_code=404, detail="No valid pets found")

    db.commit()
    for link in links:
        db.refresh(link)

    # Return a single share object with all pet_ids
    return {
        "id": first_link.id,
        "token": first_link.token,
        "share_url": f"/vet/dossier/{first_link.token}",
        "vet_email": first_link.vet_email,
        "pet_ids": payload.pet_ids,
        "status": "active",
        "created_at": first_link.created_at.isoformat() if first_link.created_at else None,
    }


@router.get("/vet-shares")
def list_vet_shares(db: DbSession, current_user: User | None = Depends(get_optional_user)):
    links = db.query(VetAccessLink).all()
    result = []
    for link in links:
        pet = db.query(Pet).filter(Pet.id == link.pet_id).first()
        result.append(
            {
                "id": link.id,
                "pet_id": link.pet_id,
                "pet_name": pet.name if pet else None,
                "token": link.token,
                "vet_email": link.vet_email,
                "status": "revoked" if link.revoked_at else "active",
                "created_at": link.created_at.isoformat() if link.created_at else None,
            }
        )
    return result


@router.delete("/vet-shares/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_vet_share(share_id: str, db: DbSession, current_user: User = Depends(get_current_user)):
    link = db.query(VetAccessLink).filter(VetAccessLink.id == share_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Share not found")
    from datetime import UTC, datetime

    link.revoked_at = datetime.now(UTC)
    db.commit()


# ──── Dossier (Vet side — public, no auth) ────


@router.get("/vet/dossier/{token}")
def get_vet_dossier(token: str, db: DbSession):
    link = db.query(VetAccessLink).filter(VetAccessLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid access link")
    if link.revoked_at:
        raise HTTPException(status_code=410, detail="Access has been revoked")

    pet = db.query(Pet).filter(Pet.id == link.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    events = db.query(Event).filter(Event.pet_id == pet.id).order_by(Event.occurred_at.desc()).limit(50).all()
    reminders = db.query(Reminder).filter(Reminder.pet_id == pet.id).all()

    return {
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "birth_date": str(pet.birth_date) if pet.birth_date else None,
            "microchip": pet.microchip,
            "vet_name": pet.vet_name,
        },
        "events": [
            {
                "id": e.id,
                "type": e.type,
                "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
                "payload": e.payload,
            }
            for e in events
        ],
        "reminders": [
            {
                "id": r.id,
                "type": r.type,
                "name": r.name,
                "next_due_date": str(r.next_due_date) if r.next_due_date else None,
            }
            for r in reminders
        ],
        "_meta": {
            "shared_at": link.created_at.isoformat() if link.created_at else None,
            "vet_email": link.vet_email,
        },
    }


# ──── Vet Accounts ────


@router.post("/vet/accounts", status_code=status.HTTP_201_CREATED)
def create_vet_account(payload: VetAccountCreate, db: DbSession, current_user: User = Depends(get_current_user)):
    existing = db.query(VetAccount).filter(VetAccount.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists")

    account = VetAccount(
        email=payload.email,
        name=payload.name,
        practice_name=payload.practice_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    # Link existing shares to this account
    return {
        "id": account.id,
        "email": account.email,
        "name": account.name,
        "practice_name": account.practice_name,
    }


@router.get("/vet/patients")
def list_vet_patients(
    db: DbSession,
    current_user: User = Depends(get_current_user),
    email: str | None = None,
    search: str | None = None,
):
    query = db.query(VetAccessLink).filter(VetAccessLink.revoked_at.is_(None))
    effective_email = email if email else current_user.email
    query = query.filter(VetAccessLink.vet_email == effective_email)

    links = query.all()
    patients = []
    seen_pet_ids = set()

    for link in links:
        if link.pet_id in seen_pet_ids:
            continue
        seen_pet_ids.add(link.pet_id)
        pet = db.query(Pet).filter(Pet.id == link.pet_id).first()
        if not pet:
            continue
        if search and search.lower() not in pet.name.lower():
            continue
        patients.append(
            {
                "id": pet.id,
                "name": pet.name,
                "species": pet.species,
                "breed": pet.breed,
            }
        )

    return patients
