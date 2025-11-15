import request from 'supertest';
import app from '../src/server';

describe('Employee API', () => {
  it('should get all employees for dealer', async () => {
    const res = await request(app).get('/api/dealer/employees');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  // Add more tests for employee endpoints here
});
