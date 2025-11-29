import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: String,
  path: String,
  type: String,
  size: Number
}, { _id: false })

const ChantierSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  address: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['planned','in_progress','completed','on_hold'], default: 'planned' },
  phase: { type: String, enum: ['preparation','execution','finition','reception'], default: 'preparation' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  costEstimate: { type: Number, default: 0 },
  costActual: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  files: [{ name: String, path: String, type: String, size: Number }],
  pointages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    hours: { type: Number, default: 0 },
    note: { type: String },
  }],
  incidents: [{
    date: { type: Date, default: Date.now },
    type: { type: String },
    description: { type: String },
    severity: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
    resolved: { type: Boolean, default: false },
  }],
  dailyReports: [{
    date: { type: Date, default: Date.now },
    weather: { type: String },
    workDone: { type: String },
    issues: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  // Association de contacts/profils spécifiques au chantier
  team: [{
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    profile: { type: String },
    note: { type: String }
  }],
  kpis: {
    marginRate: { type: Number, default: 0 },
    costPerHour: { type: Number, default: 0 },
    daysDelay: { type: Number, default: 0 },
  }
}, { timestamps: true });

export default mongoose.model('Chantier', ChantierSchema);
