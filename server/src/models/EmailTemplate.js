import mongoose from 'mongoose';

// Point 131-133: Templates emails personnalisés
const EmailTemplateSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['devis_send', 'facture_send', 'relance_paiement', 'conge_approval', 'notification', 'welcome', 'custom'],
    required: true 
  },
  subject: { type: String, required: true },
  body: { type: String, required: true }, // HTML template
  variables: [{ 
    key: { type: String },
    description: { type: String },
    example: { type: String }
  }],
  attachments: [{
    type: { type: String, enum: ['pdf', 'document', 'image'] },
    description: { type: String }
  }],
  active: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('EmailTemplate', EmailTemplateSchema);
