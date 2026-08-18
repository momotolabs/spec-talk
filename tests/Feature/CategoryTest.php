<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $category = Category::factory()->create();

    $this->get(route('categories.index'))->assertRedirect(route('login'));
    $this->post(route('categories.store'), ['name' => 'Test'])->assertRedirect(route('login'));
    $this->get(route('categories.edit', $category))->assertRedirect(route('login'));
    $this->delete(route('categories.destroy', $category))->assertRedirect(route('login'));
});

test('authenticated users can view categories index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('categories.index'));
    $response->assertOk();
});

test('authenticated users can view create category form', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('categories.create'));
    $response->assertOk();
});

test('authenticated users can create a category', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('categories.store'), [
        'name' => 'Electronics',
        'description' => 'Electronic devices',
    ]);

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseHas('categories', ['name' => 'Electronics']);
});

test('category name must be unique', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Category::factory()->create(['name' => 'Electronics']);

    $response = $this->post(route('categories.store'), [
        'name' => 'Electronics',
    ]);

    $response->assertSessionHasErrors('name');
});

test('category name is required', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('categories.store'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors('name');
});

test('authenticated users can update a category', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create(['name' => 'Old Name']);

    $response = $this->put(route('categories.update', $category), [
        'name' => 'New Name',
    ]);

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
});

test('cannot delete category with products', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertSessionHasErrors('category');
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('can delete category without products', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $category = Category::factory()->create();

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
