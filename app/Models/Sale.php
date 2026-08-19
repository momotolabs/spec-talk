<?php

namespace App\Models;

use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['sale_number', 'user_id', 'subtotal', 'iva_amount', 'total', 'payment_amount', 'change_amount'])]
class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'iva_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'payment_amount' => 'decimal:2',
            'change_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<User> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SaleItem> */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public static function generateSaleNumber(): string
    {
        $latest = static::where('sale_number', 'like', 'VTA-%')
            ->orderByDesc('sale_number')
            ->value('sale_number');

        $nextNumber = $latest ? ((int) substr($latest, 4) + 1) : 1;

        return 'VTA-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
