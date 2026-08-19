# Specification: POS Sale — Terminal + History

## 1. Data Model

### 1.1 `sales` Table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| sale_number | string | Unique, auto-generated (VTA-000001) |
| user_id | bigint | FK → users (cashier) |
| subtotal | decimal(10,2) | Sum of item subtotals (before IVA) |
| iva_amount | decimal(10,2) | IVA calculated amount |
| total | decimal(10,2) | subtotal + iva_amount |
| payment_amount | decimal(10,2) | Cash received |
| change_amount | decimal(10,2) | payment_amount - total |
| timestamps | — | created_at, updated_at |

**Indexes:** `sale_number` (unique), `user_id`, `created_at`

### 1.2 `sale_items` Table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| sale_id | bigint | FK → sales (cascade delete) |
| product_id | bigint | FK → products |
| quantity | integer | Positive integer |
| unit_price | decimal(10,2) | Price at time of sale |
| subtotal | decimal(10,2) | quantity × unit_price |

**Indexes:** `sale_id`, `product_id`

### 1.3 Relationships

- Sale → belongsTo User (cashier)
- Sale → hasMany SaleItem
- SaleItem → belongsTo Sale
- SaleItem → belongsTo Product

## 2. Business Rules

### 2.1 Sale Number Generation
- Format: `VTA-{6 digits}` (e.g., VTA-000001)
- Auto-incrementing sequence, reset never
- Generated on sale creation, not on form load

### 2.2 IVA Calculation
- Read IVA rate from `settings` table (key: `iva_rate`)
- IVA is included in product prices ( products.iva_included = true )
- `subtotal` = sum of (quantity × unit_price) for all items
- `iva_amount` = subtotal × (iva_rate / (1 + iva_rate))
- `total` = subtotal (IVA already included in prices)
- Example: subtotal $119.00, IVA 16% → iva_amount = $19.00, total = $119.00

### 2.3 Stock Validation
- Before completing sale, validate: for each item, product.stock >= quantity
- If any item fails validation, reject entire sale with error message
- On success: decrement each product.stock by the item quantity
- Use atomic database operations (DB transaction + decrement)

### 2.4 Payment
- Cash only
- Flow: user clicks "Pay" button → Payment Dialog opens → user enters cash tendered → system calculates change
- change_amount = payment_amount - total
- Validation: payment_amount >= total (enforced server-side and in dialog)

### 2.5 Cart Rules
- Minimum 1 item in cart to checkout
- Quantity per item: minimum 1, maximum = product.stock
- Duplicate product in cart: increment quantity, don't add duplicate row (frontend only)

## 3. Pages

### 3.1 POS Terminal (`/pos`)

**Layout:** Full-width, optimized for touchscreen (large buttons, clear totals)

**Components:**
- Product search bar (live search by name)
- Product grid/list (filtered results, click to add to cart)
- Cart sidebar/panel:
  - List of items: product name, quantity (+/- controls), unit price, subtotal, remove button
  - Summary: subtotal, IVA amount, total
  - "Pay $XX.XX" button (always enabled when cart has items, shows total amount)
- Payment Dialog (opens on "Pay" click):
  - Shows total due
  - Cash tendered input
  - Live change calculation
  - "Complete Sale" button (disabled until cash tendered >= total)
  - Cancel button to close dialog

**Interactions:**
- Search → filter products → click to add to cart
- Cart quantity +/- → update item subtotal
- Remove item → update totals
- Click "Pay $XX.XX" → open Payment Dialog
- Enter cash in dialog → calculate change
- Click "Complete Sale" in dialog → validate → create sale + items → decrement stock → close dialog → clear cart → show confirmation

### 3.2 Sales History (`/sales`)

**Components:**
- Table: sale_number, date, cashier name, total, items count
- Click row → navigate to sale detail
- Search/filter by date range (optional, add when needed)

### 3.3 Sale Detail (`/sales/{id}`)

**Components:**
- Sale header: sale_number, date, cashier, total, payment, change
- Items table: product name, quantity, unit price, subtotal
- Back button to sales list

## 4. Routes

| Method | Path | Controller | Name |
|--------|------|------------|------|
| GET | /pos | SaleController@terminal | pos.terminal |
| GET | /sales | SaleController@index | sales.index |
| GET | /sales/{sale} | SaleController@show | sales.show |
| POST | /sales | SaleController@store | sales.store |

## 5. API/Inertia Props

### 5.1 POS Terminal Props
```typescript
{
  products: Product[]; // all active products with stock
  ivaRate: number;     // from settings
  cart: CartItem[];    // frontend state, not from server
}
```

### 5.2 Sales Index Props
```typescript
{
  sales: Paginated<Sale>; // with user relation
}
```

### 5.3 Sale Show Props
```typescript
{
  sale: Sale; // with user and saleItems relations
  ivaRate: number;
}
```

## 6. Tests

### 6.1 Feature Tests
- `SaleTest.php`:
  - authenticated user can access POS terminal
  - unauthenticated user redirected to login
  - can create a sale with valid data
  - sale decrements product stock
  - sale rejects insufficient stock
  - sale rejects zero items
  - sale rejects payment less than total
  - sale generates correct sale number
  - sale calculates IVA correctly
  - can list sales
  - can view sale detail

### 6.2 Unit Tests
- Sale model: relationships, sale number generation
- SaleItem model: relationships, subtotal calculation

## 7. Frontend Conventions

- Follow existing patterns from Cycle 1 pages
- Use Inertia `useForm` for form handling
- Use Wayfinder routes (`import { route } from '@/routes'`)
- Use Radix UI components (Dialog, Button, Input, Badge, Card)
- Use Tailwind CSS classes
- Responsive but prioritize desktop/tablet (POS terminal)
