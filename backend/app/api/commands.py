from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.modules.health import service
from backend.app.modules.health.schemas import EventResponse

router = APIRouter(tags=["Commands"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


class ValidateCommand(BaseModel):
    pet_id: str
    reminder_id: str


@router.post(
    "/commands/validate",
    status_code=status.HTTP_201_CREATED,
    response_model=EventResponse,
)
def validate_reminder(command: ValidateCommand, db: DbSession):
    event = service.validate_reminder(db, command.pet_id, command.reminder_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return event
