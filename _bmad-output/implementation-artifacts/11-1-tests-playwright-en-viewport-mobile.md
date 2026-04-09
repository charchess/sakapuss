---
story_id: "11.1"
story_key: "11-1-tests-playwright-en-viewport-mobile"
epic: 11
status: ready-for-dev
created: 2026-04-07
---

# Story 11.1: Tests Playwright en Viewport Mobile

## User Story

As a Developer,
I want Playwright E2E tests to run in a mobile viewport,
So that regressions on mobile layout are caught automatically.

## Status

La config Playwright a déjà un projet `mobile-chrome` (Pixel 5, 393×851px).
Les tests de navigation de base passent en mobile.
Fichier de tests mobiles spécifiques: `tests/e2e/mobile-responsive.spec.ts` (NEW).

## Definition of Done

- [x] Projet `mobile-chrome` existe dans playwright.config.ts (déjà fait)
- [x] Tests dashboard passent en mobile (fixé dashboard.spec.ts)
- [x] Tests mobile-responsive.spec.ts créés et verts
