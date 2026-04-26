import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAI } from '../context/AIContext';

export const GlobalSelectionAI: React.FC = () => {
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const { openAssistant } = useAI();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 5 && text.length < 500) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 40 // Above selection
          });
          setSelectedText(text);
          return;
        }
      }
      setPosition(null);
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  if (!position) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        style={{ 
          position: 'fixed', 
          left: position.x, 
          top: position.y, 
          transform: 'translateX(-50%)',
          zIndex: 1000 
        }}
      >
        <button
          onClick={() => {
            openAssistant({
              context: `User highlighted this text: "${selectedText}"`,
              initialMessage: `Can you explain this part: "${selectedText}"?`
            });
            setPosition(null);
          }}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold hover:bg-indigo-700 transition-all border border-white/20 backdrop-blur-sm"
        >
          <Sparkles className="w-3 h-3" />
          Ask AI
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
