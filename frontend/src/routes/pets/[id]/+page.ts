import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  const API_URL = getApiUrl();
  const [petRes, eventsRes, remindersRes, anomaliesRes, allPetsRes, correlationsRes, resourcesRes] = await Promise.all([
    fetch(`${API_URL}/pets/${params.id}`),
    fetch(`${API_URL}/pets/${params.id}/events`),
    fetch(`${API_URL}/pets/${params.id}/reminders`).catch(() => null),
    fetch(`${API_URL}/pets/${params.id}/anomalies`).catch(() => null),
    fetch(`${API_URL}/pets`),
    fetch(`${API_URL}/pets/${params.id}/correlations`).catch(() => null),
    fetch(`${API_URL}/resources`).catch(() => null),
  ]);

  if (!petRes.ok) throw new Error('Pet not found');

  const pet = await petRes.json();
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const reminders = remindersRes?.ok ? await remindersRes.json() : [];
  const anomalies = anomaliesRes?.ok ? await anomaliesRes.json() : [];
  const allPets = allPetsRes.ok ? await allPetsRes.json() : [];
  const correlations = correlationsRes?.ok ? await correlationsRes.json() : [];
  const allResources = resourcesRes?.ok ? await resourcesRes.json() : [];
  const litterResources = allResources.filter((r: any) => r.type === 'litter');

  return { pet, events, reminders, anomalies, allPets, correlations, litterResources };
};
