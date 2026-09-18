import { useState } from 'react';
import Modal from '../../common/Modal';

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  fileId: string;
  initialLabel: string;
  initialUrl: string;
  onEditFile: (folderId: string, fileId: string, newLabel: string, newUrl: string) => void;
}

export default function EditFileModal({ isOpen, onClose, folderId, fileId, initialLabel, initialUrl, onEditFile }: EditFileModalProps) {
  const [label, setLabel] = useState(initialLabel);
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return alert("Label and URL are required.");
    onEditFile(folderId, fileId, label, url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit File">
      <form onSubmit={handleSubmit} className="modal-form">
        <input 
          type="text" 
          placeholder="File Label" 
          value={label} 
          onChange={e => setLabel(e.target.value)} 
          required 
        />
        <input 
          type="url" 
          placeholder="File URL" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          required 
        />
        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </Modal>
  );
}