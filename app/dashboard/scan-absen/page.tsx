"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/Header';
import { Camera, CheckCircle2, AlertCircle, Clock, Zap, Loader2, XCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { useAuth } from '@/context/AuthContext';
import { getSiswaById } from '@/lib/siswa';
import { getOrCreateSesi, type SesiAbsen } from '@/lib/sesi';
import { cekDuplikat, addKehadiran, getKehadiranBySesi, type Kehadiran } from '@/lib/kehadiran';

type NotificationType = 'success' | 'warning' | 'error' | '';

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
    let requestAnimationFrameId: number;
    let isActive = true;
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (isActive && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          requestAnimationFrameId = requestAnimationFrame(tick);
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error(err);
        if (isActive) setErrorMsg('Kamera tidak tersedia atau akses ditolak.');
      }
    };

    startCamera();

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            handleScan(code.data);
          }
        }
      }
      if (isActive) {
        requestAnimationFrameId = requestAnimationFrame(tick);
      }
    };

    return () => {
      isActive = false;
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (dataStr: string) => {
    const now = Date.now();
    // Debounce: cegah scan berulang dalam 2 detik untuk QR yang sama
    if (now - lastScanTimeRef.current < 2000 && lastScannedStrRef.current === dataStr) return;
    // Cegah proses paralel
    if (isProcessingRef.current) return;

    lastScannedStrRef.current = dataStr;
    lastScanTimeRef.current = now;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // 1. Parse data QR
      let dataSiswa: { studentId?: string; namaLengkap?: string; nis?: string; nisn?: string; kelas?: string };
      try {
        dataSiswa = JSON.parse(dataStr);
      } catch {
        showNotification('QR tidak dikenali', 'error');
        return;
      }

      // Validasi format QR AbsenKi
      if (!dataSiswa || !dataSiswa.studentId || !dataSiswa.nis) {
        showNotification('QR tidak dikenali', 'error');
        return;
      }

      // 2. Verifikasi siswa ada di database
      const siswa = await getSiswaById(dataSiswa.studentId);
      if (!siswa) {
        showNotification('QR tidak valid', 'error');
        return;
      }

      // 3. Pastikan profil guru tersedia
      if (!user || !profil?.mataPelajaran) {
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
      showNotification(`${siswa.nama_lengkap} — Hadir ✓`, 'success');

      // 8. Refresh list kehadiran dari database
      const updatedList = await getKehadiranBySesi(sesi.id);
      setSiswaHadir(updatedList);

    } catch (err) {
      console.error('Error saat proses scan:', err);
      showNotification('Terjadi kesalahan saat memproses scan', 'error');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mata Pelajaran Aktif</label>
          <div className="flex items-center h-[42px]">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {profil.mataPelajaran}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tanggal</label>
          <input 
            type="date" 
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium" 
          />
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
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center shadow-lg border-4 border-slate-800">
            <video ref={videoRef} playsInline className="absolute inset-0 w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {/* Camera corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg z-10 pointer-events-none"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg z-10 pointer-events-none"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg z-10 pointer-events-none"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-lg z-10 pointer-events-none"></div>
            
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-10 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kamera Aktif
            </div>

            {!errorMsg && (
              <div className="text-slate-500 flex flex-col items-center gap-3 absolute inset-0 justify-center pointer-events-none">
                <Camera size={48} className="opacity-0" />
              </div>
            )}
            
            <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur text-white p-3 rounded-full cursor-pointer transition-colors z-10 flex items-center justify-center">
              <Zap size={20} className="text-yellow-400" />
            </button>
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
