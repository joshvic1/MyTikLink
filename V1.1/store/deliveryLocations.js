import { apiRequest } from '../lib/api';

const cache = new Map();
// Geography is shared by all stores. Coalesce concurrent lookups, retain only
// small country/region lists, and evict failed requests so retry works.
export function deliveryLocations(kind, parameters = {}) {
  const query = new URLSearchParams(parameters).toString();
  const key = `${kind}?${query}`;
  const existing = cache.get(key);
  if (existing && existing.expires > Date.now()) return existing.promise;
  const promise = apiRequest(`/v1-1/store-studio/commerce/locations/${key}`, { token: null })
    .then(result => result.items || [])
    .catch(error => { cache.delete(key); throw error; });
  if (cache.size > 80) cache.delete(cache.keys().next().value);
  cache.set(key, { promise, expires: Date.now() + 3600000 });
  return promise;
}

export const countryFlag = code => /^[A-Z]{2}$/.test(code || '')
  ? String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0))) : '';
