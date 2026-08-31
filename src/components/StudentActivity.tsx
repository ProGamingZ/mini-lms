import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface StudentActivityProps {
  id: string;
  title: string;
  instructions: string;
  studentSection?: string;
  studentName?: string;
}

export default function StudentActivity({ id, title, instructions, studentSection, studentName }: StudentActivityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);

  const studentUid = auth.currentUser?.uid;
  const submissionDocId = `${id}_${studentUid}`;

  // Listen to the student's current submission status in real-time
  useEffect(() => {
    if (!studentUid) return;
    const unsub = onSnapshot(doc(db, 'submissions', submissionDocId), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentSubmission(docSnap.data());
      }
    });
    return () => unsub();
  }, [submissionDocId, studentUid]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !studentUid) return;

    const validExtensions = ['.js', '.txt'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValid) {
      return setMessage("❌ Invalid file type. Please upload .js or .txt files only.");
    }

    setIsSubmitting(true);
    setMessage("Uploading...");

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const rawCode = event.target?.result;
        
        // Overwrites the existing submission document
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

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h4 className="activity-card-title">{title}</h4>
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

        <label className={`upload-btn ${isSubmitting ? 'disabled' : ''}`}>
          {isSubmitting ? 'Uploading...' : currentSubmission ? '🔄 Replace Submitted File' : '⬆️ Upload .js or .txt'}
          <input 
            type="file" 
            accept=".js,.txt" 
            style={{ display: 'none' }} 
            onChange={handleUpload} 
            disabled={isSubmitting} 
          />
        </label>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}