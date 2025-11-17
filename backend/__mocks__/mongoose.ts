// __mocks__/mongoose.ts
import { jest } from '@jest/globals';


class MockSchema {
  obj: any;
  constructor(definition: any) {
    this.obj = definition;
  }
}
// Attach Types as a static property
Object.defineProperty(MockSchema, 'Types', {
  value: {
    ObjectId: jest.fn(() => 'mock-object-id'),
  },
  writable: false,
});


export const connect = jest.fn().mockResolvedValue(true);
export const disconnect = jest.fn().mockResolvedValue(true);
export const connection = {
  readyState: 1,
  on: jest.fn(),
  close: jest.fn(),
};

export const model = jest.fn(() => ({
  find: jest.fn().mockResolvedValue([] as any),
  findById: jest.fn().mockResolvedValue(null as any),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null as any),
  findByIdAndDelete: jest.fn().mockResolvedValue(null as any),
  save: jest.fn().mockResolvedValue(true as any),
  deleteMany: jest.fn().mockResolvedValue(true as any),
}));
export const Types = {
  ObjectId: jest.fn(() => 'mock-object-id'),
};
export const Schema = MockSchema;

export default {
  connect,
  disconnect,
  connection,
  model,
  Types,
  Schema,
};
