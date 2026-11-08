import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Voter, VoteRecord, ElectionSettings } from '../types';
import { INITIAL_CANDIDATES, INITIAL_VOTERS, INITIAL_VOTE_RECORDS, INITIAL_SETTINGS } from '../data/initialData';
import { sound } from '../utils/audio';

interface VoteReceipt {
  candidate: Candidate;
  voter: Voter;
  timestamp: string;
  receiptCode: string;
}

interface ElectionContextType {
  candidates: Candidate[];
  voters: Voter[];
  voteRecords: VoteRecord[];
  settings: ElectionSettings;
  currentVoter: Voter | null;
  lastVoteReceipt: VoteReceipt | null;
  adminAuthenticated: boolean;
  loginVoter: (nisnOrToken: string) => { success: boolean; message: string; voter?: Voter };
  logoutVoter: () => void;
  castVote: (candidateId: string) => Promise<{ success: boolean; message: string; receiptCode?: string }>;
  clearLastReceipt: () => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateSettings: (newSettings: Partial<ElectionSettings>) => void;
  addVoter: (voter: Omit<Voter, 'id' | 'hasVoted' | 'votedAt' | 'ballotSerial'>) => void;
  deleteVoter: (voterId: string) => void;
  resetVoterStatus: (voterId: string) => void;
  updateCandidate: (candidate: Candidate) => void;
  resetAllElectionData: () => void;
  resetVotesOnly: () => void;
  seedDemoVoter: (token: string) => void;
  importVotersFromCSV: (csvContent: string) => { success: boolean; count: number; message: string };
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CANDIDATES: 'smpn1_bm_candidates_v5',
  VOTERS: 'smpn1_bm_voters_v5',
  VOTE_RECORDS: 'smpn1_bm_vote_records_v4',
  SETTINGS: 'smpn1_bm_settings_v3',
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2 && parsed[0]?.nickname === 'Veronica & Gladia') {
          return parsed;
        }
      } catch {
        return INITIAL_CANDIDATES;
      }
    }
    return INITIAL_CANDIDATES;
  });

  const [voters, setVoters] = useState<Voter[]>(() => {
    const saved =
      localStorage.getItem(STORAGE_KEYS.VOTERS) ||
      localStorage.getItem('smpn1_bm_voters_v4') ||
      localStorage.getItem('smpn1_bm_voters_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 300) {
          // Map existing vote statuses by id, nisn, or token to preserve any votes already cast
          const existingMap = new Map<string, Voter>();
          parsed.forEach((v: Voter) => {
            existingMap.set(v.id, v);
            existingMap.set(v.nisn, v);
            existingMap.set(v.token, v);
          });

          // Ensure all INITIAL_VOTERS (359 students + 25 dewan guru + 10 tendik) are included
          const merged = INITIAL_VOTERS.map((initVoter) => {
            const existing =
              existingMap.get(initVoter.id) ||
              existingMap.get(initVoter.nisn) ||
              existingMap.get(initVoter.token);
            return existing
              ? {
                  ...initVoter,
                  hasVoted: existing.hasVoted,
                  votedAt: existing.votedAt,
                  ballotSerial: existing.ballotSerial,
                }
              : initVoter;
          });

          // Also preserve any manually added voters from admin panel not in initial data
          const initialNisns = new Set(INITIAL_VOTERS.map((v) => v.nisn));
          const customVoters = parsed.filter((v: Voter) => !initialNisns.has(v.nisn));

          return [...merged, ...customVoters];
        }
      } catch {
        return INITIAL_VOTERS;
      }
    }
    return INITIAL_VOTERS;
  });

  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOTE_RECORDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_VOTE_RECORDS;
      }
    }
    return INITIAL_VOTE_RECORDS;
  });

  const [settings, setSettings] = useState<ElectionSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [currentVoter, setCurrentVoter] = useState<Voter | null>(null);
  const [lastVoteReceipt, setLastVoteReceipt] = useState<VoteReceipt | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));
  }, [voters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTE_RECORDS, JSON.stringify(voteRecords));
  }, [voteRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const loginVoter = (nisnOrToken: string): { success: boolean; message: string; voter?: Voter } => {
    const cleanInput = nisnOrToken.trim().toUpperCase();
    if (!cleanInput) {
      return { success: false, message: 'Silakan masukkan NISN atau Token Akses Pemilih.' };
    }

    if (settings.status === 'paused') {
      return { success: false, message: 'Pemilihan suara sedang dijeda sementara oleh panitia KPPS.' };
    }

    if (settings.status === 'closed') {
      return { success: false, message: 'Pemungutan suara telah resmi ditutup oleh panitia.' };
    }

    const matched = voters.find(
      (v) =>
        v.nisn.toUpperCase() === cleanInput ||
        v.nisn.replace('-', '').toUpperCase() === cleanInput ||
        v.token.toUpperCase() === cleanInput ||
        v.token.replace('-', '').toUpperCase() === cleanInput ||
        v.name.toUpperCase() === cleanInput
    );

    if (!matched) {
      return {
        success: false,
        message: 'Data pemilih tidak ditemukan dalam DPT. Pastikan NISN atau Token sesuai daftar panitia.',
      };
    }

    if (matched.hasVoted) {
      return {
        success: false,
        message: `Hak suara atas nama ${matched.name} (${matched.classOrDept}) telah digunakan pada ${
          matched.votedAt ? new Date(matched.votedAt).toLocaleTimeString('id-ID') : 'pagi tadi'
        }. Asas Pemilu: Satu pemilih, satu suara.`,
      };
    }

    sound.playClick();
    setCurrentVoter(matched);
    return {
      success: true,
      message: `Selamat datang, ${matched.name} (${matched.classOrDept}). Silakan masuk ke Bilik Suara.`,
      voter: matched,
    };
  };

  const seedDemoVoter = (token: string) => {
    loginVoter(token);
  };

  const logoutVoter = () => {
    setCurrentVoter(null);
  };

  const castVote = async (candidateId: string): Promise<{ success: boolean; message: string; receiptCode?: string }> => {
    if (!currentVoter) {
      return { success: false, message: 'Sesi pemilih tidak aktif. Silakan masukkan NISN terlebih dahulu.' };
    }

    if (settings.status !== 'active') {
      return { success: false, message: 'Pemungutan suara sedang tidak aktif.' };
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Pasangan calon yang dipilih tidak valid.' };
    }

    // Generate cryptographic-style anonymous receipt code
    const now = new Date();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const receiptCode = `VT-261110-${randomHex}`;

    // Determine grade category for demographic tallying without compromising ballot secrecy
    let grade: '7' | '8' | '9' | 'guru_staf' = 'guru_staf';
    if (currentVoter.role === 'siswa') {
      if (currentVoter.classOrDept.includes('VII') || currentVoter.classOrDept.includes('7')) grade = '7';
      else if (currentVoter.classOrDept.includes('VIII') || currentVoter.classOrDept.includes('8')) grade = '8';
      else if (currentVoter.classOrDept.includes('IX') || currentVoter.classOrDept.includes('9')) grade = '9';
    }

    const newVoteRecord: VoteRecord = {
      id: `vr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      candidateId,
      voterRole: currentVoter.role,
      voterGrade: grade,
      voterClass: currentVoter.classOrDept,
      timestamp: now.toISOString(),
      receiptCode,
    };

    // Update voter status
    const updatedVoter: Voter = {
      ...currentVoter,
      hasVoted: true,
      votedAt: now.toISOString(),
      ballotSerial: receiptCode,
    };

    setVoters((prev) => prev.map((v) => (v.id === currentVoter.id ? updatedVoter : v)));
    setVoteRecords((prev) => [...prev, newVoteRecord]);

    sound.playBallotDrop();
    setTimeout(() => {
      sound.playSuccess();
    }, 250);

    const receipt: VoteReceipt = {
      candidate,
      voter: updatedVoter,
      timestamp: now.toISOString(),
      receiptCode,
    };

    setLastVoteReceipt(receipt);
    setCurrentVoter(null);

    return {
      success: true,
      message: 'Suara Anda telah berhasil direkam dan masuk ke Kotak Suara Digital!',
      receiptCode,
    };
  };

  const clearLastReceipt = () => {
    setLastVoteReceipt(null);
  };

  const loginAdmin = (password: string): boolean => {
    const validPasswords = ['admin123', 'osis2026', 'bungamayang'];
    if (validPasswords.includes(password.trim().toLowerCase())) {
      setAdminAuthenticated(true);
      sound.playSuccess();
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminAuthenticated(false);
  };

  const updateSettings = (newSettings: Partial<ElectionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addVoter = (voterData: Omit<Voter, 'id' | 'hasVoted' | 'votedAt' | 'ballotSerial'>) => {
    const newVoter: Voter = {
      ...voterData,
      id: `v-${Date.now()}`,
      hasVoted: false,
    };
    setVoters((prev) => [newVoter, ...prev]);
  };

  const deleteVoter = (voterId: string) => {
    setVoters((prev) => prev.filter((v) => v.id !== voterId));
  };

  const resetVoterStatus = (voterId: string) => {
    setVoters((prev) =>
      prev.map((v) => {
        if (v.id === voterId) {
          return {
            ...v,
            hasVoted: false,
            votedAt: undefined,
            ballotSerial: undefined,
          };
        }
        return v;
      })
    );
  };

  const updateCandidate = (updated: Candidate) => {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const importVotersFromCSV = (csvContent: string): { success: boolean; count: number; message: string } => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, count: 0, message: 'Format CSV kosong atau tidak memiliki baris data.' };
      }

      const parsedVoters: Voter[] = [];
      // Support headers: ID,NISN,Nama,Jenis Kelamin,Peran,Kelas,Token Akses...
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length < 3) continue;

        const idNum = parseInt(parts[0], 10) || i;
        const nisn = parts[1]?.trim() || '';
        const name = parts[2]?.replace(/^["']|["']$/g, '').trim() || '';
        if (!name || !nisn) continue;

        const gender = parts[3]?.trim().toUpperCase() === 'P' ? 'P' : 'L';
        let role: 'siswa' | 'guru' | 'staf' = 'siswa';
        const roleRaw = parts[4]?.trim().toLowerCase();
        if (roleRaw === 'guru') role = 'guru';
        else if (roleRaw === 'staf') role = 'staf';

        const classOrDept = parts[5]?.replace(/^["']|["']$/g, '').trim() || 'Umum';
        const token = parts[6]?.trim() || `BM-${String(idNum).padStart(3, '0')}`;
        const hasVoted = parts[7]?.trim().toLowerCase().includes('sudah') || false;

        parsedVoters.push({
          id: `v-${String(idNum).padStart(3, '0')}`,
          nisn,
          name,
          gender,
          role,
          classOrDept,
          token: token.toUpperCase(),
          hasVoted,
          votedAt: parts[8]?.trim() || undefined,
          ballotSerial: parts[9]?.trim() || undefined,
        });
      }

      if (parsedVoters.length === 0) {
        return { success: false, count: 0, message: 'Gagal membaca data pemilih dari CSV. Periksa format kolom.' };
      }

      setVoters(parsedVoters);
      localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(parsedVoters));
      sound.playSuccess();
      return {
        success: true,
        count: parsedVoters.length,
        message: `Berhasil mengimpor ${parsedVoters.length} pemilih ke dalam DPT!`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kesalahan parsing CSV';
      return { success: false, count: 0, message: `Gagal memproses file CSV: ${msg}` };
    }
  };

  const resetVotesOnly = () => {
    setVoteRecords([]);
    setVoters((prev) =>
      prev.map((v) => ({
        ...v,
        hasVoted: false,
        votedAt: undefined,
        ballotSerial: undefined,
      }))
    );
    setLastVoteReceipt(null);
    setCurrentVoter(null);
    localStorage.setItem(STORAGE_KEYS.VOTE_RECORDS, JSON.stringify([]));
    sound.playSuccess();
  };

  const resetAllElectionData = () => {
    setCandidates(INITIAL_CANDIDATES);
    setVoters(INITIAL_VOTERS);
    setVoteRecords([]);
    setSettings(INITIAL_SETTINGS);
    setCurrentVoter(null);
    setLastVoteReceipt(null);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.VOTERS);
    localStorage.removeItem(STORAGE_KEYS.VOTE_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <ElectionContext.Provider
      value={{
        candidates,
        voters,
        voteRecords,
        settings,
        currentVoter,
        lastVoteReceipt,
        adminAuthenticated,
        loginVoter,
        logoutVoter,
        castVote,
        clearLastReceipt,
        loginAdmin,
        logoutAdmin,
        updateSettings,
        addVoter,
        deleteVoter,
        resetVoterStatus,
        updateCandidate,
        resetAllElectionData,
        resetVotesOnly,
        seedDemoVoter,
        importVotersFromCSV,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
