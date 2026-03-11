const express = require('express');
const router = express.Router();
const Emplacement = require('../models/Emplacement');

// Helper function to check time overlap
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start1 < end2 && start1 < end2 && start1 < end2;
};

// Check for conflicts
const checkConflicts = async (newEmplacement, excludeId = null) => {
  const conflicts = [];
  
  // Find all emplacements on the same day
  const sameDayEmplacements = await Emplacement.find({
    jour: newEmplacement.jour,
    _id: { $ne: excludeId }
  }).populate('cours', 'titre').populate('enseignant', 'nom prenom');

  for (const emp of sameDayEmplacements) {
    // Check room conflict
    if (emp.salle === newEmplacement.salle) {
      const timeOverlap = (
        newEmplacement.heureDebut < emp.heureFin && 
        newEmplacement.heureFin > emp.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'salle',
          message: `Conflit de salle: ${emp.salle} est déjà reservée pour "${emp.cours?.titre || 'cours'}" de ${emp.heureDebut} à ${emp.heureFin}`,
          emplacement: emp
        });
      }
    }

    // Check teacher conflict
    if (emp.enseignant?._id.toString() === newEmplacement.enseignant?.toString()) {
      const timeOverlap = (
        newEmplacement.heureDebut < emp.heureFin && 
        newEmplacement.heureFin > emp.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'enseignant',
          message: `Conflit d'enseignant: ${emp.enseignant?.nom} ${emp.enseignant?.prenom} est déjà assigné à "${emp.cours?.titre || 'cours'}" de ${emp.heureDebut} à ${emp.heureFin}`,
          emplacement: emp
        });
      }
    }

    // Check group conflict
    if (emp.groupe === newEmplacement.groupe) {
      const timeOverlap = (
        newEmplacement.heureDebut < emp.heureFin && 
        newEmplacement.heureFin > emp.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'groupe',
          message: `Conflit de groupe: ${emp.groupe} a déjà un cours "${emp.cours?.titre || 'cours'}" de ${emp.heureDebut} à ${emp.heureFin}`,
          emplacement: emp
        });
      }
    }
  }

  return conflicts;
};

// GET all emplacements
router.get('/', async (req, res) => {
  try {
    const { view, id, jour } = req.query;
    let query = {};

    // Filter by teacher
    if (view === 'teacher' && id) {
      query.enseignant = id;
    }
    // Filter by group/room
    if (view === 'group' && id) {
      query.groupe = id;
    }
    if (view === 'room' && id) {
      query.salle = id;
    }
    // Filter by day
    if (jour) {
      query.jour = jour;
    }

    const emplacements = await Emplacement.find(query)
      .populate('cours', 'titre description niveau')
      .populate('enseignant', 'nom prenom specialite')
      .sort({ jour: 1, heureDebut: 1 });
    
    res.json(emplacements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one emplacement
router.get('/:id', async (req, res) => {
  try {
    const emplacement = await Emplacement.findById(req.params.id)
      .populate('cours', 'titre description niveau')
      .populate('enseignant', 'nom prenom specialite');
    
    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }
    res.json(emplacement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE emplacement with conflict detection
router.post('/', async (req, res) => {
  try {
    const emplacement = new Emplacement({
      cours: req.body.cours,
      jour: req.body.jour,
      heureDebut: req.body.heureDebut,
      heureFin: req.body.heureFin,
      salle: req.body.salle,
      type: req.body.type,
      groupe: req.body.groupe,
      enseignant: req.body.enseignant,
      niveau: req.body.niveau,
      semestre: req.body.semestre
    });

    // Check for conflicts
    const conflicts = await checkConflicts(emplacement);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Conflits détectés',
        conflicts: conflicts,
        emplacement: null
      });
    }

    const newEmplacement = await emplacement.save();
    const populated = await Emplacement.findById(newEmplacement._id)
      .populate('cours', 'titre')
      .populate('enseignant', 'nom prenom');
    
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE emplacement
router.put('/:id', async (req, res) => {
  try {
    const existingEmplacement = await Emplacement.findById(req.params.id);
    if (!existingEmplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    // Update the existing object
    existingEmplacement.cours = req.body.cours || existingEmplacement.cours;
    existingEmplacement.jour = req.body.jour || existingEmplacement.jour;
    existingEmplacement.heureDebut = req.body.heureDebut || existingEmplacement.heureDebut;
    existingEmplacement.heureFin = req.body.heureFin || existingEmplacement.heureFin;
    existingEmplacement.salle = req.body.salle || existingEmplacement.salle;
    existingEmplacement.type = req.body.type || existingEmplacement.type;
    existingEmplacement.groupe = req.body.groupe || existingEmplacement.groupe;
    existingEmplacement.enseignant = req.body.enseignant || existingEmplacement.enseignant;
    existingEmplacement.niveau = req.body.niveau || existingEmplacement.niveau;
    existingEmplacement.semestre = req.body.semestre || existingEmplacement.semestre;

    // Check for conflicts (excluding current)
    const conflicts = await checkConflicts(existingEmplacement, req.params.id);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Conflits détectés',
        conflicts: conflicts,
        emplacement: null
      });
    }

    const updatedEmplacement = await existingEmplacement.save();
    const populated = await Emplacement.findById(updatedEmplacement._id)
      .populate('cours', 'titre')
      .populate('enseignant', 'nom prenom');
    
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE emplacement
router.delete('/:id', async (req, res) => {
  try {
    const emplacement = await Emplacement.findByIdAndDelete(req.params.id);
    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }
    res.json({ message: 'Emplacement supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check conflicts for a given time slot
router.post('/check-conflicts', async (req, res) => {
  try {
    const { jour, heureDebut, heureFin, salle, groupe, enseignant, excludeId } = req.body;
    
    const testEmplacement = {
      jour,
      heureDebut,
      heureFin,
      salle,
      groupe,
      enseignant
    };

    const conflicts = await checkConflicts(testEmplacement, excludeId);
    
    res.json({ 
      hasConflicts: conflicts.length > 0,
      conflicts 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET unique values for filters
router.get('/filters/values', async (req, res) => {
  try {
    const salles = await Emplacement.distinct('salle');
    const groupes = await Emplacement.distinct('groupe');
    const niveaux = await Emplacement.distinct('niveau');
    
    res.json({ salles, groupes, niveaux });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

