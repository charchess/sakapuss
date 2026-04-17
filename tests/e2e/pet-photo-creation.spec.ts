import path from 'path';
import { test, expect } from '../support/merged-fixtures';

const TEST_PHOTO = path.resolve(__dirname, '../support/fixtures/test-photo.png');
const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Pet Photo Upload — Story 10.1 & 10.2', () => {

  test.describe('Story 10.1 — Photo lors de la création', () => {

    test('[P0] should show photo file input on creation form', async ({ page }) => {
      await page.goto('/pets/new', { waitUntil: 'networkidle' });

      const photoInput = page.getByTestId('pet-photo-input');
      await expect(photoInput).toBeVisible();
      await expect(photoInput).toHaveAttribute('type', 'file');
      await expect(photoInput).toHaveAttribute('accept', 'image/*');
    });

    test('[P0] should show photo preview immediately after file selection', async ({ page }) => {
      await page.goto('/pets/new', { waitUntil: 'networkidle' });

      // Before selection: no preview
      await expect(page.getByTestId('pet-photo-preview')).not.toBeVisible();

      // Select a file
      await page.getByTestId('pet-photo-input').setInputFiles(TEST_PHOTO);

      // After selection: preview appears
      await expect(page.getByTestId('pet-photo-preview')).toBeVisible();
    });

    test('[P0] should create pet and upload photo in a single form submit', async ({ page, request }) => {
      const petName = `PhotoCat-${Date.now()}`;
      await page.goto('/pets/new', { waitUntil: 'networkidle' });

      // Fill required fields
      await page.getByTestId('pet-name').fill(petName);
      await page.getByTestId('pet-species').getByText('Chat').click();
      await page.getByTestId('pet-birth-date').fill('2022-03-10');

      // Select a photo
      await page.getByTestId('pet-photo-input').setInputFiles(TEST_PHOTO);
      await expect(page.getByTestId('pet-photo-preview')).toBeVisible();

      // Submit
      await page.getByTestId('pet-submit').click();
      await expect(page).toHaveURL('/');

      // Dashboard should show the pet
      await expect(page.getByText(petName)).toBeVisible();

      // Verify photo_url is set via API
      const petsRes = await request.get(`${API_URL}/pets`);
      const pets = await petsRes.json();
      const photoCat = pets.find((p: { name: string }) => p.name === petName);
      expect(photoCat).toBeDefined();
      expect(photoCat.photo_url).not.toBeNull();
      expect(photoCat.photo_url).toMatch(/\/media\/pets\//);

      // Cleanup
      if (photoCat?.id) {
        await request.delete(`${API_URL}/pets/${photoCat.id}`);
      }
    });

    test('[P0] should create pet without photo when no file selected', async ({ page, request }) => {
      const petName = `NoPhotoCat-${Date.now()}`;
      await page.goto('/pets/new', { waitUntil: 'networkidle' });

      await page.getByTestId('pet-name').fill(petName);
      await page.getByTestId('pet-species').getByText('Chien').click();
      await page.getByTestId('pet-birth-date').fill('2021-01-01');

      // No photo selected
      await page.getByTestId('pet-submit').click();
      await expect(page).toHaveURL('/');
      await expect(page.getByText(petName)).toBeVisible();

      // Verify photo_url is null
      const petsRes = await request.get(`${API_URL}/pets`);
      const pets = await petsRes.json();
      const noPhotoCat = pets.find((p: { name: string }) => p.name === petName);
      expect(noPhotoCat).toBeDefined();
      expect(noPhotoCat.photo_url).toBeNull();

      // Cleanup
      if (noPhotoCat?.id) {
        await request.delete(`${API_URL}/pets/${noPhotoCat.id}`);
      }
    });
  });

  test.describe('Story 10.2 — Photo lors de l\'édition', () => {

    test('[P0] should show photo input and current photo on edit form', async ({ page, seedPet }) => {
      const pet = await seedPet({ name: 'EditPhotoPet' });
      await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });

      await expect(page.getByTestId('pet-photo-input')).toBeVisible();
    });

    test('[P0] should show preview of current photo when pet has a photo', async ({ page, request, seedPet }) => {
      // Create pet then upload a photo via API
      const pet = await seedPet({ name: 'PetWithPhoto' });

      const photoBuffer = require('fs').readFileSync(TEST_PHOTO);
      await request.post(`${API_URL}/pets/${pet.id}/photo`, {
        multipart: {
          file: {
            name: 'test-photo.png',
            mimeType: 'image/png',
            buffer: photoBuffer,
          },
        },
      });

      // Visit edit form
      await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });

      // Should display current photo as preview
      const preview = page.getByTestId('pet-photo-preview');
      await expect(preview).toBeVisible();
    });

    test('[P0] should update photo when new file selected on edit form', async ({ page, request, seedPet }) => {
      const pet = await seedPet({ name: 'UpdatePhotoPet' });

      await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });

      // Select new photo
      await page.getByTestId('pet-photo-input').setInputFiles(TEST_PHOTO);
      await expect(page.getByTestId('pet-photo-preview')).toBeVisible();

      // Submit
      await page.getByTestId('pet-submit').click();
      await page.waitForURL(`/pets/${pet.id}`, { timeout: 5000 });

      // Verify photo updated via API
      const res = await request.get(`${API_URL}/pets/${pet.id}`);
      const updated = await res.json();
      expect(updated.photo_url).not.toBeNull();
      expect(updated.photo_url).toMatch(/\/media\/pets\//);
    });
  });
});
