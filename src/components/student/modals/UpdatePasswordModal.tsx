import { useState } from 'react';
import { auth } from '../../../config/firebase';
import { updatePassword } from 'firebase/auth';
import Modal from '../../common/Modal';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setPasswordMessage('❌ Passwords do not match.');
    if (newPassword.length < 6) return setPasswordMessage('❌ Password must be at least 6 characters.');

    setIsUpdatingPassword(true);
    setPasswordMessage('');

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordMessage('✅ Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMessage('❌ Please log out and log back in before changing your password.');
      } else {
        setPasswordMessage('❌ Error: ' + err.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleUpdatePassword} className="modal-form">
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Choose a strong password with at least 6 characters.</p>
        <div className="password-wrapper">
          <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="password-wrapper">
          <input type={showPassword ? 'text' : 'password'} placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        {passwordMessage && <p style={{ fontSize: '14px', marginTop: '10px', color: passwordMessage.includes('❌') ? '#e74c3c' : '#27ae60' }}>{passwordMessage}</p>}
        <button type="submit" className="save-btn" disabled={isUpdatingPassword} style={{ background: '#2c3e50' }}>
          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </Modal>
  );
}