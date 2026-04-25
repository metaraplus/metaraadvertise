import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  FileText, 
  Receipt, 
  LayoutDashboard, 
  LogOut, 
  LogIn,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { adService } from './services/adService';
import { Advertisement, AdStatus } from './types';

// Components
import ClientManager from './components/ClientManager';
import AdManager from './components/AdManager';
import DocumentNumberManager from './components/DocumentNumberManager';

type Tab = 'dashboard' | 'clients' | 'ads' | 'numbers';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      adService.getAds().then(data => {
        if (data) setAds(data);
      });
    }
  }, [user, refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6] p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center border border-white/50"
        >
          <div className="mb-12">
            <div className="w-56 h-56 mx-auto mb-10 flex items-center justify-center">
               <img 
                 src="https://metaranews.co/wp-content/uploads/2022/10/logo-metara-news-network.png" 
                 alt="Metaranews Logo" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
            </div>
            <h1 className="text-6xl font-black text-[#0f172a] mb-4 tracking-tighter">Metaranews.co</h1>
            <p className="text-2xl font-medium text-[#64748b] tracking-tight">Sistem Manajemen Surat & Invoice</p>
          </div>
          
          <button
            onClick={signInWithGoogle}
            className="w-full py-6 px-10 bg-[#e10606] hover:bg-[#c40505] text-white rounded-[1.25rem] font-bold text-2xl transition-all flex items-center justify-between group shadow-[0_10px_30px_rgba(225,6,6,0.3)] hover:shadow-[0_15px_40px_rgba(225,6,6,0.4)]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/20">
                <LogIn size={28} className="text-white" />
              </div>
              <span className="tracking-tight">Login dengan Google</span>
            </div>
            <ChevronRight size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-xl text-white italic">
              M
            </div>
            <span className="font-bold tracking-tight text-lg">metaranews.co</span>
          </div>
          <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Ad Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Navigation</div>
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="Database Klien" 
            active={activeTab === 'clients'} 
            onClick={() => setActiveTab('clients')} 
          />
          <NavItem 
            icon={<Hash size={18} />} 
            label="Nomor Surat" 
            active={activeTab === 'numbers'} 
            onClick={() => setActiveTab('numbers')} 
          />
          <NavItem 
            icon={<Receipt size={18} />} 
            label="Ads & Penagihan" 
            active={activeTab === 'ads'} 
            onClick={() => setActiveTab('ads')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800 rounded-lg p-3 text-xs">
            <div className="text-slate-400 mb-1">Total Iklan Tayang</div>
            <div className="text-blue-400 font-bold text-base">{ads.length} Orders</div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl overflow-hidden">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-700" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate text-slate-100">{user.displayName}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs font-semibold"
          >
            <LogOut size={16} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">Live System</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">PT. PORTAL DIGITAL MEDIA NUSANTARA</div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Dashboard ads={ads} />
              </motion.div>
            )}
            {activeTab === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ClientManager />
              </motion.div>
            )}
            {activeTab === 'ads' && (
              <motion.div
                key="ads"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <AdManager onAdUpdate={refreshData} />
              </motion.div>
            )}
            {activeTab === 'numbers' && (
              <motion.div
                key="numbers"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <DocumentNumberManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <span className={`${active ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
      {label}
    </button>
  );
}

function Dashboard({ ads }: { ads: Advertisement[] }) {
  const stats = [
    { label: 'Total Iklan', value: ads.length, icon: <FileText className="text-blue-600" /> },
    { label: 'Menunggu Bayar', value: ads.filter(a => a.status === 'Invoiced').length, icon: <Clock className="text-amber-600" /> },
    { label: 'Terbayar Lunas', value: ads.filter(a => a.status === 'Paid').length, icon: <CheckCircle2 className="text-emerald-600" /> },
    { label: 'Status Draft', value: ads.filter(a => a.status === 'Draft').length, icon: <AlertCircle className="text-slate-400" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{stat.icon}</div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Analytics</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">Aktivitas Terakhir</h3>
             <button className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {ads.slice(0, 5).map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all border border-slate-50 hover:border-slate-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                    <FileText size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 uppercase tracking-tight">{ad.clientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {ad.items?.[0]?.serviceType || 'Iklan'} {ad.items?.length > 1 ? `(+${ad.items.length - 1})` : ''} • {ad.period}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900">Rp {ad.totalPrice.toLocaleString('id-ID')}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Nominal</p>
                  </div>
                  <StatusBadge status={ad.status} />
                </div>
              </div>
            ))}
            {ads.length === 0 && (
               <div className="py-12 text-center text-slate-300 italic text-sm">Belum ada data aktivitas.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-20"></div>
             <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4 tracking-tight leading-tight">Sistem Manajemen Iklan Metara</h3>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">Kelola database klien, pembuatan surat penawaran, dan penagihan invoice dalam satu dashboard terintegrasi.</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs font-bold py-2 border-b border-slate-800">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Database Klien Terpusat
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold py-2 border-b border-slate-800">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Otomatisasi No. Surat
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold py-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Tracking Status Bayar
                   </div>
                </div>
             </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Misi metaranews.co</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">"Membangun jaring, Memberi makna melalui jurnalisme yang inspiratif dan solutif."</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdStatus }) {
  const styles = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Quotation Sent': 'bg-blue-50 text-blue-600',
    'Invoiced': 'bg-amber-50 text-amber-600',
    'Paid': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    'Cancelled': 'bg-red-50 text-red-600'
  };

  return (
    <span className={`text-[10px] uppercase font-bold py-1 px-2 rounded-full tracking-wider shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
}
