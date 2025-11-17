// __mocks__/mongoose.ts
import { jest } from '@jest/globals';


function MockSchema(definition: any) {
  this.obj = definition;
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
  find: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(true),
  deleteMany: jest.fn().mockResolvedValue(true),
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
