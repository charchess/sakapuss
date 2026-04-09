import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.modules.household.models import Household, HouseholdMember

router = APIRouter(tags=["Household"])

DbSession = Annotated[Session, Depends(get_db)]


class InvitationCreate(BaseModel):
    email: str
    role: str = "input"  # admin, input, readonly


class InvitationAccept(BaseModel):
    user_id: str


# ──── Households ────


class HouseholdCreate(BaseModel):
    name: str = "Mon foyer"


@router.post("/households", status_code=status.HTTP_201_CREATED)
def create_household(db: DbSession, payload: HouseholdCreate = HouseholdCreate()):
    household = Household(name=payload.name)
    db.add(household)
    db.commit()
    db.refresh(household)
    return {"id": household.id, "name": household.name}


@router.delete("/households/{household_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_household(household_id: str, db: DbSession):
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    db.delete(household)
    db.commit()


# ──── Invitations ────


@router.post("/households/{household_id}/invitations", status_code=status.HTTP_201_CREATED)
def invite_member(household_id: str, payload: InvitationCreate, db: DbSession):
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    if payload.role not in ("admin", "input", "readonly"):
        raise HTTPException(status_code=422, detail="Invalid role")

    token = secrets.token_urlsafe(32)
    member = HouseholdMember(
        household_id=household_id,
        email=payload.email,
        role=payload.role,
        status="pending",
        invite_token=token,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return {
        "id": member.id,
        "household_id": member.household_id,
        "email": member.email,
        "role": member.role,
        "status": member.status,
        "token": member.invite_token,
        "invite_token": member.invite_token,
        "accept_url": f"/invite/{member.invite_token}",
    }


@router.post("/invitations/{token}/accept")
def accept_invitation(token: str, payload: InvitationAccept, db: DbSession):
    member = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.invite_token == token,
            HouseholdMember.status == "pending",
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Invitation not found or already used")

    member.user_id = payload.user_id
    member.status = "active"
    db.commit()
    db.refresh(member)
    return {
        "id": member.id,
        "member_id": member.id,
        "household_id": member.household_id,
        "email": member.email,
        "role": member.role,
        "status": member.status,
        "user_id": member.user_id,
    }


# ──── Members ────


@router.get("/households/{household_id}/members")
def list_members(household_id: str, db: DbSession):
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    members = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.status != "revoked",
        )
        .all()
    )
    return [
        {
            "id": m.id,
            "email": m.email,
            "role": m.role,
            "status": m.status,
            "user_id": m.user_id,
        }
        for m in members
    ]


@router.delete("/households/{household_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_member(household_id: str, member_id: str, db: DbSession):
    member = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.id == member_id,
            HouseholdMember.household_id == household_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.status = "revoked"
    db.commit()
