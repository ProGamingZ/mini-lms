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
import Folder from '../components/Folder';

const SECTIONS = ["BSCS_3A", "BSCS_3B", "BSCS_3C", "BSIT_3A", "BSIT_3C"];

export default function AdminLessons() {
  const [folders, setFolders] = useState<any[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderSections, setSelectedFolderSections] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'folders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFolders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

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
    await addDoc(collection(db, 'folders'), {
      title: newFolderName,
      targetSections: selectedFolderSections,
      links: [],
      createdAt: new Date()
    });
    setNewFolderName('');
    setSelectedFolderSections([]);
    setIsCreatingFolder(false);
  };

  const editFolder = async (id: string, newTitle: string, newSections: string[]) => {
    await updateDoc(doc(db, 'folders', id), { title: newTitle, targetSections: newSections });
  };

  const deleteFolder = async (id: string) => {
    await deleteDoc(doc(db, 'folders', id));
  };

  const addFile = async (folderId: string, label: string, url: string) => {
    const folder = folders.find(f => f.id === folderId);
    const currentLinks = folder?.links || [];
    const newLinks = [...currentLinks, { id: Date.now().toString(), label, url }];
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
  };

  const editFile = async (folderId: string, fileId: string, newLabel: string, newUrl: string) => {
    const folder = folders.find(f => f.id === folderId);
    const newLinks = folder.links.map((link: any) =>
      link.id === fileId ? { ...link, label: newLabel, url: newUrl } : link
    );
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
  };

  const deleteFile = async (folderId: string, fileId: string) => {
    const folder = folders.find(f => f.id === folderId);
    const newLinks = folder.links.filter((link: any) => link.id !== fileId);
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
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