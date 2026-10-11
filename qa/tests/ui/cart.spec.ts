import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('adding one product updates the cart badge to one', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('standard_user');
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});
