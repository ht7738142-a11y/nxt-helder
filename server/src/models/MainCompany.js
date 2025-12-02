import mongoose from 'mongoose';

const mainCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour recherches rapides
mainCompanySchema.index({ user: 1, lastUsedAt: -1 });

export default mongoose.model('MainCompany', mainCompanySchema);
