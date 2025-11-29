import mongoose from 'mongoose';

const DevisVersionSchema = new mongoose.Schema(
  {
    devis: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data: { type: Object, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('DevisVersion', DevisVersionSchema);
