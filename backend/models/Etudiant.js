const mongoose = require('mongoose');

const EtudiantSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  telephone: {
    type: String,
    trim: true
  },
  niveau: {
    type: String,
    required: true,
    enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Autre'],
    default: 'Licence 1'
  },
  cours: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Etudiant', EtudiantSchema);

