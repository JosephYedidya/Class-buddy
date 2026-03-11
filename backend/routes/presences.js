const express = require('express');
const router = express.Router();
const Presence = require('../models/Presence');
const Etudiant = require('../models/Etudiant');
const Cours = require('../models/Cours');

// GET all presences
router.get('/', async (req, res) => {
  try {
    const { cours, etudiant, date, dateDebut, dateFin } = req.query;
    let query = {};

    if (cours) query.cours = cours;
    if (etudiant) query.etudiant = etudiant;
    if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59))
      };
    }
    if (dateDebut && dateFin) {
      query.date = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    const presences = await Presence.find(query)
      .populate('etudiant', 'nom prenom email')
      .populate('cours', 'titre')
      .populate('emplacement')
      .sort({ date: -1 });

    res.json(presences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET presence statistics for a course
router.get('/stats/:coursId', async (req, res) => {
  try {
    const presences = await Presence.find({ cours: req.params.coursId });
    const etudiants = await Etudiant.find();
    
    const stats = {
      total: presences.length,
      present: presences.filter(p => p.statut === 'present').length,
      absent: presences.filter(p => p.statut === 'absent').length,
      retard: presences.filter(p => p.statut === 'retard').length,
      excuse: presences.filter(p => p.statut === 'excuse').length,
      justifie: presences.filter(p => p.justifie && p.statut !== 'present').length
    };

    // Calculate per student
    const studentStats = await Promise.all(etudiants.map(async (etudiant) => {
      const etudPresences = presences.filter(p => p.etudiant.toString() === etudiant._id.toString());
      const presentCount = etudPresences.filter(p => p.statut === 'present').length;
      const totalCount = etudPresences.length;
      
      return {
        etudiant: {
          _id: etudiant._id,
          nom: etudiant.nom,
          prenom: etudiant.prenom
        },
        present: presentCount,
        total: totalCount,
        taux: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
      };
    }));

    res.json({ stats, studentStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Record multiple presences at once
router.post('/bulk', async (req, res) => {
  try {
    const { coursId, date, presences } = req.body;
    
    const results = await Promise.all(presences.map(async (p) => {
      try {
        let presence = await Presence.findOne({
          etudiant: p.etudiantId,
          cours: coursId,
          date: {
            $gte: new Date(new Date(date).setHours(0, 0, 0)),
            $lte: new Date(new Date(date).setHours(23, 59, 59))
          }
        });

        if (presence) {
          presence.statut = p.statut;
          presence.justifie = p.justifie || false;
          presence.remarque = p.remarque || '';
          return await presence.save();
        } else {
          presence = new Presence({
            etudiant: p.etudiantId,
            cours: coursId,
            date: new Date(date),
            statut: p.statut,
            justifie: p.justifie || false,
            remarque: p.remarque || ''
          });
          return await presence.save();
        }
      } catch (err) {
        console.error('Error saving presence:', err);
        return null;
      }
    }));

    res.status(201).json(results.filter(r => r !== null));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST - Create/update single presence
router.post('/', async (req, res) => {
  try {
    const { etudiant, cours, date, statut, justifie, remarque, emplacement } = req.body;

    // Check if presence already exists for this student/course/date
    let presence = await Presence.findOne({
      etudiant,
      cours,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59))
      }
    });

    if (presence) {
      presence.statut = statut;
      presence.justifie = justifie;
      presence.remarque = remarque;
      presence = await presence.save();
    } else {
      presence = new Presence({
        etudiant,
        cours,
        date: new Date(date),
        statut,
        justifie,
        remarque,
        emplacement
      });
      await presence.save();
    }

    const populated = await Presence.findById(presence._id)
      .populate('etudiant', 'nom prenom')
      .populate('cours', 'titre');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET etudiants without presence for a course on a specific date
router.get('/absents/:coursId/:date', async (req, res) => {
  try {
    const { coursId, date } = req.params;
    
    // Get all students enrolled in this course
    const etudiants = await Etudiant.find({ cours: coursId });
    
    // Get all presences for this course on this date
    const presences = await Presence.find({
      cours: coursId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59))
      }
    });

    const presentIds = presences.map(p => p.etudiant.toString());
    const absents = etudiants.filter(e => !presentIds.includes(e._id.toString()));

    res.json(absents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE presence
router.delete('/:id', async (req, res) => {
  try {
    const presence = await Presence.findByIdAndDelete(req.params.id);
    if (!presence) {
      return res.status(404).json({ message: 'Presence non trouvée' });
    }
    res.json({ message: 'Presence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

