import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

// Assets - using relative paths to avoid TS issues
import baseImg from "../../assets/ed4da5391f8db1233917f716a54b2e30b60587f3.png";
import carriageImg from "../../assets/8f731afeb73b75596b261be307531e13e24b484c.png";

import { saveLetter } from '../../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Theme = 'love' | 'vintage';

interface TypewriterProps {
  onSnapshot: (lines: string[]) => void;
  inkColor: 'black' | 'red' | 'blue' | 'green';
  setInkColor: (color: 'black' | 'red' | 'blue' | 'green') => void;
  theme: Theme;
}

const MAX_CHARS_PER_LINE = 48;
const CHAR_WIDTH = 11;

export function Typewriter({ onSnapshot, inkColor, setInkColor, theme }: TypewriterProps) {
  const [lines, setLines] = useState<string[]>(['']);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [carriageOffset, setCarriageOffset] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const paperEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep typing in view
  useEffect(() => {
    if (paperEndRef.current) {
      paperEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lines, currentLineIndex]);

  const themeStyles = {
    love: { 
      bg: 'bg-[#fff0f3]', 
      paper: 'bg-[#fffbfc]', 
      text: inkColor === 'black' ? 'text-[#a4133c]' : (inkColor === 'red' ? 'text-[#c9184a]' : (inkColor === 'blue' ? 'text-[#7209b7]' : 'text-[#2d6a4f]')),
      accent: 'border-pink-100'
    },
    vintage: { 
      bg: 'bg-[#f4f1e8]', 
      paper: 'bg-[#faf8f3] sepia-[.3]', 
      text: inkColor === 'black' ? 'text-[#2b2b2b]' : (inkColor === 'red' ? 'text-[#8b0000]' : (inkColor === 'blue' ? 'text-[#003366]' : 'text-[#2d5016]')),
      accent: 'border-amber-900/20',
      font: 'font-serif'
    }
  };

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const currentStyle = themeStyles[theme] || themeStyles.love;

  const playClick = () => {
    try {
      const audioContext = initAudio();
      const master = audioContext.createGain();
      master.gain.setValueAtTime(0.3, audioContext.currentTime); // Increased volume slightly
      master.connect(audioContext.destination);

      const click = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(1500, audioContext.currentTime);
      click.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.03);
      clickGain.gain.setValueAtTime(0.4, audioContext.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
      click.connect(clickGain);
      clickGain.connect(master);
      
      click.start();
      click.stop(audioContext.currentTime + 0.03);
    } catch (e) {}
  };

  const playDing = () => {
    try {
      const audioContext = initAudio();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, audioContext.currentTime);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.4);
    } catch (e) {}
  };

  const playReturn = () => {
     try {
      const audioContext = initAudio();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sawtooth';
      // ... same logic
      osc.frequency.setValueAtTime(50, audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.5);
     } catch(e) {}
  };

  const playSlide = () => {
      try {
        const audioContext = initAudio();
        // ... same logic
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(50, audioContext.currentTime + 1);
        gain.gain.setValueAtTime(0.05, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 1);
      } catch(e) {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return; // Disable typing when finished
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Enter') {
        handleCarriageReturn();
        return;
      }

      if (e.key === 'Backspace') {
        if (charIndex > 0) {
          playClick();
          setLines(prev => {
            const newLines = [...prev];
            newLines[currentLineIndex] = newLines[currentLineIndex].slice(0, -1);
            return newLines;
          });
          setCharIndex(prev => prev - 1);
          setCarriageOffset(prev => prev + CHAR_WIDTH);
        } else if (currentLineIndex > 0) {
           // Backspace at start of line: move to previous line
           playReturn();
           setIsReturning(true);
           setTimeout(() => setIsReturning(false), 300);
           
           setLines(prev => {
             const newLines = [...prev];
             // Remove current empty line if it is empty, or merge? 
             // Simple typewriter behavior: just move up.
             // Actually, real typewriters don't "delete" lines properly but let's simulate text editor behavior for usability
             if (newLines[currentLineIndex].length === 0) {
                newLines.splice(currentLineIndex, 1);
             }
             return newLines;
           });
           setCurrentLineIndex(prev => prev - 1);
           const prevLineLength = lines[currentLineIndex - 1]?.length || 0;
           setCharIndex(prevLineLength);
           setCarriageOffset((MAX_CHARS_PER_LINE - prevLineLength) * CHAR_WIDTH - (MAX_CHARS_PER_LINE * CHAR_WIDTH)); 
           // Correction: Carriage offset logic is complex here. 
           // Simplified: reset to 0 and calculate based on char count.
           // Carriage at 0 = Start of line.
           // Each char moves carriage LEFT (-CHAR_WIDTH).
           // So offset = - (charIndex * CHAR_WIDTH)
           setCarriageOffset( -(prevLineLength * CHAR_WIDTH) );
        }
        return;
      }

      if (e.key.length === 1) {
        if (charIndex < MAX_CHARS_PER_LINE) {
          playClick();
          setActiveKey(e.key.toLowerCase());
          setIsShaking(true);
          setTimeout(() => {
            setActiveKey(null);
            setIsShaking(false);
          }, 60);

          setLines(prev => {
            const newLines = [...prev];
            newLines[currentLineIndex] = newLines[currentLineIndex] + e.key;
            return newLines;
          });
          setCharIndex(prev => prev + 1);
          setCarriageOffset(prev => prev - CHAR_WIDTH);
          
          if (charIndex === MAX_CHARS_PER_LINE - 1) {
            playDing();
            toast.info("Ding!", { duration: 1000 });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [charIndex, currentLineIndex, isFinished]);

  const handleCarriageReturn = () => {
    playReturn();
    setIsReturning(true);
    setCarriageOffset(0);
    setCharIndex(0);
    setLines(prev => [...prev, '']);
    setCurrentLineIndex(prev => prev + 1);
    setTimeout(() => setIsReturning(false), 600);
  };

  const handleFinish = () => {
    setIsFinished(true);
    playReturn(); // Sound effect for final movement
    playSlide();
    // onSnapshot(lines); // Optional: keep snapshot behavior?
  };

  const handleSave = async () => {
    toast.promise(saveLetter(lines, theme), {
      loading: 'Saving letter...',
      success: 'Letter saved safely!',
      error: 'Could not save letter.'
    });
  };

  const handleExport = async () => {
     const element = document.getElementById('letter-content');
     if (!element) {
       toast.error('Could not find letter content');
       return;
     }
     
     try {
       toast.loading('Generating PDF...');
       const canvas = await html2canvas(element, { scale: 2 });
       const imgData = canvas.toDataURL('image/png');
       const pdf = new jsPDF('p', 'mm', 'a4');
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
       pdf.save(`letter-${new Date().toISOString().split('T')[0]}.pdf`);
       toast.dismiss();
       toast.success('PDF exported successfully!');
     } catch (error) {
       toast.dismiss();
       toast.error('Failed to export PDF: ' + (error as Error).message);
       console.error('Export error:', error);
     }
  };

  const onDragEnd = (event: any, info: any) => {
    if (isFinished) return;
    if (info.offset.x > 80) {
      handleCarriageReturn();
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-end overflow-hidden transition-colors duration-500 ${currentStyle.bg}`}>
      
      {/* Paper Surface - Wrapped in a container for correct layering */}
      <div className={`absolute inset-0 flex items-center justify-center overflow-hidden z-0 ${isFinished ? 'z-[40]' : 'pointer-events-none'}`}>
        <motion.div 
          animate={isFinished ? {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            top: '5%'
          } : { 
            x: carriageOffset,
            rotate: isShaking ? [0, -0.2, 0.2, 0] : 0,
            y: -currentLineIndex * 28 // Updated to match line-height (28px)
          }}
          transition={isFinished ? { duration: 1.5, ease: "easeInOut" } : (isReturning ? { type: "spring", stiffness: 100, damping: 20 } : { type: "tween", duration: 0.1 })}
          className="relative pointer-events-auto"
          style={{
            height: '1000px',
            top: isFinished ? '5%' : '10%' // Lower when typing to show controls
          }}
        >
          <div 
            id="letter-content"
            className={`relative shadow-2xl p-20 h-[800px] transition-colors duration-500 border-x border-t border-gray-200 flex flex-col ${currentStyle.paper} ${isFinished ? 'rounded-b-sm border-b' : ''}`}
            style={{ 
                fontFamily: theme === 'vintage' ? "'Courier New', monospace" : "'Inter', sans-serif",
                width: '600px'
            }}
          >
            {/* Paper Header (UI Controls) - Hidden when finished */}
             <AnimatePresence>
              {!isFinished && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex flex-wrap gap-4 justify-between items-center mb-8 pb-4 border-b ${theme === 'vintage' ? 'border-amber-900/30' : 'border-pink-100'} transition-opacity duration-300 ${isReturning ? 'opacity-30' : 'opacity-100'}`}
                >
                  <button 
                    onClick={handleFinish}
                    className={`flex items-center gap-2 text-sm transition-colors hover:scale-105 active:scale-95 ${theme === 'love' ? 'text-[#a4133c]' : 'text-gray-600'}`}
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    finish letter
                  </button>
                  
                  <div className="flex gap-2">
                     {/* Ink Color Selector */}
                    <div className="flex gap-1">
                      {['black', 'red', 'blue', 'green'].map((c: any) => (
                        <button
                          key={c}
                          onClick={() => setInkColor(c)}
                          className={`w-4 h-4 rounded-full border ${inkColor === c ? 'border-gray-900 scale-110' : 'border-transparent opacity-50'} shadow-sm transition-all`}
                          style={{ backgroundColor: c === 'black' ? '#2c3e50' : (c === 'red' ? '#e74c3c' : (c === 'blue' ? '#3498db' : '#2ecc71')) }}
                          title={`${c} ink`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Finished Header (Date) - HIGHLY VISIBLE */}
            <AnimatePresence>
              {isFinished && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mb-10 flex justify-center border-y-2 py-6 border-amber-900/40 bg-amber-50/30"
                >
                  <div 
                    className={`text-xl tracking-[0.4em] uppercase ${theme === 'love' ? 'text-[#a4133c]' : 'text-amber-900'} font-black`}
                    style={{ 
                      fontFamily: "'Special Elite', 'Courier New', monospace",
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      letterSpacing: '0.4em'
                    }}
                  >
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <div className={`whitespace-pre-wrap break-words leading-[24px] text-lg transition-colors duration-500 tracking-wider flex-1 ${currentStyle.text}`}>
              {lines.map((line, i) => (
                <div key={i} className="min-h-[24px] relative flex">
                  {line.split('').map((char, j) => (
                    <motion.span
                      key={`${i}-${j}`}
                      initial={{ opacity: 0, scale: 2, y: 5, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 15,
                        mass: 0.5
                      }}
                      className="inline-block relative"
                      style={{ 
                          textShadow: '0 0 1px rgba(0,0,0,0.1)'
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                  {i === currentLineIndex && !isFinished && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className={`inline-block w-[3px] h-[1.2em] ml-[2px] align-middle rounded-full ${inkColor === 'black' ? 'bg-gray-800' : (inkColor === 'red' ? 'bg-red-700' : (inkColor === 'blue' ? 'bg-blue-600' : 'bg-green-600'))}`}
                    />
                  )}
                </div>
              ))}
              <div ref={paperEndRef} />
            </div>

            {/* Footer / Signature */}
            <AnimatePresence>
               {isFinished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end"
                >
                   <div style={{ fontFamily: "'Dancing Script', cursive" }} className={`text-2xl ${theme === 'love' ? 'text-[#ff4d6d]' : 'text-gray-400'}`}>
                      With love,
                   </div>
                   {theme === 'love' && (
                     <motion.div 
                       animate={{ scale: [1, 1.1, 1] }} 
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="text-[#ff4d6d]"
                     >
                        <HeartIcon filled />
                     </motion.div>
                   )}
                </motion.div>
               )}
            </AnimatePresence>
            
            {/* Love theme decorations */}
            {theme === 'love' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] text-pink-500">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
            )}
            
            {/* Controls to Restart / Save */}
            <AnimatePresence>
              {isFinished && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                     className="mt-8 flex gap-4 justify-center pointer-events-auto"
                  >
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-all hover:scale-105 ${
                          theme === 'love' 
                            ? 'text-[#a4133c] hover:text-[#c9184a] border-2 border-pink-200 bg-pink-50 hover:bg-pink-100' 
                            : 'text-amber-900 hover:text-amber-700 border-2 border-amber-900/30 bg-[#faf8f3] hover:bg-amber-50'
                        } px-6 py-3 shadow-md`}
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                         Save Letter
                    </button>
                     <button
                        onClick={handleExport}
                        className={`flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-all hover:scale-105 ${
                          theme === 'love' 
                            ? 'text-[#a4133c] hover:text-[#c9184a] border-2 border-pink-200 bg-pink-50 hover:bg-pink-100' 
                            : 'text-amber-900 hover:text-amber-700 border-2 border-amber-900/30 bg-[#faf8f3] hover:bg-amber-50'
                        } px-6 py-3 shadow-md`}
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                         Export PDF
                    </button>
                     <button
                        onClick={() => {
                            setIsFinished(false);
                            setLines(['']);
                            setCurrentLineIndex(0);
                            setCharIndex(0);
                            setCarriageOffset(0);
                        }}
                        className={`flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-all hover:scale-105 ${
                          theme === 'love' 
                            ? 'text-pink-400 hover:text-pink-600 border-2 border-pink-100 bg-white hover:bg-pink-50' 
                            : 'text-amber-700 hover:text-amber-900 border-2 border-amber-900/20 bg-white hover:bg-amber-50'
                        } px-6 py-3 shadow-md`}
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Write Another
                    </button>
                 </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      {/* Typewriter Carriage (Behind Base) */}
      <motion.div
        drag={!isFinished ? "x" : false} // Disable drag when finished
        dragConstraints={{ left: -300, right: 300 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
        animate={{ 
          x: carriageOffset,
          y: isFinished ? 500 : (isShaking ? [0, -1, 1, 0] : 0), // Move down when finished
        }}
        transition={isFinished ? { duration: 1, ease: 'easeInOut' } : (isReturning ? { type: "spring", stiffness: 100, damping: 20 } : { type: "tween", duration: 0.1 })}
        className="absolute bottom-[-80px] cursor-grab active:cursor-grabbing z-10"
        style={{ width: '500px' }}
      >
        <div className="relative">
          <ImageWithFallback 
            src={carriageImg} 
            alt="Carriage" 
            className={`w-full h-auto select-none pointer-events-none transition-all duration-500 ${theme === 'love' ? 'hue-rotate-[320deg] saturate-[1.1] brightness-105' : (theme === 'vintage' ? 'sepia-[.3] brightness-90' : '')}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* The carriage bar area where paper appears to slide through */}
            <div className="w-[450px] h-[10px] bg-black/5 rounded-full blur-[1px]" style={{ transform: 'translateY(-15px)' }} />
          </div>
        </div>
      </motion.div>

      {/* Typewriter Base (Front Layer) */}
      <motion.div 
        animate={{ y: isFinished ? 600 : 150 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="relative w-[650px] z-20 pointer-events-none" 
      >
        <ImageWithFallback 
          src={baseImg} 
          alt="Typewriter Base" 
          className={`w-full h-auto select-none transition-all duration-500 ${theme === 'love' ? 'hue-rotate-[320deg] saturate-[1.1] brightness-105' : ''}`}
        />
        
        {/* Key Press Visual Feedback */}
        <AnimatePresence>
          {activeKey && !isFinished && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1.1, opacity: 0.4, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -20 }}
              className="absolute bg-white rounded-full w-10 h-10 flex items-center justify-center text-black shadow-xl"
              style={{
                left: '50%',
                top: '65%',
                transform: 'translateX(-50%)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <span className="text-lg font-bold uppercase">{activeKey}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom masking gradient to ground the typewriter */}
      <div className="absolute bottom-0 w-full h-[150px] bg-gradient-to-t from-white/20 to-transparent z-30 pointer-events-none" />
    </div>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}
