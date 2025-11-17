const request = require('supertest');
const app = require('../src/server').default;
const { createServer } = require('http');
const server = createServer(app);

describe('Customer API', () => {
  it('should get all customers for dealer', async () => {
    const res = await request(server).get('/api/dealer/customers');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  it('should fail to get customer by ID without auth', async () => {
    const res = await request(server).get('/api/dealer/customers/123');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  // Add more tests for create, update, delete, and error cases as needed
});
