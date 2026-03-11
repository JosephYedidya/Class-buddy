const express = require('express');
const router = express.Router();
const Cours = require('../models/Cours');
const Etudiant = require('../models/Etudiant');
const Enseignant = require('../models/Enseignant');
const Emplacement = require('../models/Emplacement');

// GET Statistics Summary
router.get('/summary', async (req, res) => {
  try {
    const { annee } = req.query;
    
    // Basic counts
    const [totalCours, totalEtudiants, totalEnseignants, totalEmplacements] = await Promise.all([
      Cours.countDocuments(annee ? { niveau: { $regex: annee } } : {}),
      Etudiant.countDocuments(),
      Enseignant.countDocuments(),
      Emplacement.countDocuments(annee ? { niveau: { $regex: annee } } : {})
    ]);

    res.json({
      totalCours,
      totalEtudiants,
      totalEnseignants,
      totalEmplacements
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Students per Course (with fill rate)
router.get('/students-per-course', async (req, res) => {
  try {
    const { maxStudents = 30 } = req.query;
    
    const cours = await Cours.find().populate('enseignant', 'nom prenom');
    
    const result = await Promise.all(cours.map(async (c) => {
      const etudiantCount = await Etudiant.countDocuments({ cours: c._id });
      const fillRate = Math.round((etudiantCount / maxStudents) * 100);
      
      return {
        _id: c._id,
        titre: c.titre,
        niveau: c.niveau,
        semestre: c.semestre,
        heures: c.heures,
        credits: c.credits,
        teacher: c.enseignant ? `${c.enseignant.nom} ${c.enseignant.prenom}` : 'Non assigné',
        studentCount: etudiantCount,
        maxStudents: parseInt(maxStudents),
        fillRate: Math.min(fillRate, 100),
        isFull: etudiantCount >= maxStudents
      };
    }));

    // Sort by fill rate descending
    result.sort((a, b) => b.fillRate - a.fillRate);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Teacher Workload Overview
router.get('/teacher-workload', async (req, res) => {
  try {
    const { annee } = req.query;
    
    const enseignants = await Enseignant.find();
    
    const result = await Promise.all(enseignants.map(async (ens) => {
      // Get all cours for this teacher
      const cours = await Cours.find({ enseignant: ens._id });
      const coursIds = cours.map(c => c._id);
      
      // Get all emplacements for these cours
      const query = { cours: { $in: coursIds } };
      if (annee) {
        query.niveau = { $regex: annee };
      }
      
      const emplacements = await Emplacement.find(query);
      
      // Calculate total hours
      let totalHours = 0;
      const typeBreakdown = {
        'Cours magistral': 0,
        'TD': 0,
        'TP': 0,
        'Atelier': 0,
        'Examen': 0
      };
      
      emplacements.forEach(emp => {
        const start = emp.heureDebut.split(':');
        const end = emp.heureFin.split(':');
        const hours = (parseInt(end[0]) - parseInt(start[0])) + 
                      (parseInt(end[1]) - parseInt(start[1])) / 60;
        totalHours += hours;
        
        if (typeBreakdown[emp.type] !== undefined) {
          typeBreakdown[emp.type] += hours;
        }
      });
      
      return {
        _id: ens._id,
        nom: ens.nom,
        prenom: ens.prenom,
        specialite: ens.specialite,
        coursCount: cours.length,
        emplacementsCount: emplacements.length,
        totalHours: Math.round(totalHours * 10) / 10,
        typeBreakdown,
        averageHoursPerCourse: cours.length > 0 ? Math.round((totalHours / cours.length) * 10) / 10 : 0
      };
    }));

    // Sort by total hours descending
    result.sort((a, b) => b.totalHours - a.totalHours);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Academic Year Summary
router.get('/academic-year', async (req, res) => {
  try {
    const { annee = new Date().getFullYear().toString() } = req.query;
    
    // Get all levels
    const levels = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
    
    const summary = await Promise.all(levels.map(async (level) => {
      // Count courses
      const coursCount = await Cours.countDocuments({ niveau: level });
      
      // Get all cours for this level
      const cours = await Cours.find({ niveau: level });
      const coursIds = cours.map(c => c._id);
      
      // Get all students in this level
      const etudiants = await Etudiant.find({ niveau: level });
      const etudiantCount = etudiants.length;
      
      // Get total course hours
      let totalHours = 0;
      cours.forEach(c => totalHours += c.heures);
      
      // Get total credits
      let totalCredits = 0;
      cours.forEach(c => totalCredits += c.credits);
      
      // Get emplacements
      const emplacements = await Emplacement.find({ 
        cours: { $in: coursIds },
        niveau: level
      });
      
      // Count unique rooms used
      const rooms = [...new Set(emplacements.map(e => e.salle))];
      
      // Group by semester
      const sem1Cours = cours.filter(c => c.semestre === 'Semestre 1').length;
      const sem2Cours = cours.filter(c => c.semestre === 'Semestre 2').length;
      
      return {
        level,
        coursCount,
        etudiantCount,
        totalHours,
        totalCredits,
        roomsUsed: rooms.length,
        semester1: {
          coursCount: sem1Cours
        },
        semester2: {
          coursCount: sem2Cours
        }
      };
    }));

    // Calculate totals
    const totals = {
      level: 'Total',
      coursCount: summary.reduce((sum, s) => sum + s.coursCount, 0),
      etudiantCount: summary.reduce((sum, s) => sum + s.etudiantCount, 0),
      totalHours: summary.reduce((sum, s) => sum + s.totalHours, 0),
      totalCredits: summary.reduce((sum, s) => sum + s.totalCredits, 0),
      roomsUsed: [...new Set(summary.flatMap(s => s.roomsUsed))].length
    };

    res.json({
      year: annee,
      summary,
      totals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Fill Rate Statistics
router.get('/fill-rate', async (req, res) => {
  try {
    const { maxStudents = 30 } = req.query;
    
    const cours = await Cours.find();
    
    const courseStats = await Promise.all(cours.map(async (c) => {
      const etudiantCount = await Etudiant.countDocuments({ cours: c._id });
      return {
        coursId: c._id,
        titre: c.titre,
        niveau: c.niveau,
        currentStudents: etudiantCount,
        maxStudents: parseInt(maxStudents),
        fillRate: Math.round((etudiantCount / maxStudents) * 100)
      };
    }));

    const fillRates = {
      empty: courseStats.filter(c => c.currentStudents === 0).length,
      low: courseStats.filter(c => c.fillRate > 0 && c.fillRate < 50).length,
      medium: courseStats.filter(c => c.fillRate >= 50 && c.fillRate < 80).length,
      high: courseStats.filter(c => c.fillRate >= 80 && c.fillRate < 100).length,
      full: courseStats.filter(c => c.fillRate >= 100).length
    };

    const averageFillRate = courseStats.length > 0 
      ? Math.round(courseStats.reduce((sum, c) => sum + c.fillRate, 0) / courseStats.length)
      : 0;

    res.json({
      courses: courseStats,
      distribution: fillRates,
      averageFillRate,
      totalCapacity: courseStats.length * parseInt(maxStudents),
      totalEnrolled: courseStats.reduce((sum, c) => sum + c.currentStudents, 0)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

