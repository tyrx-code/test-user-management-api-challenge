import { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../playwright.config';

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async getAll(path: string) {
    console.log('Hitting URL: ', BASE_URL + path);
    return await this.request.get(BASE_URL + path);
  }

  async getById(path: string) {
    console.log('Hitting URL: ', BASE_URL + path);
    return await this.request.get(BASE_URL + path);
  }

  async post(path: string, body: object) {
    console.log('Hitting URL: ', BASE_URL + path);
    return await this.request.post(BASE_URL + path, { data: body });
  }

  async put(path: string, body: object) {
    return await this.request.put(BASE_URL + path, { data: body });
  }

  async delete(path: string) {
    return await this.request.delete(BASE_URL + path);
  }
}