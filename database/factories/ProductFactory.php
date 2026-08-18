<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->paragraph(),
            'price' => fake()->randomFloat(2, 0.50, 100),
            'stock_quantity' => fake()->numberBetween(0, 200),
            'min_stock_alert' => 5,
            'category_id' => Category::factory(),
            'active' => true,
        ];
    }
}
