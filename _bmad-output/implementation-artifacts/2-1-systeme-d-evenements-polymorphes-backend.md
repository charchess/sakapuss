# Story 2.1: Système d'Événements Polymorphes (Backend)

## Status: done

## Story

As a Developer,
I want to implement a polymorphic 'events' table using a JSON payload,
So that I can store diverse types of health data (weight, notes, treatments) in a single chronological stream.

## Acceptance Criteria

- **Given** the existing backend infrastructure
- **When** I create the 'events' table with fields: id, pet_id, type, timestamp, and payload (JSON)
- **Then** I can store different data structures in the payload field based on the 'type' value
- **And** SQLAlchemy correctly serializes/deserializes the JSON data.

## Tasks

### Task 1: Create Event Model (SQLAlchemy)
- [ ] Create `backend/app/modules/health/` module directory with `__init__.py`
- [ ] Create `backend/app/modules/health/models.py` with `Event` model:
  - `id`: String(36), primary key, UUID default
  - `pet_id`: String(36), ForeignKey to pets.id, NOT NULL
  - `type`: String(50), NOT NULL — event type enum: "weight", "note", "vaccine", "treatment", "litter", "food"
  - `occurred_at`: DateTime, NOT NULL — when the event happened (user-provided)
  - `payload`: JSON, NOT NULL — type-specific data
  - `created_at`: DateTime, server_default=func.now()
  - `updated_at`: DateTime, server_default=func.now(), onupdate=func.now()
- [ ] Add relationship from Pet → Events (lazy="selectin")

### Task 2: Create Pydantic Schemas
- [ ] Create `backend/app/modules/health/schemas.py`:
  - `EventCreate`: type, occurred_at, payload (dict)
  - `EventResponse`: id, pet_id, type, occurred_at, payload, created_at, updated_at
  - `EventUpdate`: occurred_at (optional), payload (optional)
  - Validate `type` against allowed event types
  - Validate `payload` has required keys per type (weight → {"value": float, "unit": str}, note → {"text": str}, vaccine → {"name": str, "next_due": optional date})

### Task 3: Create Service Layer
- [ ] Create `backend/app/modules/health/service.py`:
  - `create_event(db, pet_id, event_data)` — validates pet exists, creates event
  - `get_event(db, event_id)` — fetch single event
  - `get_events_for_pet(db, pet_id)` — fetch all events for a pet, ordered by occurred_at DESC
  - `update_event(db, event_id, event_data)` — update event
  - `delete_event(db, event_id)` — delete event

### Task 4: Create API Routes
- [ ] Create `backend/app/api/events.py`:
  - `POST /pets/{pet_id}/events` → create event (201)
  - `GET /pets/{pet_id}/events` → list events for pet (200)
  - `GET /events/{event_id}` → get single event (200)
  - `PUT /events/{event_id}` → update event (200)
  - `DELETE /events/{event_id}` → delete event (204)
- [ ] Register router in `backend/main.py`

### Task 5: Alembic Migration
- [ ] Generate migration: `alembic revision --autogenerate -m "create_events_table"`
- [ ] Verify migration creates events table with correct columns
- [ ] Run migration: `alembic upgrade head`

### Task 6: Verify Tests GREEN
- [ ] Unskip ATDD tests in `tests/api/events-polymorphic.spec.ts`
- [ ] All tests pass GREEN

## Dev Notes
- Use SQLAlchemy 2.x style (select(), scalars(), Mapped[], mapped_column)
- JSON payload stored as JSON type (SQLite JSON1 extension)
- Foreign key to pets.id with ON DELETE CASCADE
- Follow existing patterns from pets module
