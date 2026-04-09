# Story 1.3: User Login + JWT Authentication + Session Persistence

Status: ready-for-dev

## Story

As Camille,
I want to log in with my email and password and stay logged in across browser sessions,
So that I do not have to re-enter my credentials every time I open Sakapuss.

## Acceptance Criteria

1. **Given** the login page at `/login`, **When** Camille enters valid email + password, **Then** JWT returned, redirected to dashboard
2. **Given** Camille closes the browser, **When** she reopens within 7 days, **Then** session auto-restored
3. **Given** invalid credentials, **Then** generic error "Invalid email or password" (no info leak)
4. **Given** unauthenticated access to protected page, **Then** redirect to /login?redirect=original_path

## Tasks / Subtasks

- [ ] Task 1: Backend — Login endpoint (AC: #1, #3)
  - [ ] 1.1: Add POST /auth/login to auth.py (verify password, return JWT)
  - [ ] 1.2: Generic error on invalid credentials (401, no email/password hint)
- [ ] Task 2: Frontend — Login page (AC: #1, #2, #3, #4)
  - [ ] 2.1: Create /login page with email + password + submit
  - [ ] 2.2: Store token in localStorage on success, redirect to / or ?redirect param
  - [ ] 2.3: Display generic error on failure
  - [ ] 2.4: Add auth guard — redirect unauthenticated to /login?redirect=
- [ ] Task 3: Tests (AC: all)
  - [ ] 3.1: Un-skip login tests in auth.spec.ts
  - [ ] 3.2: Regression check

## Dev Notes

- Auth infrastructure (User model, bcrypt, JWT, /auth/register, /auth/me) exists from Story 1.2
- Need to add verify_password + login endpoint
- Frontend auth guard can be in +layout.ts or a wrapper

### File List
