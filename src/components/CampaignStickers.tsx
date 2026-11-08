import React from 'react';
import { sound } from '../utils/audio';
import { Sparkles, Heart, Star, Check } from 'lucide-react';

export const JanganGolputSticker: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    onClick={() => sound.playPop()}
    className={`inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-black font-fredoka text-xs sm:text-sm uppercase tracking-wide rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transform -rotate-3 hover:rotate-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none ${className}`}
    title="Pesan Kampanye: Jangan Golput! Setiap Suara Berharga."
  >
    <Sparkles className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
    <span>JANGAN GOLPUT!</span>
  </div>
);

export const SatuGerakanSticker: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    onClick={() => sound.playPop()}
    className={`inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-600 text-white font-black font-fredoka text-xs sm:text-sm uppercase tracking-wide rounded-full border-2 border-emerald-950 shadow-[2px_2px_0px_#064e3b] transform rotate-2 hover:rotate-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none ${className}`}
    title="Semboyan Paslon 02: Satu Gerakan Seribu Karya!"
  >
    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
    <span>SATU GERAKAN SERIBU KARYA!!</span>
  </div>
);

export const OneVoteBanner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    onClick={() => sound.playPop()}
    className={`inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white font-righteous text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-slate-700 shadow-md cursor-pointer select-none hover:bg-slate-800 transition-colors ${className}`}
  >
    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
    <span className="text-amber-300 font-fredoka">ONE VOTE,</span>
    <span className="text-white font-fredoka">ONE VOICE,</span>
    <span className="text-emerald-400 font-fredoka">ONE FUTURE!</span>
  </div>
);

export const PitaMerahPutihHeader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full overflow-hidden select-none ${className}`}>
    <div className="h-3 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-xs" />
    <div className="h-2.5 w-full bg-white border-b border-slate-200/60" />
  </div>
);

export const BallotNumberBadge: React.FC<{ number: number; className?: string }> = ({ number, className = '' }) => (
  <div 
    className={`relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 text-white border-4 border-white shadow-[0_4px_10px_rgba(220,38,38,0.4)] font-fredoka font-black text-2xl sm:text-3xl leading-none select-none ${className}`}
  >
    0{number}
  </div>
);
