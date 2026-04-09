import { test, expect } from '../support/merged-fixtures';

test.describe('Pets Photos API (ATDD)', () => {
  test('[P1] should upload a profile photo for a pet', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Ficelle', species: 'Cat', birth_date: '2020-01-10' },
    });
    expect(createResponse.status()).toBe(201);
    const pet = await createResponse.json();

    const response = await request.post(`/pets/${pet.id}/photo`, {
      multipart: {
        file: {
          name: 'test-cat.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]),
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.photo_url).toContain('/media/');
    expect(body.photo_url).toContain(`/pets/${pet.id}/`);
  });

  test('[P1] should retrieve uploaded photo via URL', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Miette', species: 'Dog', birth_date: '2019-05-20' },
    });
    expect(createResponse.status()).toBe(201);
    const pet = await createResponse.json();

    const uploadResponse = await request.post(`/pets/${pet.id}/photo`, {
      multipart: {
        file: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        },
      },
    });
    expect(uploadResponse.status()).toBe(200);
    const uploadedPet = await uploadResponse.json();

    const mediaResponse = await request.get(uploadedPet.photo_url);
    expect(mediaResponse.status()).toBe(200);
    expect(mediaResponse.headers()['content-type']).toContain('image/png');
  });

  test('[P1] should replace existing photo', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Plume', species: 'Rabbit', birth_date: '2018-11-11' },
    });
    expect(createResponse.status()).toBe(201);
    const pet = await createResponse.json();

    const firstUpload = await request.post(`/pets/${pet.id}/photo`, {
      multipart: {
        file: {
          name: 'first.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from([255, 216, 255, 224]),
        },
      },
    });
    expect(firstUpload.status()).toBe(200);
    const firstBody = await firstUpload.json();

    const secondUpload = await request.post(`/pets/${pet.id}/photo`, {
      multipart: {
        file: {
          name: 'second.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from([255, 216, 255, 225]),
        },
      },
    });
    expect(secondUpload.status()).toBe(200);
    const secondBody = await secondUpload.json();

    expect(secondBody.photo_url).toContain('/media/');
    expect(secondBody.photo_url).not.toBe(firstBody.photo_url);
  });

  test('[P2] should reject non-image upload', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Nori', species: 'Cat', birth_date: '2021-02-02' },
    });
    expect(createResponse.status()).toBe(201);
    const pet = await createResponse.json();

    const response = await request.post(`/pets/${pet.id}/photo`, {
      multipart: {
        file: {
          name: 'notes.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('not-an-image'),
        },
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('[P1] should return 404 when uploading for a non-existent pet', async ({ request }) => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await request.post(`/pets/${nonExistentId}/photo`, {
      multipart: {
        file: {
          name: 'ghost.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from([255, 216, 255, 224]),
        },
      },
    });

    expect(response.status()).toBe(404);
  });
});
