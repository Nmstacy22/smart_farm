import { defineConfig, devices } from '@playwright/test';
import { APP_PORT, APP_URL, localSupabase } from './env';

const sb = localSupabase();

export default defineConfig({
  testDir: './tests',
  // The app tests share one farm and build on each other's data, so run in order
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: '../playwright-report', open: 'never' }]],
  outputDir: '../test-results',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Production build, pointed at the local Supabase. Env vars set here take precedence
    // over .env.local, so the real project is never touched.
    command: `npx next build && npx next start -p ${APP_PORT}`,
    cwd: '..',
    url: APP_URL,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      NEXT_PUBLIC_SUPABASE_URL: sb.url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: sb.anonKey,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sb.anonKey,
      NEXT_PUBLIC_WEATHER_LOCATION: 'Buea',
      // No OpenWeatherMap or Twilio keys: the app must fall back gracefully
      OPENWEATHER_API_KEY: '',
      TWILIO_ACCOUNT_SID: '',
      TWILIO_AUTH_TOKEN: '',
      TWILIO_FROM_NUMBER: '',
    },
  },
});
