import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Save, 
  Loader2, 
  FileText, 
  Receipt,
  ChevronRight,
  Info
} from 'lucide-react';
import { adService } from '../services/adService';
import { Advertisement, Client } from '../types';

interface DocumentGeneratorProps {
  ad: Advertisement;
  client: Client;
  type: 'quotation' | 'invoice';
  onClose: () => void;
}

export default function DocumentGenerator({ ad, client, type, onClose }: DocumentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(type === 'quotation' ? 'Penawaran iklan di metaranews.co' : 'Invoice Iklan metaranews.co');
  
  // Default templates with placeholders
  const defaultQuotationTemplate = `Dengan hormat, 

Salam silaturrahim kami sampaikan, semoga Bapak/Ibu beserta seluruh staf senantiasa mendapat limpahan rahmat dari Tuhan Yang Maha Esa. Amin.

Metaranews.co merupakan media online yang menyajikan berita-berita aktual secara cepat, akurat, terpercaya dan dikaji secara mendalam dan merupakan media efektif untuk menyebarkan informasi tanpa batas teritorial. Media ini bernaung di bawah PT Portal Digital Media Nusantara.

Metaranews.co yang menyajikan berita-berita khas dan khusus Jawa Timur hadir menjawab kebutuhan zaman, dengan semangat mengusung misi building, inspiring, dan positive thinking melalui portal berita metaranews.co. Dengan menggunakan metaranews.co, maka berita-berita lokal yang tersaji bisa dibaca dan dinikmati secara lokal, regional, nasional, maupun internasional.

Pada kesempatan ini, kami ingin mengajukan penawaran kerjasama dengan rincian sebagai berikut:`;

  const defaultInvoiceTemplate = `PAYMENT:
BANK MANDIRI KC KEDIRI
Account No.: 171-00-1236940-4
PT. Portal Digital Media Nusantara`;

  const [content, setContent] = useState(type === 'quotation' ? defaultQuotationTemplate : defaultInvoiceTemplate);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const num = type === 'quotation' 
        ? await adService.getNextQuotationNumber() 
        : await adService.getNextInvoiceNumber();
      setDocNumber(num);
    }
    init();
  }, [type]);

  const handleSaveAndPrint = async () => {
    setLoading(true);
    try {
      if (type === 'quotation') {
        await adService.saveQuotation({
          adId: ad.id!,
          number: docNumber,
          date: docDate,
          subject,
          attachment: '1 (satu) berkas',
          contentMarkup: content,
          recipientInfo: `${client.name}\n${client.address}`
        });
      } else {
        await adService.saveInvoice({
          adId: ad.id!,
          number: docNumber,
          date: docDate,
          paymentStatus: 'Unpaid',
          contentMarkup: content
        });
      }
      setTimeout(() => {
        window.print();
        onClose();
      }, 500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = (d: string) => {
    const date = new Date(d);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `Kediri, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex overflow-hidden">
      {/* Editor Sidebar */}
      <div className="w-1/3 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-10 print:hidden text-white">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <h3 className="font-bold text-lg flex items-center gap-3 tracking-tight">
            <div className={`p-2 rounded-lg ${type === 'quotation' ? 'bg-blue-600' : 'bg-amber-600'}`}>
              {type === 'quotation' ? <FileText size={20} className="text-white" /> : <Receipt size={20} className="text-white" />}
            </div>
            {type === 'quotation' ? 'Editor Penawaran' : 'Editor Invoice'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-start gap-3">
              <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Gunakan editor di bawah untuk menyusun isi surat secara manual (Mail Merge).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nomor Dokumen</label>
              <input 
                type="text" 
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tanggal Terbit</label>
              <input 
                type="date" 
                value={docDate}
                onChange={e => setDocDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Perihal / Subjek</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Isi Dokumen (Manual Edit)</label>
              <textarea 
                rows={12}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all leading-relaxed text-slate-100"
                placeholder="Tulis isi surat di sini..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex gap-3 bg-slate-900">
          <button 
            disabled={loading}
            onClick={handleSaveAndPrint}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan & Cetak
          </button>
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex-1 bg-slate-200 p-12 overflow-y-auto preview-area">
        <div 
          ref={printRef}
          className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-2xl p-[20mm] relative doc-page print:shadow-none print:p-0 print:m-0 border-t-[12px] border-slate-900"
        >
          {/* Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white font-display font-black text-4xl">M</div>
              <div className="space-y-1">
                <h1 className="text-[#333] font-bold text-lg tracking-tight uppercase leading-tight italic">Metara</h1>
                <p className="text-[10px] font-medium text-red-600 italic -mt-1">Setara Bercerita</p>
              </div>
            </div>
            <div className="text-right max-w-sm">
              <h2 className="text-red-600 font-bold text-2xl uppercase tracking-tighter mb-2 leading-none">PT. PORTAL DIGITAL MEDIA NUSANTARA</h2>
              <div className="text-[10px] text-slate-500 leading-tight">
                Jl. Raya Kediri - Pare No. 30<br />
                Dsn. Ngrancangan Ds. Wonojoyo Kec. Gurah Kab. Kediri<br />
                <span className="font-bold">Telp. 0354-4545845 - +62 811-3500-466</span>
              </div>
            </div>
          </div>

          {type === 'quotation' ? (
            <div className="space-y-8 text-sm text-slate-800 leading-relaxed font-sans">
              <div className="space-y-1">
                <p><span className="inline-block w-24">Nomor</span>: {docNumber}</p>
                <p><span className="inline-block w-24">Lampiran</span>: 1 (satu) berkas</p>
                <p><span className="inline-block w-24">Perihal</span>: {subject}</p>
              </div>

              <div className="space-y-1 mt-8">
                <p className="font-bold">Kepada</p>
                <p className="font-bold">Yth. {client.name}</p>
                <p className="whitespace-pre-wrap">{client.address}</p>
                <p>di Tempat</p>
              </div>

              <div className="whitespace-pre-wrap whitespace-normal text-justify">
                {content}
              </div>

              <table className="w-full border-collapse mt-6">
                <thead>
                  <tr className="bg-red-600 text-white text-xs text-left">
                    <th className="border border-red-600 p-2 font-bold">Paket Iklan</th>
                    <th className="border border-red-600 p-2 font-bold">Jenis Jasa</th>
                    <th className="border border-red-600 p-2 font-bold">QTY</th>
                    <th className="border border-red-600 p-2 font-bold text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {ad.items && ad.items.length > 0 ? (
                    ad.items.map((item, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="border border-slate-200 p-2">{item.packageName}</td>
                        <td className="border border-slate-200 p-2">{item.serviceType}</td>
                        <td className="border border-slate-200 p-2">{item.quantity}x</td>
                        <td className="border border-slate-200 p-2 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-xs">
                      <td className="border border-slate-200 p-2">{(ad as any).packageName || '-'}</td>
                      <td className="border border-slate-200 p-2">{(ad as any).serviceType || '-'}</td>
                      <td className="border border-slate-200 p-2">{(ad as any).quantity || '1'}x</td>
                      <td className="border border-slate-200 p-2 text-right">Rp {((ad as any).price || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  )}
                  <tr className="text-xs font-bold bg-slate-50">
                    <td colSpan={3} className="border border-slate-200 p-2 text-right">Total Seluruhnya</td>
                    <td className="border border-slate-200 p-2 text-right">Rp {ad.totalPrice.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8">
                <p>Demikian penawaran ini, atas kerjasamanya disampaikan terima kasih.</p>
              </div>

              <div className="mt-20 text-right space-y-20 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 opacity-50 pointer-events-none">
                   {/* Simulating a stamp/sign area */}
                   <div className="w-32 h-32 border-4 border-red-100 rounded-full flex items-center justify-center text-red-50 text-4xl font-black rotate-[-15deg]">
                    METARA
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="italic">{formattedDate(docDate)}</p>
                   <p>Hormat kami,</p>
                   <p className="font-bold uppercase tracking-tight">PT Portal Digital Media Nusantara</p>
                </div>
                <div className="font-bold">
                  <p className="underline underline-offset-4 decoration-2">Moh. Muhson Agil S.</p>
                  <p className="text-xs font-medium">Direktur</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 text-sm text-slate-800 font-sans">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KEPADA YTH:</p>
                            <p className="text-lg font-black uppercase tracking-tight leading-tight">{client.name}</p>
                            <p className="text-[11px] text-slate-500 whitespace-pre-wrap max-w-xs">{client.address}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-4">
                        <h2 className="text-5xl font-black italic text-slate-900 tracking-tighter opacity-90">INVOICE</h2>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INVOICE #:</p>
                            <p className="font-bold text-sm font-mono">{docNumber}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TANGGAL:</p>
                            <p className="font-bold text-sm">{new Date(docDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#5d1717] text-white">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Deskripsi</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">QTY</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Periode</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Harga</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-slate-50/30">
                            {ad.items && ad.items.length > 0 ? (
                                ad.items.map((item, idx) => (
                                    <tr key={idx} className="align-top">
                                        <td className="px-6 py-4 font-bold text-slate-700">{item.packageName} {item.serviceType}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{item.quantity}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{ad.period}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500 text-nowrap">Rp {item.price.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 text-right text-nowrap">Rp {item.totalPrice.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="align-top">
                                    <td className="px-6 py-4 font-bold text-slate-700">{(ad as any).packageName} {(ad as any).serviceType}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{(ad as any).quantity}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{ad.period}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500 text-nowrap">Rp {((ad as any).price || 0).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-right text-nowrap">Rp {ad.totalPrice.toLocaleString('id-ID')}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50">
                                <td colSpan={3} className="px-6 py-4"></td>
                                <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Sub-Total</td>
                                <td className="px-6 py-4 font-bold text-slate-900 text-right">Rp {ad.totalPrice.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr className="bg-red-600 text-white">
                                <td colSpan={3}></td>
                                <td colSpan={2} className="px-6 py-6 flex justify-between items-center w-full min-w-[200px]">
                                    <span className="text-xl font-black italic tracking-tighter">GR TOTAL</span>
                                    <span className="text-2xl font-black">RP. {ad.totalPrice.toLocaleString('id-ID')}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-between items-start pt-8">
                     <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Payment Info</p>
                            <div className="text-[11px] leading-relaxed font-bold text-slate-700 whitespace-pre-wrap">
                                {content}
                            </div>
                        </div>
                     </div>
                     <div className="text-center space-y-16">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Hormat Kami,</p>
                            <p className="text-xs font-black tracking-tight leading-tight">PT. PORTAL DIGITAL MEDIA NUSANTARA</p>
                        </div>
                        <div className="space-y-1 pt-4 border-t border-slate-100">
                             <p className="text-[11px] font-black tracking-widest uppercase">Imam Mubaroq, S.SOS.I</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Pimpinan Redaksi</p>
                        </div>
                     </div>
                </div>
            </div>
          )}

          {/* Footer */}
          <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t-2 border-red-600 pt-3 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#5d1717]">
            <div className="flex gap-4">
                <span>Insta</span>
                <span>Fb</span>
                <span>Tiktok</span>
                <span>Youtube</span>
            </div>
            <div>METARANEWS.CO</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .preview-area, .preview-area * { visibility: visible; }
          .preview-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 0 !important; background: white !important; }
          .doc-page { box-shadow: none !important; border: none !important; width: 100% !important; min-height: 100% !important; p: 0 !important; margin: 0 !important; }
          .print-hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
