"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { locale, setLocale, t } = useTranslation();
  const [theme, setTheme] = useState("light");
  const [storeName, setStoreName] = useState("Toko Retail Utama");
  const [isMounted, setIsMounted] = useState(false);

  // Jalankan sekali saat komponen terpasang di browser
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("pos_theme") || "light";
    setTheme(savedTheme);
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fungsi ubah tema yang langsung merespons DOM & localStorage
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("pos_theme", newTheme);

    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Pengaturan umum berhasil disimpan!");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari sesi kasir?");
    if (confirmLogout) {
      alert("Berhasil keluar sesi (Logout).");
    }
  };

  // Mencegah glitch render pertama kali sebelum client-side siap
  if (!isMounted) return null;

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
            {t('pos')}
          </Link>
          <Link href="/reports" className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-2xl font-semibold text-[11px] transition-all">
            <BarChart3 className="w-5 h-5" />
            {t('reports')}
          </Link>
          <button className="flex flex-col items-center justify-center gap-1.5 p-3 bg-blue-600 text-white rounded-2xl font-semibold text-[11px] shadow-md transition-all">
            <Settings className="w-5 h-5" />
            {t('settings')}
          </button>
        </nav>
      </aside>

      {/* KONTEN UTAMA SETTINGS */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 shadow-xs transition-colors">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kelola preferensi sistem, lokalisasi, dan akun kasir</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kasir
          </Link>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-4xl">
          <div className="space-y-6">
            
            {/* KARTU 1: PROFIL & INFORMASI TOKO */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Informasi Toko</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Nama toko ini akan tercetak otomatis di struk belanja pelanggan.</p>
              
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Toko / Cabang</label>
                  <input 
                    type="text" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
                  />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/20 cursor-pointer">
                  Simpan Perubahan
                </button>
              </form>
            </div>

            {/* KARTU 2: LOKALISASI & TEMA */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Tampilan & Lokalisasi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sesuaikan bahasa antarmuka dan mode visual aplikasi.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400" /> Bahasa Sistem
                  </label>
                  <select 
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />} Tema Tampilan
                  </label>
                  <select 
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="light">Light Mode (Terang)</option>
                    <option value="dark">Dark Mode (Gelap)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* KARTU 3: AKSES & KELUAR SESI */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Sesi Kasir Aktif
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Masuk sebagai: <span className="font-semibold text-slate-700 dark:text-slate-300">Kasir 01 (ID: 2)</span></p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition-colors border border-red-100 dark:border-red-900/50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Akhiri Sesi (Logout)
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}