<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Mengambil semua data produk (untuk menu kasir)
    public function index()
    {
        // Load relasi kategori agar frontend tahu nama kategorinya
        $products = Product::with('category')->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    // Menambah produk baru (untuk admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|unique:products,sku',
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048' // Validasi untuk file gambar (opsional)
        ]);

        $product = Product::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product
        ], 201);
    }

    // ... (Kamu bisa membiarkan fungsi show, update, dan destroy kosong untuk saat ini)
}