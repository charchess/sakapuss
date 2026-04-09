# Story 3.4: Validation Bidirectionnelle (MQTT Receiver)

## Status: in-progress

## Story

As a User,
I want to mark a treatment as 'completed' directly from Home Assistant or by voice command,
So that I don't have to open the Sakapuss web app for every routine validation.

## Acceptance Criteria

1. **Given** an MQTT command to validate a treatment, **When** processed, **Then** a confirmation event is created.
2. **Given** a `POST /commands/validate` endpoint, **When** called with pet_id and reminder_id, **Then** a validation event is recorded.
3. **Given** a validated reminder, **Then** the validation event appears in the pet's timeline.

## Tasks

- [ ] Create POST /commands/validate endpoint
- [ ] Create validation service function
- [ ] Wire MQTT message handler to process commands
- [ ] Write ATDD tests and verify GREEN
