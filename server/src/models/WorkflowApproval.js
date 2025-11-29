import mongoose from 'mongoose';

// Point 126-127: Workflow validation multiniveaux
const WorkflowApprovalSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  entityType: { type: String, enum: ['devis', 'facture', 'depense', 'conge'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requiredApprovers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    level: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedAt: { type: Date },
    comment: { type: String }
  }],
  currentLevel: { type: Number, default: 1 },
  rules: {
    requiresApproval: { type: Boolean, default: true },
    minAmount: { type: Number, default: 0 },
    maxLevel: { type: Number, default: 3 },
    autoApproveBelow: { type: Number, default: 500 }
  },
  history: [{
    action: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    comment: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('WorkflowApproval', WorkflowApprovalSchema);
