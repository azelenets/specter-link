import { test, expect, type BrowserContext, type Page } from '@playwright/test';

/** Wait for a peer to receive its ID from the signaling server. */
async function waitForPeerId(page: Page): Promise<string> {
  const display = page.locator('.truncate-id');
  await expect(display).toBeVisible({ timeout: 15_000 });
  return ((await display.textContent()) ?? '').trim();
}

/** Connect Peer B to Peer A using Peer A's ID. */
async function connectPeers(pageA: Page, pageB: Page): Promise<void> {
  const idA = await waitForPeerId(pageA);
  await waitForPeerId(pageB); // ensure Peer B is also ready

  await pageB.getByLabel('Remote Peer ID').fill(idA);
  await pageB.getByRole('button', { name: 'Join Room' }).click();

  // Both sides must reach in-room state (Leave Room button appears)
  await Promise.all([
    expect(pageA.getByRole('button', { name: 'Leave Room' }).first()).toBeVisible({ timeout: 10_000 }),
    expect(pageB.getByRole('button', { name: 'Leave Room' }).first()).toBeVisible({ timeout: 10_000 }),
  ]);
}

test.describe('Two-peer connection', () => {
  let contextA: BrowserContext;
  let contextB: BrowserContext;
  let pageA: Page;
  let pageB: Page;

  test.beforeEach(async ({ browser }) => {
    contextA = await browser.newContext();
    contextB = await browser.newContext();
    pageA = await contextA.newPage();
    pageB = await contextB.newPage();
    await Promise.all([pageA.goto('/'), pageB.goto('/')]);
  });

  test.afterEach(async () => {
    await contextA.close();
    await contextB.close();
  });

  test('both peers enter the room after connecting', async () => {
    await connectPeers(pageA, pageB);

    // In-room UI: toolbar visible, LIVE badge present
    await expect(pageA.getByText('LIVE')).toBeVisible();
    await expect(pageB.getByText('LIVE')).toBeVisible();

    // Chat panel visible
    await expect(pageA.getByText('Secure Chat')).toBeVisible();
    await expect(pageB.getByText('Secure Chat')).toBeVisible();
  });

  test('messages are delivered between peers', async () => {
    await connectPeers(pageA, pageB);

    // Peer B sends a message
    await pageB.getByLabel('Message input').fill('Hello from B');
    await pageB.getByRole('button', { name: 'Send' }).click();

    // Peer A receives it as an incoming message
    await expect(pageA.locator('.message-peer', { hasText: 'Hello from B' })).toBeVisible({ timeout: 5_000 });
    // Peer B sees it as their own sent message
    await expect(pageB.locator('.message-self', { hasText: 'Hello from B' })).toBeVisible();

    // Peer A replies
    await pageA.getByLabel('Message input').fill('Reply from A');
    await pageA.getByRole('button', { name: 'Send' }).click();

    await expect(pageB.locator('.message-peer', { hasText: 'Reply from A' })).toBeVisible({ timeout: 5_000 });
    await expect(pageA.locator('.message-self', { hasText: 'Reply from A' })).toBeVisible();
  });

  test('Enter key sends a message', async () => {
    await connectPeers(pageA, pageB);

    await pageA.getByLabel('Message input').fill('Sent via Enter');
    await pageA.getByLabel('Message input').press('Enter');

    await expect(pageA.locator('.message-self', { hasText: 'Sent via Enter' })).toBeVisible();
    await expect(pageB.locator('.message-peer', { hasText: 'Sent via Enter' })).toBeVisible({ timeout: 5_000 });
  });

  test('leaving the room returns to the lobby', async () => {
    await connectPeers(pageA, pageB);

    // Open leave-room confirmation modal
    await pageA.getByRole('button', { name: 'Leave Room' }).first().click();
    await expect(pageA.getByText('This will close the chat and end any active call.')).toBeVisible();

    // Confirm leave
    await pageA.getByRole('button', { name: 'Leave Room' }).last().click();

    // Peer A is back in the lobby
    await expect(pageA.getByRole('heading', { name: /SPECTER/i })).toBeVisible({ timeout: 5_000 });
    await expect(pageA.getByText('Your Peer ID')).toBeVisible();
  });

  test('cancel on leave-room modal stays in room', async () => {
    await connectPeers(pageA, pageB);

    await pageA.getByRole('button', { name: 'Leave Room' }).first().click();
    await expect(pageA.getByText('This will close the chat and end any active call.')).toBeVisible();

    await pageA.getByRole('button', { name: 'Cancel' }).click();

    // Still in room
    await expect(pageA.getByText('LIVE')).toBeVisible();
  });
});
