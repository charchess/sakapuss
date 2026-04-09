import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
  const API_URL = getApiUrl();

  const [petsRes, eventsRes] = await Promise.all([
    fetch(`${API_URL}/pets`),
    fetch(`${API_URL}/events?limit=3`).catch(() => null),
  ]);

  const pets = petsRes.ok ? await petsRes.json() : [];
  const recentEvents = eventsRes?.ok ? await eventsRes.json() : [];

  return { pets, recentEvents };
};
