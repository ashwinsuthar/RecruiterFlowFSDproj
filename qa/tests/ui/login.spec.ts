import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('standard user can log in and see Products', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('standard_user');
  await login.expectProducts();
});

test('locked out user sees the locked out error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('locked_out_user');
  await expect(page.getByTestId('error')).toContainText('locked out');
});
