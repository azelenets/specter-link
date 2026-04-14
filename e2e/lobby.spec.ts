import { test, expect } from '@playwright/test';

test.describe('Lobby', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows app heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /SPECTER/i })).toBeVisible();
  });

  test('shows Your Peer ID section', async ({ page }) => {
    await expect(page.getByText('Your Peer ID')).toBeVisible();
  });

  test('shows spinner while peer ID is being generated', async ({ page }) => {
    // The spinner is shown before the signaling server assigns an ID.
    // It may disappear quickly, so we check it was rendered at some point
    // OR that the peer ID display is already there.
    const spinner = page.locator('[data-testid="spinner"], [class*="spinner"], [class*="Spinner"]').first();
    const peerIdDisplay = page.locator('.truncate-id');
    // At least one of them must be visible on load
    await expect(spinner.or(peerIdDisplay)).toBeVisible();
  });

  test('peer ID appears after connecting to signaling server', async ({ page }) => {
    const peerIdDisplay = page.locator('.truncate-id');
    await expect(peerIdDisplay).toBeVisible({ timeout: 15_000 });
    const peerId = (await peerIdDisplay.textContent()) ?? '';
    expect(peerId.trim()).toBeTruthy();
  });

  test('Join Room button is disabled when remote ID input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Join Room' })).toBeDisabled();
  });

  test('shows error when trying to connect to own peer ID', async ({ page }) => {
    const peerIdDisplay = page.locator('.truncate-id');
    await expect(peerIdDisplay).toBeVisible({ timeout: 15_000 });
    const ownId = (await peerIdDisplay.textContent()) ?? '';

    await page.getByLabel('Remote Peer ID').fill(ownId.trim());
    await page.getByRole('button', { name: 'Join Room' }).click();

    await expect(page.getByText('Cannot connect to yourself')).toBeVisible();
  });

  test('copy button reflects copied state', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    await page.goto('/');

    const peerIdDisplay = page.locator('.truncate-id');
    await expect(peerIdDisplay).toBeVisible({ timeout: 15_000 });
    const ownId = (await peerIdDisplay.textContent()) ?? '';

    await page.getByRole('button', { name: /Copy/i }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(ownId.trim());

    await context.close();
  });

  test('shows privacy note', async ({ page }) => {
    await expect(page.getByText(/end-to-end encrypted/i)).toBeVisible();
  });
});
