# Sakapuss Design System

> Design tokens, spacing scale, type scale, and shared patterns

**Project:** Sakapuss
**Created:** 2026-04-08
**Visual Direction:** Flat expressif coloré — animal facecam, palette vivante
**Platform:** Mobile-first PWA (SvelteKit)

---

## Color Palette

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color-primary` | `#6C5CE7` | Primary actions, active states, brand accent |
| `color-primary-light` | `#A29BFE` | Hover states, secondary highlights |
| `color-primary-dark` | `#4A3FC7` | Active/pressed states |
| `color-secondary` | `#00CEC9` | Success, confirmations, positive feedback |
| `color-secondary-light` | `#81ECEC` | Success backgrounds |
| `color-accent` | `#FDCB6E` | Warnings, reminders, attention |
| `color-accent-dark` | `#E17055` | Urgent, overdue reminders |

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color-bg` | `#FAFAFA` | Page background |
| `color-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `color-text-primary` | `#2D3436` | Primary text |
| `color-text-secondary` | `#636E72` | Secondary text, labels |
| `color-text-muted` | `#B2BEC3` | Placeholders, disabled text |
| `color-border` | `#DFE6E9` | Borders, dividers |
| `color-border-focus` | `#6C5CE7` | Focus rings |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color-success` | `#00B894` | Done, validated, active |
| `color-warning` | `#FDCB6E` | Upcoming, attention needed |
| `color-error` | `#E17055` | Overdue, errors, destructive |
| `color-info` | `#74B9FF` | Information, neutral alerts |

### Category Colors

| Category | Token | Value |
|----------|-------|-------|
| Santé | `color-cat-health` | `#E17055` |
| Poids | `color-cat-weight` | `#6C5CE7` |
| Alimentation | `color-cat-food` | `#00CEC9` |
| Litière | `color-cat-litter` | `#FDCB6E` |
| Comportement | `color-cat-behavior` | `#A29BFE` |
| Événement libre | `color-cat-event` | `#636E72` |
| Rappels | `color-cat-reminders` | `#E17055` |
| Activité | `color-cat-activity` | `#74B9FF` |

---

## Spacing Scale

Token-based spacing system. All specs reference token names, never raw pixel values.

| Token | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| `space-zero` | 0 | 0 | Flush elements, overlap |
| `space-2xs` | 2px | 2px | Micro gaps (icon-to-label) |
| `space-xs` | 4px | 4px | Tight inner spacing |
| `space-sm` | 8px | 8px | Component internal gaps |
| `space-md` | 12px | 16px | Default element spacing |
| `space-lg` | 16px | 24px | Section internal spacing |
| `space-xl` | 24px | 32px | Section gaps |
| `space-2xl` | 32px | 48px | Major section boundaries |
| `space-3xl` | 48px | 64px | Page-level separation |

### Page Defaults

| Property | Mobile | Desktop |
|----------|--------|---------|
| Page padding (horizontal) | `space-lg` | `space-2xl` |
| Page padding (top) | `space-md` | `space-lg` |
| Section gap | `space-xl` | `space-2xl` |
| Element gap (default) | `space-md` | `space-md` |
| Component gap (within groups) | `space-sm` | `space-sm` |

---

## Type Scale

Mobile-first type scale. Desktop may use one size up for body text.

| Token | Size (mobile) | Size (desktop) | Line Height | Usage |
|-------|---------------|----------------|-------------|-------|
| `text-2xs` | 10px | 10px | 1.4 | Badge text, micro labels |
| `text-xs` | 12px | 12px | 1.4 | Captions, timestamps, helper text |
| `text-sm` | 14px | 14px | 1.5 | Secondary text, labels |
| `text-md` | 16px | 16px | 1.5 | Body text (default) |
| `text-lg` | 18px | 20px | 1.4 | Emphasized body, card titles |
| `text-xl` | 20px | 24px | 1.3 | Section headings |
| `text-2xl` | 24px | 28px | 1.2 | Page titles |
| `text-3xl` | 28px | 36px | 1.1 | Hero headlines |

### Typography Defaults

| Element | Semantic | Token | Weight | Typeface |
|---------|----------|-------|--------|----------|
| Page title | H1 | `text-2xl` | Bold | Display (Nunito) |
| Section heading | H2 | `text-xl` | Semibold | Display (Nunito) |
| Card title | H3 | `text-lg` | Semibold | Default (Inter) |
| Body text | p | `text-md` | Regular | Default (Inter) |
| Label | label | `text-sm` | Medium | Default (Inter) |
| Caption | p.caption | `text-xs` | Regular | Default (Inter) |
| Button text | button | `text-md` | Semibold | Default (Inter) |

**Font Stack:**
- **Display:** Nunito, system-ui, sans-serif — headings, brand moments
- **Default:** Inter, system-ui, sans-serif — body, UI elements

---

## Elevation

| Token | Shadow | Usage |
|-------|--------|-------|
| `elevation-none` | none | Flat elements |
| `elevation-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards, buttons |
| `elevation-md` | `0 4px 12px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `elevation-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Bottom sheets, floating actions |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Inputs, small buttons |
| `radius-md` | 8px | Cards, containers |
| `radius-lg` | 12px | Action buttons, modals |
| `radius-xl` | 16px | Large cards, bottom sheets |
| `radius-full` | 9999px | Avatars, pills, badges |

---

## Shared Components

### Quick Action Tile

**COMPONENT ID:** `quick-action-tile`

| Property | Value |
|----------|-------|
| Purpose | Single-tap action entry in the Dashboard grid |
| Size | Min 64×64, flexible |
| Layout | Icon (top) + Label (bottom), vertically centered |
| Background | `color-surface` |
| Border | 1px `color-border` |
| Border Radius | `radius-lg` |
| Elevation | `elevation-sm` |
| States | default, pressed (scale 0.95 + `color-primary-light` border), disabled |
| Interaction | Tap → Quick Log flow |

### Reminder Card

**COMPONENT ID:** `reminder-card`

| Property | Value |
|----------|-------|
| Purpose | Single reminder display with status and actions |
| Layout | Horizontal: Status indicator + Content (title, date, animal) + Actions |
| Background | `color-surface` |
| Border Radius | `radius-md` |
| Padding | `space-md` |
| Status Indicator | Left color bar: `color-warning` (upcoming), `color-error` (overdue), `color-success` (done) |
| States | default, upcoming, overdue, done |

### Animal Avatar

**COMPONENT ID:** `animal-avatar`

| Property | Value |
|----------|-------|
| Purpose | Animal identity in lists, headers, selections |
| Size variants | sm (32px), md (48px), lg (64px) |
| Shape | `radius-full` |
| Border | 2px `color-primary` (selected), 2px `color-border` (default) |
| Fallback | Species emoji + first letter of name on `color-primary-light` bg |
| States | default, selected, with-badge (notification dot) |

### Category Badge

**COMPONENT ID:** `category-badge`

| Property | Value |
|----------|-------|
| Purpose | Visual category identifier in timelines and logs |
| Layout | Pill: Icon + Label |
| Background | Category color at 15% opacity |
| Text Color | Category color (full) |
| Border Radius | `radius-full` |
| Text | `text-xs`, Medium |

### Confirmation Toast

**COMPONENT ID:** `confirmation-toast`

| Property | Value |
|----------|-------|
| Purpose | Feedback after Quick Log auto-save (3 sec countdown) |
| Position | Bottom center, above nav, `space-lg` from bottom |
| Layout | Icon ✓ + Message + optional actions (note / weight) |
| Background | `color-text-primary` at 90% |
| Text Color | `color-surface` |
| Border Radius | `radius-lg` |
| Animation | Slide up + fade in, auto-dismiss after 3 sec with progress bar |
| States | showing (with countdown), expanded (user tapped action) |

### Bottom Navigation

**COMPONENT ID:** `bottom-nav`

| Property | Value |
|----------|-------|
| Purpose | Primary app navigation |
| Items | Home, Timeline, Add (+), Reminders, Profile |
| Layout | 5 equal items, icon + label |
| Height | 56px + safe area |
| Background | `color-surface` |
| Active | `color-primary`, icon filled |
| Inactive | `color-text-muted`, icon outline |
| Center Button | Larger (48px), `color-primary` bg, white "+" icon — Quick Log shortcut |

---

## Patterns

### Page Spacing Pattern — Dashboard

| Property | Token |
|----------|-------|
| Page padding (horizontal) | `space-lg` |
| Header to grid | `space-xl` |
| Grid gap | `space-md` |
| Grid to reminders banner | `space-xl` |

### Auto-Save Confirmation Pattern

1. User completes Quick Log selection
2. Toast appears with ✓ and message
3. Optional actions (📝 note / ⚖️ weight) visible as ghost buttons
4. Progress bar counts down 3 seconds
5. If user taps action → expand, cancel auto-save
6. If ignored → auto-save fires, toast slides away

---

_Created using Whiteport Design Studio (WDS) methodology_
