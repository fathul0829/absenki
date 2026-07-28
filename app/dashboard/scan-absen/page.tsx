import React from 'react';
import Header from '@/components/Header';
import { Camera, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

export default function ScanAbsenPage() {
  return (
    <>
      <Header 
        title="Scan Absensi" 
        subtitle="Arahkan kamera ke QR Code siswa untuk mencatat kehadiran"
      />

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
          <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 font-medium">
            <option>Matematika</option>
            <option>Bahasa Indonesia</option>
            <option>Fisika</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Kelas</label>
          <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 font-medium">
            <option>XII IPA 1</option>
            <option>XII IPA 2</option>
            <option>XI IPS 1</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tanggal</label>
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-24">
        {/* Left Column: Camera */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center shadow-lg border-4 border-slate-800">
            {/* Camera corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg z-10"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg z-10"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg z-10"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-lg z-10"></div>
            
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kamera Aktif
            </div>

            <div className="text-slate-500 flex flex-col items-center gap-3">
              <Camera size={48} className="opacity-50" />
              <p className="font-medium text-sm">Arahkan kamera ke QR Code siswa</p>
            </div>
            
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
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md">
                <img src="https://ui-avatars.com/api/?name=Budi+Santoso&background=10b981&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-800 leading-tight">Budi Santoso</h4>
                <div className="text-sm font-mono text-slate-500 mb-2">NIS: 101157 • Kelas XII IPA 1</div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={14} />
                    Hadir
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    07:45 WIB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Siswa Hadir <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-xs ml-2">15</span></h3>
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
                  <tr className="hover:bg-slate-50/50 bg-emerald-50/30">
                    <td className="px-4 py-3 font-medium">1</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">Budi Santoso</td>
                    <td className="px-4 py-3 font-mono text-xs">101157</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">07:45:12</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">2</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">Siti Aminah</td>
                    <td className="px-4 py-3 font-mono text-xs">101158</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">07:44:50</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">3</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">Ahmad Dahlan</td>
                    <td className="px-4 py-3 font-mono text-xs">101155</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">07:42:15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
