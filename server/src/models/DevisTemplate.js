import mongoose from 'mongoose';

const TemplateItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'u' },
  unitPrice: { type: Number, default: 0 },
}, { _id: false });

const DevisTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  items: { type: [TemplateItemSchema], default: [] },
  currency: { type: String, default: 'EUR' },
  notes: { type: String },
  marginRate: { type: Number, default: 0 },
  defaultTaxRate: { type: Number, default: 0.21 },
}, { timestamps: true });

export default mongoose.model('DevisTemplate', DevisTemplateSchema);
