import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser, role, loading } = useAuth();

  // Redirect if already logged in
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
      // We no longer need manual routing here; the useEffect above handles it once AuthContext updates
    } catch (err: any) {
      setError("Invalid email or password.");
    }
  };

  if (loading) return <div className="login-container"><h2>Loading...</h2></div>;

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>LMS Login</h2>
        {error && <p className="error-text">{error}</p>}
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}