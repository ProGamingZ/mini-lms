import { useState } from 'react';
import styles from './ActivityCard.module.css';
import EditActivityModal from './modals/EditActivityModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

interface ActivityCardProps {
  id: string;
  title: string;
  instructions: string;
  targetSections: string[];
  dueDate?: string;
  allSections: string[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (id: string, newTitle: string, newInstructions: string, newSections: string[], newDueDate: string) => void;
}

export default function ActivityCard({
  id,
  title,
  instructions,
  targetSections,
  dueDate,
  allSections,
  onDeleteActivity,
  onEditActivity
}: ActivityCardProps) {
  const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityCardHeader}>
        <div>
          <h4 className={styles.activityCardTitle}>{title}</h4>
          <div className={styles.sectionBadges}>
            {targetSections?.map(sec => (
              <span key={sec} className={styles.badge}>{sec}</span>
            ))}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => setActiveModal('edit')}>
            Edit Activity
          </button>
          <button onClick={() => setActiveModal('delete')} className={styles.deleteBtn}>
            Delete Activity
          </button>
        </div>
      </div>

      <div className={styles.activityCardBody}>
        <p className={styles.activityInstructions}>{instructions}</p>
      </div>

      {/* Conditionally Rendered Modals (Fixes the useEffect issue!) */}
      {activeModal === 'edit' && (
        <EditActivityModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          activityId={id} 
          initialTitle={title} 
          initialInstructions={instructions} 
          initialSections={targetSections} 
          initialDueDate={dueDate || ''} 
          allSections={allSections} 
          onEditActivity={onEditActivity} 
        />
      )}

      {activeModal === 'delete' && (
        <DeleteConfirmationModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          onConfirm={() => onDeleteActivity(id)} 
          title="Confirm Deletion" 
          message="Are you sure you want to delete this activity?" 
        />
      )}
    </div>
  );
}