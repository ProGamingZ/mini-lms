import { useState } from 'react';
import Folder from './Folder';
import styles from './AdminLessons.module.css';
import { useAdminFolders } from '../../../hooks/admin/useAdminFolders';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminLessons() {
  const { folders, createFolder, editFolder, deleteFolder, addFile, editFile, deleteFile } = useAdminFolders();
  
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderSections, setSelectedFolderSections] = useState<string[]>([]);

  const toggleFolderSection = (section: string) => {
    setSelectedFolderSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || selectedFolderSections.length === 0) {
      return alert("Enter a name and select at least one section.");
    }
    
    await createFolder(newFolderName, selectedFolderSections);
    
    setNewFolderName('');
    setSelectedFolderSections([]);
    setIsCreatingFolder(false);
  };

  return (
    <section>
      <h3>Instructional Materials</h3>
      {!isCreatingFolder ? (
        <button className="add-file-btn" onClick={() => setIsCreatingFolder(true)}>
          + Create Folder
        </button>
      ) : (
        <form onSubmit={handleCreateFolder} className={styles.createFolderForm}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Create New Folder</h4>
            <button type="button" onClick={() => setIsCreatingFolder(false)} style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
          <input
            type="text"
            placeholder="Folder Name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
          />
          <div className={styles.sectionCheckboxes}>
            {SECTIONS.map(sec => (
              <label key={sec}>
                <input type="checkbox" checked={selectedFolderSections.includes(sec)} onChange={() => toggleFolderSection(sec)} />
                {sec}
              </label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>Save Folder</button>
        </form>
      )}

      <div className={styles.folderList}>
        {folders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h4>No Folders Yet</h4>
            <p>Create a folder to start organizing instructional materials.</p>
          </div>
        ) : (
          folders.map(folder => (
            <Folder
              key={folder.id}
              {...folder}
              allSections={SECTIONS}
              onDeleteFolder={deleteFolder}
              onEditFolder={editFolder}
              onAddFile={addFile}
              onEditFile={editFile}
              onDeleteFile={deleteFile}
            />
          ))
        )}
      </div>
    </section>
  );
}