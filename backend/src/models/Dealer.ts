import mongoose, { Schema } from 'mongoose';

const dealerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  company_name: { type: String, required: true, unique: true, trim: true },
  primary_contact_name: { type: String, required: true, trim: true },
  primary_contact_phone: { type: String, required: true, match: /^\d{10}$/ },
  primary_contact_email: { type: String, required: true, trim: true, lowercase: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const DealerModel = mongoose.model('Dealer', dealerSchema);
export default DealerModel;
