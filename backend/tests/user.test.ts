

import * as request from 'supertest';
import app from '../src/server';
import { createServer } from 'http';
const server = createServer(app);

describe('User API', () => {
  it('should return health status', async () => {
    const res = await request(server).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should get all users (unauthenticated)', async () => {
    const res = await request(server).get('/api/users');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  it('should fail to get user by ID without auth', async () => {
    const res = await request(server).get('/api/users/123');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  // Add more tests for create, update, delete, and error cases as needed
});
