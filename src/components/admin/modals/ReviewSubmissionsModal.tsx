import { useState } from 'react';
import Modal from '../../common/Modal';
import { Timestamp } from 'firebase/firestore';
import type { AdminActivityData, AdminSubmissionData, StudentUser } from '../../../hooks/admin/useAdminActivities';
import styles from '../tabs/AdminActivities.module.css';

interface ReviewState {
  activity: AdminActivityData;
  section: string;
  sectionSubmissions: AdminSubmissionData[];
  missingStudents: StudentUser[];
}

interface ReviewSubmissionsModalProps {
  selectedActivity: ReviewState | null;
  onClose: () => void;
}

export default function ReviewSubmissionsModal({ selectedActivity, onClose }: ReviewSubmissionsModalProps) {
  const [reviewTab, setReviewTab] = useState<'submitted' | 'missing'>('submitted');

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const isLate = (submissionDate: Timestamp | null, dueDateString?: string) => {
    if (!dueDateString || !submissionDate) return false;
    const subDate = submissionDate.toDate();
    const dueDate = new Date(dueDateString);
    dueDate.setHours(23, 59, 59, 999);
    return subDate.getTime() > dueDate.getTime();
  };

  if (!selectedActivity) return null;

  return (
    <Modal isOpen={!!selectedActivity} onClose={onClose} title={`${selectedActivity.activity.title} - ${selectedActivity.section}`}>
      <div className={styles.reviewTabs}>
        <button className={reviewTab === 'submitted' ? styles.active : ''} onClick={() => setReviewTab('submitted')}>
          Submitted ({selectedActivity.sectionSubmissions.length})
        </button>
        <button className={reviewTab === 'missing' ? styles.active : ''} onClick={() => setReviewTab('missing')}>
          Missing ({selectedActivity.missingStudents.length})
        </button>
      </div>

      <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '15px' }}>
        {reviewTab === 'submitted' && (
          selectedActivity.sectionSubmissions.length === 0 ? <p>No submissions yet.</p> : (
            <ul className={styles.submissionsReviewList}>
              {selectedActivity.sectionSubmissions.map((sub: AdminSubmissionData) => {
                const late = isLate(sub.submittedAt, selectedActivity.activity.dueDate);
                return (
                  <li key={sub.studentId} className={styles.submissionRow}>
                    <div>
                      <strong>{sub.studentName}</strong>
                      <div style={{ fontSize: '12px', color: '#777' }}>File: {sub.fileName}</div>
                      <div style={{ fontSize: '11px', color: '#95a5a6' }}>{formatTimestamp(sub.submittedAt)}</div>
                    </div>
                    <span className={`${styles.submissionBadge} ${late ? styles.submissionBadgeLate : ''}`}>{late ? 'Late' : 'Submitted'}</span>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {reviewTab === 'missing' && (
          selectedActivity.missingStudents.length === 0 ? <p>Everyone has submitted! 🎉</p> : (
            <ul className={styles.submissionsReviewList}>
              {selectedActivity.missingStudents.map((st: StudentUser) => (
                <li key={st.id} className={styles.submissionRow}>
                  <strong>{st.lastName}, {st.firstName}</strong>
                  <span className={`${styles.submissionBadge} ${styles.submissionBadgeMissing}`}>Missing</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </Modal>
  );
}