<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $product = Product::factory()->create();

    $this->get(route('products.index'))->assertRedirect(route('login'));
    $this->post(route('products.store'), ['name' => 'Test'])->assertRedirect(route('login'));
    $this->get(route('products.edit', $product))->assertRedirect(route('login'));
    $this->delete(route('products.destroy', $product))->assertRedirect(route('login'));
});

test('authenticated users can view products index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('products.index'));
    $response->assertOk();
});

test('authenticated users can view create product form', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('products.create'));
    $response->assertOk();
});

test('authenticated users can create a product', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();

    $response = $this->post(route('products.store'), [
        'name' => 'Widget',
        'description' => 'A useful widget',
        'price' => 19.99,
        'stock_quantity' => 100,
        'min_stock_alert' => 5,
        'category_id' => $category->id,
        'active' => true,
    ]);

    $response->assertRedirect(route('products.index'));
    $this->assertDatabaseHas('products', ['name' => 'Widget']);
});

test('product requires valid category_id', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('products.store'), [
        'name' => 'Widget',
        'price' => 19.99,
        'stock_quantity' => 100,
        'min_stock_alert' => 5,
        'category_id' => 99999,
        'active' => true,
    ]);

    $response->assertSessionHasErrors('category_id');
});

test('negative stock is rejected', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();

    $response = $this->post(route('products.store'), [
        'name' => 'Widget',
        'price' => 19.99,
        'stock_quantity' => -1,
        'min_stock_alert' => 5,
        'category_id' => $category->id,
        'active' => true,
    ]);

    $response->assertSessionHasErrors('stock_quantity');
});

test('authenticated users can update a product', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $response = $this->put(route('products.update', $product), [
        'name' => 'Updated Widget',
        'description' => 'Updated description',
        'price' => 29.99,
        'stock_quantity' => 50,
        'min_stock_alert' => 10,
        'category_id' => $category->id,
        'active' => true,
    ]);

    $response->assertRedirect(route('products.index'));
    $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Widget']);
});

test('authenticated users can delete a product', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $product = Product::factory()->create();

    $response = $this->delete(route('products.destroy', $product));

    $response->assertRedirect(route('products.index'));
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('products can be filtered by category', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->get(route('products.index', ['category_id' => $category->id]));
    $response->assertOk();
});
