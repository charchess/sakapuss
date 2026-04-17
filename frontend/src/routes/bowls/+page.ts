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

  // Load serving counts and last served time per bowl
  const servingCounts: Record<string, number> = {};
  const lastServedAt: Record<string, string | null> = {};
  for (const bowl of bowls) {
    const res = await fetch(`${API_URL}/bowls/${bowl.id}/servings`);
    const servings = res.ok ? await res.json() : [];
    servingCounts[bowl.id] = servings.length;
    if (servings.length > 0) {
      const sorted = [...servings].sort((a: any, b: any) =>
        new Date(b.served_at).getTime() - new Date(a.served_at).getTime()
      );
      lastServedAt[bowl.id] = sorted[0].served_at;
    } else {
      lastServedAt[bowl.id] = null;
    }
  }

  return { bowls, pets, servingCounts, lastServedAt };
};
