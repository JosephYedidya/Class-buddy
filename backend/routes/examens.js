const express = require('express');
const router = express.Router();
const Examen = require('../models/Examen');

// Check for exam conflicts
const checkExamConflicts = async (newExamen, excludeId = null) => {
  const conflicts = [];
  
  const sameDayExams = await Examen.find({
    date: newExamen.date,
    _id: { $ne: excludeId }
  }).populate('cours', 'titre').populate('surveillant', 'nom prenom');

  for (const exam of sameDayExams) {
    // Check room conflict
    if (exam.salle === newExamen.salle) {
      const timeOverlap = (
        newExamen.heureDebut < exam.heureFin && 
        newExamen.heureFin > exam.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'salle',
          message: `Conflit de salle: ${exam.salle} est déjà reservée pour "${exam.cours?.titre || 'examen'}" de ${exam.heureDebut} à ${exam.heureFin}`,
          examen: exam
        });
      }
    }

    // Check surveillant conflict
    if (exam.surveillant?._id.toString() === newExamen.surveillant?.toString()) {
      const timeOverlap = (
        newExamen.heureDebut < exam.heureFin && 
        newExamen.heureFin > exam.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'surveillant',
          message: `Conflit de surveillant: ${exam.surveillant?.nom} ${exam.surveillant?.prenom} surveille déjà "${exam.cours?.titre || 'examen'}" de ${exam.heureDebut} à ${exam.heureFin}`,
          examen: exam
        });
      }
    }

    // Check group conflict
    if (exam.groupe === newExamen.groupe) {
      const timeOverlap = (
        newExamen.heureDebut < exam.heureFin && 
        newExamen.heureFin > exam.heureDebut
      );
      if (timeOverlap) {
        conflicts.push({
          type: 'groupe',
          message: `Conflit de groupe: ${exam.groupe} a déjà un examen "${exam.cours?.titre || 'examen'}" de ${exam.heureDebut} à ${exam.heureFin}`,
          examen: exam
        });
      }
    }
  }

  return conflicts;
};

// GET all exams
router.get('/', async (req, res) => {
  try {
    const { cours, groupe, date, dateDebut, dateFin, niveau } = req.query;
    let query = {};

    if (cours) query.cours = cours;
    if (groupe) query.groupe = groupe;
    if (niveau) query.niveau = niveau;
    if (date) query.date = new Date(date);
    if (dateDebut && dateFin) {
      query.date = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    const exams = await Examen.find(query)
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom')
      .sort({ date: 1, heureDebut: 1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one exam
router.get('/:id', async (req, res) => {
  try {
    const exam = await Examen.findById(req.params.id)
      .populate('cours', 'titre description')
      .populate('surveillant', 'nom prenom specialite');
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE exam
router.post('/', async (req, res) => {
  try {
    const examen = new Examen({
      cours: req.body.cours,
      type: req.body.type,
      date: req.body.date,
      heureDebut: req.body.heureDebut,
      heureFin: req.body.heureFin,
      salle: req.body.salle,
      surveillant: req.body.surveillant,
      groupe: req.body.groupe,
      duree: req.body.duree,
      description: req.body.description,
      niveau: req.body.niveau,
      semestre: req.body.semestre
    });

    // Check for conflicts
    const conflicts = await checkExamConflicts(examen);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Conflits détectés',
        conflicts: conflicts,
        examen: null
      });
    }

    const newExamen = await examen.save();
    const populated = await Examen.findById(newExamen._id)
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom');
    
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE exam
router.put('/:id', async (req, res) => {
  try {
    const existingExam = await Examen.findById(req.params.id);
    if (!existingExam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    Object.assign(existingExam, req.body);

    const conflicts = await checkExamConflicts(existingExam, req.params.id);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Conflits détectés',
        conflicts: conflicts,
        examen: null
      });
    }

    const updatedExam = await existingExam.save();
    const populated = await Examen.findById(updatedExam._id)
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom');
    
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE exam
router.delete('/:id', async (req, res) => {
  try {
    const examen = await Examen.findByIdAndDelete(req.params.id);
    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    res.json({ message: 'Examen supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET upcoming exams
router.get('/upcoming/list', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const exams = await Examen.find({
      date: { $gte: today }
    })
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom')
      .sort({ date: 1, heureDebut: 1 })
      .limit(10);

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET exam calendar data
router.get('/calendar', async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    let query = {};
    
    if (dateDebut && dateFin) {
      query.date = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    const exams = await Examen.find(query)
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom');

    const calendarEvents = exams.map(exam => ({
      id: exam._id,
      title: `${exam.cours?.titre || 'Examen'} - ${exam.type}`,
      start: new Date(exam.date).toISOString().split('T')[0] + 'T' + exam.heureDebut,
      end: new Date(exam.date).toISOString().split('T')[0] + 'T' + exam.heureFin,
      salle: exam.salle,
      groupe: exam.groupe,
      type: 'examen'
    }));

    res.json(calendarEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

