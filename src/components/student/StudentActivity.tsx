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
  isSubmissionDisabled?: boolean; 
}

export default function StudentActivity({ 
  id, 
  title, 
  instructions, 
  dueDate, 
  studentSection, 
  studentName,
  isSubmissionDisabled 
}: StudentActivityProps) {
  // 1. Inject custom hooks
  const { timeLeft, isLate } = useCountdown(dueDate);
  const { currentSubmission, isSubmitting, message, uploadSubmission } = useStudentSubmission(id, studentSection, studentName);

  // 2. Simplified handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadSubmission(e.target.files);
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
        {currentSubmission?.files && currentSubmission.files.length > 0 && (
          <div className={styles.currentSubmissionInfo}>
            <span>Current Submission ({currentSubmission.files.length} files): </span>
            <br />
            <strong>{currentSubmission.files.map((f: { fileName: string }) => f.fileName).join(', ')}</strong>
          </div>
        )}

        <label className={`${styles.uploadBtn} ${isSubmissionDisabled ? styles.uploadBtnDisabled : isSubmitting ? styles.uploadBtnDisabled : isLate ? styles.uploadBtnLate : ''}`}>
          {/* Check if disabled FIRST, then check uploading, then check late */}
          {isSubmissionDisabled 
            ? '🔒 Submissions Closed' 
            : isSubmitting 
              ? 'Uploading...' 
              : currentSubmission?.files 
                ? '🔄 Replace Submitted Files' 
                : isLate 
                  ? '⬆️ Submit Late' 
                  : '⬆️ Upload Code Files'
          }
          
          <input 
            type="file" 
            multiple 
            accept=".js,.jsx,.ts,.tsx,.css,.txt" 
            style={{ display: 'none' }} 
            onChange={handleUpload} 
            disabled={isSubmitting || isSubmissionDisabled} // Disable the HTML input if locked
          />
        </label>
        {message && <p className={styles.submissionMessage}>{message}</p>}
      </div>
    </div>
  );
}