<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('pos', [SaleController::class, 'terminal'])->name('pos.terminal');
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::post('sales', [SaleController::class, 'store'])->name('sales.store');

    Route::get('settings/iva', [SettingController::class, 'editIva'])->name('settings.iva.edit');
    Route::put('settings/iva', [SettingController::class, 'updateIva'])->name('settings.iva.update');
});

require __DIR__.'/settings.php';
