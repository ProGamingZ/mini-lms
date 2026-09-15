import StudentFolder from '../StudentFolder';
import styles from '../../../pages/StudentDashboard.module.css';
// 1. Import the FolderData type from your hook
import { type FolderData } from '../../../hooks/student/useStudentData';

interface LessonsTabProps {
  // 2. Replace 'any[]' with the strict strict array type
  folders: FolderData[]; 
}

export default function LessonsTab({ folders }: LessonsTabProps) {
  return (
    <section>
      <h3>My Instructional Materials</h3>
      <div className={styles.lessonsContainer}>
        {folders.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📂</span>
            <h4>No Materials Yet</h4>
            <p>Your instructor has not assigned any folders to your section yet.</p>
          </div>
        ) : (
          folders.map(folder => <StudentFolder key={folder.id} {...folder} />)
        )}
      </div>
    </section>
  );
}