import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Calendar, 
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SidebarItem, Button } from '../components/common/UI';
import { AIAssistant } from '../components/AIAssistant';
import { GlobalSelectionAI } from '../components/SelectionAI';

interface SidebarProps {
  role: 'student' | 'teacher';
}

const PortalLayout: React.FC<SidebarProps & { children: React.ReactNode }> = ({ role, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${role}` },
    { icon: BookOpen, label: 'Notes', path: `/${role}/notes` },
    { icon: FileText, label: 'Assignments', path: `/${role}/assignments` },
    { icon: MessageSquare, label: 'Doubts', path: `/${role}/doubts` },
    { icon: Calendar, label: 'Events', path: `/${role}/events` },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-400 font-sans relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-72 glass-sidebar m-6 rounded-[2.5rem] p-8 flex flex-col fixed h-[calc(100vh-3rem)] z-20">
        <div className="flex items-center space-x-3 mb-10 px-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <BookOpen className="text-indigo-600 w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EduPortal</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-white/30 p-4 rounded-3xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-white w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/20 rounded-2xl py-2 px-3 text-xs"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-6 flex flex-col gap-6 relative z-10 h-screen overflow-y-auto">
        <header className="h-20 glass-header rounded-[2rem] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize leading-none">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
            <p className="text-sm text-white/70 mt-1 capitalize">{role} Portal Workspace</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="bg-white/40 px-4 py-2 rounded-2xl border border-white/20 text-xs font-bold text-indigo-900 hidden md:block">
               Fall Semester 2024
             </div>
             <div className="w-10 h-10 bg-indigo-600 rounded-full border-2 border-white/50 flex items-center justify-center text-white font-bold text-sm shadow-md">
               {user?.name.charAt(0)}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-visible">
          {children}
        </div>
      </main>
      <AIAssistant />
      <GlobalSelectionAI />
    </div>
  );
};

export default PortalLayout;
