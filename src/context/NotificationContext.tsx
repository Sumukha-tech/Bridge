import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/UI';
import { cn } from '../lib/utils';

interface NotificationContextType {
  notifications: any[];
  addNotification: (n: any) => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetch = async () => {
        const data = await firebaseService.getNotifications(user.id);
        setNotifications(data || []);
      };
      fetch();
    }
  }, [user]);

  const addNotification = async (n: any) => {
    if (user) {
      await firebaseService.addNotification({ ...n, userId: user.id });
      const data = await firebaseService.getNotifications(user.id);
      setNotifications(data || []);
    }
  };

  const markRead = async (id: string) => {
    await firebaseService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead }}>
      {children}
      <NotificationToast notifications={notifications.filter(n => !n.read).slice(0, 3)} markRead={markRead} />
    </NotificationContext.Provider>
  );
};

const NotificationToast = ({ notifications, markRead }: { notifications: any[], markRead: (id: string) => void }) => {
  return (
    <div className="fixed top-8 right-8 z-[110] space-y-4 w-80">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          >
            <Card className="p-6 bg-white/95 backdrop-blur-md border-none shadow-2xl relative group overflow-hidden rounded-2xl">
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  n.type === 'success' ? "bg-green-100 text-green-600" :
                  n.type === 'error' ? "bg-red-100 text-red-600" :
                  n.type === 'warning' ? "bg-yellow-100 text-yellow-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                   n.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                   n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                   <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">{n.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                </div>
                <button 
                  onClick={() => markRead(n.id)}
                  className="text-slate-300 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-300 group-hover:w-full w-0"></div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
