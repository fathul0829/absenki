"use client";
import React from 'react';
import Header from '@/components/Header';
import { Download, RotateCcw, Filter, Users, CalendarCheck, Percent, CalendarClock } from 'lucide-react';
import { daftarKelas } from '@/constants/kelas';
import Papa from 'papaparse';

export default function RekapKehadiranPage() {
  const rekapData = [
    { id: 1, nama: 'Siswa Teladan 1', nis: '101155', kelas: 'XII.1', totalSesi: 45, hadir: 42, persentase: '93%', status: 'Sangat Baik' },
    { id: 2, nama: 'Siswa Teladan 2', nis: '101255', kelas: 'XII.1', totalSesi: 45, hadir: 42, persentase: '93%', status: 'Sangat Baik' },
    { id: 3, nama: 'Siswa Teladan 3', nis: '101355', kelas: 'XII.1', totalSesi: 45, hadir: 42, persentase: '93%', status: 'Sangat Baik' },
    { id: 4, nama: 'Siswa Teladan 4', nis: '101455', kelas: 'XII.1', totalSesi: 45, hadir: 34, persentase: '75%', status: 'Cukup' },
    { id: 5, nama: 'Siswa Teladan 5', nis: '101555', kelas: 'XII.1', totalSesi: 45, hadir: 42, persentase: '93%', status: 'Sangat Baik' },
  ];

  const handleExportCSV = () => {
    const csvData = rekapData.map(item => ({
      'Nama Siswa': item.nama,
      'NIS': item.nis,
      'Kelas': item.kelas,
      'Total Sesi': item.totalSesi,
      'Hadir': item.hadir,
      'Persentase': item.persentase,
      'Status': item.status
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'Rekap_Kehadiran_AbsenKi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header 
        title="Rekap Kehadiran" 
        subtitle="Pantau dan kelola data kehadiran siswa secara keseluruhan"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-800">120</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Kehadiran</p>
            <h3 className="text-2xl font-bold text-slate-800">1.450</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tingkat Kehadiran</p>
            <h3 className="text-2xl font-bold text-slate-800">92,4%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sesi Hari Ini</p>
            <h3 className="text-2xl font-bold text-slate-800">3</h3>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input type="date" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" />
          </div>
          <span className="text-slate-400 font-medium">-</span>
          <div className="relative">
            <input type="date" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block py-2 px-3 font-medium" />
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium min-w-[120px]">
            <option value="">Semua Kelas</option>
            {daftarKelas.map(kelas => (
              <option key={kelas} value={kelas}>{kelas}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
            <RotateCcw size={16} />
            Reset Filter
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm shadow-sm shadow-emerald-200 transition-colors">
            <Download size={16} />
            Ekspor CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4">
          <button className="px-6 py-4 text-sm font-bold text-emerald-600 border-b-2 border-emerald-500">
            Rekap per Siswa
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-center">Total Sesi</th>
                <th className="px-6 py-4 text-center">Hadir</th>
                <th className="px-6 py-4">Persentase</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${item.nama.replace(/\s+/g, '+')}&background=f8fafc&color=64748b`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{item.nama}</div>
                        <div className="text-xs font-mono text-slate-500">{item.nis}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{item.kelas}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">{item.totalSesi}</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-600">{item.hadir}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: item.persentase }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{item.persentase}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'Cukup' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        {item.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Tampilkan</span>
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-1 pl-2 pr-6">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-slate-500">per halaman</span>
          </div>
          
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 text-slate-400 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 shadow-sm shadow-emerald-200">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
