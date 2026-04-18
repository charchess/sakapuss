export const DEFAULT_BASE_URL = 'http://localhost:8000';

export const Endpoints = {
  login: '/auth/login',
  register: '/auth/register',
  pets: '/pets',
  petEvents: (petId: string) => `/pets/${petId}/events`,
  allEvents: '/events',
  reminders: '/reminders/pending',
  syncPush: '/sync/push',
  syncPull: '/sync/pull',
  devices: '/devices',
};
