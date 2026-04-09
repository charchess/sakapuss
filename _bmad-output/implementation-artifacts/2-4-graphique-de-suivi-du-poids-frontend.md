# Story 2.4: Graphique de Suivi du Poids (Frontend)

## Status: in-progress

## Story

As a User,
I want to see a visual chart of my pet's weight over time,
So that I can easily spot trends and health changes.

## Acceptance Criteria

1. **Given** a pet with weight events, **When** I view the pet's detail page, **Then** I see a weight chart section above the timeline.
2. **Given** weight data points, **Then** the chart renders a line graph showing weight over time (X=date, Y=weight in kg).
3. **Given** a pet with fewer than 2 weight events, **When** I view the chart, **Then** I see a message indicating insufficient data.
4. **Given** the chart, **Then** it is responsive and works on desktop viewports.

## Tasks

- [ ] Write ATDD E2E tests
- [ ] Implement SVG-based weight chart component
- [ ] Integrate chart into pet profile page
- [ ] Style with vanilla CSS (Calm Health theme)
- [ ] Run tests GREEN

## Dev Notes

- Use lightweight SVG chart (no external library)
- Filter weight events from events list: `events.filter(e => e.type === 'weight')`
- Weight payload shape: `{ value: number, unit: string }`
- Sort chronologically ASC for chart (API returns DESC)
