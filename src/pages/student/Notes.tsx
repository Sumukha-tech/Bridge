import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Search, Sparkles } from 'lucide-react';
import { Card, Button, Input } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Note } from '../../types';
import { formatDate } from '../../lib/utils';
import { useAI } from '../../context/AIContext';

const StudentNotes: React.FC = () => {
  const { openAssistant } = useAI();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await firebaseService.getNotes();
      setNotes(data as Note[]);
      setLoading(false);
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Study Materials</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search by title or subject..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading notes...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <Card key={note.id} className="p-6 h-full flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(note.createdAt)}</span>
              </div>
              <p className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wider">{note.subject}</p>
              <h3 className="text-lg font-bold mb-2 text-slate-800">{note.title}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{note.description}</p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                     {note.teacherName.charAt(0)}
                   </div>
                   <span className="text-xs text-slate-500">Prof. {note.teacherName}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-indigo-600 hover:bg-indigo-50"
                    onClick={() => openAssistant({ 
                      context: `Note Title: ${note.title}. Note Content/Subject: ${note.subject}. Description: ${note.description}`,
                      initialMessage: `Can you explain more about "${note.title}"?`
                    })}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Ask AI
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(note.fileUrl, '_blank')}>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredNotes.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
               No notes found matching your search.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentNotes;
