// jest.setup.js
// Mock mongoose to avoid real DB connection during tests

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    // Minimal stub for mongoose
    function MockSchema(definition) {
      this.obj = definition;
    }
    MockSchema.Types = {
      ObjectId: jest.fn(() => 'mock-object-id'),
    };

    return {
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(true),
      connection: {
        readyState: 1,
