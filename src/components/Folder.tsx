import { useState } from 'react';
import Modal from './Modal';

interface Link { id: string; label: string; url: string; }
interface FolderProps {
  id: string; title: string; targetSections: string[]; links: Link[];
  allSections: string[];
  onDeleteFolder: (id: string) => void;
  onEditFolder: (id: string, newTitle: string, newSections: string[]) => void;
  onAddFile: (folderId: string, label: string, url: string) => void;
  onEditFile: (folderId: string, fileId: string, newLabel: string, newUrl: string) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
}

export default function Folder({ id, title, targetSections, links, allSections, onDeleteFolder, onEditFolder, onAddFile, onEditFile, onDeleteFile }: FolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const safeLinks = links || []; 

  // Modal States
  const [activeModal, setActiveModal] = useState<'editFolder' | 'addFile' | 'editFile' | 'deleteFolder' | 'deleteFile' | null>(null);
  
  // Form States
  const [editFolderTitle, setEditFolderTitle] = useState(title);
  const [editFolderSections, setEditFolderSections] = useState<string[]>(targetSections || []);
  const [fileLabel, setFileLabel] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');

  const toggleSection = (section: string) => {
    setEditFolderSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const submitEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    onEditFolder(id, editFolderTitle, editFolderSections);
    setActiveModal(null);
  };

  const submitAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFile(id, fileLabel, fileUrl);
    setActiveModal(null);
  };

  const submitEditFile = (e: React.FormEvent) => {
    e.preventDefault();
    onEditFile(id, selectedFileId, fileLabel, fileUrl);
    setActiveModal(null);
  };

  return (
    <div className="folder-wrapper">
      <div className="folder-header">
        <div className="folder-title-row" onClick={() => setIsOpen(!isOpen)}>
          <span className="folder-title">Folder: {title}</span>
          <div className="section-badges">
            {targetSections?.map(sec => <span key={sec} className="badge">{sec}</span>)}
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={() => { setEditFolderTitle(title); setEditFolderSections(targetSections || []); setActiveModal('editFolder'); }}>Edit Folder</button>
          <button onClick={() => setActiveModal('deleteFolder')} className="delete-btn">Delete Folder</button>
        </div>
      </div>

      {isOpen && (
        <ul className="folder-links">
          <button className="add-file-btn" onClick={() => { setFileLabel(''); setFileUrl(''); setActiveModal('addFile'); }}>Add File to Folder</button>
          {safeLinks.map((link) => (
            <li key={link.id} className="file-item">
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
              <div className="action-buttons">
                <button onClick={() => { setSelectedFileId(link.id); setFileLabel(link.label); setFileUrl(link.url); setActiveModal('editFile'); }}>Edit File</button>
                <button onClick={() => { setSelectedFileId(link.id); setActiveModal('deleteFile'); }} className="delete-btn">Delete File</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* --- MODALS --- */}
      <Modal isOpen={activeModal === 'editFolder'} onClose={() => setActiveModal(null)} title="Edit Folder">
        <form onSubmit={submitEditFolder} className="modal-form">
          <input type="text" value={editFolderTitle} onChange={e => setEditFolderTitle(e.target.value)} required />
          <div className="section-checkboxes">
            {allSections.map(sec => (
              <label key={sec}><input type="checkbox" checked={editFolderSections.includes(sec)} onChange={() => toggleSection(sec)} />{sec}</label>
            ))}
          </div>
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'addFile'} onClose={() => setActiveModal(null)} title="Add File">
        <form onSubmit={submitAddFile} className="modal-form">
          <input type="text" placeholder="File Name (e.g., Lesson 1 PPT)" value={fileLabel} onChange={e => setFileLabel(e.target.value)} required />
          <input type="url" placeholder="Google Drive Link" value={fileUrl} onChange={e => setFileUrl(e.target.value)} required />
          <button type="submit" className="save-btn">Add File</button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'editFile'} onClose={() => setActiveModal(null)} title="Edit File">
        <form onSubmit={submitEditFile} className="modal-form">
          <input type="text" placeholder="File Name" value={fileLabel} onChange={e => setFileLabel(e.target.value)} required />
          <input type="url" placeholder="Google Drive Link" value={fileUrl} onChange={e => setFileUrl(e.target.value)} required />
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'deleteFolder'} onClose={() => setActiveModal(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete this folder and all its files?</p>
        <div className="modal-actions"><button onClick={() => setActiveModal(null)}>Cancel</button><button onClick={() => onDeleteFolder(id)} className="delete-btn">Delete</button></div>
      </Modal>

      <Modal isOpen={activeModal === 'deleteFile'} onClose={() => setActiveModal(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete this file?</p>
        <div className="modal-actions"><button onClick={() => setActiveModal(null)}>Cancel</button><button onClick={() => onDeleteFile(id, selectedFileId)} className="delete-btn">Delete</button></div>
      </Modal>
    </div>
  );
}