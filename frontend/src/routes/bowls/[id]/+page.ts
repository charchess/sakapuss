import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ params, fetch }) => {
  const API_URL = getApiUrl();
  const [bowlRes, servingsRes] = await Promise.all([
    fetch(`${API_URL}/bowls`),
    fetch(`${API_URL}/bowls/${params.id}/servings`),
  ]);
  const bowls = bowlRes.ok ? await bowlRes.json() : [];
  const bowl = bowls.find((b: any) => b.id === params.id) || null;
  const servings = servingsRes.ok ? await servingsRes.json() : [];
  return { bowl, servings };
};
