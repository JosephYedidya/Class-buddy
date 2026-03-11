const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// Middleware for handling file uploads (simplified - in production use multer)
const handleUpload = async (req, res, next) => {
  // This is a simplified version - in production you'd use multer
  next();
};

// GET all documents
router.get('/', async (req, res) => {
  try {
    const { cours, type, niveau, accessiblePar } = req.query;
    let query = {};

    if (cours) query.cours = cours;
    if (type) query.type = type;
    if (niveau) query.niveau = niveau;
    if (accessiblePar) query.accessiblePar = accessiblePar;

    const documents = await Document.find(query)
      .populate('cours', 'titre')
      .populate('uploadsPar', 'nom prenom')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET documents by course
router.get('/cours/:coursId', async (req, res) => {
  try {
    const documents = await Document.find({ cours: req.params.coursId })
      .populate('uploadsPar', 'nom prenom')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('cours', 'titre')
      .populate('uploadsPar', 'nom prenom');
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE document (with file info)
router.post('/', async (req, res) => {
  try {
    const document = new Document({
      titre: req.body.titre,
      description: req.body.description,
      type: req.body.type,
      cours: req.body.cours,
      niveau: req.body.niveau,
      fichier: req.body.fichier,
      nomFichier: req.body.nomFichier,
      taille: req.body.taille,
      mimeType: req.body.mimeType,
      uploadsPar: req.body.uploadsPar,
      accessiblePar: req.body.accessiblePar,
      public: req.body.public
    });

    const newDocument = await document.save();
    const populated = await Document.findById(newDocument._id)
      .populate('cours', 'titre')
      .populate('uploadsPar', 'nom prenom');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE document
router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('cours', 'titre')
      .populate('uploadsPar', 'nom prenom');

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    res.json(document);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Try to delete the file if it exists
    if (document.fichier) {
      try {
        const filePath = path.join(__dirname, '../../uploads', document.fichier);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download document
router.get('/:id/download', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const filePath = path.join(__dirname, '../../uploads', document.fichier);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé sur le serveur' });
    }

    res.download(filePath, document.nomFichier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

