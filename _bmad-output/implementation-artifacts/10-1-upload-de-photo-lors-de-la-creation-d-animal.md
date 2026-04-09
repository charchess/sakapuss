---
story_id: "10.1"
story_key: "10-1-upload-de-photo-lors-de-la-creation-d-animal"
epic: 10
status: ready-for-dev
created: 2026-04-07
---

# Story 10.1: Upload de Photo lors de la Création d'Animal

## User Story

As a User,
I want to upload a profile photo when creating a new pet,
So that my pet appears with their photo immediately after creation.

## Acceptance Criteria

**Given** the pet creation form at `/pets/new`
**When** I select an image file via the photo upload field
**Then** the image preview is displayed immediately (before submit)
**And** after form submit, the pet is created AND the photo is uploaded via `POST /pets/{id}/photo`
**And** the pet card on the dashboard displays the uploaded photo.

---

## Developer Context

### Existing Backend Endpoint (DO NOT MODIFY)

`POST /api/pets/{pet_id}/photo` — expects `multipart/form-data` with field `file` (UploadFile).

- Validates `content_type` starts with `image/`
- Saves to `/media/pets/{pet_id}/{uuid}.ext`
- Updates `pet.photo_url` to `/media/pets/{pet_id}/{uuid}.ext`
- Returns the full `PetResponse` with updated `photo_url`
- Source: `backend/app/api/pets.py:66` and `backend/app/modules/pets/service.py:save_pet_photo`

Backend media served at `GET /media/{path}` via FastAPI `StaticFiles`.

### File to Modify

**Only file that needs changes:**
`frontend/src/routes/pets/new/+page.svelte`

DO NOT touch the backend. DO NOT create new files.

### Implementation Pattern

The form currently does two separate fetch calls:
1. `POST /api/pets` (JSON) → returns pet with `id`
2. If a photo was selected: `POST /api/pets/{id}/photo` (FormData) → upload

```typescript
// After pet creation succeeds:
if (photoFile) {
  const fd = new FormData();
  fd.append('file', photoFile);
  await fetch(`${API_URL}/pets/${createdId}/photo`, {
    method: 'POST',
    body: fd,
    // DO NOT set Content-Type header — browser sets multipart boundary automatically
  });
}
```

### Preview Pattern (Svelte 5)

```typescript
let photoFile: File | null = $state(null);
let photoPreview: string | null = $state(null);

function handlePhotoChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  photoFile = file;
  if (file) {
    photoPreview = URL.createObjectURL(file);
  } else {
    photoPreview = null;
  }
}
```

In template:
```svelte
<div class="form-group">
  <label for="pet-photo">Photo de profil</label>
  <input
    id="pet-photo"
    data-testid="pet-photo-input"
    type="file"
    accept="image/*"
    onchange={handlePhotoChange}
  />
  {#if photoPreview}
    <img
      src={photoPreview}
      alt="Aperçu"
      data-testid="pet-photo-preview"
      class="photo-preview"
    />
  {/if}
</div>
```

### CSS to Add

```css
.photo-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-top: calc(var(--space-unit));
  border: 2px solid var(--color-neutral-200);
}
```

### Conventions from Previous Stories

- `data-testid` attributes required on all interactive elements (Playwright uses them)
- Svelte 5 reactive state: use `$state()` not `let`
- No `Content-Type` header when sending `FormData` — browser sets multipart boundary
- Error handling: show error message in `.form-error` div
- `submitting` flag prevents double-submit

### Dashboard Display

The dashboard card (`/` page) already renders `pet.photo_url` if present. After creation+upload, the redirect to `/` will show the photo automatically. No dashboard changes needed.

### Testing Requirements

E2E test file: `tests/e2e/pet-photo-creation.spec.ts` (NEW file)
API test file: none needed (backend endpoint already tested)

Use `data-testid` selectors:
- `pet-photo-input` — file input
- `pet-photo-preview` — preview image

For Playwright file upload: `await page.getByTestId('pet-photo-input').setInputFiles('path/to/test-image.png')`

A small test PNG should be placed at `tests/support/fixtures/test-photo.png` (create a minimal 1x1 PNG).

## Definition of Done

- [ ] File input with `data-testid="pet-photo-input"` added to `/pets/new` form
- [ ] Local preview shown immediately on file selection (`data-testid="pet-photo-preview"`)
- [ ] After form submit: pet created, then photo uploaded if file selected
- [ ] Photo errors (non-image, server error) handled gracefully (shown in `.form-error`)
- [ ] Playwright E2E test passes: select image → preview shown → submit → photo on dashboard
- [ ] No regressions: existing `pet-onboarding-crud.spec.ts` tests still pass
