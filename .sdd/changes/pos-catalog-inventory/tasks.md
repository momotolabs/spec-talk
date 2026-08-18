# Tasks: Product Catalog + Inventory MVP

**Change ID**: pos-catalog-inventory
**Date**: 2026-08-18
**Status**: Draft — Pending Approval

---

## Task 1: Database Migrations
**Dependencies**: None
**Files**: `database/migrations/xxxx_create_categories_table.php`, `xxxx_create_products_table.php`, `xxxx_create_settings_table.php`

Create three migrations:
1. `categories` table (id, name unique, description nullable, timestamps)
2. `products` table (id, name, description nullable, price decimal 10,2, stock_quantity unsigned default 0, min_stock_alert unsigned default 5, category_id FK, active boolean default true, timestamps)
3. `settings` table (id, key unique, value text, timestamps)

Run `php artisan migrate` to verify.

---

## Task 2: Models + Factories
**Dependencies**: Task 1
**Files**: `app/Models/Category.php`, `app/Models/Product.php`, `app/Models/Setting.php`, `database/factories/CategoryFactory.php`, `database/factories/ProductFactory.php`

Create models with:
- Category: `#[Fillable]`, `HasMany` products, `hasProducts()` method
- Product: `#[Fillable]`, `BelongsTo` category, `is_low_stock` accessor, casts
- Setting: `#[Fillable]`, static `get()`/`set()` methods

Create factories:
- CategoryFactory: name from faker unique word, description nullable
- ProductFactory: name, description, price, stock, min_alert, category_id, active

---

## Task 3: Form Requests
**Dependencies**: Task 1
**Files**: `app/Http/Requests/StoreCategoryRequest.php`, `UpdateCategoryRequest.php`, `StoreProductRequest.php`, `UpdateProductRequest.php`

Validation rules per spec:
- Category: name required, unique (update excludes self)
- Product: all fields required, price numeric min 0, stock min 0, category_id exists

---

## Task 4: Controllers
**Dependencies**: Tasks 1, 2, 3
**Files**: `app/Http/Controllers/CategoryController.php`, `ProductController.php`, `InventoryController.php`, `SettingController.php`

Implement:
- CategoryController: resource (destroy checks hasProducts)
- ProductController: resource (index with search + category filter)
- InventoryController: index only (summary cards, low stock filter)
- SettingController: editIva + updateIva

---

## Task 5: Routes
**Dependencies**: Task 4
**Files**: `routes/web.php`

Add inside `auth` + `verified` middleware:
- `Route::resource('categories', CategoryController::class)`
- `Route::resource('products', ProductController::class)`
- `Route::get('inventory', ...)`
- `Route::get/put('settings/iva', ...)`

---

## Task 6: Feature Tests
**Dependencies**: Tasks 1–5
**Files**: `tests/Feature/CategoryTest.php`, `ProductTest.php`, `InventoryTest.php`, `SettingTest.php`

Write Pest 5 tests covering all 10 scenarios from the spec. Run `php artisan test --compact` — all pass.

---

## Task 7: Category Pages
**Dependencies**: Tasks 2, 4, 5
**Files**: `resources/js/pages/categories/Index.tsx`, `Create.tsx`, `Edit.tsx`, `partials/CategoryForm.tsx`

Implement:
- Index: table with search, delete confirmation dialog
- Create/Edit: shared form component
- Use `useForm` from Inertia, Wayfinder routes

---

## Task 8: Product Pages
**Dependencies**: Tasks 2, 4, 5, 7
**Files**: `resources/js/pages/products/Index.tsx`, `Create.tsx`, `Edit.tsx`, `partials/ProductForm.tsx`

Implement:
- Index: table with search, category filter, active badge
- Create/Edit: shared form with category select
- Use `useForm`, Wayfinder routes

---

## Task 9: Inventory Page
**Dependencies**: Tasks 2, 4, 5
**Files**: `resources/js/pages/inventory/Index.tsx`

Implement:
- Summary cards (total, low stock, out of stock)
- Table sorted by stock ascending
- Low stock badge
- Filter toggle for low stock only

---

## Task 10: Settings IVA Page
**Dependencies**: Tasks 2, 4, 5
**Files**: `resources/js/pages/settings/Iva.tsx`

Implement:
- Simple form with rate input
- Save button

---

## Task 11: Navigation Updates
**Dependencies**: Tasks 7, 8, 9, 10
**Files**: `resources/js/components/app-sidebar.tsx`

Add nav items: Categories, Products, Inventory. Add Settings > IVA link.

---

## Task 12: Final Verification
**Dependencies**: All previous tasks
**Files**: None (verification only)

Run:
- `php artisan test --compact` — all pass
- `vendor/bin/pint --dirty --format agent` — clean
- `npm run types:check` — no errors
- `npm run lint:check` — no errors
