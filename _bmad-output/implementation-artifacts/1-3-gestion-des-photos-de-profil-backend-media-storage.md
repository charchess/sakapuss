# Story 1.3: Gestion des Photos de Profil (Backend & Media Storage)

Status: done

## Story

As a User,
I want to upload a photo for each of my pet's profiles,
So that I can visually identify them in the hub.

## Acceptance Criteria

1. Given an existing pet profile, when I upload an image file via POST /pets/{id}/photo, then the image is saved in the local /media volume.
2. The file path is correctly associated with the pet in the database (photo_url field).
3. I can retrieve the image via a public URL served by the backend.

## Tasks / Subtasks

- [x] Media service
  - [x] Add pet photo persistence helper in `backend/app/modules/pets/service.py`.
  - [x] Validate image MIME type (`image/*`) before saving.
  - [x] Generate unique file names to prevent collisions.
  - [x] Update `photo_url` on the target pet and commit DB changes.
- [x] Upload endpoint
  - [x] Add `POST /pets/{pet_id}/photo` in `backend/app/api/pets.py`.
  - [x] Return `404` when pet does not exist.
  - [x] Return updated `PetResponse` after upload.
- [x] Static serving
  - [x] Add `media_path` setting in `backend/app/core/config.py`.
  - [x] Ensure media directory exists at startup in `backend/main.py` lifespan.
  - [x] Mount `/media` static files in `backend/main.py` after router registration.
- [x] Tests
  - [x] Expand `tests/api/pets-photos.spec.ts` to cover upload/retrieve/replace/invalid file/not-found.
  - [x] Remove skip and verify GREEN with Playwright API project.

## Dev Notes

- Kept architecture boundaries from Stories 1.1/1.2:
  - API contract in `backend/app/api/pets.py`
  - Business/media persistence logic in `backend/app/modules/pets/service.py`
  - Infra/runtime setup in `backend/main.py` and `backend/app/core/config.py`
- Reused existing CRUD and DB session patterns from Story 1.2 without changing existing endpoint semantics.
- Implementation remains SQLAlchemy 2.x compatible and keeps local media storage under project `./media` volume.
