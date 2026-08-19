<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function terminal(): Response
    {
        $products = Product::where('active', true)
            ->where('stock_quantity', '>', 0)
            ->with('category')
            ->get();

        $ivaRate = Setting::get('iva_rate');

        return Inertia::render('pos/Terminal', [
            'products' => $products,
            'ivaRate' => $ivaRate?->value ?? '0.19',
        ]);
    }

    public function index(): Response
    {
        $sales = Sale::with(['user', 'items'])
            ->latest()
            ->paginate(15);

        return Inertia::render('sales/Index', [
            'sales' => $sales,
        ]);
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['user', 'items.product']);

        return Inertia::render('sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $ivaRate = (float) (Setting::get('iva_rate')?->value ?? '0.19');

        return DB::transaction(function () use ($request, $ivaRate) {
            $items = $request->validated('items');
            $paymentAmount = (float) $request->validated('payment_amount');

            $productIds = array_column($items, 'product_id');
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $saleItems = [];

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    abort(422, "Product #{$item['product_id']} not found.");
                }

                if ($product->stock_quantity < $item['quantity']) {
                    abort(422, "Insufficient stock for {$product->name}. Available: {$product->stock_quantity}.");
                }

                $lineSubtotal = round($product->price * $item['quantity'], 2);
                $subtotal += $lineSubtotal;

                $saleItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $lineSubtotal,
                ];
            }

            // IVA is included in product prices, extract it from subtotal
            $ivaAmount = round($subtotal * ($ivaRate / (1 + $ivaRate)), 2);
            $total = $subtotal;

            if ($paymentAmount < $total) {
                abort(422, 'Payment amount is less than total.');
            }

            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'user_id' => auth()->id(),
                'subtotal' => $subtotal,
                'iva_amount' => $ivaAmount,
                'total' => $total,
                'payment_amount' => $paymentAmount,
                'change_amount' => round($paymentAmount - $total, 2),
            ]);

            foreach ($saleItems as $saleItem) {
                $sale->items()->create($saleItem);
            }

            foreach ($items as $item) {
                Product::where('id', $item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }

            return to_route('sales.index');
        });
    }
}
