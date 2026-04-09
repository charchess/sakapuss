# Story 3.1: Moteur de Rappels & Calcul des Échéances (Backend)

## Status: in-progress

## Story

As a User,
I want the system to automatically calculate and track my pet's next medical due dates,
So that I never miss a critical vaccination or treatment.

## Acceptance Criteria

1. **Given** a vaccine event with `period_months` in payload, **When** the event is created, **Then** a reminder is stored with calculated `next_due_date`.
2. **Given** pending reminders, **When** I call `GET /reminders/pending`, **Then** I get a list of upcoming due dates sorted by date ASC.
3. **Given** a reminder, **Then** it contains the pet_id, pet name, event type, event name, and next_due_date.
4. **Given** a pet is deleted, **Then** its reminders are cascade-deleted.
5. **Given** a vaccine event without `period_months`, **Then** no reminder is created.

## Tasks

- [ ] Create reminders model (id, pet_id, event_id, type, name, next_due_date, created_at)
- [ ] Create Alembic migration
- [ ] Create reminder service (auto-create on event creation)
- [ ] Create API endpoint GET /reminders/pending
- [ ] Wire into event creation flow
- [ ] Write ATDD tests and verify GREEN

## Dev Notes

- Reminders table: id, pet_id (FK), event_id (FK), type, name, next_due_date, created_at
- Calculation: occurred_at + period_months = next_due_date
- Pending = next_due_date >= today (future or today)
- Architecture: `backend/app/modules/health/` — extend existing module
