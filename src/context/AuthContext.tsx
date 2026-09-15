import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged,type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  role: 'student' | 'admin' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // 1. Explicitly check if this user is a registered Admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (adminDoc.exists()) {
          setRole('admin');
        } else {
          // 2. If not an admin, verify they are a registered student
          const studentDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (studentDoc.exists()) {
            setRole('student');
          } else {
            // 3. Fail-Closed: User exists in Auth, but has no database role
            setRole(null);
          }
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);