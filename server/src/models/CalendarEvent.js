import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  startTime: {
    type: String,
    required: true // Format: HH:MM
  },
  endTime: {
    type: String,
    required: true // Format: HH:MM
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour recherches rapides par date et utilisateur
calendarEventSchema.index({ user: 1, date: 1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);
