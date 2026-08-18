<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('settings.iva.edit'))->assertRedirect(route('login'));
});

test('authenticated users can view IVA settings', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('settings.iva.edit'));
    $response->assertOk();
});

test('authenticated users can update IVA rate', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->put(route('settings.iva.update'), [
        'iva_rate' => '0.21',
    ]);

    $response->assertRedirect(route('settings.iva.edit'));
    $this->assertDatabaseHas('settings', ['key' => 'iva_rate', 'value' => '0.21']);
});

test('IVA rate must be numeric between 0 and 1', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->put(route('settings.iva.update'), [
        'iva_rate' => 'not-a-number',
    ]);

    $response->assertSessionHasErrors('iva_rate');
});

test('IVA rate must not exceed 1', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->put(route('settings.iva.update'), [
        'iva_rate' => '1.5',
    ]);

    $response->assertSessionHasErrors('iva_rate');
});
