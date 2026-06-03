import { test, expect } from '@playwright/test';
import { login } from './testData.js';

test('user can add a review', async ({ page }) => {
    // Login
    await login(page);
    await page.getByRole('link', { name: 'Map', exact: true }).click();
    await page.waitForURL(/app/);

    // Search for a bench
    await page.fill('input[placeholder="Search benches"]', '');
    await page.getByRole('button', { name: 'Search' }).click();

    // Click the bench card from results
    await page.locator('.bench-card').first().click();

    // Click Write Review
    await page.getByRole('button', { name: 'Write Review' }).click();

    // Fill in the review
    await page.getByLabel('2 stars').click();
    await page.fill('textarea[placeholder="Write your Review here."]', 'Awful, mid bench. Sit somewhere else next time.');

    // Submit
    await page.getByRole('button', { name: 'Post Review' }).click();

    // Assert the popup closed
    await expect(page.locator('.write-review-overlay')).not.toBeVisible();
});
