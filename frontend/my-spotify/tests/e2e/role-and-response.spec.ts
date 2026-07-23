import { test, expect, type Page } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const resolveUrl = (path: string) => new URL(path, baseURL).toString();

async function openLoginPage(page: Page) {
  await page.goto(resolveUrl('/login'), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 20000 });
}

test.describe('Responsive and role-aware UI flows', () => {
  test.beforeEach(async ({ page }) => {
    await openLoginPage(page);
  });

  test('opens the settings page and exposes account management controls', async ({ page }) => {
    await page.getByLabel('Email').fill('jane@gmail.com');
    await page.locator('input[placeholder="Password"]').first().fill('J123_abcd');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.goto(resolveUrl('/settings'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Account|Subscription/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible({ timeout: 20000 });
  });

  test('supports the mobile layout and sidebar navigation to playlists', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel('Email').fill('jane@gmail.com');
    await page.locator('input[placeholder="Password"]').first().fill('J123_abcd');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.goto(resolveUrl('/playlists'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible({ timeout: 20000 });
  });

  test('supports the supporter dashboard route with verification and tickets views', async ({ page }) => {
    await page.getByLabel('Email').fill('support@gmail.com');
    await page.locator('input[placeholder="Password"]').first().fill('Support_1234');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/support/, { timeout: 20000 });
    await expect(page.locator('body')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Verification|Tickets/i).first()).toBeVisible({ timeout: 20000 });
  });
});
