import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ActivityCard from '../components/ActivityCard';
import Modal from '../components/Modal';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityInstructions, setActivityInstructions] = useState('');
  const [activityDueDate, setActivityDueDate] = useState(''); 
  const [selectedActivitySections, setSelectedActivitySections] = useState<string[]>([]);
  
  const [selectedActivityForReview, setSelectedActivityForReview] = useState<any | null>(null);
  const [reviewTab, setReviewTab] = useState<'submitted' | 'missing'>('submitted');

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      setSubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const toggleActivitySection = (section: string) => {
    setSelectedActivitySections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !activityInstructions.trim() || selectedActivitySections.length === 0) {
      return alert("Title, instructions, and at least one section are required.");
    }

    await addDoc(collection(db, 'activities'), {
      title: activityTitle,
      instructions: activityInstructions,
      targetSections: selectedActivitySections,
      dueDate: activityDueDate || null,
      createdAt: new Date()
    });

    setActivityTitle('');
    setActivityInstructions('');
    setActivityDueDate('');
    setSelectedActivitySections([]);
    setIsCreatingActivity(false);
  };

  // Updated to include Due Date
  const handleEditActivity = async (id: string, newTitle: string, newInstructions: string, newSections: string[], newDueDate: string) => {
    await updateDoc(doc(db, 'activities', id), {
      title: newTitle,
      instructions: newInstructions,
      targetSections: newSections,
      dueDate: newDueDate || null
    });
  };

  const handleDeleteActivity = async (id: string) => {
    await deleteDoc(doc(db, 'activities', id));
  };

  const downloadSectionSubmissions = async (activityId: string, activityName: string, section: string) => {
    const sectionSubmissions = submissions.filter(s => s.activityId === activityId && s.section === section);
    if (sectionSubmissions.length === 0) return alert(`No submissions found for ${section}.`);

    const zip = new JSZip();
    sectionSubmissions.forEach(sub => {
      const cleanStudentName = (sub.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipFileName = `${cleanStudentName}_${sub.fileName}`;
      zip.file(zipFileName, sub.code);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${activityName}_${section}_Submissions.zip`);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const isLate = (submissionDate: any, dueDateString: string) => {
    if (!dueDateString || !submissionDate) return false;
    const subDate = submissionDate.toDate ? submissionDate.toDate() : new Date(submissionDate);
    const dueDate = new Date(dueDateString);
    dueDate.setHours(23, 59, 59, 999);
    return subDate > dueDate;
  };

  return (
    <section>
      <h3>Activities & Assignments</h3>

      {!isCreatingActivity ? (
        <button className="add-file-btn" style={{ marginBottom: '20px' }} onClick={() => setIsCreatingActivity(true)}>
          + Create Activity
        </button>
      ) : (
        <form onSubmit={handleCreateActivity} className="create-folder-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Create New Activity</h4>
            <button type="button" onClick={() => setIsCreatingActivity(false)} style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
          <input type="text" placeholder="Activity Title (e.g., Activity 1 - Variables)" value={activityTitle} onChange={e => setActivityTitle(e.target.value)} />
          <textarea placeholder="Instructions for the students..." value={activityInstructions} onChange={e => setActivityInstructions(e.target.value)} rows={4} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Due Date (Optional):</label>
            <input type="date" value={activityDueDate} onChange={e => setActivityDueDate(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: 'fit-content' }} />
          </div>

          <div className="section-checkboxes">
            {SECTIONS.map(sec => (
              <label key={sec}><input type="checkbox" checked={selectedActivitySections.includes(sec)} onChange={() => toggleActivitySection(sec)} />{sec}</label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>Save Activity</button>
        </form>
      )}

      <div className="activities-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-admin-wrapper">
            <ActivityCard {...activity} allSections={SECTIONS} onDeleteActivity={handleDeleteActivity} onEditActivity={handleEditActivity} />
            
            <div className="activity-stats-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4>Submissions Tracker:</h4>
                {activity.dueDate && <span style={{ fontSize: '13px', color: '#e67e22', fontWeight: 'bold' }}>Due: {new Date(activity.dueDate).toLocaleDateString()}</span>}
              </div>
              
              <div className="section-stats-grid">
                {activity.targetSections?.map((section: string) => {
                  const sectionStudents = students.filter(st => st.section === section);
                  const enrolledCount = sectionStudents.length;
                  
                  // Filter and sort submissions A-Z by studentName
                  const sectionSubmissions = submissions
                    .filter(sub => sub.activityId === activity.id && sub.section === section)
                    .sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
                    
                  const submittedCount = sectionSubmissions.length;
                  const submittedStudentIds = sectionSubmissions.map(s => s.studentId);
                  
                  // Filter and sort missing students A-Z by lastName
                  const missingStudents = sectionStudents
                    .filter(st => !submittedStudentIds.includes(st.id))
                    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));

                  return (
                    <div key={section} className="section-stat-card">
                      <div className="stat-header">
                        <strong>{section}</strong>
                        <span className="stat-counter">{submittedCount} / {enrolledCount} Done</span>
                      </div>
                      <div className="stat-actions">
                        <button className="review-btn" onClick={() => {
                          setSelectedActivityForReview({ activity, section, sectionSubmissions, missingStudents });
                          setReviewTab('submitted');
                        }}>
                          View List
                        </button>
                        <button className="download-btn" onClick={() => downloadSectionSubmissions(activity.id, activity.title, section)} disabled={submittedCount === 0}>
                          📦 ZIP
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submissions Modal */}
      <Modal isOpen={!!selectedActivityForReview} onClose={() => setSelectedActivityForReview(null)} title={`${selectedActivityForReview?.activity.title} - ${selectedActivityForReview?.section}`}>
        {selectedActivityForReview && (
          <>
            <div className="review-tabs">
              <button className={reviewTab === 'submitted' ? 'active' : ''} onClick={() => setReviewTab('submitted')}>
                Submitted ({selectedActivityForReview.sectionSubmissions.length})
              </button>
              <button className={reviewTab === 'missing' ? 'active' : ''} onClick={() => setReviewTab('missing')}>
                Missing ({selectedActivityForReview.missingStudents.length})
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '15px' }}>
              {reviewTab === 'submitted' && (
                selectedActivityForReview.sectionSubmissions.length === 0 ? <p>No submissions yet.</p> : (
                  <ul className="submissions-review-list">
                    {selectedActivityForReview.sectionSubmissions.map((sub: any) => {
                      const late = isLate(sub.submittedAt, selectedActivityForReview.activity.dueDate);
                      return (
                        <li key={sub.studentId} className="submission-row">
                          <div>
                            <strong>{sub.studentName}</strong>
                            <div style={{ fontSize: '12px', color: '#777' }}>File: {sub.fileName}</div>
                            <div style={{ fontSize: '11px', color: '#95a5a6' }}>{formatTimestamp(sub.submittedAt)}</div>
                          </div>
                          <span className={`submission-badge ${late ? 'late' : ''}`}>{late ? 'Late' : 'Submitted'}</span>
                        </li>
                      );
                    })}
                  </ul>
                )
              )}

              {reviewTab === 'missing' && (
                selectedActivityForReview.missingStudents.length === 0 ? <p>Everyone has submitted! 🎉</p> : (
                  <ul className="submissions-review-list">
                    {selectedActivityForReview.missingStudents.map((st: any) => (
                      <li key={st.id} className="submission-row">
                        <strong>{st.lastName}, {st.firstName}</strong>
                        <span className="submission-badge missing">Missing</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}