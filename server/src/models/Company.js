import mongoose from 'mongoose';

// Point 121: Multi-sociétés avec isolation données
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  legalName: { type: String, required: true },
  vat: { type: String, required: true },
  registrationNumber: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    zip: { type: String },
    country: { type: String, default: 'BE' }
  },
  contact: {
    email: { type: String },
    phone: { type: String },
    website: { type: String }
  },
  settings: {
    currency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Brussels' },
    language: { type: String, default: 'fr' },
    defaultTaxRate: { type: Number, default: 0.21 },
    defaultPaymentTerms: { type: String, default: 'Net 30' },
    invoicePrefix: { type: String, default: 'INV' },
    devisPrefix: { type: String, default: 'DEV' }
  },
  branding: {
    logo: { type: String },
    primaryColor: { type: String, default: '#2563eb' },
    secondaryColor: { type: String, default: '#64748b' }
  },
  subscription: {
    plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'pro' },
    status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
    expiresAt: { type: Date },
    maxUsers: { type: Number, default: 10 }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);
