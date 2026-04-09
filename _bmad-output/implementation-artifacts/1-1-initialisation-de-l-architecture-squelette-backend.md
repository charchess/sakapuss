# Story 1.1: Initialisation de l'Architecture & Squelette Backend

Status: done

## Story

As a Developer,
I want to set up the FastAPI server, SQLAlchemy ORM, Alembic migrations, and Docker configuration,
so that I have a functional and deployable backend foundation.

## Acceptance Criteria

1. Given a fresh project directory, when I run docker-compose, then the FastAPI server starts without errors.
2. OpenAPI documentation is accessible at `/docs`.
3. Alembic is initialized and ready for migrations.

## Tasks / Subtasks

- [x] Create backend runtime skeleton and dependency manifest (AC: 1, 2)
  - [x] Add `backend/main.py` with a minimal FastAPI app and health route.
  - [x] Add `backend/requirements.txt` with pinned baseline packages (FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic settings dependencies if used).
  - [x] Add startup wiring so `/docs` is served by default FastAPI OpenAPI docs.

- [x] Set up SQLAlchemy base/session and first model namespace scaffold (AC: 1, 3)
  - [x] Create `backend/app/db/base.py` and `backend/app/db/session.py`.
  - [x] Create empty modular folders to match architecture boundaries (`core`, `db`, `modules`, `api`, `services`).
  - [x] Configure SQLite DSN and session lifecycle.

- [x] Initialize Alembic and connect it to SQLAlchemy metadata (AC: 3)
  - [x] Add `backend/alembic.ini` and `backend/alembic/env.py` wired to app settings.
  - [x] Create initial migration revision scaffold and verify `upgrade` path works.
  - [x] Ensure migration command can run in containerized environment.

- [x] Add Docker baseline for local run (AC: 1, 2, 3)
  - [x] Add root `Dockerfile` and `docker-compose.yml` (app service + persistent volume mapping for SQLite/media).
  - [x] Expose API port and map workspace volume paths needed by project design.
  - [x] Verify `docker-compose up` brings app online and `/docs` is reachable.

- [x] Add acceptance-focused tests from existing ATDD baseline (AC: 1, 2, 3)
  - [x] Unskip and adapt `tests/api/health.spec.ts` once endpoints are available.
  - [x] Unskip and adapt `tests/e2e/infrastructure.spec.ts` for `/docs` and migration-readiness check.
  - [x] Keep tests deterministic and aligned with current infra naming.

## Dev Notes

### Technical Requirements

- Backend stack must align with architecture decisions: FastAPI + SQLAlchemy 2.x + Alembic + SQLite.
- Project follows modular monolith boundaries; do not collapse all logic into `main.py`.
- API responses should use direct body semantics and standard FastAPI error model (`{"detail": ...}`).
- Date/time values must be ISO-8601 UTC once endpoints start returning temporal fields.

### Architecture Compliance

- Respect intended structure:
  - `backend/app/core/*` for config/security/mqtt bootstrap.
  - `backend/app/db/*` for engine/session/base.
  - `backend/app/modules/*` for domain features.
  - `backend/app/api/*` as the only REST exposure boundary.
- Keep MQTT integration out of this story’s implementation scope except directory-level preparation.
- Preserve future compatibility for polymorphic `events` model (Story 2.1) and MQTT bridge (Epic 3).

### Library / Framework Requirements

- FastAPI 0.135.1 is planned in artifacts; current release notes indicate 0.135.1 is a fixes release on top of 0.135.0 SSE additions.
- SQLAlchemy 2.x style APIs must be used from day one (no 1.x legacy patterns).
- Alembic should be wired for SQLite batch-safe migrations; avoid risky JSON cast assumptions in SQLite migration transforms.
- SvelteKit frontend is not in scope for this story implementation, but backend must expose stable `/docs` for frontend/API contract generation later.

### File Structure Requirements

- Create and keep these initial paths coherent:
  - `backend/main.py`
  - `backend/requirements.txt`
  - `backend/alembic.ini`
  - `backend/alembic/versions/`
  - `backend/app/core/`
  - `backend/app/db/`
  - `backend/app/api/`
  - `backend/app/modules/`
  - `backend/app/services/`
- Root-level infra files expected by architecture:
  - `Dockerfile`
  - `docker-compose.yml`

### Testing Requirements

- Existing Playwright ATDD tests for Story 1.1 already exist and are currently skipped; convert them to executable once implementation lands.
- Minimum verification for story completion:
  - `docker-compose up` starts API service.
  - `GET /docs` reachable.
  - Migration initialization command succeeds.
  - Health/database checks return expected success contract.

### Project Structure Notes

- Current repo is pre-implementation: backend code files are mostly absent; this story establishes foundational directories and runtime wiring.
- Implementation artifacts and planning artifacts already exist under `_bmad-output` and should be preserved.

### Previous Story Intelligence

- Not applicable (this is the first story in Epic 1).

### Git Intelligence Summary

- No prior story implementation commits are required for this story baseline.

### Latest Tech Information

- FastAPI 0.135.1: patch-level fixes; safe baseline for this scaffold phase.
- SvelteKit 2.53.0 context (future stories): routing and store APIs are stable, and Vite 8 support landed around this line.
- SQLite + Alembic caution: batch migration behavior around JSON casting has known historical caveats; keep initial migration simple and explicit.

### Project Context Reference

- No `project-context.md` was discovered in repository; rely on planning artifacts as authoritative sources.

### References

- `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.1 acceptance criteria and sequencing)
- `_bmad-output/planning-artifacts/architecture.md` (stack, structure, boundaries, implementation order)
- `_bmad-output/planning-artifacts/prd.md` (MVP scope and technical success targets)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first direction and future UX constraints)
- FastAPI release notes: `https://fastapi.tiangolo.com/release-notes/`
- SvelteKit docs: `https://svelte.dev/docs/kit/routing`

## Story Completion Status

- Story file created with comprehensive implementation context.
- Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex (opencode/gpt-5.3-codex)

### Debug Log References

- Sprint status source: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Planning sources: `_bmad-output/planning-artifacts/*.md`

### Completion Notes List

- First backlog story auto-selected from sprint-status order: `1-1-initialisation-de-l-architecture-squelette-backend`.
- Epic status moved from `backlog` to `in-progress` during story creation flow (first story rule).
- Story status is ready-for-dev by workflow requirement.

### File List

- `_bmad-output/implementation-artifacts/1-1-initialisation-de-l-architecture-squelette-backend.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status update)
