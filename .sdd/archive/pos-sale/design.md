# Design: POS Sale — Terminal + History

## Architecture

### Backend Components

**New Files:**
```
app/Models/Sale.php
app/Models/SaleItem.php
app/Http/Controllers/SaleController.php
database/migrations/xxxx_create_sales_table.php
database/migrations/xxxx_create_sale_items_table.php
database/factories/SaleFactory.php
database/factories/SaleItemFactory.php
```

**Modified Files:**
```
app/Models/Product.php          // add relationships
app/Models/User.php             // add sales relationship
routes/web.php                  // add sale routes
```

### Frontend Components

**New Files:**
```
resources/js/pages/pos/Terminal.tsx        // POS terminal page
resources/js/pages/sales/Index.tsx         // Sales history
resources/js/pages/sales/Show.tsx          // Sale detail
resources/js/pages/pos/partials/Cart.tsx   // Cart component
resources/js/pages/pos/partials/ProductSearch.tsx // Product search
```

**Modified Files:**
```
resources/js/components/app-sidebar.tsx    // Add POS and Sales nav items
```

## Key Design Decisions

### 1. IVA Calculation Strategy

**Decision:** Calculate IVA as extractive (already included in prices).

**Rationale:** Products store prices with IVA included (`iva_included: true`). The IVA amount is extracted from the total, not added on top. This matches real-world POS behavior in regions with VAT-inclusive pricing.

**Formula:**
```
subtotal = sum(quantity × unit_price)
iva_amount = subtotal × (iva_rate / (1 + iva_rate))
total = subtotal
```

**Alternative considered:** Store prices without IVA and add IVA at checkout. Rejected because it doesn't match the existing product price convention.

### 2. Stock Decrement Strategy

**Decision:** Atomic decrement within a DB transaction.

**Implementation:**
```php
DB::transaction(function () use ($validated, $user) {
    // Validate stock
    foreach ($validated['items'] as $item) {
        $product = Product::lockForUpdate()->find($item['product_id']);
        if ($product->stock < $item['quantity']) {
            throw new \Exception("Insufficient stock for {$product->name}");
        }
    }
    
    // Create sale and items
    $sale = Sale::create([...]);
    foreach ($validated['items'] as $item) {
        $sale->items()->create($item);
        Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
    }
    
    return $sale;
});
```

**Rationale:** `lockForUpdate()` prevents race conditions when multiple cashiers sell the same product simultaneously. Transaction ensures all-or-nothing semantics.

**Alternative considered:** Optimistic locking with version column. Rejected as overkill for MVP — pessimistic locking is simpler and sufficient for expected load.

### 3. Sale Number Generation

**Decision:** Database-seeded sequence with `VTA-{6 digits}` format.

**Implementation:** Use a dedicated `sale_number` column with unique constraint. Generate using DB sequence or max+1 within transaction.

**Rationale:** Simple, human-readable, gap-free within normal operation. The unique constraint prevents duplicates.

**Alternative considered:** UUID-based. Rejected because sale numbers need to be human-readable for receipts and lookups.

### 4. POS Terminal Layout

**Decision:** Single-page with product grid + cart sidebar.

**Layout:**
```
┌─────────────────────────────┬──────────────┐
│  [Search Products...]       │   CART       │
├─────────────────────────────┤   ┌───────┐  │
│  Product 1  Product 2       │   │ Item1 │  │
│  Product 3  Product 4       │   │ Item2 │  │
│  Product 5  Product 6       │   │ Item3 │  │
│  ...                        │   └───────┘  │
│                             │              │
│                             │ Subtotal: $  │
│                             │ IVA: $       │
│                             │ Total: $     │
│                             │              │
│                             │ [Cash: ___]  │
│                             │ Change: $    │
│                             │ [CHECKOUT]   │
└─────────────────────────────┴──────────────┘
```

**Rationale:** Follows standard POS layout patterns. Cart always visible for quick verification. Large touch targets for tablet use.

### 5. Frontend State Management

**Decision:** React state for cart (no backend persistence for draft carts).

**Rationale:** Cart is ephemeral — exists only during the sale. No need to persist incomplete carts. Keeps backend simple. If the page refreshes, the cart resets (acceptable for MVP).

**Alternative considered:** Session-based cart persistence. Rejected as unnecessary complexity for MVP.

## Testing Strategy

### Test Environment
- SQLite in-memory database (existing setup)
- Pest 5 with `RefreshDatabase`
- `actingAs()` for authentication

### Key Test Scenarios
1. **Happy path:** Create sale → verify stock decremented → verify sale recorded
2. **Stock validation:** Attempt sale with insufficient stock → verify rejection
3. **Payment validation:** Attempt sale with insufficient payment → verify rejection
4. **IVA calculation:** Verify IVA extracted correctly from inclusive prices
5. **Sale number:** Verify unique generation
6. **Concurrent sales:** Not tested in unit tests (requires load testing)

### Test Data
- Use existing factories (ProductFactory, UserFactory)
- Create SaleFactory and SaleItemFactory
- Set up products with known stock levels for deterministic tests

## Performance Considerations

- **Product search:** Simple LIKE query on product name. Sufficient for MVP. Add full-text search if product catalog grows large.
- **Stock locking:** `lockForUpdate()` holds row lock for transaction duration. Acceptable for expected load (single cashier per register).
- **Cart operations:** All frontend, no server round-trips until checkout. Fast and responsive.

## Security Considerations

- All routes require authentication (`auth` middleware)
- Stock validation prevents overselling
- Payment validation prevents negative change
- No admin-only routes needed (all authenticated users can use POS)

## Migration Path

### Phase 1: Core Sale (this cycle)
- Sale + SaleItem models
- POS Terminal page
- Sales history
- Stock decrement

### Phase 2: Future Enhancements (not in scope)
- Receipt generation (PDF/print)
- Customer tracking
- Multiple payment methods
- Returns/refunds
- Sales reports
- Multi-register support

## Dependencies

- **Existing:** Product model (price, stock, iva_included), Setting model (iva_rate), User model
- **New:** None — self-contained feature

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Stock race condition | Low | High | DB transaction + lockForUpdate |
| IVA calculation error | Medium | High | Clear formula, test with known values |
| Cart state loss on refresh | Low | Low | Acceptable for MVP, document limitation |
| Large product catalog slow search | Low | Medium | Add pagination/debounce later |

## Rollback Plan

- Remove Sale/SaleItem models and migrations
- Remove SaleController and routes
- Remove POS pages from frontend
- No data migration concerns (new tables only)
