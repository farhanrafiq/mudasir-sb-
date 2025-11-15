import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  role: { type: String, enum: ['admin', 'dealer'], required: true },
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  tempPass: { type: Boolean, default: false },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer' },
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
