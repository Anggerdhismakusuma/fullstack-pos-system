"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";

type TransactionDetail = {
  id: number;
  quantity: number;
  subtotal: number;
  product: {
    name: string;
    price: number;
  };
};

type Transaction = {
  id: number;
  invoice_number: string;
  total_amount: number;
  cash_received: number;
  change_amount: number;
  created_at: string;
  details: TransactionDetail[];
};

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    // Ambil data transaksi berdasarkan ID dari backend Laravel
    fetch(`http://127.0.0.1:8000/api/reports/transactions`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const list: Transaction[] = json.data || [];
        const found = list.find((tx) => tx.id.toString() === params.id);
        setTransaction(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat struk", err);
        setLoading(false);
      });
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500">
        Memuat data struk belanja...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 gap-4">
        <p>Data transaksi tidak ditemukan.</p>
        <button 
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Kasir
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 flex flex-col items-center justify-start font-sans">
      
      {/* Tombol Kontrol (Tidak ikut tercetak) */}
      <div className="w-full max-w-sm mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kasir
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Struk
        </button>
      </div>

      {/* KERTAS STRUK THERMAL */}
      <div className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0">
        
        {/* Header Toko */}
        <div className="text-center pb-4 border-b border-dashed border-slate-300">
          <div className="inline-flex w-10 h-10 bg-slate-900 text-white rounded-xl items-center justify-center font-black text-sm mb-2">
            POS
          </div>
          <h2 className="font-black text-base uppercase tracking-wider">Toko Retail Utama</h2>
          <p className="text-[11px] text-slate-500">Jl. Raya Perjuangan No. 12, Jakarta</p>
          <p className="text-[11px] text-slate-500">Telp: 0812-3456-7890</p>
        </div>

        {/* Info Transaksi */}
        <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Invoice:</span>
            <span className="font-bold text-slate-800">{transaction.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu:</span>
            <span>{new Date(transaction.created_at).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Kasir:</span>
            <span>Kasir 01</span>
          </div>
        </div>

        {/* Daftar Item */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Item Pembelian</span>
          {transaction.details.map((item, idx) => (
            <div key={idx} className="text-xs">
              <div className="font-bold text-slate-800">{item.product.name}</div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>{item.quantity}x @ Rp {item.product.price.toLocaleString("id-ID")}</span>
                <span className="font-semibold text-slate-700">Rp {item.subtotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Kalkulasi Pembayaran */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>Total Tagihan:</span>
            <span className="text-blue-600">Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tunai Diterima:</span>
            <span>Rp {transaction.cash_received.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Uang Kembalian:</span>
            <span>Rp {transaction.change_amount.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Footer Struk */}
        <div className="pt-4 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" /> Lunas & Berhasil
          </div>
          <p className="text-[10px] text-slate-400">Terima kasih atas kunjungan Anda!</p>
          <p className="text-[9px] text-slate-300 mt-2">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>

      </div>

    </div>
  );
}