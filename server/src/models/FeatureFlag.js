import mongoose from 'mongoose';

const FeatureFlagSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  enabled: { type: Boolean, default: false },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('FeatureFlag', FeatureFlagSchema);
