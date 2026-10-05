"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Receipt, 
  Wallet, 
  ReceiptText 
} from "lucide-react";

type Transaction = {
  id: number;
  invoice_number: string;
  total_amount: number;
  cash_received: number;
  change_amount: number;
  created_at: string;
  user?: { name: string };
  details: Array<{
    id: number;
    quantity: number;
    subtotal: number;
    product?: { name: string; price: number };
  }>;
};

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Sinkronisasi tema saat halaman laporan dibuka
  useEffect(() => {
    const savedTheme = localStorage.getItem("pos_theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Fetch data laporan dari backend Laravel secara client-side
    fetch("http://127.0.0.1:8000/api/reports/transactions", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        setTransactions(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data laporan", err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total_amount, 0);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-slate-900 text-white flex flex-col items-center py-6 gap-8 z-10 shrink-0">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
          POS
        </div>
        <nav className="flex flex-col gap-3 w-full px-3">
          <Link href="/" className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-2xl font-semibold text-[11px] transition-all">
            <ShoppingCart className="w-5 h-5" />
            Kasir
          </Link>
          <button className="flex flex-col items-center justify-center gap-1.5 p-3 bg-blue-600 text-white rounded-2xl font-semibold text-[11px] shadow-md transition-all">
            <BarChart3 className="w-5 h-5" />
            Laporan
          </button>
          <Link href="/settings" className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-2xl font-semibold text-[11px] transition-all">
            <Settings className="w-5 h-5" />
            Pengaturan
          </Link>
        </nav>
      </aside>

      {/* KONTEN UTAMA LAPORAN */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 shadow-xs transition-colors">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Laporan Penjualan</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan transaksi dan riwayat kasir</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kasir
          </Link>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* KARTU STATISTIK RINGKASAN MENGGUNAKAN LUCIDE ICONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 stroke-1.5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Total Pendapatan (10 Transaksi Terakhir)</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">Rp {totalRevenue.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <ReceiptText className="w-6 h-6 stroke-1.5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Total Transaksi Tercatat</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{transactions.length} Struk</span>
              </div>
            </div>
          </div>

          {/* TABEL RIWAYAT TRANSAKSI */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Riwayat Transaksi Terakhir</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-6">No. Invoice</th>
                    <th className="py-4 px-6">Waktu</th>
                    <th className="py-4 px-6">Jumlah Item</th>
                    <th className="py-4 px-6">Total Bayar</th>
                    <th className="py-4 px-6">Kembalian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Memuat data laporan...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={~5} className="py-8 text-center text-slate-400">
                        Belum ada data transaksi yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-slate-400" />
                          {tx.invoice_number}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(tx.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                          {tx.details.reduce((sum, d) => sum + d.quantity, 0)} pcs
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          Rp {tx.total_amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                          Rp {tx.change_amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}