"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { Download, RotateCcw, Users, CalendarCheck, Percent, Calendar, Loader2 } from 'lucide-react';
import { daftarKelas } from '@/constants/kelas';
import { useAuth } from '@/context/AuthContext';
import { insforge } from '@/lib/insforge';

const KartuStatistik = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs lg:text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-xl lg:text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default function RekapKehadiranPage() {
  const { user, profil, loading: authLoading } = useAuth();
  const isOperator = profil?.posisi === 'operator';

  const today = new Date().toISOString().split('T')[0];
  const [waktuMode, setWaktuMode] = useState<'tunggal' | 'rentang'>('tunggal');
  const [tanggalTunggal, setTanggalTunggal] = useState(today);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [kelasFilter, setKelasFilter] = useState('');
  
  const [filterMapel, setFilterMapel] = useState('');
  const [filterGuru, setFilterGuru] = useState('');
  const [daftarMapel, setDaftarMapel] = useState<string[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Data states
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  const [sesiList, setSesiList] = useState<any[]>([]);
  const [kehadiranList, setKehadiranList] = useState<any[]>([]);

  // Hitung tanggal dari & sampai berdasarkan mode
  const tanggalDari = waktuMode === 'tunggal' ? tanggalTunggal : tanggalMulai;
  const tanggalSampai = waktuMode === 'tunggal' ? tanggalTunggal : tanggalSelesai;

  const [semuaGuru, setSemuaGuru] = useState<any[]>([]);

  useEffect(() => {
    if (isOperator) {
      import('@/lib/guru').then(({ getDaftarMapel, getDaftarGuru }) => {
        getDaftarMapel().then(setDaftarMapel);
        getDaftarGuru().then(setSemuaGuru);
      });
    }
  }, [isOperator]);

  useEffect(() => {
    let filtered = semuaGuru.filter(g => g.posisi === 'guru');
    if (filterMapel) {
      filtered = filtered.filter(g => g.mata_pelajaran === filterMapel);
    }
    setDaftarGuru(filtered);
  }, [filterMapel, semuaGuru]);

  const fetchRekap = useCallback(async () => {
    if (!isOperator && !profil?.mataPelajaran) return;
    if (!tanggalDari || !tanggalSampai) return;

    setLoading(true);
    try {
      const mapel = isOperator ? (filterMapel || undefined) : profil.mataPelajaran;
      const guru = isOperator ? (filterGuru || undefined) : user?.id;

      // 1. Fetch Sesi
      let querySesi = insforge.database.from('sesi_absen')
        .select('*')
        .gte('tanggal', tanggalDari)
        .lte('tanggal', tanggalSampai);
      
      if (mapel) querySesi = querySesi.eq('mata_pelajaran', mapel);
      if (guru) querySesi = querySesi.eq('guru_uid', guru);
      if (kelasFilter) querySesi = querySesi.eq('kelas', kelasFilter);
      
      const { data: sesiData } = await querySesi.order('created_at', { ascending: true });
      setSesiList(sesiData || []);
      const sesiIds = sesiData?.map(s => s.id) || [];
      
      // 2. Fetch Siswa
      let querySiswa = insforge.database.from('siswa').select('*');
      if (kelasFilter) querySiswa = querySiswa.eq('kelas', kelasFilter);
      const { data: siswaData } = await querySiswa.order('nama_lengkap', { ascending: true });
      setDaftarSiswa(siswaData || []);
      
      // 3. Fetch Kehadiran
      if (sesiIds.length > 0) {
        const { data: hadirData } = await insforge.database.from('kehadiran')
          .select('*')
          .in('session_id', sesiIds);
        setKehadiranList(hadirData || []);
      } else {
        setKehadiranList([]);
      }
    } catch (err) {
      console.error('Error fetching rekap:', err);
    } finally {
      setLoading(false);
    }
  }, [isOperator, profil?.mataPelajaran, filterMapel, filterGuru, tanggalDari, tanggalSampai, kelasFilter, user?.id]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  // Build data tabel
  const tabelData = daftarSiswa.map(siswa => {
    const waktuPerSesi = sesiList.map(sesi => {
      const hadir = kehadiranList.find(
        k => k.student_id === siswa.id && k.session_id === sesi.id
      );
      return hadir
        ? new Date(hadir.scanned_at).toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', hour12: false
          })
        : '—';
    });
    const jumlahHadir = waktuPerSesi.filter(w => w !== '—').length;
    const persentase = sesiList.length > 0
      ? Math.round((jumlahHadir / sesiList.length) * 100)
      : 0;
    return { ...siswa, waktuPerSesi, jumlahHadir, persentase };
  });

  const totalSiswa = daftarSiswa.length;
  const totalKehadiran = kehadiranList.length;
  const totalSesi = sesiList.length;
  const persentaseTotal = (totalSiswa > 0 && totalSesi > 0) 
    ? Math.round((totalKehadiran / (totalSiswa * totalSesi)) * 100) 
    : 0;

  const handleExportCSV = () => {
    if (tabelData.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setIsExporting(true);
    
    const headerRow = ['No', 'Nama Lengkap', 'NIS', 'NISN', 'Kelas', 'Hadir', '% Kehadiran', ...sesiList.map((_, i) => `Sesi ${i + 1}`)];
    const csvContent = [
      headerRow.join(','),
      ...tabelData.map((row, i) => [
        i + 1,
        `"${row.nama_lengkap}"`,
        `"${row.nis}"`,
        `"${row.nisn || ''}"`,
        `"${row.kelas}"`,
        row.jumlahHadir,
        `${row.persentase}%`,
        ...row.waktuPerSesi.map((w: string) => `"${w}"`)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const mapelName = (isOperator ? filterMapel : profil?.mataPelajaran) || 'semua';
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_kehadiran_${mapelName}_${tanggalDari}_sd_${tanggalSampai}.csv`);
    link.click();
    
    setTimeout(() => setIsExporting(false), 500);
  };

  const resetFilter = () => {
    setKelasFilter('');
    setFilterMapel('');
    setFilterGuru('');
    setTanggalTunggal(today);
    setTanggalMulai(today);
    setTanggalSelesai(today);
    setWaktuMode('tunggal');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500 font-medium">Memuat data...</span>
      </div>
    );
  }

  if (!isOperator && !profil?.mataPelajaran) {
    return (
      <>
        <Header title="Rekap Kehadiran" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Profil Belum Lengkap</h3>
          <p className="text-slate-600 text-sm">
            Silakan isi mata pelajaran di halaman <strong>Pengaturan</strong> terlebih dahulu.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title={isOperator ? "Rekap Kehadiran Sekolah" : `Rekap Kehadiran — ${profil?.mataPelajaran}`}
        subtitle="Pantau dan kelola data kehadiran siswa secara keseluruhan"
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KartuStatistik icon={Users} label="Total Siswa" value={loading ? '...' : totalSiswa} />
        <KartuStatistik icon={CalendarCheck} label="Total Kehadiran" value={loading ? '...' : totalKehadiran} />
        <KartuStatistik icon={Percent} label="Persentase Kehadiran" value={loading ? '...' : `${persentaseTotal}%`} />
        <KartuStatistik icon={Calendar} label="Total Sesi" value={loading ? '...' : totalSesi} />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0">
              <button 
                onClick={() => setWaktuMode('tunggal')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${waktuMode === 'tunggal' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tunggal
              </button>
              <button 
                onClick={() => setWaktuMode('rentang')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${waktuMode === 'rentang' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Rentang
              </button>
            </div>

            {waktuMode === 'tunggal' ? (
              <input 
                type="date" 
                value={tanggalTunggal}
                onChange={e => setTanggalTunggal(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
              />
            ) : (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
                />
                <span className="text-slate-400 font-medium">-</span>
                <input 
                  type="date" 
                  value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
                />
              </div>
            )}

            <select 
              value={kelasFilter}
              onChange={e => setKelasFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium min-w-[120px]"
            >
              <option value="">Semua Kelas</option>
              {daftarKelas.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>

            {isOperator && (
              <>
                <select 
                  value={filterMapel}
                  onChange={e => {
                    setFilterMapel(e.target.value);
                    setFilterGuru(''); // Reset guru saat mapel berubah
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium"
                >
                  <option value="">Semua Mata Pelajaran</option>
                  {daftarMapel.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select 
                  value={filterGuru}
                  onChange={e => setFilterGuru(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium max-w-[200px]"
                >
                  <option value="">Semua Guru</option>
                  {daftarGuru.map(g => (
                    <option key={g.id} value={g.id}>{g.display_name}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={resetFilter} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
            <RotateCcw size={16} />
            Reset Filter
          </button>
          <button 
            onClick={handleExportCSV} 
            disabled={isExporting || tabelData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm shadow-sm shadow-emerald-200 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Ekspor CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <span className="ml-3 text-slate-500 font-medium">Memuat data kehadiran...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 w-12 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200">No</th>
                  <th className="px-6 py-4 sticky left-[60px] bg-slate-50 z-10 border-r border-slate-200">Nama Lengkap</th>
                  <th className="px-4 py-4">NIS</th>
                  <th className="px-4 py-4">NISN</th>
                  <th className="px-4 py-4">Kelas</th>
                  <th className="px-4 py-4 text-center">Hadir</th>
                  <th className="px-4 py-4 text-center">% Kehadiran</th>
                  {sesiList.map((_, i) => (
                    <th key={i} className="px-4 py-4 text-center">Sesi {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tabelData.length > 0 ? tabelData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-100">{idx + 1}</td>
                    <td className="px-6 py-3 sticky left-[60px] bg-white z-10 border-r border-slate-100">
                      <div className="font-semibold text-slate-800">{item.nama_lengkap}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{item.nis}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.nisn || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {item.kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-emerald-600">{item.jumlahHadir}/{totalSesi}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.persentase >= 75 ? 'bg-emerald-500' : item.persentase >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.persentase}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold w-8">{item.persentase}%</span>
                      </div>
                    </td>
                    {item.waktuPerSesi.map((w: string, i: number) => (
                      <td key={i} className="px-4 py-3 text-center text-xs">
                        {w === '—' ? <span className="text-slate-300 font-bold">—</span> : <span className="font-medium text-slate-600">{w}</span>}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7 + sesiList.length} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data siswa yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
