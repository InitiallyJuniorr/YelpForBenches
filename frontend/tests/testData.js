export const TEST_USER = {
    email: 'user@gmail.com',
    password: 'User123!'
}

export async function login(page) {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.fill('input[placeholder="Email"]', TEST_USER.email);
    await page.fill('input[placeholder="Password"]', TEST_USER.password);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(/app/);
}