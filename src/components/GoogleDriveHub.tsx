import React, { useState, useEffect, useRef } from 'react';
import { useElection } from '../context/ElectionContext';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  getCurrentUser 
} from '../services/googleAuth';
import { 
  getOrCreateElectionFolder, 
  uploadFileToDrive, 
  listElectionFiles, 
  downloadFileContent, 
  deleteDriveFile, 
  getDriveProfile,
  DriveFileItem,
  DriveQuotaInfo 
} from '../services/googleDriveService';
import { 
  Cloud, 
  HardDrive, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  UploadCloud, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  LogOut, 
  FolderPlus,
  ShieldCheck,
  FileCheck,
  FileCode,
  FolderOpen
} from 'lucide-react';
import { sound } from '../utils/audio';
import { User } from 'firebase/auth';

interface GoogleDriveHubProps {
  onOpenReport?: () => void;
}

export const GoogleDriveHub: React.FC<GoogleDriveHubProps> = ({ onOpenReport }) => {
  const { 
    voters, 
    voteRecords, 
    candidates, 
    settings, 
    importVotersFromCSV,
    updateSettings 
  } = useElection();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [folder, setFolder] = useState<{ id: string; name: string } | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [quota, setQuota] = useState<DriveQuotaInfo | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Destructive Confirmation Modal state
  const [pendingDeleteFile, setPendingDeleteFile] = useState<DriveFileItem | null>(null);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<{ file: DriveFileItem; type: 'csv' | 'json' } | null>(null);

  // Custom upload ref
  const customFileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // When access token is available, load Drive profile and election folder files
  useEffect(() => {
    if (accessToken) {
      loadDriveData(accessToken);
    }
  }, [accessToken]);

  const loadDriveData = async (token: string) => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      // 1. Get or create dedicated folder
      const targetFolder = await getOrCreateElectionFolder(token);
      setFolder(targetFolder);

      // 2. Load files inside folder
      const files = await listElectionFiles(token, targetFolder.id);
      setDriveFiles(files);

      // 3. Get quota / profile info
      try {
        const profile = await getDriveProfile(token);
        setQuota(profile);
      } catch {
        // non-blocking
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data dari Google Drive';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        sound.playSuccess();
        setStatusMessage({ 
          type: 'success', 
          text: `Berhasil terhubung ke Google Drive dengan akun ${res.user.email}!` 
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk dengan Google';
      setAuthError(msg);
      sound.playError();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setFolder(null);
    setDriveFiles([]);
    setQuota(null);
    setStatusMessage({ type: 'info', text: 'Telah keluar dari akun Google Drive.' });
  };

  // Helper to format bytes
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '-';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Action 1: Backup DPT to Google Drive (CSV)
  const handleBackupDPT = async () => {
    if (!accessToken || !folder) return;
    setActionInProgress('dpt');
    setStatusMessage(null);
    try {
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
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `DPT_PILKETOS_SMPN01_BUNGAMAYANG_${dateTag}.csv`;

      await uploadFileToDrive(accessToken, {
        name: fileName,
        mimeType: 'text/csv',
        content: csvContent,
        folderId: folder.id,
        description: `Cadangan DPT resmi (${voters.length} pemilih) tersimpan pada ${now.toLocaleString('id-ID')}`,
      });

      sound.playSuccess();
      setStatusMessage({ 
        type: 'success', 
        text: `Sukses mencadangkan DPT (${voters.length} pemilih) ke Google Drive: "${fileName}"` 
      });
      await loadDriveData(accessToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mencadangkan DPT';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  // Action 2: Archive Official Report (HTML formatted) to Google Drive
  const handleArchiveReport = async () => {
    if (!accessToken || !folder) return;
    setActionInProgress('report');
    setStatusMessage(null);
    try {
      const totalDPT = voters.length;
      const totalVotesCast = voteRecords.length;
      const participationRate = totalDPT > 0 ? ((totalVotesCast / totalDPT) * 100).toFixed(1) : '0.0';

      const candidateStats = candidates.map((candidate) => {
        const count = voteRecords.filter((vr) => vr.candidateId === candidate.id).length;
        const percentage = totalVotesCast > 0 ? ((count / totalVotesCast) * 100).toFixed(1) : '0.0';
        return {
          candidate,
          count,
          percentage: parseFloat(percentage),
        };
      }).sort((a, b) => b.count - a.count);

      const winner = candidateStats[0];
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `BERITA_ACARA_PILKETOS_SMPN01_BM_${dateTag}.html`;

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Berita Acara Rekapitulasi PILKETOS SMPN 01 Bunga Mayang</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .kop { text-align: center; border-bottom: 4px double #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .kop h2 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #334155; }
    .kop h1 { margin: 4px 0; font-size: 22px; text-transform: uppercase; color: #0f172a; }
    .title { text-align: center; margin-bottom: 24px; }
    .title h3 { text-decoration: underline; margin-bottom: 4px; font-size: 16px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f8fafc; font-weight: bold; }
    .winner-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
    .sign-row { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; font-size: 13px; }
    .sign-col { width: 45%; }
    .sign-box { height: 70px; display: flex; align-items: flex-end; justify-content: center; font-style: italic; color: #059669; font-weight: bold; }
  </style>
</head>
<body>
  <div class="kop">
    <h2>PEMERINTAH KABUPATEN OGAN KOMERING ULU TIMUR</h2>
    <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
    <h1>SMP NEGERI 01 BUNGA MAYANG</h1>
    <p style="margin: 2px; font-size: 12px; color: #475569;">${settings.subdistrict} · Surel: smpn1.bungamayang@gmail.com</p>
  </div>

  <div class="title">
    <h3>BERITA ACARA REKAPITULASI HASIL PENGHITUNGAN SUARA</h3>
    <p style="margin: 2px; font-weight: bold; font-size: 13px;">PEMILIHAN KETUA & WAKIL KETUA OSIS MASA BAKTI ${settings.period}</p>
    <p style="margin: 2px; font-size: 11px; color: #64748b; font-family: monospace;">Nomor Dokumen: 421.3/088/KPO-PILKETOS/SMPN01-BM/XI/2026</p>
  </div>

  <p style="text-align: justify; text-indent: 32px; font-size: 13px;">
    Pada hari ini, <strong>Selasa tanggal 10 November 2026</strong> bertepatan dengan Peringatan Hari Pahlawan Nasional di SMP Negeri 01 Bunga Mayang, telah dilaksanakan Pemungutan dan Penghitungan Suara PILKETOS Periode ${settings.period} dengan asas LUBER JURDIL.
  </p>

  <h4 style="margin-bottom: 6px; font-size: 13px;">I. DATA PEMILIH & TINGKAT PARTISIPASI</h4>
  <table>
    <tr><td>1. Total Daftar Pemilih Tetap (DPT) Terdaftar</td><td style="text-align: right; font-weight: bold;">${totalDPT} Pemilih</td></tr>
    <tr><td>2. Total Pengguna Hak Pilih yang Menggunakan Hak Suara</td><td style="text-align: right; font-weight: bold; color: #1e3a8a;">${totalVotesCast} Pemilih</td></tr>
    <tr><td>3. Pemilih Tidak Menggunakan Hak Suara (Golput/Absen)</td><td style="text-align: right; font-weight: bold;">${Math.max(0, totalDPT - totalVotesCast)} Pemilih</td></tr>
    <tr style="background: #f8fafc;"><td>4. Persentase Partisipasi Suara</td><td style="text-align: right; font-weight: bold; color: #047857;">${participationRate}%</td></tr>
  </table>

  <h4 style="margin-bottom: 6px; font-size: 13px;">II. PEROLEHAN SUARA PASANGAN CALON</h4>
  <table>
    <thead>
      <tr>
        <th style="width: 50px; text-align: center;">No.</th>
        <th>Pasangan Calon Ketua & Wakil Ketua</th>
        <th style="width: 140px; text-align: center;">Kelas</th>
        <th style="width: 120px; text-align: right;">Perolehan Suara</th>
        <th style="width: 100px; text-align: right;">Persentase</th>
      </tr>
    </thead>
    <tbody>
      ${candidateStats.map(stat => `
      <tr>
        <td style="text-align: center; font-weight: bold;">0${stat.candidate.number}</td>
        <td><strong>${stat.candidate.chairmanName}</strong> & ${stat.candidate.viceChairmanName}</td>
        <td style="text-align: center;">${stat.candidate.chairmanClass} & ${stat.candidate.viceChairmanClass}</td>
        <td style="text-align: right; font-weight: bold;">${stat.count} Suara</td>
        <td style="text-align: right; font-weight: bold;">${stat.percentage}%</td>
      </tr>
      `).join('')}
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td colspan="3" style="text-align: right;">TOTAL SUARA SAH MASUK</td>
        <td style="text-align: right;">${totalVotesCast} Suara</td>
        <td style="text-align: right;">100.0%</td>
      </tr>
    </tbody>
  </table>

  ${winner && totalVotesCast > 0 ? `
  <div class="winner-box">
    <strong>III. PENETAPAN PASANGAN CALON TERPILIH:</strong><br>
    Berdasarkan perolehan suara sah terbanyak, Pasangan Calon Nomor Urut <strong>0${winner.candidate.number}</strong> (${winner.candidate.chairmanName} & ${winner.candidate.viceChairmanName}) secara resmi ditetapkan sebagai <strong>Ketua dan Wakil Ketua OSIS Terpilih SMP Negeri 01 Bunga Mayang Masa Bakti ${settings.period}</strong>.
  </div>
  ` : ''}

  <div style="text-align: right; font-size: 12px; margin-top: 30px;">
    Tunas Peracak, 10 November 2026
  </div>

  <div class="sign-row">
    <div class="sign-col">
      <div>Ketua Panitia Pemilihan (KPO/MPK)</div>
      <div class="sign-box">[Tervalidasi Digital KPO]</div>
      <div style="font-weight: bold; text-decoration: underline;">${settings.committeeHead}</div>
      <div style="font-size: 11px; color: #64748b;">NISN. 00924501</div>
    </div>
    <div class="sign-col">
      <div>Pembina OSIS</div>
      <div class="sign-box">[Tervalidasi Digital Pembina]</div>
      <div style="font-weight: bold; text-decoration: underline;">${settings.osisAdvisor}</div>
      <div style="font-size: 11px; color: #64748b;">NIP. 19800312 200501 1 008</div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; font-size: 13px;">
    <div>Mengetahui,</div>
    <div style="font-weight: bold;">Kepala SMP Negeri 01 Bunga Mayang</div>
    <div class="sign-box" style="justify-content: center; color: #1e3a8a;">[TERVERIFIKASI RESMI DIGITAL]</div>
    <div style="font-weight: bold; text-decoration: underline; font-size: 14px;">${settings.principal}</div>
    <div style="font-size: 11px; color: #64748b;">NIP. ${settings.principalNip}</div>
  </div>
</body>
</html>`;

      await uploadFileToDrive(accessToken, {
        name: fileName,
        mimeType: 'text/html',
        content: htmlContent,
        folderId: folder.id,
        description: `Arsip Berita Acara Rekapitulasi Suara PILKETOS ${settings.period} tanggal 10 November 2026`,
      });

      sound.playSuccess();
      setStatusMessage({ 
        type: 'success', 
        text: `Berita Acara berhasil diarsipkan ke Google Drive: "${fileName}"` 
      });
      await loadDriveData(accessToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengarsipkan Berita Acara';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  // Action 3: Full Election Snapshot (JSON)
  const handleBackupSnapshot = async () => {
    if (!accessToken || !folder) return;
    setActionInProgress('snapshot');
    setStatusMessage(null);
    try {
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `SNAPSHOT_PILKETOS_SMPN01_BM_${dateTag}.json`;

      const snapshotData = {
        app: 'E-PILKETOS SMP Negeri 01 Bunga Mayang',
        version: '1.0.0',
        exportedAt: now.toISOString(),
        settings,
        candidates,
        voters,
        voteRecords,
        stats: {
          totalDPT: voters.length,
          votedCount: voters.filter(v => v.hasVoted).length,
          voteRecordsCount: voteRecords.length,
        }
      };

      await uploadFileToDrive(accessToken, {
        name: fileName,
        mimeType: 'application/json',
        content: JSON.stringify(snapshotData, null, 2),
        folderId: folder.id,
        description: `Snapshot komprehensif sistem pemilihan OSIS (${voters.length} DPT, ${voteRecords.length} suara)`,
      });

      sound.playSuccess();
      setStatusMessage({ 
        type: 'success', 
        text: `Snapshot data pemilihan berhasil disimpan ke Google Drive: "${fileName}"` 
      });
      await loadDriveData(accessToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat snapshot data';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  // Action 4: Custom File Upload
  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken || !folder) return;

    setActionInProgress('custom-upload');
    setStatusMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (!content) return;

        try {
          await uploadFileToDrive(accessToken, {
            name: file.name,
            mimeType: file.type || 'text/plain',
            content,
            folderId: folder.id,
            description: `Berkas panitia diunggah: ${file.name}`,
          });

          sound.playSuccess();
          setStatusMessage({
            type: 'success',
            text: `Berkas "${file.name}" berhasil diunggah ke folder Google Drive!`,
          });
          await loadDriveData(accessToken);
        } catch (uploadErr: unknown) {
          const msg = uploadErr instanceof Error ? uploadErr.message : 'Gagal mengunggah berkas';
          setStatusMessage({ type: 'error', text: msg });
        } finally {
          setActionInProgress(null);
        }
      };

      reader.readAsText(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca berkas lokal';
      setStatusMessage({ type: 'error', text: msg });
      setActionInProgress(null);
    } finally {
      if (customFileInputRef.current) {
        customFileInputRef.current.value = '';
      }
    }
  };

  // Perform confirmed deletion
  const executeDeleteFile = async () => {
    if (!pendingDeleteFile || !accessToken) return;
    const fileToDelete = pendingDeleteFile;
    setPendingDeleteFile(null);
    setActionInProgress(`delete-${fileToDelete.id}`);
    setStatusMessage(null);

    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      sound.playSuccess();
      setStatusMessage({
        type: 'info',
        text: `Berkas "${fileToDelete.name}" telah berhasil dihapus dari Google Drive.`,
      });
      // Refresh list
      if (folder) {
        const files = await listElectionFiles(accessToken, folder.id);
        setDriveFiles(files);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus berkas';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  // Perform confirmed restore
  const executeRestoreFile = async () => {
    if (!pendingRestoreFile || !accessToken) return;
    const { file, type } = pendingRestoreFile;
    setPendingRestoreFile(null);
    setActionInProgress(`restore-${file.id}`);
    setStatusMessage(null);

    try {
      const content = await downloadFileContent(accessToken, file.id);
      if (type === 'csv') {
        const result = importVotersFromCSV(content);
        if (result.success) {
          sound.playSuccess();
          setStatusMessage({
            type: 'success',
            text: `Pemulihan DPT dari Drive sukses: ${result.message}`,
          });
        } else {
          setStatusMessage({ type: 'error', text: result.message });
        }
      } else if (type === 'json') {
        const parsed = JSON.parse(content);
        if (parsed.settings) {
          updateSettings(parsed.settings);
        }
        if (Array.isArray(parsed.voters)) {
          // Store voters and refresh
          localStorage.setItem('smpn1_bm_voters_v3', JSON.stringify(parsed.voters));
        }
        if (Array.isArray(parsed.voteRecords)) {
          localStorage.setItem('smpn1_bm_vote_records_v3', JSON.stringify(parsed.voteRecords));
        }
        sound.playSuccess();
        setStatusMessage({
          type: 'success',
          text: `Snapshot berhasil dipulihkan dari "${file.name}". Muat ulang halaman jika diperlukan.`,
        });
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memulihkan berkas';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 text-blue-300 rounded-full text-xs font-semibold mb-2">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Integrasi Cloud Resmi Google Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Google Drive Arsip & Sinkronisasi E-PILKETOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pusat penyimpanan awan resmi untuk mencadangkan DPT ({voters.length} pemilih), mengarsipkan Dokumen Berita Acara Rekapitulasi Suara, serta memulihkan data pemilihan secara aman.
          </p>
        </div>

        {/* Auth / Account Action Widget */}
        <div className="shrink-0 w-full md:w-auto">
          {currentUser && accessToken ? (
            <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Akun Google'}
                    className="w-10 h-10 rounded-full border border-blue-400/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">
                    {currentUser.displayName || 'Pengguna Google'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[160px] font-mono">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Google Drive Terhubung</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Keluar dari akun Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center md:text-right">
              <button
                onClick={handleSignIn}
                disabled={isSigningIn || isAuthLoading}
                className="gsi-material-button shadow-md"
              >
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isSigningIn ? 'Menghubungkan...' : 'Hubungkan Google Drive'}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert / Notification Feedback Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : statusMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {statusMessage.type === 'info' && <Cloud className="w-4 h-4 text-blue-600" />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {authError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* When NOT signed in: 안내 card explaining benefits and connection */}
      {!accessToken && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Cloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Hubungkan Akun Google untuk Mengaktifkan Google Drive
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Dengan menghubungkan Google Drive, panitia KPO SMPN 01 Bunga Mayang dapat secara langsung mencadangkan berkas DPT pemilih, mengarsipkan dokumen Berita Acara Rekapitulasi Suara dengan tanda tangan elektronik, serta menjaga riwayat pemilihan dalam folder awan khusus yang aman.
          </p>

          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shadow-md"
            >
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Memproses Masuk...' : 'Masuk dengan Google'}
                </span>
              </div>
            </button>
            <span className="text-[11px] text-slate-400 mt-3">
              Izin hanya digunakan untuk mengelola berkas PILKETOS atas persetujuan Anda.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 text-left">
            <div className="p-3 bg-slate-50 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className="text-xs font-bold text-slate-800">Sinkronisasi DPT</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cadangkan {voters.length} pemilih dan status partisipasi langsung ke Drive.</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600 mb-1.5" />
              <div className="text-xs font-bold text-slate-800">Arsip Berita Acara</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dokumen rekapitulasi resmi tersimpan rapi untuk bukti laporan.</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Database className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className="text-xs font-bold text-slate-800">Snapshot Sistem</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Simpan cadangan data pemilu utuh dan pulihkan kapan saja.</div>
            </div>
          </div>
        </div>
      )}

      {/* When SIGNED IN: Action Grid and File Explorer */}
      {accessToken && (
        <div className="space-y-8">
          
          {/* Section: Dedicated Folder and Storage Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Folder Google Drive Resmi:</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{folder ? folder.name : 'Membuat folder PILKETOS...'}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDriveData(accessToken)}
                disabled={isLoadingFiles}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Segarkan daftar berkas Google Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                <span>Segarkan Berkas</span>
              </button>
            </div>
          </div>

          {/* Action Cards Grid: One-Click Cloud Backups */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Tindakan Pencadangan & Sinkronisasi Cepat</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Backup DPT CSV */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-3 border border-emerald-100">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cadangkan DPT ke Drive
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Unggah daftar pemilih lengkap ({voters.length} pemilih) beserta status hak pilih dan token ke Drive (.CSV).
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleBackupDPT}
                    disabled={actionInProgress === 'dpt'}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'dpt' ? 'Mengunggah...' : 'Unggah DPT (.csv)'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Archive Berita Acara */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-3 border border-blue-100">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Arsipkan Berita Acara
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Simpan rekapitulasi penghitungan suara resmi PILKETOS berformat Kop Surat & validasi digital panitia (.HTML).
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleArchiveReport}
                    disabled={actionInProgress === 'report'}
                    className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'report' ? 'Mengarsipkan...' : 'Arsipkan Laporan'}</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Snapshot JSON */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center mb-3 border border-purple-100">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Snapshot Sistem Lengkap
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cadangkan seluruh konfigurasi, data paslon, DPT, dan kotak suara digital ke berkas JSON terpadu.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleBackupSnapshot}
                    disabled={actionInProgress === 'snapshot'}
                    className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'snapshot' ? 'Membuat Snapshot...' : 'Cadangkan Snapshot'}</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Upload Custom Document to Drive */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-3 border border-slate-200">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Unggah Berkas ke Folder
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Simpan berkas tambahan seperti SK Panitia, tata tertib pemilihan, atau foto kegiatan langsung ke folder Drive.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <input
                    ref={customFileInputRef}
                    type="file"
                    onChange={handleCustomFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => customFileInputRef.current?.click()}
                    disabled={actionInProgress === 'custom-upload'}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'custom-upload' ? 'Mengunggah...' : 'Pilih Berkas Lokal'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Drive File Explorer Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Daftar Berkas Terkini di Folder Google Drive ({driveFiles.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semua berkas yang tersimpan aman di cloud Google Drive panitia SMPN 01 Bunga Mayang.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">Nama Berkas</th>
                    <th className="p-3">Tipe & Ukuran</th>
                    <th className="p-3">Terakhir Diperbarui</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingFiles ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Memuat daftar berkas dari Google Drive...</span>
                        </div>
                      </td>
                    </tr>
                  ) : driveFiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Belum ada berkas dalam folder Google Drive. Gunakan tombol di atas untuk mencadangkan DPT atau Berita Acara.
                      </td>
                    </tr>
                  ) : (
                    driveFiles.map((file, index) => {
                      const isCSV = file.name.endsWith('.csv') || file.mimeType.includes('csv');
                      const isJSON = file.name.endsWith('.json') || file.mimeType.includes('json');
                      const isHTML = file.name.endsWith('.html') || file.mimeType.includes('html');

                      return (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-mono">
                            {index + 1}
                          </td>

                          <td className="p-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              {isCSV ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : isHTML ? (
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : isJSON ? (
                                <FileCode className="w-4 h-4 text-purple-600 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <span className="font-mono text-xs">{file.name}</span>
                            </div>
                            {file.description && (
                              <div className="text-[11px] text-slate-400 font-normal mt-0.5 ml-6 line-clamp-1">
                                {file.description}
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-slate-600">
                            <span className="font-mono text-[11px]">
                              {formatBytes(file.size)}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600 font-mono text-[11px]">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : '-'}
                          </td>

                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {/* Open in Drive link */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                                title="Buka berkas langsung di antarmuka Google Drive"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Buka</span>
                              </a>
                            )}

                            {/* Restore into system if CSV or JSON */}
                            {(isCSV || isJSON) && (
                              <button
                                onClick={() => setPendingRestoreFile({ file, type: isCSV ? 'csv' : 'json' })}
                                disabled={actionInProgress !== null}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                                title="Muat data ini ke sistem aplikasi e-voting"
                              >
                                <Download className="w-3 h-3" />
                                <span>Pulihkan</span>
                              </button>
                            )}

                            {/* Delete File (with mandatory confirmation modal) */}
                            <button
                              onClick={() => setPendingDeleteFile(file)}
                              disabled={actionInProgress !== null}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus berkas dari Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: Destructive Deletion */}
      {pendingDeleteFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Hapus Berkas dari Google Drive
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus berkas berikut dari Google Drive Anda secara permanen?
              </p>
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left font-mono text-xs text-slate-800 break-all">
                <div className="font-bold">{pendingDeleteFile.name}</div>
                <div className="text-[11px] text-slate-500 font-sans mt-1">
                  Ukuran: {formatBytes(pendingDeleteFile.size)} · Tipe: {pendingDeleteFile.mimeType}
                </div>
              </div>
              <p className="text-[11px] text-red-600 font-semibold mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPendingDeleteFile(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteFile}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: Restore Data */}
      {pendingRestoreFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Pemulihan Data dari Google Drive
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Anda akan mengimpor data dari berkas cadangan berikut ke dalam aplikasi E-PILKETOS:
              </p>
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left font-mono text-xs text-slate-800 break-all">
                <div className="font-bold">{pendingRestoreFile.file.name}</div>
                <div className="text-[11px] text-slate-500 font-sans mt-1">
                  Format: {pendingRestoreFile.type.toUpperCase()} · Tanggal: {new Date(pendingRestoreFile.file.modifiedTime).toLocaleString('id-ID')}
                </div>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-2">
                Data DPT / Pemilihan di sistem lokal akan diperbarui sesuai isi cadangan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPendingRestoreFile(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeRestoreFile}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lanjutkan Pemulihan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
