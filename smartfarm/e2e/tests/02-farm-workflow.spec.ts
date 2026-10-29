import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { email, signUp, trackErrors, navLink, openPage } from './helpers';

// One farm, used by an owner and a worker in separate browser sessions. Tests run in order
// and build on each other (e.g. the worker joins with the code the owner saw).
test.describe.configure({ mode: 'serial' });

let ownerCtx: BrowserContext;
let workerCtx: BrowserContext;
let owner: Page;
let worker: Page;
let ownerErrors: ReturnType<typeof trackErrors>;
let workerErrors: ReturnType<typeof trackErrors>;
let inviteCode = '';
const OWNER = email('owner');
const WORKER = email('worker');

test.beforeAll(async ({ browser }) => {
  ownerCtx = await browser.newContext();
  workerCtx = await browser.newContext();
  owner = await ownerCtx.newPage();
  worker = await workerCtx.newPage();
  ownerErrors = trackErrors(owner);
  workerErrors = trackErrors(worker);
  // Pages confirm deletes with window.confirm(); accept them
  owner.on('dialog', (d) => d.accept());
  worker.on('dialog', (d) => d.accept());
});

test.afterAll(async () => {
  await ownerCtx?.close();
  await workerCtx?.close();
});

test.afterEach(() => {
  // Any console error or crash during a step fails that step
  ownerErrors.expectClean();
  workerErrors.expectClean();
});

test('owner signs up and creates a farm', async () => {
  await signUp(owner, OWNER);
  await owner.getByPlaceholder('e.g. Sunrise Acres').fill('E2E Test Farm');
  await owner.getByRole('button', { name: 'Create Farm' }).click();
  await expect(navLink(owner, 'Crops')).toBeVisible({ timeout: 20_000 });
  await expect(owner.getByRole('heading', { level: 1 })).toBeVisible();
});

test('owner sees every page in the menu', async () => {
  for (const name of ['Home', 'Crops', 'Livestock', 'Inventory', 'Tasks', 'Weather', 'Market Prices', 'Finance', 'Reports', 'Messages', 'Team', 'Settings']) {
    await expect(navLink(owner, name)).toBeVisible();
  }
});

test('crops: add a field', async () => {
  await openPage(owner, 'Crops', /./);
  await owner.getByRole('button', { name: 'Add Crop' }).click();
  const dialog = owner.getByRole('dialog');
  await dialog.locator('#title').fill('North Field');
  await dialog.locator('#crop').fill('Maize');
  await dialog.locator('#area').fill('2.5');
  await dialog.getByRole('button', { name: 'Save Field' }).click();
  await expect(dialog).toBeHidden();
  await expect(owner.getByText('North Field')).toBeVisible();
  // Values must survive a reload (i.e. really be saved in the database)
  await owner.reload();
  await expect(owner.getByText('North Field')).toBeVisible();
  await expect(owner.getByText('2.5 ha').first()).toBeVisible();
});

test('livestock: add a batch', async () => {
  await openPage(owner, 'Livestock', /./);
  await owner.getByRole('button', { name: 'Add Livestock' }).click();
  const dialog = owner.getByRole('dialog');
  await dialog.locator('#name').fill('Broiler Batch A');
  await dialog.locator('#type').selectOption('Poultry');
  await dialog.locator('#count').fill('120');
  await dialog.locator('#feed').fill('Grower mash');
  await dialog.getByRole('button', { name: 'Save Livestock' }).click();
  await expect(dialog).toBeHidden();
  await expect(owner.getByText('Broiler Batch A')).toBeVisible();
  await owner.reload();
  await expect(owner.getByText('Broiler Batch A')).toBeVisible();
  await expect(owner.getByText('120', { exact: true }).first()).toBeVisible();
  await expect(owner.getByText('Grower mash')).toBeVisible();
});

test('inventory: add a stock item and see the low-stock warning', async () => {
  await openPage(owner, 'Inventory', 'Inventory Management');
  await owner.getByRole('button', { name: 'Add Stock Item' }).click();
  const dialog = owner.getByRole('dialog');
  await dialog.locator('#name').fill('NPK Fertilizer');
  await dialog.locator('#category').selectOption('Fertilizer');
  await dialog.locator('#qty').fill('3');
  await dialog.getByRole('button', { name: 'Save Stock Item' }).click();
  await expect(dialog).toBeHidden();
  await expect(owner.getByText('NPK Fertilizer')).toBeVisible();
  await expect(owner.getByText(/running low/)).toBeVisible();
  // After a reload the quantity (3, below the low-stock threshold) must still be there
  await owner.reload();
  await expect(owner.getByText('NPK Fertilizer')).toBeVisible();
  await expect(owner.getByText(/running low/)).toBeVisible();
});

test('tasks: create a task and mark it done', async () => {
  await openPage(owner, 'Tasks', 'Task Management');
  await owner.getByRole('button', { name: 'New Task' }).click();
  await owner.getByPlaceholder('Task description (e.g. Apply pesticide to maize)').fill('Weed the north field');
  await owner.locator('form').getByRole('button', { name: /create|add|save/i }).click();
  await expect(owner.getByRole('heading', { name: 'Pending (1)' })).toBeVisible();
  await expect(owner.getByText('Weed the north field')).toBeVisible();

  await owner.getByRole('button', { name: 'Mark "Weed the north field" as done' }).click();
  await expect(owner.getByRole('heading', { name: 'Completed (1)' })).toBeVisible();
  await expect(owner.getByRole('heading', { name: 'Pending (0)' })).toBeVisible();
  // The status is saved, not just shown
  await owner.reload();
  await expect(owner.getByRole('heading', { name: 'Completed (1)' })).toBeVisible();
});

test('finance: record income and see it listed', async () => {
  await openPage(owner, 'Finance', 'Financial Management');
  await owner.getByRole('button', { name: 'Add Transaction' }).click();
  const dialog = owner.getByRole('dialog');
  const selects = dialog.getByRole('combobox');
  await selects.nth(0).click();
  await owner.getByRole('option', { name: 'Income' }).click();
  await dialog.locator('#amount').fill('75000');
  await selects.nth(1).click();
  await owner.getByRole('option', { name: 'Sales & Revenue' }).click();
  await dialog.locator('#description').fill('Sold maize at Muea');
  await dialog.getByRole('button', { name: 'Save Record' }).click();
  await expect(dialog).toBeHidden();
  await expect(owner.getByText('Sold maize at Muea')).toBeVisible();
});

test('reports: shows the farm summary', async () => {
  await openPage(owner, 'Reports', 'Reports & Analytics');
  await expect(owner.getByRole('heading', { name: 'Crops Overview' })).toBeVisible();
  await expect(owner.getByRole('heading', { name: 'Livestock Overview' })).toBeVisible();
});

test('dashboard: home page loads with data', async () => {
  await openPage(owner, 'Home', /./);
  await expect(owner.getByRole('heading', { name: 'Recent Activity' }).first()).toBeVisible();
});

test('weather: sample forecast and field advice without an API key', async () => {
  await openPage(owner, 'Weather', 'Weather');
  await expect(owner.getByText(/Showing sample data/)).toBeVisible();
  await expect(owner.getByRole('heading', { name: 'Field advice' })).toBeVisible();
  await expect(owner.getByRole('heading', { name: '5-day forecast' })).toBeVisible();
  await expect(owner.getByText(/spraying window/i)).toBeVisible();
  // Searching another town reloads the forecast for it
  await owner.getByLabel('Location').fill('Bamenda');
  await owner.getByLabel('Location').press('Enter');
  await expect(owner.getByText('Bamenda', { exact: true })).toBeVisible();
});

test('market: record prices and see the trend', async () => {
  await openPage(owner, 'Market Prices', 'Market Prices');
  await expect(owner.getByText('No prices recorded yet')).toBeVisible();

  const record = async (price: string, market: string, date: string) => {
    await owner.getByRole('button', { name: /Record (first )?price/i }).first().click();
    const dialog = owner.getByRole('dialog');
    await dialog.getByLabel('Crop / Product').fill('Maize');
    await dialog.getByLabel('Market').fill(market);
    await dialog.getByLabel('Price (FCFA)').fill(price);
    await dialog.getByLabel('Date seen').fill(date);
    await dialog.getByRole('button', { name: 'Save Price' }).click();
    await expect(dialog).toBeHidden();
  };
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  await record('200', 'Muea', daysAgo(10));
  await record('260', 'Limbe', daysAgo(2));

  await expect(owner.getByRole('heading', { name: 'Maize price trend' })).toBeVisible();
  // The "All markets" average draws a line even though each market has only one record
  await expect(owner.locator('.recharts-line-curve').first()).toBeVisible();
  await expect(owner.getByText('All markets')).toBeVisible();
  await expect(owner.getByRole('row')).toHaveCount(3); // header + 2 records
  await expect(owner.getByText('+30%')).toBeVisible(); // 200 → 260
});

test('team: owner sees the invite code and saves a phone number', async () => {
  await openPage(owner, 'Team', 'Team');
  const code = owner.locator('code').filter({ hasText: /^[0-9A-F]{5}-[0-9A-F]{5}$/ });
  await expect(code).toBeVisible();
  inviteCode = (await code.textContent())!.trim();

  await owner.getByLabel('Full name').fill('Owner Olivia');
  await owner.getByLabel('Phone number').fill('+237 650 000 001');
  await owner.getByRole('button', { name: 'Save' }).click();
  await expect(owner.getByText('Saved')).toBeVisible();
  await expect(owner.getByText('Owner Olivia')).toBeVisible();
  await expect(owner.getByText('+237650000001')).toBeVisible();

  // Invalid numbers are rejected before saving
  await owner.getByLabel('Phone number').fill('650000001');
  await owner.getByRole('button', { name: 'Save' }).click();
  await expect(owner.getByText(/international format/)).toBeVisible();
});

test('settings: farm profile and invite code', async () => {
  await openPage(owner, 'Settings', 'Settings');
  await expect(owner.getByText('E2E Test Farm')).toBeVisible();
  await expect(owner.locator('code').filter({ hasText: inviteCode })).toBeVisible();
});

test('worker joins the farm with the invite code', async () => {
  await signUp(worker, WORKER);
  // A wrong code is rejected (the failed request is expected)
  workerErrors.allow(/rpc\/join_farm .*Invalid Join Code/);
  await worker.getByPlaceholder('Invite code, e.g. 7F3A9-C21B0').fill('00000-00000');
  await worker.getByPlaceholder('Invite code, e.g. 7F3A9-C21B0').press('Enter');
  await expect(worker.getByText('Invalid Join Code')).toBeVisible();

  await worker.getByPlaceholder('Invite code, e.g. 7F3A9-C21B0').fill(inviteCode.toLowerCase());
  await worker.getByPlaceholder('Invite code, e.g. 7F3A9-C21B0').press('Enter');
  await expect(navLink(worker, 'Crops')).toBeVisible({ timeout: 20_000 });
});

test('worker: finance and reports are hidden, farm data is shared', async () => {
  await expect(navLink(worker, 'Finance')).toHaveCount(0);
  await expect(navLink(worker, 'Reports')).toHaveCount(0);
  await openPage(worker, 'Crops', /./);
  await expect(worker.getByText('North Field')).toBeVisible();

  // Going to /finance directly shows the restricted notice, not the data
  await worker.goto('/finance');
  await expect(worker.getByRole('heading', { name: 'Access Restricted' })).toBeVisible();
  await expect(worker.getByText('Sold maize at Muea')).toHaveCount(0);
});

test('worker: team page has no invite code or role controls', async () => {
  await openPage(worker, 'Team', 'Team');
  await expect(worker.getByText('Owner Olivia')).toBeVisible();
  await expect(worker.locator('code').filter({ hasText: inviteCode })).toHaveCount(0);
  await expect(worker.getByRole('combobox', { name: /Role for/ })).toHaveCount(0);
  await worker.getByLabel('Full name').fill('Worker Wanji');
  await worker.getByRole('button', { name: 'Save' }).click();
  await expect(worker.getByText('Saved')).toBeVisible();
});

test('worker: can record a market price', async () => {
  await openPage(worker, 'Market Prices', 'Market Prices');
  await worker.getByRole('button', { name: 'Record Price' }).click();
  const dialog = worker.getByRole('dialog');
  await dialog.getByLabel('Crop / Product').fill('Cassava');
  await dialog.getByLabel('Price (FCFA)').fill('150');
  await dialog.getByRole('button', { name: 'Save Price' }).click();
  await expect(dialog).toBeHidden();
  await expect(worker.getByRole('button', { name: /Cassava/ })).toBeVisible();
  // Workers can't delete price records
  await expect(worker.getByRole('button', { name: 'Delete record' })).toHaveCount(0);
});

test('messages: worker posts, owner reads and announces', async () => {
  await openPage(worker, 'Messages', 'Messages');
  await expect(worker.getByText('Post as announcement')).toHaveCount(0);
  await expect(worker.getByText(/Only farm owners and managers can send SMS/)).toBeVisible();
  await worker.getByLabel('Message', { exact: true }).fill('Fence is broken near the north field');
  await worker.getByRole('button', { name: 'Post' }).click();
  await expect(worker.getByText('Fence is broken near the north field')).toBeVisible();

  await openPage(owner, 'Messages', 'Messages');
  await expect(owner.getByText('Fence is broken near the north field')).toBeVisible();
  await expect(owner.locator('article').filter({ hasText: 'Fence is broken' }).getByText('Worker Wanji')).toBeVisible();
  await owner.getByLabel('Message', { exact: true }).fill('Vaccination day is Friday at 7am');
  await owner.getByText('Post as announcement').click();
  await owner.getByRole('button', { name: 'Post' }).click();
  await expect(owner.getByText('Latest announcements')).toBeVisible();

  // SMS is not configured in tests: the composer explains how to set it up
  await expect(owner.getByText('SMS is not set up yet')).toBeVisible();
});

test('team: owner promotes the worker to manager, who then sees finance', async () => {
  await openPage(owner, 'Team', 'Team');
  await owner.getByRole('combobox', { name: 'Role for Worker Wanji' }).selectOption('manager');
  await expect(owner.getByRole('combobox', { name: 'Role for Worker Wanji' })).toHaveValue('manager');

  await worker.reload();
  await expect(navLink(worker, 'Finance')).toBeVisible({ timeout: 20_000 });
  await openPage(worker, 'Finance', 'Financial Management');
  await expect(worker.getByText('Sold maize at Muea')).toBeVisible();
});

test('team: a manager cannot change the owner', async () => {
  await openPage(worker, 'Team', 'Team');
  await expect(worker.getByRole('combobox', { name: 'Role for Owner Olivia' })).toHaveCount(0);
  await expect(worker.getByRole('button', { name: 'Remove Owner Olivia' })).toHaveCount(0);
});

test('team: owner removes the member', async () => {
  await owner.reload();
  await owner.getByRole('button', { name: 'Remove Worker Wanji' }).click();
  await expect(owner.getByText('Worker Wanji')).toHaveCount(0);

  // The removed user is sent back to onboarding
  await worker.goto('/dashboard');
  await expect(worker.getByRole('heading', { name: 'Welcome to SmartFarm' })).toBeVisible({ timeout: 20_000 });
});

test('mobile: bottom bar and More menu reach every page', async ({ browser }) => {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await ownerCtx.storageState() });
  const page = await mobile.newPage();
  const errs = trackErrors(page);
  await page.goto('/dashboard');
  const bar = page.getByRole('navigation', { name: 'Bottom navigation' });
  await expect(bar).toBeVisible();
  await bar.getByRole('button', { name: 'More' }).click();
  await page.getByRole('link', { name: 'Weather' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Weather' })).toBeVisible();

  // No page may scroll sideways or have content poking out at phone width
  for (const path of ['/dashboard', '/crops', '/livestock', '/inventory', '/tasks', '/weather', '/market', '/finance', '/reports', '/communication', '/users', '/settings']) {
    await page.goto(path);
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => {
      // The page panel's right edge (or the screen, on pages without one)
      const panel = document.querySelector('main .rounded-\\[2rem\\]');
      const width = panel ? panel.getBoundingClientRect().right : window.innerWidth;
      // Content inside a scroll/clip box that itself fits on screen is fine (e.g. wide tables)
      const clipped = (el: Element) => {
        for (let a = el.parentElement; a; a = a.parentElement) {
          if (['auto', 'scroll', 'hidden'].includes(getComputedStyle(a).overflowX)) return a.getBoundingClientRect().right <= width + 1;
        }
        return false;
      };
      const offenders = [...document.querySelectorAll('main *:not(svg *)')] // the <svg> box is checked; its drawing internals aren't
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > width + 1 && !clipped(el); })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}`);
      return { page: document.documentElement.scrollWidth - window.innerWidth, offenders: offenders.slice(0, 3) };
    });
    expect(overflow, `horizontal overflow on ${path}`).toEqual({ page: 0, offenders: [] });
  }
  errs.expectClean();
  await mobile.close();
});

test('sign out returns to the login page', async () => {
  await owner.locator('aside').getByRole('button', { name: 'Sign Out' }).click();
  await owner.waitForURL(/\/login|\/$/);
  await owner.goto('/dashboard');
  await owner.waitForURL('**/login');
});
