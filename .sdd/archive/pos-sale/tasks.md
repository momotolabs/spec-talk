# Tasks: POS Sale — Terminal + History

## Task 1: Migrations + Models

### Files
- `database/migrations/xxxx_create_sales_table.php`
- `database/migrations/xxxx_create_sale_items_table.php`
- `app/Models/Sale.php`
- `app/Models/SaleItem.php`
- `database/factories/SaleFactory.php`
- `database/factories/SaleItemFactory.php`

### Acceptance Criteria
- [ ] `sales` table with all columns from spec
- [ ] `sale_items` table with all columns from spec
- [ ] Sale model with relationships, casts, fillable
- [ ] SaleItem model with relationships, casts, fillable
- [ ] SaleFactory generates realistic data
- [ ] SaleItemFactory generates realistic data
- [ ] Migrations run successfully

---

## Task 2: Controllers + Routes

### Files
- `app/Http/Controllers/SaleController.php`
- `routes/web.php` (add routes)

### Acceptance Criteria
- [ ] SaleController with terminal(), index(), show(), store() methods
- [ ] Routes added to web.php within auth+verified group
- [ ] terminal() returns products and IVA rate
- [ ] index() returns paginated sales with user relation
- [ ] show() returns sale with user and items relations
- [ ] store() validates input, creates sale, decrements stock
- [ ] store() uses DB transaction for atomicity
- [ ] store() validates stock availability
- [ ] store() validates payment amount

---

## Task 3: POS Terminal Page

### Files
- `resources/js/pages/pos/Terminal.tsx`
- `resources/js/pages/pos/partials/Cart.tsx`
- `resources/js/pages/pos/partials/ProductSearch.tsx`

### Acceptance Criteria
- [ ] Product search filters by name
- [ ] Products displayed in grid, click to add to cart
- [ ] Cart shows items with quantity +/- controls
- [ ] Cart shows remove button per item
- [ ] Cart shows subtotal, IVA, total
- [ ] Payment input calculates change
- [ ] Checkout button disabled until payment >= total
- [ ] On successful sale: clear cart, show confirmation
- [ ] On failed sale: show error, keep cart state
- [ ] Responsive layout (desktop/tablet priority)

---

## Task 4: Sales History + Detail Pages

### Files
- `resources/js/pages/sales/Index.tsx`
- `resources/js/pages/sales/Show.tsx`

### Acceptance Criteria
- [ ] Sales list shows sale_number, date, cashier, total, items count
- [ ] Click row navigates to sale detail
- [ ] Sale detail shows header info (number, date, cashier, totals)
- [ ] Sale detail shows items table with quantities and subtotals
- [ ] Back button returns to sales list
- [ ] Pagination works correctly

---

## Task 5: Navigation + Polish

### Files
- `resources/js/components/app-sidebar.tsx`

### Acceptance Criteria
- [ ] POS Terminal link added to sidebar (main nav)
- [ ] Sales History link added to sidebar (main nav)
- [ ] Icons appropriate (CashRegister, Receipt, etc.)
- [ ] Active state works correctly

---

## Task 6: Tests

### Files
- `tests/Feature/SaleTest.php`
- `tests/Unit/SaleTest.php` (optional)

### Acceptance Criteria
- [ ] Feature tests for all acceptance criteria in spec section 6
- [ ] Tests use Pest 5 syntax
- [ ] Tests use existing factories
- [ ] All tests pass
- [ ] Pint clean

---

## Task 7: Verification

### Acceptance Criteria
- [ ] All tests pass
- [ ] Pint clean
- [ ] Build passes
- [ ] Manual browser testing (ask user)
- [ ] POS terminal works end-to-end
- [ ] Stock decrements correctly
- [ ] Sales history shows correct data
