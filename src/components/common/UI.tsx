import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("glass-card p-6 border-white/40", className)}
  >
    {children}
  </motion.div>
);

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 px-5 py-3 rounded-2xl transition-all duration-300",
      isActive 
        ? "bg-white/40 text-indigo-900 font-bold shadow-sm" 
        : "text-white/80 hover:bg-white/10 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-opacity", isActive ? "opacity-100" : "opacity-60")} />
    <span className="text-sm">{label}</span>
  </button>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200',
    secondary: 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-black/10',
    outline: 'border border-white/40 bg-white/20 text-slate-800 hover:bg-white/40 backdrop-blur-sm',
    ghost: 'text-slate-600 hover:bg-black/5',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200',
    glass: 'bg-white/20 border border-white/30 text-white font-bold hover:bg-white/30 backdrop-blur-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={cn(
      "w-full px-5 py-3 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/60 transition-all text-sm",
      className
    )}
    {...props}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea
    className={cn(
      "w-full px-5 py-3 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/60 transition-all min-h-[120px] text-sm",
      className
    )}
    {...props}
  />
);

export const CountdownTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = React.useState<{ days: number; hours: number; mins: number; secs: number } | null>(null);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) return <span className="text-red-500 font-bold uppercase text-[10px]">Overdue</span>;

  return (
    <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
      <div className="flex flex-col items-center">
        <span className="text-sm text-indigo-600 leading-none">{timeLeft.days}</span>
        <span className="opacity-50">d</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm text-indigo-600 leading-none">{timeLeft.hours}</span>
        <span className="opacity-50">h</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm text-indigo-600 leading-none">{timeLeft.mins}</span>
        <span className="opacity-50">m</span>
      </div>
    </div>
  );
};
