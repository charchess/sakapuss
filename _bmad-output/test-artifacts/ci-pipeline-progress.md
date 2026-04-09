---
stepsCompleted: ['step-01-preflight', 'step-02-generate-pipeline', 'step-03-configure-quality-gates']
lastStep: 'step-03-configure-quality-gates'
lastSaved: '2026-04-09'
---

# CI Pipeline Setup — Sakapuss

## Preflight Results

| Check | Result |
|-------|--------|
| Git repository | ✅ `.git/` present |
| Remote | ✅ `origin → github.com/charchess/sakapuss.git` |
| Stack type | **fullstack** (SvelteKit + FastAPI) |
| CI platform | **GitHub Actions** (`.github/workflows/ci.yml` found) |
| Node version | v24.0.0 (`.nvmrc`) |
| Python version | 3.12 (requirements.txt targets 3.14 — CI uses 3.12 for compatibility) |
| Playwright config | ✅ `frontend/playwright.config.ts` (3 projects: api, chromium, mobile-chrome) |
| Backend test framework | pytest (to be installed in CI) |
| Existing CI | `ci.yml` — basic backend + E2E, no API tests, no quality gates |

## Pipeline Generated

**File:** `.github/workflows/test.yml`

### Pipeline Stages

| Stage | Job | Purpose | Runs On |
|-------|-----|---------|---------|
| 1 | `lint` | Ruff (Python lint+format), svelte-check (TS), npm audit, pip audit | Every push/PR |
| 2 | `backend-tests` | pytest with coverage reporting | After lint |
| 3 | `api-tests` | Playwright API project (the missing piece!) | After lint |
| 4 | `e2e-tests` | Playwright chromium + mobile-chrome (matrix) | After backend + API |
| 5 | `burn-in` | 5-iteration flaky detection | PRs only, after E2E |
| 6 | `quality-gate` | Gate decision: all stages must pass | Always |

### Quality Gates

| Gate | Condition | Level |
|------|-----------|-------|
| Lint pass | Ruff + svelte-check + npm audit + pip audit | P0 — blocks merge |
| Backend tests pass | pytest --cov | P0 — blocks merge |
| API tests pass | Playwright --project=api | P0 — blocks merge |
| E2E tests pass | Playwright chromium + mobile | P1 — blocks merge |
| Burn-in stable | 5/5 iterations pass | P1 — warns on failure (PRs only) |

### Improvements Over Existing ci.yml

| What | Before | After |
|------|--------|-------|
| API tests | Not run in CI | ✅ Dedicated `api-tests` job |
| Node version | 20 | 24 (matches .nvmrc) |
| Lint | None | ✅ Ruff + svelte-check |
| Security | None | ✅ npm audit + pip audit (NFR12) |
| Coverage | None | ✅ pytest --cov with XML report |
| E2E sharding | Single job | ✅ Matrix (chromium + mobile parallel) |
| Burn-in | None | ✅ 5x flaky detection on PRs |
| Quality gate | Implicit | ✅ Explicit gate job with decision |
| Concurrency | None | ✅ Cancel-in-progress on same ref |
| Artifacts | Playwright report only | ✅ Backend + API + E2E reports |
