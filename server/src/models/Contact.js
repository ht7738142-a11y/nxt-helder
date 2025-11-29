import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  profile: { 
    type: String, 
    enum: [
      'architecte', 'ingenieur', 'macon', 'charpentier', 'couvreur',
      'electricien', 'plombier', 'peintre', 'menuisier', 'carreleur',
      'platrier', 'chauffagiste', 'chef_chantier', 'conducteur_travaux',
      'bureau_etude', 'geometre', 'jardinier', 'fournisseur',
      'sous_traitant', 'client', 'prospect', 'autre'
    ]
  },
  colorTag: { type: String },
  notes: { type: String },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

// Index pour la recherche
ContactSchema.index({ firstName: 'text', lastName: 'text', company: 'text' });

// Virtuel pour le nom complet
ContactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtuel pour les initiales
ContactSchema.virtual('initials').get(function() {
  const first = this.firstName?.[0] || '';
  const last = this.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
});

// S'assurer que les virtuels sont inclus dans JSON
ContactSchema.set('toJSON', { virtuals: true });
ContactSchema.set('toObject', { virtuals: true });

export default mongoose.model('Contact', ContactSchema);
