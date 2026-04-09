import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  const API_URL = getApiUrl();
  const [petRes, eventsRes, correlRes] = await Promise.all([
    fetch(`${API_URL}/pets/${params.id}`),
    fetch(`${API_URL}/pets/${params.id}/events`),
    fetch(`${API_URL}/pets/${params.id}/correlations`),
  ]);

  if (!petRes.ok) {
    throw new Error('Pet not found');
  }

  const pet = await petRes.json();
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const correlations = correlRes.ok ? await correlRes.json() : [];

  // Filter to last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentEvents = events.filter(
    (e: any) => new Date(e.occurred_at) >= threeMonthsAgo
  );

  return { pet, events: recentEvents, correlations };
};
