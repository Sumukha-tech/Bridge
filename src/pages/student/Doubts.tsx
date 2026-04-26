import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Doubt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'motion/react';

const StudentDoubts: React.FC = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoubts = async () => {
      if (user) {
        const data = await firebaseService.getDoubts({ studentId: user.id });
        setDoubts(data as Doubt[]);
        setLoading(false);
      }
    };
    fetchDoubts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !subject) return;

    await firebaseService.askDoubt({
      studentId: user?.id,
      studentName: user?.name,
      teacherId: 'teacher-id-placeholder', // In a real app, select a teacher
      question,
      subject
    });

    setQuestion('');
    setSubject('');
    // Refresh doubts
    const data = await firebaseService.getDoubts({ studentId: user?.id });
    setDoubts(data as Doubt[]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-8">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
            Ask a Doubt
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Subject</label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Your Question</label>
              <TextArea 
                placeholder="Describe your doubt in detail..." 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit">
              <Send className="w-4 h-4 mr-2" />
              Post Question
            </Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2 flex flex-col h-[calc(100vh-16rem)]">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center justify-between">
          <span>Recent Conversations</span>
          <div className="flex gap-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
              {doubts.length} Threads
            </span>
          </div>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
          ) : doubts.length === 0 ? (
            <div className="text-center py-20 bg-white/10 rounded-[3rem] border border-white/20 backdrop-blur-md">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-white opacity-20" />
              <p className="text-white opacity-60">No messages yet. Ask your first doubt!</p>
            </div>
          ) : (
            doubts.map((doubt, index) => (
              <motion.div
                key={doubt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-4"
              >
                {/* Student Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-indigo-600 text-white rounded-[2rem] rounded-tr-none p-5 shadow-lg relative group">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{doubt.subject}</span>
                      <span className="text-[10px] opacity-40">{formatDate(doubt.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{doubt.question}</p>
                    <div className="absolute top-0 -right-2 w-4 h-4 bg-indigo-600 rounded-bl-[100%]"></div>
                  </div>
                </div>

                {/* Teacher Message */}
                {doubt.answer ? (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-white/90 backdrop-blur-md border border-white/40 text-slate-800 rounded-[2rem] rounded-tl-none p-5 shadow-xl relative">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Teacher's Response</span>
                        <div className="flex items-center text-[10px] text-green-600 font-bold">
                           <CheckCircle2 className="w-3 h-3 mr-1" /> Answered
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{doubt.answer}</p>
                      <div className="absolute top-0 -left-2 w-4 h-4 bg-white/90 rounded-br-[100%]"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 text-[10px] font-bold text-white/60 flex items-center">
                      <Clock className="w-3 h-3 mr-2 animate-pulse" />
                      Waiting for teacher's response...
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import { CheckCircle2, Clock } from 'lucide-react';
export default StudentDoubts;
