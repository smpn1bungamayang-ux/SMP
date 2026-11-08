import React, { useState, useRef } from 'react';
import { useElection } from '../context/ElectionContext';
import { Voter, Candidate } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  RotateCcw, 
  Trash2, 
  FileSpreadsheet, 
  Printer, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  Upload,
  Cloud
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  onOpenReport: () => void;
  onGoToDrive?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenReport, onGoToDrive }) => {
  const { 
    voters, 
    voteRecords, 
    settings, 
    adminAuthenticated, 
    loginAdmin, 
    logoutAdmin, 
    updateSettings,
    addVoter,
    deleteVoter,
    resetVoterStatus,
    candidates,
    updateCandidate,
    resetAllElectionData,
    resetVotesOnly,
    importVotersFromCSV
  } = useElection();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'dpt' | 'candidates' | 'settings'>('dpt');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add Voter Modal state
  const [showAddVoterModal, setShowAddVoterModal] = useState(false);
  const [newVoterName, setNewVoterName] = useState('');
  const [newVoterNisn, setNewVoterNisn] = useState('');
  const [newVoterGender, setNewVoterGender] = useState<'L' | 'P'>('L');
  const [newVoterRole, setNewVoterRole] = useState<'siswa' | 'guru' | 'staf'>('siswa');
  const [newVoterClass, setNewVoterClass] = useState('VII-A');
  const [newVoterToken, setNewVoterToken] = useState('');

  // Edit Candidate modal state
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const ok = loginAdmin(passwordInput);
    if (!ok) {
      setAuthError('Kata sandi panitia salah. (Gunakan kata sandi: admin123 atau osis2026)');
    } else {
      setPasswordInput('');
    }
  };

  const handleCreateVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterName.trim() || !newVoterNisn.trim()) {
      alert('Nama dan NISN wajib diisi.');
      return;
    }

    const token = newVoterToken.trim().toUpperCase() || `BM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    addVoter({
      name: newVoterName.trim(),
      nisn: newVoterNisn.trim(),
      gender: newVoterGender,
      role: newVoterRole,
      classOrDept: newVoterClass.trim(),
      token,
    });

    setNewVoterName('');
    setNewVoterNisn('');
    setNewVoterToken('');
    setShowAddVoterModal(false);
    sound.playSuccess();
  };

  const exportVotersCSV = () => {
    const headers = ['ID', 'NISN', 'Nama', 'Jenis Kelamin', 'Peran', 'Kelas', 'Token Akses', 'Status Memilih', 'Waktu Memilih', 'Serial Suara'];
    const rows = voters.map((v) => [
      v.id,
      v.nisn,
      `"${v.name}"`,
      v.gender,
      v.role,
      `"${v.classOrDept}"`,
      v.token,
      v.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
      v.votedAt || '-',
      v.ballotSerial || '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DPT_PILKETOS_SMPN01_BUNGAMAYANG_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = importVotersFromCSV(text);
        alert(result.message);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filtered DPT
  const filteredVoters = voters.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.classOrDept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'guru_tendik'
        ? v.role === 'guru' || v.role === 'staf' || v.classOrDept.includes('Guru') || v.classOrDept.includes('Tendik')
        : roleFilter === 'guru'
        ? v.role === 'guru'
        : roleFilter === 'tendik'
        ? v.role === 'staf' || v.classOrDept.includes('Tendik')
        : v.classOrDept.includes(roleFilter);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'voted'
        ? v.hasVoted
        : !v.hasVoted;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Not logged in to Admin
  if (!adminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-gradient-to-b from-white via-amber-50/40 to-orange-50/40 border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-comic-lg text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border-3 border-slate-900 shadow-comic-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-red-600 text-white text-[11px] font-black rounded-full uppercase tracking-wider mb-2">
            Area Khusus Panitia
          </div>

          <h2 className="text-2xl font-black font-fredoka text-slate-900 tracking-tight">
            Panel Akses Panitia KPO
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Khusus Panitia Pemilihan OSIS, Pembina, & Tim IT SMPN 01 Bunga Mayang
          </p>

          {authError && (
            <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs text-red-800 text-left font-bold shadow-comic-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Kata Sandi Panitia (Default: admin123)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-xl text-sm font-bold bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-300 shadow-comic-sm"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black font-fredoka text-sm rounded-xl border-3 border-slate-900 shadow-comic-sm transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-amber-300" />
              <span>Buka Panel Panitia</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-slate-200 text-xs text-slate-500 font-medium">
            Kata sandi bawaan sistem: <span className="font-mono font-black text-slate-800 bg-amber-200 px-1.5 py-0.5 rounded border border-slate-400">admin123</span> atau <span className="font-mono font-black text-slate-800 bg-amber-200 px-1.5 py-0.5 rounded border border-slate-400">osis2026</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin Authenticated View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner and Quick TPS Controls */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-4 border-slate-900 shadow-comic-lg relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>KPO SMPN 01 BUNGA MAYANG · KENDALI ADMINISTRATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Pusat Pengawasan & Tata Kelola PILKETOS 2026/2027
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Status TPS: <strong className="uppercase text-amber-300 font-mono">{settings.status}</strong> · Total Suara Terekam: <span className="font-mono tabular-nums text-white font-bold">{voteRecords.length}</span>
          </p>
        </div>

        {/* TPS Status Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-700 p-1 bg-slate-800/80">
            <button
              onClick={() => updateSettings({ status: 'active' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.status === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              TPS Buka
            </button>
            <button
              onClick={() => updateSettings({ status: 'paused' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.status === 'paused' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Jeda TPS
            </button>
            <button
              onClick={() => updateSettings({ status: 'closed' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.status === 'closed' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tutup TPS
            </button>
          </div>

          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            Keluar Panel
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveAdminTab('dpt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeAdminTab === 'dpt' ? 'bg-blue-50 text-blue-800 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola DPT Pemilih ({voters.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('candidates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeAdminTab === 'candidates' ? 'bg-blue-50 text-blue-800 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span>Kelola Paslon ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeAdminTab === 'settings' ? 'bg-blue-50 text-blue-800 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Berita Acara & Pengaturan</span>
        </button>
      </div>

      {/* TAB 1: DPT MANAGEMENT */}
      {activeAdminTab === 'dpt' && (
        <div className="space-y-4">
          
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, NISN, token, atau kelas..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
              >
                <option value="all">Semua Kelas ({voters.length})</option>
                <optgroup label="Jenjang Kelas VII">
                  <option value="VII">Semua Kelas VII</option>
                  <option value="VII.1">Kelas VII.1</option>
                  <option value="VII.2">Kelas VII.2</option>
                  <option value="VII.3">Kelas VII.3</option>
                  <option value="VII.4">Kelas VII.4</option>
                </optgroup>
                <optgroup label="Jenjang Kelas VIII">
                  <option value="VIII">Semua Kelas VIII</option>
                  <option value="VIII.1">Kelas VIII.1</option>
                  <option value="VIII.2">Kelas VIII.2</option>
                  <option value="VIII.3">Kelas VIII.3</option>
                  <option value="VIII.4">Kelas VIII.4</option>
                </optgroup>
                <optgroup label="Jenjang Kelas IX">
                  <option value="IX">Semua Kelas IX</option>
                  <option value="IX.1">Kelas IX.1</option>
                  <option value="IX.2">Kelas IX.2</option>
                  <option value="IX.3">Kelas IX.3</option>
                  <option value="IX.4">Kelas IX.4</option>
                </optgroup>
                <optgroup label="Pendidik & Tenaga Kependidikan">
                  <option value="guru_tendik">Dewan Guru & Tendik ({voters.filter(v => v.role === 'guru' || v.role === 'staf').length})</option>
                  <option value="guru">Dewan Guru (25)</option>
                  <option value="tendik">Tenaga Kependidikan / Tendik (10)</option>
                </optgroup>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="voted">Sudah Memilih</option>
                <option value="unvoted">Belum Memilih</option>
              </select>

              <button
                onClick={() => setShowAddVoterModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Pemilih</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap border border-slate-200"
                title="Unggah berkas CSV DPT baru"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Unggah CSV</span>
              </button>

              <button
                onClick={exportVotersCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap border border-slate-200"
                title="Ekspor ke Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              {onGoToDrive && (
                <button
                  onClick={onGoToDrive}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap border border-blue-200"
                  title="Buka panel sinkronisasi Google Drive"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cadangkan ke Drive</span>
                </button>
              )}
            </div>

          </div>

          {/* DPT Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">NISN / NIP</th>
                    <th className="p-3">Kelas / Jabatan</th>
                    <th className="p-3 font-mono">Token Akses</th>
                    <th className="p-3 text-center">Status Suara</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVoters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Tidak ada data pemilih yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVoters.map((voter, index) => (
                      <tr key={voter.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono tabular-nums">
                          {index + 1}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {voter.name}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {voter.nisn}
                        </td>
                        <td className="p-3 text-slate-700">
                          {voter.classOrDept}
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-700">
                          {voter.token}
                        </td>
                        <td className="p-3 text-center">
                          {voter.hasVoted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sudah Memilih</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              <span>Belum</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {voter.hasVoted && (
                            <button
                              onClick={() => {
                                if (confirm(`Reset status pemilih ${voter.name}? Suara sebelumnya tetap anonim di kotak suara.`)) {
                                  resetVoterStatus(voter.id);
                                }
                              }}
                              className="px-2 py-1 text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                              title="Reset hak pilih"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pemilih ${voter.name} dari DPT?`)) {
                                deleteVoter(voter.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Hapus pemilih"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CANDIDATE MANAGEMENT */}
      {activeAdminTab === 'candidates' && (
        <div className={`grid grid-cols-1 ${candidates.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'} gap-6`}>
          {candidates.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-lg bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                  0{c.number}
                </span>
                <button
                  onClick={() => setEditingCandidate(c)}
                  className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              </div>

              <div className="aspect-[4/5] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={c.photoUrl}
                  alt={c.chairmanName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {c.chairmanName} ({c.chairmanClass})
                </h3>
                <div className="text-xs text-slate-600">
                  Wakil: {c.viceChairmanName} ({c.viceChairmanClass})
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg text-xs italic text-slate-700">
                "{c.tagline}"
              </div>

              <div className="text-[11px] text-slate-500 line-clamp-3">
                <strong>Visi:</strong> {c.vision}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SETTINGS & REPORT */}
      {activeAdminTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identitas Pemilihan */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Identitas & Pejabat Penandatangan Berita Acara
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => updateSettings({ schoolName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kepala Sekolah & NIP</label>
                <input
                  type="text"
                  value={settings.principal}
                  onChange={(e) => updateSettings({ principal: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs mb-1"
                />
                <input
                  type="text"
                  value={settings.principalNip}
                  onChange={(e) => updateSettings({ principalNip: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  placeholder="NIP"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pembina OSIS & NIP</label>
                <input
                  type="text"
                  value={settings.osisAdvisor}
                  onChange={(e) => updateSettings({ osisAdvisor: e.target.value })}
                  placeholder="Nama Pembina OSIS"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs mb-1"
                />
                <input
                  type="text"
                  value={settings.osisAdvisorNip || ''}
                  onChange={(e) => updateSettings({ osisAdvisorNip: e.target.value })}
                  placeholder="NIP Pembina OSIS"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ketua Panitia (MPK) & NISN</label>
                <input
                  type="text"
                  value={settings.committeeHead}
                  onChange={(e) => updateSettings({ committeeHead: e.target.value })}
                  placeholder="Nama Ketua Panitia"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs mb-1"
                />
                <input
                  type="text"
                  value={settings.committeeHeadNisn || ''}
                  onChange={(e) => updateSettings({ committeeHeadNisn: e.target.value })}
                  placeholder="NISN / ID Ketua Panitia"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Berita Acara & Lokasi</label>
                <input
                  type="text"
                  value={settings.reportNumber || ''}
                  onChange={(e) => updateSettings({ reportNumber: e.target.value })}
                  placeholder="Nomor Berita Acara"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono mb-1"
                />
                <input
                  type="text"
                  value={settings.reportLocation || ''}
                  onChange={(e) => updateSettings({ reportLocation: e.target.value })}
                  placeholder="Tempat Penetapan (Contoh: Tunas Peracak)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenReport}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Berita Acara Rekapitulasi</span>
              </button>
            </div>
          </div>

          {/* Reset / Backup Area */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Pemulihan & Data Simulasi</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dapat mengembalikan seluruh data (DPT, suara pemilih, paslon, dan pengaturan) ke setelan awal demo untuk pengujian simulasi berulang.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="font-bold">Opsi Pengosongan Suara (Mulai dari Nol):</div>
              <div>
                Gunakan tombol di bawah untuk mengosongkan kotak suara sehingga status seluruh {voters.length} pemilih kembali menjadi <strong>Belum Memilih</strong> (0 suara tercatat) untuk memulai pemungutan suara resmi dari awal.
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (confirm('Yakin ingin mengosongkan kotak suara dan mereset status semua pemilih menjadi Belum Memilih?')) {
                    resetVotesOnly();
                    alert(`Kotak suara berhasil dikosongkan. Seluruh ${voters.length} pemilih berstatus Belum Memilih (0 suara masuk).`);
                  }
                }}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kosongkan Kotak Suara (Reset 0 Suara)</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Yakin ingin mereset seluruh data pemilihan ke setelan pabrik (${voters.length} pemilih DPT resmi & 0 suara)?`)) {
                    resetAllElectionData();
                    alert(`Seluruh data berhasil diatur ulang ke setelan awal ${voters.length} DPT resmi.`);
                  }
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Total Seluruh Sistem ke Awal</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Modal: Tambah Pemilih Baru */}
      {showAddVoterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tambah Pemilih Tetap (DPT) Baru
            </h3>

            <form onSubmit={handleCreateVoter} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newVoterName}
                  onChange={(e) => setNewVoterName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN / NIP</label>
                <input
                  type="text"
                  value={newVoterNisn}
                  onChange={(e) => setNewVoterNisn(e.target.value)}
                  placeholder="Contoh: 01188203"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Peran</label>
                  <select
                    value={newVoterRole}
                    onChange={(e) => setNewVoterRole(e.target.value as 'siswa' | 'guru' | 'staf')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Dewan Guru</option>
                    <option value="staf">Staf TU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelas / Unit</label>
                  <input
                    type="text"
                    value={newVoterClass}
                    onChange={(e) => setNewVoterClass(e.target.value)}
                    placeholder="Contoh: VII-B atau Guru IPA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Token Akses (Kosongkan untuk otomatis)
                </label>
                <input
                  type="text"
                  value={newVoterToken}
                  onChange={(e) => setNewVoterToken(e.target.value)}
                  placeholder="Contoh: BM-7A99"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVoterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  Simpan Pemilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Calon */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Ubah Data Paslon No. 0{editingCandidate.number}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Calon Ketua</label>
                <input
                  type="text"
                  value={editingCandidate.chairmanName}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, chairmanName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Calon Wakil Ketua</label>
                <input
                  type="text"
                  value={editingCandidate.viceChairmanName}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, viceChairmanName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={editingCandidate.tagline}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Visi Utama</label>
                <textarea
                  rows={3}
                  value={editingCandidate.vision}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, vision: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCandidate(editingCandidate);
                  setEditingCandidate(null);
                  sound.playSuccess();
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
