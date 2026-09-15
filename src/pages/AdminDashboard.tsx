import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AdminLessons from '../components/AdminLessons';
import AdminActivities from '../components/AdminActivities';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Safely initialize state from localStorage or the current active DOM theme
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light'
  );

  // Automatically sync the DOM and localStorage whenever the theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('theme'); // Clear theme token
    document.documentElement.removeAttribute('data-theme'); // Strip DOM attribute instantly
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2>Super Admin</h2>}
          <button
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('lessons')}
            className={activeTab === 'lessons' ? 'active' : ''}
          >
            {isSidebarOpen ? 'Lessons' : 'L'}
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={activeTab === 'activities' ? 'active' : ''}
          >
            {isSidebarOpen ? 'Activities' : 'A'}
          </button>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          {isSidebarOpen ? 'Logout' : 'X'}
        </button>
      </aside>

      <main className="main-content">
        <header className="sticky-header">
          <h2 className="header-title">Mini-LMS Admin</h2>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </header>

        <div className="content-wrapper">
          {activeTab === 'lessons' && <AdminLessons />}
          {activeTab === 'activities' && <AdminActivities />}
        </div>

        <footer className="app-footer">
          <p>© 2026 Mini-LMS. All rights reserved.</p>
          <p>Version 1.0.0 | <a href="mailto:admin@example.com">Contact Support</a></p>
        </footer>
      </main>
    </div>
  );
}