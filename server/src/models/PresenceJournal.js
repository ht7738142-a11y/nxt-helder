import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  niss: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  present: {
    type: Boolean,
    default: true
  },
  morningPresent: {
    type: Boolean,
    default: true
  },
  afternoonPresent: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    default: ''
  }
}, { _id: false });

const presenceJournalSchema = new mongoose.Schema({
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  },
  date: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  mainCompanyName: {
    type: String,
    required: true // Ex: BEMAT, GMOURY
  },
  subcontractorName: {
    type: String,
    required: true // Ex: DELTA PLAC SRL
  },
  subcontractorNumber: {
    type: String,
    default: '' // Numéro d'entreprise du sous-traitant
  },
  workers: [workerSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signatureChef: {
    type: String,
    default: '' // Nom du chef de chantier ou signature
  }
}, {
  timestamps: true
});

// Index pour recherches rapides
presenceJournalSchema.index({ chantier: 1, date: 1 });
presenceJournalSchema.index({ date: 1, subcontractorName: 1 });

export default mongoose.model('PresenceJournal', presenceJournalSchema);
