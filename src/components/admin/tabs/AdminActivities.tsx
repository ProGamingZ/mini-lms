import { useState } from 'react';
import { downloadSubmissionsZip } from '../../../utils/zipGenerator';
import styles from './AdminActivities.module.css';
import ActivityCard from './ActivityCard';
import ReviewSubmissionsModal from '.././modals/ReviewSubmissionsModal';
import { 
  useAdminActivities, 
  type AdminActivityData, 
  type StudentUser, 
  type AdminSubmissionData 
} from '../../../hooks/admin/useAdminActivities';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

interface ReviewState {
  activity: AdminActivityData;
  section: string;
  sectionSubmissions: AdminSubmissionData[];
  missingStudents: StudentUser[];
}

export default function AdminActivities() {
  const { activities, students, submissions, createActivity, editActivity, deleteActivity, toggleSubmissionStatus } = useAdminActivities();
  
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityInstructions, setActivityInstructions] = useState('');
  const [activityDueDate, setActivityDueDate] = useState(''); 
  const [selectedActivitySections, setSelectedActivitySections] = useState<string[]>([]);
  
  // Review Modal State
  const [selectedActivityForReview, setSelectedActivityForReview] = useState<ReviewState | null>(null);

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
    await createActivity(activityTitle, activityInstructions, selectedActivitySections, activityDueDate);

    setActivityTitle('');
    setActivityInstructions('');
    setActivityDueDate('');
    setSelectedActivitySections([]);
    setIsCreatingActivity(false);
  };

  const downloadSectionSubmissions = async (activityId: string, activityName: string, section: string) => {
    const sectionSubmissions = submissions.filter(s => s.activityId === activityId && s.section === section);
    await downloadSubmissionsZip(sectionSubmissions, activityName, section);
  };

  return (
    <section>
      <h3>Activities & Assignments</h3>

      {!isCreatingActivity ? (
        <button className="add-file-btn" onClick={() => setIsCreatingActivity(true)}>
          + Create Activity
        </button>
      ) : (
        <form onSubmit={handleCreateActivity} className={styles.createActivityForm}>
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

          <div className={styles.sectionCheckboxes}>
            {SECTIONS.map(sec => (
              <label key={sec}><input type="checkbox" checked={selectedActivitySections.includes(sec)} onChange={() => toggleActivitySection(sec)} />{sec}</label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>Save Activity</button>
        </form>
      )}

      <div className={styles.activitiesList}>
        {activities.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h4>No Activities Found</h4>
            <p>Create an activity to start collecting assignments from your sections.</p>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className={styles.activityAdminWrapper}>
              <ActivityCard 
                {...activity} 
                allSections={SECTIONS} 
                onDeleteActivity={deleteActivity} 
                onEditActivity={editActivity} 
                onToggleSubmission={toggleSubmissionStatus}
              />
              
              <div className={styles.activityStatsPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Submissions Tracker:</h4>
                  {activity.dueDate && <span style={{ fontSize: '13px', color: '#e67e22', fontWeight: 'bold' }}>Due: {new Date(activity.dueDate).toLocaleDateString()}</span>}
                </div>
                
                <div className={styles.sectionStatsGrid}>
                  {activity.targetSections?.map((section: string) => {
                    const sectionStudents = students.filter(st => st.section === section);
                    const enrolledCount = sectionStudents.length;
                    const sectionSubmissions = submissions
                      .filter(sub => sub.activityId === activity.id && sub.section === section)
                      .sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
                      
                    const submittedCount = sectionSubmissions.length;
                    const submittedStudentIds = sectionSubmissions.map(s => s.studentId);
                    const missingStudents = sectionStudents
                      .filter(st => !submittedStudentIds.includes(st.id))
                      .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));

                    return (
                      <div key={section} className={styles.sectionStatCard}>
                        <div className={styles.statHeader}>
                          <strong>{section}</strong>
                          <span className={styles.statCounter}>{submittedCount} / {enrolledCount} Done</span>
                        </div>
                        <div className={styles.statActions}>
                          <button className={styles.reviewBtn} onClick={() => setSelectedActivityForReview({ activity, section, sectionSubmissions, missingStudents })}>
                            View List
                          </button>
                          <button className={styles.downloadBtn} onClick={() => downloadSectionSubmissions(activity.id, activity.title, section)} disabled={submittedCount === 0}>
                            ZIP
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Extracted Review Modal */}
      <ReviewSubmissionsModal 
        selectedActivity={selectedActivityForReview} 
        onClose={() => setSelectedActivityForReview(null)} 
      />
    </section>
  );
}