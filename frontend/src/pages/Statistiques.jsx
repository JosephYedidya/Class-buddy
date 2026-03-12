import { useState, useEffect } from 'react';
import { statistiquesAPI } from '../services/api';

function Statistiques() {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [studentsPerCourse, setStudentsPerCourse] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);
  const [fillRate, setFillRate] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear().toString());
  const [maxStudents, setMaxStudents] = useState(30);

  useEffect(() => {
    fetchData();
  }, [annee, maxStudents]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [summaryRes, studentsRes, workloadRes, academicRes, fillRes] = await Promise.all([
        statistiquesAPI.getSummary(annee),
        statistiquesAPI.getStudentsPerCourse(maxStudents),
        statistiquesAPI.getTeacherWorkload(annee),
        statistiquesAPI.getAcademicYear(annee),
        statistiquesAPI.getFillRate(maxStudents)
      ]);

      setSummary(summaryRes.data);
      setStudentsPerCourse(studentsRes.data);
      setTeacherWorkload(workloadRes.data);
      setAcademicYear(academicRes.data);
      setFillRate(fillRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setLoading(false);
    }
  };

  const getFillRateColor = (rate) => {
    if (rate === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (rate < 50) return 'bg-green-500';
    if (rate < 80) return 'bg-yellow-500';
    if (rate < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getWorkloadColor = (hours) => {
    if (hours < 50) return 'bg-green-500';
    if (hours < 100) return 'bg-blue-500';
    if (hours < 150) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Statistiques & Rapports</h1>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">Année académique</label>
            <select
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">Capacité max/cours</label>
            <input
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg transition ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Résumé
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-lg transition ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Étudiants/Cours
        </button>
        <button
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2 rounded-lg transition ${activeTab === 'workload' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Charge Enseignants
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 rounded-lg transition ${activeTab === 'academic' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Année Académique
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total Cours</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalCours}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total Étudiants</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.totalEtudiants}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total Enseignants</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.totalEnseignants}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total Emplacements</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{summary.totalEmplacements}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students per Course Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {fillRate && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Répartition des Taux de Remplissage</h3>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{fillRate.distribution.empty}</div>
                  <div className="text-sm text-gray-500">Vide</div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{fillRate.distribution.low}</div>
                  <div className="text-sm text-green-600">< 50%</div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{fillRate.distribution.medium}</div>
                  <div className="text-sm text-yellow-600">50-80%</div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{fillRate.distribution.high}</div>
                  <div className="text-sm text-orange-600">80-99%</div>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{fillRate.distribution.full}</div>
                  <div className="text-sm text-red-600">Plein</div>
                </div>
              </div>
              <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Taux de remplissage moyen: </span>
                {fillRate.averageFillRate}% | 
                <span className="font-semibold ml-2">Capacité totale: </span>
                {fillRate.totalCapacity} places |
                <span className="font-semibold ml-2">Inscrits: </span>
                {fillRate.totalEnrolled} étudiants
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Nombre d'étudiants par cours</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Niveau</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Enseignant</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Étudiants</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {studentsPerCourse.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-800 dark:text-white font-medium">{course.titre}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.niveau}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.teacher}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-white ${course.isFull ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {course.studentCount}/{course.maxStudents}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getFillRateColor(course.fillRate)}`} 
                              style={{ width: `${Math.min(course.fillRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-10">{course.fillRate}%</span>
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

      {/* Teacher Workload Tab */}
      {activeTab === 'workload' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Charge de travail des enseignants</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Enseignant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Spécialité</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cours</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Emplacements</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Heures Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Moyenne/Cours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {teacherWorkload.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-white font-medium">
                      {teacher.nom} {teacher.prenom}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{teacher.specialite}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.coursCount}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.emplacementsCount}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getWorkloadColor(teacher.totalHours)}`} 
                            style={{ width: `${Math.min(teacher.totalHours / 2, 100)}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">{teacher.totalHours}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.averageHoursPerCourse}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Year Tab */}
      {activeTab === 'academic' && academicYear && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {academicYear.summary.map((level) => (
              <div key={level.level} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{level.level}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cours:</span>
                    <span className="font-medium">{level.coursCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Étudiants:</span>
                    <span className="font-medium">{level.etudiantCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Heures:</span>
                    <span className="font-medium">{level.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crédits:</span>
                    <span className="font-medium">{level.totalCredits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Totaux Année Académique {annee}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{academicYear.totals.coursCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Cours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{academicYear.totals.etudiantCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{academicYear.totals.totalHours}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Heures</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{academicYear.totals.totalCredits}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Crédits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{academicYear.totals.roomsUsed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Salles Utilisées</div>
              </div>
            </div>
          </div>

          {/* Semester breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Répartition par Semestre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Semestre 1</h4>
                <div className="space-y-2">
                  {academicYear.summary.map((level) => (
                    <div key={`s1-${level.level}`} className="flex items-center gap-2">
                      <span className="w-24 text-sm text-gray-600 dark:text-gray-400">{level.level}</span>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${academicYear.totals.coursCount > 0 ? (level.semester1.coursCount / academicYear.totals.coursCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{level.semester1.coursCount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Semestre 2</h4>
                <div className="space-y-2">
                  {academicYear.summary.map((level) => (
                    <div key={`s2-${level.level}`} className="flex items-center gap-2">
                      <span className="w-24 text-sm text-gray-600 dark:text-gray-400">{level.level}</span>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ width: `${academicYear.totals.coursCount > 0 ? (level.semester2.coursCount / academicYear.totals.coursCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm w-8">{level.semester2.coursCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistiques;

