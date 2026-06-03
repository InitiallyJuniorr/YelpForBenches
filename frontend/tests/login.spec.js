import { test, expect } from '@playwright/test';
import { login } from './testData.js';

test('user can log in', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/app/);
});