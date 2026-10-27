import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1120 },
  },
  webServer: [
    {
      command: 'node backend/scripts/test-server.js',
      url: 'http://127.0.0.1:5051/api/health',
      timeout: 180000,
    },
    {
      command: 'npm run dev --prefix frontend -- --port 5174',
      url: 'http://127.0.0.1:5174',
      env: { PENNY_API_TARGET: 'http://127.0.0.1:5051' },
      timeout: 60000,
    },
  ],
});
