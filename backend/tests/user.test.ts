import request from 'supertest';
import app from '../src/server';

describe('User API', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // Add more tests for user endpoints here
});
