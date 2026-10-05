"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Search, 
  Package, 
  CreditCard, 
  Plus, 
  Minus, 
  BarChart3, 
  Settings, 
  Store 
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

type Product = {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category?: { name: string };
};

type CartItem = Product & {
  qty: number;
  subtotal: number;
};

export default function PosClient({ products }: { products: Product[] }) {
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sinkronisasi tema saat halaman dimuat
  useEffect(() => {
    const savedTheme = localStorage.getItem("pos_theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            const targetProduct = products.find((p) => p.id === productId);
            const maxStock = targetProduct ? targetProduct.stock : item.stock;

            if (newQty > maxStock) {
              alert("Stok produk tidak mencukupi!");
              return item;
            }
            if (newQty <= 0) {
              return null;
            }
            return { ...item, qty: newQty, subtotal: newQty * item.price };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      alert("Stok barang habis!");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          alert("Kuantitas melebihi stok yang tersedia!");
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
            : item
        );
      }

      return [...prevCart, { ...product, qty: 1, subtotal: product.price }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const cashInput = window.prompt(
      `Total Tagihan: Rp ${totalAmount.toLocaleString("id-ID")}\n\nMasukkan jumlah uang tunai pelanggan:`,
      totalAmount.toString()
    );

    if (!cashInput) return;

    const cashReceived = parseInt(cashInput.replace(/\D/g, ""));

    if (isNaN(cashReceived) || cashReceived < totalAmount) {
      alert("Pembayaran gagal: Uang tunai kurang dari total tagihan!");
      return;
    }

    const payload = {
      user_id: 2,
      cash_received: cashReceived,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.qty,
      })),
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        alert(
          `TRANSAKSI BERHASIL! 🎉\n` +
          `No. Invoice: ${responseData.data.invoice_number}\n` +
          `Kembalian: Rp ${responseData.data.change_amount.toLocaleString("id-ID")}`
        );
        setCart([]);
        router.push(`/receipt/${txId}`);
      } else {
        alert(`TRANSAKSI GAGAL ❌\nPesan: ${responseData.message}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem atau jaringan terputus.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      
      {/* 1. SIDEBAR MODERN */}
      <aside className="w-20 bg-slate-900 text-white flex flex-col items-center py-6 gap-8 z-10 shrink-0">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
          POS
        </div>
        <nav className="flex flex-col gap-3 w-full px-3">
          <button className="flex flex-col items-center justify-center gap-1.5 p-3 bg-blue-600 text-white rounded-2xl font-semibold text-[11px] shadow-md transition-all">
            <ShoppingCart className="w-5 h-5" />
            {t('pos')}
          </button>
          <Link href="/reports" className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-2xl font-semibold text-[11px] transition-all">
            <BarChart3 className="w-5 h-5" />
            {t('reports')}
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-2xl font-semibold text-[11px] transition-all">
            <Settings className="w-5 h-5" />
            {t('settings')}
          </Link>
        </nav>
      </aside>

      {/* 2. AREA TENGAH (KATALOG PRODUK & PENCARIAN) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 shadow-xs transition-colors">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('catalogTitle')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('catalogSubtitle')}</p>
          </div>
          
          {/* Kotak Pencarian */}
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')} 
              className="w-72 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>
        </header>

        {/* Grid Produk (Scrollable) */}
        <div className="flex-1 p-8 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
              <Package className="w-10 h-10 stroke-1" />
              <p className="text-sm">{t('productNotFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-0.5 active:scale-95 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Package className="w-8 h-8 stroke-1.5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {product.category?.name || 'Umum'}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 mt-1.5 text-sm">{product.name}</h3>
                  </div>

                  <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{t('price')}</span>
                      <span className="font-black text-blue-600 dark:text-blue-400 text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock > 5 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'}`}>
                      {t('stock')}: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 3. PANEL KANAN (KERANJANG & KONTROL QTY) */}
      <aside className="w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 shrink-0 transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('cartTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('cartSubtitle')}</p>
          </div>
          <Store className="w-5 h-5 text-slate-400" />
        </div>
        
        {/* List Keranjang */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <ShoppingCart className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400">{t('emptyCart')}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rp {item.price.toLocaleString('id-ID')} / item</span>
                  
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-xs">
                    <button 
                      onClick={() => updateCartQty(item.id, -1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-0.5 font-bold text-slate-800 dark:text-white text-xs">
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => updateCartQty(item.id, 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Total & Bayar */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{t('totalItem')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {cart.reduce((sum, item) => sum + item.qty, 0)} pcs
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-xl text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>{t('totalBill')}</span>
              <span className="text-blue-600 dark:text-blue-400 text-2xl font-black">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0} 
            className="w-full py-4 bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex justify-center items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed text-sm"
          >
            <CreditCard className="w-5 h-5" /> {t('checkout')}
          </button>
        </div>
      </aside>
      
    </div>
  );
}