import { defineConfig, devices } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '../tests/.auth/test-user.json');

export default defineConfig({
  testDir: '../tests',
  globalSetup: '../tests/global-setup.ts',
  globalTeardown: '../tests/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../playwright-report', open: 'never' }],
    ['junit', { outputFile: '../test-results/results.xml' }],
    ['list']
  ],
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  timeout: 60000,
  expect: { timeout: 10000 },
  projects: [
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_URL || 'http://localhost:8000',
      },
    },
    {
      name: 'chromium',
      testMatch: 'e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        storageState: AUTH_FILE,
      },
    },
    {
      name: 'mobile-chrome',
      testMatch: 'e2e/**/*.spec.ts',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        storageState: AUTH_FILE,
      },
    },
  ],
});
