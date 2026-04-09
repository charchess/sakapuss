/**
 * Story 12.1 & 12.2 — Infrastructure smoke tests.
 * Ces tests API vérifient que les fichiers d'infrastructure existent
 * et que le pipeline CI est correctement configuré.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(__dirname, '../..');

test.describe('Story 12.1 — Production Docker Infrastructure', () => {

  test('Dockerfile exists and exposes port 8000', () => {
    const dockerfile = readFileSync(resolve(ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('EXPOSE 8000');
    expect(dockerfile).toContain('uvicorn');
  });

  test('Dockerfile.frontend exists with multi-stage build', () => {
    const df = readFileSync(resolve(ROOT, 'Dockerfile.frontend'), 'utf-8');
    expect(df).toContain('FROM node');
    expect(df).toContain('FROM nginx');
    expect(df).toContain('NODE_ENV=production');
    expect(df).toContain('EXPOSE 80');
  });

  test('docker-compose.yml has backend and frontend services', () => {
    const raw = readFileSync(resolve(ROOT, 'docker-compose.yml'), 'utf-8');
    const dc = parseYaml(raw);
    expect(dc.services).toHaveProperty('backend');
    expect(dc.services).toHaveProperty('frontend');
    // Frontend exposes port 80
    const frontendPorts: string[] = dc.services.frontend.ports || [];
    expect(frontendPorts.some((p: string) => p.includes('80'))).toBe(true);
    // Backend persists data volume
    const backendVolumes: string[] = dc.services.backend.volumes || [];
    expect(backendVolumes.some((v: string) => v.includes('data'))).toBe(true);
  });

  test('nginx.conf exists and proxies /api/ to backend', () => {
    const nginx = readFileSync(resolve(ROOT, 'nginx.conf'), 'utf-8');
    expect(nginx).toContain('location /api/');
    expect(nginx).toContain('proxy_pass http://backend');
    expect(nginx).toContain('listen 80');
    expect(nginx).toContain('try_files'); // SPA fallback
  });

  test('.env.example exists with required keys', () => {
    const env = readFileSync(resolve(ROOT, '.env.example'), 'utf-8');
    expect(env).toContain('API_URL');
    expect(env).toContain('BASE_URL');
  });
});

test.describe('Story 12.2 — GitHub Actions CI Pipeline', () => {

  test('test.yml exists at .github/workflows/test.yml', () => {
    const ciPath = resolve(ROOT, '.github/workflows/test.yml');
    expect(existsSync(ciPath)).toBe(true);
  });

  test('test.yml is valid YAML with required jobs', () => {
    const raw = readFileSync(resolve(ROOT, '.github/workflows/test.yml'), 'utf-8');
    const ci = parseYaml(raw);

    // Has trigger on push/PR
    expect(ci.on).toBeDefined();
    expect(ci.on.push || ci.on.pull_request).toBeTruthy();

    // Has backend tests job
    expect(ci.jobs).toHaveProperty('backend-tests');
    expect(JSON.stringify(ci.jobs['backend-tests'])).toContain('pytest');

    // Has E2E tests job
    expect(ci.jobs).toHaveProperty('e2e-tests');
    expect(JSON.stringify(ci.jobs['e2e-tests'])).toContain('playwright');

    // Has security job (gitleaks + audits)
    expect(ci.jobs).toHaveProperty('security');

    // Has quality gate
    expect(ci.jobs).toHaveProperty('quality-gate');
  });

  test('CI runs both chromium and mobile-chrome projects', () => {
    const raw = readFileSync(resolve(ROOT, '.github/workflows/test.yml'), 'utf-8');
    expect(raw).toContain('chromium');
    expect(raw).toContain('mobile-chrome');
  });

  test('CI uploads Playwright report as artifact', () => {
    const raw = readFileSync(resolve(ROOT, '.github/workflows/test.yml'), 'utf-8');
    expect(raw).toContain('playwright-report');
    expect(raw).toContain('upload-artifact');
  });
});
