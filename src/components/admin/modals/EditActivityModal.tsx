import { useState } from 'react';
import Modal from '../../common/Modal';
import styles from '../tabs/ActivityCard.module.css';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  initialTitle: string;
  initialInstructions: string;
  initialSections: string[];
  initialDueDate: string;
  allSections: string[];
  onEditActivity: (id: string, title: string, instructions: string, sections: string[], dueDate: string) => void;
}

export default function EditActivityModal({ isOpen, onClose, activityId, initialTitle, initialInstructions, initialSections, initialDueDate, allSections, onEditActivity }: EditActivityModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [sections, setSections] = useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || sections.length === 0) return alert("Title and at least one section are required.");
    onEditActivity(activityId, title, instructions, sections, dueDate);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Activity">
      <form onSubmit={handleSubmit} className="modal-form">
        <input type="text" placeholder="Activity Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Activity Instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={5} required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Due Date (Optional):</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: 'fit-content' }} />
        </div>
        <div className={styles.sectionCheckboxes}>
          {allSections.map(sec => (
            <label key={sec}>
              <input type="checkbox" checked={sections.includes(sec)} onChange={() => toggleSection(sec)} />
              {sec}
            </label>
          ))}
        </div>
        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </Modal>
  );
}