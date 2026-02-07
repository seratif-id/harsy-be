import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken, ADMIN_EMAIL } from './utils';
import { OrderStatus } from '@prisma/client';

describe('ReviewsModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app, ADMIN_EMAIL);

    // Create a new customer to avoid conflict with seeded reviews
    const timestamp = Date.now();
    const email = `reviewer_${timestamp}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Reviewer',
      })
      .expect(201);

    customerToken = await getAuthToken(app, email);

    // 1. Get a product
    const productsRes = await request(app.getHttpServer())
      .get('/products')
      .expect(200);
    productId = productsRes.body.data[0].id;

    // 2. Create an order for that product
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId, quantity: 1 }],
        shippingAddress: { street: '123 Reviews St', city: 'Test City' },
      })
      .expect(201);
    orderId = orderRes.body.id;

    // 3. Update order status to DELIVERED (required for review)
    await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.DELIVERED })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/reviews (POST) - Customer', async () => {
    const review = {
      productId,
      rating: 5,
      comment: 'Great product!',
    };

    const response = await request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(review)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.rating).toBe(5);
  });

  it('/reviews (GET) - Public', async () => {
    const response = await request(app.getHttpServer())
      .get('/reviews')
      .query({ productId })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
