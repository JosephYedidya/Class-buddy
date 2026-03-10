
import { useState, useEffect } from 'react';
import { coursAPI, enseignantsAPI } from '../services/api';

function Cours() {
  const [cours, setCours] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCours, setEditingCours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    niveau: 'Licence 1',
    heures: 30,
    credits: 3,
    semestre: 'Semestre 1',
    jour: 'Lundi',
    heure: '09:00',
    enseignant: '',
    dateDebut: '',
    dateFin: ''
  });

  useEffect(() => {
    fetchCours();
    fetchEnseignants();
  }, []);

  const fetchCours = async () => {
    try {
      const response = await coursAPI.getAll();
      setCours(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      setLoading(false);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await enseignantsAPI.getAll();
      setEnseignants(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des enseignants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCours) {
        await coursAPI.update(editingCours._id, formData);
      } else {
        await coursAPI.create(formData);
      }
      fetchCours();
      closeModal();
    } catch (err) {
      setError('Erreur lors de la sauvegarde du cours');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) {
      try {
        await coursAPI.delete(id);
        fetchCours();
      } catch (err) {
        setError('Erreur lors de la suppression du cours');
      }
    }
  };

  const openModal = (coursItem = null) => {
    if (coursItem) {
      setEditingCours(coursItem);
      setFormData({
        titre: coursItem.titre,
        description: coursItem.description,
        niveau: coursItem.niveau,
        heures: coursItem.heures,
        credits: coursItem.credits,
        semestre: coursItem.semestre,
        jour: coursItem.jour || 'Lundi',
        heure: coursItem.heure || '09:00',
        enseignant: coursItem.enseignant?._id || '',
        dateDebut: coursItem.dateDebut ? coursItem.dateDebut.split('T')[0] : '',
        dateFin: coursItem.dateFin ? coursItem.dateFin.split('T')[0] : ''
      });
    } else {
      setEditingCours(null);
      setFormData({
        titre: '',
        description: '',
        niveau: 'Licence 1',
        heures: 30,
        credits: 3,
        semestre: 'Semestre 1',
        jour: 'Lundi',
        heure: '09:00',
        enseignant: '',
        dateDebut: '',
        dateFin: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCours(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Cours</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Cours
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cours.map((coursItem) => (
          <div key={coursItem._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{coursItem.titre}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(coursItem)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(coursItem._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{coursItem.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Niveau:</span>
                <span className="font-medium dark:text-white">{coursItem.niveau}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Heures:</span>
                <span className="font-medium dark:text-white">{coursItem.heures}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Crédits:</span>
                <span className="font-medium dark:text-white">{coursItem.credits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Semestre:</span>
                <span className="font-medium dark:text-white">{coursItem.semestre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Jour:</span>
                <span className="font-medium dark:text-white">{coursItem.jour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Heure:</span>
                <span className="font-medium dark:text-white">{coursItem.heure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Enseignant:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {coursItem.enseignant ? `${coursItem.enseignant.nom} ${coursItem.enseignant.prenom}` : 'Non assigné'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cours.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun cours trouvé</p>
          <p className="text-gray-400">Cliquez sur "Nouveau Cours" pour commencer</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingCours ? 'Modifier le Cours' : 'Nouveau Cours'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}

                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau</label>
                    <select
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Licence 1</option>
                      <option>Licence 2</option>
                      <option>Licence 3</option>
                      <option>Master 1</option>
                      <option>Master 2</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semestre</label>
                    <select
                      value={formData.semestre}
                      onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Semestre 1</option>
                      <option>Semestre 2</option>
                      <option>Année complète</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heures</label>
                    <input
                      type="number"
                      value={formData.heures}
                      onChange={(e) => setFormData({ ...formData, heures: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crédits</label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jour</label>
                    <select
                      value={formData.jour}
                      onChange={(e) => setFormData({ ...formData, jour: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Lundi</option>
                      <option>Mardi</option>
                      <option>Mercredi</option>
                      <option>Jeudi</option>
                      <option>Vendredi</option>
                      <option>Samedi</option>
                      <option>Dimanche</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure</label>
                    <input
                      type="time"
                      value={formData.heure}
                      onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enseignant</label>
                  <select
                    value={formData.enseignant}
                    onChange={(e) => setFormData({ ...formData, enseignant: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map((ens) => (
                      <option key={ens._id} value={ens._id}>
                        {ens.nom} {ens.prenom} - {ens.specialite}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCours ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cours;

