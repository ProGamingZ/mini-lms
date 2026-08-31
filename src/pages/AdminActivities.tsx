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

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  // UI States
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityInstructions, setActivityInstructions] = useState('');
  const [selectedActivitySections, setSelectedActivitySections] = useState<string[]>([]);
  const [selectedActivityForReview, setSelectedActivityForReview] = useState<any | null>(null);

  // 1. Fetch Activities
  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 2. Fetch All Students (for section enrollment counts)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 3. Fetch All Submissions
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
      createdAt: new Date()
    });

    setActivityTitle('');
    setActivityInstructions('');
    setSelectedActivitySections([]);
    setIsCreatingActivity(false);
  };

  const handleEditActivity = async (id: string, newTitle: string, newInstructions: string, newSections: string[]) => {
    await updateDoc(doc(db, 'activities', id), {
      title: newTitle,
      instructions: newInstructions,
      targetSections: newSections
    });
  };

  const handleDeleteActivity = async (id: string) => {
    await deleteDoc(doc(db, 'activities', id));
  };

  // --- Bulk ZIP Download by Section ---
  const downloadSectionSubmissions = async (activityId: string, activityName: string, section: string) => {
    const sectionSubmissions = submissions.filter(
      s => s.activityId === activityId && s.section === section
    );

    if (sectionSubmissions.length === 0) {
      return alert(`No submissions found for ${section}.`);
    }

    const zip = new JSZip();
    sectionSubmissions.forEach(sub => {
      // Formats file name: LastName_FirstName_originalFileName.js
      const cleanStudentName = (sub.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipFileName = `${cleanStudentName}_${sub.fileName}`;
      zip.file(zipFileName, sub.code);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${activityName}_${section}_Submissions.zip`);
  };

  return (
    <section>
      <h3>Activities & Assignments</h3>

      {!isCreatingActivity ? (
        <button
          className="add-file-btn"
          style={{ marginBottom: '20px' }}
          onClick={() => setIsCreatingActivity(true)}
        >
          + Create Activity
        </button>
      ) : (
        <form onSubmit={handleCreateActivity} className="create-folder-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Create New Activity</h4>
            <button
              type="button"
              onClick={() => setIsCreatingActivity(false)}
              style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Activity Title (e.g., Activity 1 - Variables)"
            value={activityTitle}
            onChange={e => setActivityTitle(e.target.value)}
          />
          <textarea
            placeholder="Instructions for the students..."
            value={activityInstructions}
            onChange={e => setActivityInstructions(e.target.value)}
            rows={4}
          />
          <div className="section-checkboxes">
            {SECTIONS.map(sec => (
              <label key={sec}>
                <input
                  type="checkbox"
                  checked={selectedActivitySections.includes(sec)}
                  onChange={() => toggleActivitySection(sec)}
                />
                {sec}
              </label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>
            Save Activity
          </button>
        </form>
      )}

      <div className="activities-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-admin-wrapper">
            <ActivityCard
              {...activity}
              allSections={SECTIONS}
              onDeleteActivity={handleDeleteActivity}
              onEditActivity={handleEditActivity}
            />

            {/* Submission Stats & Section Control */}
            <div className="activity-stats-panel">
              <h4>Submissions Tracker:</h4>
              <div className="section-stats-grid">
                {activity.targetSections?.map((section: string) => {
                  const enrolledCount = students.filter(st => st.section === section).length;
                  const sectionSubmissions = submissions.filter(
                    sub => sub.activityId === activity.id && sub.section === section
                  );
                  const submittedCount = sectionSubmissions.length;

                  return (
                    <div key={section} className="section-stat-card">
                      <div className="stat-header">
                        <strong>{section}</strong>
                        <span className="stat-counter">
                          {submittedCount} / {enrolledCount} Done
                        </span>
                      </div>

                      <div className="stat-actions">
                        <button
                          className="review-btn"
                          onClick={() => setSelectedActivityForReview({ activity, section, sectionSubmissions })}
                        >
                          View List ({submittedCount})
                        </button>
                        <button
                          className="download-btn"
                          onClick={() => downloadSectionSubmissions(activity.id, activity.title, section)}
                          disabled={submittedCount === 0}
                        >
                          📦 Download ZIP
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
      {selectedActivityForReview && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{selectedActivityForReview.activity.title} - {selectedActivityForReview.section}</h3>
              <button className="close-modal" onClick={() => setSelectedActivityForReview(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {selectedActivityForReview.sectionSubmissions.length === 0 ? (
                <p>No submissions yet for this section.</p>
              ) : (
                <ul className="submissions-review-list">
                  {selectedActivityForReview.sectionSubmissions.map((sub: any) => (
                    <li key={sub.studentId} className="submission-row">
                      <div>
                        <strong>{sub.studentName}</strong>
                        <div style={{ fontSize: '12px', color: '#777' }}>File: {sub.fileName}</div>
                      </div>
                      <span className="submission-badge">Submitted</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}