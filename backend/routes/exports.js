const express = require('express');
const router = express.Router();
const Etudiant = require('../models/Etudiant');
const Cours = require('../models/Cours');
const Enseignant = require('../models/Enseignant');
const Emplacement = require('../models/Emplacement');
const Examen = require('../models/Examen');
const Presence = require('../models/Presence');

// Generate iCal calendar
router.get('/calendar/ical', async (req, res) => {
  try {
    const { type } = req.query; // 'cours', 'examen', or 'all'
    
    let events = [];
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Get cours schedule
    if (type === 'cours' || type === 'all') {
      const emplacements = await Emplacement.find()
        .populate('cours', 'titre')
        .populate('enseignant', 'nom prenom');
      
      emplacements.forEach(emp => {
        const daysMap = {
          'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 
          'Vendredi': 5, 'Samedi': 6, 'Dimanche': 0
        };
        const dayOfWeek = daysMap[emp.jour];
        
        // Generate events for the next 12 weeks
        for (let week = 0; week < 12; week++) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (week * 7) + (dayOfWeek - eventDate.getDay() + 7) % 7);
          
          const [startHour, startMin] = emp.heureDebut.split(':');
          const [endHour, endMin] = emp.heureFin.split(':');
          
          eventDate.setHours(parseInt(startHour), parseInt(startMin), 0);
          const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          
          eventDate.setHours(parseInt(endHour), parseInt(endMin), 0);
          const endDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          
          events.push({
            uid: `emp-${emp._id}-${week}@gestion-cours`,
            dtstart: startDate,
            dtend: endDate,
            summary: `${emp.cours?.titre || 'Cours'} - ${emp.type}`,
            description: `Salle: ${emp.salle}\\nGroupe: ${emp.groupe}\\nEnseignant: ${emp.enseignant?.nom || ''} ${emp.enseignant?.prenom || ''}`,
            location: emp.salle
          });
        }
      });
    }
    
    // Get exams
    if (type === 'examen' || type === 'all') {
      const examens = await Examen.find()
        .populate('cours', 'titre');
      
      examens.forEach(exam => {
        const examDate = new Date(exam.date);
        const [startHour, startMin] = exam.heureDebut.split(':');
        const [endHour, endMin] = exam.heureFin.split(':');
        
        examDate.setHours(parseInt(startHour), parseInt(startMin), 0);
        const startDate = examDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        examDate.setHours(parseInt(endHour), parseInt(endMin), 0);
        const endDate = examDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        events.push({
          uid: `exam-${exam._id}@gestion-cours`,
          dtstart: startDate,
          dtend: endDate,
          summary: `EXAMEN: ${exam.cours?.titre || 'Examen'} - ${exam.type}`,
          description: `Salle: ${exam.salle}\\nGroupe: ${exam.groupe}\\nDurée: ${exam.duree} min`,
          location: exam.salle
        });
      });
    }
    
    // Generate iCal content
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gestion Cours//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    events.forEach(event => {
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${event.dtstart}`,
        `DTEND:${event.dtend}`,
        `SUMMARY:${event.summary}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        'END:VEVENT'
      );
    });
    
    icalContent.push('END:VCALENDAR');
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="emploi-du-temps.ics"');
    res.send(icalContent.join('\r\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export students to CSV
router.get('/students/csv', async (req, res) => {
  try {
    const etudiants = await Etudiant.find().populate('cours', 'titre');
    
    let csvContent = 'Nom,Prénom,Email,Téléphone,Niveau,Cours\n';
    
    etudiants.forEach(etud => {
      const coursTitles = etud.cours.map(c => c.titre).join('; ');
      csvContent += `"${etud.nom}","${etud.prenom}","${etud.email}","${etud.telephone || ''}","${etud.niveau}","${coursTitles}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="etudiants.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export teachers to CSV
router.get('/teachers/csv', async (req, res) => {
  try {
    const enseignants = await Enseignant.find();
    
    let csvContent = 'Nom,Prénom,Email,Téléphone,Spécialité,Date Embauche\n';
    
    enseignants.forEach(ens => {
      const dateEmbauche = ens.dateEmauche ? new Date(ens.dateEmauche).toLocaleDateString() : '';
      csvContent += `"${ens.nom}","${ens.prenom}","${ens.email}","${ens.telephone || ''}","${ens.specialite}","${dateEmbauche}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="enseignants.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export courses to CSV
router.get('/courses/csv', async (req, res) => {
  try {
    const cours = await Cours.find().populate('enseignant', 'nom prenom');
    
    let csvContent = 'Titre,Description,Niveau,Heures,Crédits,Semestre,Enseignant\n';
    
    cours.forEach(c => {
      const teacher = c.enseignant ? `${c.enseignant.nom} ${c.enseignant.prenom}` : '';
      csvContent += `"${c.titre}","${c.description.replace(/"/g, '""')}","${c.niveau}",${c.heures},${c.credits},"${c.semestre}","${teacher}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cours.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export schedule to CSV
router.get('/schedule/csv', async (req, res) => {
  try {
    const emplacements = await Emplacement.find()
      .populate('cours', 'titre')
      .populate('enseignant', 'nom prenom');
    
    let csvContent = 'Jour,HeureDébut,HeureFin,Cours,Type,Salle,Groupe,Niveau,Enseignant\n';
    
    emplacements.forEach(emp => {
      const teacher = emp.enseignant ? `${emp.enseignant.nom} ${emp.enseignant.prenom}` : '';
      csvContent += `"${emp.jour}","${emp.heureDebut}","${emp.heureFin}","${emp.cours?.titre || ''}","${emp.type}","${emp.salle}","${emp.groupe}","${emp.niveau || ''}","${teacher}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="emploi-du-temps.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export exams to CSV
router.get('/exams/csv', async (req, res) => {
  try {
    const examens = await Examen.find()
      .populate('cours', 'titre')
      .populate('surveillant', 'nom prenom');
    
    let csvContent = 'Date,HeureDébut,HeureFin,Cours,Type,Salle,Groupe,Durée,Surveillant\n';
    
    examens.forEach(exam => {
      const surveillant = exam.surveillant ? `${exam.surveillant.nom} ${exam.surveillant.prenom}` : '';
      const dateStr = new Date(exam.date).toLocaleDateString();
      csvContent += `"${dateStr}","${exam.heureDebut}","${exam.heureFin}","${exam.cours?.titre || ''}","${exam.type}","${exam.salle}","${exam.groupe}",${exam.duree},"${surveillant}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="examens.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export attendance report
router.get('/attendance/:coursId/csv', async (req, res) => {
  try {
    const { coursId } = req.params;
    const cours = await Cours.findById(coursId);
    const etudiants = await Etudiant.find({ cours: coursId });
    const presences = await Presence.find({ cours: coursId });
    
    // Get unique dates
    const dates = [...new Set(presences.map(p => p.date.toISOString().split('T')[0]))].sort();
    
    let csvContent = 'Nom,Prénom,' + dates.join(',') + ',Total Présences,Taux\n';
    
    etudiants.forEach(etud => {
      const etudPresences = presences.filter(p => p.etudiant.toString() === etud._id.toString());
      const presentCount = etudPresences.filter(p => p.statut === 'present').length;
      const taux = dates.length > 0 ? Math.round((presentCount / dates.length) * 100) : 0;
      
      let row = `"${etud.nom}","${etud.prenom}",`;
      dates.forEach(date => {
        const presence = etudPresences.find(p => p.date.toISOString().split('T')[0] === date);
        const status = presence ? presence.statut.charAt(0).toUpperCase() : '-';
        row += `"${status}",`;
      });
      row += `${presentCount},${taux}%`;
      csvContent += row + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="presence-${cours?.titre || 'cours'}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

