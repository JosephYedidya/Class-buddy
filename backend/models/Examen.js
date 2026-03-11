const mongoose = require('mongoose');

const ExamenSchema = new mongoose.Schema({
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  type: {
    type: String,
    enum: ['Partiel', 'Final', 'Rattrapage', 'TD', 'TP'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  heureDebut: {
    type: String,
    required: true
  },
  heureFin: {
    type: String,
    required: true
  },
  salle: {
    type: String,
    required: true
  },
  surveillant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant'
  },
  groupe: {
    type: String,
    required: true
  },
  duree: {
    type: Number, // en minutes
    default: 120
  },
  description: {
    type: String
  },
  niveau: {
    type: String,
    enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Autre'],
    default: 'Licence 1'
  },
  semestre: {
    type: String,
    enum: ['Semestre 1', 'Semestre 2', 'Année complète'],
    default: 'Semestre 1'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
ExamenSchema.index({ date: 1, salle: 1 });
ExamenSchema.index({ cours: 1 });

module.exports = mongoose.model('Examen', ExamenSchema);

