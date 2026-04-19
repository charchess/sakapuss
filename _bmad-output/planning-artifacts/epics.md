---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "planning-artifacts/prd.md"
  - "planning-artifacts/architecture.md"
  - "planning-artifacts/architecture-sprint2-addendum.md"
  - "planning-artifacts/ux-design-specification.md"
  - "A-Product-Brief/project-brief.md"
  - "B-Trigger-Map/00-trigger-map.md"
  - "C-UX-Scenarios/00-ux-scenarios.md"
  - "C-UX-Scenarios/01-camille-s-installe/"
  - "C-UX-Scenarios/02-camille-note-une-action/"
  - "C-UX-Scenarios/03-camille-valide-un-rappel/"
  - "C-UX-Scenarios/04-camille-consulte-l-historique/"
  - "C-UX-Scenarios/05-camille-invite-thomas/"
  - "C-UX-Scenarios/06-thomas-note-une-observation/"
  - "C-UX-Scenarios/07-camille-partage-avec-le-vet/"
  - "C-UX-Scenarios/08-dr-martin-consulte-un-dossier/"
  - "D-Design-System/00-design-system.md"
  - "_progress/00-design-log.md"
---

# Sakapuss - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sakapuss, decomposing the requirements from the PRD, Architecture, UX Design Specification, and WDS Phase 4 artifacts into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Pet profiles with CRUD operations + profile photo support
FR2: Weight tracking with temporal line chart + trend indicator
FR3: Vaccine & Medical Records tracking + next due date auto-calculation
FR4: Bidirectional HA Integration with native MQTT Discovery exposing button, sensor, binary_sensor entities
FR5: "1-Tap" Decision Tree UX with mobile-optimized visual icons for frequent events
FR6: Unified filterable timeline per animal (all event types)
FR7: Correlation Engine (Alpha) with basic rule-based detection between Food intake and Health symptoms
FR8: Behavioral journal with structured events + tags
FR9: Photo gallery with health event association + auto thumbnails
FR10: Litter box tracking with cleaning log and 1-tap entry + notable events
FR11: Food tracking with consumption estimate + low-stock HA alerts
FR12: Pet Onboarding UI with full CRUD forms — name + species mandatory, rest optional
FR13: Free-form Event Entry form with custom date and payload
FR14: Food Stock Management (Bag Lifecycle) with product catalog, bag states, estimated depletion
FR15: Bowl Management (Multi-bowl, Multi-location) with named bowls, 1-tap fill log
FR16: Water Tracking with volume-based tracking and consumed volume estimation
FR17: Inter-Animal Relations with relational events between animals
FR18: Enhanced Multi-Animal Navigation with quick animal switcher
FR-CON-01: System MUST support MQTT Discovery (Home Assistant standard)
FR-CON-02: System MUST expose one button entity per active health reminder per animal
FR-UX-01: Mobile dashboard MUST feature a "Fast-Action" grid for P0 events
FR-UX-02: Fast-Action events MUST be loggable in under 3 interactions (taps)
FR-UX-03: Pet creation/edit MUST be accessible from the dashboard UI
FR-UX-04: Bowl filling MUST be achievable in 2 taps
FR-INT-01: Correlation engine MUST analyze timeline for "Food Change" events within 72h of "Digestive Symptom" logs
FR-INT-02: System MUST support configurable food types (not hardcoded)

### NonFunctional Requirements

NFR-LEG-01: Medical Disclaimer on all analysis views and reports
NFR-PER-01: API response time under 200ms for 95th percentile
NFR-PER-02: MQTT command processing latency under 1s
NFR1: Zero missed treatments after 1 month of use
NFR2: HA Responsiveness — validation latency < 5s
NFR3: Average time to log Litter/Food event < 10s
NFR4: Weight recorded within 24h of weigh-in > 90%
NFR5: Independent consultation without help < 7 days
NFR6: Vet utility — complete history readable < 30 seconds
NFR7: MQTT Availability — 99.9% uptime
NFR8: Discovery Compliance — 100% auto-discovered
NFR9: API response time (CRUD) < 200ms p95
NFR10: Page load (FCP) < 1.5s
NFR11: Test coverage > 70% backend, > 50% frontend
NFR12: Zero critical vulnerabilities

### Additional Requirements

- Stack: TypeScript (Frontend), Python 3.14 (Backend)
- Frameworks: SvelteKit 2.53.0, FastAPI 0.135.1, SQLAlchemy 2.0+, Pydantic v2.10+, Alembic
- Database: SQLite with JSON1 extension
- Single Docker container with docker-compose.yml
- HA Add-on support with Ingress Authentication (X-Has-User-ID)
- MQTT 5.0 via gmqtt async client
- OAuth2 + JWT authentication
- Polymorphic Event model (type + payload JSONB)
- API: plural routes, snake_case, ISO 8601 UTC
- OpenAPI → TypeScript types via openapi-typescript
- Frontend: SvelteKit SPA, Svelte Stores, vanilla CSS with CSS Variables
- I18n: French (FR) and English (EN) from inception
- Naming: DB tables plural snake_case, components PascalCase

### UX Design Requirements

UX-DR1: Design token CSS variables (colors, spacing, typography, elevation, border-radius)
UX-DR2: 8-category color mapping
UX-DR3: Spacing scale (space-2xs through space-3xl)
UX-DR4: Typography hierarchy (Nunito display + Inter default)
UX-DR5: Quick Action Tile component (organic shapes, category gradients)
UX-DR6: Reminder Card component (left color bar by status)
UX-DR7: Animal Avatar component (sm/md/lg, gradient bg, species fallback)
UX-DR8: Category Badge component (pill, category color)
UX-DR9: Confirmation Toast component (3s auto-dismiss, expandable)
UX-DR10: Bottom Navigation component (5 items, center + button)
UX-DR11–13: Dashboard + Quick Log Selection + Quick Log Confirmation
UX-DR14–15: Reminder List + Reminder Detail with celebration state
UX-DR16–17: Timeline with category filters + Weight Chart
UX-DR18: Animal Profile (hero card, weight, reminders, share CTA)
UX-DR19–23: Inscription, Add Animal, Onboarding Admin, Login, Settings
UX-DR24–26: Household Management, Thomas Onboarding, Thomas Dashboard
UX-DR27–30: Vet Share, Vet Landing, Vet Cabinet Dashboard, Patient Dossier
UX-DR31: All SVG line icons, no emojis
UX-DR32–33: Friction-proportional model, < 3s log time
UX-DR34: EN + FR translations
UX-DR35: Vet portal Activity hidden by default

### FR Coverage Map

FR1: Epic 2 — Pet CRUD + photo
FR2: Epic 5 — Weight chart + trend indicators
FR3: Epic 4 — Reminders lifecycle + auto-calculation
FR4: Epic 10 — MQTT Discovery + bidirectional validation
FR5: Epic 3 — Quick Log core loop
FR6: Epic 5 — Unified filterable timeline
FR7: Epic 9 — Correlation engine
FR8: Epic 9 — Behavioral journal with tags
FR9: Epic 9 — Photo gallery
FR10: Epic 3 — Litter tracking via Quick Log
FR11: Epic 8 — Food tracking + consumption estimation
FR12: Epic 2 — Pet onboarding UI
FR13: Epic 9 — Free-form event entry
FR14: Epic 8 — Bag lifecycle management
FR15: Epic 8 — Bowl management
FR16: Epic 8 — Water tracking
FR17: Epic 9 — Inter-animal relations (via behavioral journal)
FR18: Epic 6 — Multi-animal navigation + household
FR-CON-01: Epic 10 — MQTT Discovery
FR-CON-02: Epic 10 — Button entities per reminder
FR-UX-01: Epic 3 — Dashboard action grid
FR-UX-02: Epic 3 — Quick Log < 3 taps
FR-UX-03: Epic 2 — Pet creation from dashboard
FR-UX-04: Epic 8 — Bowl filling 2 taps
FR-INT-01: Epic 9 — 72h food↔health correlation
FR-INT-02: Epic 8 — Configurable food types

## Epic List

### Epic 1: Foundations & Sign-Up
Camille can create her account, log in, and access Sakapuss with a consistent visual experience. Technical foundation established through user-facing deliverables.
**FRs covered:** FR12, FR-UX-03
**Stories:** 1.1–1.5

### Epic 2: My Animals
Camille can add her animals (name + species), view their profile, upload a photo, edit or delete, and go through optional onboarding wizards.
**FRs covered:** FR1, FR12, FR18
**Stories:** 2.1–2.6

### Epic 3: The Core Loop — Quick Log
Camille can log an action in < 3 seconds from the Dashboard. THE differentiator.
**FRs covered:** FR5, FR-UX-01, FR-UX-02, FR10, FR-UX-04
**Stories:** 3.1–3.6

### Epic 4: Reminders & Lifecycle
Camille configures health reminders, validates with Done/Postpone, sees next reminder auto-planned. The "moment de vérité."
**FRs covered:** FR3
**Stories:** 4.1–4.4

### Epic 5: Timeline & History
Camille views history in a filterable chronological feed. Anomalies surfaced proactively. Weight chart with trends.
**FRs covered:** FR6, FR2, FR8
**Stories:** 5.1–5.5

### Epic 6: Multi-User Household
Camille invites Thomas with access profile (Total/Saisie/Consultation). Thomas logs actions with reduced dashboard.
**FRs covered:** FR18
**Stories:** 6.1–6.4

### Epic 7: Veterinarian Sharing
Camille generates a permanent revocable link. Dr. Martin sees the dossier without an account. Optional practice portal.
**FRs covered:** FR6 (filtered view)
**Stories:** 7.1–7.5

### Epic 8: Food & Household Resources
Management of food products, bag lifecycle, named bowls, serving logs, consumption estimation, water tracking.
**FRs covered:** FR11, FR14, FR15, FR16, FR-INT-02, FR-UX-04
**Stories:** 8.1–8.6

### Epic 9: Intelligence & Correlations
Correlation engine, photo gallery, behavioral journal, analytics insights.
**FRs covered:** FR7, FR8, FR9, FR13, FR-INT-01
**Stories:** 9.1–9.5

### Epic 10: Home Assistant & MQTT
Bidirectional HA integration: MQTT Discovery, voice validation, proactive notifications, stock alerts.
**FRs covered:** FR4, FR-CON-01, FR-CON-02
**Stories:** 10.1–10.5

---

## Epic 1: Foundations & Sign-Up

Camille can create an account, log in, and access Sakapuss with a consistent visual experience. The technical foundation (FastAPI, SvelteKit, Docker, SQLite, Alembic) is established through user-facing deliverables so that every story ships visible value.

### Story 1.1: Project Scaffolding + Docker + First Endpoint

As a developer,
I want to run `docker compose up` and see a running Sakapuss application with a health-check endpoint and a SvelteKit welcome page,
So that I have a verified, reproducible development environment to build upon.

**Acceptance Criteria:**

**Given** a freshly cloned repository with Docker and Docker Compose installed
**When** I run `docker compose up --build`
**Then** the FastAPI backend starts and responds with `{"status": "ok"}` at `GET /api/health`
**And** the OpenAPI documentation is accessible at `/api/docs`
**And** the SvelteKit frontend serves a welcome page at `http://localhost:5173` (dev) or port 80 (production)
**And** Alembic is initialized with an empty migration history

**Given** the containers are running
**When** I stop and restart them with `docker compose down && docker compose up`
**Then** the SQLite database file persists in the mounted `./data` volume
**And** the `/media` volume is mounted and writable

**Given** the backend container
**When** I inspect the project structure
**Then** FastAPI uses SQLAlchemy 2.0+ with async-compatible session management
**And** Pydantic v2 is installed and configured for schema validation
**And** the `.env.example` file documents all required environment variables

### Story 1.2: User Registration (Email + Password)

As Camille,
I want to create an account with my email and password on a registration page,
So that I have a personal space to track my animals' health.

**Acceptance Criteria:**

**Given** the registration page at `/register`
**When** Camille enters a valid email, a password (minimum 8 characters), and a password confirmation
**Then** a new user record is created in the `users` table (id, email, hashed_password, display_name, language, created_at)
**And** the password is hashed with bcrypt before storage
**And** Camille is automatically logged in and redirected to the dashboard
**And** the total registration flow completes in under 30 seconds

**Given** the registration page
**When** Camille enters an email that is already registered
**Then** the form displays an inline error message: "An account with this email already exists"
**And** no duplicate user record is created

**Given** the registration page
**When** Camille submits the form with mismatched passwords or an invalid email format
**Then** client-side validation shows specific error messages before the form is submitted
**And** the submit button remains disabled until all validations pass

### Story 1.3: User Login + JWT Authentication + Session Persistence

As Camille,
I want to log in with my email and password and stay logged in across browser sessions,
So that I do not have to re-enter my credentials every time I open Sakapuss.

**Acceptance Criteria:**

**Given** the login page at `/login`
**When** Camille enters a valid email and password
**Then** the API at `POST /api/auth/login` returns a JWT access token (expiry: 7 days)
**And** Camille is redirected to the dashboard

**Given** Camille is logged in and closes the browser
**When** she reopens Sakapuss within 7 days
**Then** her session is automatically restored from the persisted token

**Given** the login page
**When** Camille enters an incorrect password or a non-existent email
**Then** a generic error message is displayed: "Invalid email or password"
**And** no information is leaked about whether the email exists

**Given** any protected page
**When** an unauthenticated user tries to access it directly via URL
**Then** they are redirected to `/login` with a `?redirect=` parameter
**And** after successful login, they are redirected to the originally requested page

### Story 1.4: Design System CSS Foundation

As Camille,
I want the application to have a consistent, polished visual appearance with readable fonts and calm health-oriented colors,
So that the interface feels trustworthy and easy to use on my phone.

**Acceptance Criteria:**

**Given** the SvelteKit application
**When** any page loads
**Then** design tokens are defined as CSS custom properties in a global `tokens.css` file including:
- Brand colors (`--color-primary: #6C5CE7`, `--color-secondary: #00CEC9`, etc.)
- Neutral palette (`--color-bg: #F8F6FF`, `--color-surface: #FFFFFF`, etc.)
- Semantic colors (`--color-success: #00B894`, `--color-warning: #FDCB6E`, `--color-error: #E17055`)
- Category colors for all 8 categories
- Spacing scale (`--space-xs` through `--space-3xl`)
- Border radius scale, elevation shadows
**And** Nunito (display/headings) and Inter (body/UI) fonts are loaded

**Given** the CSS foundation
**When** the page is viewed on a 375px-wide mobile viewport
**Then** horizontal page padding uses `--space-lg` (16px)
**And** no horizontal scrollbar appears
**And** minimum touch target size is 48×48px for all interactive elements

### Story 1.5: Settings Page (Account, Language, Notifications)

As Camille,
I want to access a settings page where I can update my account info, choose my preferred language (French or English), and configure notification preferences,
So that Sakapuss adapts to my needs and communicates in my language.

**Acceptance Criteria:**

**Given** Camille is logged in and navigates to `/settings`
**When** the settings page loads
**Then** she sees three sections: Account Information, Language Preference, and Notification Preferences

**Given** the Language Preference section
**When** Camille selects "Francais" or "English"
**Then** the preference is saved to the user record
**And** the UI labels and system messages switch to the selected language
**And** the i18n system uses JSON translation files for `en` and `fr`

**Given** the i18n foundation
**When** a developer adds a new UI string
**Then** they add keys to both `en.json` and `fr.json` translation files
**And** a helper function `t('key')` is available in all Svelte components

---

## Epic 2: My Animals

Camille can add her animals (name + species), view their profile, upload a photo, edit or delete them, and optionally configure health reminders, initial weight, and food resources through a guided onboarding flow.

### Story 2.1: Pet CRUD API

As Camille,
I want to manage my animals' profiles through the application,
So that each of my pets has a dedicated identity in Sakapuss.

**Acceptance Criteria:**

**Given** the backend API
**When** a `POST /api/pets` request is sent with `{"name": "Pixel", "species": "cat"}`
**Then** a new pet record is created in the `pets` table with columns: id, user_id, name, species, breed (nullable), birth_date (nullable), sterilized (nullable), microchip (nullable), vet_name (nullable), vet_phone (nullable), photo_path (nullable), created_at, updated_at

**Given** an existing pet belonging to Camille
**When** a `GET /api/pets` request is sent with Camille's JWT
**Then** the API returns only Camille's pets

**Given** an existing pet
**When** a `PATCH /api/pets/{id}` request is sent with updated fields
**Then** only the provided fields are updated and `updated_at` is refreshed

**Given** an existing pet
**When** a `DELETE /api/pets/{id}` request is sent
**Then** the pet record is removed and subsequent GET no longer includes it

### Story 2.2: Add Animal Page

As Camille,
I want to add my animals one by one through a friendly form with name and species as mandatory fields,
So that I can quickly set up all my pets without being overwhelmed.

**Acceptance Criteria:**

**Given** the Add Animal page at `/pets/new`
**When** the page loads
**Then** Camille sees: Name input, Species icon selector (cat/dog/other), and optional details collapsed behind "Add details"

**Given** Camille has entered a name and selected a species
**When** she taps "Save"
**Then** the pet is created and she sees two options: "Add another animal" and "Done"
**And** previously added animals appear as chips at top

**Given** Camille taps "Done"
**When** this is her first time adding animals
**Then** she is redirected to the onboarding flow (Story 2.6)

### Story 2.3: Animal Profile Page

As Camille,
I want to see a complete profile page for each animal with identity and key health info at a glance,
So that I can quickly review my pet's status.

**Acceptance Criteria:**

**Given** Camille navigates to `/pets/{id}`
**When** the profile page loads
**Then** a hero identity card displays: avatar (photo or species icon fallback), name, species, breed, age
**And** below: Weight summary placeholder, Recent activity placeholder, "Share with vet" CTA placeholder

### Story 2.4: Edit & Delete Animal

As Camille,
I want to edit my animal's information or delete the profile,
So that I can keep data accurate or remove an animal.

**Acceptance Criteria:**

**Given** Camille navigates to `/pets/{id}/edit`
**When** the page loads
**Then** all fields are pre-filled with current data

**Given** Camille taps "Delete this animal"
**When** a confirmation modal appears and she confirms
**Then** the pet is deleted and she is redirected to the dashboard

### Story 2.5: Photo Upload

As Camille,
I want to upload a photo for my animal by tapping the camera icon on the profile,
So that I can visually identify my pets.

**Acceptance Criteria:**

**Given** the animal profile page
**When** Camille taps the camera icon and selects a valid image (JPEG/PNG/WebP, < 5MB)
**Then** the image is uploaded via `POST /api/pets/{id}/photo`
**And** a thumbnail (150×150px) is generated server-side using Pillow
**And** the avatar immediately reflects the uploaded photo

### Story 2.6: Onboarding Flow

As Camille,
I want to be guided through optional configuration wizards after adding my first animal,
So that Sakapuss is immediately useful with reminders and baselines.

**Acceptance Criteria:**

**Given** Camille has just added her first animal(s) and tapped "Done"
**When** she is redirected to `/onboarding`
**Then** she sees 3 optional wizards: Health Reminders (toggles for vaccine/deworming/flea, each skippable), Weight (current weight input), Food & Resources (name food bowls/litter boxes)

**Given** Camille completes or skips all 3 wizards
**When** she reaches the end
**Then** a celebration screen appears with the pet name and a "Go to Dashboard" button
**And** the onboarding is marked as completed (does not re-appear)

---

## Epic 3: The Core Loop — Quick Log

Camille can log a daily action in under 3 seconds from the Dashboard. Action grid → instant selection → auto-save confirmation with undo. Friction proportional to action frequency.

### Story 3.1: Events Polymorphic System

As Camille,
I want my logged actions stored as structured events with flexible payloads,
So that Sakapuss can record any type of observation in a unified timeline.

**Acceptance Criteria:**

**Given** the backend API
**When** a `POST /api/events` request is sent with `{"pet_id": 1, "type": "litter_clean", "payload": {"status": "ras"}}`
**Then** a new event record is created in the `events` table (id UUID, pet_id FK, type string, timestamp ISO 8601, payload JSON, resource_id nullable FK, created_by FK, created_at)

**Given** the events API
**When** a `GET /api/pets/{id}/events` request is sent
**Then** events are returned sorted by timestamp descending with optional `type`, `limit`, `offset` filters

**Given** an existing event
**When** a `DELETE /api/events/{id}` request is sent by the creator
**Then** the event is deleted (enables "undo" in Story 3.5)

### Story 3.2: Bottom Navigation Component

As Camille,
I want a persistent bottom navigation bar with quick access to Home, Timeline, Quick Log (+), Reminders, and Profile,
So that I can navigate the app with one hand.

**Acceptance Criteria:**

**Given** any authenticated page
**When** the page renders
**Then** a bottom nav bar is visible with 5 items: Home, Timeline, + (center), Reminders, Profile
**And** the center + button is 48px, `--color-primary` background, white icon
**And** active item is filled with `--color-primary`, inactive is `--color-text-muted` outline
**And** all icons are SVG line style (stroke-width 2)

### Story 3.3: Dashboard Page

As Camille,
I want to see my pet's profile, a grid of quick actions, and recent activity as soon as I open Sakapuss,
So that I can immediately log an action.

**Acceptance Criteria:**

**Given** Camille is logged in and navigates to `/`
**When** the page loads
**Then** a hero card shows the selected pet: avatar, name, first-person speech bubble
**And** the Action Garden displays a 3-column grid of Quick Action Tiles with organic rounded shapes, category-specific gradients, and SVG line icons
**And** each tile has its own shape variation and colored shadow
**And** a "Recent Activity" section shows the last 3 events
**And** if multiple pets, an animal switcher appears (horizontal chips)

### Story 3.4: Quick Log Selection (Bottom Sheet)

As Camille,
I want to select an action and the target animal in a fast bottom sheet that auto-skips unnecessary steps,
So that logging takes the minimum possible taps.

**Acceptance Criteria:**

**Given** Camille taps a Quick Action Tile and has only one pet
**When** the action is triggered
**Then** the animal selection is auto-skipped and the event is created immediately → proceeds to confirmation

**Given** Camille taps a Quick Action Tile and has multiple pets
**When** the bottom sheet opens
**Then** it shows Animal Avatar chips; tapping a chip creates the event → confirmation

**Given** Camille taps a litter or food action
**When** household resources exist for that type
**Then** a resource picker appears after animal selection

**Given** the entire flow
**When** measured end-to-end
**Then** total time for single-pet no-resource scenario is under 3 seconds (2 taps)

### Story 3.5: Quick Log Confirmation (Toast with Auto-Save)

As Camille,
I want immediate feedback after logging with a 3-second auto-save countdown and optional Note/Weight buttons,
So that I know my action was recorded and can optionally add detail.

**Acceptance Criteria:**

**Given** Camille has completed Quick Log Selection and the event was created
**When** the confirmation appears
**Then** a toast slides up showing: checkmark icon, action description, timestamp, 3-second countdown progress bar, ghost buttons (Note, Weight, Undo)

**Given** the toast is visible and Camille does nothing for 3 seconds
**When** the countdown completes
**Then** the toast auto-dismisses and the dashboard updates

**Given** Camille taps "Note"
**When** the toast expands
**Then** a text input appears, countdown pauses, she types and taps Save → event payload is updated via PATCH

**Given** Camille taps "Undo"
**When** the action triggers
**Then** the event is deleted via DELETE, toast dismisses, dashboard reverts

### Story 3.6: Household Resources Model

As Camille,
I want to name and manage shared household resources (litter boxes, food bowls),
So that when I log an action, I can specify which resource was involved.

**Acceptance Criteria:**

**Given** the backend API
**When** a `POST /api/resources` request is sent with `{"name": "Caisse cuisine", "type": "litter"}`
**Then** a resource record is created in the `resources` table (id, household_id, name, type enum, created_at)

**Given** the Settings page
**When** Camille navigates to "Household Resources"
**Then** she can add, edit, and delete resources grouped by type

**Given** resources are configured
**When** Quick Log Selection triggers for litter or food
**Then** matching resources appear as selectable chips

---

## Epic 4: Reminders & Lifecycle

Camille configures health reminders, receives notifications, validates with Done/Postpone, and sees the next reminder auto-planned. The "moment de vérité."

### Story 4.1: Reminders Model + CRUD API

As a pet owner,
I want to create and manage recurring health reminders for my pets,
So that the system can track when treatments are due and auto-calculate next occurrences.

**Acceptance Criteria:**

**Given** the backend API
**When** I send a POST to `/pets/{pet_id}/reminders` with type, name, frequency_days, and optional product
**Then** the reminder is created with `next_due_date` auto-calculated from today + frequency_days
**And** the response includes frequency_days, product, last_done_date, and computed status (pending/today/overdue/upcoming)

**Given** an existing reminder
**When** I call GET `/pets/{pet_id}/reminders`
**Then** each reminder includes computed `status`: "overdue" if next_due < today, "today" if next_due == today, "upcoming" otherwise

### Story 4.2: Reminder List Page

As a pet owner,
I want to see all my reminders organized by urgency (Today / Overdue / Upcoming),
So that I can immediately identify which care actions need attention.

**Acceptance Criteria:**

**Given** I navigate to `/reminders`
**When** the page loads
**Then** I see three segments: "Today" (expanded), "Overdue" (expanded, red accent, count badge), "Upcoming" (collapsible)
**And** each reminder is a card with: left color bar (green=today, red=overdue, yellow=upcoming), type icon, "{type} de {animal}", date, chevron

**Given** I tap on any reminder card
**When** the card is pressed
**Then** it navigates to `/reminders/{id}` (detail page)

### Story 4.3: Reminder Detail + Validation Page

As a pet owner,
I want to validate a reminder as "Done" or postpone it,
So that the system records my care and auto-plans the next occurrence.

**Acceptance Criteria:**

**Given** I navigate to `/reminders/{id}`
**When** the page loads
**Then** I see: animal context (avatar + first-person speech: "Mon vermifuge c'est aujourd'hui !"), info card (type, date, product, last done, frequency), pinned actions at bottom: "C'est fait ✓" (green) + "Reporter" (secondary)

**Given** I tap "C'est fait"
**When** the API call succeeds
**Then** a celebration state appears: checkmark animation, "{type} de {animal} ✓", "Prochain dans {frequency} — {next_date}"
**And** the server sets last_done_date = today, recalculates next_due_date, creates a timeline event

**Given** I tap "Reporter"
**When** the options expand
**Then** I see delay chips: "+3 jours", "+1 semaine", "+2 semaines"
**And** tapping a chip updates next_due_date and shows confirmation toast

### Story 4.4: Reminder Notifications

As a pet owner,
I want to receive notifications when a reminder is approaching, due, or overdue,
So that I never miss a critical treatment.

**Acceptance Criteria:**

**Given** a reminder due in 7 days (J-7)
**When** the daily notification check runs
**Then** an in-app notification is created and the Reminders tab badge increments

**Given** a reminder due today (J-0)
**When** the notification is generated
**Then** it links directly to the Reminder Detail page

**Given** an overdue reminder
**When** the daily check runs
**Then** escalation notifications repeat daily until validated or postponed
**And** overdue reminders never disappear silently

---

## Epic 5: Timeline & History

Camille views her animals' history in a filterable chronological feed. Anomalies surfaced proactively. Weight chart with trends. Animal profile becomes the single source of truth.

### Story 5.1: Timeline Page

As a pet owner,
I want to see a chronological feed of all logged entries grouped by day,
So that I can review my pets' care history and spot patterns.

**Acceptance Criteria:**

**Given** I navigate to `/timeline`
**When** the page loads
**Then** entries are displayed in reverse chronological order, grouped by day ("Aujourd'hui", "Hier", or formatted date)
**And** each entry: category-colored dot + vertical connector + description + pet avatar + timestamp
**And** weight entries show value + trend arrow linking to weight chart

**Given** I have multiple pets
**When** I look at the header
**Then** animal avatar selectors filter the feed to a single pet

### Story 5.2: Category Filter Pills

As a pet owner,
I want to filter the timeline by event category,
So that I can quickly find specific types of entries.

**Acceptance Criteria:**

**Given** the timeline page
**When** I look below the header
**Then** horizontal scrollable filter pills: "Tout" (active), "Poids", "Santé", "Alimentation", "Litière", "Comportement"
**And** each pill uses its category color (active = solid bg, inactive = 10% opacity bg)
**And** tapping a pill filters the feed

### Story 5.3: Weight Chart Page

As a pet owner,
I want to see my pet's weight plotted on a line chart with trend indicators,
So that I can visually track weight changes.

**Acceptance Criteria:**

**Given** I navigate to `/pets/{id}/weight` with at least 3 weight entries
**When** the page loads
**Then** weight summary: current weight, trend arrow (up/stable/down), change amount, trend duration
**And** SVG line chart with period selector (1S/1M/3M/6M/1A, default 3M), data point circles, gradient fill
**And** "Dernières pesées" list below with date, value, delta color-coded

### Story 5.4: Anomaly Detection Service

As a pet owner,
I want the system to automatically detect unusual health patterns,
So that I am proactively alerted to potential issues.

**Acceptance Criteria:**

**Given** a pet with at least 3 weight entries over 30 days
**When** the anomaly service runs (on new weight event or periodic)
**Then** if weight declined > 5% over 2 weeks, an anomaly record is created

**Given** an active anomaly
**When** I visit the Timeline
**Then** an anomaly banner appears: "{animal} a perdu {amount} en {duration}" with warning styling
**And** tapping it navigates to the Weight Chart

### Story 5.5: Animal Profile Completion

As a pet owner,
I want my pet's profile to show weight summary, active reminders, and recent activity,
So that I have a single source of truth for everything about my pet.

**Acceptance Criteria:**

**Given** I navigate to `/pets/{id}`
**When** the pet has weight data
**Then** Weight Summary section shows: current weight, trend arrow, "See chart" link

**Given** the pet has active reminders
**When** the profile loads
**Then** Active Reminders section lists compact Reminder Cards with status-colored bars

**Given** the pet has events
**When** the profile loads
**Then** Recent Activity shows the last 5 events with category badge, description, timestamp, and "See full history" link

**Given** the bottom of the profile
**Then** a prominent "Share with my vet" CTA button is visible (connects to Epic 7)

---

## Epic 6: Multi-User Household

Camille invites Thomas with an access profile. Thomas accepts and can log actions with his role-appropriate dashboard.

### Story 6.1: Household + Members Model

As a pet owner,
I want a household data model supporting multiple members with different access roles,
So that my partner can contribute to pet care tracking with appropriate permissions.

**Acceptance Criteria:**

**Given** Alembic migration runs
**Then** tables created: `households` (id, name, created_at), `household_members` (id, household_id FK, user_id FK nullable, email, role enum admin/input/readonly, status enum pending/active/revoked, invite_token, created_at)

**Given** the API
**When** I call `POST /households/{id}/invitations` with {email, role}
**Then** a pending member record is created with a unique invite_token

**Given** role-based permissions
**When** any API endpoint is called
**Then** admin: full CRUD + member management; input: create events + read all; readonly: read only

### Story 6.2: Household Management Page

As a household admin,
I want to view members, invite new ones, and manage pending invitations,
So that I can control who participates in pet care tracking.

**Acceptance Criteria:**

**Given** I navigate to `/settings/household`
**When** the page loads
**Then** I see member list with avatar, name, role label, status badge

**Given** I tap "Invite a member"
**When** the bottom sheet opens
**Then** I see email input + profile radio (Total/Saisie recommended/Consultation) with permission descriptions

### Story 6.3: Thomas Onboarding

As an invited household member,
I want to accept my invitation with minimal friction,
So that I can start contributing immediately.

**Acceptance Criteria:**

**Given** Thomas opens the invitation link `/invite/{token}`
**When** the page loads
**Then** he sees: household name, who invited him, role assigned, one-sentence explanation
**And** minimal account creation form (name, email pre-filled, password) with "Join" button

**Given** Thomas accepts
**When** the flow completes
**Then** he is redirected to the dashboard showing all household pets

### Story 6.4: Role-Based Dashboard

As a household member with a specific role,
I want my dashboard to reflect my access level,
So that I see only the actions I am permitted to perform.

**Acceptance Criteria:**

**Given** Thomas has "Saisie" role
**When** he views the dashboard
**Then** he sees a reduced 2×2 action grid (Litter, Food, Weight, Observation), no reminder management
**And** Bottom Navigation hides Reminders tab

**Given** a "Consultation" member
**When** they view the dashboard
**Then** read-only view: pet cards, timeline, no action grid, no "+" button

**Given** Thomas logs an event
**When** the event is created
**Then** it is attributed to Thomas (created_by) and appears in the shared timeline

---

## Epic 7: Veterinarian Sharing

Camille generates a permanent revocable link. Dr. Martin sees the dossier without an account. Optional practice portal.

### Story 7.1: Vet Access Links Model + API

As a pet owner,
I want to generate permanent revocable access links for my vet,
So that my vet can view my pet's health dossier without needing a Sakapuss account.

**Acceptance Criteria:**

**Given** Camille calls `POST /vet-shares` with {pet_ids, vet_email}
**When** the API processes the request
**Then** one `vet_access_links` record per pet is created with a cryptographic token
**And** the link URL `/vet/dossier/{token}` is returned

**Given** a valid non-revoked token
**When** anyone calls `GET /vet/dossier/{token}`
**Then** the API returns the pet's complete health data (no auth required)

**Given** Camille calls `DELETE /vet-shares/{id}`
**When** processed
**Then** revoked_at is set and subsequent calls return 410 Gone

### Story 7.2: Vet Share Page (Camille Side)

As a pet owner,
I want to select animals, enter my vet's email, and manage existing shares,
So that I control what my vet sees.

**Acceptance Criteria:**

**Given** I navigate to `/settings/vet-sharing`
**When** the page loads
**Then** I see "Active shares" section and "New share" form (animal multi-select + email input + preview toggle + "Send link" CTA)

**Given** active shares exist
**When** I view them
**Then** each shows vet email, animal badges, status pill, "Revoke" button

### Story 7.3: Vet Landing Page

As a vet who received a shared link,
I want to open it and immediately see the dossier without creating an account,
So that I can prepare for consultation with zero friction.

**Acceptance Criteria:**

**Given** Dr. Martin clicks `/vet/dossier/{token}`
**When** the page loads
**Then** the pet's dossier is displayed immediately: identity, weight chart, active reminders, medical timeline
**And** a non-blocking banner: "Create your practice portal" (dismissible)
**And** desktop-optimized layout, medical disclaimer at bottom

### Story 7.4: Vet Account + Cabinet Dashboard

As a vet,
I want to optionally create a practice portal,
So that I can access all my patients from a single searchable dashboard.

**Acceptance Criteria:**

**Given** Dr. Martin clicks "Create portal" from the landing banner
**When** he creates an account (name, email, password, practice name)
**Then** all existing shares with his email are linked to his account

**Given** Dr. Martin logs into `/vet/dashboard`
**When** the page loads
**Then** he sees: prominent search bar (auto-focus, type-ahead), "Patients with alerts" section, "Recent patients" cards
**And** desktop layout, keyboard navigation supported

### Story 7.5: Patient Dossier Page

As a vet with a portal account,
I want a two-column patient view with proactive alerts,
So that I can absorb the full medical picture in under 30 seconds.

**Acceptance Criteria:**

**Given** Dr. Martin clicks a patient from the dashboard
**When** the dossier loads at `/vet/patients/{pet_id}`
**Then** desktop two-column layout: left 35% (identity, quick stats, weight chart, reminders), right 65% (alerts at top + filtered timeline)

**Given** alerts exist
**When** the page loads
**Then** alert cards span full width: red border (weight decline), orange border (overdue treatment)

**Given** the timeline
**When** it loads
**Then** "Medical" filter is active by default (Activity hidden), "Show all" toggle available
**And** the entire page is read-only, no edit/delete controls

---

## Epic 8: Food & Household Resources

Comprehensive management of food products, bag lifecycles, named bowls, serving logs, consumption estimation, and water tracking.

### Story 8.1: Food Products Catalog

As a household member,
I want to create and manage a catalog of food products with configurable types and categories,
So that I can standardize the products I track.

**Acceptance Criteria:**

**Given** the backend API
**When** I POST to `/food/products` with name, brand, food_type, food_category, default_bag_weight_g
**Then** a product is created; food_type and food_category accept any user-provided string (not hardcoded enum)

**Given** the frontend
**When** I create or edit a product
**Then** previously used values appear as autocomplete suggestions

### Story 8.2: Bag Lifecycle Management

As a household member,
I want to track food bags through their lifecycle (stocked → opened → depleted),
So that I know my inventory and can manage multiple bags simultaneously.

**Acceptance Criteria:**

**Given** an existing food product
**When** I POST to `/food/bags` with product_id, weight_g, purchased_at
**Then** a bag is created with status `stocked`

**Given** a stocked bag
**When** I PATCH `/food/bags/{id}/open`
**Then** status transitions to `opened` and opened_at is set
**And** attempting to open an already-opened bag returns 409

**Given** an opened bag
**When** I PATCH `/food/bags/{id}/deplete`
**Then** status transitions to `depleted` and depleted_at is set

### Story 8.3: Bowl Management

As a household member,
I want to define named bowls with locations, capacities, and types (food/water),
So that I can track where and how my pets are fed.

**Acceptance Criteria:**

**Given** the backend API
**When** I POST to `/bowls` with name, location, capacity_g, bowl_type, optional current_product_id
**Then** a bowl is created; bowl_type accepts only "food" or "water"

**Given** bowl_type is "food"
**When** I create or edit it
**Then** a product selector allows linking to a food product from the catalog

### Story 8.4: Bowl Filling & Serving Log

As a household member,
I want to log each bowl filling with a single tap,
So that I can track per-animal food intake over time.

**Acceptance Criteria:**

**Given** a food bowl linked to a product with an opened bag
**When** I POST to `/servings` with bowl_id, optional pet_id, optional amount_g
**Then** a serving is created with bag_id auto-populated from the currently opened bag

**Given** the Quick Log interface
**When** I tap a food action for a specific pet
**Then** a serving is logged in one tap with pet and bowl pre-filled

### Story 8.5: Consumption Estimation & Low-Stock Alert

As a household member,
I want the system to estimate when my food bag will run out,
So that I can plan purchases in advance.

**Acceptance Criteria:**

**Given** an opened bag with at least 2 servings on different days
**When** I GET `/food/bags/{id}/estimate`
**Then** the response includes: daily_consumption_g, remaining_g, estimated_depletion_date

**Given** estimated remaining days < 5 (configurable threshold)
**When** the estimation is computed
**Then** `low_stock: true` is returned and the bag is flagged in the UI with a warning

### Story 8.6: Water Tracking

As a household member,
I want to track water bowl refills and estimate daily consumption,
So that I can monitor my pets' hydration.

**Acceptance Criteria:**

**Given** a water bowl with known capacity
**When** I log a refill via POST `/servings`
**Then** a serving is created with timestamp; consumed volume estimated as (capacity - remaining)

**Given** the Quick Log interface
**When** I tap a water bowl icon
**Then** a refill is logged with a single tap (full capacity default)

---

## Epic 9: Intelligence & Correlations

Free-form event entry, behavioral journaling, photo documentation, and correlation engine detecting food↔health patterns.

### Story 9.1: Free-Form Event Entry

As a pet owner,
I want to manually create any event type with a custom date and dynamic fields,
So that I can log vaccines, treatments, and notes beyond Quick Log shortcuts.

**Acceptance Criteria:**

**Given** a pet's profile page
**When** I click "Add Event"
**Then** a form shows: event type selector (vaccine, treatment, note, weight, etc.), date picker, dynamic payload fields

**Given** the type is "vaccine"
**When** I fill the form
**Then** dynamic fields: vaccine_name (required), batch_number, vet_name, frequency_days

**Given** a backdated event submission
**When** I submit with a past date
**Then** the event appears in the correct chronological position in the timeline

### Story 9.2: Behavioral Journal with Tags

As a pet owner,
I want to log behavioral observations using structured predefined tags,
So that patterns can be tracked and correlated.

**Acceptance Criteria:**

**Given** event type "behavior"
**When** I access the tag selector
**Then** I see a grid: vomiting, diarrhea, lethargy, high_appetite, low_appetite, excessive_thirst, scratching, sneezing, aggression, hiding, hyperactivity
**And** multiple tags can be selected simultaneously

**Given** behavioral events in the timeline
**When** filtered by type "behavior"
**Then** tags are displayed as colored chips on each event

### Story 9.3: Photo Gallery

As a pet owner,
I want to attach photos to health events and browse them in a gallery,
So that I can visually track conditions over time.

**Acceptance Criteria:**

**Given** an existing event
**When** I upload a photo via POST `/events/{id}/photo`
**Then** original stored in `/media/events/`, thumbnail (200×200px) auto-generated

**Given** the gallery page at `/pets/{id}/gallery`
**When** it loads
**Then** responsive grid of thumbnails sorted by date, clicking navigates to the original event

### Story 9.4: Correlation Engine

As a pet owner,
I want the system to detect links between food changes and digestive symptoms,
So that I receive proactive insights.

**Acceptance Criteria:**

**Given** a "food_change" event followed by a digestive symptom within 72 hours
**When** the correlation engine runs (async, on new event creation)
**Then** both events are flagged as correlated

**Given** correlated events in the timeline
**When** I view them
**Then** a visual link indicator appears with "Possible correlation" badge

**Given** active correlations for a pet
**When** I view the dashboard
**Then** an insight card appears: "Food change to [X] may be linked to [symptom] on [date]"

### Story 9.5: Analytics Insights Page

As a pet owner,
I want a monthly insights view summarizing health patterns,
So that I can review trends.

**Acceptance Criteria:**

**Given** a pet with at least 1 month of data
**When** I navigate to `/pets/{id}/insights`
**Then** monthly summary: event count by type, behavioral tag frequency, weight trend, correlations count

**Given** the free tier
**When** I view insights
**Then** quota indicator "2 of 2 monthly reports remaining"
**And** premium teaser (non-blocking, dismissible) when quota exhausted — Phase 2 placeholder

---

## Epic 10: Home Assistant & MQTT Integration

Bidirectional HA integration: MQTT Discovery, voice validation, proactive notifications, stock alerts.

### Story 10.1: MQTT Bridge Setup

As a system administrator,
I want the FastAPI backend to maintain a resilient async MQTT connection,
So that all HA integration features have a reliable channel.

**Acceptance Criteria:**

**Given** MQTT config via env vars (MQTT_BROKER_HOST, MQTT_BROKER_PORT, MQTT_USERNAME, MQTT_PASSWORD)
**When** the FastAPI app starts
**Then** gmqtt connects to the configured broker within the startup lifecycle

**Given** connection drops
**When** the disconnect fires
**Then** automatic reconnection with exponential backoff (1s→2s→4s, max 60s)

**Given** no MQTT broker configured (empty host)
**When** the app starts
**Then** MQTT bridge initializes in disabled mode without errors; features degrade gracefully

### Story 10.2: Home Assistant Discovery

As a system administrator,
I want Sakapuss to auto-register entities in HA via MQTT Discovery,
So that pet sensors and controls appear without manual YAML.

**Acceptance Criteria:**

**Given** an active MQTT connection and at least one pet
**When** the app completes startup
**Then** discovery payloads published to `homeassistant/{component}/sakapuss/{slug}/config` for each pet: `sensor` (last weight), `binary_sensor` (vaccine status), `button` (per active reminder)

**Given** a new pet is created after startup
**When** the creation completes
**Then** discovery payloads for the new pet are published immediately

### Story 10.3: Bidirectional Validation

As a pet owner using HA or voice,
I want to mark reminders as completed via MQTT commands,
So that I can validate care without opening the web app.

**Acceptance Criteria:**

**Given** MQTT bridge subscribed to `sakapuss/{pet_id}/command/#`
**When** a message arrives on `.../command/validate` with `{"reminder_id": "uuid", "action": "done"}`
**Then** the reminder is marked complete, a timeline event is created, confirmation published to `.../command/response`

**Given** validation via voice command
**When** HA translates to MQTT command
**Then** the bridge resolves pet by name slug and processes identically

### Story 10.4: Proactive Notifications

As a pet owner with HA,
I want automated notifications when treatments are approaching or overdue,
So that I am reminded through my home automation.

**Acceptance Criteria:**

**Given** a background task running every 6 hours
**When** it checks all active reminders
**Then** J-7 → anticipation notification, J-0 → same-day, overdue → escalation
**And** each published to `sakapuss/{pet_id}/notification` as JSON

**Given** deduplication
**When** the same urgency level was already notified
**Then** the notification is not re-sent; new notification only on urgency change

### Story 10.5: Stock Alerts via MQTT

As a pet owner with HA,
I want MQTT alerts when a food bag is running low,
So that HA automations can remind me to reorder.

**Acceptance Criteria:**

**Given** an opened bag with estimated depletion < 5 days
**When** the stock alert task runs
**Then** published to `sakapuss/food/stock_alert` with product_name, remaining_g, estimated_depletion_date, days_remaining
**And** binary_sensor entity updated to "low_stock"

**Given** no bags below threshold
**When** the task runs
**Then** binary_sensor state remains "ok"

---

## Sprint 6 — Mobile Autonome (Local-First)

**Date d'ajout :** 2026-04-19
**Input documents :** `planning-artifacts/architecture-sprint6-mobile.md`, `planning-artifacts/prd.md` (Sprint 6 section)

---

## Epic 11: Mobile Local-First — Onboarding & Data Layer

**Epic Goal:** Rendre l'app mobile entièrement autonome — stockage local SQLite, compte optionnel, wizard de configuration. Le backend devient un serveur de sync optionnel, pas un prérequis.

### Story 11.1: Onboarding — Welcome Screen & Auth Optionnel

As a new user installing the app,
I want to start using Sakapuss without creating an account,
So that I can track my pets immediately without friction.

**Acceptance Criteria:**

**Given** the app is launched for the first time (no local DB)
**When** the welcome screen is shown
**Then** two CTAs are visible: "Continuer sans compte" and "Créer un compte / Se connecter"

**Given** user taps "Continuer sans compte"
**When** the wizard is completed
**Then** the app navigates to the dashboard in local-only mode (no auth token stored)

**Given** user taps "Créer un compte"
**When** registration succeeds
**Then** auth token stored in expo-secure-store and sync mode is activated

**Given** the app is launched after first setup (local DB exists)
**When** the app starts
**Then** onboarding is skipped and the user lands directly on the dashboard

---

### Story 11.2: Configuration Wizard — Tracking Setup

As a new user,
I want to choose what I want to track before using the app,
So that the dashboard only shows relevant actions for my use case.

**Acceptance Criteria:**

**Given** onboarding is complete
**When** the config wizard is shown
**Then** toggles for: Poids, Alimentation, Litière, Médicaments/Rappels, Comportement are visible, all ON by default

**Given** a tracking category is toggled ON
**When** the user taps the expand icon
**Then** a configuration panel is shown with category-specific settings (e.g., frequency for weight, units)

**Given** user taps "Commencer"
**When** the wizard is completed
**Then** tracking_config is saved to local SQLite and dashboard buttons reflect the selection

**Given** user navigates to Settings
**When** they access "Configuration du suivi"
**Then** the same wizard is accessible again to modify the configuration

---

### Story 11.3: Local SQLite Database — Schema & Migrations

As a developer,
I want a local SQLite database with Drizzle ORM,
So that all app data is stored persistently on-device.

**Acceptance Criteria:**

**Given** the app is launched
**When** the DB is initialized
**Then** tables `pets`, `events`, `reminders`, `tracking_config` are created with proper schema including `sync_status` and `server_id` columns

**Given** a schema migration is needed (app update)
**When** the app launches with a new schema version
**Then** Drizzle migrations run automatically without data loss

**Given** the app is used with no network
**When** any CRUD operation is performed
**Then** data is persisted locally and `sync_status` is set to `pending`

---

### Story 11.4: Repository Layer — Data Abstraction

As a developer,
I want a Repository pattern abstracting the data source,
So that screens never call the API directly and the data layer can evolve independently.

**Acceptance Criteria:**

**Given** any screen performing a read operation (getPets, getEvents, etc.)
**When** the call is made
**Then** it reads from the local SQLite database, not from the API

**Given** any screen performing a write operation
**When** data is created/updated/deleted
**Then** it is written to local SQLite first, then `SyncQueue.enqueue()` is called if authenticated

**Given** a repository method throws
**When** it's a network error (sync)
**Then** the error is silent and data remains `sync_status = 'pending'`; UI is not impacted

---

### Story 11.5: Sync Engine — Push/Pull

As a logged-in user,
I want my local data to synchronize with the backend automatically,
So that I can access my data on the web portal and across devices.

**Acceptance Criteria:**

**Given** user is authenticated and has `pending` records
**When** the device reconnects to the internet
**Then** SyncEngine.push() runs and uploads all pending records to the backend

**Given** push succeeds for a record
**When** the server returns the created/updated resource
**Then** local record's `sync_status` is set to `synced` and `server_id` is updated

**Given** user is authenticated
**When** the app comes to the foreground
**Then** SyncEngine.pull() fetches updates from the server and merges them locally (server-wins on conflict)

**Given** user is NOT authenticated
**When** any sync method is called
**Then** it returns immediately without making any network request

---

## Epic 12: Mobile Local-First — Pet & Event Management Offline

**Epic Goal:** Adapter les écrans existants pour utiliser le Repository layer au lieu des appels API directs.

### Story 12.1: Gestion des Animaux Offline

As a user without an account,
I want to create and manage my pets locally,
So that I have full pet management without needing the backend.

**Acceptance Criteria:**

**Given** user is in local-only mode
**When** they add a pet via AddPetScreen
**Then** pet is saved to local SQLite with `sync_status = 'pending'`
**And** pet appears on the dashboard immediately

**Given** user creates a pet while authenticated
**When** the pet is saved
**Then** sync is triggered and pet is pushed to the backend

### Story 12.2: Quick Log Offline

As a user without network access,
I want to log events (weight, food, litter, etc.) offline,
So that no data is lost when I'm without internet.

**Acceptance Criteria:**

**Given** user logs an event while offline
**When** they tap "Enregistrer"
**Then** event is saved locally with `sync_status = 'pending'` and the user sees a success state (no error)

**Given** network is restored later
**When** SyncEngine runs
**Then** all pending events are pushed to the backend
