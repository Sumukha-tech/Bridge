import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Calendar, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Card, Button } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Note, Assignment, Event, Doubt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import { formatDate, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { openAssistant } = useAI();
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [n, a, e, d] = await Promise.all([
          firebaseService.getNotes(),
          firebaseService.getAssignments(),
          firebaseService.getEvents(),
          firebaseService.getDoubts({ studentId: user?.id })
        ]);
        setNotes((n || []).slice(0, 3) as Note[]);
        setAssignments((a || []).slice(0, 3) as Assignment[]);
        setEvents((e || []).slice(0, 3) as Event[]);
        setDoubts((d || []).slice(0, 3) as Doubt[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-3 tracking-tight">Focus on your goals, <span className="text-indigo-200">{user?.name?.split(' ')[0]}</span>.</h2>
          <p className="opacity-70 max-w-xl font-medium leading-relaxed">
            You have {assignments.length} assignments awaiting submission and {events.length} campus events scheduled. Your academic journey is well on track!
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Notes & Assignments */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-white">
                <div className="w-10 h-10 rounded-2xl bg-blue-400/20 flex items-center justify-center text-blue-400 mr-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                Academic Resources
              </h3>
              <Link to="/student/notes" className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">Browse Library</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {notes.map((note, idx) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 group hover:bg-white/90 transition-all cursor-pointer h-full border-none shadow-xl shadow-indigo-900/20">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">{note.subject}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 h-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          openAssistant({ 
                            context: `Note Title: ${note.title}. Note Content/Subject: ${note.subject}. Description: ${note.description}`,
                            initialMessage: `Can you explain more about "${note.title}"?`
                          });
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Ask AI
                      </Button>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 truncate">{note.title}</h4>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{note.description}</p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">{note.teacherName.charAt(0)}</div>
                      <span className="text-xs font-bold text-slate-400 truncate">By Prof. {note.teacherName}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {notes.length === 0 && (
                <Card className="col-span-full p-12 text-center text-white/50 italic bg-white/5 border-dashed border-white/20">
                  No materials shared recently.
                </Card>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-white">
                <div className="w-10 h-10 rounded-2xl bg-orange-400/20 flex items-center justify-center text-orange-400 mr-3">
                  <FileText className="w-5 h-5" />
                </div>
                Priority Assignments
              </h3>
              <Link to="/student/assignments" className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">Course Schedule</Link>
            </div>
            <div className="space-y-4">
              {assignments.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                >
                  <Card className="p-6 flex items-center gap-6 group hover:bg-white transition-all bg-white/90 border-none">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-800 leading-none mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-medium">{item.subject}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Deadline</p>
                      <p className="text-sm font-black text-slate-700">{formatDate(item.deadline)}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </Card>
                </motion.div>
              ))}
              {assignments.length === 0 && (
                <Card className="p-12 text-center text-white/40 italic bg-white/5 border-dashed border-white/20">
                  Inbox empty. You're all caught up!
                </Card>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Events & Doubts */}
        <div className="space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-white">
                <div className="w-10 h-10 rounded-2xl bg-purple-400/20 flex items-center justify-center text-purple-400 mr-3">
                  <Calendar className="w-5 h-5" />
                </div>
                Events Hub
              </h3>
            </div>
            <div className="space-y-6">
              {events.map((event, idx) => (
                <Card key={event.id} className="p-8 border-none bg-white relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex flex-col items-center justify-center font-black text-purple-600">
                      <span className="text-[10px] leading-none opacity-60">APR</span>
                      <span className="text-lg leading-none mt-1">28</span>
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{event.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{event.location}</p>
                    </div>
                  </div>
                  <Link to="/student/events">
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-100 h-10 font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                      RSVP Now
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          <section>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center text-white">
                  <div className="w-10 h-10 rounded-2xl bg-green-400/20 flex items-center justify-center text-green-400 mr-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  Inbox Doubts
                </h3>
             </div>
            <div className="space-y-4">
              {doubts.map(doubt => (
                <div key={doubt.id} className="p-5 bg-white/90 backdrop-blur-md rounded-3xl border-none shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{doubt.subject}</span>
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest",
                      doubt.status === 'answered' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700 shadow-sm shadow-yellow-200"
                    )}>
                      {doubt.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">"{doubt.question}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
