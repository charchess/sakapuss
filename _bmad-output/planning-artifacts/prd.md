---
workflowType: 'prd'
workflow: 'edit'
classification:
  domain: 'pet_health'
  projectType: 'web_app'
  complexity: 'low'
inputDocuments: ['product-brief-sakapuss-2026-02-27.md', 'brainstorming-session-2026-03-04.md']
stepsCompleted: ['step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
lastEdited: '2026-03-09'
---

# Product Requirements Document - Sakapuss

**Author:** Charchess
**Date:** 2026-02-27 (Updated 2026-03-09 — Sprint 2 requirements)

## Success Criteria

### User Success

| Criterion | Measure | Target |
|---|---|---|
| Zero missed treatments | Count of unacknowledged overdue reminders | 0 after 1 month of use |
| HA Responsiveness | Action validation latency (Google Home/HA → Sakapuss) | < 5s |
| High-Friction Reduction | Average time to log a "Litter" or "Food" event | < 10s |
| Systematic weight logging | Weight recorded within 24h of weigh-in | >90% of weigh-ins |
| "Maman" autonomy | Independent consultation without help | <7 days after first access |
| Vet utility | Complete history readable during consultation | <30 seconds to find any info |

### Technical Success

| Criterion | Target |
|---|---|
| MQTT Availability | 99.9% uptime of MQTT bridge |
| Discovery Compliance | 100% of defined entities auto-discovered by HA |
| API response time (CRUD) | <200ms p95 |
| Page load (First Contentful Paint) | <1.5s |
| Test coverage | >70% backend, >50% frontend |
| Zero critical vulnerabilities | Clean npm/pip audit |

## Product Scope

### MVP - Minimum Viable Product

**P0 — Must Have:**

1. **Pet profiles**: CRUD + profile photo.
2. **Weight tracking**: Temporal line chart + trend indicator.
3. **Vaccine & Medical Records**: Tracking + next due date auto-calculation.
4. **Bidirectional HA Integration**: Native MQTT Discovery exposing `button` (validation), `sensor` (status), and `binary_sensor` (alerts). Supports voice commands ("Ok Google, validate vaccine").
5. **"1-Tap" Decision Tree UX**: Mobile-optimized visual icons for frequent events. Automatic "RAS" (All Clear) logging to track maintenance frequency without manual text entry.
6. **Unified filterable timeline**: Per animal (all event types, including photos).
7. **Correlation Engine (Alpha)**: Basic rule-based detection between Food intake and Health symptoms (e.g., Brand change → Digestive issues).

**P1 — Should Have:**

8. **Behavioral journal**: Structured events (vomiting, lethargy, etc.) + tags.
9. **Photo gallery**: Health event association + auto thumbnails.
10. **Litter box tracking**: Cleaning log with 1-tap entry + notable events (blood, diarrhea).
11. **Food tracking**: Consumption estimate + low-stock HA alerts.

**Sprint 2 — P0 (Must Have):**

12. **Pet Onboarding UI**: Full CRUD forms in the web UI — create, edit, delete pets. Fields: name, species, breed, birth date, photo, initial weight, sterilized (yes/no), microchip/tattoo number, treating veterinarian (name + phone).
13. **Free-form Event Entry**: Form to manually create any event type (vaccine, treatment, note) with custom date, custom payload. Not limited to the 4 fast-action buttons.
14. **Food Stock Management (Bag Lifecycle)**: Full product catalog (brand, line, weight, type: configurable — kibble/wet/treats/etc., category: configurable — main/treat). Bag lifecycle: purchased → opened → depleted. Multiple bags in stock simultaneously. Estimated daily consumption, estimated depletion date, HA low-stock alert.
15. **Bowl Management (Multi-bowl, Multi-location)**: Named bowls with location, capacity, associated food type. 1-tap "fill" log with optional weight. Per-animal consumption tracking including scenarios like "Vanille ate her portion AND her sister's".
16. **Water Tracking**: Same logic as bowls but for water containers. Volume/height-based tracking, consumed volume deduced from container capacity.

**Sprint 2 — P1 (Should Have):**

17. **Inter-Animal Relations**: Relational events — behavioral observations between animals ("X sleeps with Y", "X fights with Y"). Structured interaction logging.
18. **Enhanced Multi-Animal Navigation**: Quick animal switcher, comparative view, link to vet summary from pet profile.

## User Journeys

**Journey 1: Onboarding**
User creates profile, uploads photo, and sets initial health baseline.

**Journey 2: Voice-Activated Health Validation**
- **Actor:** User (via Smart Speaker)
- **Flow:** HA notifies of due vaccine → User: "Ok Google, mark Vanille's vaccine as done" → HA sends MQTT command → Sakapuss logs event + calculates next due date.

**Journey 3: Fast Litter Maintenance Log**
- **Actor:** User (Mobile)
- **Flow:** User cleans litter → Opens Sakapuss → Clicks "Caisse Nettoyée" → Quick-scan of icons (💩, 🩸, 💧) → No selection → Clicks "Save" (system logs "RAS" event).

**Journey 4: Food Stock Lifecycle**
- **Actor:** User (Mobile)
- **Flow:** User buys kibble bag → Logs purchase (brand, weight, date) → Later opens the bag → Clicks "Fill" each time a bowl is served (optional gram estimate) → Eventually marks bag as empty → System estimates daily consumption and alerts when next bag running low.

**Journey 5: Pet Onboarding via UI**
- **Actor:** User (Desktop/Mobile)
- **Flow:** User clicks "+" on dashboard → Fills form (name, species, breed, birth date, sterilized, microchip) → Uploads photo → Optionally enters initial weight → Pet appears on dashboard with full profile.

**Journey 6: Multi-Animal Meal Logging**
- **Actor:** User (Mobile)
- **Flow:** User fills 2 bowls in salon → Opens Sakapuss → Selects "Salon bowl A" → Clicks Fill → Selects "Salon bowl B" → Clicks Fill → Notes "Vanille ate everything + Mina's share" → Events logged for both animals.
## Functional Requirements

### Connectivity (MQTT)
- **FR-CON-01**: System MUST support MQTT Discovery (Home Assistant standard).
- **FR-CON-02**: System MUST expose one `button` entity per active health reminder per animal.

### User Interface (Mobile)
- **FR-UX-01**: Mobile dashboard MUST feature a "Fast-Action" grid for P0 events.
- **FR-UX-02**: Fast-Action events MUST be loggable in under 3 interactions (taps).
- **FR-UX-03**: Pet creation/edit MUST be accessible from the dashboard UI (no API-only operations for core CRUD).
- **FR-UX-04**: Bowl filling MUST be achievable in 2 taps (select bowl → confirm fill).
- **FR-UX-05**: Animal switcher MUST be accessible from any pet profile page.

### Intelligence
- **FR-INT-01**: Correlation engine MUST analyze timeline for "Food Change" events within 72h of "Digestive Symptom" logs.
- **FR-INT-02**: System MUST support configurable food types (not hardcoded). Users define their own categories (kibble, wet, treats, etc.) and sub-categories (main vs pleasure).
- **FR-INT-03**: System MUST track bag lifecycle with estimated depletion based on logged servings.

## Non-Functional Requirements

### Legal & Safety
- **NFR-LEG-01**: **Medical Disclaimer**: Every analysis view and PDF report MUST display: "This tool is a tracking assistant, not a medical device. Consult a veterinarian for any health concerns."

### Performance
- **NFR-PER-01**: API response time under 200ms for 95th percentile.
- **NFR-PER-02**: MQTT command processing latency under 1s.
