import { expect, test } from '@playwright/test';

test.describe('Not found page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
    });

    test('is what an unmatched path routes to', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    });

    test('offers a way back to the home page', async ({ page }) => {
        await page.getByRole('link', { name: 'Go to the home page' }).click();

        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your companion for tabletop D&D');
    });
});
