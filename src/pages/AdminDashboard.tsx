import { useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AdminLessons from './AdminLessons';
import AdminActivities from './AdminActivities';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
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
        {activeTab === 'lessons' && <AdminLessons />}
        {activeTab === 'activities' && <AdminActivities />}
      </main>
    </div>
  );
}