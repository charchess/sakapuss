import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/pets/${params.id}`);

  if (!res.ok) {
    throw new Error('Pet not found');
  }

  const pet = await res.json();
  return { pet };
};
