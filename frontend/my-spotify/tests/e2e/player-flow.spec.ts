import { test, expect, type Page } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const resolveUrl = (path: string) => new URL(path, baseURL).toString();

async function login(page: Page, email: string, password: string) {
  await page.goto(resolveUrl('/login'), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.getByLabel('Email').fill(email);
  await page.locator('input[placeholder="Password"]').first().fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/home/, { timeout: 20000 });
}

test.describe('Playback interaction flows', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'jane@gmail.com', 'J123_abcd');
  });

  test('starts playback from the album hero action', async ({ page }) => {
    await page.goto('/album/a1', { waitUntil: 'domcontentloaded' });

    await page.locator('button').filter({ has: page.locator('svg.lucide-play') }).first().click();

    await expect(page.getByText('Midnight Pulse').first()).toBeVisible({ timeout: 15000 });
  });

  test('selects a song from the album list and starts that track', async ({ page }) => {
    await page.goto('/album/a1', { waitUntil: 'domcontentloaded' });

    const songRow = page.locator('div').filter({ hasText: 'Cosmic Drift' }).first();
    await songRow.hover();
    await songRow.locator('button').first().click();

    await expect(page.getByText('Cosmic Drift').first()).toBeVisible({ timeout: 15000 });
  });

  test('pauses and resumes playback from the player controls', async ({ page }) => {
    await page.goto('/album/a1', { waitUntil: 'domcontentloaded' });

    await page.locator('button').filter({ has: page.locator('svg.lucide-play') }).first().click();

    const playerContainer = page.locator('div').filter({ hasText: 'Midnight Pulse' }).first();
    await playerContainer.locator('button').filter({ has: page.locator('svg.lucide-pause') }).first().click();
    await expect(playerContainer.locator('button').filter({ has: page.locator('svg.lucide-play') }).first()).toBeVisible({ timeout: 10000 });
  });

  test('skips to the next track from the player controls', async ({ page }) => {
    await page.goto('/album/a1', { waitUntil: 'domcontentloaded' });

    await page.locator('button').filter({ has: page.locator('svg.lucide-play') }).first().click();

    const playerContainer = page.locator('div').filter({ hasText: 'Midnight Pulse' }).first();
    await playerContainer.locator('button').filter({ has: page.locator('svg.lucide-skip-forward') }).first().click();

    await expect(page.getByText('Cosmic Drift').first()).toBeVisible({ timeout: 15000 });
  });

  test('starts playback from a playlist view and shows the active track', async ({ page }) => {
    await page.goto(resolveUrl('/playlist/p1'), { waitUntil: 'domcontentloaded' });

    const songRow = page.locator('div').filter({ hasText: 'Ethereal Echoes' }).first();
    await songRow.hover();
    await songRow.locator('button').first().click();

    await expect(page.getByText('Ethereal Echoes').first()).toBeVisible({ timeout: 15000 });
  });
});
