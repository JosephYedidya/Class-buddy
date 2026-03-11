const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Cours', 'TD', 'TP', 'Examen', 'Ressource', 'Autre'],
    default: 'Cours'
  },
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours'
  },
  niveau: {
    type: String,
    enum: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Autre'],
    default: 'Licence 1'
  },
  fichier: {
    type: String, // Stockera le chemin du fichier
    required: true
  },
  nomFichier: {
    type: String,
    required: true
  },
  taille: {
    type: Number // en bytes
  },
  mimeType: {
    type: String
  },
  uploadsPar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant'
  },
  accessiblePar: {
    type: String,
    enum: ['tous', 'etudiants', 'enseignants'],
    default: 'tous'
  },
  public: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema);

