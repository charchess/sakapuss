---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests']
lastStep: 'step-04-generate-tests'
lastSaved: '2026-03-04'
---

# ATDD Checklist - Epic 1, Story 1.1: Initialisation de l'Architecture & Squelette Backend

**Date:** 2026-03-04
**Author:** Murat (Master Test Architect)
**Primary Test Level:** API/Integration

---

## Story Summary

Initialisation technique du projet incluant FastAPI, SQLAlchemy, Alembic et Docker pour poser les bases du backend Sakapuss.

**As a** Developer
**I want** to set up the FastAPI server, SQLAlchemy ORM, Alembic migrations, and Docker configuration
**So that** I have a functional and deployable backend foundation.

---

## Acceptance Criteria

1. Le serveur FastAPI démarre sans erreurs (via docker-compose).
2. La documentation OpenAPI est accessible à /docs.
3. Alembic est initialisé et prêt pour les migrations.

---

## Step 3: Test Strategy Complete

### Test Scenarios Matrix

| Scenario | Level | Priority | Expected Failure Reason |
|---|---|---|---|
| Backend Health Check (GET /) | API | P0 | Connection Refused / 404 |
| OpenAPI Docs Access (GET /docs) | E2E | P1 | 404 Not Found |
| Database Connectivity Check | Integration | P0 | SQLAlchemy Connection Error |
| Alembic Setup Validation | Unit/CLI | P2 | Alembic Not Initialized |

---

## Failing Tests Created (RED Phase)

### API Tests (2 tests)

**File:** `tests/api/health.spec.ts`

- ✅ **Test:** [P0] should return 200 OK on health check endpoint
  - **Status:** RED - Expected 200 but code not implemented.
  - **Verifies:** Root connectivity of FastAPI.
- ✅ **Test:** [P0] should verify database connectivity
  - **Status:** RED - Expected 200 but DB not initialized.
  - **Verifies:** Backend ↔ SQLite link.

### E2E Tests (2 tests)

**File:** `tests/e2e/infrastructure.spec.ts`

- ✅ **Test:** [P1] should access OpenAPI documentation
  - **Status:** RED - 404/Connection Refused.
  - **Verifies:** Swagger UI availability.
- ✅ **Test:** [P2] should verify Alembic migrations readiness
  - **Status:** RED - Element not found.
  - **Verifies:** CLI/Admin migration status visibility.

---

## TDD Red Phase Validation: PASS
- All tests use `test.skip()`.
- All tests assert expected behavior (no placeholders).
- All tests correctly document intentional failure before implementation.
