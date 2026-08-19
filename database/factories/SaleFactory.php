<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 500);
        $ivaRate = 0.19;
        // IVA is included in prices, extract it from subtotal
        $ivaAmount = round($subtotal * ($ivaRate / (1 + $ivaRate)), 2);
        $total = $subtotal; // IVA already included in prices
        $paymentAmount = $total + fake()->randomFloat(2, 0, 50);

        return [
            'sale_number' => Sale::generateSaleNumber(),
            'user_id' => User::factory(),
            'subtotal' => $subtotal,
            'iva_amount' => $ivaAmount,
            'total' => $total,
            'payment_amount' => $paymentAmount,
            'change_amount' => round($paymentAmount - $total, 2),
        ];
    }
}
