import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

export async function getAuthToken(
  app: INestApplication,
  input: string | { email: string; password?: string } = 'admin@example.com',
): Promise<string> {
  const loginDto =
    typeof input === 'string'
      ? { email: input, password: 'password123' }
      : { password: 'password123', ...input };
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginDto)
    .expect(201);

  return response.body.data.accessToken;
}

export const ADMIN_EMAIL = 'admin@example.com';
export const CUSTOMER_EMAIL = 'customer1@example.com';
export const CUSTOMER_2_EMAIL = 'customer2@example.com';
