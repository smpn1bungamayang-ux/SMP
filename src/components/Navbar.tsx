import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SCHOOL_LOGO } from '../data/initialData';
import { useElection } from '../context/ElectionContext';
import { PitaMerahPutihHeader } from './CampaignStickers';
import { sound } from '../utils/audio';
import { 
  Vote, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Cloud,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
import { useAudioState } from '../hooks/useAudioState';

export type ActiveTab = 'voting' | 'candidates' | 'quickcount' | 'quiz' | 'admin' | 'drive';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSchoolProfile: () => void;
  onOpenAudioSettings?: () => void;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  activeBg: string;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'voting',
    label: 'Bilik Suara',
    icon: Vote,
    iconClass: 'text-amber-300',
    activeBg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
  },
  {
    id: 'candidates',
    label: 'Profil Paslon',
    icon: Users,
    iconClass: 'text-amber-300',
    activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
  },
  {
    id: 'quickcount',
    label: 'Hasil Suara (Live)',
    icon: BarChart3,
    iconClass: 'text-lime-300',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
    badge: 'LIVE',
  },
  {
    id: 'quiz',
    label: 'Kuis Cerdas',
    icon: Sparkles,
    iconClass: 'text-slate-950 fill-amber-300',
    activeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950',
  },
  {
    id: 'admin',
    label: 'Panel Panitia',
    icon: ShieldCheck,
    iconClass: 'text-amber-400',
    activeBg: 'bg-slate-900 text-white',
  },
  {
    id: 'drive',
    label: 'Arsip Drive',
    icon: Cloud,
    iconClass: 'text-white',
    activeBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
  },
];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenSchoolProfile,
  onOpenAudioSettings
}) => {
  const { currentVoter, logoutVoter, adminAuthenticated } = useElection();
  const audioState = useAudioState();

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mobileCanScrollLeft, setMobileCanScrollLeft] = useState(false);
  const [mobileCanScrollRight, setMobileCanScrollRight] = useState(false);

  // Check scroll positions for desktop & mobile nav
  const checkDesktopScroll = useCallback(() => {
    const el = desktopNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  const checkMobileScroll = useCallback(() => {
    const el = mobileNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setMobileCanScrollLeft(scrollLeft > 6);
    setMobileCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  // Set up listeners for resize & scroll
  useEffect(() => {
    checkDesktopScroll();
    checkMobileScroll();

    const handleResize = () => {
      checkDesktopScroll();
      checkMobileScroll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkDesktopScroll, checkMobileScroll]);

  // Auto-scroll active tab into center view
  useEffect(() => {
    if (desktopNavRef.current) {
      const activeEl = desktopNavRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    if (mobileNavRef.current) {
      const activeEl = mobileNavRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  const handleTabClick = (tab: ActiveTab) => {
    sound.playPop();
    setActiveTab(tab);
  };

  const handleScrollClick = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    sound.playPop();
    if (!ref.current) return;
    const distance = direction === 'left' ? -220 : 220;
    ref.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Indonesian Red-and-White flowing Ribbon Bar */}
      <PitaMerahPutihHeader />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
          
          {/* Zone 1: Single text element wordmark / brand with school badge */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenSchoolProfile();
            }}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-left group hover:opacity-95 transition-opacity"
            title="Klik untuk melihat Profil Resmi SMPN 01 Bunga Mayang"
          >
            <img
              src={SCHOOL_LOGO}
              alt="Logo SMPN 01 Bunga Mayang"
              className="w-9 h-10 sm:w-10 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-xs sm:text-base font-black tracking-tight text-slate-900 leading-tight whitespace-nowrap font-fredoka flex items-center gap-1.5 sm:gap-2">
                <span>SMPN 01 BUNGA MAYANG</span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-red-600 text-white font-righteous text-[10px] rounded-full uppercase shadow-xs">
                  PILKETOS
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Tunas Peracak, OKU Timur · 10 Nov 2026
              </div>
            </div>
          </button>

          {/* Zone 2: Scrollable Navigation Bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 items-center relative max-w-2xl min-w-0 mx-2 group/nav">
            
            {/* Left Scroll Chevron Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScrollClick(desktopNavRef, 'left')}
                className="absolute left-0 z-30 p-1.5 bg-white text-slate-900 rounded-full border-2 border-slate-900 shadow-comic-sm hover:bg-amber-100 hover:scale-110 active:scale-95 transition-all cursor-pointer -translate-x-2"
                title="Geser menu ke kiri"
                aria-label="Geser menu ke kiri"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>
            )}

            {/* Left Fade Mask */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
            )}

            {/* Scrollable Nav Container */}
            <nav
              ref={desktopNavRef}
              onScroll={checkDesktopScroll}
              className="flex items-center gap-1.5 sm:gap-2 text-sm font-semibold overflow-x-auto scroll-smooth py-1 px-1.5 no-scrollbar w-full"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? `${item.activeBg} font-black font-fredoka border-2 border-slate-900 shadow-comic-sm scale-102 ring-2 ring-amber-300`
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold border-2 border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? item.iconClass : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-black rounded-md animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Fade Mask */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
            )}

            {/* Right Scroll Chevron Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScrollClick(desktopNavRef, 'right')}
                className="absolute right-0 z-30 p-1.5 bg-white text-slate-900 rounded-full border-2 border-slate-900 shadow-comic-sm hover:bg-amber-100 hover:scale-110 active:scale-95 transition-all cursor-pointer translate-x-2"
                title="Geser menu ke kanan"
                aria-label="Geser menu ke kanan"
              >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Zone 3: Primary Action / Status Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {currentVoter ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-black font-fredoka text-slate-900 truncate max-w-[130px]">
                    {currentVoter.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-black">
                    {currentVoter.classOrDept} · Siap
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playPop();
                    logoutVoter();
                  }}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border-2 border-slate-900 shadow-comic-sm transition-all whitespace-nowrap"
                >
                  Keluar Bilik
                </button>
              </div>
            ) : adminAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-block text-xs font-black text-amber-900 bg-amber-200 border-2 border-slate-900 shadow-comic-sm px-3 py-1 rounded-full">
                  Panitia Aktif
                </span>
                <button
                  onClick={() => handleTabClick('admin')}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black font-fredoka text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-2 border-slate-900 shadow-comic-sm transition-colors whitespace-nowrap"
                >
                  Kelola Pemilu
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-800 px-3 py-1.5 bg-amber-100 border-2 border-slate-900 rounded-xl font-black shadow-comic-sm">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-mono tabular-nums">10 Nov 2026</span>
                </div>
                <button
                  onClick={() => handleTabClick('voting')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black font-fredoka text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 rounded-xl border-2 border-slate-900 shadow-comic-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                >
                  <Vote className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Coblos</span>
                </button>
              </div>
            )}

            {/* Audio Settings Launcher Button */}
            {onOpenAudioSettings && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onOpenAudioSettings();
                }}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl border-2 border-slate-900 shadow-comic-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  audioState.isPlayingBgm 
                    ? 'bg-amber-300 text-slate-950 ring-2 ring-amber-400' 
                    : audioState.globalMuted 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
                title="Atur Volume & Musik Latar Ceria"
              >
                {audioState.globalMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-900" />
                )}
                <div className="hidden sm:flex items-end gap-0.5 h-3.5 w-4">
                  <span className={`w-1 bg-blue-700 rounded-t-xs transition-all ${
                    audioState.isPlayingBgm ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
                  }`} />
                  <span className={`w-1 bg-rose-600 rounded-t-xs transition-all ${
                    audioState.isPlayingBgm ? 'h-2.5 animate-bounce' : 'h-1 opacity-40'
                  }`} />
                  <span className={`w-1 bg-amber-600 rounded-t-xs transition-all ${
                    audioState.isPlayingBgm ? 'h-3 animate-pulse' : 'h-1 opacity-40'
                  }`} />
                </div>
                <span className="hidden xl:inline text-xs font-black font-fredoka text-slate-900">
                  Audio
                </span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Scrollable Navigation Bar with Edge Indicators & Chevrons */}
        <div className="md:hidden relative border-t border-slate-200 py-1.5 flex items-center">
          
          {/* Mobile Left Chevron Button */}
          {mobileCanScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollClick(mobileNavRef, 'left')}
              className="absolute left-1 z-30 p-1 bg-white text-slate-900 rounded-full border-2 border-slate-900 shadow-comic-sm active:scale-90"
              aria-label="Geser ke kiri"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}

          {/* Left Fade Gradient */}
          {mobileCanScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
          )}

          <div
            ref={mobileNavRef}
            onScroll={checkMobileScroll}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-2 no-scrollbar w-full"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  data-nav-id={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs font-fredoka ${
                    isActive
                      ? `${item.activeBg} font-black border-2 border-slate-900 shadow-comic-sm ring-2 ring-amber-300`
                      : 'text-slate-700 font-bold bg-white/70 hover:bg-white border-2 border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.iconClass : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Fade Gradient */}
          {mobileCanScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
          )}

          {/* Mobile Right Chevron Button */}
          {mobileCanScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollClick(mobileNavRef, 'right')}
              className="absolute right-1 z-30 p-1 bg-white text-slate-900 rounded-full border-2 border-slate-900 shadow-comic-sm active:scale-90"
              aria-label="Geser ke kanan"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

