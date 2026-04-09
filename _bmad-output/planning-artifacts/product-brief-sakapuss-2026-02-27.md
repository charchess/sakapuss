---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-02-27
author: Charchess
---

# Product Brief: Sakapuss

## Executive Summary

**Sakapuss** is an open-source, self-hosted digital health notebook for domestic animals. It centralizes fragmented pet health data — weight logs, vaccination schedules, medication tracking, behavioral observations, and photos — into a single, unified timeline per pet. Designed for Home Assistant integration, it delivers proactive reminders and surfaces health patterns that paper records and scattered spreadsheets cannot.

No viable FOSS self-hosted solution exists today. Sakapuss fills this gap with a modern, responsive web application distributed as both a Docker container and a Home Assistant Add-on.

---

## Core Vision

### Problem Statement

Pet owners manage their animals' health through a patchwork of unreliable sources: a vaguely-filled paper booklet at the vet, SMS reminders for vaccines, mental notes for flea/deworming treatments, and disconnected spreadsheets for weight tracking. This fragmentation leads to missed treatments (forgotten flea medication), invisible health trends (gradual weight changes go unnoticed), and zero correlation between symptoms, seasons, and treatments.

### Problem Impact

- **Missed preventive care**: Flea treatments, deworming, and vaccine boosters fall through the cracks
- **Invisible health trends**: Weight variations only become apparent when drastic — no early warning system
- **No behavioral pattern detection**: Recurring vomiting, seasonal hair loss, or appetite changes go untracked and uncorrelated
- **Vet visits are blind**: No consolidated history to share; owners rely on memory
- **Multi-pet households multiply the chaos**: Each animal's care is independently (dis)organized

### Why Existing Solutions Fall Short

- **Commercial SaaS** (PetLog, Notepet): Cloud-dependent, closed-source, no self-hosting, no HA integration
- **RobiPet**: Closest self-hosted option but PolyForm Noncommercial license — not truly free. No behavioral journal, no pattern analysis, no HA integration
- **Repurposed tools** (LubeLogger, Grocy): Creative hacks, not purpose-built — no pet-specific data model, no health correlations
- **Home Assistant integrations**: Only hardware (PetKit feeders, Tractive GPS, Cat Scale) — zero manual health record keeping

### Proposed Solution

A standalone web application (Docker container) serving as a unified pet health timeline, with a thin Home Assistant integration layer for proactive notifications and dashboard surfacing. Key capabilities:

1. **Unified timeline per pet** — weight, vaccines, medications, behavioral events, photos — all on one chronological view
2. **Proactive reminders** — pushed through HA notifications: upcoming vaccines, deworming due, scheduled weigh-in
3. **Behavioral event logging** — structured entries (vomiting, hair loss, appetite change, lethargy) + free-text notes
4. **Pattern & correlation analysis** — surface recurring symptoms, correlate events with seasons/treatments/weight changes
5. **Photo documentation** — dated lesion photos, before/after tracking, associated with health events
6. **Multi-animal, multi-species** — cats, dogs, rabbits, etc. with species-specific context

### Key Differentiators

1. **Only FOSS self-hosted pet health notebook** with a truly open license
2. **Home Assistant native integration** — proactive reminders via HA notifications, sensor entities for dashboards, sidebar access via Ingress
3. **Correlation engine** — the killer feature no competitor has: link behavioral events to seasons, treatments, weight trends, and detect recurring patterns
4. **Data sovereignty** — your pets' health data stays on your server, exportable, backed up on your terms

## Target Users

### Primary Users

#### "Alex" — The tech-savvy pet owner

- **Profile**: 25-45 years old, owns 2-5 pets, already a Home Assistant user, comfortable with Docker/self-hosting
- **Situation**: 2 beloved cats, health tracking scattered across paper vet booklet, memory, and Excel spreadsheets
- **Frustrations**: Missed flea treatments, invisible weight trends, no correlation between symptoms and seasons/treatments
- **Motivation**: Centralize everything, never forget a treatment, see patterns emerge
- **Usage**: Data entry on desktop or mobile, consults HA dashboard on tablet, receives push notifications
- **"Aha!" moment**: First notification "Mina's deworming in 5 days" + weight chart revealing a gradual unnoticed weight loss
- **Design note**: This is the power user — all features should serve Alex's workflow first

### Secondary Users

#### "Maman" — The family member (read-mostly)

- **Profile**: 55-70 years old, not technical, uses a basic smartphone
- **Situation**: Helps care for the animals, needs to know when next treatment is due
- **Frustrations**: "When is the next vaccine again?" — always has to ask
- **Motivation**: Quick glance at essential info, not data entry
- **Usage**: Mobile PWA, read-only simplified view — upcoming appointments, active treatments, last weigh-in
- **"Aha!" moment**: Opens the app on her phone, immediately sees "Next deworming: March 3rd" without asking anyone
- **Design note**: If Maman can use it unaided, the UX is validated. She's the litmus test for simplicity.

#### The veterinarian — Occasional consultation

- **Profile**: Healthcare professional, zero time to install anything
- **Situation**: During appointment, owner shows health history on phone or shares a link
- **Frustrations**: "What treatments has your animal had recently?" — owners never remember
- **Motivation**: Reliable, fast summary of pet health history
- **Usage**: **Summary view** — shareable page/PDF, chronological summary: vaccines, treatments, weight, notable events. No account, no login required.
- **"Aha!" moment**: Owner shows a clean timeline on their phone → vet has full history in 30 seconds

### Explicitly Out of Scope

- **Breeders**: Traceability, lineage/filiation tracking, litter management — too heavy, different product
- **Shelters/rescues**: Bulk animal management, adoption workflows — different scale and needs
- **Veterinary clinics**: Practice management software is a completely different domain

### User Journey (Alex — primary user)

| Phase | Action | Where |
|---|---|---|
| **Discovery** | Finds Sakapuss on awesome-selfhosted or HACS store | Web / HA |
| **Installation** | `docker-compose up` or one-click HA Add-on | Terminal / HA |
| **Onboarding** | Creates 2 cat profiles, enters last known weight, adds next vaccine date | Web app |
| **Daily use** | Receives HA notification "Mina's monthly weigh-in", enters weight in 15 seconds | Mobile / HA |
| **Health event** | Notes "vomiting" + photo, app displays it on timeline | Mobile |
| **Value moment** | After 6 months, sees vomiting always coincides with season changes → discusses with vet | Web app |
| **At the vet** | Shows summary view on phone, vet sees full history | Mobile |
| **Routine** | It's become a reflex — like adding an appointment to the calendar | Everywhere |

## Success Metrics

### User Success (Primary — Alex)

- Zero missed treatments after onboarding (flea, deworming, vaccines)
- Weight entered within 24h of each weigh-in
- Behavioral events logged when they happen (not retroactively from memory)
- Pattern insight surfaced after 3-6 months of data (first "I didn't notice that" moment)

### User Success (Secondary — Maman)

- Can answer "when is the next treatment?" without calling Alex
- Uses the app independently within 1 week of first access

### User Success (Vet summary)

- Vet gets a complete overview in under 30 seconds during consultation

### Business Objectives

N/A — This is a personal/FOSS project. Success is measured by personal utility, not revenue.

**Project Health Indicators (nice-to-have, not goals):**

- GitHub stars as community interest signal
- Docker Hub pulls as adoption signal
- Issues/PRs from external contributors as engagement signal
- Listed on awesome-selfhosted as visibility milestone

### Key Performance Indicators

| KPI | Target | Measurement |
|---|---|---|
| Missed treatments | 0 after 1 month of use | Check overdue reminders count |
| Weekly active usage | ≥3 interactions/week | App analytics (optional, local-only) |
| Maman autonomy | Independent within 7 days | Qualitative |
| Vet summary usefulness | Complete history in <30s | Qualitative (vet feedback) |
| Onboarding time | Pet profile + first data in <5 min | Time from install to first weight entry |

## MVP Scope

### Core Features

**P0 — Must Have**

| Feature | Description |
|---|---|
| **Pet profiles** | Name, species, breed, date of birth, sex, sterilized, microchip number, profile photo |
| **Weight tracking** | Date + weight entry, temporal line chart, trend indicator (↑↗→↘↓) |
| **Vaccine records** | Vaccine name, date, next dose, administering vet. Auto-calculation of next due date |
| **Medication tracking** | Name, dosage, frequency, start/end date, status (active/completed/ongoing) |
| **Flea & deworming log** | Product, date applied, next application. Recurring treatments with configurable interval |
| **Proactive reminders via HA** | Push notifications for: upcoming vaccine, deworming/flea treatment due, scheduled weigh-in. Configurable advance alert (7d, 3d, day-of) |
| **Unified timeline** | Chronological view per animal: all events (weight, vaccines, medications, behavior, photos) on a single filterable page |

**P1 — Should Have**

| Feature | Description |
|---|---|
| **Behavioral journal** | Structured events (vomiting, hair loss, appetite loss, lethargy, diarrhea + custom) + free-text notes + date/time |
| **Photo gallery** | Upload photos per animal, date + optional description, association to health event (e.g., lesion photo linked to journal entry). Auto thumbnails. |
| **Calendar/filter view** | Calendar view of past + upcoming events. Filters by event type to visually spot patterns |
| **i18n framework** | Multilingual architecture in place, FR + EN implemented |
| **Responsive UI** | Works on mobile, tablet, and desktop. Mobile-friendly for quick data entry |
| **Food tracking** | Products (brand, flavor, weight), purchases, bag open/finish dates, dynamic consumption estimate, remaining stock estimate, HA low-stock alert |
| **Litter box tracking** | Boxes by name/location, cleaning log (1-tap), notable events during cleaning: blood, diarrhea, constipation, abnormal urine, visible parasites |

**P2 — Nice to Have**

| Feature | Description |
|---|---|
| **HA Add-on packaging** | Dockerfile + config.yaml for one-click install via HA Add-on store, Ingress sidebar |
| **HA sensor entities** | `binary_sensor.pet_vaccine_due`, `sensor.pet_weight` exposed to HA for dashboards/automations |
| **Data export** | JSON/CSV export of all data per animal |

### Out of Scope for MVP

| Feature | Reason | Horizon |
|---|---|---|
| Multi-user with roles | Auth complexity, not needed when solo initially | V2 |
| Automatic pattern correlation | Algorithmically complex, filterable timeline suffices for V1 | V2 |
| Vet summary view (shareable link) | Just show phone screen to vet for now | V2 |
| PDF export | Nice-to-have, JSON/CSV sufficient | V2 |
| Document attachments (prescriptions, lab results) | Complicates storage, photos sufficient | V2 |
| Veterinarian contact management | Simple address book, not critical | V2 |
| PWA offline mode | Adds complexity (service workers, sync) | V3 |
| Breeders/shelters | Different product (lineage, traceability, bulk) | Never |
| AI/ML health analysis | Liability, complexity, out of scope | Never |

### MVP Success Criteria

- Pet created with full profile in < 2 minutes
- 3 weight entries → chart displayed with trend indicator
- Vaccine with next date → HA notification received at D-7
- Recurring flea/deworming treatment → automatic reminder at correct date
- Behavioral event logged with photo in < 30 seconds
- Timeline displays all event types, filterable
- Interface usable by "Maman" without help (qualitative test)
- `docker-compose up` → functional app in < 1 minute

### Future Vision

**V2 — Intelligence & Sharing**

- Multi-user with roles (admin/read-only)
- Automatic correlation (seasonal patterns, post-treatment recurrences)
- Vet summary view (temporary link, read-only, no login)
- Formatted PDF export for vet
- Document attachments (prescriptions, lab results)

**V3 — Ecosystem**

- PWA with offline mode
- Import from other apps/formats
- Sensor integration (smart scale → auto weight via HA)
- Community marketplace for event types
- Community-driven i18n (ES, DE, IT…)
