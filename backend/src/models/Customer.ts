

import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  dealer: mongoose.Types.ObjectId;
  type: 'private' | 'government';
  name_or_entity: string;
  contact_person?: string;
  phone: string;
  email: string;
  official_id: string;
  address: string;
  status: 'active' | 'inactive';
}

const customerSchema = new Schema<ICustomer>({
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true, index: true },
  type: { type: String, enum: ['private', 'government'], required: true },
  name_or_entity: { type: String, required: true },
  contact_person: { type: String },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  email: { type: String, required: true },
  official_id: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);
export default CustomerModel;
