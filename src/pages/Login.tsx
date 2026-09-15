import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. ADDED sendPasswordResetEmail to the import
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 2. NEW STATES for the password reset flow
  const [message, setMessage] = useState(''); 
  const [isResetting, setIsResetting] = useState(false); 

  const navigate = useNavigate();
  const { currentUser, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && currentUser && role) {
      navigate(`/${role}-dashboard`);
    }
  }, [currentUser, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Assert the error type so TypeScript knows .code might exist
      const err = error as Error & { code?: string };
      
      // 3. BETTER ERROR HANDLING for brute-force lockouts
      if (err.code === 'auth/too-many-requests') {
        setError("Account temporarily locked due to many failed attempts. Please reset your password.");
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  // 4. NEW FUNCTION to handle sending the reset email via Firebase API
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset link sent! Check your inbox.');
    } catch {
      setError('❌ Failed to send reset link. Verify your email is correct.');
    }
  };

  if (loading) return <div className="login-container"><h2>Loading Secure Session...</h2></div>;

  return (
    <div className="login-container">
      {/* 5. DYNAMIC FORM SUBMIT based on the current view */}
      <form className="login-box" onSubmit={isResetting ? handleResetPassword : handleLogin}>
        <h2>{isResetting ? 'Reset Password' : 'LMS Login'}</h2>
        
        {error && <p className="error-text">{error}</p>}
        {message && <p style={{ color: '#27ae60', fontSize: '14px', textAlign: 'center' }}>{message}</p>}

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        
        {/* Hide password field if we are in Reset Mode */}
        {!isResetting && (
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        )}
        
        <button type="submit" style={{ marginTop: '5px' }}>
          {isResetting ? 'Send Reset Link' : 'Sign In'}
        </button>

        {/* 6. TOGGLE BUTTON to switch between Login and Reset Mode */}
        <button 
          type="button" 
          onClick={() => { setIsResetting(!isResetting); setError(''); setMessage(''); }}
          style={{ background: 'transparent', color: '#3498db', padding: '0', fontSize: '13px', marginTop: '5px', boxShadow: 'none' }}
        >
          {isResetting ? 'Back to Login' : 'Forgot Password?'}
        </button>
      </form>
    </div>
  );
}