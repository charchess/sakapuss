# Story 2.3: Visualisation de la Timeline (Frontend)

## Status: in-progress

## Story

As a User,
I want to see my pet's history as a vertical feed with distinct icons for each event type,
So that I can quickly scan and understand the health timeline.

## Acceptance Criteria

1. **Given** a pet with health events, **When** I view the pet's detail page, **Then** events are displayed chronologically (most recent first) in a vertical feed.
2. **Given** events of different types (weight, note, vaccine, treatment, litter, food), **When** displayed in the timeline, **Then** each event type has a unique icon.
3. **Given** an event in the timeline, **Then** I can see the event type, date, and relevant payload summary.
4. **Given** a pet with no events, **When** I view the timeline, **Then** I see an empty state message.
5. **Given** the timeline, **Then** it is responsive and works on both desktop and mobile viewports.

## Tasks

- [x] Write ATDD E2E tests (RED)
- [ ] Load events in +page.ts
- [ ] Render timeline component in +page.svelte
- [ ] Style with vanilla CSS (Calm Health theme)
- [ ] Run tests GREEN

## Dev Notes

- Events API: `GET /pets/{pet_id}/events` returns list sorted by `occurred_at` DESC
- Event types: weight, note, vaccine, treatment, litter, food
- Icon mapping: use emoji or SVG icons per type
- Vite proxy already configured for `/events` path
