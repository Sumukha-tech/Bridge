import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AIProvider } from './context/AIContext';
import Home from './pages/Home';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import PortalLayout from './layouts/PortalLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role: 'student' | 'teacher' }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} />;

  return <PortalLayout role={role}>{children}</PortalLayout>;
};

import StudentNotes from './pages/student/Notes';
import StudentDoubts from './pages/student/Doubts';
import StudentAssignments from './pages/student/Assignments';
import StudentEvents from './pages/student/Events';

const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="py-20 text-center text-slate-400">
    <h2 className="text-xl font-bold mb-2">{name}</h2>
    <p>This module is coming soon or in development.</p>
  </div>
);

import TeacherNotes from './pages/teacher/Notes';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherDoubts from './pages/teacher/Doubts';
import TeacherEvents from './pages/teacher/Events';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute role="student"><StudentNotes /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
      <Route path="/student/doubts" element={<ProtectedRoute role="student"><StudentDoubts /></ProtectedRoute>} />
      <Route path="/student/events" element={<ProtectedRoute role="student"><StudentEvents /></ProtectedRoute>} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/notes" element={<ProtectedRoute role="teacher"><TeacherNotes /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>} />
      <Route path="/teacher/doubts" element={<ProtectedRoute role="teacher"><TeacherDoubts /></ProtectedRoute>} />
      <Route path="/teacher/events" element={<ProtectedRoute role="teacher"><TeacherEvents /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AIProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AIProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
