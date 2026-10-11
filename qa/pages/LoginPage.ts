import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> { await this.page.goto('/'); }

  async login(username: string, password = 'secret_sauce'): Promise<void> {
    await this.page.getByTestId('username').fill(username);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-button').click();
  }

  async expectProducts(): Promise<void> { await expect(this.page.getByText('Products', { exact: true })).toBeVisible(); }
}
