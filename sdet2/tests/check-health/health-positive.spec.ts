import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/apiClient';

test.describe('@smoke API Validation, Basic Positive Tests', () => {

  let client: ApiClient;
  let genericEmail : string;

  test.beforeEach(async ({ request }) => {
    client = new ApiClient(request);

    genericEmail = `generic_${Date.now()}@test.com`;
    await client.post('/users', {name: 'test_generic_purpose', email: genericEmail, age: 32});
  });

  test.afterEach(async () => {
    if (genericEmail) {
      const deleteResponse = await client.delete(`/users/${genericEmail}`);
      console.log(`Deleted: ${genericEmail}`);
      genericEmail = '';
    }
  });

  test('Validate GET Action, Fetch All Users', async () => {
    const fromHere = Date.now();
    const response = await client.getAll('/users');
    const toHere = Date.now() - fromHere;
    const body = await response.json();

    console.log('Status: ', response.status());

    expect(response.status()).toBe(200);
    expect(toHere).toBeLessThan(200);
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('Validate GET Action, Check each user has required fields', async () => {
    const response = await client.getAll('/users');
    const users = await response.json();

    users.forEach((user: any) => {
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.age).toBeDefined();
    });
  });

  test('Validate GET Action, Fetch By Valid Email', async () => {
    const getUsers = await client.getAll('/users');
    const usersList = await getUsers.json();
    const firstEmail = usersList[0].email;

    const fullPath = "/users/" + firstEmail;
    const firstUser = await client.getById(fullPath);
    expect(firstUser.status()).toBe(200);

    const user = await firstUser.json();
    expect(user.email).toBe(firstEmail);
  });

  
  test('Validate POST Action, Create New User', async () => {
    const randomEmail = `smoke_${Date.now()}@test.com`;
    const response = await client.post('/users', {
      name: 'Smoke_Test_User',
      email: randomEmail,
      age: 25
    });

    expect(response.status()).toBe(201);

    const remove = await client.delete(`/users/${randomEmail}`);
    expect(remove.status()).toBe(204);
  });

  test('Validate DELETE Action, NotFound, Already Deleted', async () => {
    const user = await client.post('/users', {name: "TestDel", email: "validMail@gmail.com", age: 20});
    const userResp = await user.json();

    const deleteFirstTime = await client.delete(`/users/${userResp.email}`);
    expect(deleteFirstTime.status()).toBe(204);

    const deleteSecondTime = await client.delete(`/users/${userResp.email}`);
    expect(deleteSecondTime.status()).toBe(404);
  });

  test('Validate PUT Action, Check For Idempotency', async ()=> {
    const user = await client.post('/users', {name: "newUserIdempotent", email: "idempotent@gmail.com", age: 15});
    const userResponse = await user.json();

    const putFirstTime = await client.put(`/users/${userResponse.email}`, {name: "newUserIdempotent", email: userResponse.email, age: 15});
    expect(putFirstTime.status()).toBe(200);
    const putFirstResp = await putFirstTime.json();

    const putSecTime = await client.put(`/users/${userResponse.email}`, {name: "newUserIdempotent", email: userResponse.email, age: 15});
    expect(putSecTime.status()).toBe(200);
    const putSecResp = await putSecTime.json();

    expect(putFirstResp).toStrictEqual(putSecResp);

    await client.delete(`/users/${userResponse.email}`);
  });

});