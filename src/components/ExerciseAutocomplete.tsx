import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FULL_EXERCISE_DATABASE } from '../constants/exercises';
import { cn } from '../lib/utils';

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const ExerciseAutocomplete: React.FC<ExerciseAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "PROCURAR EXERCÍCIO...",
  className,
  readOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 1 && !readOnly) {
      const filtered = FULL_EXERCISE_DATABASE.filter(ex => 
        ex.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions for performance
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  }, [value, readOnly]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      onChange(suggestions[highlightedIndex]);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 1 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "w-full bg-transparent outline-none transition-all",
            !readOnly && "focus:border-blue-500"
          )}
        />
        {!readOnly && value && (
          <button 
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 p-1"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => {
                  onChange(suggestion);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-3 border-b border-white/5 last:border-0",
                  index === highlightedIndex ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800"
                )}
              >
                <Activity size={12} className={index === highlightedIndex ? "text-white" : "text-blue-500"} />
                {suggestion}
                {suggestion === value && <Check size={12} className="ml-auto text-green-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
