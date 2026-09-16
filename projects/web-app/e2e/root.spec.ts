import { expect, test } from '@playwright/test';

test.describe('Root page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has the application title', async ({ page }) => {
        await expect(page).toHaveTitle('D&D Mapp');
    });

    test('renders the root component', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('root works!');
    });
});
