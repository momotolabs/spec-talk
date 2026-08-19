<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $sale = Sale::factory()->create();

    $this->get(route('pos.terminal'))->assertRedirect(route('login'));
    $this->get(route('sales.index'))->assertRedirect(route('login'));
    $this->get(route('sales.show', $sale))->assertRedirect(route('login'));
    $this->post(route('sales.store'), ['items' => []])->assertRedirect(route('login'));
});

test('authenticated users can view POS terminal', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('pos.terminal'));
    $response->assertOk();
});

test('authenticated users can view sales index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('sales.index'));
    $response->assertOk();
});

test('authenticated users can view sale detail', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $sale = Sale::factory()->create();

    $response = $this->get(route('sales.show', $sale));
    $response->assertOk();
});

test('can create a sale with valid data', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 10.00,
        'stock_quantity' => 50,
    ]);

    $response = $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        'payment_amount' => 30.00,
    ]);

    $response->assertRedirect(route('sales.index'));
    $this->assertDatabaseHas('sales', ['user_id' => $user->id]);
});

test('sale decrements product stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 10.00,
        'stock_quantity' => 50,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
        'payment_amount' => 50.00,
    ]);

    $product->refresh();
    $this->assertEquals(47, $product->stock_quantity);
});

test('sale rejects insufficient stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 10.00,
        'stock_quantity' => 2,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5],
        ],
        'payment_amount' => 100.00,
    ])->assertStatus(422);
});

test('sale rejects zero items', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('sales.store'), [
        'items' => [],
        'payment_amount' => 10.00,
    ])->assertSessionHasErrors('items');
});

test('sale rejects payment less than total', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 100.00,
        'stock_quantity' => 50,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'payment_amount' => 1.00,
    ])->assertStatus(422);
});

test('sale generates correct sale number format', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 5.00,
        'stock_quantity' => 100,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'payment_amount' => 10.00,
    ]);

    $this->assertDatabaseHas('sales', [
        'user_id' => $user->id,
        'sale_number' => 'VTA-000001',
    ]);
});

test('sale calculates IVA correctly', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create([
        'price' => 100.00,
        'stock_quantity' => 50,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'payment_amount' => 200.00,
    ]);

    // IVA is included in prices: iva_amount = subtotal * (rate / (1 + rate))
    // With 19% IVA: 100 * (0.19 / 1.19) = 15.97
    $this->assertDatabaseHas('sales', [
        'user_id' => $user->id,
        'subtotal' => 100.00,
        'iva_amount' => 15.97,
        'total' => 100.00, // total = subtotal (IVA already included)
    ]);
});
