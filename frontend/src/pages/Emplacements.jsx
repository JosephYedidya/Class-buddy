import { useState, useEffect } from 'react';
import { emplacementsAPI, coursAPI, enseignantsAPI } from '../services/api';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

function Emplacements() {
  const [emplacements, setEmplacements] = useState([]);
  const [cours, setCours] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmplacement, setEditingEmplacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [activeTab, setActiveTab] = useState('schedule');
  const [filterType, setFilterType] = useState('teacher');
  const [selectedFilter, setSelectedFilter] = useState('');
  
  const [salles, setSalles] = useState([]);
  const [groupes, setGroupes] = useState([]);

  const [formData, setFormData] = useState({
    cours: '',
    jour: 'Lundi',
    heureDebut: '09:00',
    heureFin: '10:30',
    salle: '',
    type: 'Cours magistral',
    groupe: 'Groupe A',
    enseignant: '',
    niveau: 'Licence 1',
    semestre: 'Semestre 1'
  });

  useEffect(() => {
    fetchData();
  }, [filterType, selectedFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filterType === 'teacher' && selectedFilter) {
        params.view = 'teacher';
        params.id = selectedFilter;
      } else if (filterType === 'group' && selectedFilter) {
        params.view = 'group';
        params.id = selectedFilter;
      } else if (filterType === 'room' && selectedFilter) {
        params.view = 'room';
        params.id = selectedFilter;
      }

      const [empRes, coursRes, ensRes] = await Promise.all([
        emplacementsAPI.getAll(params),
        coursAPI.getAll(),
        enseignantsAPI.getAll()
      ]);

      setEmplacements(empRes.data);
      setCours(coursRes.data);
      setEnseignants(ensRes.data);

      // Get unique rooms and groups
      const filters = await emplacementsAPI.getFilters();
      setSalles(filters.data.salles || []);
      setGroupes(filters.data.groupes || []);

      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const checkConflicts = async () => {
    try {
      const result = await emplacementsAPI.checkConflicts({
        ...formData,
        excludeId: editingEmplacement?._id
      });
      return result.data;
    } catch (err) {
      return { hasConflicts: false, conflicts: [] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflicts([]);

    try {
      // Check for conflicts first
      const conflictResult = await checkConflicts();
      
      if (conflictResult.hasConflicts) {
        setConflicts(conflictResult.conflicts);
        // Still allow saving if user confirms
        const confirmed = window.confirm(
          `Attention: ${conflictResult.conflicts.length} conflit(s) détecté(s). Voulez-vous continuer quand même?`
        );
        if (!confirmed) return;
      }

      if (editingEmplacement) {
        await emplacementsAPI.update(editingEmplacement._id, formData);
      } else {
        await emplacementsAPI.create(formData);
      }
      
      fetchData();
      closeModal();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflicts(err.response.data.conflicts || []);
        setError('Conflits détectés - Veuillez résoudre les conflits avant de sauvegarder');
      } else {
        setError('Erreur lors de la sauvegarde de l\'emplacement');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet emplacement?')) {
      try {
        await emplacementsAPI.delete(id);
        fetchData();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (emp = null) => {
    if (emp) {
      setEditingEmplacement(emp);
      setFormData({
        cours: emp.cours?._id || emp.cours || '',
        jour: emp.jour || 'Lundi',
        heureDebut: emp.heureDebut || '09:00',
        heureFin: emp.heureFin || '10:30',
        salle: emp.salle || '',
        type: emp.type || 'Cours magistral',
        groupe: emp.groupe || 'Groupe A',
        enseignant: emp.enseignant?._id || emp.enseignant || '',
        niveau: emp.niveau || 'Licence 1',
        semestre: emp.semestre || 'Semestre 1'
      });
    } else {
      setEditingEmplacement(null);
      setFormData({
        cours: '',
        jour: 'Lundi',
        heureDebut: '09:00',
        heureFin: '10:30',
        salle: '',
        type: 'Cours magistral',
        groupe: 'Groupe A',
        enseignant: '',
        niveau: 'Licence 1',
        semestre: 'Semestre 1'
      });
    }
    setConflicts([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmplacement(null);
    setConflicts([]);
    setError('');
  };

  const getEmplacementForSlot = (day, time) => {
    return emplacements.find(emp => {
      const empDay = emp.jour === day;
      const startIdx = TIME_SLOTS.indexOf(emp.heureDebut);
      const endIdx = TIME_SLOTS.indexOf(emp.heureFin);
      const timeIdx = TIME_SLOTS.indexOf(time);
      return empDay && timeIdx >= startIdx && timeIdx < endIdx;
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      'Cours magistral': 'bg-blue-500',
      'TD': 'bg-green-500',
      'TP': 'bg-purple-500',
      'Atelier': 'bg-orange-500',
      'Examen': 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const renderScheduleView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-4">
          <div className="p-2 font-semibold text-gray-600 dark:text-gray-300"></div>
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {day}
            </div>
          ))}
        </div>
        
        {TIME_SLOTS.slice(0, 20).map(time => (
          <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
            <div className="p-1 text-xs text-gray-500 dark:text-gray-400 text-right pr-2">{time}</div>
            {DAYS.map(day => {
              const emp = getEmplacementForSlot(day, time);
              if (emp && emp.heureDebut === time) {
                const duration = TIME_SLOTS.indexOf(emp.heureFin) - TIME_SLOTS.indexOf(emp.heureDebut);
                return (
                  <div
                    key={`${day}-${time}`}
                    className={`${getTypeColor(emp.type)} text-white p-1 rounded text-xs col-span-1 row-span-${duration} overflow-hidden`}
                    style={{ gridRow: `span ${duration}` }}
                  >
                    <div className="font-bold truncate">{emp.cours?.titre || 'Cours'}</div>
                    <div className="truncate">{emp.salle}</div>
                    <div className="truncate">{emp.groupe}</div>
                  </div>
                );
              } else if (emp) {
                return <div key={`${day}-${time}`} className="bg-gray-100 dark:bg-gray-700"></div>;
              }
              return <div key={`${day}-${time}`} className="bg-gray-50 dark:bg-gray-800 h-8"></div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {emplacements.map(emp => (
        <div key={emp._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded text-white ${getTypeColor(emp.type)}`}>
              {emp.type}
            </span>
            <div className="flex gap-1">
              <button onClick={() => openModal(emp)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{emp.cours?.titre || 'Cours'}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{emp.jour} {emp.heureDebut}-{emp.heureFin}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{emp.salle}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{emp.enseignant?.nom} {emp.enseignant?.prenom}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{emp.groupe}</span>
            </div>
          </div>
        </div>
      ))}
      
      {emplacements.length === 0 && (
        <div className="col-span-full text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun emplacement trouvé</p>
          <p className="text-gray-400">Cliquez sur "Nouvel Emplacement" pour commencer</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Emploi du Temps</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Emplacement
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => { setFilterType('teacher'); setSelectedFilter(''); }}
              className={`px-4 py-2 rounded-lg transition ${filterType === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Par Enseignant
            </button>
            <button
              onClick={() => { setFilterType('group'); setSelectedFilter(''); }}
              className={`px-4 py-2 rounded-lg transition ${filterType === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Par Groupe
            </button>
            <button
              onClick={() => { setFilterType('room'); setSelectedFilter(''); }}
              className={`px-4 py-2 rounded-lg transition ${filterType === 'room' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Par Salle
            </button>
            <button
              onClick={() => { setFilterType('all'); setSelectedFilter(''); }}
              className={`px-4 py-2 rounded-lg transition ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Tous
            </button>
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            <option value="">Sélectionner...</option>
            {filterType === 'teacher' && enseignants.map(ens => (
              <option key={ens._id} value={ens._id}>{ens.nom} {ens.prenom}</option>
            ))}
            {filterType === 'group' && (
              <>
                <option value="Groupe A">Groupe A</option>
                <option value="Groupe B">Groupe B</option>
                <option value="Groupe C">Groupe C</option>
                <option value="Master">Master</option>
              </>
            )}
            {filterType === 'room' && salles.map(salle => (
              <option key={salle} value={salle}>{salle}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600 dark:text-gray-400">Chargement...</div>
        </div>
      ) : (
        <>
          {/* Vue planning */}
          {renderScheduleView()}
          
          {/* Liste détaillée */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Liste des Emplacements</h2>
            {renderListView()}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingEmplacement ? 'Modifier l\'Emplacement' : 'Nouvel Emplacement'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conflicts Display */}
              {conflicts.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 dark:bg-yellow-900 dark:text-yellow-200">
                  <p className="font-bold">Conflits détectés:</p>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {conflicts.map((c, i) => (
                      <li key={i}>{c.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cours</label>
                  <select
                    value={formData.cours}
                    onChange={(e) => setFormData({ ...formData, cours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {cours.map(c => (
                      <option key={c._id} value={c._id}>{c.titre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jour</label>
                    <select
                      value={formData.jour}
                      onChange={(e) => setFormData({ ...formData, jour: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Cours magistral</option>
                      <option>TD</option>
                      <option>TP</option>
                      <option>Atelier</option>
                      <option>Examen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure de début</label>
                    <select
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_SLOTS.slice(0, -1).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure de fin</label>
                    <select
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_SLOTS.slice(1).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salle</label>
                    <input
                      type="text"
                      value={formData.salle}
                      onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Amphi A, Salle 101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Groupe</label>
                    <input
                      type="text"
                      value={formData.groupe}
                      onChange={(e) => setFormData({ ...formData, groupe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Groupe A, Master"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enseignant</label>
                  <select
                    value={formData.enseignant}
                    onChange={(e) => setFormData({ ...formData, enseignant: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map(ens => (
                      <option key={ens._id} value={ens._id}>{ens.nom} {ens.prenom}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau</label>
                    <select
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Semestre 1</option>
                      <option>Semestre 2</option>
                      <option>Année complète</option>
                    </select>
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
                    {editingEmplacement ? 'Mettre à jour' : 'Créer'}
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

export default Emplacements;

