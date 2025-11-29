import mongoose from 'mongoose';

const DevisItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
}, { _id: false });

const DevisSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [DevisItemSchema], default: [] },
  currency: { type: String, default: 'EUR' },
  notes: { type: String },
  status: { type: String, enum: ['draft','sent','accepted','rejected','invoiced'], default: 'draft' },
  marginRate: { type: Number, default: 0 },
  totals: {
    subtotal: { type: Number, default: 0 },
    subtotalWithMargin: { type: Number, default: 0 },
    marginAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.21 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  signature: {
    by: { type: String },
    at: { type: Date },
    imageData: { type: String }, // optional data URL
  },
  archived: { type: Boolean, default: false },
  files: {
    type: [{ name: String, path: String, type: String, size: Number }],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Devis', DevisSchema);
