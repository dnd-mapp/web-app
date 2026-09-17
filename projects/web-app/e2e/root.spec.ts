import { expect, test } from '@playwright/test';

test.describe('Application shell', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has the application title in the browser', async ({ page }) => {
        await expect(page).toHaveTitle('D&D Mapp');
    });

    test('is in US English', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    });

    test('shows the top bar', async ({ page }) => {
        await expect(page.getByRole('banner')).toBeVisible();
    });

    test("carries the application's name in the top bar, leading back to the home page", async ({ page }) => {
        const brand = page.getByRole('banner').getByRole('link', { name: 'D&D Mapp' });

        await expect(brand).toBeVisible();
        await expect(brand).toHaveAttribute('href', '/');
    });

    test('offers logging in and signing up from the top bar', async ({ page }) => {
        const banner = page.getByRole('banner');

        await expect(banner.getByRole('button', { name: 'Log in' })).toBeVisible();
        await expect(banner.getByRole('button', { name: 'Sign up' })).toBeVisible();
    });
});
