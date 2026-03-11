const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-cours';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// Routes
const coursRoutes = require('./routes/cours');
const enseignantsRoutes = require('./routes/enseignants');
const etudiantsRoutes = require('./routes/etudiants');
const emplacementsRoutes = require('./routes/emplacements');
const statistiquesRoutes = require('./routes/statistiques');
const presencesRoutes = require('./routes/presences');
const examensRoutes = require('./routes/examens');
const documentsRoutes = require('./routes/documents');
const exportsRoutes = require('./routes/exports');

app.use('/api/cours', coursRoutes);
app.use('/api/enseignants', enseignantsRoutes);
app.use('/api/etudiants', etudiantsRoutes);
app.use('/api/emplacements', emplacementsRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/presences', presencesRoutes);
app.use('/api/examens', examensRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/exports', exportsRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API Gestion Cours et Enseignants' });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

