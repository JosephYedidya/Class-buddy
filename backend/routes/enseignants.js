const express = require('express');
const router = express.Router();
const Enseignant = require('../models/Enseignant');

// GET - Récupérer tous les enseignants
router.get('/', async (req, res) => {
  try {
    const enseignants = await Enseignant.find().sort({ createdAt: -1 });
    res.json(enseignants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Récupérer un enseignant par ID
router.get('/:id', async (req, res) => {
  try {
    const enseignant = await Enseignant.findById(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json(enseignant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Créer un nouvel enseignant
router.post('/', async (req, res) => {
  const { nom, prenom, email, telephone, specialite, dateEmbauche } = req.body;
  
  const enseignant = new Enseignant({
    nom,
    prenom,
    email,
    telephone,
    specialite,
    dateEmbauche
  });

  try {
    const nouvelEnseignant = await enseignant.save();
    res.status(201).json(nouvelEnseignant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Modifier un enseignant
router.put('/:id', async (req, res) => {
  try {
    const enseignant = await Enseignant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json(enseignant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Supprimer un enseignant
router.delete('/:id', async (req, res) => {
  try {
    const enseignant = await Enseignant.findByIdAndDelete(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json({ message: 'Enseignant supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

