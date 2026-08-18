# Design: Product Catalog + Inventory MVP

**Change ID**: pos-catalog-inventory
**Date**: 2026-08-18
**Status**: Draft — Pending Approval

---

## Database Schema

### Migration 1: `create_categories_table`

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->text('description')->nullable();
    $table->timestamps();
});
```

### Migration 2: `create_products_table`

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->integer('stock_quantity')->default(0)->unsigned();
    $table->integer('min_stock_alert')->default(5)->unsigned();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### Migration 3: `create_settings_table`

```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->text('value');
    $table->timestamps();
});
```

---

## Models

### Category (`app/Models/Category.php`)

```php
#[Fillable(['name', 'description'])]
class Category extends Model
{
    use HasFactory;

    /** @return HasMany<Product> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function hasProducts(): bool
    {
        return $this->products()->exists();
    }
}
```

### Product (`app/Models/Product.php`)

```php
#[Fillable(['name', 'description', 'price', 'stock_quantity', 'min_stock_alert', 'category_id', 'active'])]
class Product extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'min_stock_alert' => 'integer',
            'active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->stock_quantity <= $this->min_stock_alert;
    }
}
```

### Setting (`app/Models/Setting.php`)

```php
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
```

---

## Routes

**File: `routes/web.php`** (additions inside `auth` + `verified` middleware group)

```php
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\SettingController;

Route::resource('categories', CategoryController::class);
Route::resource('products', ProductController::class);
Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
Route::get('settings/iva', [SettingController::class, 'editIva'])->name('settings.iva.edit');
Route::put('settings/iva', [SettingController::class, 'updateIva'])->name('settings.iva.update');
```

---

## Controllers

### CategoryController (`app/Http/Controllers/CategoryController.php`)

Standard resource controller with Inertia responses:

| Method   | Action                                   | Request             | Response       |
|----------|------------------------------------------|---------------------|----------------|
| `index`  | List categories with product count       | —                   | Inertia page   |
| `create` | Show create form                         | —                   | Inertia page   |
| `store`  | Create category                          | StoreCategoryRequest| Redirect index |
| `show`   | Show single category                     | —                   | Inertia page   |
| `edit`   | Show edit form                           | —                   | Inertia page   |
| `update` | Update category                          | UpdateCategoryRequest| Redirect index |
| `destroy`| Delete category (blocks if has products) | —                   | Redirect index |

**Key logic in `destroy`:**
```php
public function destroy(Category $category): RedirectResponse
{
    if ($category->hasProducts()) {
        return back()->withErrors([
            'category' => 'Cannot delete category with associated products. Reassign products first.',
        ]);
    }

    $category->delete();

    return to_route('categories.index');
}
```

### ProductController (`app/Http/Controllers/ProductController.php`)

Standard resource controller with search and category filter:

| Method   | Action                                     | Request             | Response       |
|----------|--------------------------------------------|---------------------|----------------|
| `index`  | List products (search by name, filter by category) | —          | Inertia page   |
| `create` | Show create form with categories            | —                   | Inertia page   |
| `store`  | Create product                             | StoreProductRequest | Redirect index |
| `show`   | Show single product                        | —                   | Inertia page   |
| `edit`   | Show edit form                             | —                   | Inertia page   |
| `update` | Update product                             | UpdateProductRequest| Redirect index |
| `destroy`| Delete product                             | —                   | Redirect index |

**Key logic in `index`:**
```php
public function index(Request $request): Response
{
    $query = Product::with('category');

    if ($request->filled('search')) {
        $query->where('name', 'like', "%{$request->search}%");
    }

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    $products = $query->latest()->paginate(15)->withQueryString();

    return Inertia::render('products/Index', [
        'products' => $products,
        'categories' => Category::orderBy('name')->get(),
        'filters' => $request->only(['search', 'category_id']),
    ]);
}
```

### InventoryController (`app/Http/Controllers/InventoryController.php`)

Single `index` method for the inventory dashboard:

```php
public function index(Request $request): Response
{
    $query = Product::with('category');

    if ($request->boolean('low_stock_only')) {
        $query->whereColumn('stock_quantity', '<=', 'min_stock_alert');
    }

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    $products = $query->orderBy('stock_quantity')->get();

    return Inertia::render('inventory/Index', [
        'products' => $products,
        'categories' => Category::orderBy('name')->get(),
        'summary' => [
            'total_products' => Product::count(),
            'low_stock_count' => Product::whereColumn('stock_quantity', '<=', 'min_stock_alert')->count(),
            'out_of_stock_count' => Product::where('stock_quantity', 0)->count(),
        ],
        'filters' => $request->only(['low_stock_only', 'category_id']),
    ]);
}
```

### SettingController (`app/Http/Controllers/SettingController.php`)

Simple IVA settings form:

```php
public function editIva(): Response
{
    $ivaRate = Setting::get('iva_rate');

    return Inertia::render('settings/Iva', [
        'ivaRate' => $ivaRate?->value ?? '0.19',
    ]);
}

public function updateIva(Request $request): RedirectResponse
{
    $request->validate([
        'iva_rate' => 'required|numeric|min:0|max:1',
    ]);

    Setting::set('iva_rate', $request->iva_rate);

    return to_route('settings.iva.edit');
}
```

---

## Form Requests

### StoreCategoryRequest
```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
        'description' => ['nullable', 'string'],
    ];
}
```

### UpdateCategoryRequest
```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $this->route('category')->id],
        'description' => ['nullable', 'string'],
    ];
}
```

### StoreProductRequest
```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        'stock_quantity' => ['required', 'integer', 'min:0'],
        'min_stock_alert' => ['required', 'integer', 'min:0'],
        'category_id' => ['required', 'exists:categories,id'],
        'active' => ['required', 'boolean'],
    ];
}
```

### UpdateProductRequest
```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        'stock_quantity' => ['required', 'integer', 'min:0'],
        'min_stock_alert' => ['required', 'integer', 'min:0'],
        'category_id' => ['required', 'exists:categories,id'],
        'active' => ['required', 'boolean'],
    ];
}
```

---

## Factories

### CategoryFactory
```php
public function definition(): array
{
    return [
        'name' => fake()->unique()->word(),
        'description' => fake()->optional()->sentence(),
    ];
}
```

### ProductFactory
```php
public function definition(): array
{
    return [
        'name' => fake()->words(3, true),
        'description' => fake()->optional()->paragraph(),
        'price' => fake()->randomFloat(2, 0.50, 100),
        'stock_quantity' => fake()->numberBetween(0, 200),
        'min_stock_alert' => 5,
        'category_id' => Category::factory(),
        'active' => true,
    ];
}
```

---

## Frontend Architecture

### Page Pattern
All pages follow the existing Inertia + React pattern from the starter kit:
- `Head` from `@inertiajs/react` for page titles
- `useForm` from `@inertiajs/react` for forms with server-side validation
- Radix UI components (Dialog, Select, Button, Input, Label, Card)
- Tailwind 4 for styling
- Wayfinder for typed route generation
- Layout via `AppLayout` from `resources/js/layouts/app-layout.tsx`

### Category Pages

**`resources/js/pages/categories/Index.tsx`**
- Table with columns: Name, Description, Product Count, Actions
- Search input filtering by name
- Delete button with confirmation Dialog (Radix)
- Edit link per row
- "Create Category" button linking to create page

**`resources/js/pages/categories/Create.tsx`**
- Form with `name` (required) and `description` (optional)
- Uses `useForm` for submission
- Validation errors displayed inline

**`resources/js/pages/categories/Edit.tsx`**
- Same form as Create, pre-filled with existing data
- Receives `category` prop from controller

**`resources/js/pages/categories/partials/CategoryForm.tsx`**
- Shared form component used by both Create and Edit
- Props: `category?` (for edit mode), `onSubmit`

### Product Pages

**`resources/js/pages/products/Index.tsx`**
- Table with columns: Name, Category, Price, Stock, Min Alert, Active, Actions
- Search input by name
- Category filter dropdown
- Active status badge
- Links to create/edit

**`resources/js/pages/products/Create.tsx`**
- Form with all product fields
- Category select dropdown (from props)
- Active toggle (checkbox)

**`resources/js/pages/products/Edit.tsx`**
- Same form, pre-filled

**`resources/js/pages/products/partials/ProductForm.tsx`**
- Shared form component
- Props: `product?`, `categories`, `onSubmit`

### Inventory Page

**`resources/js/pages/inventory/Index.tsx`**
- **Summary cards** (top row): Total Products, Low Stock, Out of Stock
- **Table**: Product Name, Category, Stock, Min Alert, Status badge
- **Low stock badge**: Red when `stock_quantity <= min_stock_alert`
- **Filter**: Toggle for "Show low stock only"
- **Category filter**: Dropdown

### Settings IVA Page

**`resources/js/pages/settings/Iva.tsx`**
- Simple form with IVA rate input (number, step 0.01, min 0, max 1)
- Display as percentage (0.19 → 19%)
- Save button

### Navigation

**`resources/js/components/app-sidebar.tsx`** — add to `mainNavItems`:
```typescript
import { Package, ShoppingCart, BarChart3, Settings } from 'lucide-react';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Categories', href: '/categories', icon: FolderGit2 },
    { title: 'Products', href: '/products', icon: Package },
    { title: 'Inventory', href: '/inventory', icon: BarChart3 },
];
```

Settings IVA link added to the settings section of the sidebar.

---

## Test Strategy

### CategoryTest (`tests/Feature/CategoryTest.php`)
1. Guests are redirected to login
2. Authenticated users can view categories index
3. Authenticated users can create a category
4. Category name must be unique
5. Authenticated users can update a category
6. Category with products cannot be deleted
7. Category without products can be deleted

### ProductTest (`tests/Feature/ProductTest.php`)
1. Guests are redirected to login
2. Authenticated users can view products index
3. Authenticated users can create a product
4. Product requires valid category_id
5. Stock quantity cannot be negative
6. Authenticated users can update a product
7. Authenticated users can delete a product
8. Products can be filtered by category

### InventoryTest (`tests/Feature/InventoryTest.php`)
1. Guests are redirected to login
2. Authenticated users can view inventory
3. Low stock products are highlighted
4. Inventory can be filtered by low stock only
5. Summary cards show correct counts

### SettingTest (`tests/Feature/SettingTest.php`)
1. Guests are redirected to login
2. Authenticated users can view IVA settings
3. Authenticated users can update IVA rate
4. IVA rate must be numeric between 0 and 1

---

## File Inventory

### New Files
```
database/migrations/xxxx_create_categories_table.php
database/migrations/xxxx_create_products_table.php
database/migrations/xxxx_create_settings_table.php
app/Models/Category.php
app/Models/Product.php
app/Models/Setting.php
database/factories/CategoryFactory.php
database/factories/ProductFactory.php
app/Http/Controllers/CategoryController.php
app/Http/Controllers/ProductController.php
app/Http/Controllers/InventoryController.php
app/Http/Controllers/SettingController.php
app/Http/Requests/StoreCategoryRequest.php
app/Http/Requests/UpdateCategoryRequest.php
app/Http/Requests/StoreProductRequest.php
app/Http/Requests/UpdateProductRequest.php
resources/js/pages/categories/Index.tsx
resources/js/pages/categories/Create.tsx
resources/js/pages/categories/Edit.tsx
resources/js/pages/categories/partials/CategoryForm.tsx
resources/js/pages/products/Index.tsx
resources/js/pages/products/Create.tsx
resources/js/pages/products/Edit.tsx
resources/js/pages/products/partials/ProductForm.tsx
resources/js/pages/inventory/Index.tsx
resources/js/pages/settings/Iva.tsx
tests/Feature/CategoryTest.php
tests/Feature/ProductTest.php
tests/Feature/InventoryTest.php
tests/Feature/SettingTest.php
```

### Modified Files
```
routes/web.php (add resource routes)
resources/js/components/app-sidebar.tsx (add nav items)
```
