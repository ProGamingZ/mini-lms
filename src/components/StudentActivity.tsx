import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface StudentActivityProps {
  id: string;
  title: string;
  instructions: string;
  dueDate?: string;
  studentSection?: string;
  studentName?: string;
}

export default function StudentActivity({ id, title, instructions, dueDate, studentSection, studentName }: StudentActivityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);

  // Timer States
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...');
  const [isLate, setIsLate] = useState<boolean>(false);

  const studentUid = auth.currentUser?.uid;
  const submissionDocId = `${id}_${studentUid}`;

  useEffect(() => {
    if (!studentUid) return;
    const unsub = onSnapshot(doc(db, 'submissions', submissionDocId), (docSnap) => {
      if (docSnap.exists()) setCurrentSubmission(docSnap.data());
    });
    return () => unsub();
  }, [submissionDocId, studentUid]);

  // Live Countdown Timer Logic
  useEffect(() => {
    if (!dueDate) {
      setTimeLeft('No Due Date');
      setIsLate(false);
      return;
    }

    const targetDate = new Date(dueDate);
    targetDate.setHours(23, 59, 59, 999); // Due at 11:59:59 PM on the selected day

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft('Past Due');
        setIsLate(true);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setIsLate(false);
      }
    };

    updateTimer(); // Run immediately to prevent a 1-second delay
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [dueDate]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !studentUid) return;

    const validExtensions = ['.js', '.txt'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValid) return setMessage("❌ Invalid file type. Please upload .js or .txt files only.");

    setIsSubmitting(true);
    setMessage("Uploading...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawCode = event.target?.result;
        await setDoc(doc(db, 'submissions', submissionDocId), {
          studentId: studentUid,
          studentName: studentName || 'Unknown Student',
          activityId: id,
          section: studentSection || 'Unassigned',
          fileName: file.name,
          code: rawCode, 
          submittedAt: new Date()
        });
        setMessage(`✅ Submitted: ${file.name} (Previous file overwritten)`);
      } catch (err: any) {
        setMessage("❌ Error submitting file: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsText(file);
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
              ⏱ {timeLeft}
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
          {isSubmitting ? 'Uploading...' : currentSubmission ? '🔄 Replace Submitted File' : isLate ? '⬆️ Submit Late' : '⬆️ Upload .js or .txt'}
          <input type="file" accept=".js,.txt" style={{ display: 'none' }} onChange={handleUpload} disabled={isSubmitting} />
        </label>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}