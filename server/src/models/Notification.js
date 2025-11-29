import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['task','stock','payment','devis','facture','system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  dueAt: { type: Date }
}, { timestamps: true })

export default mongoose.model('Notification', NotificationSchema);
