import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebaseService';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await firebaseService.getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData as User);
        } else {
          // New user logic or anonymous handle
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous User',
            email: firebaseUser.email || '',
            role: 'student' // default
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (role: UserRole) => {
    try {
      if (role === 'teacher') {
        // Direct access for teachers: could be anonymous or a specific demo account
        // Let's use anonymous for "direct access" feel without credentials
        const result = await signInAnonymously(auth);
        const demoTeacher = {
          id: result.user.uid,
          name: 'Demo Teacher',
          email: 'teacher@demo.edu',
          role: 'teacher' as const,
          department: 'Computer Science'
        };
        await firebaseService.createUser(result.user.uid, demoTeacher);
        setUser(demoTeacher);
      } else {
        // Student login with popup
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const studentData = {
          id: result.user.uid,
          name: result.user.displayName || 'Student',
          email: result.user.email || '',
          role: 'student' as const
        };
        await firebaseService.createUser(result.user.uid, studentData);
        setUser(studentData);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
