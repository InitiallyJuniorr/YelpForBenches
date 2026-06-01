import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
    // Go to page in browser
    await page.goto('http://localhost:5173');
    
    // Click Log In to reveal the form
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Fill in credentials
    await page.fill('input[placeholder="Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Password"]', 'User123!');
    
    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Assert redirect to /app
    await expect(page).toHaveURL(/app/);
});