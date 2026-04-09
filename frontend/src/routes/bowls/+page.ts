import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
  const API_URL = getApiUrl();
  const [bowlsRes, petsRes] = await Promise.all([
    fetch(`${API_URL}/bowls`),
    fetch(`${API_URL}/pets`),
  ]);

  const bowls = bowlsRes.ok ? await bowlsRes.json() : [];
  const pets = petsRes.ok ? await petsRes.json() : [];

  // Load serving counts per bowl
  const servingCounts: Record<string, number> = {};
  for (const bowl of bowls) {
    const res = await fetch(`${API_URL}/bowls/${bowl.id}/servings`);
    const servings = res.ok ? await res.json() : [];
    servingCounts[bowl.id] = servings.length;
  }

  return { bowls, pets, servingCounts };
};
