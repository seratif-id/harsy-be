import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  getAuthToken,
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
} from './utils';

describe('CategoriesModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app, ADMIN_EMAIL);
    customerToken = await getAuthToken(app, CUSTOMER_EMAIL);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/categories (GET) - Public', async () => {
    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/categories (POST) - Admin', async () => {
    const newCategory = {
      name: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      description: 'Test Description',
      isActive: true,
    };

    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newCategory)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newCategory.name);
  });

  it('/categories (POST) - Customer (Forbidden)', async () => {
    const newCategory = {
      name: `Test Category Fail ${Date.now()}`,
      slug: `test-category-fail-${Date.now()}`,
    };

    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(newCategory)
      .expect(403);
  });
});
