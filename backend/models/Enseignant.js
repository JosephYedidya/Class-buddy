const mongoose = require('mongoose');

const EnseignantSchema = new mongoose.Schema({
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
  specialite: {
    type: String,
    required: true,
    trim: true
  },
  dateEmbauche: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enseignant', EnseignantSchema);

