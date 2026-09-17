import { expect, test } from '@playwright/test';

test.describe('Root page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has the application title', async ({ page }) => {
        await expect(page).toHaveTitle('D&D Mapp');
    });

    test('is in US English', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    });

    test('renders the root component', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('root works!');
    });

    test('shows the top bar', async ({ page }) => {
        await expect(page.getByRole('banner')).toBeVisible();
    });

    test('offers logging in and signing up from the top bar', async ({ page }) => {
        const banner = page.getByRole('banner');

        await expect(banner.getByRole('button', { name: 'Log in' })).toBeVisible();
        await expect(banner.getByRole('button', { name: 'Sign up' })).toBeVisible();
    });
});
