import React, { useEffect, useState } from 'react';
import { FileText, Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Card, Button, CountdownTimer } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Assignment, Submission } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle } from 'lucide-react';

const StudentAssignments: React.FC = () => {
  const { user } = useAuth();
  const { openAssistant } = useAI();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [assignmentsData, submissionsData] = await Promise.all([
        firebaseService.getAssignments(),
        firebaseService.getSubmissions({ studentId: user.id })
      ]);
      setAssignments(assignmentsData as Assignment[]);
      setSubmissions(submissionsData as Submission[]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const isSubmitted = (assignmentId: string) => {
    return submissions.some(s => s.assignmentId === assignmentId);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const isUrgent = (deadline: string) => {
    const hoursLeft = (+new Date(deadline) - +new Date()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 24;
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Course Assignments</h2>
            {assignments.some(a => isUrgent(a.deadline)) && (
              <span className="flex items-center gap-2 text-xs font-black uppercase text-orange-400 bg-orange-400/10 px-4 py-2 rounded-full border border-orange-400/20 animate-pulse">
                <Zap className="w-3 h-3" /> Urgent tasks pending
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/20 rounded-[2.5rem]" />)}
            </div>
          ) : assignments.length === 0 ? (
            <Card className="p-12 text-center text-white/60 italic">
              No assignments found at the moment.
            </Card>
          ) : (
            assignments.map((item, index) => {
              const overdue = isOverdue(item.deadline);
              const urgent = isUrgent(item.deadline);
              const submitted = isSubmitted(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "flex flex-col md:flex-row md:items-center gap-6 p-8 group transition-all duration-300",
                    submitted ? "border-green-500/30 bg-green-50/5" :
                    overdue ? "border-red-500/30 bg-red-50/5" : 
                    urgent ? "border-orange-500/30 ring-1 ring-orange-500/20" : "hover:bg-white/70"
                  )}>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                      submitted ? "bg-green-100 text-green-600" :
                      overdue ? "bg-red-100 text-red-600" : 
                      urgent ? "bg-orange-100 text-orange-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {submitted ? <CheckCircle className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                           submitted ? "text-green-600 bg-green-50" :
                           overdue ? "text-red-600 bg-red-50" : 
                           urgent ? "text-orange-600 bg-orange-50" : "text-indigo-600 bg-indigo-50"
                         )}>
                           {item.subject}
                         </span>
                         {submitted && (
                           <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center">
                             <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                           </span>
                         )}
                         {!submitted && overdue && (
                           <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center">
                             <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                           </span>
                         )}
                         {!submitted && urgent && (
                           <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded flex items-center animate-pulse">
                             <Clock className="w-3 h-3 mr-1" /> Due Soon
                           </span>
                         )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-right">
                      <div className="flex items-center gap-4">
                        {!overdue && !submitted && (
                          <div className="px-3 py-1 bg-white/50 rounded-lg border border-slate-100">
                            <CountdownTimer deadline={item.deadline} />
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 opacity-40" />
                          <span className="text-sm font-bold">{formatDate(item.deadline)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-xl text-indigo-600 hover:bg-indigo-50"
                          onClick={() => openAssistant({ 
                            context: `Assignment Title: ${item.title}. Subject: ${item.subject}. Description: ${item.description}`,
                            initialMessage: `Can you give me some tips for "${item.title}"?`
                          })}
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant={submitted ? "ghost" : overdue ? "danger" : urgent ? "primary" : "outline"} 
                          size="sm" 
                          className={cn("w-32 rounded-xl", submitted && "text-green-600 cursor-default")}
                          disabled={submitted}
                        >
                          {submitted ? "Done" : "Submit Work"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-8 bg-indigo-900/40 border-indigo-400/30 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submission Tracker
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl">
                <span className="text-sm opacity-70">Total Pending</span>
                <span className="text-2xl font-black">{assignments.length - submissions.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl">
                <span className="text-sm opacity-70">Completed</span>
                <span className="text-2xl font-black">{submissions.length}</span>
              </div>
            </div>
            <p className="mt-6 text-xs opacity-50 italic">
              Please ensure your files are in PDF or Word format before submmitting.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
