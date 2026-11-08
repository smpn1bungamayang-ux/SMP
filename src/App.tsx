import React, { useState } from 'react';
import { ElectionProvider, useElection } from './context/ElectionContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { VotingBooth } from './components/VotingBooth';
import { CandidatesView } from './components/CandidatesView';
import { LiveCount } from './components/LiveCount';
import { VoterQuiz } from './components/VoterQuiz';
import { AdminPanel } from './components/AdminPanel';
import { OfficialReportModal } from './components/OfficialReportModal';
import { SchoolProfileModal } from './components/SchoolProfileModal';
import { GoogleDriveHub } from './components/GoogleDriveHub';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { AudioControlWidget } from './components/AudioControlWidget';
import { SCHOOL_LOGO } from './data/initialData';
import { ShieldCheck, Heart, Award, Calendar, MapPin, Sparkles, Info } from 'lucide-react';

function ElectionAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('voting');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const { settings, loginVoter } = useElection();

  const handleGoToVoting = (candidateId?: string) => {
    setActiveTab('voting');
  };

  return (
    <div className="min-h-screen bg-festive-mesh bg-confetti-pattern text-slate-900 flex flex-col font-sans selection:bg-rose-600 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Colorful Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Golden Sun Glow Top-Left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-300/30 blur-3xl" />
        {/* Emerald Lime Glow Top-Right */}
        <div className="absolute top-12 -right-24 w-96 h-96 rounded-full bg-emerald-400/25 blur-3xl" />
        {/* Sky Blue Glow Center-Left */}
        <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
        {/* Patriotic Rose Red Glow Bottom-Right */}
        <div className="absolute bottom-10 -right-20 w-[420px] h-[420px] rounded-full bg-rose-400/25 blur-3xl" />
      </div>

      {/* Official Top Bar */}
      <div className="relative z-40">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenSchoolProfile={() => setShowProfileModal(true)} 
          onOpenAudioSettings={() => setShowAudioModal(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'voting' && (
          <VotingBooth onGoToCandidates={() => setActiveTab('candidates')} />
        )}

        {activeTab === 'candidates' && (
          <CandidatesView onGoToVoting={handleGoToVoting} />
        )}

        {activeTab === 'quickcount' && (
          <LiveCount onOpenReport={() => setShowReportModal(true)} />
        )}

        {activeTab === 'quiz' && (
          <VoterQuiz onGoToVoting={handleGoToVoting} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            onOpenReport={() => setShowReportModal(true)} 
            onGoToDrive={() => setActiveTab('drive')}
          />
        )}

        {activeTab === 'drive' && (
          <GoogleDriveHub onOpenReport={() => setShowReportModal(true)} />
        )}
      </main>

      {/* Floating Audio Control Widget */}
      <AudioControlWidget onOpenSettings={() => setShowAudioModal(true)} />

      {/* Audio Settings Modal */}
      {showAudioModal && (
        <AudioSettingsModal onClose={() => setShowAudioModal(false)} />
      )}

      {/* Printable Berita Acara Modal */}
      {showReportModal && (
        <OfficialReportModal onClose={() => setShowReportModal(false)} />
      )}

      {/* Official School Profile Modal */}
      {showProfileModal && (
        <SchoolProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {/* Footer */}
      <footer className="no-print bg-white/95 backdrop-blur-md border-t-4 border-slate-900 mt-12 py-8 relative z-20 shadow-lg">
        {/* Cheerful Rainbow Accent Bar on Footer Top */}
        <div className="absolute -top-1 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 via-emerald-500 via-blue-600 to-rose-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 text-left group hover:opacity-95 transition-opacity"
              title="Klik untuk membuka Profil Lengkap SMPN 01 Bunga Mayang"
            >
              <img
                src={SCHOOL_LOGO}
                alt="Logo Sekolah"
                className="w-12 h-13 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-sm font-black font-fredoka text-slate-900 flex items-center gap-2">
                  <span>SMP NEGERI 01 BUNGA MAYANG</span>
                  <span className="text-[10px] text-white bg-blue-700 px-2 py-0.5 rounded-full font-bold shadow-2xs">
                    Profil Sekolah
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Desa Tunas Peracak, Kab. OKU Timur, Sumatera Selatan · PILKETOS 2026/2027
                </div>
              </div>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-700 font-bold">
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-full border border-blue-200">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>10 November 2026 (Hari Pahlawan)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-red-50 text-red-900 px-3 py-1.5 rounded-full border border-red-200">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>TPS Digital Spensa Bunga Mayang</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Asas LUBER & JURDIL</span>
              </span>
            </div>

            {/* Interactive Audio Tester */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  import('./utils/audio').then(({ sound }) => sound.playCoblos());
                }}
                className="px-3.5 py-1.5 text-xs font-black font-fredoka text-slate-900 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 rounded-xl transition-all flex items-center gap-1.5 shadow-comic-sm hover:scale-105 active:scale-95 select-none"
                title="Dengarkan efek suara paku coblos"
              >
                <span>🔨</span>
                <span>Tes Suara Coblos!</span>
              </button>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ElectionProvider>
      <ElectionAppContent />
    </ElectionProvider>
  );
}
