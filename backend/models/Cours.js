const mongoose = require('mongoose');

const CoursSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  niveau: {
    type: String,
    required: true,
    enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Autre'],
    default: 'Licence 1'
  },
  heures: {
    type: Number,
    required: true,
    min: 1
  },
  credits: {
    type: Number,
    required: true,
    min: 1
  },
  semestre: {
    type: String,
    enum: ['Semestre 1', 'Semestre 2', 'Année complète'],
    default: 'Semestre 1'
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant'
  },
  dateDebut: {
    type: Date
  },
  dateFin: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cours', CoursSchema);

