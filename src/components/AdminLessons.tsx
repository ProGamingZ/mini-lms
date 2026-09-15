import { useState } from 'react';
import Folder from './Folder';
// 1. Import the new hook
import { useAdminFolders } from '../hooks/admin/useAdminFolders';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminLessons() {
  // 2. Destructure exactly what you need from the hook
  const { folders, createFolder, editFolder, deleteFolder, addFile, editFile, deleteFile } = useAdminFolders();
  
  // UI State remains in the component
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
    
    // 3. Call the hook function
    await createFolder(newFolderName, selectedFolderSections);
    
    setNewFolderName('');
    setSelectedFolderSections([]);
    setIsCreatingFolder(false);
  };

  return (
    <section>
      <h3>Instructional Materials</h3>
      {!isCreatingFolder ? (
        <button
          className="add-file-btn"
          style={{ marginBottom: '20px' }}
          onClick={() => setIsCreatingFolder(true)}
        >
          + Create Folder
        </button>
      ) : (
        <form onSubmit={handleCreateFolder} className="create-folder-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Create New Folder</h4>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Folder Name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
          />
          <div className="section-checkboxes">
            {SECTIONS.map(sec => (
              <label key={sec}>
                <input
                  type="checkbox"
                  checked={selectedFolderSections.includes(sec)}
                  onChange={() => toggleFolderSection(sec)}
                />
                {sec}
              </label>
            ))}
          </div>
          <button type="submit" className="save-btn" style={{ width: 'fit-content' }}>
            Save Folder
          </button>
        </form>
      )}

      <div className="lessons-container">
        {folders.map(folder => (
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
        ))}
      </div>
    </section>
  );
}