import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema({
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true, index: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  email: { type: String, required: true, trim: true, lowercase: true },
  aadhar: { type: String, required: true, unique: true, match: /^\d{12}$/ },
  position: { type: String, required: true },
  hire_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'terminated'], default: 'active' },
  termination_date: { type: Date },
  termination_reason: { type: String },
}, { timestamps: true });

const EmployeeModel = mongoose.model('Employee', employeeSchema);
export default EmployeeModel;
