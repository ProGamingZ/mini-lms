import { useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('lessons');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Super Admin</h2>
        <button 
          onClick={() => setActiveTab('lessons')} 
          className={activeTab === 'lessons' ? 'active' : ''}
        >
          Lessons
        </button>
        <button 
          onClick={() => setActiveTab('activities')} 
          className={activeTab === 'activities' ? 'active' : ''}
        >
          Activities
        </button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>
      
      <main className="main-content">
        {activeTab === 'lessons' && (
          <section>
            <h3>Instructional Materials</h3>
            <p>Your Google Drive folders and files will appear here.</p>
          </section>
        )}
        {activeTab === 'activities' && (
          <section>
            <h3>Activities & Assignments</h3>
            <p>Create new tasks and assign them to specific sections here.</p>
          </section>
        )}
      </main>
    </div>
  );
}