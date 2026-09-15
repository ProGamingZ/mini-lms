import { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';

export interface SubmissionData {
  fileName?: string;
  code?: string;
  submittedAt?: Timestamp; 
}

export function useStudentSubmission(activityId: string, studentSection?: string, studentName?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionData | null>(null);

  const studentUid = auth.currentUser?.uid;
  const submissionDocId = `${activityId}_${studentUid}`;

  useEffect(() => {
    if (!studentUid) return;
    const unsub = onSnapshot(doc(db, 'submissions', submissionDocId), (docSnap) => {
      if (docSnap.exists()) setCurrentSubmission(docSnap.data());
    });
    return () => unsub();
  }, [submissionDocId, studentUid]);

  const uploadSubmission = (file: File | undefined) => {
    if (!file || !studentUid) return;

    const validExtensions = ['.js', '.txt'];
    if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return setMessage("❌ Invalid file type. Please upload .js or .txt files only.");
    }

    setIsSubmitting(true);
    setMessage("Uploading...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await setDoc(doc(db, 'submissions', submissionDocId), {
          studentId: studentUid,
          studentName: studentName || 'Unknown Student',
          activityId: activityId,
          section: studentSection || 'Unassigned',
          fileName: file.name,
          code: event.target?.result, 
          submittedAt: new Date()
        });
        setMessage(`✅ Submitted: ${file.name} (Previous file overwritten)`);
      } catch (error) {
        const err = error as Error;
        setMessage("❌ Error submitting file: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsText(file);
  };

  return { currentSubmission, isSubmitting, message, uploadSubmission };
}