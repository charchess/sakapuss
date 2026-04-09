from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from backend.app.api.auth import router as auth_router
from backend.app.api.bowls import router as bowls_router
from backend.app.api.commands import router as commands_router
from backend.app.api.events import router as events_router
from backend.app.api.food import router as food_router
from backend.app.api.household import router as household_router
from backend.app.api.pets import router as pets_router
from backend.app.api.reminders import router as reminders_router
from backend.app.api.resources import router as resources_router
from backend.app.api.tags import router as tags_router
from backend.app.api.vet import router as vet_router
from backend.app.core.config import settings
from backend.app.core.mqtt import mqtt_bridge
from backend.app.db.session import engine, ensure_db_directory


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Application startup/shutdown lifecycle."""
    ensure_db_directory()
    Path(settings.media_path).expanduser().resolve().mkdir(parents=True, exist_ok=True)
    await mqtt_bridge.connect()
    yield
    await mqtt_bridge.disconnect()


app = FastAPI(title=settings.api_title, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.199.119:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(pets_router)
app.include_router(events_router)
app.include_router(reminders_router)
app.include_router(commands_router)
app.include_router(tags_router)
app.include_router(food_router)
app.include_router(bowls_router)
app.include_router(resources_router)
app.include_router(household_router)
app.include_router(vet_router)
app.mount("/media", StaticFiles(directory=settings.media_path), name="media")


@app.get("/")
def root_check() -> dict[str, str]:
    return {"status": "healthy", "app": settings.app_name}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            _ = connection.execute(text("SELECT 1"))
    except (SQLAlchemyError, Exception) as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    return {"database": "connected"}


@app.get("/health/migrations")
def migrations_health_check() -> dict[str, str | bool]:
    alembic_path = Path(__file__).resolve().with_name("alembic.ini")

    try:
        alembic_cfg = Config(str(alembic_path))
        alembic_cfg.set_main_option(
            "sqlalchemy.url",
            settings.database_url,
        )
        script_location = Path(__file__).resolve().with_name("alembic")
        if not script_location.exists():
            raise FileNotFoundError("Alembic script location is missing")

        alembic_cfg.set_main_option("script_location", str(script_location))
        script_dir = ScriptDirectory.from_config(alembic_cfg)
        head_revisions = set(script_dir.get_heads())

        with engine.connect() as connection:
            migration_context = MigrationContext.configure(connection)
            current_revision = migration_context.get_current_revision()

        # If no migrations exist yet (empty versions/), head is empty and
        # current_revision is None — that means the DB is at baseline.
        if not head_revisions:
            return {
                "migrations_ready": True,
                "current_revision": "base",
            }

        # DB has pending migrations — not at head.
        if current_revision not in head_revisions:
            return {
                "migrations_ready": False,
                "current_revision": current_revision or "base",
                "head_revision": next(iter(head_revisions)),
            }

        return {
            "migrations_ready": True,
            "current_revision": current_revision,
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Migrations unavailable") from exc


@app.get("/health/mqtt")
def mqtt_health_check() -> dict:
    return mqtt_bridge.health_status()


@app.get("/mqtt/discovery")
def mqtt_discovery_entities():
    """Return HA entities that would be published via MQTT Discovery."""
    from backend.app.db.session import SessionLocal
    from backend.app.modules.health.models import Reminder
    from backend.app.modules.pets.models import Pet

    db = SessionLocal()
    try:
        pets = db.query(Pet).all()
        entities = []
        for pet in pets:
            pet.name.lower().replace(" ", "_")
            entities.append(
                {
                    "type": "sensor",
                    "pet_id": pet.id,
                    "pet_name": pet.name,
                    "entity_id": f"sakapuss_{pet.id}_weight",
                    "name": f"{pet.name} Weight",
                    "unit": "kg",
                }
            )
            entities.append(
                {
                    "type": "binary_sensor",
                    "pet_id": pet.id,
                    "pet_name": pet.name,
                    "entity_id": f"sakapuss_{pet.id}_vaccine_status",
                    "name": f"{pet.name} Vaccine Status",
                }
            )
            reminders = db.query(Reminder).filter(Reminder.pet_id == pet.id).all()
            for r in reminders:
                entities.append(
                    {
                        "type": "button",
                        "pet_id": pet.id,
                        "pet_name": pet.name,
                        "reminder_id": r.id,
                        "entity_id": f"sakapuss_{pet.id}_{r.type}_{r.id[:8]}",
                        "name": f"{pet.name} {r.name}",
                    }
                )
        return {"entities": entities, "count": len(entities)}
    finally:
        db.close()
