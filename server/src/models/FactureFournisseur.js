import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const FactureFournisseurSchema = new mongoose.Schema({
  supplier: { type: String, required: true },
  number: { type: String, required: true },
  items: [ItemSchema],
  totals: {
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.21 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  dueDate: { type: Date },
  payments: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, default: 'bank' },
    note: { type: String }
  }],
  chantier: { type: mongoose.Schema.Types.ObjectId, ref: 'Chantier' },
  category: { type: String, enum: ['materiel', 'service', 'sous-traitance', 'autre'], default: 'materiel' },
  files: [{
    name: { type: String },
    path: { type: String },
    type: { type: String },
    size: { type: Number }
  }],
  extractedBy: { type: String }, // 'manual' or 'OCR'
  confidence: { type: Number }, // OCR confidence score
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('FactureFournisseur', FactureFournisseurSchema);
