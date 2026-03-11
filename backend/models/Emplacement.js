const mongoose = require('mongoose');

const EmplacementSchema = new mongoose.Schema({
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  jour: {
    type: String,
    required: true,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    default: 'Lundi'
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
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Cours magistral', 'TD', 'TP', 'Atelier', 'Examen'],
    default: 'Cours magistral'
  },
  groupe: {
    type: String,
    required: true,
    trim: true,
    default: 'Groupe A'
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant',
    required: true
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

// Index pour optimiser les recherches et détecté les conflits
EmplacementSchema.index({ jour: 1, heureDebut: 1, salle: 1 });
EmplacementSchema.index({ jour: 1, heureDebut: 1, enseignant: 1 });
EmplacementSchema.index({ jour: 1, groupe: 1 });

module.exports = mongoose.model('Emplacement', EmplacementSchema);

