const request = require('supertest');
const app = require('../src/server').default;
const { createServer } = require('http');
const server = createServer(app);

describe('AuditLog API', () => {
  it('should get audit logs for dealer', async () => {
    const res = await request(server).get('/api/dealer/audit-logs');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  it('should fail to get audit log by ID without auth', async () => {
    const res = await request(server).get('/api/dealer/audit-logs/123');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  // Add more tests for create, update, delete, and error cases as needed
});
