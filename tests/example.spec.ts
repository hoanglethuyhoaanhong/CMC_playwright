import { test, expect } from '@playwright/test';
import { Page } from 'playwright';


test.describe('playwright demo', () => {
  test('Login feature testing', async({page}) => {
    await page.goto('http://localhost:3000')
    await loginUser(page, 'Heath93', 's3cret')
    await page.pause();
  });

  test('Registed User can login successful', async({page}) => {
    await page.goto('http://localhost:3000')
    const userName = generateRandomString(5);
    const password = 's3cret'
    await registedUser(page, userName, password, 'Hoa', 'Hoang');
    await loginUser(page, userName, password)
  });

  test('Check noti list item number', async({page}) => {
    await page.goto('http://localhost:3000')
    await loginUser(page, 'Heath93', 's3cret')
    const notiListItem = page.locator("//span[contains(@class, 'MuiBadge')]//*[local-name()='svg' and @data-testid='NotificationsIcon']/following-sibling::*[1]")
    await page.waitForTimeout(3000)
    const notiText = await notiListItem.textContent();
    console.log(notiText);
    await expect(notiText).toMatch('8')
  });

  test('dismiss noti', async({page}) => {
    await page.goto('http://localhost:3000')
    await loginUser(page, 'Heath93', 's3cret')
    const notiListItem = page.locator("//span[contains(@class, 'MuiBadge')]//*[local-name()='svg' and @data-testid='NotificationsIcon']/following-sibling::*[1]")
    await page.waitForTimeout(3000)
    const beforeNumber = await notiListItem.textContent();
    await dismissNoti(page);
    const afterNumber = await notiListItem.textContent();
    await expect(beforeNumber).not.toEqual(afterNumber)
  });

})

async function loginUser(page: Page, username: string, password: string) {
  await page.getByLabel('username').fill(username);
  await page.getByLabel('password').fill(password);
  await page.getByRole('button', {name: 'Sign In'}).click();
  await expect(page.getByText(username)).toBeVisible({});
}

async function registedUser(page: Page, username: string, password: string, firstName: string, lastName: string) {
  await page.getByText("Don\'t have an account? Sign Up").click();
  await page.getByText("Don\'t have an account? Sign Up").click();
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('username').fill(username);
  await page.locator('id=password').fill(password);
  await page.locator('id=confirmPassword').fill(password);
  await page.getByRole('button', {name: 'Sign up'}).click();
}

async function dismissNoti(page: Page) {
  await page.getByText("Notifications").click();
  await page.locator("(//ul[@data-test='notifications-list']//button)[1]").click();
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}