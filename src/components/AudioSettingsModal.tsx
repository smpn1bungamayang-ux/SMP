import React from 'react';
import { sound, BGM_TRACKS, BgmTrackId } from '../utils/audio';
import { useAudioState } from '../hooks/useAudioState';
import { 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  X, 
  Check, 
  Radio, 
  Vote, 
  Award,
  Bell,
  Volume
} from 'lucide-react';

interface AudioSettingsModalProps {
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ onClose }) => {
  const audioState = useAudioState();

  const handleBgmToggle = () => {
    sound.playPop();
    sound.toggleBgm();
  };

  const handleTrackSelect = (trackId: BgmTrackId) => {
    sound.playPop();
    sound.setBgmTrack(trackId);
    if (!audioState.isPlayingBgm) {
      sound.startBgm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-comic-lg border-4 border-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 border-2 border-slate-900 flex items-center justify-center shadow-comic-sm font-black">
              <Music className={`w-5 h-5 ${audioState.isPlayingBgm ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-fredoka tracking-tight text-white leading-tight">
                Pengaturan Suara & Musik
              </h2>
              <p className="text-[11px] text-amber-200 font-bold">
                Backsound Ceria & Efek Suara PILKETOS 2026/2027
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-1.5 text-white/80 hover:text-white rounded-xl bg-black/20 hover:bg-black/30 transition-colors border border-white/20"
            title="Tutup pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-slate-800">

          {/* Master Global Mute Switch */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3.5 border-3 border-slate-900 shadow-comic-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border-2 border-slate-900 ${
                audioState.globalMuted ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {audioState.globalMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-800" />
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black font-fredoka text-slate-900">
                  {audioState.globalMuted ? 'Seluruh Audio Dibisukan' : 'Audio Aktif'}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {audioState.globalMuted ? 'Klik tombol untuk mengaktifkan kembali' : 'Matikan semua musik & efek secara instan'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                sound.toggleGlobalMute();
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 font-black font-fredoka text-xs transition-all shadow-comic-xs cursor-pointer ${
                audioState.globalMuted 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {audioState.globalMuted ? 'Nyalakan' : 'Bisukan'}
            </button>
          </div>

          {/* SECTION 1: MUSIK LATAR CERIA (BGM) */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-3 border-slate-900 shadow-comic-sm space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <h3 className="text-sm font-black font-fredoka text-slate-900 uppercase tracking-wide">
                  1. Musik Latar Ceria (Backsound)
                </h3>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={handleBgmToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-slate-900 font-black font-fredoka text-xs transition-all shadow-comic-xs cursor-pointer ${
                  audioState.isPlayingBgm 
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 scale-102' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {audioState.isPlayingBgm ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Jeda Musik</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Putar Musik</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Visualizer Bar Indicator */}
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-slate-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1 h-5 w-8">
                  <span 
                    className={`w-1.5 bg-blue-600 rounded-t-xs transition-all duration-150 ${
                      audioState.isPlayingBgm ? 'h-5 animate-pulse' : 'h-1.5 opacity-40'
                    }`} 
                  />
                  <span 
                    className={`w-1.5 bg-rose-500 rounded-t-xs transition-all duration-150 ${
                      audioState.isPlayingBgm ? 'h-3.5 animate-bounce' : 'h-1.5 opacity-40'
                    }`} 
                  />
                  <span 
                    className={`w-1.5 bg-amber-400 rounded-t-xs transition-all duration-150 ${
                      audioState.isPlayingBgm ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'
                    }`} 
                  />
                  <span 
                    className={`w-1.5 bg-emerald-500 rounded-t-xs transition-all duration-150 ${
                      audioState.isPlayingBgm ? 'h-2 animate-bounce' : 'h-1.5 opacity-40'
                    }`} 
                  />
                </div>
                <div>
                  <div className="text-xs font-black font-fredoka text-slate-900">
                    {audioState.isPlayingBgm ? 'Sedang Diputar' : 'Musik Dijeda'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {audioState.isPlayingBgm 
                      ? 'Synthesizer instrumen ceria aktif tanpa jeda' 
                      : 'Klik "Putar Musik" untuk menyemarakkan suasana'}
                  </div>
                </div>
              </div>

              {/* Quick Mute BGM */}
              <button
                onClick={() => {
                  sound.playPop();
                  sound.toggleBgmMute();
                }}
                className={`p-1.5 rounded-lg border-2 border-slate-900 text-xs font-bold transition-colors ${
                  audioState.bgmMuted ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={audioState.bgmMuted ? 'Nyalakan backsound' : 'Bisukan backsound'}
              >
                {audioState.bgmMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* BGM Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-black font-fredoka text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume1 className="w-4 h-4 text-blue-600" />
                  <span>Volume Musik Latar:</span>
                </span>
                <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
                  {Math.round(audioState.bgmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(audioState.bgmVolume * 100)}
                onChange={(e) => sound.setBgmVolume(Number(e.target.value) / 100)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-hidden"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>0% (Hening)</span>
                <span>50%</span>
                <span>100% (Maksimal)</span>
              </div>
            </div>

            {/* Track Switcher */}
            <div>
              <div className="text-xs font-black font-fredoka text-slate-700 mb-2 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Nada & Lagu Ceria:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {BGM_TRACKS.map((track) => {
                  const isSelected = audioState.currentTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackSelect(track.id)}
                      className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 shadow-comic-xs ring-2 ring-blue-300'
                          : 'bg-white border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSelected ? '▶' : '♫'}
                        </div>
                        <div>
                          <div className="text-xs font-black font-fredoka text-slate-900 flex items-center gap-1.5">
                            <span>{track.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">
                              {track.mood}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {track.subtitle} ({track.bpm} BPM)
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* SECTION 2: EFEK SUARA INTERAKTIF (SFX) */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-3 border-slate-900 shadow-comic-sm space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
                <h3 className="text-sm font-black font-fredoka text-slate-900 uppercase tracking-wide">
                  2. Efek Suara Interaktif (SFX)
                </h3>
              </div>

              {/* Mute/Unmute SFX */}
              <button
                onClick={() => {
                  sound.playPop();
                  sound.toggleSfxMute();
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 font-black font-fredoka text-xs transition-all shadow-comic-xs cursor-pointer ${
                  audioState.sfxMuted 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
              >
                {audioState.sfxMuted ? 'SFX Nonaktif' : 'SFX Aktif ✓'}
              </button>
            </div>

            {/* SFX Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-black font-fredoka text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Volume Efek Suara:</span>
                </span>
                <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  {Math.round(audioState.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(audioState.sfxVolume * 100)}
                onChange={(e) => sound.setSfxVolume(Number(e.target.value) / 100)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>0% (Hening)</span>
                <span>50%</span>
                <span>100% (Maksimal)</span>
              </div>
            </div>

            {/* Sound Effects Preview Test Playground */}
            <div>
              <div className="text-xs font-black font-fredoka text-slate-700 mb-2">
                Uji Coba Efek Suara Langsung:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => sound.playCoblos()}
                  className="p-2 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Vote className="w-3.5 h-3.5 text-red-600" />
                  <span>Paku Coblos</span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.playCelebrationFanfare()}
                  className="p-2 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fanfare</span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.playBallotDrop()}
                  className="p-2 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kotak Suara</span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.playSparkle()}
                  className="p-2 bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sparkle</span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.playPop()}
                  className="p-2 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>🫧 Bubble Pop</span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.playSuccess()}
                  className="p-2 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-xl border-2 border-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 shadow-comic-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sukses</span>
                </button>

              </div>
            </div>

          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-[11px] text-amber-900 font-medium">
            💡 <strong>Info:</strong> Pengaturan volume otomatis tersimpan di peramban dan berlaku di seluruh menu Bilik Suara, Profil Paslon, Hasil Suara, dan Kuis Cerdas.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t-2 border-slate-300 flex justify-end">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black font-fredoka text-xs uppercase tracking-wide rounded-xl border-2 border-slate-900 shadow-comic-sm transition-all"
          >
            Tutup & Simpan
          </button>
        </div>

      </div>
    </div>
  );
};
