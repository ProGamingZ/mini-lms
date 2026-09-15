import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/common/useTheme';
import { useStudentData } from '../hooks/student/useStudentData';

// 1. Import our newly extracted components!
import LessonsTab from '../components/student/tabs/LessonsTab';
import ActivitiesTab from '../components/student/tabs/ActivitiesTab';
import UpdateEmailModal from '../components/student/modals/UpdateEmailModal';
import UpdatePasswordModal from '../components/student/modals/UpdatePasswordModal';
import RubricModal from '../components/student/modals/RubricModal';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { studentData, folders, activities, loading } = useStudentData();
  
  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  
  // Modal Toggles
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('theme'); 
    document.documentElement.removeAttribute('data-theme'); 
    navigate('/login');
  };

  if (loading) return <div className="login-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2>{studentData?.firstName}</h2>}
          <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {isSidebarOpen && (
          <div className="student-info-panel">
            <p className="student-section">Section: {studentData?.section}</p>
            <div className="email-row">
              <span className="student-email" title={auth.currentUser?.email || ''}>
                {auth.currentUser?.email}
              </span>
              <button className="edit-email-btn" onClick={() => setIsEditEmailModalOpen(true)}>Edit</button>
            </div>
            <button className="change-password-btn" onClick={() => setIsPasswordModalOpen(true)}>
              🔑 Change Password
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab('lessons')} className={activeTab === 'lessons' ? 'active' : ''}>
            {isSidebarOpen ? 'Lessons' : 'L'}
          </button>
          <button onClick={() => setActiveTab('activities')} className={activeTab === 'activities' ? 'active' : ''}>
            {isSidebarOpen ? 'Activities' : 'A'}
          </button>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          {isSidebarOpen ? 'Logout' : 'X'}
        </button>
      </aside>
      
      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="sticky-header">
          <h2 className="header-title">Mini-LMS Platform</h2>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </header>

        <div className="content-wrapper">
          {/* TAB ROUTING */}
          {activeTab === 'lessons' && <LessonsTab folders={folders} />}
          {activeTab === 'activities' && (
            <ActivitiesTab 
              activities={activities} 
              studentData={studentData} 
              onOpenRubric={() => setIsRubricModalOpen(true)} 
            />
          )}
        </div>

        <footer className="app-footer">
          <p>© 2026 Mini-LMS. All rights reserved.</p>
          <p>Version 1.0.0 | <a href="mailto:admin@example.com">Contact Support</a></p>
        </footer>
      </main>

      {/* RENDER MODALS */}
      <UpdateEmailModal isOpen={isEditEmailModalOpen} onClose={() => setIsEditEmailModalOpen(false)} />
      <UpdatePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <RubricModal isOpen={isRubricModalOpen} onClose={() => setIsRubricModalOpen(false)} />
    </div>
  );
}