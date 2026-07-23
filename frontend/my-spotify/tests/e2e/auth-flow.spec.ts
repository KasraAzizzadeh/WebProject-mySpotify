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

test.describe('UI flow scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await openLoginPage(page);
  });

  test('logs in as a listener and reaches the home dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('alex@gmail.com');
    await page.locator('input[placeholder="Password"]').first().fill('Alex_1234');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/home/, { timeout: 20000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Recently Played|Trending/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('supports password visibility toggle and reset-password navigation', async ({ page }) => {
    await page.getByLabel('Email').fill('jane@gmail.com');
    await page.locator('input[placeholder="Password"]').first().fill('J123_abcd');
    await page.getByRole('button', { name: /show|hide/i }).first().click();

    await expect(page.locator('input[placeholder="Password"]').first()).toHaveAttribute('type', 'text', { timeout: 10000 });
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test('registers a new listener and routes to the home page', async ({ page }) => {
    await page.goto(resolveUrl('/register'), { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Name').fill('Mina Flores');
    await page.getByLabel('Email').fill('mina@example.com');
    await page.locator('input[placeholder="Password"]').first().fill('Mina_1234');
    await page.locator('input[placeholder="Confirm Password"]').first().fill('Mina_1234');
    await page.getByLabel('Birthdate').fill('1998-03-10');
    await page.getByLabel('Gender').selectOption('female');
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/home/, { timeout: 20000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 });
  });
});
