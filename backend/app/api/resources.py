from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, get_optional_user
from backend.app.db.session import get_db
from backend.app.modules.household.models import Resource
from backend.app.modules.users.models import User

router = APIRouter(prefix="/resources", tags=["Resources"])

DbSession = Annotated[Session, Depends(get_db)]


class ResourceCreate(BaseModel):
    name: str
    type: str  # litter, food_bowl, water
    color: str | None = None  # hex color
    tracking_mode: str | None = None  # weight, volume, none


class ResourceUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    tracking_mode: str | None = None
    enabled: bool | None = None


class ResourceResponse(BaseModel):
    id: str
    name: str
    type: str
    color: str | None = None
    tracking_mode: str | None = None
    enabled: bool = True
    created_at: str

    model_config = {"from_attributes": True}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, db: DbSession, current_user: User = Depends(get_current_user)):
    resource = Resource(name=payload.name, type=payload.type, color=payload.color, tracking_mode=payload.tracking_mode)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("")
def list_resources(
    db: DbSession,
    current_user: User | None = Depends(get_optional_user),
    type: str | None = None,
    include_disabled: bool = False,
):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if not include_disabled:
        query = query.filter(Resource.enabled == True)  # noqa: E712
    return query.all()


@router.get("/{resource_id}")
def get_resource(resource_id: str, db: DbSession, current_user: User | None = Depends(get_optional_user)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.patch("/{resource_id}")
def update_resource(
    resource_id: str, payload: ResourceUpdate, db: DbSession, current_user: User = Depends(get_current_user)
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if payload.name is not None:
        resource.name = payload.name
    if payload.color is not None:
        resource.color = payload.color
    if payload.tracking_mode is not None:
        resource.tracking_mode = payload.tracking_mode
    if payload.enabled is not None:
        resource.enabled = payload.enabled

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: str, db: DbSession, current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(resource)
    db.commit()
