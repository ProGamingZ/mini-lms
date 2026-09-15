import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth }}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeModal} onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}