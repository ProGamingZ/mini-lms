import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import ActivityCard from '../components/ActivityCard';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityInstructions, setActivityInstructions] = useState('');
  const [selectedActivitySections, setSelectedActivitySections] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const toggleActivitySection = (section: string) => {
    setSelectedActivitySections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !activityInstructions.trim() || selectedActivitySections.length === 0) {
      return alert("Title, instructions, and at least one section are required.");
    }

    await addDoc(collection(db, 'activities'), {
      title: activityTitle,
      instructions: activityInstructions,
      targetSections: selectedActivitySections,
      createdAt: new Date()
    });

    setActivityTitle('');
    setActivityInstructions('');
    setSelectedActivitySections([]);
    setIsCreatingActivity(false);
  };

  const handleEditActivity = async (
    id: string,
    newTitle: string,
    newInstructions: string,
    newSections: string[]
  ) => {
    await updateDoc(doc(db, 'activities', id), {
      title: newTitle,
      instructions: newInstructions,
      targetSections: newSections
    });
  };

  const handleDeleteActivity = async (id: string) => {
    await deleteDoc(doc(db, 'activities', id));
  };

  return (
    <section>
      <h3>Activities & Assignments</h3>
      {!isCreatingActivity ? (
        <button
          className="add-file-btn"
          style={{ marginBottom: '20px' }}
          onClick={() => setIsCreatingActivity(true)}
        >
          + Create Activity
        </button>
      ) : (
        <form onSubmit={handleCreateActivity} className="create-folder-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Create New Activity</h4>
            <button
              type="button"
              onClick={() => setIsCreatingActivity(false)}
              style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Activity Title (e.g., Activity 1 - Variables)"
            value={activityTitle}
            onChange={e => setActivityTitle(e.target.value)}
          />
          <textarea
            placeholder="Instructions for the students..."
            value={activityInstructions}
            onChange={e => setActivityInstructions(e.target.value)}
            rows={4}
          />
          <div className="section-checkboxes">
            {SECTIONS.map(sec => (
              <label key={sec}>
                <input
                  type="checkbox"
                  checked={selectedActivitySections.includes(sec)}
                  onChange={() => toggleActivitySection(sec)}
                />
                {sec}
              </label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>
            Save Activity
          </button>
        </form>
      )}

      <div className="activities-list">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            {...activity}
            allSections={SECTIONS}
            onDeleteActivity={handleDeleteActivity}
            onEditActivity={handleEditActivity}
          />
        ))}
      </div>
    </section>
  );
}