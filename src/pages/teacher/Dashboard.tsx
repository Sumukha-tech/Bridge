import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Calendar, MessageSquare, Plus, Clock, BarChart2, TrendingUp, Target } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cn } from '../../lib/utils';
import { Note, Assignment, Doubt } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { geminiService } from '../../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [stats, setStats] = useState({ notes: 0, assignments: 0, events: 0, pendingDoubts: 0 });
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states for quick add
  const [activeForm, setActiveForm] = useState<'note' | 'assignment' | 'event' | null>(null);
  const [formValues, setFormValues] = useState<any>({});

  const mockAnalyticsData = [
    { name: 'Unit 1', submissions: 40, avgScore: 78 },
    { name: 'Unit 2', submissions: 35, avgScore: 82 },
    { name: 'Unit 3', submissions: 42, avgScore: 75 },
    { name: 'Finals', submissions: 45, avgScore: 80 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [n, a, e, d] = (await Promise.all([
          firebaseService.getNotes(),
          firebaseService.getAssignments(),
          firebaseService.getEvents(),
          firebaseService.getDoubts({ teacherId: user?.id })
        ])) as [any[], any[], any[], Doubt[]];
        
        const allDoubts = (d || []).slice(0, 5);
        setDoubts(allDoubts);
        setStats({
          notes: n?.length || 0,
          assignments: a?.length || 0,
          events: e?.length || 0,
          pendingDoubts: d.filter(item => item.status === 'pending').length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-12">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Notes', value: stats.notes, icon: BookOpen, color: 'bg-blue-500', shadow: 'shadow-blue-200/50' },
          { label: 'Active Assignments', value: stats.assignments, icon: FileText, color: 'bg-orange-500', shadow: 'shadow-orange-200/50' },
          { label: 'Live Events', value: stats.events, icon: Calendar, color: 'bg-purple-500', shadow: 'shadow-purple-200/50' },
          { label: 'Pending Doubts', value: stats.pendingDoubts, icon: MessageSquare, color: 'bg-rose-500', shadow: 'shadow-rose-200/50' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-none bg-white relative overflow-hidden group shadow-xl hover:scale-[1.02] transition-all">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg", stat.color, stat.shadow)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-slate-800">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-400/20 flex items-center justify-center text-indigo-300">
                  <Plus className="w-5 h-5" />
                </div>
                Quick Coordination
              </h3>
              <Button 
                variant={showAnalytics ? "primary" : "outline"} 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="rounded-2xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] border-white/20 text-white hover:bg-white/10"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                {showAnalytics ? "Hide Analytics" : "View Insights"}
              </Button>
            </div>
            
            {showAnalytics && (
              <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                <AnalyticsDashboard data={mockAnalyticsData} />
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { type: 'note', icon: BookOpen, title: 'Share Material', color: 'hover:border-blue-400' },
                { type: 'assignment', icon: FileText, title: 'Post Homework', color: 'hover:border-orange-400' },
                { type: 'event', icon: Calendar, title: 'Schedule Event', color: 'hover:border-purple-400' }
              ].map((action) => (
                <Card 
                  key={action.type}
                  className={cn(
                    "p-8 bg-white/10 backdrop-blur-md border-white/20 text-white cursor-pointer hover:bg-white/20 transition-all text-center",
                    action.color,
                    activeForm === action.type ? "ring-2 ring-white/50" : ""
                  )}
                  onClick={() => setActiveForm(action.type as any)}
                >
                  <action.icon className="w-8 h-8 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">{action.title}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-400/20 flex items-center justify-center text-rose-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Pending Inquiries
              </h3>
              <Link to="/teacher/doubts" className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">View All Doubts</Link>
            </div>
            
            <div className="space-y-4">
              {doubts.map(doubt => (
                <Card key={doubt.id} className="p-8 bg-white group hover:bg-white/95 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold">
                        {doubt.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{doubt.studentName}</h4>
                        <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{doubt.subject}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">"{doubt.question}"</p>
                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                    <Link to="/teacher/doubts">
                       <Button size="sm" variant="primary" className="rounded-xl h-10 text-xs px-6">Respond</Button>
                    </Link>
                  </div>
                </Card>
              ))}
              {doubts.length === 0 && (
                <Card className="p-16 text-center bg-white/5 border-dashed border-white/20 rounded-[3rem]">
                  <p className="text-white opacity-40 font-bold uppercase tracking-widest text-xs italic">Inbox Clear • Well Done</p>
                </Card>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          {activeForm ? (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-10 border-none bg-white shadow-2xl sticky top-8">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">
                      New {activeForm}
                    </h3>
                    <button onClick={() => setActiveForm(null)} className="text-slate-300 hover:text-slate-600">
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                  </div>
                  
                  <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const data = Object.fromEntries(formData.entries());
                    
                    if (activeForm === 'note') {
                      await firebaseService.addNote({
                        ...data,
                        teacherId: user?.id,
                        teacherName: user?.name,
                        fileUrl: 'https://placeholder.com/file'
                      });
                    } else if (activeForm === 'assignment') {
                       await firebaseService.addAssignment({
                         ...data,
                         teacherId: user?.id,
                         teacherName: user?.name,
                         deadline: new Date(data.deadline as string).toISOString()
                       });
                    } else if (activeForm === 'event') {
                       await firebaseService.addEvent({
                         ...data,
                         date: new Date(data.date as string).toISOString()
                       });
                    }
                    setActiveForm(null);
                    setFormValues({});
                  }}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Title</label>
                      <Input 
                        name="title" 
                        required 
                        value={formValues.title || ''} 
                        onChange={(e) => setFormValues({...formValues, title: e.target.value})} 
                      />
                    </div>
                    {(activeForm === 'note' || activeForm === 'assignment') && (
                       <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Subject</label>
                        <Input 
                          name="subject" 
                          required 
                          value={formValues.subject || ''}
                          onChange={(e) => setFormValues({...formValues, subject: e.target.value})}
                        />
                      </div>
                    )}
                    <div className="space-y-1 relative">
                      <div className="flex justify-between items-center mb-1 pr-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Details</label>
                        {(activeForm === 'note' || activeForm === 'assignment') && (
                          <button
                            type="button"
                            disabled={isGenerating || !formValues.title || !formValues.subject}
                            onClick={async () => {
                              setIsGenerating(true);
                              try {
                                const type = activeForm === 'note' ? 'notes' : 'questions';
                                const topic = `${formValues.subject}: ${formValues.title}`;
                                const generated = await geminiService.generateContent(type, topic);
                                setFormValues(prev => ({ ...prev, description: generated }));
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsGenerating(false);
                              }
                            }}
                            className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1.5 hover:text-indigo-800 disabled:opacity-30 transition-all"
                          >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Magic AI Draft
                          </button>
                        )}
                      </div>
                      <TextArea 
                        name="description" 
                        required 
                        className="h-48"
                        value={formValues.description || ''}
                        onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                        placeholder={isGenerating ? "Campus AI is thinking..." : "Write details here or use Magic AI to draft..."}
                      />
                    </div>
                    
                    {activeForm === 'assignment' && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center mb-1 pr-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Due Date</label>
                          <button
                            type="button"
                            disabled={isGenerating || !formValues.title || !formValues.description}
                            onClick={async () => {
                               setIsGenerating(true);
                               try {
                                 const topic = `Assignment: ${formValues.title}\nDetails: ${formValues.description}`;
                                 const generated = await geminiService.generateContent('rubric', topic);
                                 // Add rubric to description
                                 setFormValues(prev => ({ ...prev, description: (prev.description || '') + "\n\n### EVALUATION CRITERIA (AI SUGGESTION)\n" + generated }));
                               } catch (err) {
                                 console.error(err);
                               } finally {
                                 setIsGenerating(false);
                               }
                            }}
                            className="text-[10px] font-black uppercase text-purple-600 flex items-center gap-1.5 hover:text-purple-800 disabled:opacity-30 transition-all"
                          >
                             {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                             Add AI Rubric
                          </button>
                        </div>
                        <Input type="datetime-local" name="deadline" required />
                      </div>
                    )}
                    
                    {activeForm === 'event' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Event Date</label>
                          <Input type="datetime-local" name="date" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Location</label>
                          <Input name="location" required />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
                      Publish Now
                    </Button>
                  </form>
                </Card>
             </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 text-center text-white/30">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 <Target className="w-10 h-10" />
               </div>
               <p className="text-sm font-bold max-w-[200px] mx-auto leading-relaxed uppercase tracking-widest">Select an action to empower your students.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
