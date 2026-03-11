import { useState, useEffect } from 'react';
import { presenceAPI, coursAPI, etudiantsAPI } from '../services/api';

function Presence() {
  const [presences, setPresences] = useState([]);
  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('take');

  const [presenceData, setPresenceData] = useState({});

  useEffect(() => {
    fetchCours();
  }, []);

  useEffect(() => {
    if (selectedCours) {
      fetchEtudiants();
      fetchPresences();
      fetchStats();
    }
  }, [selectedCours, selectedDate]);

  const fetchCours = async () => {
    try {
      const response = await coursAPI.getAll();
      setCours(response.data);
    } catch (err) {
      console.error('Error fetching cours:', err);
    }
  };

  const fetchEtudiants = async () => {
    try {
      const response = await etudiantsAPI.getAll();
      const coursStudents = response.data.filter(e => 
        e.cours && e.cours.some(c => c._id === selectedCours || c === selectedCours)
      );
      setEtudiants(coursStudents);
      
      // Initialize presence data
      const initialData = {};
      coursStudents.forEach(e => {
        initialData[e._id] = 'present';
      });
      setPresenceData(initialData);
    } catch (err) {
      console.error('Error fetching etudiants:', err);
    }
  };

  const fetchPresences = async () => {
    try {
      const response = await presenceAPI.getAll({
        cours: selectedCours,
        date: selectedDate
      });
      
      const existingData = {};
      response.data.forEach(p => {
        existingData[p.etudiant._id] = p.statut;
      });
      setPresenceData(prev => ({ ...prev, ...existingData }));
    } catch (err) {
      console.error('Error fetching presences:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await presenceAPI.getStats(selectedCours);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSavePresences = async () => {
    setSaving(true);
    try {
      const presencesList = Object.entries(presenceData).map(([etudiantId, statut]) => ({
        etudiantId,
        statut
      }));

      await presenceAPI.bulkCreate({
        coursId: selectedCours,
        date: selectedDate,
        presences: presencesList
      });

      alert('Présences enregistrées avec succès!');
      fetchPresences();
      fetchStats();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
    }
    setSaving(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'retard': return 'bg-yellow-500';
      case 'excuse': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'retard': return 'Retard';
      case 'excuse': return 'Excusé';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Présences</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cours</label>
            <select
              value={selectedCours}
              onChange={(e) => setSelectedCours(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            >
              <option value="">Sélectionner un cours</option>
              {cours.map(c => (
                <option key={c._id} value={c._id}>{c.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            />
          </div>
        </div>
      </div>

      {selectedCours && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('take')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'take' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Prendre les présences
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Statistiques
            </button>
          </div>

          {/* Take Attendance Tab */}
          {activeTab === 'take' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Liste des étudiants - {selectedDate}
                </h3>
                <button
                  onClick={handleSavePresences}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Étudiant</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {etudiants.map(etud => (
                      <tr key={etud._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {etud.nom.charAt(0)}{etud.prenom.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{etud.nom} {etud.prenom}</p>
                              <p className="text-sm text-gray-500">{etud.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            {['present', 'absent', 'retard', 'excuse'].map(status => (
                              <button
                                key={status}
                                onClick={() => setPresenceData({ ...presenceData, [etud._id]: status })}
                                className={`px-3 py-1 rounded-full text-white text-sm transition ${
                                  presenceData[etud._id] === status 
                                    ? getStatusColor(status) 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                {getStatusLabel(status)}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {etudiants.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucun étudiant inscrit à ce cours
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.stats.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded-lg shadow p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.stats.present}</div>
                  <div className="text-sm text-green-600">Présents</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.stats.absent}</div>
                  <div className="text-sm text-red-600">Absents</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.stats.retard}</div>
                  <div className="text-sm text-yellow-600">Retards</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg shadow p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.stats.excuse}</div>
                  <div className="text-sm text-blue-600">Excusés</div>
                </div>
              </div>

              {/* Student Stats Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Présence par étudiant</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Étudiant</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Présences</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Taux</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.studentStats.map(s => (
                        <tr key={s.etudiant._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-800 dark:text-white">
                            {s.etudiant.nom} {s.etudiant.prenom}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                            {s.present} / {s.total}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${s.taux >= 75 ? 'bg-green-500' : s.taux >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${s.taux}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-800 dark:text-white w-12">{s.taux}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedCours && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Sélectionnez un cours pour gérer les présences</p>
        </div>
      )}
    </div>
  );
}

export default Presence;

