import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  const API_URL = getApiUrl();
  const [petRes, eventsRes, correlRes, allPetsRes] = await Promise.all([
    fetch(`${API_URL}/pets/${params.id}`),
    fetch(`${API_URL}/pets/${params.id}/events`),
    fetch(`${API_URL}/pets/${params.id}/correlations`),
    fetch(`${API_URL}/pets`),
  ]);

  if (!petRes.ok) {
    throw new Error('Pet not found');
  }

  const pet = await petRes.json();
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const correlations = correlRes.ok ? await correlRes.json() : [];
  const allPets = allPetsRes.ok ? await allPetsRes.json() : [];

  return { pet, events, correlations, allPets };
};
