<?php

use App\Models\Product;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('inventory.index'))->assertRedirect(route('login'));
});

test('authenticated users can view inventory', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Product::factory()->create(['stock_quantity' => 10, 'min_stock_alert' => 5]);
    Product::factory()->create(['stock_quantity' => 2, 'min_stock_alert' => 5]);

    $response = $this->get(route('inventory.index'));
    $response->assertOk();
});

test('low stock products are highlighted in summary', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Product::factory()->create(['stock_quantity' => 10, 'min_stock_alert' => 5]);
    Product::factory()->create(['stock_quantity' => 2, 'min_stock_alert' => 5]);
    Product::factory()->create(['stock_quantity' => 0]);

    $response = $this->get(route('inventory.index'));
    $response->assertOk();
});

test('can filter to show only low stock products', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Product::factory()->create(['stock_quantity' => 10, 'min_stock_alert' => 5]);
    Product::factory()->create(['stock_quantity' => 2, 'min_stock_alert' => 5]);

    $response = $this->get(route('inventory.index', ['low_stock_only' => '1']));
    $response->assertOk();
});
