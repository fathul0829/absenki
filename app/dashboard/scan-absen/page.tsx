"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import { Camera, CheckCircle2, AlertCircle, Clock, Zap, Loader2, XCircle, Calendar } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@/context/AuthContext';
import { getSiswaById } from '@/lib/siswa';
import { getOrCreateSesi, type SesiAbsen } from '@/lib/sesi';
import { cekDuplikat, addKehadiran, getKehadiranBySesi, type Kehadiran } from '@/lib/kehadiran';

type NotificationType = 'success' | 'warning' | 'error' | '';

function bunyiBeep(isError = false) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = isError ? 'sawtooth' : 'sine';
  osc.frequency.value = isError ? 300 : 800;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + (isError ? 0.3 : 0.1));
}

export default function ScanAbsenPage() {
  const { user, profil, loading: authLoading } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [siswaHadir, setSiswaHadir] = useState<Kehadiran[]>([]);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [sesiAktif, setSesiAktif] = useState<SesiAbsen | null>(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  const tanggalRef = useRef(tanggal);
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const lastScannedStrRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    tanggalRef.current = tanggal;
  }, [tanggal]);

  // Tampilkan notifikasi dengan timeout
  const showNotification = useCallback((msg: string, type: NotificationType) => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => {
      setNotification('');
      setNotificationType('');
    }, 3000);
  }, []);

  // Start camera
  useEffect(() => {
    let isMounted = true;
    const html5QrcodeScanner = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const startScanner = async () => {
      try {
        await html5QrcodeScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) handleScan(decodedText);
          },
          (err) => {
            // ignore frequent parse errors
          }
        );
      } catch (errEnv) {
        console.warn("Kamera belakang gagal, mencoba kamera depan...", errEnv);
        if (!isMounted) return;
        try {
          await html5QrcodeScanner.start(
            { facingMode: "user" },
            config,
            (decodedText) => {
              if (isMounted) handleScan(decodedText);
            },
            (err) => {
              // ignore frequent parse errors
            }
          );
        } catch (errUser) {
          console.error("Kamera error:", errUser);
          if (isMounted) setErrorMsg('Kamera tidak tersedia atau akses ditolak.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (dataStr: string) => {
    // Cegah proses paralel
    if (isProcessingRef.current) return;

    lastScannedStrRef.current = dataStr;
    lastScanTimeRef.current = Date.now();
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // 1. Parse data QR
      let dataSiswa: { studentId?: string; namaLengkap?: string; nis?: string; nisn?: string; kelas?: string };
      try {
        dataSiswa = JSON.parse(dataStr);
      } catch {
        bunyiBeep(true);
        showNotification('QR tidak dikenali', 'error');
        return;
      }

      // Validasi format QR AbsenKi
      if (!dataSiswa || !dataSiswa.studentId || !dataSiswa.nis) {
        bunyiBeep(true);
        showNotification('QR tidak dikenali', 'error');
        return;
      }

      // 2. Verifikasi siswa ada di database
      const siswa = await getSiswaById(dataSiswa.studentId);
      if (!siswa) {
        bunyiBeep(true);
        showNotification('QR tidak valid', 'error');
        return;
      }

      // 3. Pastikan profil guru tersedia
      if (!user || !profil?.mataPelajaran) {
        bunyiBeep(true);
        showNotification('Profil guru belum lengkap', 'error');
        return;
      }

      // 4. Ambil atau buat sesi absen
      const sesi = await getOrCreateSesi(
        user.id,
        profil.mataPelajaran,
        siswa.kelas,
        tanggalRef.current
      );
      setSesiAktif(sesi);

      // 5. Cek duplikat
      const sudahAbsen = await cekDuplikat(sesi.id, siswa.id);
      if (sudahAbsen) {
        bunyiBeep(true);
        showNotification(`Siswa ${siswa.nama_lengkap} sudah absen`, 'warning');
        return;
      }

      // 6. Tambah kehadiran
      await addKehadiran({
        session_id: sesi.id,
        student_id: siswa.id,
        nama_lengkap: siswa.nama_lengkap,
        nis: siswa.nis,
        kelas: siswa.kelas,
        mata_pelajaran: profil.mataPelajaran,
      });

      // 7. Tampilkan notifikasi sukses
      bunyiBeep(false);
      showNotification(`${siswa.nama_lengkap} — Hadir ✓`, 'success');

      // 8. Refresh list kehadiran dari database
      const updatedList = await getKehadiranBySesi(sesi.id);
      setSiswaHadir(updatedList);

    } catch (err) {
      console.error('Error saat proses scan:', err);
      bunyiBeep(true);
      showNotification('Terjadi kesalahan saat memproses scan', 'error');
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }, 1500);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500 font-medium">Memuat data...</span>
      </div>
    );
  }

  // Profil belum lengkap
  if (!profil?.mataPelajaran) {
    return (
      <>
        <Header title="Scan Absensi" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Profil Belum Lengkap</h3>
          <p className="text-slate-600 text-sm">
            Silakan isi mata pelajaran di halaman <strong>Pengaturan</strong> terlebih dahulu sebelum menggunakan fitur scan absensi.
          </p>
        </div>
      </>
    );
  }

  const lastScanned = siswaHadir.length > 0 ? siswaHadir[siswaHadir.length - 1] : null;

  return (
    <>
      <Header 
        title="Scan Absensi" 
        subtitle="Arahkan kamera ke QR Code siswa untuk mencatat kehadiran"
      />

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-row flex-wrap gap-4 items-start mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mata Pelajaran Aktif</label>
          <div className="flex items-center h-[42px]">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {profil.mataPelajaran}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tanggal</label>
          <div className="flex items-center h-[42px] gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-800">{tanggalHariIni}</span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-xl border flex items-center gap-2 ${
          notificationType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
          notificationType === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
          notificationType === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
          'bg-blue-50 text-blue-700 border-blue-100'
        }`}>
          {notificationType === 'success' && <CheckCircle2 size={20} />}
          {notificationType === 'warning' && <AlertCircle size={20} />}
          {notificationType === 'error' && <XCircle size={20} />}
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100 flex items-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-semibold">Memproses scan...</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-24">
        {/* Left Column: Camera */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden min-h-[300px] w-full relative flex items-center justify-center shadow-lg border-4 border-slate-800">
            <style>{`
              #reader__dashboard_section_csr span { display: none !important; }
              #reader__dashboard_section_csr button {
                background-color: #10b981;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                margin-top: 10px;
              }
              #reader video {
                width: 100% !important;
                object-fit: cover !important;
                min-height: 300px;
              }
            `}</style>
            <div id="reader" className="w-full"></div>
            
            {!errorMsg && (
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-10 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Kamera Aktif
              </div>
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-emerald-800 text-sm">Tips Pemindaian</h4>
              <p className="text-emerald-600 text-xs mt-1 leading-relaxed">
                Pastikan ruangan memiliki cahaya yang cukup dan QR Code tidak terlipat atau kotor. Jaga jarak kamera sekitar 15-20 cm dari QR Code.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Scans */}
        <div className="lg:col-span-2 flex flex-col h-full gap-4">
          {/* Last Scanned */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Terakhir Dipindai</h3>
            
            {lastScanned ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md flex items-center justify-center font-bold text-xl text-slate-500">
                  {lastScanned.nama_lengkap.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800 leading-tight">{lastScanned.nama_lengkap}</h4>
                  <div className="text-sm font-mono text-slate-500 mb-2">NIS: {lastScanned.nis} • Kelas {lastScanned.kelas}</div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={14} />
                      Hadir
                    </span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(lastScanned.scanned_at).toLocaleTimeString('id-ID', { hour12: false })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm italic">Belum ada data</div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Siswa Hadir <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-xs ml-2">{siswaHadir.length}</span></h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 w-10">No</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">NIS</th>
                    <th className="px-4 py-3 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siswaHadir.map((siswa, idx) => (
                    <tr key={siswa.id} className={`hover:bg-slate-50/50 ${idx === siswaHadir.length - 1 ? 'bg-emerald-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{siswa.nama_lengkap}</td>
                      <td className="px-4 py-3 font-mono text-xs">{siswa.nis}</td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                        {new Date(siswa.scanned_at).toLocaleTimeString('id-ID', { hour12: false })}
                      </td>
                    </tr>
                  ))}
                  {siswaHadir.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada siswa yang diabsen</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
