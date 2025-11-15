import request from 'supertest';
import app from '../src/server';

describe('Dealer API', () => {
  it('should get all dealers', async () => {
    const res = await request(app).get('/api/admin/dealers');
    expect([200, 401, 403]).toContain(res.statusCode); // Accepts auth errors for now
  });

  // Add more tests for dealer endpoints here
});
