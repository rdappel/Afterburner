import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4321' },
  projects: [
    { name: 'desktop-chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile-chromium', use: devices['Pixel 5'] },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
});
