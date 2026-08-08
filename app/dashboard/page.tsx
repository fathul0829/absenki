"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Calendar,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { insforge } from '@/lib/insforge';

export default function DashboardPage() {
  const { user, profil, loading: authLoading } = useAuth();
  const [loadingStats, setLoadingStats] = useState(true);

  const [totalSiswa, setTotalSiswa] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [sesiHariIni, setSesiHariIni] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{name: string, value: number}[]>([]);

  const todayStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchStats = useCallback(async () => {
    if (!profil?.mataPelajaran) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      // 1. Total Siswa
      const { count: countSiswa } = await insforge.database
        .from('siswa')
        .select('*', { count: 'exact', head: true });
      
      const tSiswa = countSiswa || 0;
      setTotalSiswa(tSiswa);

      // 2. Hadir Hari Ini
      const today = new Date().toISOString().split('T')[0];
      const { count: countHadir } = await insforge.database
        .from('kehadiran')
        .select('*', { count: 'exact', head: true })
        .eq('mata_pelajaran', profil.mataPelajaran)
        .gte('scanned_at', `${today}T00:00:00`)
        .lte('scanned_at', `${today}T23:59:59`);
      
      setHadirHariIni(countHadir || 0);

      // 3. Sesi Hari ini (opsional, bisa diambil dari sesi_absen)
      const { count: countSesi } = await insforge.database
        .from('sesi_absen')
        .select('*', { count: 'exact', head: true })
        .eq('guru_uid', user?.id || '')
        .eq('tanggal', today);
      
      setSesiHariIni(countSesi || 0);

      // 4. Grafik Mingguan (5 hari kerja terakhir)
      // Buat array 5 hari terakhir
      const last5Days = Array.from({length: 5}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (4 - i));
        return {
          date: d.toISOString().split('T')[0],
          name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        };
      });

      const startDate = last5Days[0].date;
      const endDate = last5Days[4].date;

      const { data: weeklyKehadiran } = await insforge.database
        .from('kehadiran')
        .select('scanned_at')
        .eq('mata_pelajaran', profil.mataPelajaran)
        .gte('scanned_at', `${startDate}T00:00:00`)
        .lte('scanned_at', `${endDate}T23:59:59`);

      const newWeeklyData = last5Days.map(day => {
        const count = weeklyKehadiran?.filter(k => k.scanned_at.startsWith(day.date)).length || 0;
        const persentase = tSiswa > 0 ? Math.round((count / tSiswa) * 100) : 0;
        return {
          name: day.name,
          value: persentase
        };
      });

      setWeeklyData(newWeeklyData);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoadingStats(false);
    }
  }, [profil?.mataPelajaran, user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading, fetchStats]);

  const persentaseHariIni = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;
  const avgWeekly = weeklyData.length > 0 ? Math.round(weeklyData.reduce((acc, curr) => acc + curr.value, 0) / weeklyData.length) : 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500 font-medium">Memuat data...</span>
      </div>
    );
  }

  const namaGuru = profil?.displayName || 'Guru';

  return (
    <>
      <Header 
        title={<span>Halo, {namaGuru} 👋</span>} 
        rightContent={<div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2"><Calendar size={18} /> {todayStr}</div>}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loadingStats ? <Loader2 size={20} className="animate-spin" /> : totalSiswa}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sesi Hari Ini</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loadingStats ? <Loader2 size={20} className="animate-spin" /> : sesiHariIni}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sudah Hadir</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loadingStats ? <Loader2 size={20} className="animate-spin" /> : hadirHariIni}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Persentase</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {loadingStats ? <Loader2 size={20} className="animate-spin" /> : `${persentaseHariIni}%`}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
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

          {/* Profil belum lengkap alert */}
          {!profil?.mataPelajaran && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Profil Belum Lengkap</h3>
              <p className="text-slate-600 text-sm">
                Statistik belum bisa ditampilkan dengan akurat. Silakan isi mata pelajaran di halaman <strong>Pengaturan</strong>.
              </p>
            </div>
          )}

          {/* Today's Sessions (Dummy for now or can fetch sessions) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Sesi Hari Ini</h3>
              <Link href="/dashboard/rekap-kehadiran" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Lihat Semua</Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <div className="p-6 text-center text-sm text-slate-500 min-w-max">
                Data sesi terintegrasi otomatis dengan absensi.
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Weekly Chart */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Kehadiran Mingguan</h3>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              {loadingStats ? (
                <div className="w-full h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
              ) : (
                <>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="value" position="top" formatter={(val: any) => `${val}%`} style={{ fontSize: '10px', fill: '#10b981', fontWeight: 600 }} />
                          {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#10b981" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm font-medium text-slate-600">Rata-rata kehadiran: {avgWeekly}%</div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
