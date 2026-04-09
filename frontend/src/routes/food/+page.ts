import type { PageLoad } from './$types';
import { getApiUrl } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
  const API_URL = getApiUrl();
  const [productsRes, bagsRes] = await Promise.all([
    fetch(`${API_URL}/food/products`),
    fetch(`${API_URL}/food/bags`),
  ]);

  const products = productsRes.ok ? await productsRes.json() : [];
  const bags = bagsRes.ok ? await bagsRes.json() : [];

  return { products, bags };
};
