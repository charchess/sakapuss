# Story 1.2: CRUD des Profils Animaux (Backend API)

Status: done

## Story

As a User,
I want to manage (create, read, update, delete) my pets' profiles,
so that I can start tracking their health data individually.

## Acceptance Criteria

1. Given a running backend, when I send a POST request to /pets with pet details (name, species, birth_date), then a new pet record is created in the SQLite database.
2. I can retrieve all pets via GET /pets.
3. I can retrieve a single pet via GET /pets/{id}.
4. I can update a pet via PUT /pets/{id}.
5. I can delete a pet via DELETE /pets/{id}.
6. API returns proper validation errors for invalid input.

## Tasks / Subtasks

- [ ] Task 1: Create Pet SQLAlchemy model + Alembic migration (AC: 1, 2, 3, 4, 5)
  - [ ] Create `backend/app/modules/pets/models.py` with `Pet` model.
  - [ ] Model fields: `id` (UUID), `name` (str), `species` (str), `birth_date` (date), `photo_url` (optional str), `created_at` (datetime), `updated_at` (datetime).
  - [ ] Ensure table naming compliance with architecture rules: `pets` (plural snake_case).
  - [ ] Create first Alembic migration for pets table in `backend/alembic/versions/`.

- [ ] Task 2: Create Pydantic schemas for Pet CRUD (AC: 1, 2, 3, 4, 6)
  - [ ] Create `backend/app/modules/pets/schemas.py`.
  - [ ] Implement `PetCreate` schema with required fields: `name`, `species`, `birth_date`.
  - [ ] Implement `PetUpdate` schema with optional updatable fields.
  - [ ] Implement `PetResponse` schema with full public API representation.
  - [ ] Validation rules:
    - [ ] `name` required and non-empty.
    - [ ] `species` must be one of allowed values.
    - [ ] `birth_date` must be in the past.

- [ ] Task 3: Create Pet service layer (AC: 1, 2, 3, 4, 5)
  - [ ] Create `backend/app/modules/pets/service.py`.
  - [ ] Add CRUD service functions with SQLAlchemy 2.x style (`select()`, `Session.execute()`).
  - [ ] Handle not-found scenarios with explicit 404-compatible behavior for route layer.

- [ ] Task 4: Create Pet API routes (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Create `backend/app/api/pets.py` with an `APIRouter`.
  - [ ] Implement `POST /pets` returning `201 Created`.
  - [ ] Implement `GET /pets` returning `200 OK` list.
  - [ ] Implement `GET /pets/{pet_id}` returning `200 OK` or `404`.
  - [ ] Implement `PUT /pets/{pet_id}` returning `200 OK` or `404`.
  - [ ] Implement `DELETE /pets/{pet_id}` returning `204 No Content` or `404`.
  - [ ] Register pets router in `backend/main.py`.

- [ ] Task 5: ATDD tests (RED phase) (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Update `tests/api/pets-crud.spec.ts` to define all Story 1.2 acceptance behavior.
  - [ ] Keep every test in RED phase using `test.skip()`.
  - [ ] Include scenarios for create, list, retrieve by id, update, delete, not-found, and validation errors.

## Dev Notes

### Architecture Compliance Rules

- Follow modular monolith boundaries from architecture: models/services in `backend/app/modules/pets/`, REST endpoints only in `backend/app/api/`.
- Database naming conventions are mandatory: plural snake_case table names (`pets`) and snake_case columns.
- Endpoint conventions are mandatory: plural resource path (`/pets`, `/pets/{id}`-style).
- API response contract must be direct body payloads without global wrappers.
- API errors must use FastAPI standard format: `{"detail": "message"}`.
- Date and datetime values must be ISO 8601 UTC in API responses.

### Existing Patterns from Story 1.1

- `backend/main.py` already contains FastAPI app bootstrap and route wiring pattern; Story 1.2 should extend routing consistently.
- `backend/app/core/config.py` already establishes centralized settings via Pydantic `BaseSettings` (`SAKAPUSS_` prefix); Story 1.2 must reuse existing config access patterns.
- `backend/app/db/session.py` already defines SQLAlchemy engine/session lifecycle; Story 1.2 must use this dependency pattern rather than creating ad hoc sessions.

### SQLAlchemy 2.x Compliance

- Use SQLAlchemy 2.x APIs only (`select()`, `Session.execute()`, scalar/scalars helpers).
- Do not use legacy `Query` API patterns.

### Validation and Contract Notes

- Pydantic v2.10+ schemas are mandatory for input and output typing.
- Validation must enforce non-empty `name`, allowed `species`, and past-only `birth_date`.
- All CRUD endpoints should align with AC status codes (201/200/204/404) and FastAPI validation semantics.

### Previous Story Intelligence

- Story 1.1 delivered the backend skeleton and defines baseline implementation patterns and boundaries.
- Reuse Story 1.1 conventions for configuration loading, app startup structure, and DB session management to keep architecture consistency.

### References

- `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.2 definition)
- `_bmad-output/planning-artifacts/architecture.md` (naming, structure, response, SQLAlchemy/Pydantic rules)
- `_bmad-output/implementation-artifacts/1-1-initialisation-de-l-architecture-squelette-backend.md` (existing implementation patterns)
