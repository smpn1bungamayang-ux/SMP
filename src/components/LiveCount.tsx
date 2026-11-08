import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { PitaMerahPutihHeader, BallotNumberBadge, JanganGolputSticker, OneVoteBanner, SatuGerakanSticker } from './CampaignStickers';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  Printer, 
  ShieldCheck, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface LiveCountProps {
  onOpenReport: () => void;
}

export const LiveCount: React.FC<LiveCountProps> = ({ onOpenReport }) => {
  const { candidates, voters, voteRecords, settings } = useElection();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalDPT = voters.length;
  const totalVotesCast = voteRecords.length;
  const participationRate = totalDPT > 0 ? ((totalVotesCast / totalDPT) * 100).toFixed(1) : '0.0';
  const remainingVoters = Math.max(0, totalDPT - totalVotesCast);

  // Per candidate vote counts
  const candidateStats = candidates.map((candidate) => {
    const count = voteRecords.filter((vr) => vr.candidateId === candidate.id).length;
    const percentage = totalVotesCast > 0 ? ((count / totalVotesCast) * 100).toFixed(1) : '0.0';
    return {
      candidate,
      count,
      percentage: parseFloat(percentage),
    };
  }).sort((a, b) => b.count - a.count);

  const leadingCandidate = totalVotesCast > 0 ? candidateStats[0] : null;

  // Grade Breakdown
  const gradeDistribution = {
    '7': voteRecords.filter((v) => v.voterGrade === '7').length,
    '8': voteRecords.filter((v) => v.voterGrade === '8').length,
    '9': voteRecords.filter((v) => v.voterGrade === '9').length,
    'guru_staf': voteRecords.filter((v) => v.voterGrade === 'guru_staf').length,
  };

  const handleSimulateRefresh = () => {
    sound.playPop();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      sound.playSuccess();
    }, 350);
  };

  const triggerCelebrateWinner = () => {
    sound.playCelebrationFanfare();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-black font-fredoka text-red-600 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TABULASI RESMI & REAL COUNT PILKETOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 tracking-tight mt-1">
            Hasil Pemilihan Suara Langsung
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            SMP Negeri 01 Bunga Mayang · Terenkripsi, Sah & Transparan (LUBER JURDIL)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateRefresh}
            disabled={isRefreshing}
            className="p-2.5 border-2 border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Segarkan Data Real Count"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onOpenReport();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black font-fredoka tracking-wide transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Berita Acara Resmi</span>
          </button>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
        <JanganGolputSticker />
        <OneVoteBanner />
        <SatuGerakanSticker />
      </div>

      {/* KPI Stats Strip with Bright Cheerful Colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
        <div className="bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-50 border-4 border-slate-900 rounded-3xl p-5 shadow-comic-amber hover:-translate-y-1 transition-transform">
          <div className="text-xs font-black font-fredoka text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>Total DPT</span>
            <span className="text-lg">📋</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-fredoka tabular-nums mt-1.5 drop-shadow-xs">
            {totalDPT}
          </div>
          <div className="text-xs text-amber-950 font-bold mt-1">Siswa & Dewan Guru</div>
        </div>

        <div className="bg-gradient-to-br from-blue-200 via-indigo-100 to-sky-50 border-4 border-slate-900 rounded-3xl p-5 shadow-comic-blue hover:-translate-y-1 transition-transform">
          <div className="text-xs font-black font-fredoka text-blue-900 uppercase tracking-wider flex items-center justify-between">
            <span>Suara Masuk</span>
            <span className="text-lg">📥</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-900 font-fredoka tabular-nums mt-1.5 drop-shadow-xs">
            {totalVotesCast}
          </div>
          <div className="text-xs text-blue-950 font-bold mt-1">Tervalidasi Digital (Sah)</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-200 via-teal-100 to-green-50 border-4 border-slate-900 rounded-3xl p-5 shadow-comic-emerald hover:-translate-y-1 transition-transform">
          <div className="text-xs font-black font-fredoka text-emerald-900 uppercase tracking-wider flex items-center justify-between">
            <span>Partisipasi</span>
            <span className="text-lg">🎉</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-950 font-fredoka tabular-nums mt-1.5 drop-shadow-xs">
            {participationRate}%
          </div>
          <div className="text-xs text-emerald-950 font-bold mt-1">Kehadiran Demokrasi</div>
        </div>

        <div className="bg-gradient-to-br from-rose-200 via-pink-100 to-orange-50 border-4 border-slate-900 rounded-3xl p-5 shadow-comic-rose hover:-translate-y-1 transition-transform">
          <div className="text-xs font-black font-fredoka text-rose-900 uppercase tracking-wider flex items-center justify-between">
            <span>Belum Memilih</span>
            <span className="text-lg">⏳</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-900 font-fredoka tabular-nums mt-1.5 drop-shadow-xs">
            {remainingVoters}
          </div>
          <div className="text-xs text-rose-950 font-bold mt-1">Hak Suara Tersisa</div>
        </div>
      </div>

      {totalVotesCast === 0 && (
        <div className="mt-6 p-4 rounded-3xl bg-amber-200 border-4 border-slate-900 text-xs text-slate-900 flex items-center justify-between shadow-comic-sm">
          <div className="font-bold">
            <strong className="font-black font-fredoka text-sm">Kotak Suara Digital Masih Bersih (0 Suara):</strong> Seluruh {totalDPT} pemilih dalam DPT memiliki hak suara aktif siap mencoblos.
          </div>
          <span className="font-mono text-xs text-white bg-slate-900 px-3 py-1 rounded-full font-black shrink-0 ml-3 shadow-xs">
            0% Partisipasi
          </span>
        </div>
      )}

      {/* Primary Results Breakdown */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-fredoka text-slate-900">
            Perolehan Suara Pasangan Calon
          </h2>
          <span className="text-xs text-slate-700 font-black font-fredoka bg-amber-300 px-3 py-1 rounded-full border-2 border-slate-900 shadow-comic-sm">
            Hasil Real Count Resmi
          </span>
        </div>

        <div className={`grid grid-cols-1 ${candidateStats.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8`}>
          {candidateStats.map(({ candidate, count, percentage }, index) => {
            const isWinner = index === 0 && totalVotesCast > 0;
            const is01 = candidate.number === 1;

            const cardBg = is01 
              ? 'bg-gradient-to-b from-[#14532d] via-[#166534] to-[#0f2d1e] text-white shadow-comic-emerald' 
              : 'bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-comic-blue';

            return (
              <div
                key={candidate.id}
                className={`rounded-3xl border-4 border-slate-900 p-6 shadow-comic-md transition-all relative overflow-hidden flex flex-col justify-between ${cardBg}`}
              >
                {/* Winner Crown Badge */}
                {isWinner && (
                  <button
                    onClick={triggerCelebrateWinner}
                    title="Klik untuk rayakan!"
                    className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-400 text-slate-950 border-2 border-slate-900 text-xs font-black font-fredoka px-3.5 py-1 rounded-full shadow-comic-sm hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Award className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>UNGGUL SEMENTARA 👑</span>
                  </button>
                )}

                <div>
                  {/* Paslon Header & Number */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <BallotNumberBadge number={candidate.number} className="shadow-comic-sm" />
                    <div>
                      <div className="text-[11px] font-black font-fredoka text-amber-300 uppercase tracking-wider drop-shadow-xs">
                        {candidate.nickname || `PASANGAN CALON 0${candidate.number}`}
                      </div>
                      <div className="text-lg font-black font-fredoka text-white leading-tight">
                        {candidate.chairmanName}
                      </div>
                      <div className="text-xs text-amber-200 font-bold leading-tight">
                        & {candidate.viceChairmanName}
                      </div>
                    </div>
                  </div>

                  {/* Photo & Bar */}
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 border-3 border-slate-900 bg-white">
                    <img
                      src={candidate.photoUrl}
                      alt={`Paslon 0${candidate.number}`}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Numbers & Percentage */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="text-4xl sm:text-5xl font-black text-amber-300 font-fredoka tabular-nums drop-shadow-sm">
                      {percentage}%
                    </div>
                    <div className="text-sm font-black text-white font-fredoka tabular-nums bg-black/40 px-3 py-1 rounded-xl border border-white/20">
                      {count} <span className="text-xs font-bold text-amber-200">suara sah</span>
                    </div>
                  </div>

                  {/* Progress Bar with Authentic Candidate Colors */}
                  <div className="w-full bg-black/40 rounded-full h-5 overflow-hidden border-2 border-slate-900 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 shadow-inner ${
                        is01 
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500' 
                          : 'bg-gradient-to-r from-lime-400 via-emerald-300 to-teal-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 text-xs text-amber-100 italic font-semibold">
                  "{candidate.tagline}"
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Demographics & Transparency Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Suara Berdasarkan Tingkatan Kelas */}
        <div className="lg:col-span-6 bg-gradient-to-b from-white to-indigo-50/40 border-4 border-slate-900 rounded-3xl p-6 shadow-comic-md">
          <h3 className="text-base font-black font-fredoka text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-700" />
            <span>Distribusi Pemilih Menurut Jenjang</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1 font-fredoka">
                <span className="text-indigo-900">Kelas VII (Tujuh)</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {gradeDistribution['7']} suara
                </span>
              </div>
              <div className="w-full bg-indigo-100 h-3.5 rounded-full overflow-hidden border border-indigo-300">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{
                    width: `${totalVotesCast > 0 ? (gradeDistribution['7'] / totalVotesCast) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1 font-fredoka">
                <span className="text-blue-900">Kelas VIII (Delapan)</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {gradeDistribution['8']} suara
                </span>
              </div>
              <div className="w-full bg-blue-100 h-3.5 rounded-full overflow-hidden border border-blue-300">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${totalVotesCast > 0 ? (gradeDistribution['8'] / totalVotesCast) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1 font-fredoka">
                <span className="text-emerald-900">Kelas IX (Sembilan)</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {gradeDistribution['9']} suara
                </span>
              </div>
              <div className="w-full bg-emerald-100 h-3.5 rounded-full overflow-hidden border border-emerald-300">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${totalVotesCast > 0 ? (gradeDistribution['9'] / totalVotesCast) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1 font-fredoka">
                <span className="text-amber-900">Dewan Guru & Tenaga Kependidikan (Tendik)</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {gradeDistribution['guru_staf']} suara
                </span>
              </div>
              <div className="w-full bg-amber-100 h-3.5 rounded-full overflow-hidden border border-amber-300">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${totalVotesCast > 0 ? (gradeDistribution['guru_staf'] / totalVotesCast) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail Anonim Suara Terkini */}
        <div className="lg:col-span-6 bg-gradient-to-b from-white to-emerald-50/40 border-4 border-slate-900 rounded-3xl p-6 shadow-comic-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black font-fredoka text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Log Verifikasi Suara Masuk (Anonim)</span>
              </h3>
              <span className="text-[11px] font-black font-fredoka text-emerald-800 bg-emerald-200 border border-emerald-400 px-2.5 py-0.5 rounded-full">
                Asas Rahasia
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {voteRecords.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-2xl border-2 border-dashed border-slate-300 font-medium">
                  Kotak suara digital bersih. Belum ada suara masuk.
                </div>
              ) : (
                voteRecords.slice(-5).reverse().map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-between text-xs font-mono shadow-comic-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-black text-slate-900">{record.receiptCode}</span>
                      <span className="text-[11px] text-slate-600 font-sans font-bold">({record.voterClass})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">
                      {new Date(record.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-300 text-xs text-slate-600 font-medium">
            Sistem mencatat transaksi secara kriptografis tanpa mengaitkan nama pemilih dengan pilihan paslon (Menjamin asas LUBER & JURDIL).
          </div>
        </div>

      </div>

    </div>
  );
};
