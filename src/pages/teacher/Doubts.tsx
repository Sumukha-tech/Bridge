import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, Clock, Send, Sparkles, Loader2 } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Doubt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { geminiService } from '../../services/geminiService';

const TeacherDoubts: React.FC = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDoubts = async () => {
      const data = await firebaseService.getDoubts({ teacherId: user?.id });
      setDoubts(data as Doubt[]);
      setLoading(false);
    };
    if (user) fetchDoubts();
  }, [user]);

  const handleAnswer = async (id: string) => {
    const answer = answers[id];
    if (!answer) return;

    await firebaseService.answerDoubt(id, answer);
    const data = await firebaseService.getDoubts({ teacherId: user?.id });
    setDoubts(data as Doubt[]);
    setAnswers(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Sidebar: Question List */}
      <div className="lg:col-span-12 xl:col-span-12 space-y-6">
        <div className="flex items-center justify-between mb-2">
           <h2 className="text-2xl font-bold text-white">Student Doubts</h2>
           <div className="flex gap-2">
             <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold border border-white/30">
               {doubts.filter(d => d.status === 'pending').length} Pending
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-white/50">Loading conversations...</div>
          ) : (
            doubts.map((doubt, index) => (
              <motion.div
                key={doubt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-8 h-full transition-all duration-500 overflow-hidden bg-white/10 backdrop-blur-md border-white/20",
                  doubt.status === 'pending' ? "ring-2 ring-yellow-400/30" : "opacity-90"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black shadow-lg">
                        {doubt.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{doubt.studentName}</h4>
                        <div className="flex items-center text-[10px] font-black uppercase text-white/50 tracking-widest gap-2">
                           <span>{doubt.subject}</span>
                           <span>•</span>
                           <span>{formatDate(doubt.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Student Bubble */}
                    <div className="flex justify-start">
                      <div className="bg-white/95 rounded-[2rem] rounded-tl-none p-5 shadow-sm relative max-w-[90%]">
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">{doubt.question}</p>
                        <div className="absolute top-0 -left-2 w-4 h-4 bg-white/95 rounded-br-[100%]"></div>
                      </div>
                    </div>

                    {/* Teacher Bubble / Input */}
                    {doubt.status === 'pending' ? (
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <label className="text-[10px] font-black uppercase text-white/50 tracking-widest">My Response</label>
                          <button
                            type="button"
                            disabled={!!isGenerating}
                            onClick={async () => {
                              setIsGenerating(doubt.id);
                              try {
                                const context = `Teacher is responding to a student named ${doubt.studentName} about ${doubt.subject}. Question: ${doubt.question}`;
                                const draft = await geminiService.askAssistant(`Draft a helpful and encouraging response to this question: "${doubt.question}"`, context);
                                setAnswers(prev => ({ ...prev, [doubt.id]: draft }));
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsGenerating(null);
                              }
                            }}
                            className="text-[10px] font-black uppercase text-white hover:text-indigo-200 flex items-center gap-1.5 transition-all disabled:opacity-30"
                          >
                            {isGenerating === doubt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            AI Draft
                          </button>
                        </div>
                        <div className="relative">
                          <TextArea 
                            placeholder={isGenerating === doubt.id ? "Campus AI is drafting response..." : "Type your resolution here..."} 
                            className="bg-white/80 border-transparent focus:bg-white min-h-[120px] text-sm rounded-3xl p-6"
                            value={answers[doubt.id] || ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                          />
                          <Button 
                            className="absolute bottom-4 right-4 h-10 w-10 rounded-full p-0 flex items-center justify-center shadow-indigo-600/40"
                            onClick={() => handleAnswer(doubt.id)}
                            disabled={isGenerating === doubt.id || !answers[doubt.id]}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-indigo-600 text-white rounded-[2rem] rounded-tr-none p-5 shadow-lg relative max-w-[90%]">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">My Response</span>
                            <CheckCircle2 className="w-3 h-3 text-green-300" />
                          </div>
                          <p className="text-sm leading-relaxed">{doubt.answer}</p>
                          <div className="absolute top-0 -right-2 w-4 h-4 bg-indigo-600 rounded-bl-[100%]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
          {doubts.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center bg-white/20 rounded-[3rem] border-2 border-dashed border-white/30 backdrop-blur-md">
               <MessageSquare className="w-16 h-16 mx-auto mb-4 text-white opacity-20" />
               <p className="text-xl font-bold text-white opacity-60">Clean Slate!</p>
               <p className="text-sm text-white/40">No student doubts are waiting for your response.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDoubts;
