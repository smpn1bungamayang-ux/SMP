import { Candidate, Voter, VoteRecord, ElectionSettings } from '../types';

export const SCHOOL_LOGO = '/assets/aistudio/1771984346664_83dd9143.png';

export const INITIAL_SETTINGS: ElectionSettings = {
  schoolName: 'SMP NEGERI 01 BUNGA MAYANG',
  subdistrict: 'Desa Tunas Peracak, Kec. Bunga Mayang, Kab. OKU Timur, Prov. Sumatera Selatan',
  electionDate: '10 November 2026',
  electionTitle: 'Pemilihan Ketua & Wakil Ketua OSIS (PILKETOS)',
  period: '2026 / 2027',
  status: 'active',
  votingStartTime: '07:30 WIB',
  votingEndTime: '14:00 WIB',
  committeeHead: 'M. Rizky Pratama',
  committeeHeadTitle: 'Ketua Panitia Pemilihan (KPO / MPK)',
  committeeHeadNisn: '00924501',
  osisAdvisor: 'Drs. Hendra Wijaya, M.Pd.',
  osisAdvisorTitle: 'Pembina OSIS',
  osisAdvisorNip: '19800312 200501 1 008',
  principal: 'H. Suhartono, S.Pd., M.M.',
  principalTitle: 'Kepala SMP Negeri 01 Bunga Mayang',
  principalNip: '19720514 199802 1 003',
  reportNumber: '421.3/088/KPO-PILKETOS/SMPN01-BM/XI/2026',
  reportLocation: 'Tunas Peracak',
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'paslon-1',
    number: 1,
    chairmanName: 'Veronica Felly Anggraeni',
    chairmanNisn: '3133344350',
    chairmanClass: 'Kelas VIII.2',
    viceChairmanName: 'Gladia Qory Magfira',
    viceChairmanNisn: '0133875039',
    viceChairmanClass: 'Kelas VII.1',
    nickname: 'Veronica & Gladia',
    tagline: 'Paslon 01: Kreatif, Disiplin, Aksi Nyata Bukan Sekedar Kata-Kata',
    mottoBadge: 'Ayo Pilih Paslon 01 · Jangan Golput!',
    vision: 'Mewujudkan OSIS yang harmonis, berprestasi, kreatif, dan saling menghargai, meningkatkan kedisiplinan dan berakhlak mulia, serta membentuk karakter, dan melek digital, serta memiliki solidaritas tinggi.',
    missions: [
      'Menjadi teladan yang baik bagi teman, serta mengadakan kegiatan yang positif dan bermanfaat.',
      'Menjaga lingkungan sekolah, dan mendisiplinkan teman-teman, serta membangun kebersamaan.',
      'Berkolaborasi aktif dengan ekstrakurikuler untuk mendukung minat dan bakat siswa.',
      'Menciptakan lingkungan yang harmonis, ramah, dan anti-bullying.',
      'Memanfaatkan media sosial secara kreatif sebagai sarana edukasi, informasi, dan aspirasi siswa.',
      'Tulus, jujur, dan bertanggung jawab melayani sesama.'
    ],
    workPrograms: [
      {
        id: 'wp-1-1',
        title: 'Bank Sampah Sekolah',
        desc: 'Pemilahan sampah cerdas 3R, edukasi daur ulang, dan pemanfaatan sampah plastik/kertas menjadi kas produktif kelas.',
        category: 'Kedisiplinan'
      },
      {
        id: 'wp-1-2',
        title: 'Kegiatan Porseni (Pekan Olahraga Sekolah)',
        desc: 'Kompetisi tahunan futsal, voli, bulutangkis, dan catur antarkelas untuk menjaring atlet muda berbakat Spensa.',
        category: 'Olahraga & Karakter'
      },
      {
        id: 'wp-1-3',
        title: 'Unjuk Bakat & Pentas Seni Siswa',
        desc: 'Panggung apresiasi seni tari daerah, musik akustik, puisi, drama, dan pameran karya visual siswa Bunga Mayang.',
        category: 'Seni & Budaya'
      },
      {
        id: 'wp-1-4',
        title: 'Peringatan Hari Besar Nasional & Keagamaan',
        desc: 'Peringatan Hari Pahlawan, Kartini, Maulid Nabi, dan peringatan nasional dengan format edukatif dan partisipatif.',
        category: 'Kedisiplinan'
      },
      {
        id: 'wp-1-5',
        title: 'Bazar Kewirausahaan Pelajar',
        desc: 'Pasar kuliner kreasi siswa dan bazar karya hasta karya untuk melatih jiwa kepemimpinan serta kemandirian ekonomi.',
        category: 'Teknologi & Lingkungan'
      },
      {
        id: 'wp-1-6',
        title: 'Budaya Daerah Day Special (Komering & Sumsel)',
        desc: 'Pekan pelestarian adat istiadat, busana khas Komering Sumatera Selatan, dan pengenalan kearifan lokal.',
        category: 'Seni & Budaya'
      }
    ],
    extracurriculars: ['Pramuka Inti', 'PMR Madya', 'English Club', 'Seni Tari'],
    achievements: [
      'Ketua Regu Pramuka Berprestasi Kwarran Bunga Mayang 2025',
      'Juara 1 Lomba Pidato Bahasa Indonesia Hari Pramuka',
      'Peringkat 1 Paralel Kelas VII & VIII Semester Genap'
    ],
    photoUrl: '/assets/aistudio/WhatsApp_Image_2026-11-06_at_1.51.55_AM__1__5d4d1a7f.jpeg',
    posterUrl: '/assets/aistudio/WhatsApp_Image_2026-11-06_at_1.51.55_AM__1__5d4d1a7f.jpeg',
    quote: '"Aksi nyata bukan sekedar kata-kata. Mari bersama ciptakan OSIS yang harmonis, berprestasi, dan saling menghargai!" - Ayo Pilih Paslon 01!',
    themeColor: {
      primary: '#1c3b2b',
      secondary: '#f59e0b',
      light: '#f0fdf4',
      border: '#86efac',
      text: '#14532d'
    }
  },
  {
    id: 'paslon-2',
    number: 2,
    chairmanName: 'Yuanita Christiani Br Siagian',
    chairmanNisn: '3129561941',
    chairmanClass: 'Kelas VIII.3',
    viceChairmanName: 'Daison Revardo',
    viceChairmanNisn: '0131612805',
    viceChairmanClass: 'Kelas VII.1',
    nickname: 'YUDEI (Yuanita & Deison)',
    tagline: 'SATU GERAKAN SERIBU KARYA!!',
    mottoBadge: 'PILIH 02 · SMPN 01 BUMA "BISA"',
    vision: 'Mewujudkan SMPN 01 Bunga Mayang "BISA" (Bersih, Impresif, Solidaritas, dan Andal). Dengan harapan semua siswa SMPN 01 BUMA bisa berpikir mandiri agar tidak mudah menyerah dan menjadi siswa yang baik & cerdas sehingga dapat meraih kesuksesan kedepan.',
    missions: [
      '01. BERSIH: Menjaga lingkungan sekolah dan kelas, serta membuang sampah pada tempatnya.',
      '02. IMPRESIF: Mendorong siswa untuk aktif dalam kegiatan ekstrakurikuler dan mengikuti kegiatan olahraga bersama.',
      '03. SOLIDARITAS: Menanamkan rasa toleransi terhadap sesama, serta menanamkan rasa persatuan dan kesatuan.',
      '04. ANDAL: Menjadikan OSIS sebagai contoh yang disiplin dan bertanggung jawab.'
    ],
    workPrograms: [
      {
        id: 'wp-2-1',
        title: 'Sekolah Berseri (Bersih, Sehat, Asri)',
        desc: 'Program kebersihan terpadu kelas dan lingkungan sekolah, lomba keasrian taman, dan kebiasaan buang sampah teratur.',
        category: 'Kedisiplinan'
      },
      {
        id: 'wp-2-2',
        title: 'Yudei Sport Day',
        desc: 'Hari olahraga bersama antarkelas, senam kesegaran jasmani rutin setiap pekan, dan turnamen antarsiswa yang kompak.',
        category: 'Olahraga & Karakter'
      },
      {
        id: 'wp-2-3',
        title: 'Gerakan Satu Bulan, Satu Perubahan',
        desc: 'Inovasi bertahap setiap bulan di lingkungan sekolah, mulai dari penataan sudut literasi hingga digitalisasi mading kelas.',
        category: 'Akademik & Literasi'
      }
    ],
    extracurriculars: ['Paskibra Sekolah', 'PMR Madya', 'Klub Literasi & Sains'],
    achievements: [
      'Komandan Pasukan Terbaik LKBB Tingkat OKU Timur 2025',
      'Juara Harapan 1 Solo Song FLS2N Tingkat Sub Rayon',
      'Ketua Regu Inti Lomba Tingkat II Kwarran Bunga Mayang'
    ],
    photoUrl: '/assets/aistudio/WhatsApp_Image_2026-11-06_at_1.51.55_AM_2e0639d1.jpeg',
    posterUrl: '/assets/aistudio/WhatsApp_Image_2026-11-06_at_1.51.55_AM_2e0639d1.jpeg',
    quote: '"Satu Gerakan Seribu Karya! Bersama YUDEI wujudkan SMPN 01 BUMA yang BISA: Bersih, Impresif, Solidaritas, dan Andal!" - PILIH 02!',
    themeColor: {
      primary: '#064e3b',
      secondary: '#22c55e',
      light: '#f0fdf4',
      border: '#4ade80',
      text: '#064e3b'
    }
  }
];

import { OFFICIAL_DPT_VOTERS, OFFICIAL_INITIAL_VOTES } from './dptData';

export const INITIAL_VOTERS: Voter[] = OFFICIAL_DPT_VOTERS;

export const INITIAL_VOTE_RECORDS: VoteRecord[] = OFFICIAL_INITIAL_VOTES;

export const VOTER_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Apa prioritas utama yang paling kamu harapkan dari kepengurusan OSIS baru di SMPN 01 Bunga Mayang?',
    options: [
      { text: 'Digitalisasi kegiatan kesiswaan, media podcast, dan penguatan literasi serta Adiwiyata sekolah.', candidateId: 'paslon-1' },
      { text: 'Kedisiplinan sopan santun 5S, pelestarian budaya lokal Sebiduk Sehaluan, dan sekolah ramah anak bebas bullying.', candidateId: 'paslon-2' }
    ]
  },
  {
    id: 2,
    question: 'Bila diadakan acara besar sekolah, konsep kegiatan mana yang paling kamu inginkan?',
    options: [
      { text: 'Classmeeting olahraga terpadu, festival sains, dan panggung kreasi Spensa Voice.', candidateId: 'paslon-1' },
      { text: 'Pekan seni adat Komering Sumsel, tari kreasi daerah, dan liga santun antarkelas.', candidateId: 'paslon-2' }
    ]
  },
  {
    id: 3,
    question: 'Bagaimana cara terbaik menurutmu bagi OSIS untuk menampung kritik dan saran siswa?',
    options: [
      { text: 'Melalui E-Mading, kotak kuesioner digital berkala, dan tutor sebaya Mayang Cerdas.', candidateId: 'paslon-1' },
      { text: 'Bilik curhat tatap muka, konseling teman sebaya, dan audiensi berkala bersama pembina OSIS.', candidateId: 'paslon-2' }
    ]
  },
  {
    id: 4,
    question: 'Nilai karakter Profil Pelajar Pancasila apa yang paling ingin kamu perkuat di lingkungan sekolah kita?',
    options: [
      { text: 'Kreatif, Bernalar Kritis, dan Mandiri dalam pemanfaatan teknologi serta kepedulian lingkungan.', candidateId: 'paslon-1' },
      { text: 'Berkebhinekaan Global, Berakhlak Mulia, dan Bergotong Royong menjunjung adat kesantunan.', candidateId: 'paslon-2' }
    ]
  }
];
