import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
  const API_URL = getApiUrl();

  const [petsRes, eventsRes, bowlsRes, resourcesRes, productsRes] = await Promise.all([
    fetch(`${API_URL}/pets`),
    fetch(`${API_URL}/events?limit=3`).catch(() => null),
    fetch(`${API_URL}/bowls`).catch(() => null),
    fetch(`${API_URL}/resources`).catch(() => null),
    fetch(`${API_URL}/food/products`).catch(() => null),
  ]);

  const pets = petsRes.ok ? await petsRes.json() : [];
  const recentEvents = eventsRes?.ok ? await eventsRes.json() : [];
  const bowls = bowlsRes?.ok ? await bowlsRes.json() : [];
  const resources = resourcesRes?.ok ? await resourcesRes.json() : [];
  const foodProducts = productsRes?.ok ? await productsRes.json() : [];

  return { pets, recentEvents, bowls, resources, foodProducts };
};
