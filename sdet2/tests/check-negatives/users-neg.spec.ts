import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/apiClient';

test.describe('@negative API Validation, Basic Negative Tests', () => {
    let client: ApiClient;
    let nonExistentEmail: string;
    let genericEmail: string;

    test.beforeEach(async ({ request }) => {
        client = new ApiClient(request);
        nonExistentEmail = `non_${Date.now()}@test.com`;
        genericEmail = `generic_${Date.now()}@test.com`;
        await client.post('/users', {name: 'test_generic_purpose', email: genericEmail, age: 55});
    });

    test.afterEach(async () => {
      if (genericEmail) {
        await client.delete(`/users/${genericEmail}`);
      }
    });

    test('Validate GET Action, NotFound User By Email', async () => {
        const response = await client.getById(`/users/${nonExistentEmail}`);
        expect(response.status()).toBe(404);
    });

    test('Validate POST Action, BadRequest, Invalid Payload ', async () => {
        const blankName = { name: '', email: 'valid@test.com', age: 25}
        const blankEmail = { name: 'test', email: '', age: 25}
        const wrongAge = { name: 'test', email: 'valid@test.com', age: false}

        const responseBlankName = await client.post('/users', blankName);
        const responseName = await responseBlankName.json();
        expect(responseBlankName.status()).toBe(400);
        expect(responseName.error).toBe('name is required');

        const responseBlankEmail = await client.post('/users', blankEmail);
        expect(responseBlankEmail.status()).toBe(400);

        const responseWrongAge = await client.post('/users', wrongAge);
        expect(responseWrongAge.status()).toBe(400);
    });

    test('Validate POST Action, BadRequest Age As String', async () => {
      const response = await client.post('/users', {
        name: 'Test User',
        email: 'valid@test.com',
        age: 'abc'
      });
      expect(response.status()).toBe(400);
    });

    test('Validate POST Action, BadRequest Age As Negative', async () => {
      const response = await client.post('/users', {
        name: 'Test User',
        email: 'valid@test.com',
        age: -1
      });
      expect(response.status()).toBe(400);
    });

    test('Validate POST Action, BadRequest, Age Low Boundary', async () => {
      const response = await client.post('/users', {
        name: 'Test User',
        email: 'valid@test.com',
        age: 0
      });
      expect(response.status()).toBe(400);
    });

    test('Validate POST Action, BadRequest, Age High Boundary', async () => {
      const response = await client.post('/users', {
        name: 'Test User',
        email: 'valid@test.com',
        age: 151
      });
      expect(response.status()).toBe(400);
    });

    test('Validate POST Action, BadRequest, Empty Body', async () => {
      const response = await client.post('/users', {});
      const respContent = await response.json();

      expect(response.status()).toBe(400);
      expect(respContent.error).toBe("name is required");
    });

    test('Validate POST Action, Conflict, Repeat Same Email', async () => {
      const randomEmail = `conflict_${Date.now()}@test.com`;
      const firstPayload = { name: 'user1', email: randomEmail, age: 25};

      await client.post('/users', {firstPayload});

      const conflictResponse = await client.post('/users', {name: 'user2', email: randomEmail, age: 30});

      expect(conflictResponse.status()).toBe(409);

      await client.delete(`/users/${randomEmail}`);
    });

    test('Validate PUT Action, BadRequest, Name As Blank', async () => {
      const response = await client.put(`/users/${genericEmail}`, {
        name: '',
        email: genericEmail,
        age: 30
      });
      expect(response.status()).toBe(400);
    });

    test('Validate PUT Action, BadRequest, Email With BadFormat', async () => {
      const response = await client.put(`/users/${genericEmail}`, {
        name: '',
        email: 'noFormatEmail',
        age: 30
      });
      expect(response.status()).toBe(400);
    });

    test('Validate PUT Action, BadRequest, Age Low Boundary', async () => {
      const response = await client.put(`/users/${genericEmail}`, {
        name: 'Test',
        email: genericEmail,
        age: 0
      });
      expect(response.status()).toBe(400);
    });

    test('Validate PUT Action, BadRequest, Age High Boundary', async () => {
      const response = await client.put(`/users/${genericEmail}`, {
        name: 'Test',
        email: genericEmail,
        age: 200
      });
      expect(response.status()).toBe(400);
    });

    test('Validate PUT Action, NotFound, User Non Existent', async () => {
      const response = await client.put(`/users/${nonExistentEmail}`, {
        name: 'nonExists',
        email: nonExistentEmail,
        age: 25
      });
      expect(response.status()).toBe(404);
    });

    test('Validate PUT Action, Conflict, Repeat Same Email', async () => {
      const randomEmail1 = `conflict1_${Date.now()}@test.com`;
      const randomEmail2 = `conflict2_${Date.now() + 1}@test.com`;

      const firstPayload  = { name: 'user1', email: randomEmail1, age: 25 };
      const secondPayload = { name: 'user2', email: randomEmail2, age: 25 };

      await client.post('/users', firstPayload);
      await client.post('/users', secondPayload);

      const conflictResponse = await client.put(`/users/${randomEmail1}`, {name: 'tryPutConflict', email: randomEmail2, age: 30});

      const responsePut = await conflictResponse.json();
      console.log(responsePut.error);

      expect(conflictResponse.status()).toBe(409);

      await client.delete(`/users/${randomEmail1}`);
      await client.delete(`/users/${randomEmail2}`);
    });

    test('Validate DELETE Action, NotFound, Remove Non Existent User', async () => {
      const response = await client.delete(`/users/${nonExistentEmail}`);
      expect(response.status()).toBe(404);
    });
});