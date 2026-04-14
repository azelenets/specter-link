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

  test('shows generating state before peer ID arrives', async ({ page }) => {
    // "Generating ID…" text is rendered alongside the spinner while waiting
    // for the signaling server. By the time this assertion runs it may have
    // already resolved — so we accept the peer ID display as well.
    const generating = page.getByText('Generating ID…');
    const peerIdDisplay = page.locator('.truncate-id');
    await expect(generating.or(peerIdDisplay)).toBeVisible();
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

  test('copy button reflects copied state and writes to clipboard', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    // clipboard API requires the document to be focused
    await page.bringToFront();

    const peerIdDisplay = page.locator('.truncate-id');
    await expect(peerIdDisplay).toBeVisible({ timeout: 15_000 });
    const ownId = (await peerIdDisplay.textContent()) ?? '';

    // The button has a static aria-label="Copy peer ID"; check text content for state change
    const copyButton = page.getByRole('button', { name: 'Copy peer ID' });
    await copyButton.click();
    await expect(copyButton).toContainText('Copied');

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(ownId.trim());
  });

  test('shows privacy note', async ({ page }) => {
    await expect(page.getByText(/end-to-end encrypted/i)).toBeVisible();
  });
});
