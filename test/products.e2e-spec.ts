import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  getAuthToken,
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
} from './utils';

describe('ProductsModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app, ADMIN_EMAIL);
    customerToken = await getAuthToken(app, CUSTOMER_EMAIL);

    // Get a category to use for creating a product
    const categoriesResponse = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    if (categoriesResponse.body.length > 0) {
      categoryId = categoriesResponse.body[0].id;
    } else {
      // Create a category if none exist
      const newCategory = {
        name: `ProdTest Cat ${Date.now()}`,
        slug: `prodtest-cat-${Date.now()}`,
        description: 'Test Description',
        isActive: true,
      };
      const catRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCategory)
        .expect(201);
      categoryId = catRes.body.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET) - Public', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    // Seed data ensures products exist
  });

  it('/products (POST) - Admin', async () => {
    const newProduct = {
      name: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      price: 100,
      description: 'Test Description',
      stock: 10,
      categoryId: categoryId,
      images: ['http://example.com/image.jpg'],
      isActive: true,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newProduct.name);
  });

  it('/products/:slug (GET)', async () => {
    // Get the first product to query by slug
    const listResponse = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    const product = listResponse.body.data[0];
    const response = await request(app.getHttpServer())
      .get(`/products/${product.slug}`)
      .expect(200);

    expect(response.body.id).toBe(product.id);
  });

  it('/products (POST) - Customer (Forbidden)', async () => {
    const newProduct = {
      name: `Fail Product ${Date.now()}`,
      slug: `fail-product-${Date.now()}`,
      price: 100,
      description: 'Test Description',
      stock: 10,
      categoryId: categoryId,
    };

    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(newProduct)
      .expect(403);
  });
});
