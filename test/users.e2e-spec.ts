import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  getAuthToken,
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
} from './utils';

describe('UsersModule (e2e)', () => {
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

  it('/users (GET) - Admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/users (GET) - Customer (Forbidden)', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  // Note: Update role test might be tricky without knowing a valid user ID to update.
  // We'll skip specific update tests for now to avoid side effects on seeded data,
  // or we could fetch a user first then try to update.
  it('/users/:id/role (PATCH) - Admin', async () => {
    // Get all users to find one to update
    const usersResponse = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const userToUpdate = usersResponse.body.find(
      (u: any) => u.email === CUSTOMER_EMAIL,
    );
    expect(userToUpdate).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/users/${userToUpdate.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roleId: userToUpdate.roleId }) // Set same role to avoid changing state
      .expect(200);
  });
});
