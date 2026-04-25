import React, { useState, useEffect } from 'react';
import { Hash, Search, FileText, Receipt, Loader2, Calendar, Edit2, Trash2, X } from 'lucide-react';
import { adService } from '../services/adService';
import { Quotation, Invoice } from '../types';

export default function DocumentNumberManager() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    date: '',
    subject: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [qData, iData] = await Promise.all([
      adService.getQuotations(),
      adService.getInvoices()
    ]);
    setQuotations(qData || []);
    setInvoices(iData || []);
    setLoading(false);
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setFormData({
      number: doc.number,
      date: doc.date,
      subject: doc.subject
    });
    setShowEditForm(true);
  };

  const handleDelete = async (doc: any) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${doc.docType} ini?`)) {
      if (doc.docType === 'Quotation') {
        await adService.deleteQuotation(doc.id);
      } else {
        await adService.deleteInvoice(doc.id);
      }
      fetchData();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    if (editingDoc.docType === 'Quotation') {
      await adService.updateQuotation(editingDoc.id, formData);
    } else {
      await adService.updateInvoice(editingDoc.id, formData);
    }

    setShowEditForm(false);
    setEditingDoc(null);
    fetchData();
  };

  const allDocs = [
    ...quotations.map(q => ({ ...q, docType: 'Quotation' as const })),
    ...invoices.map(i => ({ ...i, docType: 'Invoice' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredDocs = allDocs.filter(doc => 
    doc.number.toLowerCase().includes(filter.toLowerCase()) ||
    doc.clientName.toLowerCase().includes(filter.toLowerCase()) ||
    doc.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Database Nomor Surat</h1>
          <p className="text-slate-500 text-sm">Monitoring seluruh nomor dokumen penawaran dan invoice yang terbit.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nomor atau klien..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-full md:w-64 transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Dokumen</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klien</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perihal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                        doc.docType === 'Quotation' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {doc.docType === 'Quotation' ? <FileText size={12} /> : <Receipt size={12} />}
                        {doc.docType}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-slate-700">{doc.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(doc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{doc.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 line-clamp-1 italic">{doc.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(doc)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      Tidak ada data surat yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                 <Hash size={18} />
              </div>
              <h3 className="font-bold tracking-tight">Info Penomoran</h3>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Nomor surat dihasilkan secara otomatis mengikuti format sekuen tunggal: <br/>
              <span className="text-blue-400 font-mono">[No]/METARA/[Bulan]/[Tahun]</span> untuk Penawaran dan <br/>
              <span className="text-amber-400 font-mono">[No]/SPJ/METARA/[Bulan]/[Tahun]</span> untuk Invoice.
           </p>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-4">
              PT. Portal Digital Media Nusantara
           </div>
        </div>
      </div>

      {showEditForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Edit Nomor Surat</h3>
              <button onClick={() => setShowEditForm(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Dokumen</label>
                <input 
                  required
                  type="text" 
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perihal</label>
                <input 
                  required
                  type="text" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
