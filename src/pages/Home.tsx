import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Briefcase, GraduationCap as StudentIcon, Presentation as TeacherIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/UI';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
       {/* Background Decorative Shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transition-transform hover:rotate-6">
          <GraduationCap className="text-indigo-600 w-12 h-12" />
        </div>
        <h1 className="text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">AcademiaFlow</h1>
        <p className="text-white/80 text-xl max-w-xl mx-auto font-medium">
          Experience the future of education with our beautiful, glass-inspired collaboration workspace.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        {/* Student Portal Card */}
        <motion.div
          whileHover={{ y: -10, scale: 1.02 }}
          className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/30 shadow-2xl flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:bg-white/50"
          onClick={() => login('student')}
        >
          <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mb-8 text-white group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 shadow-inner">
            <StudentIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Student Portal</h2>
          <p className="text-white/70 mb-10 leading-relaxed font-medium">
            Join the community, access materials, and accelerate your learning journey.
          </p>
          <Button size="lg" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none h-14 rounded-2xl shadow-xl shadow-indigo-900/20">
            Student Portal
          </Button>
          <p className="mt-6 text-xs text-white/40 font-bold uppercase tracking-widest leading-none">Authentication Required</p>
        </motion.div>

        {/* Teacher Portal Card */}
        <motion.div
          whileHover={{ y: -10, scale: 1.02 }}
          className="bg-indigo-900/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:bg-indigo-900/40"
          onClick={() => login('teacher')}
        >
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-8 text-white group-hover:bg-indigo-600 transition-all duration-500 shadow-inner">
            <TeacherIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Teacher Portal</h2>
          <p className="text-white/70 mb-10 leading-relaxed font-medium">
            Empower your students with seamless note sharing and assignment management.
          </p>
          <Button size="lg" variant="secondary" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 border-none h-14 rounded-2xl shadow-xl shadow-indigo-900/40">
            Teacher Access
          </Button>
          <p className="mt-6 text-xs text-white/40 font-bold uppercase tracking-widest leading-none">Direct Instant Access</p>
        </motion.div>
      </div>

      <footer className="mt-24 text-white/40 text-xs font-black uppercase tracking-[0.2em] relative z-10">
        &copy; 2026 AcademiaFlow &bull; Advanced Learning Management
      </footer>
    </div>
  );
};

export default Home;
