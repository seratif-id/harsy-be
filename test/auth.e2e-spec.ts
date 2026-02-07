import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  getAuthToken,
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
} from './utils';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - Admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'password123' })
      .expect(201);

    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('/auth/login (POST) - Customer', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: CUSTOMER_EMAIL, password: 'password123' })
      .expect(201);

    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('/auth/register (POST)', async () => {
    const email = `newuser_${Date.now()}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'New User',
      })
      .expect(201);

    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe(email);
  });

  it('/auth/profile (GET) - Authenticated', async () => {
    const token = await getAuthToken(app, ADMIN_EMAIL);
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.user.email).toBe(ADMIN_EMAIL);
  });

  it('/auth/profile (GET) - Unauthenticated', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
