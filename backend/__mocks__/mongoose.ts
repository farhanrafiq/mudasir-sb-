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


export const connect = jest.fn();
export const disconnect = jest.fn();
export const connection = {
  readyState: 1,
  on: jest.fn(),
  close: jest.fn(),
};

export const model = jest.fn(() => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
  deleteMany: jest.fn(),
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
