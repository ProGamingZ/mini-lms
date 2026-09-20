import { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';

export interface SubmissionFile {
  fileName: string;
  code: string;
}

export interface SubmissionData {
  files?: SubmissionFile[];
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
      if (docSnap.exists()) setCurrentSubmission(docSnap.data() as SubmissionData);
    });
    return () => unsub();
  }, [submissionDocId, studentUid]);

  const uploadSubmission = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !studentUid) return;

    const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.txt'];
    let totalSize = 0;
    const filesArray = Array.from(fileList);

    // 1. Validation Phase
    for (const file of filesArray) {
      totalSize += file.size;
      if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        return setMessage(`❌ Invalid file: ${file.name}. React Native/Text files only.`);
      }
    }

    if (totalSize > 800 * 1024) { // 800 KB Limit
      return setMessage("❌ Total file size exceeds 800 KB limit.");
    }

    setIsSubmitting(true);
    setMessage("Reading files...");

    // 2. Read Files Asynchronously
    try {
      const filePromises = filesArray.map(file => {
        return new Promise<SubmissionFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ fileName: file.name, code: e.target?.result as string });
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsText(file);
        });
      });

      const processedFiles = await Promise.all(filePromises);

      // 3. Save to Firestore
      setMessage("Uploading to database...");
      await setDoc(doc(db, 'submissions', submissionDocId), {
        studentId: studentUid,
        studentName: studentName || 'Unknown Student',
        activityId: activityId,
        section: studentSection || 'Unassigned',
        files: processedFiles,
        submittedAt: new Date()
      });
      setMessage(`✅ Submitted ${processedFiles.length} file(s) successfully!`);
    } catch (error) {
      const err = error as Error;
      setMessage("❌ Error submitting files: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { currentSubmission, isSubmitting, message, uploadSubmission };
}