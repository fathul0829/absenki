import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { 
  Users, 
  CalendarClock, 
  UserCheck, 
  Percent,
  ScanLine,
  FileSpreadsheet,
  ClipboardList,
  BookOpen,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const weeklyData = [
    { name: 'Sen', value: 85 },
    { name: 'Sel', value: 78 },
    { name: 'Rab', value: 90 },
    { name: 'Kam', value: 82 },
    { name: 'Jum', value: 88 },
    { name: 'Sab', value: 0 },
    { name: 'Min', value: 87 }
  ];

  return (
    <>
      <Header 
        title={<span>Halo, Guru</span>} 
        rightContent={<div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2"><Calendar size={18} /> {today}</div>}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-800">32</h3>
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
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sudah Hadir</p>
            <h3 className="text-2xl font-bold text-slate-800">28</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Persentase</p>
            <h3 className="text-2xl font-bold text-slate-800">87,5%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/dashboard/scan-absen" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ScanLine size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Scan Absen</span>
              </Link>
              <Link href="/dashboard/import-excel" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Import Excel</span>
              </Link>
              <Link href="/dashboard/data-siswa" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Data Siswa</span>
              </Link>
              <Link href="/dashboard/rekap-kehadiran" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Rekap</span>
              </Link>
            </div>
          </section>

          {/* Today's Sessions */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Sesi Hari Ini</h3>
              <Link href="/dashboard/rekap-kehadiran" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Lihat Semua</Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-6 py-4">Mata Pelajaran</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">Matematika</td>
                    <td className="px-6 py-4">XII IPA 1</td>
                    <td className="px-6 py-4">07:30 - 09:00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Selesai
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">Fisika</td>
                    <td className="px-6 py-4">XII IPA 2</td>
                    <td className="px-6 py-4">09:15 - 10:45</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Berlangsung
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">Biologi</td>
                    <td className="px-6 py-4">XII IPA 1</td>
                    <td className="px-6 py-4">11:00 - 12:30</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Belum Mulai
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Weekly Chart */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Kehadiran Mingguan</h3>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" formatter={(val: number) => `${val}%`} style={{ fontSize: '10px', fill: '#10b981', fontWeight: 600 }} />
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm font-medium text-slate-600">Rata-rata kehadiran: 85%</div>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Aktivitas Terakhir</h3>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ScanLine size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sesi absen Fisika selesai</p>
                    <p className="text-xs text-slate-500 mt-1">Hari ini, 10:45 • Kelas XII IPA 2</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Import 32 data siswa sukses</p>
                    <p className="text-xs text-slate-500 mt-1">Kemarin, 14:20</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sesi absen Matematika selesai</p>
                    <p className="text-xs text-slate-500 mt-1">Kemarin, 09:00 • Kelas XII IPA 1</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                Lihat Semua Aktivitas
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
