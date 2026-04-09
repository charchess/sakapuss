# Story 1.1: Project Scaffolding + Docker + First Endpoint

Status: review

## Story

As a developer,
I want to run `docker compose up` and see a running Sakapuss application with a health-check endpoint and a SvelteKit welcome page,
So that I have a verified, reproducible development environment to build upon.

## Acceptance Criteria

1. **Given** a freshly cloned repository with Docker installed, **When** I run `docker compose up --build`, **Then** the FastAPI backend starts and responds with `{"status": "ok"}` at `GET /api/health`, **And** the OpenAPI documentation is accessible at `/api/docs`
2. **Given** the containers are running, **When** I access the frontend, **Then** the SvelteKit welcome page is served at `http://localhost:5173` (dev) or port 80 (production)
3. **Given** Alembic is configured, **When** I check migration status, **Then** Alembic is initialized and migrations are applied
4. **Given** the containers are running, **When** I stop and restart them, **Then** the SQLite database file persists in the mounted `./data` volume, **And** the `/media` volume is mounted and writable
5. **Given** the backend dependencies, **When** I inspect the project, **Then** FastAPI uses SQLAlchemy 2.0+, Pydantic v2.10+ is installed, **And** `.env.example` documents all required environment variables

## Tasks / Subtasks

- [x] Task 1: Fix health endpoint to match AC (AC: #1)
  - [x] 1.1: Added `GET /health` route returning `{"status": "ok"}` in `backend/main.py`
  - [x] 1.2: Verified OpenAPI docs accessible at `/api/docs` through nginx proxy (`/api/` → backend:8000)
- [x] Task 2: Update `.env.example` with all documented variables (AC: #5)
  - [x] 2.1: Added all SAKAPUSS_* variables (DB_PATH, MEDIA_PATH, MQTT_BROKER_HOST/PORT/USERNAME/PASSWORD, MQTT_DISCOVERY_PREFIX, APP_NAME, API_TITLE)
- [x] Task 3: Apply WDS Design System CSS tokens to frontend (AC: #2)
  - [x] 3.1: Replaced `frontend/src/app.css` with complete WDS design tokens: brand colors (#6C5CE7), neutrals (#F8F6FF bg), semantic, categories, spacing scale, type scale, elevation, border-radius + legacy compat aliases
  - [x] 3.2: Added Nunito + Inter Google Fonts import in `frontend/src/app.html` with preconnect
  - [x] 3.3: Set body background to `--color-bg` (#F8F6FF), default font to Inter, headings to Nunito
- [x] Task 4: Verify Docker persistence and volumes (AC: #3, #4)
  - [x] 4.1: Backend health verified (`curl localhost:8000/health` → `{"status":"ok"}`)
  - [x] 4.2: `./data/sakapuss.db` exists (69KB, 5 migrations applied)
  - [x] 4.3: `./media/` directory exists and writable
- [x] Task 5: Run existing tests to confirm no regressions (AC: all)
  - [x] 5.1: `tests/api/health.spec.ts` — updated + 3/3 passed (root, /health, /health/db)
  - [x] 5.2: `tests/api/infrastructure-docker.spec.ts` — updated ci.yml→test.yml refs + 9/9 passed
  - [x] 5.3: Auth tests (Story 1.2) remain skipped — foundation verified, auth is next story

## Dev Notes

### Critical: Most of Story 1.1 Already Exists

The previous sprints (1-3) already implemented the full backend, frontend, Docker, and Alembic setup. This story aligned the existing code with the new WDS Phase 4 design system and acceptance criteria.

### Existing Codebase Reference

| Component | File | Status |
|-----------|------|--------|
| FastAPI app | `backend/main.py` | ✅ Updated — added /health endpoint |
| DB session | `backend/app/db/session.py` | ✅ No change needed |
| Config | `backend/app/core/config.py` | ✅ No change needed |
| Alembic | `backend/alembic/` | ✅ No change needed |
| Docker | `docker-compose.yml`, `Dockerfile`, `Dockerfile.frontend` | ✅ No change needed |
| Nginx | `nginx.conf` | ✅ No change needed |
| Frontend | `frontend/src/` | ✅ CSS + HTML updated |
| CSS | `frontend/src/app.css` | ✅ WDS tokens applied |
| .env.example | `.env.example` | ✅ All variables documented |

### Architecture Requirements

- **Backend:** Python 3.14, FastAPI 0.135.1, SQLAlchemy 2.0+, Pydantic v2.10+, Alembic
- **Frontend:** TypeScript, SvelteKit 2.21+, Svelte 5, Vite 6
- **Database:** SQLite with JSON1 extension, `./data` volume
- **Design System:** Nunito (display), Inter (body), #6C5CE7 primary, #F8F6FF background

### Project Structure Notes

Project structure matches architecture requirements. No conflicts detected.

### References

- [Source: _bmad-output/D-Design-System/00-design-system.md] — Design tokens
- [Source: _bmad-output/planning-artifacts/architecture.md] — Tech stack, conventions
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1] — Story requirements
- [Source: backend/main.py] — FastAPI app with health checks
- [Source: frontend/src/app.css] — WDS design tokens

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Backend was already running on port 8000 — killed and restarted with updated code
- Infrastructure tests failed initially because ci.yml was renamed to test.yml — updated test references

### Completion Notes List

- Added `GET /health` endpoint returning `{"status": "ok"}` (kept existing `GET /` for backward compat)
- Replaced entire `app.css` with WDS Phase 4 design tokens (76 CSS variables)
- Added legacy compat aliases so existing components don't break
- Added Google Fonts (Nunito + Inter) with preconnect in app.html
- Documented all SAKAPUSS_* env vars in .env.example
- Updated infrastructure tests to reference test.yml instead of deleted ci.yml
- Added quality-gate and security job assertions to CI tests
- All 12 tests pass (3 health + 9 infrastructure)

### Change Log

- 2026-04-09: Story 1.1 implemented — health endpoint, WDS CSS tokens, .env.example, test updates

### File List

- `backend/main.py` — Added `/health` endpoint
- `frontend/src/app.css` — Complete rewrite with WDS design tokens
- `frontend/src/app.html` — Added Google Fonts import (Nunito + Inter)
- `.env.example` — Documented all SAKAPUSS_* environment variables
- `tests/api/health.spec.ts` — Added `/health` endpoint test, updated root test
- `tests/api/infrastructure-docker.spec.ts` — Updated ci.yml→test.yml refs, added security+quality-gate assertions
