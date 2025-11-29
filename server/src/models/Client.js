import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  vat: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  profil: { type: String },
  contacts: [{
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String },
  }],
  addresses: [{
    label: { type: String },
    street: { type: String },
    city: { type: String },
    zip: { type: String },
    country: { type: String, default: 'BE' },
  }],
  paymentTerms: { type: String, default: 'Net 30' },
  creditLimit: { type: Number, default: 0 },
  documents: [{
    name: { type: String },
    path: { type: String },
    type: { type: String },
    size: { type: Number },
  }],
  segment: { type: String, enum: ['pro', 'pme', 'artisan', 'particulier'], default: 'particulier' },
  notes: { type: String },
  archived: { type: Boolean, default: false },
  history: {
    devis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Devis' }],
    factures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facture' }],
    interactions: [{
      date: { type: Date, default: Date.now },
      type: { type: String },
      note: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }]
  }
}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
