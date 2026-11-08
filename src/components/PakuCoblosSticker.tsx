import React from 'react';
import { sound } from '../utils/audio';

interface PakuCoblosStickerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  onClick?: () => void;
}

export const PakuCoblosSticker: React.FC<PakuCoblosStickerProps> = ({
  className = '',
  size = 'md',
  label = 'COBLOS!',
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playCoblos();
    if (onClick) onClick();
  };

  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  return (
    <div 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Paku Pencoblosan Resmi - Klik untuk dengar suara coblos!"
      className={`relative inline-block cursor-pointer select-none transition-transform duration-200 hover:scale-110 active:scale-95 group ${scale} ${className}`}
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        
        {/* Explosion Starburst Spark (Comic Strike Style from Poster) */}
        <div className="absolute inset-0 flex items-center justify-center animate-spark">
          <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
            {/* Outer red starburst */}
            <polygon
              points="50,2 62,32 94,15 76,44 100,60 69,67 78,98 50,78 22,98 31,67 0,60 24,44 6,15 38,32"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner fiery yellow starburst */}
            <polygon
              points="50,15 58,35 80,24 68,46 86,58 64,63 70,84 50,70 30,84 36,63 14,58 32,46 20,24 42,35"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Cartoon Nail / Paku Piercing the Spark */}
        <div className="absolute -top-3 -right-2 w-20 h-20 pointer-events-none transform -rotate-45 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-lg">
            {/* Nail head */}
            <ellipse cx="64" cy="16" rx="9" ry="4" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
            <ellipse cx="64" cy="15" rx="7" ry="2.5" fill="#e2e8f0" />
            
            {/* Nail shaft */}
            <path
              d="M62 18 L26 56 L20 66 L28 62 L66 22 Z"
              fill="#cbd5e1"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Metallic highlight */}
            <line x1="60" y1="21" x2="26" y2="57" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            {/* Nail sharp tip */}
            <polygon points="20,66 25,60 21,57" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Action Label Badge */}
        {label && (
          <div className="absolute -bottom-1 -left-1 bg-amber-400 text-slate-950 font-black font-fredoka text-[11px] px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-sm tracking-wide transform -rotate-6 uppercase">
            {label}
          </div>
        )}

      </div>
    </div>
  );
};
