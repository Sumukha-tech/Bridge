import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, FileText, Search, Sparkles, Loader2 } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { geminiService } from '../../services/geminiService';
import { Note } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TeacherNotes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formValues, setFormValues] = useState({ title: '', subject: '', description: '' });

  const handleGenerateAI = async () => {
    if (!formValues.title || !formValues.subject) return;
    setIsGenerating(true);
    try {
      const topic = `${formValues.subject}: ${formValues.title}`;
      const content = await geminiService.generateContent('notes', topic);
      setFormValues(prev => ({ ...prev, description: content }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await firebaseService.getNotes();
      setNotes(data as Note[]);
      setLoading(false);
    };
    fetchNotes();
  }, []);

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;

    await firebaseService.addNote({
      title,
      subject,
      description,
      teacherId: user?.id,
      teacherName: user?.name,
      fileUrl: 'https://placeholder.com/file.pdf'
    });

    setIsAdding(false);
    setFormValues({ title: '', subject: '', description: '' });
    const data = await firebaseService.getNotes();
    setNotes(data as Note[]);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
          <Input 
            placeholder="Search materials..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl h-12 px-8">
          <Plus className="w-5 h-5 mr-2" />
          Upload New Material
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-8 border-indigo-400/50 bg-indigo-900/20">
              <h3 className="text-xl font-bold text-white mb-6">Upload Study Material</h3>
              <form onSubmit={handleAddNote} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input 
                    name="title" 
                    placeholder="Material Title (e.g. Newton's Laws)" 
                    required 
                    value={formValues.title}
                    onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input 
                    name="subject" 
                    placeholder="Subject" 
                    required 
                    value={formValues.subject}
                    onChange={(e) => setFormValues(prev => ({ ...prev, subject: e.target.value }))}
                  />
                  <div className="p-8 border-2 border-dashed border-white/20 rounded-2xl text-center bg-white/5">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-white/40" />
                    <p className="text-xs text-white/60">Drag and drop PDF or document here</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black uppercase text-white/50 pl-1">Description</label>
                    <button
                      type="button"
                      disabled={isGenerating || !formValues.title || !formValues.subject}
                      onClick={handleGenerateAI}
                      className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 disabled:opacity-30 transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Magic AI Draft
                    </button>
                  </div>
                  <TextArea 
                    name="description" 
                    placeholder={isGenerating ? "Campus AI is thinking..." : "Brief description of the contents..."} 
                    required 
                    className="h-48"
                    value={formValues.description}
                    onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">Publish Material</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-32 flex items-center justify-center text-white/50 italic">Loading materials...</div>
        ) : filteredNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-8 group hover:bg-white/70 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">{note.subject}</p>
              <h4 className="text-xl font-bold text-slate-800 mb-2 truncate">{note.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-3 mb-8">{note.description}</p>
              
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{formatDate(note.createdAt)}</span>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Shared with all</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeacherNotes;
