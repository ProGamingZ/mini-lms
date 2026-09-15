import { useCountdown } from '../hooks/student/useCountdown';
import { useStudentSubmission } from '../hooks/student/useStudentSubmission';

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
    <div className="activity-card">
      <div className="activity-card-header">
        <div>
          <h4 className="activity-card-title">{title}</h4>
          <div className="activity-meta">
            <span className="due-date-text">Due: {formattedDueDate}</span>
            <span className={`timer-badge ${isLate ? 'late' : ''}`}>
              {timeLeft}
            </span>
          </div>
        </div>
      </div>
      <div className="activity-card-body">
        <p className="activity-instructions">{instructions}</p>
      </div>

      <div className="activity-submission">
        {currentSubmission && (
          <div className="current-submission-info">
            <span>Current Submission: <strong>{currentSubmission.fileName}</strong></span>
          </div>
        )}

        <label className={`upload-btn ${isSubmitting ? 'disabled' : isLate ? 'late' : ''}`}>
          {isSubmitting ? 'Uploading...' : currentSubmission ? 'Replace Submitted File' : isLate ? 'Submit Late' : 'Upload .js or .txt'}
          <input type="file" accept=".js,.txt" style={{ display: 'none' }} onChange={handleUpload} disabled={isSubmitting} />
        </label>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}