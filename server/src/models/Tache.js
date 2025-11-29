import mongoose from 'mongoose';

const TacheSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chantier: { type: mongoose.Schema.Types.ObjectId, ref: 'Chantier' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['devis','chantier','reunion','autre'], default: 'autre' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['todo','doing','done'], default: 'todo' },
  notes: { type: String }
}, { timestamps: true })

export default mongoose.model('Tache', TacheSchema);
