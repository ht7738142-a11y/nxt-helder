import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

RefreshTokenSchema.index({ token: 1 }, { unique: true });

export default mongoose.model('RefreshToken', RefreshTokenSchema);
