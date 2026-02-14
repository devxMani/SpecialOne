import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Snapshot {
  id: string;
  timestamp: Date;
  lines: string[];
}

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: Snapshot[];
}

export function SnapshotModal({ isOpen, onClose, snapshots }: SnapshotModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 sm:p-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[80vh] bg-[#fdfdfd] dark:bg-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 rounded-lg transition-colors duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl text-gray-800 dark:text-gray-200" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  archival snapshots
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {snapshots.map((snapshot) => (
                  <motion.div 
                    key={snapshot.id} 
                    layout
                    className="flex flex-col gap-4 group"
                  >
                    <div className="bg-white dark:bg-[#2a2a2a] p-8 shadow-xl border border-gray-100 dark:border-gray-800 aspect-[3/4] overflow-hidden flex flex-col transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-1">
                      <div className="text-[11px] leading-[1.6] font-mono text-gray-800 dark:text-gray-300 line-clamp-[18] whitespace-pre-wrap selection:bg-pink-100">
                        {snapshot.lines.slice(-15).join('\n')}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono text-center tracking-widest uppercase">
                      {format(snapshot.timestamp, 'MMM d, yyyy • HH:mm:ss')}
                    </div>
                  </motion.div>
                ))}

                {snapshots.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 font-mono text-sm italic">
                    The archives are empty. Take a snapshot to begin.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
