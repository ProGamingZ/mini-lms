import { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export interface StudentProfile {
  firstName?: string;
  lastName?: string;
  section?: string;
}

export interface FolderData {
  id: string;
  title: string; 
  targetSections: string[];
  links?: { id: string; label: string; url: string }[]; 
}

export interface ActivityData {
  id: string;
  title: string;
  instructions: string; 
  dueDate?: string; 
  targetSections: string[]; 
  isSubmissionDisabled?: boolean;
}

export function useStudentData() {
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStudentData(data);
        const section = data.section;

        const qFolders = query(collection(db, 'folders'), where('targetSections', 'array-contains', section));
        onSnapshot(qFolders, (snapshot) => {
          setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FolderData)));
        });

        const qActivities = query(collection(db, 'activities'), where('targetSections', 'array-contains', section));
        onSnapshot(qActivities, (snapshot) => {
          setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityData)));
        });
      }
      setLoading(false);
    };
    fetchStudentData();
  }, [navigate]);

  return { studentData, folders, activities, loading };
}