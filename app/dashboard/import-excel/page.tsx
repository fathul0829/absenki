"use client";
import React, { useRef } from 'react';
import Header from '@/components/Header';
import { Download, UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ImportExcelPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "No": 1, "Nama Lengkap": "Siswa Pertama", "NIS": "1001", "NISN": "001001001", "Kelas": "X.1" },
      { "No": 2, "Nama Lengkap": "Siswa Kedua", "NIS": "1002", "NISN": "001001002", "Kelas": "X.1" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Data_Siswa_AbsenKi.xlsx");
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="mb-2">
        <div className="flex items-center text-sm text-slate-500 font-medium">
          <Link href="/dashboard/data-siswa" className="hover:text-emerald-600 transition-colors">Data Siswa</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Import Excel</span>
        </div>
      </div>
      
      <Header 
        title="Import Data Siswa" 
        rightContent={
          <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
            <Download size={16} />
            Download Template
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div 
            onClick={handleFileClick}
            className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-12 flex flex-col items-center justify-center text-center transition-all hover:bg-emerald-50/50 hover:border-emerald-300 cursor-pointer h-full"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx,.xls" 
            />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 mb-6">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Klik atau Drag & Drop file Anda di sini</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Format yang didukung: .xlsx, .xls. Maksimal ukuran file 5MB.
            </p>
            <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-sm hover:bg-emerald-600 transition-colors">
              Pilih File Excel
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-blue-500" />
            Panduan Import
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Gunakan template excel yang telah disediakan</strong> untuk menghindari error format.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Pastikan <strong className="text-slate-800">tidak ada baris kosong</strong> di tengah-tengah data.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Nomor Induk Siswa (NIS) <strong className="text-slate-800">tidak boleh ada yang ganda.</strong>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Penulisan kelas harus seragam, misal: <strong className="text-slate-800">XII.1</strong>.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Preview Data</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
              <CheckCircle2 size={16} /> 30 Valid
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg">
              <AlertCircle size={16} /> 2 Error
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium">1</td>
                <td className="px-6 py-4 font-semibold text-slate-800">Ahmad Dahlan</td>
                <td className="px-6 py-4 font-mono">101155</td>
                <td className="px-6 py-4 font-mono">004123451</td>
                <td className="px-6 py-4">XII.1</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Valid</span>
                </td>
                <td className="px-6 py-4 text-slate-400">-</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors bg-red-50/30">
                <td className="px-6 py-4 font-medium">2</td>
                <td className="px-6 py-4 font-semibold text-slate-800">Siti Aminah</td>
                <td className="px-6 py-4 font-mono"></td>
                <td className="px-6 py-4 font-mono">004123452</td>
                <td className="px-6 py-4">XII.1</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">Error</span>
                </td>
                <td className="px-6 py-4 text-red-600 text-xs font-medium">NIS tidak boleh kosong</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium">3</td>
                <td className="px-6 py-4 font-semibold text-slate-800">Budi Santoso</td>
                <td className="px-6 py-4 font-mono">101157</td>
                <td className="px-6 py-4 font-mono">004123453</td>
                <td className="px-6 py-4">XII.1</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Valid</span>
                </td>
                <td className="px-6 py-4 text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/data-siswa">
          <button className="px-6 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            Batal
          </button>
        </Link>
        <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-sm hover:bg-emerald-600 transition-colors">
          Simpan Semua Data
        </button>
      </div>
    </>
  );
}
