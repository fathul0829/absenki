"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { Search, Plus, Upload, Download, Trash2, Filter, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { daftarKelas } from '@/constants/kelas';
import { getSiswa, deleteSiswa, addSiswa, updateQrImageUrl, type Siswa } from '@/lib/siswa';
import { deleteQRCode, uploadQRCode } from '@/lib/storage';
import { generateQRCode } from '@/lib/qr';
import JSZip from 'jszip';
import QRCode from 'qrcode';

export default function DataSiswaPage() {
  const [students, setStudents] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Siswa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const [newStudent, setNewStudent] = useState({
    nama_lengkap: '',
    nis: '',
    nisn: '',
    kelas: daftarKelas[0],
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');

  // Ambil data siswa dari InsForge
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSiswa();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Tambah siswa manual
  const handleAddStudent = async () => {
    if (!newStudent.nama_lengkap || !newStudent.nis || !newStudent.nisn || !newStudent.kelas) {
      alert('Semua field wajib diisi');
      return;
    }

    setIsAdding(true);
    try {
      // 1. Simpan siswa ke database
      const siswa = await addSiswa({
        nama_lengkap: newStudent.nama_lengkap,
        nis: newStudent.nis,
        nisn: newStudent.nisn,
        kelas: newStudent.kelas,
      });

      if (siswa) {
        // 2. Generate QR code
        const qrBlob = await generateQRCode(siswa);
        // 3. Upload QR ke storage
        const qrUrl = await uploadQRCode(siswa.id, qrBlob);
        // 4. Update URL di database
        await updateQrImageUrl(siswa.id, qrUrl);
      }

      setIsAddModalOpen(false);
      setNewStudent({ nama_lengkap: '', nis: '', nisn: '', kelas: daftarKelas[0] });
      await fetchStudents();
    } catch (err: unknown) {
      console.error('Error adding student:', err);
      if (err instanceof Error && err.message?.includes('duplicate')) {
        alert(`NIS ${newStudent.nis} sudah terdaftar.`);
      } else {
        alert('Gagal menambahkan siswa. Silakan coba lagi.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Download QR code
  const handleDownloadQR = async (student: Siswa) => {
    if (!student.qr_image_url) {
      alert('QR Code belum tersedia untuk siswa ini.');
      return;
    }
    try {
      const response = await fetch(student.qr_image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${student.nama_lengkap.replace(/\s+/g, '_')}_${student.nis}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR:', err);
      alert('Gagal mengunduh QR Code.');
    }
  };

  // Cetak QR code
  const handlePrintQR = (student: Siswa) => {
    if (!student.qr_image_url) {
      alert('QR Code belum tersedia untuk siswa ini.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${student.nama_lengkap}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif; }
              img { width: 250px; height: 250px; }
              h2 { margin-top: 16px; font-size: 18px; color: #333; }
              p { margin: 4px 0; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <img src="${student.qr_image_url}" alt="QR Code" />
            <h2>${student.nama_lengkap}</h2>
            <p>NIS: ${student.nis}</p>
            <p>Kelas: ${student.kelas}</p>
            <script>window.onload = () => { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Download Semua QR
  const handleDownloadAllQR = async () => {
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      
      await Promise.all(filteredStudents.map(async (siswa) => {
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
          id: siswa.id,
          nama: siswa.nama_lengkap,
          nis: siswa.nis,
          nisn: siswa.nisn,
          kelas: siswa.kelas,
        }), {
          width: 300,
          margin: 2,
        });
        
        const base64 = qrDataUrl.split(',')[1];
        const fileName = `QR_${siswa.nama_lengkap.replace(/\s+/g, '_')}_${siswa.nis}.png`;
        zip.file(fileName, base64, { base64: true });
      }));
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const kelasName = kelasFilter || 'SemuaKelas';
      link.download = `QR_AbsenKi_Kelas${kelasName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      alert('Terjadi kesalahan saat mengunduh QR');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Cetak Semua QR
  const handlePrintAllQR = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cetak QR Code — AbsenKi'</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .qr-item {
          width: 62mm;
          height: 85mm;
          border: 1px dashed #999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          page-break-inside: avoid;
        }
        .qr-item img {
          width: 50mm;
          height: 50mm;
          object-fit: contain;
        }
        .qr-nama {
          font-size: 11px;
          font-weight: bold;
          text-align: center;
          margin-top: 6px;
          color: #111;
        }
        .qr-info {
          font-size: 9px;
          text-align: center;
          color: #555;
          margin-top: 2px;
        }
        .qr-kelas {
          font-size: 9px;
          text-align: center;
          color: #10b981;
          font-weight: 600;
          margin-top: 2px;
        }
        .header-print {
          text-align: center;
          margin-bottom: 8mm;
          padding-bottom: 4mm;
          border-bottom: 2px solid #10b981;
        }
        .header-print h1 {
          font-size: 18px;
          color: #10b981;
        }
        .header-print p {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
      </style>
    </head>
    <body>
      <div class="header-print">
        <h1>AbsenKi' — QR Code Siswa</h1>
        <p>Kelas: ${kelasFilter || 'Semua Kelas'} • Total: ${filteredStudents.length} siswa • Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <div class="grid">
    `);
    
    try {
      const qrItems = await Promise.all(filteredStudents.map(async (siswa) => {
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
          id: siswa.id,
          nama: siswa.nama_lengkap,
          nis: siswa.nis,
          nisn: siswa.nisn,
          kelas: siswa.kelas,
        }), {
          width: 300,
          margin: 2,
        });
        
        return `
        <div class="qr-item">
          <img src="${qrDataUrl}" alt="QR ${siswa.nama_lengkap}" />
          <div class="qr-nama">${siswa.nama_lengkap}</div>
          <div class="qr-info">NIS: ${siswa.nis} | NISN: ${siswa.nisn}</div>
          <div class="qr-kelas">Kelas ${siswa.kelas}</div>
        </div>
        `;
      }));
      
      printWindow.document.write(qrItems.join(''));
      
      printWindow.document.write(`
      </div>
    </body>
    </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.setTimeout(() => {
        printWindow.print();
      }, 500);
      
    } catch (err) {
      console.error('Error generating print view:', err);
      alert('Terjadi kesalahan saat menyiapkan cetak');
    }
  };

  // Konfirmasi hapus
  const confirmDelete = (student: Siswa) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  // Hapus siswa + QR dari storage
  const handleDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSiswa(studentToDelete.id);
      await deleteQRCode(studentToDelete.id);
      await fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Gagal menghapus siswa.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  // Filter & pagination
  const filteredStudents = students.filter(siswa => {
    const matchKelas = kelasFilter === '' || siswa.kelas === kelasFilter;
    const matchSearch = siswa.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        siswa.nis.includes(searchQuery);
    return matchKelas && matchSearch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const startItem = filteredStudents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredStudents.length);

  return (
    <>
      <Header 
        title="Data Siswa" 
        rightContent={
          <>
            <Link href="/dashboard/import-excel">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                <Upload size={16} />
                Import Excel
              </button>
            </Link>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm shadow-sm shadow-emerald-200 transition-colors">
              <Plus size={16} />
              Tambah Siswa
            </button>
          </>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select 
                value={kelasFilter}
                onChange={e => { setKelasFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-3 pr-10 py-2 w-full font-medium"
              >
                <option value="">Semua Kelas</option>
                {daftarKelas.map(kelas => (
                  <option key={kelas} value={kelas}>Kelas {kelas}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-2 placeholder-slate-400" 
                placeholder="Cari nama atau NIS..." 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadAllQR} 
              disabled={isDownloadingAll}
              className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isDownloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span className="hidden sm:inline">{isDownloadingAll ? 'Menyiapkan...' : 'Download Semua QR'}</span>
            </button>
            <button 
              onClick={handlePrintAllQR} 
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Cetak Semua QR</span>
            </button>
            <div className="text-sm font-medium text-slate-500 ml-2">
              Total <span className="text-slate-800 font-bold">{filteredStudents.length}</span> Siswa
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <span className="ml-3 text-slate-500 font-medium">Memuat data siswa...</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">No</th>
                    <th className="px-6 py-4 hidden md:table-cell">Foto</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">NIS / NISN</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4 text-center">QR Code</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-medium text-slate-500">{startItem + idx}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                          <img src={`https://ui-avatars.com/api/?name=${student.nama_lengkap.replace(/\s+/g, '+')}&background=f8fafc&color=64748b`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{student.nama_lengkap}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-700">{student.nis}</div>
                        <div className="text-xs text-slate-400 font-mono hidden md:block">{student.nisn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-block p-1 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                          {student.qr_image_url ? (
                            <img src={student.qr_image_url} alt="QR Code" className="w-8 h-8" />
                          ) : (
                            <div className="w-8 h-8 flex flex-wrap gap-0.5">
                              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                              <div className="w-3 h-3 bg-white"></div>
                              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                              <div className="w-3 h-3 bg-slate-800"></div>
                              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                              <div className="w-3 h-3 bg-white"></div>
                              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                              <div className="w-3 h-3 bg-white"></div>
                              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDownloadQR(student)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download QR">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handlePrintQR(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Cetak QR">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => confirmDelete(student)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        Belum ada data siswa
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  Menampilkan {startItem}-{endItem} dari {filteredStudents.length} siswa
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
                
                {[...Array(totalPages)].map((_, i) => (
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
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Siswa Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  value={newStudent.nama_lengkap} 
                  onChange={e => setNewStudent({...newStudent, nama_lengkap: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  value={newStudent.nis} 
                  onChange={e => setNewStudent({...newStudent, nis: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NISN</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  value={newStudent.nisn} 
                  onChange={e => setNewStudent({...newStudent, nisn: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  value={newStudent.kelas} 
                  onChange={e => setNewStudent({...newStudent, kelas: e.target.value})}
                >
                  {daftarKelas.map(kelas => (
                    <option key={kelas} value={kelas}>{kelas}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                disabled={isAdding}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleAddStudent} 
                disabled={isAdding}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isAdding && <Loader2 size={16} className="animate-spin" />}
                {isAdding ? 'Menyimpan...' : 'Tambahkan Siswa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Hapus</h2>
            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus data <span className="font-semibold">{studentToDelete?.nama_lengkap}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
