import { expect, test } from '@playwright/test';

test.describe('Not found page', () => {
    test('is what an unmatched path redirects to, naming the path that did not match', async ({ page }) => {
        await page.goto('/this-page-does-not-exist');

        await expect(page).toHaveURL(/\/not-found\?path=/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
        await expect(page.getByText('You tried to open /this-page-does-not-exist.')).toBeVisible();
    });

    test('is reachable directly, with no attempted path to show', async ({ page }) => {
        await page.goto('/not-found');

        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
        await expect(page.getByText('You tried to open', { exact: false })).toBeHidden();
    });

    test('offers a way back to the home page', async ({ page }) => {
        await page.goto('/not-found');
        await page.getByRole('link', { name: 'Go to the home page' }).click();

        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your companion for tabletop D&D');
    });
});
