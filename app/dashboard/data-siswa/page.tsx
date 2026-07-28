"use client";
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Search, Plus, Upload, Download, Trash2, Filter } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { daftarKelas } from '@/constants/kelas';

export default function DataSiswaPage() {
  const [students, setStudents] = useState([
    { id: 1, nama: 'Siswa Teladan 1', jk: 'Laki-laki', nis: '101155', nisn: '004123451', kelas: 'XII.1', qr: '' },
    { id: 2, nama: 'Siswa Teladan 2', jk: 'Laki-laki', nis: '101255', nisn: '004123452', kelas: 'XII.1', qr: '' },
    { id: 3, nama: 'Siswa Teladan 3', jk: 'Laki-laki', nis: '101355', nisn: '004123453', kelas: 'XII.1', qr: '' },
    { id: 4, nama: 'Siswa Teladan 4', jk: 'Laki-laki', nis: '101455', nisn: '004123454', kelas: 'XII.1', qr: '' },
    { id: 5, nama: 'Siswa Teladan 5', jk: 'Laki-laki', nis: '101555', nisn: '004123455', kelas: 'XII.1', qr: '' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  const [newStudent, setNewStudent] = useState({
    nama: '',
    nis: '',
    nisn: '',
    kelas: daftarKelas[0]
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddStudent = async () => {
    if (!newStudent.nama || !newStudent.nis || !newStudent.nisn || !newStudent.kelas) {
      alert('Semua field wajib diisi');
      return;
    }
    const qrData = JSON.stringify({
      nama: newStudent.nama,
      nis: newStudent.nis,
      nisn: newStudent.nisn,
      kelas: newStudent.kelas
    });
    const qrImage = await QRCode.toDataURL(qrData);

    setStudents([
      ...students,
      {
        ...newStudent,
        id: Date.now(),
        jk: 'Laki-laki',
        qr: qrImage
      }
    ]);
    setIsAddModalOpen(false);
    setNewStudent({ nama: '', nis: '', nisn: '', kelas: daftarKelas[0] });
  };

  const handleDownloadQR = async (student: any) => {
    let qrDataURL = student.qr;
    if (!qrDataURL) {
      const qrData = JSON.stringify({ nama: student.nama, nis: student.nis, nisn: student.nisn, kelas: student.kelas });
      qrDataURL = await QRCode.toDataURL(qrData);
    }
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `QR_${student.nama.replace(/\s+/g, '_')}_${student.nis}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const totalPages = Math.ceil(students.length / itemsPerPage) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const startItem = students.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, students.length);

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
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-3 pr-10 py-2 w-full font-medium">
                <option value="">Semua Kelas</option>
                {daftarKelas.map(kelas => (
                  <option key={kelas} value={kelas}>Kelas {kelas}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input type="text" className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-2 placeholder-slate-400" placeholder="Cari nama atau NIS..." />
            </div>
          </div>
          
          <div className="text-sm font-medium text-slate-500">
            Total <span className="text-slate-800 font-bold">{students.length}</span> Siswa
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Foto</th>
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
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                      <img src={`https://ui-avatars.com/api/?name=${student.nama.replace(/\s+/g, '+')}&background=f8fafc&color=64748b`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{student.nama}</div>
                    <div className="text-xs text-slate-500">{student.jk}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-slate-700">{student.nis}</div>
                    <div className="text-xs text-slate-400 font-mono">{student.nisn}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {student.kelas}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-block p-1 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                      {student.qr ? (
                        <img src={student.qr} alt="QR Code" className="w-8 h-8" />
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
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDownloadQR(student)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download QR">
                        <Download size={18} />
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
              Menampilkan {startItem}-{endItem} dari {students.length} siswa
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
                  value={newStudent.nama} 
                  onChange={e => setNewStudent({...newStudent, nama: e.target.value})} 
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
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleAddStudent} 
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Tambahkan Siswa
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
              Apakah Anda yakin ingin menghapus data <span className="font-semibold">{studentToDelete?.nama}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
