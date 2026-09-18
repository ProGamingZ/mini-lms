import { useState } from 'react';
import StudentActivity from '../StudentActivity';
import styles from './ActivitiesTab.module.css';
// 1. Import the specific types from your hook
import { type ActivityData, type StudentProfile } from '../../../hooks/student/useStudentData';

interface ActivitiesTabProps {
  // 2. Apply the strict types
  activities: ActivityData[]; 
  studentData: StudentProfile | null; 
  onOpenRubric: () => void;
}

export default function ActivitiesTab({ activities, studentData, onOpenRubric }: ActivitiesTabProps) {
  const [activitySubTab, setActivitySubTab] = useState<'ongoing' | 'pastDue'>('ongoing');

  const isActivityLate = (dueDateString?: string) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    dueDate.setHours(23, 59, 59, 999);
    return new Date().getTime() > dueDate.getTime();
  };

  // TypeScript now knows 'a' is an ActivityData object automatically!
  const ongoingActivities = activities.filter(a => !isActivityLate(a.dueDate));
  const pastDueActivities = activities.filter(a => isActivityLate(a.dueDate));
  const displayedActivities = activitySubTab === 'ongoing' ? ongoingActivities : pastDueActivities;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>My Activities</h3>
        <button className="view-rubric-btn" onClick={onOpenRubric}>
          📋 View Grading Rubric
        </button>
      </div>
      
      <div className={styles.reviewTabs}>
        <button className={activitySubTab === 'ongoing' ? styles.active : ''} onClick={() => setActivitySubTab('ongoing')}>
          Ongoing ({ongoingActivities.length})
        </button>
        <button className={activitySubTab === 'pastDue' ? styles.active : ''} onClick={() => setActivitySubTab('pastDue')}>
          Past Due ({pastDueActivities.length})
        </button>
      </div>

      <div className={styles.activitiesList}>
        {displayedActivities.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <h4>No {activitySubTab === 'ongoing' ? 'Ongoing' : 'Past Due'} Activities</h4>
            <p>You have no assignments in this category.</p>
          </div>
        ) : (
          displayedActivities.map(activity => (
            <StudentActivity 
              key={activity.id} 
              {...activity} 
              studentSection={studentData?.section}
              studentName={`${studentData?.lastName}, ${studentData?.firstName}`}
            />
          ))
        )}
      </div>
    </section>
  );
}