import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import snapshotPreviewImg from "figma:asset/5eaf034402eb53263c7c57147c051a960afa7afc.png";

interface SnapshotPreviewsProps {
  onOpenModal: () => void;
}

export function SnapshotPreviews({ onOpenModal }: SnapshotPreviewsProps) {
  return (
    <div className="flex flex-col gap-6 mt-4 w-full max-w-[300px]">
      <div className="relative w-full aspect-square group cursor-pointer perspective-1000 border-2 border-amber-900/20 p-4 bg-[#faf8f3] shadow-lg" onClick={onOpenModal}>
        <div className="relative w-full h-full transition-transform duration-500 transform group-hover:rotate-1 group-hover:scale-105">
          <ImageWithFallback 
            src={snapshotPreviewImg} 
            alt="Recent snapshots" 
            className="w-full h-auto object-contain drop-shadow-xl sepia-[.2] transition-all duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/5 transition-colors duration-300" />
      </div>
      
      <button 
        onClick={onOpenModal}
        className="text-center text-base hover:underline flex items-center justify-center gap-2 text-amber-900 hover:text-amber-700 transition-colors border border-amber-900/30 py-2 px-4 bg-[#faf8f3] hover:bg-amber-50"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        VIEW ARCHIVES →
      </button>
    </div>
  );
}
