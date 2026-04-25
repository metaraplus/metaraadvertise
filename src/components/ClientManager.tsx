import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, UserPlus, Users, X } from 'lucide-react';
import { adService } from '../services/adService';
import { Client } from '../types';

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await adService.getClients();
    if (data) setClients(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await adService.addClient(formData);
    setFormData({ name: '', address: '', contactPerson: '', email: '', phone: '' });
    setShowForm(false);
    loadClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Client Directory</h2>
          <p className="text-sm text-slate-500">Manage your advertisement partnerships</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-100"
        >
          <UserPlus size={18} />
          Tambah Klien Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                  <Users size={20} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">{client.name}</h3>
              <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed italic">{client.address}</p>
              
              <div className="space-y-2 border-t border-slate-50 pt-4">
                {client.contactPerson && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="font-bold w-12 text-slate-400 uppercase tracking-widest">PIC</span>
                    <span className="font-semibold text-slate-800">{client.contactPerson}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="font-bold w-12 text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="font-semibold text-slate-800">{client.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Register New Client</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2">
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Address</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone / WA</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  Simpan Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
