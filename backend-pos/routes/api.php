<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ProductController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/checkout', [CheckoutController::class, 'store']);
Route::apiResource('products', ProductController::class);

Route::get('/reports/transactions', function () {
    $transactions = Transaction::with('details.product', 'user')
        ->latest()
        ->take(10)
        ->get();

    return response()->json([
        'status' => 'success',
        'data' => $transactions
    ]);
});
