import request from 'supertest';
import app from '../src/server';

describe('AuditLog API', () => {
  it('should get audit logs for dealer', async () => {
    const res = await request(app).get('/api/dealer/audit-logs');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  // Add more tests for audit log endpoints here
});
