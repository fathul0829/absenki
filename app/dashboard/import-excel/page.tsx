"use client";
import React, { useRef, useState } from 'react';
import Header from '@/components/Header';
import { Download, UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { addSiswaBatch, updateQrImageUrl, getSiswa } from '@/lib/siswa';
import { uploadQRCode } from '@/lib/storage';
import { generateQRCode } from '@/lib/qr';

type RowData = {
  No?: number;
  "Nama Lengkap"?: string;
  NIS?: string;
  NISN?: string;
  Kelas?: string;
};

type PreviewData = {
  id: number;
  namaLengkap: string;
  nis: string;
  nisn: string;
  kelas: string;
  status: 'Valid' | 'Error';
  keterangan: string;
};

export default function ImportExcelPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

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

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<RowData>(sheet);
      
      const parsedData: PreviewData[] = [];
      const nisSet = new Set<string>();

      // Cek NIS yang sudah ada di database InsForge
      let existingNis = new Set<string>();
      try {
        const existingStudents = await getSiswa();
        existingNis = new Set(existingStudents.map(s => s.nis));
      } catch (err) {
        console.error('Error checking existing NIS:', err);
      }

      rows.forEach((row, index) => {
        const namaLengkap = row["Nama Lengkap"] || '';
        const nis = row["NIS"] ? String(row["NIS"]) : '';
        const nisn = row["NISN"] ? String(row["NISN"]) : '';
        const kelas = row["Kelas"] || '';
        
        let status: 'Valid' | 'Error' = 'Valid';
        let keterangan = '-';

        if (!namaLengkap || !nis || !nisn || !kelas) {
          status = 'Error';
          keterangan = 'Ada kolom yang kosong';
        } else if (nisSet.has(nis)) {
          status = 'Error';
          keterangan = 'NIS duplikat dalam file';
        } else if (existingNis.has(nis)) {
          status = 'Error';
          keterangan = 'NIS sudah ada di database';
        }

        if (nis) {
          nisSet.add(nis);
        }

        parsedData.push({
          id: index + 1,
          namaLengkap,
          nis,
          nisn,
          kelas,
          status,
          keterangan
        });
      });

      setPreviewData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveData = async () => {
    const validRows = previewData.filter(row => row.status === 'Valid');
    if (validRows.length === 0) {
      alert('Tidak ada data valid untuk disimpan.');
      return;
    }

    setIsSaving(true);
    setSaveProgress({ current: 0, total: validRows.length });

    try {
      // 1. Siapkan array data siswa untuk batch insert
      const arrayOfSiswa = validRows.map(row => ({
        nama_lengkap: row.namaLengkap,
        nis: row.nis,
        nisn: row.nisn,
        kelas: row.kelas,
      }));

      // 2. Batch insert ke InsForge
      const savedStudents = await addSiswaBatch(arrayOfSiswa);

      // 3. Generate dan upload QR code untuk setiap siswa yang berhasil
      const skipped: string[] = [];
      for (let i = 0; i < savedStudents.length; i++) {
        const siswa = savedStudents[i];
        setSaveProgress({ current: i + 1, total: savedStudents.length });

        try {
          // Generate QR code
          const qrBlob = await generateQRCode(siswa);
          // Upload QR ke storage
          const qrUrl = await uploadQRCode(siswa.id, qrBlob);
          // Update URL di database
          await updateQrImageUrl(siswa.id, qrUrl);
        } catch (qrErr) {
          console.error(`Error generate/upload QR for ${siswa.nis}:`, qrErr);
          skipped.push(siswa.nis);
        }
      }

      // 4. Tampilkan notifikasi sukses
      let message = `${savedStudents.length} siswa berhasil disimpan!`;
      if (skipped.length > 0) {
        message += `\n${skipped.length} QR code gagal digenerate (NIS: ${skipped.join(', ')})`;
      }
      alert(message);

      // 5. Redirect ke halaman data siswa
      router.push('/dashboard/data-siswa');
    } catch (err: unknown) {
      console.error('Error saving data:', err);
      if (err instanceof Error && err.message?.includes('duplicate')) {
        alert('Beberapa NIS sudah terdaftar di database. Periksa kembali data Anda.');
      } else {
        alert('Terjadi kesalahan saat menyimpan data.');
      }
    } finally {
      setIsSaving(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  const validCount = previewData.filter(r => r.status === 'Valid').length;
  const errorCount = previewData.filter(r => r.status === 'Error').length;

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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer h-full ${
              isDragging ? 'border-emerald-500 bg-emerald-100/50' : 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50 hover:border-emerald-300'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 mb-6">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {isDragging ? 'Lepaskan file di sini' : 'Klik atau Drag & Drop file Anda di sini'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Format yang didukung: .xlsx, .xls. Maksimal ukuran file 5MB.
            </p>
            <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-sm hover:bg-emerald-600 transition-colors pointer-events-none">
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
      {previewData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-8">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Preview Data</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                <CheckCircle2 size={16} /> {validCount} Valid
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                <AlertCircle size={16} /> {errorCount} Error
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
                {previewData.map((row) => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${row.status === 'Error' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium">{row.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{row.namaLengkap}</td>
                    <td className="px-6 py-4 font-mono">{row.nis}</td>
                    <td className="px-6 py-4 font-mono">{row.nisn}</td>
                    <td className="px-6 py-4">{row.kelas}</td>
                    <td className="px-6 py-4">
                      {row.status === 'Valid' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Valid</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">Error</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-xs font-medium ${row.status === 'Error' ? 'text-red-600' : 'text-slate-400'}`}>
                      {row.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Progress Bar */}
      {isSaving && saveProgress.total > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">
              Menyimpan dan generate QR Code... ({saveProgress.current}/{saveProgress.total})
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/data-siswa">
          <button className="px-6 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            Batal
          </button>
        </Link>
        <button 
          onClick={handleSaveData}
          disabled={validCount === 0 || isSaving}
          className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? 'Menyimpan...' : 'Simpan Semua Data'}
        </button>
      </div>
    </>
  );
}
