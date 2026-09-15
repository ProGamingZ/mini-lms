import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signOut, verifyBeforeUpdateEmail, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import StudentFolder from '../components/StudentFolder';
import StudentActivity from '../components/StudentActivity';
import Modal from '../components/Modal';
import { useTheme } from '../hooks/common/useTheme';
import { useStudentData } from '../hooks/student/useStudentData';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // 1. Inject the data hook
  const { studentData, folders, activities, loading } = useStudentData();
  
  // 2. Keep the UI states for modals and tabs
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  const [activitySubTab, setActivitySubTab] = useState<'ongoing' | 'pastDue'>('ongoing');
  
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('theme'); // Clear theme token
    document.documentElement.removeAttribute('data-theme'); // Strip DOM attribute instantly
    navigate('/login');
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setEmailMessage('');
    try {
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setEmailMessage('✅ Verification link sent! Check your new inbox and click the link to confirm. Your email will be updated on your next login.');
        setNewEmail('');
      }
    } catch (error) {
      const err = error as Error;
      setEmailMessage('❌ Error: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setPasswordMessage('❌ Passwords do not match.');
    if (newPassword.length < 6) return setPasswordMessage('❌ Password must be at least 6 characters.');

    setIsUpdatingPassword(true);
    setPasswordMessage('');

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordMessage('✅ Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const err = error as Error & { code?: string };
      
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMessage('❌ Please log out and log back in before changing your password.');
      } else {
        setPasswordMessage('❌ Error: ' + err.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isActivityLate = (dueDateString?: string) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    dueDate.setHours(23, 59, 59, 999);
    return new Date().getTime() > dueDate.getTime();
  };

  const ongoingActivities = activities.filter(a => !isActivityLate(a.dueDate));
  const pastDueActivities = activities.filter(a => isActivityLate(a.dueDate));
  const displayedActivities = activitySubTab === 'ongoing' ? ongoingActivities : pastDueActivities;

  if (loading) return <div className="login-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard-container">
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
              <button className="edit-email-btn" onClick={() => { setIsEditEmailModalOpen(true); setEmailMessage(''); }}>Edit</button>
            </div>
            <button className="change-password-btn" onClick={() => { setIsPasswordModalOpen(true); setPasswordMessage(''); setNewPassword(''); setConfirmPassword(''); }}>
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
      
      <main className="main-content">
        <header className="sticky-header">
          <h2 className="header-title">Mini-LMS Platform</h2>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </header>

        <div className="content-wrapper">
          {activeTab === 'lessons' && (
            <section>
              <h3>My Instructional Materials</h3>
              <div className="lessons-container">
                {folders.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">📂</span><h4>No Materials Yet</h4><p>Your instructor has not assigned any folders to your section yet.</p></div>
                ) : (
                  folders.map(folder => <StudentFolder key={folder.id} {...folder} />)
                )}
              </div>
            </section>
          )}

          {activeTab === 'activities' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>My Activities</h3>
                <button className="view-rubric-btn" onClick={() => setIsRubricModalOpen(true)}>
                  📋 View Grading Rubric
                </button>
              </div>
              <div className="review-tabs" style={{ marginBottom: '20px' }}>
                <button className={activitySubTab === 'ongoing' ? 'active' : ''} onClick={() => setActivitySubTab('ongoing')}>
                  Ongoing ({ongoingActivities.length})
                </button>
                <button className={activitySubTab === 'pastDue' ? 'active' : ''} onClick={() => setActivitySubTab('pastDue')}>
                  Past Due ({pastDueActivities.length})
                </button>
              </div>

              <div className="activities-list">
                {displayedActivities.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <h4>No {activitySubTab === 'ongoing' ? 'Ongoing' : 'Past Due'} Activities</h4>
                    <p>You have no assignments in this category.</p>
                  </div>
                ) : (
                  displayedActivities.map(activity => (
                    <StudentActivity 
                      key={activity.id} 
                      {...activity} 
                      studentSection={studentData?.section}
                      studentName={`${studentData?.lastName}, ${studentData?.firstName}`}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        <footer className="app-footer">
          <p>© 2026 Mini-LMS. All rights reserved.</p>
          <p>Version 1.0.0 | <a href="mailto:admin@example.com">Contact Support</a></p>
        </footer>
      </main>

      <Modal isOpen={isEditEmailModalOpen} onClose={() => setIsEditEmailModalOpen(false)} title="Link Real Email">
        <form onSubmit={handleUpdateEmail} className="modal-form">
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Enter your permanent working email. We will send a verification link to this address to secure your account.</p>
          <input type="email" placeholder="Enter your real email (e.g., @gmail.com)" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          {emailMessage && <p style={{ fontSize: '14px', marginTop: '10px', color: emailMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>{emailMessage}</p>}
          <button type="submit" className="save-btn" disabled={isSending}>{isSending ? 'Sending Link...' : 'Send Verification Link'}</button>
        </form>
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handleUpdatePassword} className="modal-form">
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Choose a strong password with at least 6 characters.</p>
          
          <div className="password-wrapper">
            <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <div className="password-wrapper">
            <input type={showPassword ? 'text' : 'password'} placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>

          {passwordMessage && <p style={{ fontSize: '14px', marginTop: '10px', color: passwordMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>{passwordMessage}</p>}
          <button type="submit" className="save-btn" disabled={isUpdatingPassword} style={{ background: '#2c3e50' }}>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</button>
        </form>
      </Modal>

      <Modal isOpen={isRubricModalOpen} onClose={() => setIsRubricModalOpen(false)} title="Lab Activity Rubric" maxWidth="900px">
        <div className="table-responsive">
          <table className="rubric-table">
            <thead>
              <tr>
                <th>Criteria</th>
                <th>Weight</th>
                <th>Excellent (4)</th>
                <th>Good (3)</th>
                <th>Fair (2)</th>
                <th>Poor (1)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Structural Requirements</strong></td>
                <td>30%</td>
                <td>Meets all minimum counts for procedural (e.g., 3 loops, 3 arrays) or OOP elements (e.g., 4 classes, 2 object literals) as examples; code runs flawlessly</td>
                <td>Missing 1-2 minor requirements; runs with minor issues.</td>
                <td>Missing several requirements; code has noticeable bugs.</td>
                <td>Fails to meet most requirements; code does not run.</td>
              </tr>
              <tr>
                <td><strong>Concept Application & Logic</strong></td>
                <td>30%</td>
                <td>Procedural logic and OOP pillars (Encapsulation, Abstraction, Inheritance, Polymorphism) are implemented logically and accurately.</td>
                <td>Concepts are used correctly, but logic is slightly forced or inefficient.</td>
                <td>Misunderstanding of core concepts (e.g., forced inheritance that makes no logical sense).</td>
                <td>Concepts are used incorrectly or are entirely missing.</td>
              </tr>
              <tr>
                <td><strong>Syntax & Best Practices</strong></td>
                <td>15%</td>
                <td>Proper use of modern JS syntax (let/const, arrow functions); follows best practices.</td>
                <td>Minor syntax issues; mostly follows conventions</td>
                <td>Several syntax errors or inconsistent style</td>
                <td>Frequent syntax errors; poor coding conventions</td>
              </tr>
              <tr>
                <td><strong>Code Readability & Organization</strong></td>
                <td>15%</td>
                <td>Well-structured, consistent indentation, highly descriptive naming.</td>
                <td>Generally readable with minor lapses</td>
                <td>Somewhat disorganized; unclear naming</td>
                <td>Poorly organized; hard to follow</td>
              </tr>
              <tr>
                <td><strong>Comments & Documentation</strong></td>
                <td>10%</td>
                <td>Clear, helpful comments explaining the "why" behind their open-ended logic.</td>
                <td>Some comments present but incomplete</td>
                <td>Few or unclear comments</td>
                <td>No comments/documentation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}