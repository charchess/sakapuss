import type { FullConfig } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function globalTeardown(_config: FullConfig) {
  const token = process.env.E2E_TOKEN;
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Delete all pets (cascades to events/reminders)
  const petsRes = await fetch(`${API_URL}/pets`, { headers }).catch(() => null);
  if (petsRes?.ok) {
    const pets = await petsRes.json();
    await Promise.all(
      pets.map((p: { id: string }) =>
        fetch(`${API_URL}/pets/${p.id}`, { method: 'DELETE', headers }).catch(() => null)
      )
    );
  }

  // Delete all bowls
  const bowlsRes = await fetch(`${API_URL}/bowls`, { headers }).catch(() => null);
  if (bowlsRes?.ok) {
    const bowls = await bowlsRes.json();
    await Promise.all(
      bowls.map((b: { id: string }) =>
        fetch(`${API_URL}/bowls/${b.id}`, { method: 'DELETE', headers }).catch(() => null)
      )
    );
  }
}

export default globalTeardown;
