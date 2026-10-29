import { test, expect } from '@playwright/test';
import { trackErrors } from './helpers';

test.describe('public pages (signed out)', () => {
  test('landing page renders with sign-up and login links', async ({ page }) => {
    const errs = trackErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Grow smarter');
    await expect(page.getByRole('link', { name: /Create Account/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    errs.expectClean();
  });

  test('marketing page /landing renders', async ({ page }) => {
    const errs = trackErrors(page);
    await page.goto('/landing');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    errs.expectClean();
  });

  test('login and signup forms render', async ({ page }) => {
    const errs = trackErrors(page);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    errs.expectClean();
  });

  test('wrong password shows an error and stays on login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('name@domain.com').fill('nobody@smartfarm.test');
    await page.getByPlaceholder('••••••••').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  for (const path of ['/dashboard', '/crops', '/finance', '/weather', '/market', '/communication', '/users', '/settings']) {
    test(`${path} redirects to login when signed out`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL('**/login');
    });
  }

  test('API routes reject signed-out requests', async ({ request }) => {
    expect((await request.get('/api/weather?location=Buea')).status()).toBe(401);
    const sms = await request.post('/api/sms', { data: { farmId: 'x', recipientIds: ['y'], message: 'hi' } });
    expect(sms.status()).toBe(401);
  });
});
