import { useState} from 'react';
import Modal from '../../common/Modal';
import styles from '../tabs/Folder.module.css';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  initialTitle: string;
  initialSections: string[];
  allSections: string[];
  onEditFolder: (id: string, newTitle: string, newSections: string[]) => void;
}

export default function EditFolderModal({ isOpen, onClose, folderId, initialTitle, initialSections, allSections, onEditFolder }: EditFolderModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditFolder(folderId, title, sections);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Folder">
      <form onSubmit={handleSubmit} className="modal-form">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
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