import React, { createContext, useContext, useState } from 'react';

interface AIContextType {
  isOpen: boolean;
  openAssistant: (options?: { context?: string; initialMessage?: string }) => void;
  closeAssistant: () => void;
  aiContext: string | null;
  initialMessage: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openAssistant = (options?: { context?: string; initialMessage?: string }) => {
    if (options?.context) setAiContext(options.context);
    if (options?.initialMessage) setInitialMessage(options.initialMessage);
    setIsOpen(true);
  };

  const closeAssistant = () => {
    setIsOpen(false);
    setAiContext(null);
    setInitialMessage(null);
  };

  return (
    <AIContext.Provider value={{ isOpen, openAssistant, closeAssistant, aiContext, initialMessage }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};
