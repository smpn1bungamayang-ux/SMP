import React, { useState } from 'react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, MessageCircle, Volume2, Star, ShieldCheck, Heart } from 'lucide-react';

const OSIS_QUOTES = [
  "Halo kawan Spensa! Yuk gunakan hak suaramu di PILKETOS 2026/2027!",
  "Pilihlah pemimpin OSIS yang amanah, berprestasi, dan inspiratif!",
  "Ingat prinsip LUBER JURDIL: Langsung, Umum, Bebas, Rahasia, Jujur & Adil!",
  "Satu suara dari kamu sangat berharga bagi masa depan SMPN 01 Bunga Mayang!",
  "Ayo bersama ciptakan sekolah yang rukun, kreatif, dan anti-bullying!"
];

export const OsisSmpAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isCheering, setIsCheering] = useState(false);

  const nextQuote = () => {
    sound.playPop();
    setQuoteIdx((prev) => (prev + 1) % OSIS_QUOTES.length);
  };

  const triggerBadgeCelebration = (e: React.MouseEvent) => {
    sound.playCelebrationFanfare();
    setIsCheering(true);
    setTimeout(() => setIsCheering(false), 1200);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { x, y },
      colors: ['#f59e0b', '#dc2626', '#2563eb', '#ffffff', '#10b981']
    });
  };

  const triggerBallotDrop = () => {
    sound.playBallotDrop();
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#3b82f6', '#ef4444', '#fbbf24']
    });
  };

  return (
    <div className={`relative w-full rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-3 border-amber-400 p-4 sm:p-5 shadow-comic-md text-white select-none overflow-hidden ${className}`}>
      {/* Background Animated Starlight & Floating Glow */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
      
      {/* Top Tag & Sound Hint */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black font-fredoka uppercase shadow-xs">
          <Star className="w-3 h-3 fill-slate-950 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Maskot & Lambang Resmi OSIS SMP</span>
        </div>
        <span className="text-[10px] text-amber-300/90 font-bold flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
          Klik untuk aksi & suara
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Left Column: Official Animated SMP OSIS Shield Badge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
          <div 
            onClick={triggerBadgeCelebration}
            className={`relative group cursor-pointer p-2 transition-transform duration-300 hover:scale-105 active:scale-95 ${
              isCheering ? 'scale-110' : ''
            }`}
            title="Klik Lambang OSIS SMP untuk semarak kembang api!"
          >
            {/* Ambient Aura Ring */}
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-osis-glow" />

            {/* Official OSIS SMP Emblem Graphic (Accurate SVG) */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-osis-float">
              <svg 
                viewBox="0 0 160 180" 
                className="w-full h-full drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]"
              >
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#92400e" />
                    <stop offset="35%" stopColor="#b45309" />
                    <stop offset="70%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                  <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="45%" stopColor="#ea580c" />
                    <stop offset="80%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                  <linearGradient id="bookGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>

                {/* Outer OSIS Shield Silhouette */}
                <path 
                  d="M80 8 L142 32 L132 120 C132 148, 80 172, 80 172 C80 172, 28 148, 28 120 L18 32 Z" 
                  fill="url(#shieldGrad)" 
                  stroke="url(#goldTrim)" 
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                />

                {/* Inner Decorative Stitching Line */}
                <path 
                  d="M80 16 L134 38 L125 116 C125 140, 80 162, 80 162 C80 162, 35 140, 35 116 L26 38 Z" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />

                {/* Golden Sunburst / Rays at Center */}
                <circle cx="80" cy="85" r="32" fill="#d97706" opacity="0.3" />

                {/* Left Laurel Branch (Padi) */}
                <path 
                  d="M48 115 C42 95, 45 70, 56 52" 
                  stroke="#fde047" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none" 
                />
                <circle cx="46" cy="102" r="3" fill="#facc15" />
                <circle cx="43" cy="88" r="3" fill="#facc15" />
                <circle cx="45" cy="74" r="3" fill="#facc15" />
                <circle cx="50" cy="62" r="3" fill="#facc15" />

                {/* Right Cotton Branch (Kapas) */}
                <path 
                  d="M112 115 C118 95, 115 70, 104 52" 
                  stroke="#fde047" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none" 
                />
                <circle cx="114" cy="102" r="3.2" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
                <circle cx="117" cy="88" r="3.2" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
                <circle cx="115" cy="74" r="3.2" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
                <circle cx="110" cy="62" r="3.2" fill="#ffffff" stroke="#facc15" strokeWidth="1" />

                {/* Open Book of Knowledge (Buku Terbuka) */}
                <path 
                  d="M80 110 C70 104, 52 105, 46 109 L46 88 C54 85, 72 85, 80 91 C88 85, 106 85, 114 88 L114 109 C108 105, 90 104, 80 110 Z" 
                  fill="url(#bookGrad)" 
                  stroke="#1e293b" 
                  strokeWidth="1.8" 
                />
                <line x1="80" y1="91" x2="80" y2="110" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="53" y1="94" x2="72" y2="94" stroke="#94a3b8" strokeWidth="1" />
                <line x1="53" y1="99" x2="72" y2="99" stroke="#94a3b8" strokeWidth="1" />
                <line x1="88" y1="94" x2="107" y2="94" stroke="#94a3b8" strokeWidth="1" />
                <line x1="88" y1="99" x2="107" y2="99" stroke="#94a3b8" strokeWidth="1" />

                {/* Key of Success (Kunci Kemenangan) */}
                <path 
                  d="M68 84 L92 84 M70 82 L70 86 M74 82 L74 86" 
                  stroke="#facc15" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />

                {/* Flaming Torch of Spirit (Obor Perjuangan) with Animated Flame */}
                <g className="animate-osis-flame origin-bottom">
                  {/* Torch Handle */}
                  <path d="M78 80 L82 80 L81 66 L79 66 Z" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
                  {/* Torch Bowl */}
                  <path d="M75 66 L85 66 L83 62 L77 62 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                  {/* Dynamic Flame */}
                  <path 
                    d="M80 40 C75 48, 71 52, 73 60 C75 62, 85 62, 87 60 C89 52, 85 48, 80 40 Z" 
                    fill="url(#flameGrad)" 
                    filter="drop-shadow(0 0 6px #f97316)"
                  />
                  {/* Inner White/Yellow Core Flame */}
                  <path 
                    d="M80 46 C78 51, 75 54, 76 58 C78 60, 82 60, 84 58 C85 54, 82 51, 80 46 Z" 
                    fill="#fef08a" 
                  />
                </g>

                {/* Five-Pointed Star at Top (Ketuhanan yang Maha Esa) with Glow */}
                <polygon 
                  points="80,18 83,26 91,26 84,31 87,39 80,34 73,39 76,31 69,26 77,26" 
                  fill="#facc15" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="drop-shadow(0 0 4px #fde047)"
                />

                {/* Curved Ribbon: OSIS SMP */}
                <path 
                  d="M38 136 C55 146, 105 146, 122 136 L118 126 C102 135, 58 135, 42 126 Z" 
                  fill="#fef08a" 
                  stroke="#78350f" 
                  strokeWidth="1.2" 
                />
                <text 
                  x="80" 
                  y="134" 
                  textAnchor="middle" 
                  fill="#78350f" 
                  fontWeight="900" 
                  fontSize="8.5" 
                  fontFamily="'Fredoka', sans-serif"
                >
                  OSIS SMP
                </text>
              </svg>
            </div>

            <div className="mt-1">
              <span className="text-[11px] font-black font-fredoka tracking-wide text-amber-300 drop-shadow-xs">
                OSIS SMPN 01 BUMA
              </span>
              <div className="text-[9px] text-slate-300 font-medium">
                Aktif · Cerdas · Berakhlak
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Animated Student Mascot & Interactive Speech Bubble */}
        <div className="md:col-span-5 flex flex-col items-center sm:items-start text-left">
          
          {/* Speech Bubble */}
          <div 
            onClick={nextQuote}
            className="w-full relative bg-white text-slate-900 rounded-2xl p-3 sm:p-3.5 border-3 border-slate-900 shadow-comic-sm cursor-pointer hover:bg-amber-50 active:scale-98 transition-all mb-3 group"
          >
            {/* Triangle pointer at bottom left */}
            <div className="absolute -bottom-2.5 left-8 w-4 h-4 bg-white border-r-3 border-b-3 border-slate-900 transform rotate-45 group-hover:bg-amber-50 transition-colors" />

            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 fill-blue-100" />
              <div>
                <p className="text-xs sm:text-[13px] font-bold font-fredoka text-slate-900 leading-snug">
                  "{OSIS_QUOTES[quoteIdx]}"
                </p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
                  <span className="text-blue-700">Pesan Pengurus OSIS</span>
                  <span className="text-amber-600 underline group-hover:text-amber-700">Klik untuk kutipan lain ➔</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Mascot Avatars in Indonesian SMP Uniform */}
          <div className="flex items-center gap-3">
            {/* Boy Mascot (Siswa SMP BUMA) */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl p-2 border border-slate-700/80">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-white shadow-xs flex items-center justify-center overflow-hidden">
                {/* Hair */}
                <div className="absolute top-0 w-full h-4 bg-slate-900 rounded-b-xl" />
                {/* Face & Smile */}
                <div className="relative z-10 flex flex-col items-center mt-1">
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                  <div className="w-2.5 h-1 border-b-2 border-slate-900 rounded-full mt-0.5" />
                </div>
                {/* Uniform Collar & Navy Tie */}
                <div className="absolute bottom-0 w-full h-5 bg-white border-t border-slate-200 flex items-center justify-center">
                  <div className="w-2 h-4 bg-blue-900 rounded-b-xs" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black font-fredoka text-amber-300">
                  Kader Putra SMP
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  Seragam Putih Biru
                </div>
              </div>
            </div>

            {/* Girl Mascot (Siswi SMP Berjilbab/Kuncir BUMA) with Waving Arm Animation */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl p-2 border border-slate-700/80">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-rose-200 to-rose-300 border-2 border-white shadow-xs flex items-center justify-center overflow-hidden">
                {/* Hijab / Hair */}
                <div className="absolute inset-0 bg-sky-100 rounded-full border-2 border-sky-300" />
                {/* Face */}
                <div className="relative z-10 w-7 h-7 bg-amber-100 rounded-full flex flex-col items-center justify-center shadow-xs">
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                  <div className="w-2.5 h-1 border-b-2 border-rose-500 rounded-full mt-0.5" />
                </div>
                {/* Waving Hand Badge */}
                <div className="absolute -bottom-1 -right-1 text-xs animate-osis-wave select-none" title="Melambai">
                  👋
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black font-fredoka text-emerald-300">
                  Kader Putri SMP
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  Pelajar Berprestasi
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Animated Voting Ballot Box & Interactive Action */}
        <div className="md:col-span-3 flex flex-col items-center justify-center">
          <div 
            onClick={triggerBallotDrop}
            className="group cursor-pointer flex flex-col items-center bg-slate-800/90 hover:bg-slate-800 p-3 rounded-2xl border-2 border-blue-400 shadow-comic-sm transition-all hover:scale-105 active:scale-95"
            title="Klik untuk simulasi memasukkan surat suara ke kotak OSIS!"
          >
            {/* Floating Ballot Paper entering the slot */}
            <div className="relative w-12 h-6 mb-1">
              <div className="absolute inset-x-2 top-0 h-7 bg-white rounded-t-md border-2 border-slate-900 shadow-xs flex flex-col items-center justify-center animate-osis-ballot">
                <span className="text-[7px] font-black font-fredoka text-red-600">01 / 02</span>
                <span className="w-4 h-0.5 bg-slate-300" />
              </div>
            </div>

            {/* Official Blue Ballot Box */}
            <div className="relative w-16 h-14 bg-gradient-to-b from-blue-600 to-blue-800 rounded-xl border-3 border-slate-900 shadow-comic-xs flex flex-col items-center justify-between p-1.5">
              {/* Ballot Box Slot */}
              <div className="w-9 h-1.5 bg-slate-950 rounded-full border border-blue-400" />
              
              {/* White VOTE Seal */}
              <div className="px-2 py-0.5 bg-white text-blue-900 rounded font-black font-fredoka text-[9px] border border-slate-900 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-700" />
                <span>KOTAK</span>
              </div>

              {/* Padlock icon */}
              <div className="w-2 h-2 rounded-full bg-amber-400 border border-slate-950" />
            </div>

            <div className="mt-2 text-center">
              <span className="text-[10px] font-black font-fredoka text-amber-300 group-hover:text-amber-200">
                Uji Coba Kotak Suara
              </span>
              <div className="text-[9px] text-slate-300">
                Suara Rahasia & Sah
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom democratic school motto strip */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-bold text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-fredoka">Masa Bakti OSIS 2026/2027</span>
          <span className="text-slate-400">· SMPN 01 Bunga Mayang</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300 font-fredoka">
          <span>✨ Disiplin</span>
          <span>·</span>
          <span>Kreatif</span>
          <span>·</span>
          <span>Solidaritas</span>
        </div>
      </div>
    </div>
  );
};
