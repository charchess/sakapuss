import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';

export const handlers = [
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      access_token: 'test-token-123',
      user: { id: 'u1', email: 'test@test.com', display_name: 'Testeur', role: 'admin' },
    })
  ),

  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({
      access_token: 'test-token-456',
      user: { id: 'u2', email: 'new@test.com', display_name: 'Nouveau', role: 'admin' },
    })
  ),

  http.get(`${BASE}/pets`, () =>
    HttpResponse.json([
      { id: 'p1', name: 'Luna', species: 'cat', breed: 'Européen', birth_date: '2020-03-15', photo_url: null },
      { id: 'p2', name: 'Milo', species: 'dog', breed: 'Labrador', birth_date: '2019-07-22', photo_url: null },
    ])
  ),

  http.get(`${BASE}/pets/p1/events`, () =>
    HttpResponse.json([
      { id: 'e1', pet_id: 'p1', pet_name: 'Luna', type: 'weight', occurred_at: '2026-04-18T10:00:00Z', payload: { grams: 4200 } },
      { id: 'e2', pet_id: 'p1', pet_name: 'Luna', type: 'litter_clean', occurred_at: '2026-04-18T09:00:00Z', payload: {} },
    ])
  ),

  http.post(`${BASE}/pets`, () =>
    HttpResponse.json(
      { id: 'p_new', name: 'Nouveau', species: 'Cat', birth_date: '2023-01-01', breed: null, photo_url: null },
      { status: 201 }
    )
  ),

  http.get(`${BASE}/pets/p2/events`, () =>
    HttpResponse.json([
      { id: 'e3', pet_id: 'p2', pet_name: 'Milo', type: 'food_serve', occurred_at: '2026-04-18T08:00:00Z', payload: {} },
    ])
  ),

  http.post(`${BASE}/pets/p1/events`, () =>
    HttpResponse.json({ id: 'e_new', pet_id: 'p1', type: 'weight', occurred_at: new Date().toISOString(), payload: { grams: 4200 } })
  ),

  http.get(`${BASE}/events`, () =>
    HttpResponse.json([
      { id: 'e1', pet_id: 'p1', pet_name: 'Luna', type: 'weight', occurred_at: '2026-04-18T10:00:00Z', payload: { grams: 4200 } },
      { id: 'e2', pet_id: 'p2', pet_name: 'Milo', type: 'litter_clean', occurred_at: '2026-04-18T08:00:00Z', payload: {} },
    ])
  ),

  http.get(`${BASE}/reminders/pending`, () =>
    HttpResponse.json([
      { id: 'r1', pet_id: 'p1', pet_name: 'Luna', name: 'Vaccin rage', type: 'vaccine', next_due_date: '2020-01-01', status: 'overdue' },
      { id: 'r2', pet_id: 'p1', pet_name: 'Luna', name: 'Bilan annuel', type: 'vet', next_due_date: '2099-12-31', status: 'upcoming' },
    ])
  ),
];

export const emptyHandlers = [
  http.get(`${BASE}/pets`, () => HttpResponse.json([])),
  http.get(`${BASE}/events`, () => HttpResponse.json([])),
  http.get(`${BASE}/reminders/pending`, () => HttpResponse.json([])),
];
