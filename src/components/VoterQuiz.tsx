import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { VOTER_QUIZ_QUESTIONS } from '../data/initialData';
import { Candidate } from '../types';
import { Sparkles, Check, ArrowRight, RotateCcw, Vote, Award, BookOpen, Star } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { PitaMerahPutihHeader, BallotNumberBadge, JanganGolputSticker, OneVoteBanner, SatuGerakanSticker } from './CampaignStickers';

interface VoterQuizProps {
  onGoToVoting: (candidateId?: string) => void;
}

export const VoterQuiz: React.FC<VoterQuizProps> = ({ onGoToVoting }) => {
  const { candidates } = useElection();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = VOTER_QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (candidateId: string) => {
    sound.playPop();
    const updated = { ...answers, [currentQ.id]: candidateId };
    setAnswers(updated);

    if (currentStep < VOTER_QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      sound.playCelebrationFanfare();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
      });
    }
  };

  const handleReset = () => {
    sound.playPop();
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // Calculate scores
  const scoreCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    scoreCounts[c.id] = 0;
  });

  Object.values(answers).forEach((cid) => {
    if (scoreCounts[cid] !== undefined) {
      scoreCounts[cid] += 1;
    }
  });

  const totalQuestions = VOTER_QUIZ_QUESTIONS.length;
  const matchResults = candidates.map((c) => {
    const rawScore = scoreCounts[c.id] || 0;
    const percentage = Math.round((rawScore / totalQuestions) * 100);
    return {
      candidate: c,
      score: rawScore,
      percentage,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const topMatch = matchResults[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Quiz Introduction Banner */}
      <div className="text-center mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <JanganGolputSticker />
          <OneVoteBanner />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black font-fredoka text-slate-900 tracking-tight">
          Kuis Pemilih Cerdas Spensa
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto font-medium">
          Jawab 4 pertanyaan aspirasi untuk mengetahui pasangan calon ketua & wakil ketua OSIS mana yang paling selaras dengan prinsip dan visimu.
        </p>
      </div>

      {!isCompleted ? (
        <div className="bg-gradient-to-b from-white via-amber-50/50 to-yellow-50/60 border-4 border-slate-900 rounded-3xl overflow-hidden shadow-comic-lg">
          <PitaMerahPutihHeader />

          <div className="p-6 sm:p-9">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-5 pb-3 border-b-2 border-slate-200">
              <span className="font-fredoka text-sm font-bold text-slate-800">
                Pertanyaan <strong className="text-rose-600 font-black">{currentStep + 1}</strong> dari{' '}
                {VOTER_QUIZ_QUESTIONS.length}
              </span>
              <span className="font-mono tabular-nums font-black text-slate-950 bg-amber-300 border-2 border-slate-900 px-3 py-1 rounded-full text-xs shadow-comic-sm">
                {Math.round(((currentStep) / totalQuestions) * 100)}% Selesai
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 mb-6 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options with Colorful Hover */}
            <div className="space-y-4">
              {currentQ.options.map((option, idx) => {
                const optColors = [
                  'hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 hover:border-amber-500',
                  'hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-500',
                  'hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-500',
                  'hover:bg-gradient-to-r hover:from-rose-100 hover:to-pink-100 hover:border-rose-500',
                ];
                const badgeBgs = [
                  'bg-amber-400 text-slate-950',
                  'bg-blue-600 text-white',
                  'bg-emerald-600 text-white',
                  'bg-rose-500 text-white',
                ];

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option.candidateId)}
                    className={`w-full p-4.5 rounded-2xl border-3 border-slate-900 bg-white text-left transition-all flex items-start gap-4 group cursor-pointer shadow-comic-sm hover:translate-x-1 hover:shadow-comic-md ${optColors[idx % 4]}`}
                  >
                    <div className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center font-black font-fredoka text-sm shrink-0 shadow-2xs ${badgeBgs[idx % 4]}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="text-sm text-slate-900 leading-relaxed font-bold">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Back button if not at start */}
            {currentStep > 0 && (
              <div className="mt-6 pt-4 border-t-2 border-slate-200 flex justify-between">
                <button
                  onClick={() => {
                    sound.playPop();
                    setCurrentStep((prev) => prev - 1);
                  }}
                  className="text-xs text-slate-700 hover:text-slate-950 font-black font-fredoka flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors"
                >
                  ← Pertanyaan Sebelumnya
                </button>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Completed Result Card */
        <div className="bg-gradient-to-b from-white via-amber-50/60 to-orange-50/70 border-4 border-slate-900 rounded-3xl overflow-hidden shadow-comic-lg">
          <PitaMerahPutihHeader />

          <div className="p-6 sm:p-9">
            <div className="text-center pb-6 border-b-2 border-dashed border-slate-300">
              <div className="w-16 h-16 bg-amber-400 text-slate-950 border-3 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-comic-sm animate-bounce">
                <Award className="w-8 h-8 fill-slate-950 text-slate-950" />
              </div>
              <div className="text-xs font-black font-fredoka text-amber-900 uppercase tracking-wider bg-amber-200 inline-block px-3 py-1 rounded-full border border-amber-400">
                Hasil Analisis Pilihan Aspirasimu
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 mt-2">
                Paslon Paling Selaras dengan Harapanmu:
              </h2>
            </div>

            {/* Top Matched Candidate Spotlight */}
            {topMatch && (
              <div className="my-6 p-6 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100 border-4 border-slate-900 shadow-comic-amber flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={topMatch.candidate.photoUrl}
                    alt={topMatch.candidate.chairmanName}
                    className="w-32 h-32 object-contain rounded-2xl border-3 border-slate-900 shadow-comic-sm bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -top-3 -right-3">
                    <BallotNumberBadge number={topMatch.candidate.number} className="w-11 h-11 text-xl shadow-comic-sm" />
                  </div>
                </div>

                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-black font-fredoka bg-emerald-700 text-white px-3.5 py-1 rounded-full shadow-comic-sm border border-slate-900">
                      {topMatch.percentage}% Tingkat Kecocokan 🎉
                    </span>
                    <span className="text-xs font-black font-fredoka text-slate-900 bg-white border border-slate-900 px-2.5 py-1 rounded-lg">
                      {topMatch.candidate.nickname || `Paslon 0${topMatch.candidate.number}`}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 mt-2">
                    {topMatch.candidate.chairmanName} & {topMatch.candidate.viceChairmanName}
                  </h3>
                  <p className="text-xs text-slate-700 italic font-bold mt-0.5">
                    "{topMatch.candidate.tagline}"
                  </p>
                  <p className="text-xs text-slate-900 font-semibold mt-3 leading-relaxed bg-white/90 p-3.5 rounded-2xl border-2 border-slate-900 shadow-2xs">
                    Aspirasimu selaras dengan program unggulan <strong>{topMatch.candidate.workPrograms[0]?.title}</strong> serta misi <em>"{topMatch.candidate.missions[0]}"</em>.
                  </p>
                </div>
              </div>
            )}

            {/* All candidates score bars */}
            <div className="space-y-3.5 mb-8">
              <h4 className="text-xs font-black font-fredoka text-slate-800 uppercase tracking-wider mb-2">
                Perbandingan Kecocokan dengan Seluruh Paslon:
              </h4>
              {matchResults.map(({ candidate, percentage }) => (
                <div key={candidate.id} className="p-4 rounded-2xl border-3 border-slate-900 bg-white shadow-comic-sm">
                  <div className="flex justify-between text-xs font-bold mb-1.5 font-fredoka">
                    <span className="text-slate-900 font-black">
                      Paslon 0{candidate.number}: {candidate.chairmanName}
                    </span>
                    <span className="font-mono font-black text-rose-600 text-sm">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border-2 border-slate-900 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        candidate.number === 1 ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-slate-200">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-black font-fredoka text-slate-800 hover:text-slate-950 px-4 py-2.5 rounded-xl bg-slate-100 border-2 border-slate-900 hover:bg-slate-200 transition-colors shadow-comic-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis</span>
              </button>

              <button
                onClick={() => {
                  sound.playCoblos();
                  onGoToVoting(topMatch?.candidate.id);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl text-xs font-black font-fredoka uppercase tracking-wide transition-all shadow-comic-md hover:translate-x-0.5 hover:translate-y-0.5 active:scale-98 border-2 border-slate-900"
              >
                <Vote className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Lanjut Coblos di Bilik Suara</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
