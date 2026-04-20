import { defineConfig } from '@playwright/test';
export const BASE_URL = (process.env.BASE_URL as string) || 'http://localhost:3000/dev';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  }
});