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
    // 1. Clean the student's name
    const cleanStudentName = (sub.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // 2. Create a dedicated folder for this student inside the ZIP
    const studentFolder = zip.folder(cleanStudentName);
    
    // 3. Handle NEW multi-file format
    if (sub.files && Array.isArray(sub.files)) {
      sub.files.forEach((file: { fileName: string; code: string }) => {
        studentFolder?.file(file.fileName, file.code);
      });
    } 
    // 4. Handle OLD single-file format (Backward Compatibility!)
    else if (sub.fileName && sub.code) {
      studentFolder?.file(sub.fileName, sub.code);
    }
  });

  // Generate and download the file
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${activityName}_${section}_Submissions.zip`);
};