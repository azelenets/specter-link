import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
  });

  test('shows 404 code', async ({ page }) => {
    await expect(page.getByText('404')).toBeVisible();
  });

  test('shows Signal Lost heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Signal Lost' })).toBeVisible();
  });

  test('shows descriptive error message', async ({ page }) => {
    await expect(page.getByText(/does not exist or is no longer available/i)).toBeVisible();
  });

  test('Return Home link navigates to /', async ({ page }) => {
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /SPECTER/i })).toBeVisible();
  });
});
