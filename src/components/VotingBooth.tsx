import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Candidate } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { PakuCoblosSticker } from './PakuCoblosSticker';
import { 
  JanganGolputSticker, 
  SatuGerakanSticker, 
  OneVoteBanner, 
  PitaMerahPutihHeader, 
  BallotNumberBadge 
} from './CampaignStickers';
import { OsisSmpAnimation } from './OsisSmpAnimation';
import { 
  Vote, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint, 
  Printer, 
  Info, 
  ArrowRight, 
  Sparkles,
  HelpCircle,
  Eye,
  FileText,
  Volume2
} from 'lucide-react';

interface VotingBoothProps {
  onGoToCandidates: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({ onGoToCandidates }) => {
  const { 
    candidates, 
    voters,
    settings, 
    currentVoter, 
    lastVoteReceipt, 
    loginVoter, 
    castVote, 
    clearLastReceipt
  } = useElection();

  const [nisnOrToken, setNisnOrToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewingCandidate, setPreviewingCandidate] = useState<Candidate | null>(null);
  const [inkDipped, setInkDipped] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    sound.playClick();
    const result = loginVoter(nisnOrToken);
    if (!result.success) {
      sound.playError();
      setAuthError(result.message);
    } else {
      sound.playSuccess();
      setNisnOrToken('');
    }
  };

  const handleSelectToVote = (candidate: Candidate) => {
    sound.playCoblos();
    setSelectedCandidate(candidate);
    setIsConfirming(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    sound.playCoblos();

    try {
      await castVote(selectedCandidate.id);
      setIsConfirming(false);
      setSelectedCandidate(null);
      setInkDipped(true);

      // Play joyful fanfare
      sound.playCelebrationFanfare();

      // Trigger Fireworks Confetti
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 } });
      }, 250);

    } catch {
      sound.playError();
      alert('Terjadi kesalahan saat menyimpan suara.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDipInk = () => {
    sound.playInkDip();
    setInkDipped(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#7c3aed', '#6d28d9', '#4c1d95', '#c084fc']
    });
  };

  // 1. Success Receipt Screen (After Voting)
  if (lastVoteReceipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Indonesian Flag Ribbon Accent */}
        <div className="rounded-t-2xl overflow-hidden shadow-sm">
          <PitaMerahPutihHeader />
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-b-2xl shadow-md overflow-hidden p-6 sm:p-8 text-center relative">
          
          {/* Fun Campaign Stickers */}
          <div className="absolute top-4 left-4 hidden sm:block">
            <JanganGolputSticker />
          </div>
          <div className="absolute top-4 right-4 hidden sm:block">
            <SatuGerakanSticker />
          </div>

          {/* Success Banner */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 tracking-tight">
            Suara Anda Berhasil Masuk ke Kotak Suara!
          </h2>
          <p className="text-slate-600 text-sm mt-1.5 max-w-lg mx-auto font-medium">
            Terima kasih telah menggunakan hak pilih secara bijak, jujur, dan bertanggung jawab dalam rangka PILKETOS SMP Negeri 01 Bunga Mayang Periode 2026/2027.
          </p>

          <div className="my-3">
            <OneVoteBanner />
          </div>

          {/* Interactive Digital Ink Dip */}
          <div 
            onClick={handleDipInk}
            role="button"
            tabIndex={0}
            className="my-6 p-4 bg-purple-50/70 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl max-w-md mx-auto text-center cursor-pointer transition-all hover:scale-102 select-none shadow-xs"
            title="Klik untuk celup jari ke tinta pemilu digital"
          >
            <div className="text-xs font-black font-fredoka text-purple-900 uppercase tracking-wider mb-2">
              Tanda Tinta Digital Pemilu (LUBER JURDIL) — Klik Untuk Celup!
            </div>
            <div className="flex items-center justify-center gap-3">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all transform ${
                  inkDipped 
                    ? 'bg-purple-900 border-purple-950 text-white shadow-lg scale-110' 
                    : 'bg-purple-100 border-purple-300 text-purple-600 hover:scale-105'
                }`}
              >
                <Fingerprint className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black font-fredoka text-purple-950">
                  {inkDipped ? 'Jari Bertinta Ungu Sah ✓' : 'Celupkan Jarimu Sekarang!'}
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  Bukti resmi partisipasi demokrasi Spensa Bunga Mayang
                </div>
              </div>
            </div>
          </div>

          {/* Printable Digital Certificate / Receipt */}
          <div id="print-receipt" className="border-2 border-slate-300 rounded-xl p-5 bg-amber-50/20 text-left max-w-lg mx-auto shadow-xs relative">
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-center">
              <div className="text-xs font-black font-righteous text-slate-900 tracking-wider">
                SMP NEGERI 01 BUNGA MAYANG
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                BUKTI ELEKTRONIK PENGGUNAAN HAK SUARA PILKETOS
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Hari Pahlawan · 10 November 2026
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Pemilih:</span>
                <span className="font-bold text-slate-900">{lastVoteReceipt.voter.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Kelas / Peran:</span>
                <span className="font-semibold text-slate-900">{lastVoteReceipt.voter.classOrDept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nomor Induk / NISN:</span>
                <span className="font-mono font-bold text-slate-800">{lastVoteReceipt.voter.nisn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Waktu Pencoblosan:</span>
                <span className="font-mono text-slate-800">
                  {new Date(lastVoteReceipt.timestamp).toLocaleTimeString('id-ID')} WIB
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-bold">Kode Verifikasi:</span>
                <span className="font-mono font-black text-blue-800 text-sm">{lastVoteReceipt.receiptCode}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 italic">
              Pilihan calon bersifat RAHASIA (Asas LUBER). Kode di atas memverifikasi keabsahan suara pemilih.
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                sound.playPop();
                window.print();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Bukti Memilih</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                clearLastReceipt();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black font-fredoka uppercase text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <span>Pemilih Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. Login / Verification Screen (Not Logged In)
  if (!currentVoter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Animasi Resmi OSIS SMP: Lambang Shield Beranimasi, Maskot Siswa, & Kotak Suara Interaktif */}
        <div className="mb-6">
          <OsisSmpAnimation />
        </div>

        {/* Indonesian Flag Ribbon Accent */}
        <div className="rounded-t-3xl overflow-hidden shadow-sm">
          <PitaMerahPutihHeader />
        </div>

        {/* Banner KPO with energetic patriotic gradient */}
        <div className="bg-gradient-to-r from-red-600 via-indigo-900 to-blue-700 text-white p-6 sm:p-9 shadow-comic-md border-4 border-b-0 border-slate-900 relative overflow-hidden">
          {/* Subtle decorative background stars */}
          <div className="absolute top-2 left-6 text-amber-300 opacity-40 select-none text-3xl animate-pulse">★</div>
          <div className="absolute bottom-3 right-8 text-yellow-300 opacity-40 select-none text-4xl animate-pulse">★</div>
          <div className="absolute top-1/2 right-1/4 text-emerald-300 opacity-25 select-none text-2xl">✨</div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <JanganGolputSticker />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black font-fredoka shadow-comic-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>e-Voting Resmi Terverifikasi</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-fredoka tracking-tight text-white drop-shadow-md">
              Bilik Suara PILKETOS 2026/2027
            </h1>
            <p className="text-sm font-bold text-amber-300 mt-2 font-righteous tracking-wide drop-shadow-xs">
              SMP Negeri 01 Bunga Mayang · Selasa, 10 November 2026
            </p>
            <p className="text-xs text-blue-100 mt-1 max-w-lg mx-auto font-medium">
              "Gunakan hak suaramu dengan cerdas, jujur, dan berintegritas demi masa depan sekolah kita tercinta."
            </p>

            <div className="mt-4">
              <OneVoteBanner />
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-gradient-to-b from-white via-amber-50/50 to-orange-50/60 border-4 border-slate-900 rounded-b-3xl p-6 sm:p-8 shadow-comic-lg max-w-xl mx-auto relative">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 border-2 border-blue-400 rounded-full text-xs font-black font-fredoka uppercase mb-2">
              Langkah 1: Verifikasi Identitas
            </div>
            <h2 className="text-xl font-black font-fredoka text-slate-900">
              Verifikasi Kehadiran Pemilih
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Masukkan <strong>NISN Siswa / NIP Guru / ID Tendik</strong> atau <strong>Token Akses</strong> yang diberikan oleh Panitia KPPS
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 bg-red-100 border-3 border-red-500 rounded-2xl flex items-start gap-2.5 text-xs text-red-900 font-bold shadow-comic-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="nisn" className="block text-xs font-black font-fredoka text-slate-800 mb-1.5 uppercase tracking-wide">
                NISN / NIP / ID Tendik / Token Akses
              </label>
              <input
                id="nisn"
                type="text"
                value={nisnOrToken}
                onChange={(e) => setNisnOrToken(e.target.value)}
                placeholder="Contoh: 01124501, 197511192008012005, TK-01, atau BM-385"
                className="w-full px-4 py-3.5 bg-white border-3 border-slate-900 rounded-2xl text-sm focus:outline-hidden focus:ring-4 focus:ring-amber-300 font-mono font-bold uppercase transition-all shadow-comic-sm"
                autoFocus
              />
            </div>

            <button
              type="submit"
              onClick={() => sound.playPop()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-98 text-white font-black font-fredoka text-sm uppercase tracking-wide rounded-2xl border-3 border-slate-900 transition-all flex items-center justify-center gap-2 shadow-comic-md hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Vote className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Masuk Bilik Suara Sekarang</span>
            </button>
          </form>

          {/* Quick Helper */}
          <div className="mt-5 p-3.5 bg-amber-100/70 border-2 border-amber-300 rounded-2xl text-center text-xs text-amber-950 font-bold shadow-2xs">
            Daftar DPT mencakup {voters.length} pemilih resmi (359 Siswa Kelas VII-IX, 25 Dewan Guru & 10 Tenaga Kependidikan SMPN 01 Bunga Mayang).
          </div>

          {/* Asas Luber Jurdil with vibrant pills */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-300 text-center">
            <div className="text-[11px] font-black font-fredoka text-slate-600 uppercase tracking-wider mb-2">
              Asas Pemilihan OSIS Demokratis:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold font-fredoka">
              <span className="px-2 py-0.5 bg-red-500 text-white rounded-md">Langsung</span>
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md">Umum</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md">Bebas</span>
              <span className="px-2 py-0.5 bg-blue-500 text-white rounded-md">Rahasia</span>
              <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-md">Jujur</span>
              <span className="px-2 py-0.5 bg-purple-500 text-white rounded-md">Adil</span>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // 3. Official Ballot Paper Screen (Logged In Voter)
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Voter Header Strip with Vivid Gradient */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white border-4 border-slate-900 rounded-3xl p-4 sm:p-5 mb-6 shadow-comic-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-slate-900 flex items-center justify-center font-black font-fredoka text-xl shadow-comic-sm">
            {currentVoter.name.charAt(0)}
          </div>
          <div>
            <div className="text-base font-black text-white font-fredoka">
              {currentVoter.name}
            </div>
            <div className="text-xs text-amber-200 font-bold flex items-center gap-2">
              <span>{currentVoter.classOrDept}</span>
              <span>·</span>
              <span>NISN: <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md font-bold text-white">{currentVoter.nisn}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black font-fredoka text-emerald-950 bg-emerald-300 border-2 border-emerald-900 px-3 py-1.5 rounded-full shadow-comic-sm">
            Surat Suara Sah Diberikan ✓
          </span>
          <button
            onClick={() => {
              sound.playPop();
              onGoToCandidates();
            }}
            className="text-xs text-amber-300 hover:text-white font-black font-fredoka bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 transition-colors"
          >
            Bandingkan Paslon →
          </button>
        </div>
      </div>

      {/* Indonesian Red-and-White Header */}
      <div className="rounded-t-3xl overflow-hidden shadow-sm">
        <PitaMerahPutihHeader />
      </div>

      {/* SURAT SUARA DIGITAL RESMI with Warm Parchment Festive Background */}
      <div className="bg-gradient-to-b from-amber-50 via-orange-50/40 to-yellow-50/60 border-4 border-t-0 border-slate-900 rounded-b-3xl p-4 sm:p-8 shadow-comic-lg relative">
        
        {/* Floating Poster Stickers */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <JanganGolputSticker />
          <OneVoteBanner />
          <SatuGerakanSticker />
        </div>

        {/* Ballot Paper Header */}
        <div className="text-center pb-6 border-b-3 border-dashed border-slate-400 mb-8">
          <div className="inline-block px-3 py-1 bg-slate-900 text-amber-300 rounded-full text-[11px] font-black font-righteous uppercase tracking-widest mb-1 shadow-2xs">
            KOMISI PEMILIHAN OSIS (KPO) RESMI
          </div>
          <h2 className="text-xl sm:text-3xl font-black font-fredoka text-slate-900 tracking-tight mt-1 uppercase">
            SURAT SUARA PEMILIHAN KETUA & WAKIL KETUA OSIS
          </h2>
          <div className="text-sm sm:text-base font-black text-blue-900 mt-1 font-fredoka">
            SMP NEGERI 01 BUNGA MAYANG · MASA BAKTI 2026/2027
          </div>
          <div className="text-xs text-slate-600 mt-0.5 font-bold">
            Dilaksanakan pada Selasa, 10 November 2026 (Peringatan Hari Pahlawan Nasional)
          </div>

          <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 border-2 border-slate-900 rounded-full text-xs font-black font-fredoka text-slate-950 shadow-comic-sm">
            <span className="text-base">👉</span>
            <span>PETUNJUK: Klik tombol merah "COBLOS" atau paku untuk menentukan masa depan sekolah kita!</span>
          </div>
        </div>

        {/* Candidates Ballot Columns */}
        <div className={`grid grid-cols-1 ${candidates.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8`}>
          {candidates.map((candidate) => {
            const is01 = candidate.number === 1;
            const themeBorder = is01 
              ? 'border-emerald-700 bg-emerald-50/30' 
              : 'border-teal-700 bg-teal-50/30';
            const themeCardBg = is01 
              ? 'bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d]' 
              : 'bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0d9488]';
            const shadowStyle = is01 ? 'shadow-comic-emerald' : 'shadow-comic-blue';

            return (
              <div
                key={candidate.id}
                className={`bg-white border-4 border-slate-900 rounded-3xl overflow-hidden ${shadowStyle} hover:-translate-y-1 transition-all flex flex-col group relative`}
              >
                {/* Paku Coblos Sticker positioned at top-right corner of ballot frame */}
                <div className="absolute top-2 right-2 z-20">
                  <PakuCoblosSticker 
                    size="md" 
                    label={`PILIH 0${candidate.number}`} 
                    onClick={() => handleSelectToVote(candidate)}
                  />
                </div>

                {/* Header Box with Circular Red Ballot Number */}
                <div className={`${themeCardBg} text-white p-4 text-center border-b-4 border-slate-900 relative`}>
                  <div className="text-[11px] tracking-widest text-amber-300 font-righteous uppercase drop-shadow-xs">
                    PEMILIHAN KETOS & WAKETOS 2026/2027
                  </div>

                  <div className="my-2.5 flex justify-center">
                    <BallotNumberBadge number={candidate.number} className="shadow-comic-sm" />
                  </div>

                  <div className="text-xs font-black font-fredoka text-white uppercase tracking-wider">
                    CALON NOMOR URUT 0{candidate.number}
                  </div>
                </div>

                {/* Photo / Official Poster */}
                <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden border-b-4 border-slate-900">
                  <img
                    src={candidate.photoUrl}
                    alt={`Paslon 0${candidate.number}`}
                    className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Flowing Indonesian red ribbon badge at the bottom of the photo */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4 text-white">
                    <div className="inline-block px-2.5 py-1 bg-red-600 text-white font-fredoka font-black text-[11px] rounded-lg uppercase mb-1 shadow-comic-sm border border-slate-900">
                      {candidate.nickname || `PASLON 0${candidate.number}`}
                    </div>
                    <div className="text-base font-black font-fredoka leading-tight line-clamp-1 drop-shadow-xs">
                      {candidate.chairmanName}
                    </div>
                    <div className="text-xs text-amber-300 font-bold leading-tight line-clamp-1">
                      & {candidate.viceChairmanName}
                    </div>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-amber-50/40">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b-2 border-slate-200 pb-2.5 font-fredoka">
                      <span>{candidate.chairmanClass} & {candidate.viceChairmanClass}</span>
                      <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        Kandidat Sah
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 italic font-bold mt-2.5 leading-relaxed bg-amber-100/70 p-3 rounded-2xl border-2 border-amber-300 shadow-2xs">
                      "{candidate.tagline}"
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t-2 border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPreviewingCandidate(candidate);
                      }}
                      className="w-full py-2.5 text-xs font-black font-fredoka text-slate-800 hover:text-slate-950 bg-amber-200/70 hover:bg-amber-300 rounded-xl border-2 border-slate-900 transition-all flex items-center justify-center gap-1.5 shadow-comic-sm hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      <Eye className="w-4 h-4 text-blue-700" />
                      <span>Lihat Visi, Misi & Poster Lengkap</span>
                    </button>

                    {/* COBLOS BUTTON (Poster Style) */}
                    <button
                      type="button"
                      onClick={() => handleSelectToVote(candidate)}
                      className="w-full py-3.5 px-4 text-white font-black font-fredoka text-base tracking-wide rounded-2xl border-3 border-slate-900 transition-all shadow-comic-md hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-98"
                    >
                      <Vote className="w-5 h-5 text-amber-300 animate-bounce" />
                      <span>COBLOS NOMOR 0{candidate.number}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-slate-900 animate-in fade-in zoom-in duration-200">
            
            {/* Red & White Ribbon Header */}
            <PitaMerahPutihHeader />

            <div className="p-6 sm:p-7 text-center">
              <div className="flex justify-center -mt-2 mb-2">
                <PakuCoblosSticker size="sm" label="PASTIKAN PILIHANMU!" />
              </div>

              <div className="my-2 flex justify-center">
                <BallotNumberBadge number={selectedCandidate.number} />
              </div>

              <h3 className="text-xl font-black font-fredoka text-slate-900 mt-2">
                Konfirmasi Coblos Surat Suara
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Apakah Anda mantap dan yakin dengan pilihan hati nurani Anda?
              </p>

              <div className="my-4 p-4 bg-amber-50/70 border-2 border-amber-200 rounded-2xl flex items-center gap-3.5 text-left">
                <img
                  src={selectedCandidate.photoUrl}
                  alt="Paslon Pilihan"
                  className="w-16 h-16 object-cover rounded-xl border-2 border-slate-800 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <div className="inline-block px-2 py-0.5 bg-red-600 text-white font-black font-fredoka text-[10px] rounded-md mb-1 uppercase">
                    Paslon 0{selectedCandidate.number}
                  </div>
                  <div className="font-black text-slate-900 text-sm leading-tight font-fredoka">
                    {selectedCandidate.chairmanName}
                  </div>
                  <div className="text-slate-600 font-bold leading-tight">
                    & {selectedCandidate.viceChairmanName}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 font-medium mb-5 text-left">
                ⚠️ <strong>Peringatan Asas Pemilu:</strong> Suara yang telah dimasukkan ke kotak suara bersifat mutlak, rahasia, dan tidak dapat diubah kembali.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsConfirming(false);
                    setSelectedCandidate(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 border-2 border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={handleConfirmVote}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-98 text-white text-xs font-black font-fredoka tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <span>Menyimpan Suara...</span>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>YA, COBLOS SEKARANG!</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Quick Preview Modal for Vision & Mission */}
      {previewingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img
                    src={previewingCandidate.photoUrl}
                    alt={previewingCandidate.chairmanName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase">
                    Paslon Nomor Urut 0{previewingCandidate.number}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {previewingCandidate.chairmanName} & {previewingCandidate.viceChairmanName}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {previewingCandidate.chairmanClass} & {previewingCandidate.viceChairmanClass}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewingCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 font-bold italic">
                "{previewingCandidate.tagline}"
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Visi Utama:</span>
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {previewingCandidate.vision}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Misi Kerja:</span>
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                  {previewingCandidate.missions.map((m, idx) => (
                    <li key={idx} className="leading-relaxed">{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Program Kerja Unggulan:</span>
                </h4>
                <div className="space-y-2">
                  {previewingCandidate.workPrograms.map((wp, idx) => (
                    <div key={wp.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <div className="font-semibold text-slate-900">{idx + 1}. {wp.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{wp.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPreviewingCandidate(null)}
                className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const target = previewingCandidate;
                  setPreviewingCandidate(null);
                  handleSelectToVote(target);
                }}
                className="py-1.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Coblos Paslon Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
