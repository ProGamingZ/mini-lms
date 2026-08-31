import { useState } from 'react';
import Modal from './Modal';

interface ActivityCardProps {
  id: string;
  title: string;
  instructions: string;
  targetSections: string[];
  allSections: string[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (id: string, newTitle: string, newInstructions: string, newSections: string[]) => void;
}

export default function ActivityCard({
  id,
  title,
  instructions,
  targetSections,
  allSections,
  onDeleteActivity,
  onEditActivity
}: ActivityCardProps) {
  const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);
  const [editTitle, setEditTitle] = useState(title);
  const [editInstructions, setEditInstructions] = useState(instructions);
  const [editSections, setEditSections] = useState<string[]>(targetSections || []);

  const toggleSection = (section: string) => {
    setEditSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || editSections.length === 0) {
      return alert("Title and at least one section are required.");
    }
    onEditActivity(id, editTitle, editInstructions, editSections);
    setActiveModal(null);
  };

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <div>
          <h4 className="activity-card-title">{title}</h4>
          <div className="section-badges">
            {targetSections?.map(sec => (
              <span key={sec} className="badge">{sec}</span>
            ))}
          </div>
        </div>
        <div className="action-buttons">
          <button
            onClick={() => {
              setEditTitle(title);
              setEditInstructions(instructions);
              setEditSections(targetSections || []);
              setActiveModal('edit');
            }}
          >
            Edit Activity
          </button>
          <button
            onClick={() => setActiveModal('delete')}
            className="delete-btn"
          >
            Delete Activity
          </button>
        </div>
      </div>

      <div className="activity-card-body">
        <p className="activity-instructions">{instructions}</p>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={() => setActiveModal(null)}
        title="Edit Activity"
      >
        <form onSubmit={handleEditSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Activity Title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Activity Instructions / Description"
            value={editInstructions}
            onChange={e => setEditInstructions(e.target.value)}
            rows={5}
            required
          />
          <div className="section-checkboxes">
            {allSections.map(sec => (
              <label key={sec}>
                <input
                  type="checkbox"
                  checked={editSections.includes(sec)}
                  onChange={() => toggleSection(sec)}
                />
                {sec}
              </label>
            ))}
          </div>
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this activity?</p>
        <div className="modal-actions">
          <button onClick={() => setActiveModal(null)}>Cancel</button>
          <button onClick={() => onDeleteActivity(id)} className="delete-btn">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}