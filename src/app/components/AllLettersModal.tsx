
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Edit3 } from 'lucide-react';
import { Letter } from '../lib/supabase';

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gray-400" />
                Saved Letters
                <span className="text-sm font-normal text-gray-400 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                  {letters.length}
                </span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {letters.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No saved letters found yet.</p>
                  <p className="text-sm mt-2">Finish writing a letter to save it here.</p>
                </div>
              ) : (
                letters.map((letter) => (
                  <div 
                    key={letter.id} 
                    className="group bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                            letter.theme === 'love' ? 'bg-pink-50 text-pink-600 border-pink-100' : 
                            (letter.theme === 'vintage' ? 'bg-orange-50 text-orange-800 border-orange-100' : 
                            (letter.theme === 'dark' ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'))
                        }`}>
                            {letter.theme}
                        </span>
                     </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-mono">
                      <Calendar size={12} />
                      {new Date(letter.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div 
                        className={`text-sm leading-relaxed line-clamp-3 ${
                            letter.theme === 'modern' ? 'font-sans' : 'font-serif'
                        }`}
                        style={{ fontFamily: letter.theme === 'modern' ? "'Inter', sans-serif" : "'Special Elite', serif" }}
                    >
                      {letter.content && Array.isArray(letter.content) 
                        ? letter.content.join('\n') 
                        : 'Content unavailable'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
