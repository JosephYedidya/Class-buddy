const express = require('express');
const router = express.Router();
const Etudiant = require('../models/Etudiant');

// GET all students
router.get('/', async (req, res) => {
  try {
    const etudiants = await Etudiant.find().populate('cours');
    res.json(etudiants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one student
router.get('/:id', async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.params.id).populate('cours');
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE student
router.post('/', async (req, res) => {
  const etudiant = new Etudiant({
    nom: req.body.nom,
    prenom: req.body.prenom,
    email: req.body.email,
    telephone: req.body.telephone,
    niveau: req.body.niveau,
    cours: req.body.cours || []
  });

  try {
    const newEtudiant = await etudiant.save();
    res.status(201).json(newEtudiant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    const etudiant = await Etudiant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('cours');
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json(etudiant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const etudiant = await Etudiant.findByIdAndDelete(req.params.id);
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json({ message: 'Étudiant supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

