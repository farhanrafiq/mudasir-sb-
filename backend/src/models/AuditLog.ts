import mongoose, { Schema } from 'mongoose';

const auditLogSchema = new Schema({
  who_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  who_user_name: { type: String, required: true },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer' },
  action_type: { type: String, required: true },
  details: { type: String, required: true },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
export default AuditLogModel;
