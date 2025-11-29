import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  method: { type: String, default: 'bank' }
}, { _id: false })

const FactureSchema = new mongoose.Schema({
  number: { type: String, index: true },
  devis: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, enum: ['unpaid','partial','paid'], default: 'unpaid' },
  advance: { type: Number, default: 0 },
  payments: { type: [PaymentSchema], default: [] },
  totals: {
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.21 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  currency: { type: String, default: 'EUR' }
}, { timestamps: true })

export default mongoose.model('Facture', FactureSchema);
