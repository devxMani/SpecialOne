
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Edit3 } from 'lucide-react';
import { Letter } from '../../lib/supabase';

interface AllLettersModalProps {
  isOpen: boolean;
  onClose: () => void;
  letters: Letter[];
}

export function AllLettersModal({ isOpen, onClose, letters }: AllLettersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] bg-[#faf8f3] rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] border-2 border-amber-900/20 z-50 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b-2 border-amber-900/20 flex justify-between items-center bg-amber-50/50">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-amber-900" style={{ fontFamily: "'Courier New', monospace" }}>
                <Edit3 className="w-6 h-6 text-amber-700" />
                ARCHIVAL LETTERS
                <span className="text-sm font-bold text-amber-700 ml-2 bg-amber-100 px-3 py-1 rounded-sm border border-amber-900/20">
                  {letters.length}
                </span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-amber-100 rounded-sm transition-colors text-amber-700 hover:text-amber-900 border border-transparent hover:border-amber-900/20"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f4f1e8]">
              {letters.length === 0 ? (
                <div className="text-center py-16 text-amber-800" style={{ fontFamily: "'Courier New', monospace" }}>
                  <p className="text-lg font-bold">NO SAVED LETTERS FOUND YET.</p>
                  <p className="text-sm mt-3 opacity-70">Finish writing a letter to save it here.</p>
                </div>
              ) : (
                letters.map((letter) => (
                  <motion.div 
                    key={letter.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[#faf8f3] p-6 rounded-sm border-2 border-amber-900/20 shadow-[4px_4px_0px_0px_rgba(120,53,15,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(120,53,15,0.25)] transition-all duration-300 relative overflow-hidden sepia-[.15]"
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border-2 font-bold ${
                            letter.theme === 'love' ? 'bg-pink-50 text-pink-700 border-pink-200' : 
                            (letter.theme === 'vintage' ? 'bg-amber-50 text-amber-900 border-amber-900/30' : 
                            'bg-gray-100 text-gray-700 border-gray-300')
                        }`} style={{ fontFamily: "'Courier New', monospace" }}>
                            {letter.theme}
                        </span>
                     </div>

                    <div className="flex items-center gap-2 text-xs text-amber-800 mb-4 font-bold uppercase tracking-wider" style={{ fontFamily: "'Courier New', monospace" }}>
                      <Calendar size={14} strokeWidth={2.5} />
                      {new Date(letter.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div 
                        className="text-base leading-relaxed line-clamp-4 text-gray-800 whitespace-pre-wrap"
                        style={{ fontFamily: "'Special Elite', 'Courier New', monospace" }}
                    >
                      {letter.content && Array.isArray(letter.content) 
                        ? letter.content.join('\n') 
                        : 'Content unavailable'}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
