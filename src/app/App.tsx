import React, { useState } from 'react';
import { Typewriter } from './components/Typewriter';
import { SnapshotModal } from './components/SnapshotModal';
import { SnapshotPreviews } from './components/SnapshotPreviews';
import { Toaster } from 'sonner';
import { motion } from 'motion/react';

import { Heart, Coffee, Sun, Moon, Monitor, List, Sparkles } from 'lucide-react';
import { AllLettersModal } from './components/AllLettersModal';
import { getLetters, type Letter } from '../lib/supabase';
import type { Theme } from '../types';

interface Snapshot {
  id: string;
  timestamp: Date;
  lines: string[];
}

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLettersModalOpen, setIsLettersModalOpen] = useState(false);
  const [savedLetters, setSavedLetters] = useState<Letter[]>([]);
  const [inkColor, setInkColor] = useState<'black' | 'red' | 'blue' | 'green'>('black');
  const [theme, setTheme] = useState<Theme>('love');

  const handleTakeSnapshot = (lines: string[]) => {
    const newSnapshot: Snapshot = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      lines: [...lines]
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
    setIsModalOpen(true);
  };

  const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
    { id: 'love', label: 'Love', icon: <Heart size={14} /> },
    { id: 'vintage', label: 'Vintage', icon: <Coffee size={14} /> },
  ];

  const handleOpenLetters = async () => {
    const letters = await getLetters();
    setSavedLetters(letters);
    setIsLettersModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row overflow-hidden selection:bg-pink-100 transition-colors duration-500 ${theme === 'love' ? 'bg-[#fff5f5] text-[#590d22]' : 'bg-[#f8f9fa] text-gray-900'}`}>
      <Toaster position="top-center" />
      
      {/* Left Column: Info & Previews */}
      <div className={`w-full md:w-[380px] p-12 flex flex-col justify-between h-screen z-30 transition-colors duration-500 border-r ${theme === 'love' ? 'bg-[#fff5f5] border-pink-100' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col gap-10">
          <div className="flex justify-between items-start">
            <h1 className={`text-5xl font-bold tracking-tighter transition-colors duration-500 ${theme === 'love' ? 'text-[#ff4d6d]' : 'text-gray-900'}`} style={{ fontFamily: "'Special Elite', serif" }}>
              After You
            </h1>
          </div>
          
          <div className={`space-y-6 leading-relaxed font-normal text-base transition-colors duration-500 ${theme === 'love' ? 'text-[#800f2f]' : 'text-gray-500'}`} style={{ fontFamily: "'Dancing Script', cursive" }}>
            <p className="text-xl">Type as if someone will come after you.</p>
            <p className="text-lg opacity-80">Write a line, leave a thought, or finish someone else&apos;s sentence.</p>
            <p className="text-lg opacity-80">What you type stays, waiting for the next person.</p>
            <div className={`pt-6 font-medium italic text-sm font-mono tracking-tight ${theme === 'love' ? 'text-pink-400' : 'text-gray-400'}`}>
              [ use your keyboard to type ]
              <br />
              [ drag carriage or press enter to return ]
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Select Vibe</h3>
              <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 border ${
                    theme === t.id 
                      ? (t.id === 'love' ? 'bg-pink-100 border-pink-200 text-pink-600' : 
                        'bg-amber-100 border-amber-200 text-amber-800')
                      : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={t.label}
                >
                  {t.icon}
                </button>
              ))}
          </div>
          </div>
          
          </div>
          </div>
          
          <SnapshotPreviews onOpenModal={() => setIsModalOpen(true)} />
      </div>

      {/* Right Column: Interactive Typewriter */}
      <div className="flex-1 relative h-screen z-0">
        <Typewriter 
          onSnapshot={handleTakeSnapshot}
          inkColor={inkColor}
          setInkColor={setInkColor}
          theme={theme}
        />
      </div>

      {/* Archival Modal */}
      <SnapshotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        snapshots={snapshots}
      />
      
      <AllLettersModal
        isOpen={isLettersModalOpen}
        onClose={() => setIsLettersModalOpen(false)}
        letters={savedLetters}
      />
    </div>
  );
}
