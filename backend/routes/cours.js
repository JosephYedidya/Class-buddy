const express = require('express');
const router = express.Router();
const Cours = require('../models/Cours');

// GET - Récupérer tous les cours
router.get('/', async (req, res) => {
  try {
    const cours = await Cours.find()
      .populate('enseignant', 'nom prenom email specialite')
      .sort({ createdAt: -1 });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Récupérer un cours par ID
router.get('/:id', async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate('enseignant', 'nom prenom email specialite');
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Créer un nouveau cours
router.post('/', async (req, res) => {
  const { 
    titre, 
    description, 
    niveau, 
    heures, 
    credits, 
    semestre, 
    enseignant,
    dateDebut,
    dateFin 
  } = req.body;
  
  const cours = new Cours({
    titre,
    description,
    niveau,
    heures,
    credits,
    semestre,
    enseignant,
    dateDebut,
    dateFin
  });

  try {
    const nouveauCours = await cours.save();
    // Populate pour retourner les infos de l'enseignant
    await nouveauCours.populate('enseignant', 'nom prenom email specialite');
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Modifier un cours
router.put('/:id', async (req, res) => {
  try {
    const cours = await Cours.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('enseignant', 'nom prenom email specialite');
    
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.json(cours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Supprimer un cours
router.delete('/:id', async (req, res) => {
  try {
    const cours = await Cours.findByIdAndDelete(req.params.id);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

