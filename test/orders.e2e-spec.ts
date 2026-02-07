import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  getAuthToken,
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
} from './utils';
import { OrderStatus } from '@prisma/client';

describe('OrdersModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let productId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app, ADMIN_EMAIL);
    customerToken = await getAuthToken(app, CUSTOMER_EMAIL);

    // Get a product for the order
    const productsRes = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    productId = productsRes.body.data[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders (POST) - Customer', async () => {
    const newOrder = {
      items: [
        {
          productId: productId,
          quantity: 2,
        },
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(newOrder)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('PENDING');
  });

  it('/orders (GET) - Customer', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/orders (GET) - Admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/orders/:id/status (PATCH) - Admin', async () => {
    // Create an order first to update
    const newOrder = {
      items: [
        {
          productId: productId,
          quantity: 1,
        },
      ],
      shippingAddress: {
        street: '123 Update St',
        city: 'Test City',
      },
    };

    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(newOrder)
      .expect(201);

    const orderId = createRes.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PROCESSING })
      .expect(200);

    expect(response.body.status).toBe(OrderStatus.PROCESSING);
  });
});
