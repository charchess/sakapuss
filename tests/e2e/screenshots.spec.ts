import { test, chromium } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SCREENSHOT_DIR = '/tmp/sakapuss-screenshots';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8000';

test('take screenshots of all pages', async () => {
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Register (idempotent)
  await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@sakapuss.fr', password: 'TestPass123' }),
  }).catch(() => null);

  // Unauthenticated pages
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(SCREENSHOT_DIR, '01-login.png'), fullPage: true });

  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(SCREENSHOT_DIR, '02-register.png'), fullPage: true });

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'test@sakapuss.fr');
  await page.fill('input[type="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Authenticated pages
  for (const [name, url] of [
    ['03-dashboard', '/'],
    ['04-timeline', '/timeline'],
    ['05-reminders', '/reminders'],
    ['06-settings', '/settings'],
    ['07-pets-new', '/pets/new'],
    ['08-bowls', '/bowls'],
    ['09-food', '/food'],
  ]) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
  }

  await browser.close();
});
