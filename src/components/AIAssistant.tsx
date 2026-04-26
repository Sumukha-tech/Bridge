import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, MessageSquare, Bot, Book, FileText, Lightbulb } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { firebaseService } from '../services/firebaseService';
import { Button, Card, Input } from './common/UI';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

import { useAI } from '../context/AIContext';

export const AIAssistant: React.FC = () => {
  const { isOpen, openAssistant, closeAssistant, aiContext, initialMessage } = useAI();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load History & Handle External Trigger
  useEffect(() => {
    if (user && isOpen) {
      const loadHistoryAndInitial = async () => {
        // Only load history if we haven't already or if it's currently empty
        if (messages.length === 0) {
          const history = await firebaseService.getChatHistory(user.id);
          if (history && history.length > 0) {
            setMessages(history.map((h: any) => ({ role: h.role, content: h.content })));
          } else if (!initialMessage) {
            setMessages([{ role: 'assistant', content: `Hello ${user.name}! I'm your Campus AI. How can I help you with your ${user.role === 'teacher' ? 'classes' : 'studies'} today?` }]);
          }
        }

        // If openAssistant was called with an initial message, handle it
        if (initialMessage) {
          handleSend(initialMessage);
        }
      };
      loadHistoryAndInitial();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customMsg?: string) => {
    const msgToSend = customMsg || input;
    if (!msgToSend.trim() || isTyping || !user) return;

    if (!customMsg) setInput('');
    
    // Optimistic Update
    const newMessages = [...messages, { role: 'user' as const, content: msgToSend }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Save User Message
      await firebaseService.addChatMessage(user.id, 'user', msgToSend);

      // Context construction
      const baseContext = `User: ${user.name}, Role: ${user.role}. System: Educational Management.`;
      const combinedContext = aiContext ? `${baseContext} | Context from Notes/Material: ${aiContext}` : baseContext;
      
      const response = await geminiService.askAssistant(msgToSend, combinedContext, messages);
      
      // Save Assistant Message
      await firebaseService.addChatMessage(user.id, 'assistant', response);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = user?.role === 'teacher' 
    ? [
        { label: 'Generate Questions', icon: FileText, text: 'Generate 5 questions on JavaScript basics' },
        { label: 'Create Notes', icon: Book, text: 'Create short notes for arrays' },
        { label: 'Grading Rubric', icon: Lightbulb, text: 'Give grading rubric for this assignment' }
      ]
    : [
        { label: 'Explain Topic', icon: Lightbulb, text: 'Explain the concept of Quantum Mechanics simply.' },
        { label: 'Summarize', icon: FileText, text: 'Can you help me summarize my latest notes?' }
      ];

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            className="mb-6"
          >
            <Card className="w-[400px] h-[600px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-indigo-50 flex flex-col bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
              {/* Header */}
              <div className="p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-80">Intelligence</h3>
                    <p className="text-lg font-black leading-none">Campus AI</p>
                  </div>
                </div>
                <button 
                  onClick={closeAssistant}
                  className="w-10 h-10 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth custom-scrollbar"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                    <Bot className="w-12 h-12 text-indigo-400" />
                    <p className="text-sm font-bold text-slate-400">Restoring your conversation...</p>
                  </div>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-4 duration-500",
                    m.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                      m.role === 'user' 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-5 rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce delay-150"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {!isTyping && messages.length > 0 && messages.length < 5 && (
                <div className="px-8 pb-4 flex flex-col gap-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Suggestions</p>
                   <div className="flex flex-wrap gap-2">
                     {suggestions.map((s, i) => (
                       <button
                         key={i}
                         onClick={() => handleSend(s.text)}
                         className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100 transition-all"
                       >
                         <s.icon className="w-3.5 h-3.5" />
                         {s.label}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-50">
                <div className="flex gap-3 relative">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="pr-14 rounded-2xl h-14 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 font-medium"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => isOpen ? closeAssistant() : openAssistant()}
        className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(99,102,241,0.3)] transition-all duration-500",
          isOpen ? "bg-slate-950" : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="w-10 h-10" />
            </motion.div>
          ) : (
            <motion.div key="spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Sparkles className="w-10 h-10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

