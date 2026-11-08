import React from 'react';
import { sound } from '../utils/audio';
import { useAudioState } from '../hooks/useAudioState';
import { Volume2, VolumeX, Music, Play, Pause, Sliders } from 'lucide-react';

interface AudioControlWidgetProps {
  onOpenSettings: () => void;
}

export const AudioControlWidget: React.FC<AudioControlWidgetProps> = ({ onOpenSettings }) => {
  const audioState = useAudioState();

  const handleToggleBgm = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    sound.toggleBgm();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    sound.toggleGlobalMute();
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 select-none no-print">
      
      {/* Quick Audio Pill */}
      <div 
        onClick={() => {
          sound.playPop();
          onOpenSettings();
        }}
        className="group flex items-center gap-2 px-3 py-2 bg-white/95 hover:bg-white text-slate-900 rounded-2xl border-3 border-slate-900 shadow-comic-md hover:shadow-comic-lg transition-all cursor-pointer backdrop-blur-md"
        title="Klik untuk membuka Pengaturan Volume & Musik"
      >
        {/* Play / Pause Toggle inside pill */}
        <button
          type="button"
          onClick={handleToggleBgm}
          className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 border-slate-900 transition-transform active:scale-90 ${
            audioState.isPlayingBgm 
              ? 'bg-amber-400 text-slate-950 shadow-comic-xs' 
              : 'bg-blue-600 text-white'
          }`}
          title={audioState.isPlayingBgm ? 'Jeda Musik Latar' : 'Putar Musik Latar Ceria'}
        >
          {audioState.isPlayingBgm ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Animated Equalizer Wave Bars when playing */}
        <div className="flex items-end gap-0.5 h-4 w-5">
          <span className={`w-1 bg-blue-600 rounded-t-xs transition-all ${
            audioState.isPlayingBgm ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'
          }`} />
          <span className={`w-1 bg-rose-500 rounded-t-xs transition-all ${
            audioState.isPlayingBgm ? 'h-3 animate-bounce' : 'h-1.5 opacity-40'
          }`} />
          <span className={`w-1 bg-amber-400 rounded-t-xs transition-all ${
            audioState.isPlayingBgm ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'
          }`} />
        </div>

        {/* Status text on larger screens */}
        <div className="hidden sm:block text-left">
          <div className="text-[11px] font-black font-fredoka text-slate-900 leading-tight">
            {audioState.globalMuted ? 'Muted' : audioState.isPlayingBgm ? 'Musik Ceria' : 'Audio On'}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">
            BGM: {Math.round(audioState.bgmVolume * 100)}% · SFX: {Math.round(audioState.sfxVolume * 100)}%
          </div>
        </div>

        {/* Settings Sliders Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenSettings();
          }}
          className="p-1 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
          title="Atur Volume & Lagu"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Quick Mute/Unmute Button */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-1 rounded-lg transition-colors ${
            audioState.globalMuted 
              ? 'text-rose-600 hover:bg-rose-50' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={audioState.globalMuted ? 'Nyalakan Audio' : 'Bisukan Semua'}
        >
          {audioState.globalMuted ? (
            <VolumeX className="w-4 h-4 text-rose-600" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

      </div>

    </div>
  );
};
