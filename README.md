# Gestion des Cours et Enseignants

Application web complète pour gérer les cours et les enseignants d'un établissement scolaire.

## Stack Technique

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de données**: MongoDB (Mongoose)

## Structure du projet

```
gestion-cours-enseignants/
├── backend/
│   ├── models/
│   │   ├── Cours.js
│   │   └── Enseignant.js
│   ├── routes/
│   │   ├── cours.js
│   │   └── enseignants.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Cours.jsx
    │   │   └── Enseignants.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (installé localement ou MongoDB Atlas)

## Installation

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Configuration

### Backend

Créez un fichier `.env` dans le dossier `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestion-cours
```

Ou utilisez MongoDB Atlas:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gestion-cours
```

## Lancement

### 1. Démarrer MongoDB

Assurez-vous que MongoDB est en cours d'exécution sur votre machine.

### 2. Backend

```bash
cd backend
npm start
```

Le serveur backend sera démarré sur http://localhost:5000

### 3. Frontend

Dans un nouveau terminal:

```bash
cd frontend
npm run dev
```

L'application frontend sera disponible sur http://localhost:3000

## Fonctionnalités

### Gestion des Cours
- Liste de tous les cours
- Créer un nouveau cours
- Modifier un cours existant
- Supprimer un cours
- Associer un enseignant à un cours

### Gestion des Enseignants
- Liste de tous les enseignants
- Créer un nouvel enseignant
- Modifier un enseignant existant
- Supprimer un enseignant
- Voir les détails (email, téléphone, spécialité)

## API Endpoints

### Cours
- `GET /api/cours` - Liste tous les cours
- `GET /api/cours/:id` - Récupère un cours par ID
- `POST /api/cours` - Crée un nouveau cours
- `PUT /api/cours/:id` - Met à jour un cours
- `DELETE /api/cours/:id` - Supprime un cours

### Enseignants
- `GET /api/enseignants` - Liste tous les enseignants
- `GET /api/enseignants/:id` - Récupère un enseignant par ID
- `POST /api/enseignants` - Crée un nouvel enseignant
- `PUT /api/enseignants/:id` - Met à jour un enseignant
- `DELETE /api/enseignants/:id` - Supprime un enseignant

## Screenshots

L'application dispose d'une interface moderne avec:
- Navigation par onglets
- Cartes pour afficher les cours et enseignants
- Formulaires modaux pour la création/modification
- Design responsive (mobile-friendly)

