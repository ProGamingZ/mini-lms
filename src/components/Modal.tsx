import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string; // New optional prop
}

export default function Modal({ isOpen, onClose, title, children, maxWidth }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Apply the custom width, defaulting to 450px for standard modals */}
      <div className="modal-content" style={{ maxWidth: maxWidth || '450px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}