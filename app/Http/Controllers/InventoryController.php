<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        if ($request->boolean('low_stock_only')) {
            $query->whereColumn('stock_quantity', '<=', 'min_stock_alert');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('stock_quantity')->get();

        return Inertia::render('inventory/Index', [
            'products' => $products,
            'categories' => Category::orderBy('name')->get(),
            'summary' => [
                'total_products' => Product::count(),
                'low_stock_count' => Product::whereColumn('stock_quantity', '<=', 'min_stock_alert')->count(),
                'out_of_stock_count' => Product::where('stock_quantity', 0)->count(),
            ],
            'filters' => $request->only(['low_stock_only', 'category_id']),
        ]);
    }
}
