import React, { useState, useEffect } from 'react';
import { FileText, Plus, Users, Clock, Trash2 } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Assignment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TeacherAssignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      const data = await firebaseService.getAssignments();
      setAssignments(data as Assignment[]);
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;

    await firebaseService.addAssignment({
      title,
      subject,
      description,
      deadline: new Date(deadline).toISOString(),
      teacherId: user?.id,
      teacherName: user?.name,
    });

    setIsAdding(false);
    const data = await firebaseService.getAssignments();
    setAssignments(data as Assignment[]);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Coursework Management</h2>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl h-12 shadow-indigo-600/40">
          <Plus className="w-5 h-5 mr-2" />
          Create New Assignment
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="p-10 border-indigo-500/50 bg-white/90">
              <h3 className="text-2xl font-bold text-indigo-900 mb-8">New Assignment</h3>
              <form onSubmit={handleAddAssignment} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Basic Info</label>
                    <Input name="title" placeholder="Assignment Title" required />
                    <Input name="subject" placeholder="Course / Subject" required />
                    <Input name="deadline" type="datetime-local" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Instructions</label>
                    <TextArea name="description" placeholder="Provide clear instructions and requirements..." required />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <Button type="submit" className="flex-1 h-12 rounded-2xl">Publish Assignment</Button>
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setIsAdding(false)}>Discard</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-white/50 italic">Retrieving assignments...</div>
        ) : (
          assignments.map((item, index) => {
            const overdue = new Date(item.deadline) < new Date();
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-8 flex flex-col md:flex-row md:items-center gap-8 group",
                  overdue ? "border-red-500/20 bg-red-50/5" : ""
                )}>
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner",
                    overdue ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <FileText className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        overdue ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50"
                      )}>
                        {item.subject}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded flex items-center">
                        <Users className="w-3 h-3 mr-1" /> All Students
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className={cn(
                        "flex items-center font-bold",
                        overdue ? "text-red-500" : ""
                      )}>
                        <Clock className="w-3 h-3 mr-1" /> Due {formatDate(item.deadline)}
                      </span>
                      <span>&bull;</span>
                      <span>Created {formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="rounded-xl px-6">Submissions</Button>
                     <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-red-500">
                       <Trash2 className="w-5 h-5" />
                     </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
