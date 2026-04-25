import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2, 
  ChevronRight, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Calendar,
  DollarSign,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { adService } from '../services/adService';
import { Advertisement, Client } from '../types';
import DocumentGenerator from './DocumentGenerator';

export default function AdManager({ onAdUpdate }: { onAdUpdate: () => void }) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showDocGen, setShowDocGen] = useState(false);
  const [docType, setDocType] = useState<'quotation' | 'invoice'>('quotation');

  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ id: Math.random().toString(), packageName: 'Advertorial', serviceType: 'Banner Ads Web', quantity: 1, price: 1600000, totalPrice: 1600000 }],
    period: ''
  });

  const calculateTotal = (items: any[]) => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(), packageName: '', serviceType: '', quantity: 1, price: 0, totalPrice: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.totalPrice = updated.quantity * updated.price;
          return updated;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [adsData, clientsData] = await Promise.all([
      adService.getAds(),
      adService.getClients()
    ]);
    if (adsData) setAds(adsData);
    if (clientsData) setClients(clientsData);
    setLoading(false);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      clientId: ad.clientId,
      items: (ad.items || []).map(item => ({ ...item, id: item.id || Math.random().toString() })),
      period: ad.period
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus iklan ini?')) {
      await adService.deleteAd(id);
      loadData();
      onAdUpdate();
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const totalPrice = calculateTotal(formData.items);

    if (editingAd) {
      await adService.updateAd(editingAd.id!, {
        clientId: formData.clientId,
        clientName: client.name,
        items: formData.items,
        totalPrice: totalPrice,
        period: formData.period
      });
    } else {
      await adService.addAd({
        clientId: formData.clientId,
        clientName: client.name,
        items: formData.items,
        totalPrice: totalPrice,
        period: formData.period,
        status: 'Draft'
      });
    }

    setEditingAd(null);
    setFormData({
      clientId: '',
      items: [{ id: Math.random().toString(), packageName: 'Advertorial', serviceType: 'Banner Ads Web', quantity: 1, price: 1600000, totalPrice: 1600000 }],
      period: ''
    });
    setShowForm(false);
    loadData();
    onAdUpdate();
  };

  const handleDocGen = (ad: Advertisement, type: 'quotation' | 'invoice') => {
    setSelectedAd(ad);
    setDocType(type);
    setShowDocGen(true);
  };

  const updateAdStatus = async (id: string, status: any) => {
    await adService.updateAd(id, { status });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Advertisements</h2>
          <p className="text-sm text-slate-500">Track and manage advertisement orders</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-100"
        >
          <Plus size={18} />
          Buat Iklan Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klien / Deskripsi Iklan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing & Estimasi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Tayang</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Pembayaran</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Draft & Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-slate-900 uppercase tracking-tight">{ad.clientName}</p>
                    <div className="mt-1 space-y-0.5">
                      {ad.items && ad.items.length > 0 ? (
                        ad.items.map((item, idx) => (
                          <p key={idx} className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            {item.packageName} • {item.serviceType} ({item.quantity}x)
                          </p>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          {(ad as any).packageName || '-'} • {(ad as any).serviceType || '-'} ({(ad as any).quantity || 1}x)
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">Rp {ad.totalPrice.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{ad.items?.length || 1} Macam Paket</p>
                  </td>
                  <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <Calendar size={12} className="text-slate-400" />
                    {ad.period}
                   </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ad.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(ad)}
                        title="Edit Iklan"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ad.id!)}
                        title="Hapus Iklan"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDocGen(ad, 'quotation')}
                        title="Generate Penawaran"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => handleDocGen(ad, 'invoice')}
                        title="Generate Invoice"
                        className={`${ad.status === 'Draft' ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'} p-2 rounded-lg transition-all`}
                        disabled={ad.status === 'Draft'}
                      >
                        <Receipt size={18} />
                      </button>
                      {ad.status === 'Invoiced' && (
                        <button 
                          onClick={() => updateAdStatus(ad.id!, 'Paid')}
                          title="Tandai Sudah Bayar"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ads.length === 0 && (
            <div className="p-16 text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <FileText size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Belum ada database iklan yang tercatat.</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{editingAd ? 'Edit Order Iklan' : 'Order Iklan Baru'}</h3>
              <button onClick={() => { 
                setShowForm(false); 
                setEditingAd(null);
                setFormData({
                  clientId: '',
                  items: [{ id: Math.random().toString(), packageName: 'Advertorial', serviceType: 'Banner Ads Web', quantity: 1, price: 1600000, totalPrice: 1600000 }],
                  period: ''
                });
              }} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAd} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Klien</label>
                <select 
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">- Pilih Klien dari Database -</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daftar Paket & Layanan</label>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Tambah Paket
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative space-y-3">
                    {formData.items.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeItem(item.id!)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nama Paket</label>
                        <input 
                          type="text" 
                          required
                          value={item.packageName}
                          onChange={e => updateItem(item.id!, 'packageName', e.target.value)}
                          placeholder="e.g. Advertorial"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jenis Layanan</label>
                        <input 
                          type="text" 
                          required
                          value={item.serviceType}
                          onChange={e => updateItem(item.id!, 'serviceType', e.target.value)}
                          placeholder="e.g. Banner Ads"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">QTY</label>
                        <input 
                          type="number" 
                          required
                          value={item.quantity}
                          onChange={e => updateItem(item.id!, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit Price</label>
                        <input 
                          type="number" 
                          required
                          value={item.price}
                          onChange={e => updateItem(item.id!, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Penempatan</label>
                <input 
                  type="text" 
                  value={formData.period}
                  onChange={e => setFormData({...formData, period: e.target.value})}
                  placeholder="e.g. 1x tayang/1 bulan atau April 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Tagihan</p>
                  <p className="font-black text-xl text-slate-900 leading-tight">Rp {calculateTotal(formData.items).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100"
                  >
                    Simpan Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocGen && selectedAd && (
        <DocumentGenerator 
          ad={selectedAd} 
          type={docType} 
          client={clients.find(c => c.id === selectedAd.clientId)!}
          onClose={() => {
            setShowDocGen(false);
            loadData();
            onAdUpdate();
          }} 
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: any }) {
  const styles: any = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Quotation Sent': 'bg-blue-50 text-blue-600 border border-blue-100',
    'Invoiced': 'bg-amber-50 text-amber-600 border border-amber-100',
    'Paid': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    'Cancelled': 'bg-red-50 text-red-600 border border-red-100'
  };

  return (
    <span className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-full tracking-wider inline-flex items-center gap-1 ${styles[status]}`}>
      {status === 'Paid' && <CheckCircle2 size={10} />}
      {status === 'Invoiced' && <Clock size={10} />}
      {status}
    </span>
  );
}
