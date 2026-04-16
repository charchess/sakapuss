import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const API_URL = process.env.API_URL || 'http://localhost:8000';
const AUTH_FILE = path.join(__dirname, '.auth/test-user.json');
export const TEST_EMAIL = 'playwright-e2e@test.sakapuss.local';
export const TEST_PASSWORD = 'PlaywrightTest123!';

async function globalSetup(_config: FullConfig) {
  // Ensure auth dir exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Register test user (idempotent — ignores 409 conflict)
  await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  }).catch(() => null);

  // Login and store token
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const { access_token, user } = await res.json();

  // Save browser storage state with token in localStorage
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(process.env.BASE_URL || 'http://localhost:5173');
  await page.evaluate(({ token, userData }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  }, { token: access_token, userData: user });

  await context.storageState({ path: AUTH_FILE });
  await browser.close();

  // Store token for teardown
  process.env.E2E_TOKEN = access_token;
}

export default globalSetup;
