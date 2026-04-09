/**
 * API URL helpers.
 *
 * - Dev (vite dev server on port 5173): backend runs on port 8000 directly.
 * - Production (nginx on port 80): nginx proxies /api/ to the backend.
 *   The browser uses a relative URL so no hardcoded port is needed.
 */

/** For use in +page.ts load functions (may run server-side or client-side) */
export const API_URL_SERVER = 'http://localhost:8000';

/** For use in .svelte components (runs in browser) */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // Dev servers (vite on 5173): connect directly to backend port 8000
    if (port && port !== '80' && port !== '443') {
      return `http://${window.location.hostname}:8000`;
    }
    // Production (nginx on 80/443): use relative path proxied by nginx
    return '/api';
  }
  // SSR fallback
  return 'http://localhost:8000';
}
