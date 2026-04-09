import { mergeTests } from '@playwright/test';
import { test as base } from './fixtures/base';

// In a real project with @seontechnologies/playwright-utils, we would merge them here:
// import { test as apiRequest } from '@seontechnologies/playwright-utils/api-request/fixtures';
// export const test = mergeTests(base, apiRequest);

export const test = base;
export { expect } from '@playwright/test';
