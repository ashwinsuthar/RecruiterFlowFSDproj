import { test, expect } from '@playwright/test';

const apiKey = process.env.REQRES_API_KEY;

test.describe('ReqRes users API', () => {
  test.skip(!apiKey, 'Set REQRES_API_KEY to a key from reqres.in before running API tests.');

  test('gets user 2 and returns an email', async ({ request }) => {
    const response = await request.get('https://reqres.in/api/users/2', { headers: { 'x-api-key': apiKey ?? '' } });
    expect(response.status()).toBe(200);
    const body: { data?: { email?: string } } = await response.json();
    expect(body.data?.email).toBeTruthy();
  });

  test('creates Morpheus and returns the submitted name', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/users', {
      headers: { 'x-api-key': apiKey ?? '' },
      data: { name: 'morpheus', job: 'leader' },
    });
    expect(response.status()).toBe(201);
    const body: { name?: string } = await response.json();
    expect(body.name).toBe('morpheus');
  });
});
