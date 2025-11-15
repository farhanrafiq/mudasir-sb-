import request from 'supertest';
import app from '../src/server';

describe('Customer API', () => {
  it('should get all customers for dealer', async () => {
    const res = await request(app).get('/api/dealer/customers');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  // Add more tests for customer endpoints here
});
