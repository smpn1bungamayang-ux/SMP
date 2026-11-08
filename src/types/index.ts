export interface WorkProgram {
  id: string;
  title: string;
  desc: string;
  category: 'Akademik & Literasi' | 'Seni & Budaya' | 'Olahraga & Karakter' | 'Teknologi & Lingkungan' | 'Kedisiplinan';
}

export interface Candidate {
  id: string;
  number: number;
  chairmanName: string;
  chairmanNisn: string;
  chairmanClass: string;
  viceChairmanName: string;
  viceChairmanNisn: string;
  viceChairmanClass: string;
  tagline: string;
  vision: string;
  missions: string[];
  workPrograms: WorkProgram[];
  extracurriculars: string[];
  achievements: string[];
  photoUrl: string;
  posterUrl?: string;
  nickname?: string;
  mottoBadge?: string;
  quote: string;
  themeColor: {
    primary: string;
    secondary: string;
    light: string;
    border: string;
    text: string;
  };
}

export interface Voter {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  role: 'siswa' | 'guru' | 'staf';
  classOrDept: string;
  token: string;
  hasVoted: boolean;
  votedAt?: string;
  ballotSerial?: string;
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  voterRole: 'siswa' | 'guru' | 'staf';
  voterGrade: '7' | '8' | '9' | 'guru_staf';
  voterClass: string;
  timestamp: string;
  receiptCode: string;
}

export interface ElectionSettings {
  schoolName: string;
  subdistrict: string;
  electionDate: string;
  electionTitle: string;
  period: string;
  status: 'active' | 'paused' | 'closed';
  votingStartTime: string;
  votingEndTime: string;
  committeeHead: string;
  committeeHeadTitle?: string;
  committeeHeadNisn?: string;
  osisAdvisor: string;
  osisAdvisorTitle?: string;
  osisAdvisorNip?: string;
  principal: string;
  principalTitle?: string;
  principalNip: string;
  reportNumber?: string;
  reportLocation?: string;
}
