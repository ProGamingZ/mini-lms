import { useState } from 'react';
import styles from './Folder.module.css';
import EditFolderModal from '.././modals/EditFolderModal';
import DeleteConfirmationModal from '.././modals/DeleteConfirmationModal';

interface Link { id: string; label: string; url: string; }
interface FolderProps {
  id: string; title: string; targetSections: string[]; links?: Link[];
  allSections: string[];
  onDeleteFolder: (id: string) => void;
  onEditFolder: (id: string, newTitle: string, newSections: string[]) => void;
  onAddFile: (folderId: string, label: string, url: string) => void;
  onEditFile: (folderId: string, fileId: string, newLabel: string, newUrl: string) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
}

export default function Folder({ id, title, targetSections, links, allSections, onDeleteFolder, onEditFolder, onDeleteFile }: FolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const safeLinks = links || []; 
  const [activeModal, setActiveModal] = useState<'editFolder' | 'addFile' | 'editFile' | 'deleteFolder' | 'deleteFile' | null>(null);
  const [selectedFileId, setSelectedFileId] = useState('');

  return (
    <div className={styles.folderWrapper}>
      <div className={styles.folderHeader}>
        <div className={styles.folderTitleRow} onClick={() => setIsOpen(!isOpen)}>
          <span className={styles.folderTitle}>Folder: {title}</span>
          <div className={styles.sectionBadges}>
            {targetSections?.map(sec => <span key={sec} className={styles.badge}>{sec}</span>)}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => setActiveModal('editFolder')}>Edit Folder</button>
          <button onClick={() => setActiveModal('deleteFolder')} className={styles.deleteBtn}>Delete Folder</button>
        </div>
      </div>

      {isOpen && (
        <ul className={styles.folderLinks}>
          <button className="add-file-btn" onClick={() => setActiveModal('addFile')}>Add File to Folder</button>
          {safeLinks.map((link) => (
            <li key={link.id} className={styles.fileItem}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
              <div className={styles.actionButtons}>
                <button onClick={() => { setSelectedFileId(link.id); setActiveModal('editFile'); }}>Edit File</button>
                <button onClick={() => { setSelectedFileId(link.id); setActiveModal('deleteFile'); }} className={styles.deleteBtn}>Delete File</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Conditionally rendered Modals (Fixes the useEffect issue!) */}
      {activeModal === 'editFolder' && (
        <EditFolderModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          folderId={id} 
          initialTitle={title} 
          initialSections={targetSections} 
          allSections={allSections} 
          onEditFolder={onEditFolder} 
        />
      )}

      {activeModal === 'deleteFolder' && (
        <DeleteConfirmationModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          onConfirm={() => onDeleteFolder(id)} 
          title="Confirm Deletion" 
          message="Are you sure you want to delete this folder and all its files?" 
        />
      )}

      {activeModal === 'deleteFile' && (
        <DeleteConfirmationModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          onConfirm={() => onDeleteFile(id, selectedFileId)} 
          title="Confirm Deletion" 
          message="Are you sure you want to delete this file?" 
        />
      )}
    </div>
  );
}