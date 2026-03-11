import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cours API
export const coursAPI = {
  getAll: () => api.get('/cours'),
  getById: (id) => api.get(`/cours/${id}`),
  create: (data) => api.post('/cours', data),
  update: (id, data) => api.put(`/cours/${id}`, data),
  delete: (id) => api.delete(`/cours/${id}`)
};

// Enseignants API
export const enseignantsAPI = {
  getAll: () => api.get('/enseignants'),
  getById: (id) => api.get(`/enseignants/${id}`),
  create: (data) => api.post('/enseignants', data),
  update: (id, data) => api.put(`/enseignants/${id}`, data),
  delete: (id) => api.delete(`/enseignants/${id}`)
};

// Etudiants API
export const etudiantsAPI = {
  getAll: () => api.get('/etudiants'),
  getById: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`)
};

// Emplacements API
export const emplacementsAPI = {
  getAll: (params) => api.get('/emplacements', { params }),
  getById: (id) => api.get(`/emplacements/${id}`),
  create: (data) => api.post('/emplacements', data),
  update: (id, data) => api.put(`/emplacements/${id}`, data),
  delete: (id) => api.delete(`/emplacements/${id}`),
  checkConflicts: (data) => api.post('/emplacements/check-conflicts', data),
  getFilters: () => api.get('/emplacements/filters/values')
};

// Statistiques API
export const statistiquesAPI = {
  getSummary: (annee) => api.get('/statistiques/summary', { params: { annee } }),
  getStudentsPerCourse: (maxStudents) => api.get('/statistiques/students-per-course', { params: { maxStudents } }),
  getTeacherWorkload: (annee) => api.get('/statistiques/teacher-workload', { params: { annee } }),
  getAcademicYear: (annee) => api.get('/statistiques/academic-year', { params: { annee } }),
  getFillRate: (maxStudents) => api.get('/statistiques/fill-rate', { params: { maxStudents } })
};

// Presence API
export const presenceAPI = {
  getAll: (params) => api.get('/presences', { params }),
  getStats: (coursId) => api.get(`/presences/stats/${coursId}`),
  getAbsents: (coursId, date) => api.get(`/presences/absents/${coursId}/${date}`),
  create: (data) => api.post('/presences', data),
  bulkCreate: (data) => api.post('/presences/bulk', data),
  delete: (id) => api.delete(`/presences/${id}`)
};

// Examens API
export const examensAPI = {
  getAll: (params) => api.get('/examens', { params }),
  getById: (id) => api.get(`/examens/${id}`),
  create: (data) => api.post('/examens', data),
  update: (id, data) => api.put(`/examens/${id}`, data),
  delete: (id) => api.delete(`/examens/${id}`),
  getUpcoming: () => api.get('/examens/upcoming/list'),
  getCalendar: (params) => api.get('/examens/calendar', { params })
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getByCours: (coursId) => api.get(`/documents/cours/${coursId}`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`)
};

// Exports API
export const exportsAPI = {
  downloadICal: (type) => `${API_URL}/exports/calendar/ical?type=${type}`,
  downloadStudentsCSV: () => `${API_URL}/exports/students/csv`,
  downloadTeachersCSV: () => `${API_URL}/exports/teachers/csv`,
  downloadCoursesCSV: () => `${API_URL}/exports/courses/csv`,
  downloadScheduleCSV: () => `${API_URL}/exports/schedule/csv`,
  downloadExamsCSV: () => `${API_URL}/exports/exams/csv`,
  downloadAttendanceCSV: (coursId) => `${API_URL}/exports/attendance/${coursId}/csv`
};

export default api;

