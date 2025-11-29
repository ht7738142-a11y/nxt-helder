import mongoose from 'mongoose';

const DepenseSchema = new mongoose.Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['chantier','general'], default: 'general' },
  chantier: { type: mongoose.Schema.Types.ObjectId, ref: 'Chantier' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true })

export default mongoose.model('Depense', DepenseSchema);
