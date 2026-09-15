import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export function useAdminActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // 1. Fetch Data
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'activities'), orderBy('createdAt', 'desc')), (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      setSubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 2. Activity Actions
  const createActivity = async (title: string, instructions: string, sections: string[], dueDate: string) => {
    await addDoc(collection(db, 'activities'), {
      title,
      instructions,
      targetSections: sections,
      dueDate: dueDate || null,
      createdAt: new Date()
    });
  };

  const editActivity = async (id: string, newTitle: string, newInstructions: string, newSections: string[], newDueDate: string) => {
    await updateDoc(doc(db, 'activities', id), {
      title: newTitle,
      instructions: newInstructions,
      targetSections: newSections,
      dueDate: newDueDate || null
    });
  };

  const deleteActivity = async (id: string) => {
    await deleteDoc(doc(db, 'activities', id));
  };

  return { activities, students, submissions, createActivity, editActivity, deleteActivity };
}