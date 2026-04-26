import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Users
  async getUser(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  },

  async createUser(userId: string, data: any) {
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}`);
    }
  },

  // Notes
  async getNotes() {
    try {
      const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    }
  },

  async addNote(note: any) {
    try {
      await addDoc(collection(db, 'notes'), { ...note, createdAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  },

  // Assignments
  async getAssignments() {
    try {
      const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'assignments');
    }
  },

  async addAssignment(assignment: any) {
    try {
      await addDoc(collection(db, 'assignments'), { ...assignment, createdAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assignments');
    }
  },

  // Doubts
  async getDoubts(filters?: { studentId?: string, teacherId?: string }) {
    try {
      let q = query(collection(db, 'doubts'), orderBy('createdAt', 'desc'));
      if (filters?.studentId) q = query(q, where('studentId', '==', filters.studentId));
      if (filters?.teacherId) q = query(q, where('teacherId', '==', filters.teacherId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'doubts');
    }
  },

  async askDoubt(doubt: any) {
    try {
      await addDoc(collection(db, 'doubts'), { ...doubt, status: 'pending', createdAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'doubts');
    }
  },

  async answerDoubt(doubtId: string, answer: string) {
    try {
      const docRef = doc(db, 'doubts', doubtId);
      await updateDoc(docRef, { answer, status: 'answered' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `doubts/${doubtId}`);
    }
  },

  // Events
  async getEvents() {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'events');
    }
  },

  async addEvent(event: any) {
    try {
      await addDoc(collection(db, 'events'), { ...event, createdAt: serverTimestamp(), attendees: [] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  },

  async registerForEvent(eventId: string, studentId: string) {
    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, { attendees: arrayUnion(studentId) });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${eventId}`);
    }
  },

  // Notifications
  async getNotifications(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  },

  async addNotification(notification: any) {
    try {
      await addDoc(collection(db, 'notifications'), { 
        ...notification, 
        read: false, 
        createdAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  },

  async markNotificationRead(notificationId: string) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  },

  // AI Chat History
  async getChatHistory(userId: string) {
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    }
  },

  async addChatMessage(userId: string, role: 'user' | 'assistant', content: string) {
    try {
      await addDoc(collection(db, 'chats'), {
        userId,
        role,
        content,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chats');
    }
  },

  // Submissions
  async getSubmissions(filters?: { studentId?: string, assignmentId?: string }) {
    try {
      let q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
      if (filters?.studentId) q = query(q, where('studentId', '==', filters.studentId));
      if (filters?.assignmentId) q = query(q, where('assignmentId', '==', filters.assignmentId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  },

  async submitAssignment(submission: any) {
    try {
      await addDoc(collection(db, 'submissions'), {
        ...submission,
        submittedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  }
};
