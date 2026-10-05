<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input dari Frontend (Next.js/React)
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id', // Idealnya nanti pakai Auth::id()
            'cash_received' => 'required|integer|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            // 2. Mulai proses Database Transaction
            $transaction = DB::transaction(function () use ($validated) {
                $totalAmount = 0;
                
                // Buat nomor invoice unik
                $invoiceNumber = 'INV-' . date('Ymd') . '-' . rand(1000, 9999);

                // Insert ke tabel transactions (Header)
                $trx = Transaction::create([
                    'user_id' => $validated['user_id'],
                    'invoice_number' => $invoiceNumber,
                    'total_amount' => 0, // Akan diupdate di bawah
                    'cash_received' => $validated['cash_received'],
                    'change_amount' => 0, // Akan diupdate di bawah
                ]);

                // Loop setiap barang belanjaan
                foreach ($validated['items'] as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                    
                    // Cek apakah stok cukup
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi. Sisa: {$product->stock}");
                    }

                    $subtotal = $product->price * $item['quantity'];
                    $totalAmount += $subtotal;

                    // Insert ke tabel transaction_details
                    TransactionDetail::create([
                        'transaction_id' => $trx->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $product->price,
                        'subtotal' => $subtotal,
                    ]);

                    // Kurangi stok produk secara real-time
                    $product->decrement('stock', $item['quantity']);
                }

                // Validasi apakah uang yang dibayarkan cukup
                if ($validated['cash_received'] < $totalAmount) {
                    throw new \Exception("Uang tunai kurang. Total tagihan: Rp " . number_format($totalAmount, 0, ',', '.'));
                }

                // Update total tagihan dan kembalian di tabel transactions
                $trx->update([
                    'total_amount' => $totalAmount,
                    'change_amount' => $validated['cash_received'] - $totalAmount,
                ]);

                // Kembalikan data transaksi beserta detail dan nama produknya
                return $trx->load('details.product');
            });

            // 3. Kembalikan Response Sukses ke Frontend
            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil diproses',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            // Jika ada error (stok habis/uang kurang/database mati), batalkan semua dan kirim error
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}