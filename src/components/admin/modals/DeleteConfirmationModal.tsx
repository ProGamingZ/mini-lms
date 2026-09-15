import Modal from '../../common/Modal';
import styles from '../tabs/Folder.module.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p>{message}</p>
      <div className="modal-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={styles.deleteBtn}>
          Delete
        </button>
      </div>
    </Modal>
  );
}