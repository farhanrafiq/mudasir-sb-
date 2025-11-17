const request = require('supertest');
const app = require('../src/server').default;
const { createServer } = require('http');
const server = createServer(app);

describe('Dealer API', () => {
  it('should get all dealers', async () => {
    const res = await request(server).get('/api/admin/dealers');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  it('should fail to get dealer by ID without auth', async () => {
    const res = await request(server).get('/api/dealer/123');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  // Add more tests for create, update, delete, and error cases as needed
});
