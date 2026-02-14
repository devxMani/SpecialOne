
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, FileText } from 'lucide-react';
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Archival Letters</h2>
                <p className="text-sm text-gray-500">{letters.length} letters saved to database</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {letters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No letters archived yet.</p>
                </div>
              ) : (
                letters.map((letter) => (
                  <motion.div 
                    key={letter.id} 
                    className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Calendar size={14} />
                      {new Date(letter.created_at).toLocaleDateString()}
                      <span className="ml-auto px-2 py-1 bg-gray-100 rounded text-[10px] uppercase font-bold tracking-tight">
                        {letter.theme}
                      </span>
                    </div>
                    
                    <div className="text-gray-700 whitespace-pre-wrap line-clamp-3 italic">
                      {Array.isArray(letter.content) ? letter.content.join('\n') : ''}
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
