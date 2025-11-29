import mongoose from 'mongoose';

const MaterielSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'u' },
  unitPrice: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Materiel', MaterielSchema);
