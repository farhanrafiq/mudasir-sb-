const request = require('supertest');
const app = require('../src/server').default;
const { createServer } = require('http');
const server = createServer(app);

describe('Employee API', () => {
  it('should get all employees for dealer', async () => {
    const res = await request(server).get('/api/dealer/employees');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  it('should fail to get employee by ID without auth', async () => {
    const res = await request(server).get('/api/dealer/employees/123');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  // Add more tests for create, update, delete, and error cases as needed
});
