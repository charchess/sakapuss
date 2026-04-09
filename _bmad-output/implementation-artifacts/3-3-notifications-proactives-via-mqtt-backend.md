# Story 3.3: Notifications Proactives via MQTT (Backend)

## Status: in-progress

## Story

As a User,
I want to receive proactive notifications through Home Assistant when a pet treatment is approaching,
So that I can prepare for the appointment or medication.

## Acceptance Criteria

1. **Given** a reminder due within 7 days, **When** the notification check runs, **Then** relevant reminders are identified.
2. **Given** an API endpoint to check upcoming reminders, **When** called, **Then** it returns reminders due within N days.
3. **Given** MQTT is connected, **When** a reminder is upcoming, **Then** a notification message is published.
4. **Given** MQTT is not connected, **Then** the check still works (returns data) without publishing.

## Tasks

- [ ] Add `GET /reminders/upcoming?days=7` endpoint
- [ ] Add notification check service function
- [ ] Write ATDD tests and verify GREEN
