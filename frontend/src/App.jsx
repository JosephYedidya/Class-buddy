import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Cours from './pages/Cours';
import Enseignants from './pages/Enseignants';
import Etudiants from './pages/Etudiants';
import Emplacements from './pages/Emplacements';
import Statistiques from './pages/Statistiques';
import Presence from './pages/Presence';
import Examens from './pages/Examens';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
        {/* Navigation */}
        <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xl font-bold">Gestion Cours</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Cours
                </Link>
                <Link to="/enseignants" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Enseignants
                </Link>
                <Link to="/etudiants" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Étudiants
                </Link>
                <Link to="/emplacements" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Emploi du temps
                </Link>
                <Link to="/presences" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Presences
                </Link>
                <Link to="/examens" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Examens
                </Link>
                <Link to="/statistiques" className="hover:bg-blue-700 dark:hover:bg-gray-700 px-4 py-2 rounded transition">
                  Statistiques
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition"
                  title={darkMode ? 'Mode clair' : 'Mode sombre'}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Cours />} />
            <Route path="/enseignants" element={<Enseignants />} />
            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/emplacements" element={<Emplacements />} />
            <Route path="/presences" element={<Presence />} />
            <Route path="/examens" element={<Examens />} />
            <Route path="/statistiques" element={<Statistiques />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

