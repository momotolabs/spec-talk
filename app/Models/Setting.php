<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public static function get(string $key): ?static
    {
        return static::where('key', $key)->first();
    }

    public static function set(string $key, string $value): static
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
