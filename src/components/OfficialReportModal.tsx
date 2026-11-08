import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { SCHOOL_LOGO } from '../data/initialData';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Cloud, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  Edit3,
  Save,
  RotateCcw,
  UserCheck,
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { getOrCreateElectionFolder, uploadFileToDrive } from '../services/googleDriveService';
import { sound } from '../utils/audio';

interface OfficialReportModalProps {
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ onClose }) => {
  const { candidates, voters, voteRecords, settings, updateSettings } = useElection();

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<{ link?: string; name: string } | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Signatory edit state
  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [formData, setFormData] = useState({
    committeeHead: settings.committeeHead || 'M. Rizky Pratama',
    committeeHeadTitle: settings.committeeHeadTitle || 'Ketua Panitia Pemilihan (KPO / MPK)',
    committeeHeadNisn: settings.committeeHeadNisn || '00924501',
    osisAdvisor: settings.osisAdvisor || 'Drs. Hendra Wijaya, M.Pd.',
    osisAdvisorTitle: settings.osisAdvisorTitle || 'Pembina OSIS',
    osisAdvisorNip: settings.osisAdvisorNip || '19800312 200501 1 008',
    principal: settings.principal || 'H. Suhartono, S.Pd., M.M.',
    principalTitle: settings.principalTitle || 'Kepala SMP Negeri 01 Bunga Mayang',
    principalNip: settings.principalNip || '19720514 199802 1 003',
    reportNumber: settings.reportNumber || '421.3/088/KPO-PILKETOS/SMPN01-BM/XI/2026',
    reportLocation: settings.reportLocation || 'Tunas Peracak',
    electionDate: settings.electionDate || '10 November 2026',
  });

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

  const handlePrint = () => {
    sound.playPop();
    window.print();
  };

  const handleSaveSignatories = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      committeeHead: formData.committeeHead.trim(),
      committeeHeadTitle: formData.committeeHeadTitle.trim(),
      committeeHeadNisn: formData.committeeHeadNisn.trim(),
      osisAdvisor: formData.osisAdvisor.trim(),
      osisAdvisorTitle: formData.osisAdvisorTitle.trim(),
      osisAdvisorNip: formData.osisAdvisorNip.trim(),
      principal: formData.principal.trim(),
      principalTitle: formData.principalTitle.trim(),
      principalNip: formData.principalNip.trim(),
      reportNumber: formData.reportNumber.trim(),
      reportLocation: formData.reportLocation.trim(),
      electionDate: formData.electionDate.trim(),
    });
    sound.playSuccess();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleResetToDefault = () => {
    sound.playPop();
    const defaults = {
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
      electionDate: '10 November 2026',
    };
    setFormData(defaults);
    updateSettings(defaults);
    sound.playSuccess();
  };

  const handleSaveToDrive = async () => {
    setIsSavingToDrive(true);
    setDriveError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        if (!signinRes) {
          // User closed popup or cancelled; exit quietly without error
          return;
        }
        token = signinRes.accessToken;
      }

      const folder = await getOrCreateElectionFolder(token);
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `BERITA_ACARA_PILKETOS_SMPN01_BM_${dateTag}.html`;

      const docElement = document.getElementById('official-document');
      const innerHtml = docElement ? docElement.innerHTML : '';
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${fileName}</title><style>body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 30px; }</style></head><body>${innerHtml}</body></html>`;

      const uploaded = await uploadFileToDrive(token, {
        name: fileName,
        mimeType: 'text/html',
        content: fullHtml,
        folderId: folder.id,
        description: `Arsip Berita Acara Rekapitulasi Suara PILKETOS SMPN 01 Bunga Mayang Periode ${settings.period}`,
      });

      sound.playSuccess();
      setDriveSaveSuccess({ link: uploaded.webViewLink, name: fileName });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan ke Google Drive';
      setDriveError(msg);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border-4 border-slate-900">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 border-b-2 border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold font-fredoka text-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dokumen Resmi Berita Acara Rekapitulasi Suara PILKETOS</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle Edit Signatories Button */}
            <button
              onClick={() => {
                sound.playPop();
                setIsEditingSignatories((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-fredoka transition-all cursor-pointer ${
                isEditingSignatories 
                  ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-comic-sm ring-2 ring-amber-300 scale-102' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
              title="Edit nama Ketua Panitia, Pembina OSIS, Kepala Sekolah & Nomor Surat"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingSignatories ? 'Tutup Edit' : 'Edit Penandatangan'}</span>
            </button>

            {driveSaveSuccess ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold border border-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-300" />
                <span>Tersimpan di Drive</span>
                {driveSaveSuccess.link && (
                  <a
                    href={driveSaveSuccess.link}
                    target="_blank"
                    rel="noreferrer"
                    className="underline ml-1 hover:text-emerald-100 flex items-center gap-0.5"
                  >
                    <span>Buka</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Arsipkan langsung dokumen ini ke Google Drive sekolah"
              >
                {isSavingToDrive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-lime-300" />
                )}
                <span>{isSavingToDrive ? 'Menyimpan...' : 'Simpan ke Drive'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black font-fredoka transition-colors border-2 border-slate-900 shadow-comic-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DRIVE ERROR ALERT */}
        {driveError && (
          <div className="p-3 bg-red-100 border-b-2 border-red-300 text-xs text-red-800 flex items-center justify-between no-print font-bold">
            <span>{driveError}</span>
            <button onClick={() => setDriveError(null)} className="text-red-950 font-black cursor-pointer">×</button>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXPANDABLE SIGNATORY EDITING PANEL (no-print) */}
        {/* ============================================================== */}
        {isEditingSignatories && (
          <div className="no-print bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 border-b-4 border-slate-900 p-5 sm:p-6 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-amber-300 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black font-fredoka text-amber-800 uppercase bg-amber-200 border border-amber-400 px-2.5 py-0.5 rounded-full">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Pengaturan Data Penandatangan & Dokumen</span>
                </div>
                <h3 className="text-base sm:text-lg font-black font-fredoka text-slate-900 mt-1">
                  Ubah Nama Pejabat & Pihak yang Bertanda Tangan
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Perubahan akan langsung tercermin pada lembar Berita Acara di bawah dan tersimpan permanen.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border-2 border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Kembalikan nama ke setelan awal sekolah"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Bawaan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveSignatories()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black font-fredoka rounded-xl border-2 border-slate-900 shadow-comic-sm transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-lime-300" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {saveToast && (
              <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-500 rounded-xl text-xs text-emerald-950 font-black flex items-center gap-2 shadow-comic-sm animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Berhasil! Data penandatangan dan nomor Berita Acara telah disimpan ke sistem.</span>
              </div>
            )}

            <form onSubmit={handleSaveSignatories} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              
              {/* Box 1: Ketua Panitia */}
              <div className="bg-white p-4 rounded-2xl border-3 border-slate-900 shadow-comic-sm">
                <div className="flex items-center gap-1.5 text-xs font-black font-fredoka text-blue-900 mb-2 pb-1.5 border-b border-slate-100">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>1. Ketua Panitia (KPO / MPK)</span>
                </div>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Lengkap:</label>
                    <input
                      type="text"
                      value={formData.committeeHead}
                      onChange={(e) => setFormData({ ...formData, committeeHead: e.target.value })}
                      placeholder="Contoh: M. Rizky Pratama"
                      className="w-full px-2.5 py-1.5 text-xs border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Jabatan / Keterangan:</label>
                    <input
                      type="text"
                      value={formData.committeeHeadTitle}
                      onChange={(e) => setFormData({ ...formData, committeeHeadTitle: e.target.value })}
                      placeholder="Ketua Panitia Pemilihan (KPO / MPK)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">NISN / Identitas:</label>
                    <input
                      type="text"
                      value={formData.committeeHeadNisn}
                      onChange={(e) => setFormData({ ...formData, committeeHeadNisn: e.target.value })}
                      placeholder="00924501"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Pembina OSIS */}
              <div className="bg-white p-4 rounded-2xl border-3 border-slate-900 shadow-comic-sm">
                <div className="flex items-center gap-1.5 text-xs font-black font-fredoka text-emerald-900 mb-2 pb-1.5 border-b border-slate-100">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Pembina OSIS</span>
                </div>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      value={formData.osisAdvisor}
                      onChange={(e) => setFormData({ ...formData, osisAdvisor: e.target.value })}
                      placeholder="Drs. Hendra Wijaya, M.Pd."
                      className="w-full px-2.5 py-1.5 text-xs border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Jabatan / Keterangan:</label>
                    <input
                      type="text"
                      value={formData.osisAdvisorTitle}
                      onChange={(e) => setFormData({ ...formData, osisAdvisorTitle: e.target.value })}
                      placeholder="Pembina OSIS"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">NIP Pembina:</label>
                    <input
                      type="text"
                      value={formData.osisAdvisorNip}
                      onChange={(e) => setFormData({ ...formData, osisAdvisorNip: e.target.value })}
                      placeholder="19800312 200501 1 008"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: Kepala Sekolah */}
              <div className="bg-white p-4 rounded-2xl border-3 border-slate-900 shadow-comic-sm">
                <div className="flex items-center gap-1.5 text-xs font-black font-fredoka text-indigo-900 mb-2 pb-1.5 border-b border-slate-100">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>3. Kepala Sekolah (Mengetahui)</span>
                </div>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Kepala Sekolah:</label>
                    <input
                      type="text"
                      value={formData.principal}
                      onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                      placeholder="H. Suhartono, S.Pd., M.M."
                      className="w-full px-2.5 py-1.5 text-xs border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Titel / Jabatan:</label>
                    <input
                      type="text"
                      value={formData.principalTitle}
                      onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
                      placeholder="Kepala SMP Negeri 01 Bunga Mayang"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">NIP Kepala Sekolah:</label>
                    <input
                      type="text"
                      value={formData.principalNip}
                      onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                      placeholder="19720514 199802 1 003"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Metadata Dokumen */}
              <div className="bg-white p-4 rounded-2xl border-3 border-slate-900 shadow-comic-sm">
                <div className="flex items-center gap-1.5 text-xs font-black font-fredoka text-amber-900 mb-2 pb-1.5 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>4. Nomor & Tempat Dokumen</span>
                </div>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nomor Berita Acara:</label>
                    <input
                      type="text"
                      value={formData.reportNumber}
                      onChange={(e) => setFormData({ ...formData, reportNumber: e.target.value })}
                      placeholder="421.3/088/KPO-PILKETOS/SMPN01-BM/XI/2026"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Tempat Penetapan:</label>
                    <input
                      type="text"
                      value={formData.reportLocation}
                      onChange={(e) => setFormData({ ...formData, reportLocation: e.target.value })}
                      placeholder="Tunas Peracak"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Tanggal Surat:</label>
                    <input
                      type="text"
                      value={formData.electionDate}
                      onChange={(e) => setFormData({ ...formData, electionDate: e.target.value })}
                      placeholder="10 November 2026"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Printable Official Document Sheet */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white" id="official-document">
          
          {/* KOP SURAT RESMI SEKOLAH */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <img
                src={SCHOOL_LOGO}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-center flex-1">
                <div className="text-xs font-bold tracking-wider uppercase text-slate-700">
                  PEMERINTAH KABUPATEN OGAN KOMERING ULU TIMUR
                </div>
                <div className="text-xs font-bold tracking-wider uppercase text-slate-700">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                  SMP NEGERI 01 BUNGA MAYANG
                </h1>
                <div className="text-[11px] text-slate-600 font-medium">
                  {settings.subdistrict}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Laman Resmi E-Voting: spen1bungamayang.sch.id · Surel: smpn1.bungamayang@gmail.com
                </div>
              </div>
              <div className="w-20 hidden sm:block"></div>
            </div>
          </div>

          {/* JUDUL BERITA ACARA */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-black tracking-wide uppercase underline">
              BERITA ACARA REKAPITULASI HASIL PENGHITUNGAN SUARA
            </h2>
            <div className="text-xs font-bold uppercase mt-1">
              PEMILIHAN KETUA DAN WAKIL KETUA OSIS MASA BAKTI {settings.period}
            </div>
            <div className="text-[11px] font-mono text-slate-600 mt-0.5">
              Nomor: {formData.reportNumber || '421.3/088/KPO-PILKETOS/SMPN01-BM/XI/2026'}
            </div>
          </div>

          {/* NARASI PEMBUKA */}
          <p className="text-xs text-justify leading-relaxed text-slate-800 mb-4 indent-8">
            Pada hari ini, <strong>Selasa tanggal Sepuluh bulan November tahun Dua Ribu Dua Puluh Enam (10-11-2026)</strong> bertepatan dengan Peringatan Hari Pahlawan Nasional, bertempat di Kampus SMP Negeri 01 Bunga Mayang, telah dilaksanakan Pemungutan dan Penghitungan Suara Pemilihan Ketua dan Wakil Ketua OSIS Periode {settings.period} dengan menggunakan sistem Elektronik Voting (e-Voting) yang berasaskan <em>Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL)</em>.
          </p>

          <p className="text-xs leading-relaxed text-slate-800 mb-4">
            Berdasarkan hasil tabulasi data pemungutan suara digital dari seluruh Tempat Pemungutan Suara (TPS), panitia mencatat rekapitulasi sebagai berikut:
          </p>

          {/* TABEL DATA PEMILIH */}
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-900 mb-1.5 uppercase">
              I. DATA PEMILIH DAN PENGGUNA HAK PILIH
            </div>
            <table className="w-full text-xs border border-slate-400 border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-medium w-3/4">1. Jumlah Daftar Pemilih Tetap (DPT) Terdaftar</td>
                  <td className="p-2 font-bold font-mono text-right tabular-nums">{totalDPT} Orang</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-medium">2. Jumlah Pengguna Hak Pilih yang Menggunakan Hak Suara</td>
                  <td className="p-2 font-bold font-mono text-right tabular-nums text-blue-900">{totalVotesCast} Orang</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-medium">3. Jumlah Pemilih yang Tidak Menggunakan Hak Suara (Golput/Absen)</td>
                  <td className="p-2 font-bold font-mono text-right tabular-nums">{Math.max(0, totalDPT - totalVotesCast)} Orang</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold">4. Persentase Tingkat Partisipasi Pemilih</td>
                  <td className="p-2 font-bold font-mono text-right tabular-nums text-emerald-800">{participationRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL HASIL PEROLEHAN SUARA PASLON */}
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-900 mb-1.5 uppercase">
              II. PEROLEHAN SUARA MASING-MASING PASANGAN CALON
            </div>
            <table className="w-full text-xs border border-slate-400 border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold">
                  <th className="p-2 border-r border-slate-400 text-center w-12">No.</th>
                  <th className="p-2 border-r border-slate-400">Nama Calon Ketua & Wakil Ketua</th>
                  <th className="p-2 border-r border-slate-400 text-center w-28">Asal Kelas</th>
                  <th className="p-2 border-r border-slate-400 text-right w-24">Jumlah Suara</th>
                  <th className="p-2 text-right w-24">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {candidateStats.map(({ candidate, count, percentage }) => (
                  <tr key={candidate.id} className="border-b border-slate-300">
                    <td className="p-2 border-r border-slate-300 text-center font-bold font-mono">
                      0{candidate.number}
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      <div className="font-bold text-slate-900">{candidate.chairmanName}</div>
                      <div className="text-slate-600">& {candidate.viceChairmanName}</div>
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center text-slate-700">
                      {candidate.chairmanClass} & {candidate.viceChairmanClass}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono font-bold tabular-nums">
                      {count}
                    </td>
                    <td className="p-2 text-right font-mono font-bold tabular-nums">
                      {percentage}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="p-2 border-r border-slate-400 text-right">
                    TOTAL SUARA SAH MASUK
                  </td>
                  <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums">
                    {totalVotesCast}
                  </td>
                  <td className="p-2 text-right font-mono tabular-nums">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PENETAPAN PASLON TERPILIH */}
          {winner && totalVotesCast > 0 && (
            <div className="mb-8 p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed">
              <strong className="text-slate-900 uppercase">III. PENETAPAN PASANGAN CALON TERPILIH:</strong>
              <p className="mt-1">
                Berdasarkan perolehan suara terbanyak, ditetapkan bahwa Pasangan Calon Nomor Urut <strong>0{winner.candidate.number}</strong> yaitu <strong>{winner.candidate.chairmanName}</strong> dan <strong>{winner.candidate.viceChairmanName}</strong> dinyatakan sah sebagai <strong>Ketua dan Wakil Ketua OSIS Terpilih SMP Negeri 01 Bunga Mayang Masa Bakti {settings.period}</strong>.
              </p>
            </div>
          )}

          {/* KOLOM TANDA TANGAN RESMI */}
          <div className="mt-8 text-xs text-slate-900">
            <div className="text-right mb-4 font-medium">
              {formData.reportLocation || 'Tunas Peracak'}, {formData.electionDate || '10 November 2026'}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center mb-8">
              {/* Ketua Panitia */}
              <div className={`p-2 rounded-xl transition-all ${isEditingSignatories ? 'border-2 border-dashed border-blue-400 bg-blue-50/40' : ''}`}>
                <div className="text-slate-600 font-medium">{formData.committeeHeadTitle || 'Ketua Panitia Pemilihan (KPO / MPK)'}</div>
                <div className="h-16 flex items-end justify-center">
                  <div className="text-emerald-800 font-mono text-[10px] italic border border-emerald-300 px-2 py-0.5 rounded bg-white/70">
                    [Tervalidasi Digital KPO]
                  </div>
                </div>
                <div className="font-bold underline mt-1">{formData.committeeHead}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {formData.committeeHeadNisn ? (formData.committeeHeadNisn.startsWith('NISN') ? formData.committeeHeadNisn : `NISN. ${formData.committeeHeadNisn}`) : ''}
                </div>
              </div>

              {/* Pembina OSIS */}
              <div className={`p-2 rounded-xl transition-all ${isEditingSignatories ? 'border-2 border-dashed border-emerald-400 bg-emerald-50/40' : ''}`}>
                <div className="text-slate-600 font-medium">{formData.osisAdvisorTitle || 'Pembina OSIS'}</div>
                <div className="h-16 flex items-end justify-center">
                  <div className="text-emerald-800 font-mono text-[10px] italic border border-emerald-300 px-2 py-0.5 rounded bg-white/70">
                    [Tervalidasi Digital Pembina]
                  </div>
                </div>
                <div className="font-bold underline mt-1">{formData.osisAdvisor}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {formData.osisAdvisorNip ? (formData.osisAdvisorNip.startsWith('NIP') ? formData.osisAdvisorNip : `NIP. ${formData.osisAdvisorNip}`) : ''}
                </div>
              </div>
            </div>

            {/* Kepala Sekolah */}
            <div className={`text-center max-w-sm mx-auto p-2 rounded-xl transition-all ${isEditingSignatories ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/40' : ''}`}>
              <div className="text-slate-600 font-medium">Mengetahui,</div>
              <div className="font-semibold text-slate-900">{formData.principalTitle || 'Kepala SMP Negeri 01 Bunga Mayang'}</div>
              <div className="h-16 flex items-end justify-center">
                <div className="text-blue-900 font-mono text-[10px] font-bold border-2 border-blue-900 px-3 py-1 rounded bg-white/80">
                  TERVERIFIKASI RESMI
                </div>
              </div>
              <div className="font-bold underline text-sm mt-1">{formData.principal}</div>
              <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                {formData.principalNip ? (formData.principalNip.startsWith('NIP') ? formData.principalNip : `NIP. ${formData.principalNip}`) : ''}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

