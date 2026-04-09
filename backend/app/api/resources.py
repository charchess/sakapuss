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


class ResourceUpdate(BaseModel):
    name: str | None = None


class ResourceResponse(BaseModel):
    id: str
    name: str
    type: str
    created_at: str

    model_config = {"from_attributes": True}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, db: DbSession, current_user: User = Depends(get_current_user)):
    resource = Resource(name=payload.name, type=payload.type)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("")
def list_resources(db: DbSession, current_user: User | None = Depends(get_optional_user), type: str | None = None):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
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
