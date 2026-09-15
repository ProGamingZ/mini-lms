import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export function useAdminFolders() {
  const [folders, setFolders] = useState<any[]>([]);

  // 1. Fetch Folders
  useEffect(() => {
    const q = query(collection(db, 'folders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFolders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Folder Actions
  const createFolder = async (title: string, sections: string[]) => {
    await addDoc(collection(db, 'folders'), {
      title,
      targetSections: sections,
      links: [],
      createdAt: new Date()
    });
  };

  const editFolder = async (id: string, newTitle: string, newSections: string[]) => {
    await updateDoc(doc(db, 'folders', id), { title: newTitle, targetSections: newSections });
  };

  const deleteFolder = async (id: string) => {
    await deleteDoc(doc(db, 'folders', id));
  };

  // 3. File Actions
  const addFile = async (folderId: string, label: string, url: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const newLinks = [...(folder.links || []), { id: Date.now().toString(), label, url }];
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
  };

  const editFile = async (folderId: string, fileId: string, newLabel: string, newUrl: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const newLinks = folder.links.map((link: any) =>
      link.id === fileId ? { ...link, label: newLabel, url: newUrl } : link
    );
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
  };

  const deleteFile = async (folderId: string, fileId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const newLinks = folder.links.filter((link: any) => link.id !== fileId);
    await updateDoc(doc(db, 'folders', folderId), { links: newLinks });
  };

  return { folders, createFolder, editFolder, deleteFolder, addFile, editFile, deleteFile };
}