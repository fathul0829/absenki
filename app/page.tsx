'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-green-100 selection:text-green-800">
      {/* ========================================================================= */}
      {/* 1. NAVBAR                                                                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-[173px] h-[39.52px]">
              <Image
                src="/logo/logo side text 2(no bg).png"
                alt="AbsenKi Logo"
                fill
                className="object-contain object-left transition-transform group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-green-600 transition-colors">
              Beranda
            </a>
            <a href="#fitur" className="hover:text-green-600 transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-green-600 transition-colors">
              Cara Kerja
            </a>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-all shadow-sm shadow-green-600/20 active:scale-95"
            >
              Masuk
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <a
              href="#hero"
              onClick={() => setMenuOpen(false)}
              className="text-slate-600 hover:text-green-600 font-medium py-1.5"
            >
              Beranda
            </a>
            <a
              href="#fitur"
              onClick={() => setMenuOpen(false)}
              className="text-slate-600 hover:text-green-600 font-medium py-1.5"
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setMenuOpen(false)}
              className="text-slate-600 hover:text-green-600 font-medium py-1.5"
            >
              Cara Kerja
            </a>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-green-600 text-white text-center font-semibold rounded-xl py-2.5 mt-2 shadow-sm"
            >
              Masuk
            </Link>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-green-50/50 via-white to-white">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-green-100/40 via-emerald-50/20 to-teal-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Kiri: Teks & CTA */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-800 leading-[1.15] tracking-tight">
                Absensi Siswa<br />
                Jadi Lebih Mudah,<br />
                <span className="text-green-600">Cepat, dan Akurat</span>
              </h1>

              {/* Subheadline */}
              <p className="text-slate-600 text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
                Cukup scan QR code siswa — kehadiran langsung tercatat otomatis. Tanpa kertas, tanpa repot.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mt-8 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-7 py-3.5 font-semibold text-center transition-all shadow-md shadow-green-600/25 hover:shadow-lg hover:shadow-green-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Mulai Sekarang</span>
                  <span>→</span>
                </Link>
                <a
                  href="#fitur"
                  className="border border-green-600 text-green-600 hover:bg-green-50 rounded-xl px-6 py-3.5 font-semibold text-center transition-colors flex items-center justify-center"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>

            {/* Kanan: Mockup Dashboard (Laptop + HP) */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              {/* Laptop Frame */}
              <div className="w-full max-w-lg lg:max-w-xl rounded-2xl bg-slate-900 p-2.5 sm:p-3 shadow-2xl border border-slate-800 relative z-10 transition-transform hover:-translate-y-1 duration-300">
                <div className="rounded-xl bg-slate-50 overflow-hidden border border-slate-700/60 shadow-inner">
                  {/* Laptop Titlebar */}
                  <div className="bg-slate-800/95 px-3.5 py-2 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded">
                      <span className="text-green-400">🔒</span>
                      <span>absenki.vercel.app/dashboard</span>
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Laptop Screen Content (Mini AbsenKi Dashboard) */}
                  <div className="flex h-72 sm:h-80 bg-slate-100 text-slate-800 text-xs select-none">
                    {/* Sidebar Mini */}
                    <div className="w-24 sm:w-28 bg-slate-900 text-slate-400 p-2.5 flex flex-col justify-between shrink-0 border-r border-slate-800">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 px-1 py-1">
                          <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">
                            A
                          </div>
                          <span className="font-bold text-white text-[11px]">AbsenKi&apos;</span>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-green-600 text-white rounded-md px-2 py-1 font-semibold flex items-center gap-1.5 text-[10px]">
                            <span>📊</span> Dashboard
                          </div>
                          <div className="hover:bg-slate-800 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px]">
                            <span>👥</span> Siswa
                          </div>
                          <div className="hover:bg-slate-800 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px]">
                            <span>📷</span> Scan QR
                          </div>
                          <div className="hover:bg-slate-800 rounded-md px-2 py-1 flex items-center gap-1.5 text-[10px]">
                            <span>📑</span> Rekap
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-500 px-1 border-t border-slate-800 pt-2">
                        Guru SMAN 1
                      </div>
                    </div>

                    {/* Content Area Mini */}
                    <div className="flex-1 p-3 overflow-hidden flex flex-col gap-2.5">
                      {/* Top Header Mini */}
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                        <div>
                          <p className="text-[9px] text-slate-400">Selamat Datang,</p>
                          <p className="font-bold text-slate-800 text-[11px]">Bapak Fathul, S.Pd</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Sesi Aktif
                        </span>
                      </div>

                      {/* Stat Cards Mini */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                          <p className="text-[9px] text-slate-500">Total Siswa</p>
                          <p className="text-sm font-bold text-slate-800">128</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                          <p className="text-[9px] text-slate-500">Hadir</p>
                          <p className="text-sm font-bold text-green-600">115</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                          <p className="text-[9px] text-slate-500">Belum</p>
                          <p className="text-sm font-bold text-amber-500">13</p>
                        </div>
                      </div>

                      {/* Mini Table Presence */}
                      <div className="bg-white rounded-lg border border-slate-200/80 p-2 flex-1 shadow-2xs flex flex-col justify-between">
                        <div className="font-bold text-[10px] text-slate-700 mb-1 flex justify-between">
                          <span>Aktivitas Kehadiran Terkini</span>
                          <span className="text-[9px] text-green-600 font-normal">Lihat Semua</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] bg-slate-50 p-1 rounded">
                            <span className="font-medium text-slate-700">Ahmad Fauzi (XII IPA 1)</span>
                            <span className="text-green-600 font-semibold bg-green-50 px-1 rounded">07:15 Hadir</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] bg-slate-50 p-1 rounded">
                            <span className="font-medium text-slate-700">Siti Nurhaliza (XII IPA 1)</span>
                            <span className="text-green-600 font-semibold bg-green-50 px-1 rounded">07:18 Hadir</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] bg-slate-50 p-1 rounded">
                            <span className="font-medium text-slate-700">Budi Pratama (XII IPA 1)</span>
                            <span className="text-green-600 font-semibold bg-green-50 px-1 rounded">07:22 Hadir</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HP Mockup Overlay (Muncul di layar desktop / tablet) */}
              <div className="hidden sm:block absolute -bottom-6 -right-2 lg:-right-4 w-44 rounded-2xl bg-slate-900 p-1.5 shadow-2xl border border-slate-700 z-20 transition-transform hover:scale-105 duration-300">
                <div className="rounded-xl bg-white p-3 flex flex-col items-center text-center shadow-inner">
                  {/* Speaker Notch */}
                  <div className="w-10 h-1 bg-slate-200 rounded-full mb-2" />

                  <p className="text-[10px] font-bold text-slate-700 mb-2">Scan QR Code Siswa</p>

                  {/* QR Box Indicator */}
                  <div className="w-24 h-24 border-2 border-dashed border-green-500 rounded-lg bg-green-50/50 flex items-center justify-center p-2 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-green-500 animate-pulse" />
                    {/* SVG QR Code */}
                    <svg className="w-14 h-14 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 6h2v2h-2v-2z" />
                    </svg>
                  </div>

                  {/* Success Indicator */}
                  <div className="mt-2 bg-green-50 border border-green-200 text-green-700 rounded-md px-2 py-0.5 text-[9px] font-bold">
                    ✓ Berhasil Absen!
                  </div>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5">07:45:36 WIB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION STATISTIK / HIGHLIGHTS                                         */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Item 1 */}
          <div className="flex flex-col items-center px-4 pt-6 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3.5 shadow-2xs border border-green-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl text-slate-800">
              Scan dalam <span className="font-extrabold text-slate-900 text-2xl">1 Detik</span>
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Proses absensi super cepat dengan QR code.
            </p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center px-4 pt-6 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3.5 shadow-2xs border border-green-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl text-slate-800">
              <span className="font-extrabold text-slate-900 text-2xl">100%</span> Akurat
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Data kehadiran akurat dan tersimpan otomatis.
            </p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center px-4 pt-6 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3.5 shadow-2xs border border-green-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl text-slate-800">
              Tanpa Aplikasi <span className="font-extrabold text-slate-900 text-2xl">Siswa</span>
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Siswa tidak perlu instal aplikasi, cukup scan QR.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION FITUR UNGGULAN                                                 */}
      {/* ========================================================================= */}
      <section id="fitur" className="bg-slate-50 py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
              Fitur Unggulan AbsenKi&apos;
            </h2>
            <div className="w-12 h-1 bg-green-600 rounded-full mx-auto mt-3" />
            <p className="text-slate-500 text-sm sm:text-base mt-4">
              Dirancang untuk mempermudah operasional absensi sekolah dengan teknologi terkini.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs hover:shadow-md border border-slate-200/80 transition-all duration-200 flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 border border-green-100 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2.5">
                Import Data Siswa dari Excel
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Import data siswa dengan mudah melalui file Excel. Praktis dan menghemat waktu.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs hover:shadow-md border border-slate-200/80 transition-all duration-200 flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 border border-green-100 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2.5">
                Scan QR, Absen Tercatat
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Siswa scan QR code yang dibagikan, kehadiran langsung tercatat secara otomatis.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs hover:shadow-md border border-slate-200/80 transition-all duration-200 flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 border border-green-100 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2.5">
                Rekap Kehadiran Otomatis
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Lihat rekap kehadiran harian, mingguan, hingga bulanan secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION CARA KERJA                                                     */}
      {/* ========================================================================= */}
      <section id="cara-kerja" className="bg-white py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
              Cara Kerja AbsenKi&apos;
            </h2>
            <div className="w-12 h-1 bg-green-600 rounded-full mx-auto mt-3" />
            <p className="text-slate-500 text-sm sm:text-base mt-4">
              Tiga langkah mudah untuk memulai absensi digital di kelas Anda.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting Dashed Line (Desktop Only) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-green-200 z-0 pointer-events-none" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <span className="text-3xl font-extrabold text-green-600 mb-3 tracking-wider">
                01
              </span>
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 border border-green-200/80 shadow-xs bg-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Import Data Siswa
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Import data siswa dari Excel ke dalam sistem AbsenKi&apos;.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <span className="text-3xl font-extrabold text-green-600 mb-3 tracking-wider">
                02
              </span>
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 border border-green-200/80 shadow-xs bg-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Bagikan QR Code
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Bagikan QR code kelas kepada siswa untuk melakukan absensi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <span className="text-3xl font-extrabold text-green-600 mb-3 tracking-wider">
                03
              </span>
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 border border-green-200/80 shadow-xs bg-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Scan & Absen
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Siswa scan QR code, kehadiran langsung tercatat!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION CTA                                                            */}
      {/* ========================================================================= */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-green-600 via-green-600 to-emerald-700 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden text-white">
          {/* Decorative Dot Matrix Background */}
          <div 
            className="absolute -bottom-8 -right-8 w-64 h-64 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left Texts */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Siap Ubah Cara Absensi di Sekolah Anda?
              </h2>
              <p className="text-green-100 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                Bergabunglah dengan guru yang telah merasakan kemudahan absensi digital bersama AbsenKi&apos;.
              </p>
            </div>

            {/* Right Button */}
            <div className="shrink-0">
              <Link
                href="/login"
                className="bg-white text-slate-800 hover:bg-slate-50 font-semibold px-8 py-4 rounded-xl shadow-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Masuk dengan Google</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            {/* Left: Brand & Description & Social Icons */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative h-8 w-36 mb-2">
                <Image
                  src="absenki/public/logo/logo side text (w bg).png"
                  alt="AbsenKi Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                Absensi siswa jadi lebih mudah, cepat, dan akurat dengan AbsenKi&apos;.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 mt-4">
                {/* Facebook */}
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                {/* Email */}
                <a href="mailto:support@absenki.com" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Email">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Tribute Text */}
            <div className="text-slate-400 text-sm">
              Dibuat dengan <span className="text-red-500">❤️</span> untuk guru-guru Indonesia
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 my-8" />

          {/* Copyright */}
          <p className="text-slate-500 text-xs text-center">
            &copy; 2026 AbsenKi&apos;. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
