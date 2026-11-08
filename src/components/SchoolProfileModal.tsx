import React from 'react';
import { SCHOOL_LOGO } from '../data/initialData';
import { 
  Building2, 
  MapPin, 
  Target, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Users, 
  HeartHandshake, 
  X,
  Mail,
  ShieldCheck
} from 'lucide-react';

interface SchoolProfileModalProps {
  onClose: () => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={SCHOOL_LOGO}
              alt="Logo SMPN 01 Bunga Mayang"
              className="w-9 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                Profil SMP Negeri 01 Bunga Mayang
              </h2>
              <div className="text-[11px] text-slate-300 font-medium">
                Desa Tunas Peracak, Kab. OKU Timur, Sumatera Selatan
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm">
          
          {/* Hero Identity Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={SCHOOL_LOGO}
              alt="Logo Resmi"
              className="w-24 h-26 object-contain shrink-0 drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest font-mono text-amber-300 uppercase font-bold">
                SEKOLAH MENENGAH PERTAMA NEGERI
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                SMP NEGERI 01 BUNGA MAYANG
              </h3>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-blue-100">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Desa Tunas Peracak, Kec. Bunga Mayang, Kab. OKU Timur, Sumatera Selatan</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-md shadow-2xs">
                  MOTTO: BUNGA MAYANG BISA
                </span>
                <span className="text-[11px] text-blue-200 ml-2">
                  (Berkarakter · Inovatif · Santun · Agamis)
                </span>
              </div>
            </div>
          </div>

          {/* Data Ringkas Identitas */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Informasi Pokok Satuan Pendidikan</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Nama Sekolah:</span>
                <span className="font-bold text-slate-900">SMP Negeri 01 Bunga Mayang</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Status Sekolah:</span>
                <span className="font-bold text-slate-900">Negeri (Pemerintah Kab. OKU Timur)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Desa / Kelurahan:</span>
                <span className="font-bold text-slate-900">Desa Tunas Peracak</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Kecamatan:</span>
                <span className="font-bold text-slate-900">Kecamatan Bunga Mayang</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Kabupaten:</span>
                <span className="font-bold text-slate-900">Kabupaten Ogan Komering Ulu Timur</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Provinsi:</span>
                <span className="font-bold text-slate-900">Sumatera Selatan (Bumi Sriwijaya)</span>
              </div>
            </div>
          </div>

          {/* Visi Sekolah */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Visi Sekolah</span>
            </h4>
            <p className="text-slate-900 font-semibold italic text-xs sm:text-sm leading-relaxed mt-1">
              "Terwujudnya Peserta Didik yang Berakhlak Mulia, Unggul dalam Prestasi, Berwawasan Iptek, Berjiwa Pancasila, dan Berbudaya Lingkungan di Bumi Sebiduk Sehaluan."
            </p>
          </div>

          {/* Misi Sekolah */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Misi Satuan Pendidikan</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Menumbuhkembangkan penghayatan dan pengamalan nilai-nilai keagamaan serta budi pekerti luhur dalam kehidupan sehari-hari warga sekolah.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Melaksanakan pembelajaran yang aktif, inovatif, kreatif, efektif, dan menyenangkan berorientasi pada Profil Pelajar Pancasila.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Mengembangkan potensi minat, bakat, serta kemandirian peserta didik melalui program bimbingan ekstrakurikuler yang terarah dan berprestasi.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <span>Menciptakan lingkungan sekolah yang bersih, hijau, asri, nyaman, dan ramah anak di Desa Tunas Peracak.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                <span>Membangun sinergi yang harmonis dengan orang tua, komite sekolah, dan masyarakat luas di Kecamatan Bunga Mayang, OKU Timur.</span>
              </div>
            </div>
          </div>

          {/* Budaya & Nilai Kearifan Lokal */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Semangat Kebangsaan & Kearifan Lokal OKU Timur</span>
            </div>
            <p className="leading-relaxed">
              Pelaksanaan Pemilihan Ketua & Wakil Ketua OSIS pada tanggal <strong>10 November 2026</strong> diselenggarakan dalam rangka memperingati <strong>Hari Pahlawan Nasional</strong> untuk menumbuhkan jiwa kepemimpinan yang berani, jujur, amanah, dan berintegritas bagi seluruh pelajar generasi penerus bangsa di SMP Negeri 01 Bunga Mayang.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Tutup Profil
          </button>
        </div>

      </div>
    </div>
  );
};
