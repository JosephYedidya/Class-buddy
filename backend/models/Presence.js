const mongoose = require('mongoose');

const PresenceSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  emplacement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emplacement'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['present', 'absent', 'retard', 'excuse'],
    default: 'present'
  },
  justifie: {
    type: Boolean,
    default: false
  },
  remarque: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index unique pour éviter les doublons
PresenceSchema.index({ etudiant: 1, cours: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Presence', PresenceSchema);

