import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  chantier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chantier',
    required: true 
  },
  startDatetime: { type: Date, required: true },
  endDatetime: { type: Date, required: true },
  assignedContacts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  colorTag: { type: String },
  note: { type: String },
  status: { 
    type: String, 
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Index pour les requêtes de dates
AssignmentSchema.index({ startDatetime: 1, endDatetime: 1 });
AssignmentSchema.index({ chantier: 1 });
AssignmentSchema.index({ assignedContacts: 1 });

export default mongoose.model('Assignment', AssignmentSchema);
