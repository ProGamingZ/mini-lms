import { useState } from 'react';
import Modal from '../../common/Modal';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onAddFile: (folderId: string, label: string, url: string) => void;
}

export default function AddFileModal({ isOpen, onClose, folderId, onAddFile }: AddFileModalProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return alert("Label and URL are required.");
    onAddFile(folderId, label, url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add File to Folder">
      <form onSubmit={handleSubmit} className="modal-form">
        <input 
          type="text" 
          placeholder="File Label (e.g., Week 1 Presentation)" 
          value={label} 
          onChange={e => setLabel(e.target.value)} 
          required 
        />
        <input 
          type="url" 
          placeholder="File URL (e.g., Google Drive Link)" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          required 
        />
        <button type="submit" className="save-btn">Add File</button>
      </form>
    </Modal>
  );
}