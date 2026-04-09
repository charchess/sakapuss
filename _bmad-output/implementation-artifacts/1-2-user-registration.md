# Story 1.2: User Registration (Email + Password)

Status: review

## Story

As Camille,
I want to create an account with my email and password on a registration page,
So that I have a personal space to track my animals' health.

## Acceptance Criteria

1. **Given** the registration page at `/register`, **When** Camille enters a valid email, password (min 8 chars), and confirmation, **Then** a new user record is created in `users` table (id, email, hashed_password, display_name, language, created_at), password hashed with bcrypt, auto-logged in and redirected to dashboard
2. **Given** the registration page, **When** Camille enters a duplicate email, **Then** inline error "An account with this email already exists"
3. **Given** the registration page, **When** Camille submits with invalid email/short password/mismatch, **Then** client-side validation shows specific errors, submit button disabled until valid

## Tasks / Subtasks

- [x] Task 1: Backend — Users model + migration (AC: #1)
  - [x] 1.1: Added `bcrypt` and `python-jose[cryptography]` to requirements.txt
  - [x] 1.2: Created User model (id UUID, email unique indexed, hashed_password, display_name, language, timestamps)
  - [x] 1.3: Created `backend/app/modules/users/__init__.py`
  - [x] 1.4: Created Alembic migration `83794c31fa4d_create_users_table` (depends on c3d4e5f6a7b8)
  - [x] 1.5: Migration applied, users table + ix_users_email index created
- [x] Task 2: Backend — Auth service + JWT (AC: #1)
  - [x] 2.1: Added jwt_secret, jwt_algorithm, jwt_expiry_days to config.py
  - [x] 2.2: Created auth.py with hash_password (bcrypt), verify_password, create_access_token, decode_token, get_current_user + get_optional_user dependencies
  - [x] 2.3: Created schemas.py (UserCreate, UserResponse, TokenResponse)
  - [x] 2.4: Created service.py (create_user, get_user_by_email)
- [x] Task 3: Backend — Registration endpoint (AC: #1, #2)
  - [x] 3.1: Created POST /auth/register — creates user, returns JWT + user profile (201)
  - [x] 3.2: Duplicate email returns 409 with detail message
  - [x] 3.3: Router registered in main.py
  - [x] 3.4: GET /auth/me returns current user from JWT (401 without token)
- [x] Task 4: Frontend — Registration page (AC: #1, #2, #3)
  - [x] 4.1: Created /register page with email, password, confirm password fields + cat SVG logo
  - [x] 4.2: Client-side validation: email regex, password ≥ 8, match check, submit disabled
  - [x] 4.3: POST /auth/register → stores JWT in localStorage → redirects to /
  - [x] 4.4: Server error display (409 duplicate, validation errors) + inline field errors
- [x] Task 5: Tests — un-skip ATDD tests + verify (AC: all)
  - [x] 5.1: Un-skipped auth registration tests — 5/5 passed
  - [x] 5.2: E2E registration tests remain skipped (needs frontend server running)
  - [x] 5.3: Regression suite: 24/24 passed (health + infra + auth + pets-crud), 0 regressions

## Dev Notes

### Nothing Exists — Build From Scratch

No auth system, no users table, no JWT, no bcrypt in the project. Everything must be created.

### Architecture Requirements

- **Password hashing:** bcrypt via `passlib[bcrypt]` or direct `bcrypt` package
- **JWT:** `python-jose[cryptography]` for token creation/validation
- **User model:** SQLAlchemy model in `backend/app/modules/users/`
- **Auth router:** `backend/app/api/auth.py` mounted at `/auth`
- **Migration:** New Alembic migration depending on latest (`c3d4e5f6a7b8`)
- **Frontend:** SvelteKit page at `/register`, WDS design tokens, Inter/Nunito fonts
- **Naming:** snake_case API, PascalCase components, camelCase JS vars

### Migration Note

Do NOT try to reorder existing migrations. Create a new migration that depends on the latest one (`c3d4e5f6a7b8_create_bowls_servings`). The users table doesn't have FKs to/from other tables yet.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md] — API conventions, auth strategy
- [Source: backend/app/core/config.py] — Pydantic Settings pattern to follow
- [Source: backend/app/modules/pets/] — Model/schema/service pattern to follow
- [Source: tests/api/auth.spec.ts] — ATDD tests to un-skip
- [Source: tests/e2e/auth-registration.spec.ts] — E2E tests to un-skip

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
