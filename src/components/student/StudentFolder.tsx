import { useState } from 'react';
import styles from './StudentFolder.module.css';

interface Link { id: string; label: string; url: string; }
interface StudentFolderProps { title: string; links?: Link[]; }

export default function StudentFolder({ title, links }: StudentFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const safeLinks = links || []; 

  return (
    <div className={styles.folderWrapper}>
      <div className={styles.folderHeader} onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className={styles.folderTitleRow}>
          <svg viewBox="0 0 24 24" fill="#fbc02d" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }}>
            <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
          </svg>
          <span className={styles.folderTitle}>{title}</span>
        </div>
      </div>

      {isOpen && (
        <ul className={styles.folderLinks}>
          {safeLinks.length === 0 && <p style={{ color: '#7f8c8d', fontSize: '14px' }}>No files currently available.</p>}
          {safeLinks.map((link) => (
            <li key={link.id} className={styles.fileItem}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">📄 {link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}