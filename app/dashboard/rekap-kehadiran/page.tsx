"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { Download, RotateCcw, Users, CalendarCheck, Loader2 } from 'lucide-react';
import { daftarKelas } from '@/constants/kelas';
import { useAuth } from '@/context/AuthContext';
import { getRekapKehadiran, type Kehadiran, type FilterRekap } from '@/lib/kehadiran';
import { exportKehadiranCSV } from '@/lib/export';

export default function RekapKehadiranPage() {
  const { profil, loading: authLoading } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const [waktuMode, setWaktuMode] = useState<'tunggal' | 'rentang'>('tunggal');
  const [tanggalTunggal, setTanggalTunggal] = useState(today);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [kelasFilter, setKelasFilter] = useState('');
  const [dataRekap, setDataRekap] = useState<Kehadiran[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Hitung tanggal dari & sampai berdasarkan mode
  const tanggalDari = waktuMode === 'tunggal' ? tanggalTunggal : tanggalMulai;
  const tanggalSampai = waktuMode === 'tunggal' ? tanggalTunggal : tanggalSelesai;

  const fetchRekap = useCallback(async () => {
    if (!profil?.mataPelajaran) return;
    if (!tanggalDari || !tanggalSampai) return;

    setLoading(true);
    try {
      const filter: FilterRekap = {
        mataPelajaran: profil.mataPelajaran,
        tanggalDari,
        tanggalSampai,
        kelas: kelasFilter || undefined,
      };
      const data = await getRekapKehadiran(filter);
      setDataRekap(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching rekap:', err);
    } finally {
      setLoading(false);
    }
  }, [profil?.mataPelajaran, tanggalDari, tanggalSampai, kelasFilter]);

  // Fetch data saat filter berubah
  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const handleExportCSV = () => {
    if (dataRekap.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setIsExporting(true);
    try {
      const mapel = profil?.mataPelajaran?.replace(/\s+/g, '_') || 'mapel';
      const filename = `rekap_kehadiran_${mapel}_${tanggalDari}_sd_${tanggalSampai}.csv`;
      exportKehadiranCSV(dataRekap, filename);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const resetFilter = () => {
    setKelasFilter('');
    setTanggalTunggal(today);
    setTanggalMulai(today);
    setTanggalSelesai(today);
    setWaktuMode('tunggal');
  };

  // Loading state auth
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

  // Pagination logic
  const totalPages = Math.ceil(dataRekap.length / itemsPerPage) || 1;
  const paginatedData = dataRekap.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = dataRekap.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, dataRekap.length);

  return (
    <>
      <Header 
        title={`Rekap Kehadiran — ${profil.mataPelajaran}`}
        subtitle="Pantau dan kelola data kehadiran siswa secara keseluruhan"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Kehadiran</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loading ? <Loader2 size={20} className="animate-spin" /> : dataRekap.length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Siswa Unik</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loading ? <Loader2 size={20} className="animate-spin" /> : new Set(dataRekap.map(d => d.student_id)).size}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
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

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          {waktuMode === 'tunggal' ? (
            <div className="relative">
              <input 
                type="date" 
                value={tanggalTunggal}
                onChange={e => setTanggalTunggal(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="date" 
                  value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
                />
              </div>
              <span className="text-slate-400 font-medium">-</span>
              <div className="relative">
                <input 
                  type="date" 
                  value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" 
                />
              </div>
            </div>
          )}

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

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
        </div>

        <div className="flex items-center gap-3">
          <button onClick={resetFilter} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
            <RotateCcw size={16} />
            Reset Filter
          </button>
          <button 
            onClick={handleExportCSV} 
            disabled={isExporting || dataRekap.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm shadow-sm shadow-emerald-200 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Ekspor CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <span className="ml-3 text-slate-500 font-medium">Memuat data kehadiran...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">NIS</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Waktu Scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-slate-500">{startItem + idx}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${item.nama_lengkap.replace(/\s+/g, '+')}&background=f8fafc&color=64748b`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{item.nama_lengkap}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{item.nis}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(item.scanned_at).toLocaleString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      })}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data kehadiran yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination & Total */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Tampilkan</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-1 pl-2 pr-6"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-slate-500">
              Total: <span className="font-bold text-slate-800">{dataRekap.length}</span> siswa hadir
            </span>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:text-slate-400"
            >
              Sebelumnya
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${currentPage === i + 1 ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:text-slate-400"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
