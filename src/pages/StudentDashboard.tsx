import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signOut, verifyBeforeUpdateEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import StudentFolder from '../components/StudentFolder';
import StudentActivity from '../components/StudentActivity';
import Modal from '../components/Modal';

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard States
  const [activeTab, setActiveTab] = useState<'lessons' | 'activities'>('lessons');
  const [folders, setFolders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  // Email Update States
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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

        // Fetch folders targeted at their section
        const qFolders = query(collection(db, 'folders'), where('targetSections', 'array-contains', section));
        onSnapshot(qFolders, (snapshot) => {
          setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch activities targeted at their section
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
        // Sends a secure link to the new email. The Auth email will update once clicked.
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

  if (loading) return <div className="login-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>{studentData?.firstName} {studentData?.lastName}</h2>
        
        {/* Email & Section Display */}
        <div className="student-info-panel">
          <p className="student-section">Section: {studentData?.section}</p>
          <div className="email-row">
            <span className="student-email" title={auth.currentUser?.email || ''}>
              {auth.currentUser?.email}
            </span>
            <button className="edit-email-btn" onClick={() => { setIsEditEmailModalOpen(true); setEmailMessage(''); }}>
              Edit
            </button>
          </div>
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
              {folders.length === 0 ? <p>No folders assigned to your section yet.</p> : null}
              {folders.map(folder => <StudentFolder key={folder.id} {...folder} />)}
            </div>
          </section>
        )}

        {activeTab === 'activities' && (
          <section>
            <h3>My Activities</h3>
            <div className="activities-list">
              {activities.length === 0 ? <p>No activities assigned to your section yet.</p> : null}
              {activities.map(activity => (
                <StudentActivity 
                    key={activity.id} 
                    {...activity} 
                    studentSection={studentData?.section}
                    studentName={`${studentData?.lastName}, ${studentData?.firstName}`}
                />
                ))}
            </div>
          </section>
        )}
      </main>

      {/* Email Edit Modal */}
      <Modal isOpen={isEditEmailModalOpen} onClose={() => setIsEditEmailModalOpen(false)} title="Link Real Email">
        <form onSubmit={handleUpdateEmail} className="modal-form">
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            Enter your permanent working email. We will send a verification link to this address to secure your account.
          </p>
          <input 
            type="email" 
            placeholder="Enter your real email (e.g., @gmail.com)" 
            value={newEmail} 
            onChange={e => setNewEmail(e.target.value)} 
            required 
          />
          {emailMessage && <p style={{ fontSize: '14px', marginTop: '10px', color: emailMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>{emailMessage}</p>}
          <button type="submit" className="save-btn" disabled={isSending}>
            {isSending ? 'Sending Link...' : 'Send Verification Link'}
          </button>
        </form>
      </Modal>
    </div>
  );
}