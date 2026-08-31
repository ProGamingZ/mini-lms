import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signOut, verifyBeforeUpdateEmail, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import StudentFolder from '../components/StudentFolder';
import StudentActivity from '../components/StudentActivity';
import Modal from '../components/Modal';

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  const [activitySubTab, setActivitySubTab] = useState<'ongoing' | 'pastDue'>('ongoing'); // New State
  const [folders, setFolders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStudentData(data);
        const section = data.section;

        const qFolders = query(collection(db, 'folders'), where('targetSections', 'array-contains', section));
        onSnapshot(qFolders, (snapshot) => {
          setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qActivities = query(collection(db, 'activities'), where('targetSections', 'array-contains', section));
        onSnapshot(qActivities, (snapshot) => {
          setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      setLoading(false);
    };
    fetchStudentData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
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
    } catch (err: any) {
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
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMessage('❌ For security, please log out and log back in before changing your password.');
      } else {
        setPasswordMessage('❌ Error: ' + err.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- Filtering Logic for Activities ---
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
      <aside className="sidebar">
        <h2>{studentData?.firstName} {studentData?.lastName}</h2>
        
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

        <button onClick={() => setActiveTab('lessons')} className={activeTab === 'lessons' ? 'active' : ''}>Lessons</button>
        <button onClick={() => setActiveTab('activities')} className={activeTab === 'activities' ? 'active' : ''}>Activities</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>
      
      <main className="main-content">
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
            <h3>My Activities</h3>
            
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
          <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          {passwordMessage && <p style={{ fontSize: '14px', marginTop: '10px', color: passwordMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>{passwordMessage}</p>}
          <button type="submit" className="save-btn" disabled={isUpdatingPassword} style={{ background: '#2c3e50' }}>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</button>
        </form>
      </Modal>
    </div>
  );
}