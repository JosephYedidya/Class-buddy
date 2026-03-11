
import { useState, useEffect } from 'react';
import { examensAPI, coursAPI, enseignantsAPI } from '../services/api';

function Examens() {
  const [examens, setExamens] = useState([]);
  const [cours, setCours] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExamen, setEditingExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState([]);

  const [formData, setFormData] = useState({
    cours: '',
    type: 'Partiel',
    date: '',
    heureDebut: '09:00',
    heureFin: '11:00',
    salle: '',
    surveillant: '',
    groupe: '',
    duree: 120,
    description: '',
    niveau: 'Licence 1',
    semestre: 'Semestre 1'
  });

  useEffect(() => {
    fetchExamens();
    fetchCours();
    fetchEnseignants();
  }, []);

  const fetchExamens = async () => {
    try {
      const response = await examensAPI.getAll();
      setExamens(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des examens');
      setLoading(false);
    }
  };

  const fetchCours = async () => {
    try {
      const response = await coursAPI.getAll();
      setCours(response.data);
    } catch (err) {
      console.error('Error fetching cours:', err);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await enseignantsAPI.getAll();
      setEnseignants(response.data);
    } catch (err) {
      console.error('Error fetching enseignants:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflicts([]);
    try {
      if (editingExamen) {
        const response = await examensAPI.update(editingExamen._id, formData);
        if (response.data.message === 'Conflits detectes') {
          setConflicts(response.data.conflicts);
          return;
        }
      } else {
        const response = await examensAPI.create(formData);
        if (response.data.message === 'Conflits detectes') {
          setConflicts(response.data.conflicts);
          return;
        }
      }
      fetchExamens();
      closeModal();
    } catch (err) {
      if (err.response?.data?.message === 'Conflits detectes') {
        setConflicts(err.response.data.conflicts);
      } else {
        setError('Erreur lors de la sauvegarde de l\'examen');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer cet examen?')) {
      try {
        await examensAPI.delete(id);
        fetchExamens();
      } catch (err) {
        setError('Erreur lors de la suppression de l\'examen');
      }
    }
  };

  const openModal = (examen = null) => {
    if (examen) {
      setEditingExamen(examen);
      setFormData({
        cours: examen.cours?._id || '',
        type: examen.type,
        date: examen.date ? examen.date.split('T')[0] : '',
        heureDebut: examen.heureDebut,
        heureFin: examen.heureFin,
        salle: examen.salle,
        surveillant: examen.surveillant?._id || '',
        groupe: examen.groupe,
        duree: examen.duree,
        description: examen.description || '',
        niveau: examen.niveau,
        semestre: examen.semestre
      });
    } else {
      setEditingExamen(null);
      setFormData({
        cours: '',
        type: 'Partiel',
        date: '',
        heureDebut: '09:00',
        heureFin: '11:00',
        salle: '',
        surveillant: '',
        groupe: '',
        duree: 120,
        description: '',
        niveau: 'Licence 1',
        semestre: 'Semestre 1'
      });
    }
    setConflicts([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExamen(null);
    setError('');
    setConflicts([]);
  };

  const forceCreate = async () => {
    try {
      if (editingExamen) {
        await examensAPI.update(editingExamen._id, { ...formData, force: true });
      } else {
        await examensAPI.create({ ...formData, force: true });
      }
      fetchExamens();
      closeModal();
    } catch (err) {
      setError('Erreur lors de la creation forcee');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Partiel': return 'bg-orange-100 text-orange-800';
      case 'Final': return 'bg-red-100 text-red-800';
      case 'Rattrapage': return 'bg-purple-100 text-purple-800';
      case 'TD': return 'bg-blue-100 text-blue-800';
      case 'TP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Examens</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Examen
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <div className="font-bold mb-2">Conflits detectes:</div>
          <ul className="list-disc pl-5">
            {conflicts.map((conflict, idx) => (
              <li key={idx}>{conflict.message}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              onClick={forceCreate}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Forcer la creation
            </button>
            <button
              onClick={() => setConflicts([])}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examens.map((examen) => (
          <div key={examen._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{examen.cours?.titre}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(examen.type)}`}>
                  {examen.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(examen)} className="text-blue-600 hover:text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(examen._id)} className="text-red-600 hover:text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium dark:text-white">
                  {new Date(examen.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Horaire:</span>
                <span className="font-medium dark:text-white">{examen.heureDebut} - {examen.heureFin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Salle:</span>
                <span className="font-medium dark:text-white">{examen.salle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Groupe:</span>
                <span className="font-medium dark:text-white">{examen.groupe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duree:</span>
                <span className="font-medium dark:text-white">{examen.duree} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Surveillant:</span>
                <span className="font-medium text-blue-600">
                  {examen.surveillant ? `${examen.surveillant.nom} ${examen.surveillant.prenom}` : 'Non assigne'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {examens.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun examen trouve</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingExamen ? 'Modifier l\'Examen' : 'Nouvel Examen'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cours</label>
                  <select
                    value={formData.cours}
                    onChange={(e) => setFormData({ ...formData, cours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    required
                  >
                    <option value="">Selectionner un cours</option>
                    {cours.map((c) => (
                      <option key={c._id} value={c._id}>{c.titre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    >
                      <option>Partiel</option>
                      <option>Final</option>
                      <option>Rattrapage</option>
                      <option>TD</option>
                      <option>TP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure debut</label>
                    <input
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure fin</label>
                    <input
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salle</label>
                    <input
                      type="text"
                      value={formData.salle}
                      onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duree (min)</label>
                    <input
                      type="number"
                      value={formData.duree}
                      onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Groupe</label>
                    <input
                      type="text"
                      value={formData.groupe}
                      onChange={(e) => setFormData({ ...formData, groupe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surveillant</label>
                    <select
                      value={formData.surveillant}
                      onChange={(e) => setFormData({ ...formData, surveillant: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    >
                      <option value="">Selectionner</option>
                      {enseignants.map((ens) => (
                        <option key={ens._id} value={ens._id}>{ens.nom} {ens.prenom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau</label>
                    <select
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    >
                      <option>Semestre 1</option>
                      <option>Semestre 2</option>
                      <option>Annee complete</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    rows="2"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingExamen ? 'Mettre a jour' : 'Creer'}
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

export default Examens;

