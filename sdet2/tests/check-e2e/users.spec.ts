import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/apiClient';

test.describe('@e2e User Management API Validation, End To End Tests', () => {

  let client: ApiClient;
  let createdEmail: string;

  test.beforeEach(async ({ request }) => {
    client = new ApiClient(request);
  });

  test.afterEach(async () => {
    if (createdEmail) {
      const deleteResponse = await client.delete(`/users/${createdEmail}`);
      console.log(`Teardown - Deleted: ${createdEmail} → ${deleteResponse.status()}`);
      createdEmail = '';
    }
  });

  test('@e2e FullFlow - Create, GetAll, GetByEmail, Delete, GetByEmail', async () => {

    // Prerrequisite, POST to Create Fresh User Data
    console.log('#1, POST, Create New User:');
    const randomEmail = `e2e_pw_${Date.now()}@test.com`;

    const postResponse = await client.post('/users', {
      name: 'PW_E2E_User',
      email: randomEmail,
      age: 30
    });

    console.log('POST status:  ', postResponse.status());
    console.log('POST body:    ', await postResponse.text());

    expect(postResponse.status()).toBe(201);
    const createdUser = await postResponse.json();
    createdEmail = createdUser.email;
    expect(createdEmail).toBe(randomEmail);

    // GET All, List of Users, Check that new user is in the list
    console.log('#2: GET all users:');
    const getAllResponse = await client.getAll('/users');

    expect(getAllResponse.status()).toBe(200);
    const allUsers = await getAllResponse.json();

    expect(Array.isArray(allUsers)).toBeTruthy();
    const userInList = allUsers.find((u: any) => u.email === createdEmail);
    expect(userInList).toBeDefined();
    console.log('Yes found in list: ', userInList);

    // GET By Email, Check by Id
    console.log('#3: GET user by email:');
    const getByEmailResponse = await client.getById(`/users/${createdEmail}`);

    expect(getByEmailResponse.status()).toBe(200);
    const fetchedUser = await getByEmailResponse.json();
    expect(fetchedUser.email).toBe(createdEmail);
    expect(fetchedUser.name).toBe('PW_E2E_User');
    console.log('Fetched user: ', fetchedUser);

    // DELETE By Email, Remove user to avoid trash content and later assert for 404
    console.log('#4: Delete user:');
    const deleteResponse = await client.delete(`/users/${createdEmail}`);

    expect(deleteResponse.status()).toBe(204);
    console.log('DELETE status: ', deleteResponse.status());
    createdEmail = ''; //Clean up variable to avoid afterEach in this test

    //Again GET By Email, Check for 404
    console.log('#5: Check deletion:');
    const verifyDeletedResponse = await client.getById(`/users/${createdEmail}`);

    expect(verifyDeletedResponse.status()).toBe(404);
    console.log('User gone:', verifyDeletedResponse.status());
  });

  test('@e2e FullFlow - Create, GetAll, GetByEmail, Update, GetAll, Delete, GetByEmail', async () => {

    // Prerrequisite, POST to Create Fresh User Data
    console.log('#1, POST, Create New User:');
    const randomEmail = `e2e_pw_${Date.now()}@test.com`;

    const postResponse = await client.post('/users', {
      name: 'POST_PW_E2E_User',
      email: randomEmail,
      age: 30
    });

    expect(postResponse.status()).toBe(201);
    createdEmail = (await postResponse.json()).email;

    // GET All, List of Users, Check that new user is in the list
    console.log('#2: GET all users:');
    const getAllResponse = await client.getAll('/users');

    expect(getAllResponse.status()).toBe(200);
    const allUsers = await getAllResponse.json();
    const userInList = allUsers.find((u: any) => u.email === createdEmail);
    expect(userInList).toBeDefined();

    // GET By Email, Check by Id
    console.log('#3: GET user by email:');
    const getResponse = await client.getById(`/users/${createdEmail}`);

    expect(getResponse.status()).toBe(200);
    const fetchedUser = await getResponse.json();
    expect(fetchedUser.email).toBe(createdEmail);

    // PUT  ByEmail, Update current user
    console.log('#4: Updating user:');
    const updatedEmail = `e2e_pw_updated_${Date.now()}@test.com`;

    const putResponse = await client.put(`/users/${createdEmail}`, {
      name: 'PUT_PW_E2E_Updated',
      email: updatedEmail,
      age: 99
    });

    expect(putResponse.status()).toBe(200);
    const updatedUser = await putResponse.json();
    expect(updatedUser.name).toBe('PUT_PW_E2E_Updated');
    expect(updatedUser.email).toBe(updatedEmail);
    expect(updatedUser.age).toBe(99);
    console.log('Updated user: ', updatedUser);

    // GET All, List of Users, Check that UPD user is in the list
    console.log('#5: Check for the updated email in list');
    const getAllAfterUpdate = await client.getAll('/users');
    expect(getAllAfterUpdate.status()).toBe(200);
    const updatedList = await getAllAfterUpdate.json();
    const updatedInList = updatedList.find((u: any) => u.email === updatedEmail);
    expect(updatedInList).toBeDefined();
    expect(updatedInList.name).toBe('PUT_PW_E2E_Updated');

    // DELETE By Email, Remove user to avoid trash content and later assert for 404
    console.log('── Step 6: Deleting user...');
    const deleteResponse = await client.delete(`/users/${updatedEmail}`);

    expect(deleteResponse.status()).toBe(204);
    //Clean up variable to avoid afterEach in this test
    createdEmail = '';

    //Again GET By Email, Check for 404
    console.log('── Step 7: Verifying user is gone...');
    const verifyDeletedResponse = await client.getById(`/users/${updatedEmail}`);

    expect(verifyDeletedResponse.status()).toBe(404);
    console.log('User gone:', verifyDeletedResponse.status());
    
  });

});