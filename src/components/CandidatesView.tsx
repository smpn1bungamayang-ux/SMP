import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Candidate } from '../types';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Vote, 
  Layers, 
  Briefcase,
  Quote,
  ZoomIn,
  X,
  Check,
  CheckCircle,
  Trophy,
  Star,
  Recycle,
  Calendar,
  Flame,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { sound } from '../utils/audio';
import { JanganGolputSticker, OneVoteBanner, SatuGerakanSticker, PitaMerahPutihHeader } from './CampaignStickers';

interface CandidatesViewProps {
  onGoToVoting: (candidateId?: string) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({ onGoToVoting }) => {
  const { candidates } = useElection();
  const [activeTab, setActiveTab] = useState<'poster' | 'compare'>('poster');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('paslon-1');
  const [viewingPosterUrl, setViewingPosterUrl] = useState<string | null>(null);

  const currentSelected = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  const handleSelectTab = (tab: 'poster' | 'compare') => {
    sound.playPop();
    setActiveTab(tab);
  };

  const handleSelectCandidate = (id: string) => {
    sound.playPop();
    setSelectedCandidateId(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Stickers row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JanganGolputSticker />
        <OneVoteBanner />
        <SatuGerakanSticker />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-red-600 animate-spin" />
            <span>PILKETOS SMP NEGERI 01 BUNGA MAYANG · 10 NOVEMBER 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 tracking-tight">
            Profil & Visi Misi Resmi Pasangan Calon
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed font-medium">
            Kenali identitas visual, program kerja unggulan, serta komitmen nyata dari kedua pasangan calon ketua dan wakil ketua OSIS sebelum memberikan suara di bilik suara digital.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto border border-slate-200">
          <button
            onClick={() => handleSelectTab('poster')}
            className={`px-4 py-2 text-xs font-black font-fredoka rounded-lg transition-all ${
              activeTab === 'poster'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visual Poster & Profil Paslon
          </button>
          <button
            onClick={() => handleSelectTab('compare')}
            className={`px-4 py-2 text-xs font-black font-fredoka rounded-lg transition-all ${
              activeTab === 'compare'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Komparasi 2 Paslon
          </button>
        </div>
      </div>

      {activeTab === 'poster' ? (
        <div className="space-y-8">
          
          {/* Quick Selector Banner with Custom Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {candidates.map((c) => {
              const isSelected = selectedCandidateId === c.id;
              const isPaslon1 = c.number === 1;

              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCandidate(c.id)}
                  className={`relative p-4 rounded-2xl border-4 text-left transition-all duration-200 flex items-center gap-3.5 overflow-hidden ${
                    isSelected
                      ? isPaslon1
                        ? 'border-slate-900 bg-[#163323] text-white shadow-comic-emerald scale-102 ring-4 ring-emerald-400'
                        : 'border-slate-900 bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-comic-blue scale-102 ring-4 ring-lime-400'
                      : 'border-slate-900 bg-white hover:bg-amber-50/50 text-slate-800 shadow-comic-sm'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl font-mono font-black text-2xl flex items-center justify-center shrink-0 border-3 border-slate-900 shadow-comic-sm ${
                      isPaslon1
                        ? isSelected 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-emerald-800 text-amber-300'
                        : isSelected 
                          ? 'bg-lime-400 text-emerald-950' 
                          : 'bg-teal-800 text-lime-300'
                    }`}
                  >
                    0{c.number}
                  </div>

                  <div className="overflow-hidden">
                    <div className="text-[10px] font-mono uppercase tracking-wider opacity-90 font-black">
                      {isPaslon1 ? 'Aksi Nyata Bukan Sekedar Kata' : 'YUDEI · Satu Gerakan Seribu Karya'}
                    </div>
                    <div className="text-sm font-black font-fredoka truncate">
                      {c.chairmanName}
                    </div>
                    <div className="text-xs opacity-90 truncate font-bold">
                      & {c.viceChairmanName}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-[10px] font-black">
                      <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping inline-block" />
                      <span>Aktif</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE CANDIDATE SHOWCASE */}
          {currentSelected.number === 1 ? (
            /* =========================================================================
               THEME 1: PASLON 01 (VERONICA & GLADIA) - FOREST GREEN DOODLE & STAMP THEME
               ========================================================================= */
            <div className="bg-[#163323] text-white rounded-3xl p-6 sm:p-10 border-4 border-slate-900 shadow-comic-emerald relative overflow-hidden">
              
              {/* Background Playful Doodle Elements */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Campaign Header Bar */}
              <div className="text-center pb-6 border-b border-emerald-800/80 mb-8 relative z-10">
                <div className="text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-300 font-mono">
                  SMPN 01 BUNGA MAYANG · CALON KANDIDAT
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-300 uppercase mt-1">
                  PEMILIHAN KETUA OSIS DAN WAKIL KETUA OSIS
                </h2>
                <div className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase mt-0.5 font-mono">
                  MASA BAKTI 2026 / 2027
                </div>

                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-sm">
                  <Star className="w-4 h-4 fill-current text-slate-950" />
                  <span>KANDIDAT NOMOR URUT 01</span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                
                {/* Left Column: Stamp Frames & Original Poster */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Single Unified Candidate Photo Card (Satu Gambar Digabung) */}
                  <div className="bg-[#1f402c] p-4 sm:p-5 rounded-2xl border-2 border-emerald-700/60 shadow-inner">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-900/40 border border-emerald-600/40 relative group">
                      <img
                        src={currentSelected.photoUrl}
                        alt="Veronica Felly Anggraeni & Gladia Qory Magfira"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => setViewingPosterUrl(currentSelected.posterUrl || currentSelected.photoUrl)}
                        className="absolute bottom-3 right-3 p-2 bg-[#163323]/90 hover:bg-[#163323] text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1 transition-colors border border-emerald-600/60 shadow-md"
                        title="Perbesar poster kampanye"
                      >
                        <ZoomIn className="w-4 h-4 text-amber-300" />
                        <span>Perbesar</span>
                      </button>
                    </div>

                    {/* Candidate Names Banner */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 bg-[#163323] rounded-xl border border-emerald-700/80 shadow-xs">
                        <div className="text-[10px] text-amber-300 uppercase font-black">Calon Ketua OSIS</div>
                        <div className="font-extrabold text-xs sm:text-sm text-white mt-0.5">{currentSelected.chairmanName}</div>
                        <div className="text-[10px] text-emerald-300/80 font-mono">{currentSelected.chairmanClass}</div>
                      </div>

                      <div className="p-2.5 bg-[#163323] rounded-xl border border-emerald-700/80 shadow-xs">
                        <div className="text-[10px] text-emerald-300 uppercase font-black">Calon Wakil Ketua</div>
                        <div className="font-extrabold text-xs sm:text-sm text-white mt-0.5">{currentSelected.viceChairmanName}</div>
                        <div className="text-[10px] text-emerald-300/80 font-mono">{currentSelected.viceChairmanClass}</div>
                      </div>
                    </div>
                  </div>

                  {/* Slogan & Motto Badges */}
                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-emerald-800/60 border border-emerald-600 rounded-xl text-center">
                      <div className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                        "Paslon 01: Kreatif, Disiplin, Aksi Nyata Bukan Sekedar Kata-Kata"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onGoToVoting(currentSelected.id)}
                        className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Ayo Pilih Paslon 01</span>
                      </button>

                      <button
                        onClick={() => setViewingPosterUrl(currentSelected.posterUrl || currentSelected.photoUrl)}
                        className="py-2.5 px-3 bg-emerald-700/60 hover:bg-emerald-600/60 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-500"
                        title="Perbesar poster kampanye asli"
                      >
                        <ZoomIn className="w-4 h-4 text-emerald-300" />
                        <span>Lihat Poster Asli</span>
                      </button>
                    </div>
                  </div>

                  {/* Anti-Golput Banner */}
                  <div className="p-3 bg-amber-400 text-slate-950 font-black text-center text-sm rounded-xl tracking-widest shadow-md">
                    JANGAN GOLPUT! SUARAMU MENENTUKAN MASA DEPAN SPENSA
                  </div>

                </div>

                {/* Right Column: Visi, Misi, & Program Kerja Cards */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* VISI CARD (Warm Yellow Style from Poster) */}
                  <div className="bg-[#facc15] text-slate-950 rounded-2xl p-5 sm:p-6 shadow-md border-2 border-amber-300 relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-amber-400 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>VISI UTAMA</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold leading-relaxed mt-1 text-slate-900">
                      "{currentSelected.vision}"
                    </p>
                  </div>

                  {/* MISI CARD (Warm Orange Style with Checkmarks from Poster) */}
                  <div className="bg-[#ea580c] text-white rounded-2xl p-5 sm:p-6 shadow-md border-2 border-orange-400">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-orange-300 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                      <CheckCircle className="w-3.5 h-3.5 text-orange-400" />
                      <span>6 MISI KERJA NYATA</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm font-semibold">
                      {currentSelected.missions.map((mission, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-snug">
                          <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span>{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PROGRAM KERJA (Dark Emerald Box from Poster) */}
                  <div className="bg-[#0f2419] p-5 sm:p-6 rounded-2xl border border-emerald-700/80 shadow-inner">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <span>PROGRAM KERJA RESMI PASLON 01:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {currentSelected.workPrograms.map((wp, idx) => (
                        <div key={wp.id} className="p-3 bg-[#173a27] rounded-xl border border-emerald-600/50 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">{wp.title}</div>
                            <div className="text-[11px] text-emerald-200/90 mt-0.5 leading-tight">{wp.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          ) : (
            /* =========================================================================
               THEME 2: PASLON 02 (YUDEI - YUANITA & DEISON) - MINT & EMERALD GRADIENT THEME
               ========================================================================= */
            <div className="bg-gradient-to-b from-[#eafbe3] via-[#d4f6c5] to-[#0a3828] text-slate-900 rounded-3xl p-6 sm:p-10 border-4 border-slate-900 shadow-comic-blue relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Top YUDEI Banner */}
              <div className="text-center pb-6 border-b border-emerald-800/20 mb-8 relative z-10">
                <div className="inline-block font-black text-3xl sm:text-5xl text-emerald-950 tracking-wider uppercase font-sans drop-shadow-xs">
                  YUDEI
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-emerald-900 tracking-tight uppercase mt-0.5">
                  CALON KETUA & WAKIL KETUA OSIS
                </h2>
                <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-widest font-mono">
                  SMPN 01 BUNGA MAYANG · PERIODE 2026/2027
                </div>

                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-900 text-white font-black text-xs uppercase shadow-md border border-emerald-700">
                    <CheckCircle className="w-4 h-4 text-lime-400" />
                    <span>PILIH NOMOR 02</span>
                  </div>
                  <div className="inline-block px-3 py-1 bg-lime-300 text-emerald-950 text-xs font-black rounded-lg uppercase tracking-wider transform -rotate-1 shadow-xs">
                    "SATU GERAKAN SERIBU KARYA!!"
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                
                {/* Left Column: Photo Showcase & Badges */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Photo Display Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 shadow-md">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 relative group">
                      <img
                        src={currentSelected.photoUrl}
                        alt="Yuanita & Deison (YUDEI)"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      
                      <button
                        onClick={() => setViewingPosterUrl(currentSelected.posterUrl || currentSelected.photoUrl)}
                        className="absolute bottom-3 right-3 p-2 bg-emerald-950/80 hover:bg-emerald-950 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1 transition-colors"
                        title="Perbesar poster kampanye"
                      >
                        <ZoomIn className="w-4 h-4 text-lime-400" />
                        <span>Perbesar</span>
                      </button>
                    </div>

                    {/* Candidate Names Banner */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="text-[10px] text-emerald-700 uppercase font-black">Calon Ketua OSIS</div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">{currentSelected.chairmanName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{currentSelected.chairmanClass}</div>
                      </div>

                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="text-[10px] text-emerald-700 uppercase font-black">Calon Wakil Ketua</div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">{currentSelected.viceChairmanName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{currentSelected.viceChairmanClass}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Program Unggulan Pills (From Poster) */}
                  <div className="bg-emerald-950/90 text-white p-5 rounded-2xl border border-emerald-800 shadow-md">
                    <div className="text-xs font-black text-lime-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-lime-400" />
                      <span>3 PROGRAM UNGGULAN YUDEI:</span>
                    </div>

                    <div className="space-y-2">
                      {currentSelected.workPrograms.map((wp) => (
                        <div key={wp.id} className="p-2.5 bg-emerald-900/80 rounded-xl border border-emerald-700/60 flex items-start gap-2.5 text-xs">
                          <span className="w-5 h-5 rounded-full bg-lime-400 text-emerald-950 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <div>
                            <div className="font-bold text-white">{wp.title}</div>
                            <div className="text-[11px] text-emerald-200 mt-0.5 leading-snug">{wp.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onGoToVoting(currentSelected.id)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
                  >
                    <Vote className="w-5 h-5 text-lime-300" />
                    <span>Coblos Paslon 02 (YUDEI)</span>
                  </button>

                </div>

                {/* Right Column: Visi & Misi BISA */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* VISI BISA CARD */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-300">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800 text-lime-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                      <Target className="w-3.5 h-3.5 text-lime-400" />
                      <span>VISI UTAMA · SPENSA BIMA "BISA"</span>
                    </div>

                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed mt-2">
                      {currentSelected.vision}
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] font-black">
                      <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-900 border border-emerald-300">
                        B - Bersih
                      </div>
                      <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-900 border border-emerald-300">
                        I - Impresif
                      </div>
                      <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-900 border border-emerald-300">
                        S - Solidaritas
                      </div>
                      <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-900 border border-emerald-300">
                        A - Andal
                      </div>
                    </div>
                  </div>

                  {/* MISI 01-04 (Categorized like Poster) */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-300 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800 text-lime-300 rounded-full text-xs font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                      <span>4 PILAR MISI KEPEMIMPINAN YUDEI</span>
                    </div>

                    <div className="space-y-3">
                      {currentSelected.missions.map((mission, idx) => (
                        <div key={idx} className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-900 text-lime-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                            0{idx + 1}
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                            {mission}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extracurricular & Achievements */}
                  <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-lime-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <Users className="w-3.5 h-3.5" />
                        <span>Ekskul & Organisasi</span>
                      </div>
                      <ul className="text-xs text-emerald-100 space-y-1 list-disc pl-4">
                        {currentSelected.extracurriculars.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-lime-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <Award className="w-3.5 h-3.5" />
                        <span>Prestasi Terpilih</span>
                      </div>
                      <ul className="text-xs text-emerald-100 space-y-1 list-disc pl-4">
                        {currentSelected.achievements.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* =========================================================================
           TAB 2: MATRIX COMPARISON VIEW (2 PASLON SIDE-BY-SIDE)
           ========================================================================= */
        <div className="overflow-x-auto">
          <div className="min-w-[800px] bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-200">
                  <th className="p-4 font-bold w-1/4">Aspek Penilaian</th>
                  {candidates.map((c) => (
                    <th key={c.id} className="p-4 font-bold w-3/8 text-center border-l border-slate-800">
                      <div className="text-amber-400 font-mono text-base font-black">0{c.number}</div>
                      <div className="text-sm font-bold truncate mt-0.5">{c.chairmanName}</div>
                      <div className="text-xs text-slate-300 font-medium">& {c.viceChairmanName}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                
                {/* Poster Kampanye */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50">Poster Resmi Kampanye</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 text-center border-l border-slate-100 bg-slate-50/40">
                      <div className="w-36 h-48 mx-auto rounded-xl overflow-hidden border border-slate-300 shadow-sm relative group cursor-pointer"
                           onClick={() => setViewingPosterUrl(c.posterUrl || c.photoUrl)}>
                        <img
                          src={c.posterUrl || c.photoUrl}
                          alt={`Poster Paslon 0${c.number}`}
                          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Klik Perbesar</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Slogan */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50">Slogan Kampanye</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 border-l border-slate-100 font-black text-blue-900 text-center text-xs">
                      "{c.tagline}"
                    </td>
                  ))}
                </tr>

                {/* Visi */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50">Visi Kepemimpinan</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 border-l border-slate-100 text-slate-800 leading-relaxed align-top font-medium">
                      {c.vision}
                    </td>
                  ))}
                </tr>

                {/* Misi */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50">Misi Utama</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 border-l border-slate-100 text-slate-700 leading-relaxed align-top">
                      <ul className="space-y-1.5 list-disc pl-4">
                        {c.missions.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Program Kerja */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50">Program Kerja Unggulan</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 border-l border-slate-100 text-slate-700 leading-relaxed align-top">
                      <div className="space-y-2">
                        {c.workPrograms.map((wp, idx) => (
                          <div key={wp.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900">{idx + 1}. {wp.title}</span>
                            <div className="text-[11px] text-slate-600 mt-0.5">{wp.desc}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Aksi Coblos */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">Pilihan Anda</td>
                  {candidates.map((c) => (
                    <td key={c.id} className="p-4 text-center border-l border-slate-200">
                      <button
                        onClick={() => {
                          sound.playCoblos();
                          onGoToVoting(c.id);
                        }}
                        className="py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black font-fredoka text-xs uppercase rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-98"
                      >
                        <Vote className="w-4 h-4 text-amber-300" />
                        <span>Coblos Nomor 0{c.number}</span>
                      </button>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Poster Zoom Modal */}
      {viewingPosterUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingPosterUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl relative max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">Poster Resmi Kampanye PILKETOS</span>
              <button
                onClick={() => setViewingPosterUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-slate-900 rounded-xl my-2">
              <img
                src={viewingPosterUrl}
                alt="Poster Resmi"
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              Poster resmi pasangan calon Ketua & Wakil Ketua OSIS SMPN 01 Bunga Mayang 2026/2027
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
