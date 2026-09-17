import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('is what the root path routes to', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your companion for tabletop D&D');
    });

    test('says what the application does', async ({ page }) => {
        await expect(page.getByText('Manage characters, roll dice, and build maps and lore.')).toBeVisible();
    });
});
