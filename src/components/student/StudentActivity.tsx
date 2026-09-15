import { useCountdown } from '../../hooks/student/useCountdown';
import { useStudentSubmission } from '../../hooks/student/useStudentSubmission';
import styles from './StudentActivity.module.css';

interface StudentActivityProps {
  id: string;
  title: string;
  instructions: string;
  dueDate?: string;
  studentSection?: string;
  studentName?: string;
}

export default function StudentActivity({ id, title, instructions, dueDate, studentSection, studentName }: StudentActivityProps) {
  
  // 1. Inject custom hooks
  const { timeLeft, isLate } = useCountdown(dueDate);
  const { currentSubmission, isSubmitting, message, uploadSubmission } = useStudentSubmission(id, studentSection, studentName);

  // 2. Simplified handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadSubmission(e.target.files?.[0]);
  };

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'None';

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityCardHeader}>
        <div>
          <h4 className={styles.activityCardTitle}>{title}</h4>
          <div className={styles.activityMeta}>
            <span className={styles.dueDateText}>Due: {formattedDueDate}</span>
            <span className={`${styles.timerBadge} ${isLate ? styles.timerBadgeLate : ''}`}>
              ⏱ {timeLeft}
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <p className={styles.activityInstructions}>{instructions}</p>
      </div>

      <div className={styles.activitySubmission}>
        {currentSubmission && (
          <div className={styles.currentSubmissionInfo}>
            <span>Current Submission: <strong>{currentSubmission.fileName}</strong></span>
          </div>
        )}

        <label className={`${styles.uploadBtn} ${isSubmitting ? styles.uploadBtnDisabled : isLate ? styles.uploadBtnLate : ''}`}>
          {isSubmitting ? 'Uploading...' : currentSubmission ? '🔄 Replace Submitted File' : isLate ? '⬆️ Submit Late' : '⬆️ Upload .js or .txt'}
          <input type="file" accept=".js,.txt" style={{ display: 'none' }} onChange={handleUpload} disabled={isSubmitting} />
        </label>
        {message && <p className={styles.submissionMessage}>{message}</p>}
      </div>
    </div>
  );
}