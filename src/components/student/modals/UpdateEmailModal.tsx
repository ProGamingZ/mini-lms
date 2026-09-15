import { useState } from 'react';
import { auth } from '../../../config/firebase';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import Modal from '../../common/Modal';

interface UpdateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateEmailModal({ isOpen, onClose }: UpdateEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setEmailMessage('');
    try {
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setEmailMessage('✅ Verification link sent! Check your new inbox.');
        setNewEmail('');
      }
    } catch (error) {
      const err = error as Error;
      setEmailMessage('❌ Error: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Real Email">
      <form onSubmit={handleUpdateEmail} className="modal-form">
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          Enter your permanent working email. We will send a verification link to this address to secure your account.
        </p>
        <input 
          type="email" 
          placeholder="Enter your real email (e.g., @gmail.com)" 
          value={newEmail} 
          onChange={e => setNewEmail(e.target.value)} 
          required 
        />
        {emailMessage && (
          <p style={{ fontSize: '14px', marginTop: '10px', color: emailMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>
            {emailMessage}
          </p>
        )}
        <button type="submit" className="save-btn" disabled={isSending}>
          {isSending ? 'Sending Link...' : 'Send Verification Link'}
        </button>
      </form>
    </Modal>
  );
}