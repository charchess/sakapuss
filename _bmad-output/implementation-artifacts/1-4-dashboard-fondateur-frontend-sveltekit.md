# Story 1.4: Dashboard Fondateur (Frontend SvelteKit)

## Status: done

## Story

As a User,
I want to see a list of my pets on the home screen of the application,
So that I can quickly select which animal's health I want to manage.

## Acceptance Criteria

- **Given** a running frontend and backend
- **When** I visit the home page
- **Then** I see a list of my pets displayed as cards
- **And** clicking a pet card navigates to the pet's profile page

## Tasks

### Task 1: Initialize SvelteKit
- [x] Add SvelteKit dependencies to package.json
- [x] Create svelte.config.js, vite.config.ts, tsconfig.json
- [x] Create src/app.html, src/app.css (Calm Health theme)
- [x] Configure Vite proxy for API calls to backend

### Task 2: Build Dashboard Page
- [x] Create src/routes/+page.ts (load function fetching /pets)
- [x] Create src/routes/+page.svelte (pet cards grid)
- [x] Responsive grid layout, Indigo/Emerald theme, vanilla CSS

### Task 3: Build Pet Profile Page
- [x] Create src/routes/pets/[id]/+page.ts (load function)
- [x] Create src/routes/pets/[id]/+page.svelte (profile view)
- [x] Back link to dashboard

### Task 4: Update Test Fixtures
- [x] Update seedPet fixture to call real API (POST /pets)
- [x] Add cleanup (DELETE /pets/{id}) in afterEach

### Task 5: Verify E2E Tests
- [x] Unskip dashboard.spec.ts tests
- [x] Both tests pass GREEN
