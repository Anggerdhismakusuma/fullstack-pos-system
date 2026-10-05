<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Akun Dummy (Admin dan Kasir)
        User::create([
            'name' => 'Pemilik Toko',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $kasir = User::create([
            'name' => 'Kasir 1',
            'email' => 'kasir@pos.com',
            'password' => Hash::make('password'),
            'role' => 'kasir'
        ]);

        // 2. Buat Kategori & Produk Dummy
        $categories = ['Makanan Ringan', 'Minuman Dingin', 'Kebutuhan Dapur', 'Pembersih'];
        
        foreach ($categories as $catName) {
            $category = Category::create(['name' => $catName]);
            // Buat 10 produk untuk setiap kategori (Total 40 produk)
            Product::factory(10)->create(['category_id' => $category->id]);
        }

        // 3. Buat Data Transaksi yang Matematis & Realistis
        $products = Product::all();
        
        // Buat 50 transaksi secara otomatis
        for ($i = 0; $i < 50; $i++) {
            $totalAmount = 0;
            
            // Generate tanggal random antara 3 bulan lalu sampai hari ini
            $randomDate = fake()->dateTimeBetween('-3 months', 'now');
            
            // Simpan header transaksi sementara (nominal 0 dulu)
            $transaction = Transaction::create([
                'user_id' => $kasir->id,
                'invoice_number' => 'INV-' . $randomDate->format('Ymd') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'total_amount' => 0, 
                'cash_received' => 0, 
                'change_amount' => 0,
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ]);

            // Ambil 1 sampai 5 produk secara acak untuk dibeli di transaksi ini
            $randomProducts = $products->random(rand(1, 5));
            
            foreach ($randomProducts as $prod) {
                $qty = rand(1, 4);
                $subtotal = $qty * $prod->price;
                $totalAmount += $subtotal;

                // Masukkan ke keranjang (Transaction Detail)
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $prod->id,
                    'quantity' => $qty,
                    'unit_price' => $prod->price,
                    'subtotal' => $subtotal,
                    'created_at' => $randomDate,
                    'updated_at' => $randomDate,
                ]);
            }

            // Simulasi pembayaran kasir (Uang diserahkan dibulatkan ke atas, misal kelipatan 50.000 atau 100.000)
            $cashReceived = ceil($totalAmount / 50000) * 50000; 
            
            // Update total transaksi yang sebenarnya
            $transaction->update([
                'total_amount' => $totalAmount,
                'cash_received' => $cashReceived,
                'change_amount' => $cashReceived - $totalAmount,
            ]);
        }
    }
}

?>