"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  id: {
    pos: "Kasir",
    reports: "Laporan",
    settings: "Pengaturan",
    catalogTitle: "Katalog Produk",
    catalogSubtitle: "Pilih item untuk dimasukkan ke keranjang kasir",
    searchPlaceholder: "Cari nama atau SKU...",
    price: "Harga",
    stock: "Stok",
    cartTitle: "Keranjang Kasir",
    cartSubtitle: "Kelola item pesanan pelanggan aktif",
    emptyCart: "Keranjang masih kosong",
    totalItem: "Total Item",
    totalBill: "Total Tagihan",
    checkout: "Proses Pembayaran",
    productNotFound: "Produk tidak ditemukan",
  },
  en: {
    pos: "Cashier",
    reports: "Reports",
    settings: "Settings",
    catalogTitle: "Product Catalog",
    catalogSubtitle: "Select items to add to the cashier cart",
    searchPlaceholder: "Search name or SKU...",
    price: "Price",
    stock: "Stock",
    cartTitle: "Cashier Cart",
    cartSubtitle: "Manage active customer order items",
    emptyCart: "Cart is still empty",
    totalItem: "Total Items",
    totalBill: "Total Amount",
    checkout: "Process Checkout",
    productNotFound: "Product not found",
  },
};

type LanguageContextType = {
  locale: string;
  setLocale: (lang: string) => void;
  t: (key: keyof typeof translations['id']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("id");

  useEffect(() => {
    const savedLang = localStorage.getItem("pos_lang") || "id";
    setLocaleState(savedLang);
  }, []);

  const setLocale = (lang: string) => {
    setLocaleState(lang);
    localStorage.setItem("pos_lang", lang);
  };

  const t = (key: keyof typeof translations['id']) => {
    const langDict = translations[locale as keyof typeof translations] || translations.id;
    return langDict[key] || translations.id[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}