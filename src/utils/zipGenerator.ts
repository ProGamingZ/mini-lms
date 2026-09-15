import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AdminSubmissionData } from '../hooks/admin/useAdminActivities';

export const downloadSubmissionsZip = async (
  sectionSubmissions: AdminSubmissionData[], 
  activityName: string, 
  section: string
) => {
  if (sectionSubmissions.length === 0) {
    alert(`No submissions found for ${section}.`);
    return;
  }

  const zip = new JSZip();
  
  sectionSubmissions.forEach(sub => {
    // Sanitize the student name to prevent invalid file characters
    const cleanStudentName = (sub.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const zipFileName = `${cleanStudentName}_${sub.fileName}`;
    
    // Add the file to the ZIP archive
    zip.file(zipFileName, sub.code);
  });

  // Generate and download the file
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${activityName}_${section}_Submissions.zip`);
};