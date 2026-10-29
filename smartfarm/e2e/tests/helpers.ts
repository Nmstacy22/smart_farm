import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'Farm2026!test';

// Unique per run so tests never collide with leftovers (the DB is also reset per run)
const runId = Date.now().toString(36);
export const email = (who: string) => `${who}.${runId}@smartfarm.test`;

/**
 * Records browser console errors and uncaught exceptions. Call `expectClean()` at the end
 * of a test to fail on anything unexpected.
 */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  const allowed: RegExp[] = [];
  const push = (e: string) => { if (!allowed.some((re) => re.test(e))) errors.push(e); };
  page.on('pageerror', (err) => push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Failed requests are reported below with their URL and response body instead
    if (msg.text().startsWith('Failed to load resource')) return;
    push(`console: ${msg.text()}`);
  });
  page.on('response', async (res) => {
    if (res.status() < 400) return;
    const url = res.url().replace(/^https?:\/\/[^/]+/, '');
    // Expected: RLS-filtered single-row lookups the app handles (PostgREST 406 = no row)
    if (res.status() === 406) return;
    const body = await res.text().catch(() => '');
    push(`HTTP ${res.status()} ${res.request().method()} ${url} ${body.slice(0, 300)}`);
  });
  return {
    errors,
    expectClean: () => expect(errors, 'browser errors').toEqual([]),
    /** Mark an error the test triggers on purpose (e.g. trying an invalid code) as expected. */
    allow: (re: RegExp) => { allowed.push(re); },
  };
}

export async function signUp(page: Page, address: string) {
  await page.goto('/signup');
  await page.getByPlaceholder('name@domain.com').fill(address);
  await page.getByPlaceholder('Min 8 chars, 1 uppercase, 1 number').fill(PASSWORD);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create Account' }).click();
  // Email confirmation is off locally, so sign-up logs straight in and lands on onboarding
  await expect(page.getByRole('heading', { name: 'Welcome to SmartFarm' })).toBeVisible({ timeout: 20_000 });
}

export async function signIn(page: Page, address: string) {
  await page.goto('/login');
  await page.getByPlaceholder('name@domain.com').fill(address);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
}

/** Sidebar link (desktop layout). */
export const navLink = (page: Page, name: string) => page.locator('aside').getByRole('link', { name, exact: true });

/** Navigate through the sidebar, like a user would, and wait for the page heading. */
export async function openPage(page: Page, link: string, heading: string | RegExp) {
  await navLink(page, link).click();
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
}
