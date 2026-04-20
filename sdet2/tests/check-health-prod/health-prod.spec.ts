import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/apiClient';

test.describe('@smoke-prod API Validation, Prod Basic Positive Tests', () => {

  let client: ApiClient;

  test.beforeEach(async ({ request }) => {
    client = new ApiClient(request);
  });

  test('Validate GET Action, Fetch All Users', async () => {
    const response = await client.getAll('/users');
    expect(response.status()).toBe(200);
  });

  test('Validate GET Action, Fetch All Users And Check For Array', async () => {
    const response = await client.getAll('/users');
    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
  });

  test('Validate GET Action, Fetch All Users And Check For ResponseTime', async () => {
    const fromHere = Date.now();
    const response = await client.getAll('/users');
    const toHere = Date.now() - fromHere;

    expect(response.status()).toBe(200);
    expect(toHere).toBeLessThan(200);
  });

});