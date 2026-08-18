# Specification: Product Catalog + Inventory MVP

**Change ID**: pos-catalog-inventory
**Date**: 2026-08-18
**Status**: Draft — Pending Approval

---

## Entities

### Category

| Field        | Type     | Constraints                        |
|--------------|----------|------------------------------------|
| `id`         | bigint   | auto-increment, primary key        |
| `name`       | string   | required, unique                   |
| `description`| text     | nullable                           |
| `created_at` | datetime | auto                               |
| `updated_at` | datetime | auto                               |

**Behaviors:**
- CRUD operations (create, read, update, delete)
- **Delete protection**: Cannot delete a category that has associated products. Must reassign or remove products first.
- Name must be unique across all categories

---

### Product

| Field             | Type     | Constraints                              |
|-------------------|----------|------------------------------------------|
| `id`              | bigint   | auto-increment, primary key              |
| `name`            | string   | required                                 |
| `description`     | text     | nullable                                 |
| `price`           | decimal  | required, 10 digits, 2 decimals, min 0   |
| `stock_quantity`  | integer  | required, unsigned, default 0, min 0     |
| `min_stock_alert` | integer  | required, unsigned, default 5, min 0     |
| `category_id`     | bigint   | foreign key → categories.id, required     |
| `active`          | boolean  | required, default true                   |
| `created_at`      | datetime | auto                                     |
| `updated_at`      | datetime | auto                                     |

**Behaviors:**
- CRUD operations
- **Belongs to** a Category (required relationship)
- `stock_quantity` cannot go below 0 (enforced at DB and app level)
- **Low stock alert**: Product appears in low-stock list when `stock_quantity <= min_stock_alert`
- `active` flag allows disabling products without deleting them
- Price displayed with 2 decimal places (USD formatting)

---

### Setting

| Field        | Type     | Constraints                  |
|--------------|----------|------------------------------|
| `id`         | bigint   | auto-increment, primary key  |
| `key`        | string   | required, unique             |
| `value`      | text     | required                     |
| `created_at` | datetime | auto                         |
| `updated_at` | datetime | auto                         |

**Behaviors:**
- Key-value store for system-wide configuration
- **Static accessor**: `Setting::get(string $key): ?string`
- **Static mutator**: `Setting::set(string $key, string $value): Setting`
- IVA rate stored as key `iva_rate` with decimal value (e.g., `"0.19"` = 19%)

---

## Scenarios

### Scenario 1: Admin creates a category
**Given** an authenticated admin
**When** they POST to `/categories` with valid data (name: "Bebidas", description: "Todas las bebidas")
**Then** the category is created and they are redirected to the categories index
**And** the new category appears in the categories list

### Scenario 2: Admin creates a product with category
**Given** an authenticated admin and a category "Bebidas" exists
**When** they POST to `/products` with valid data (name: "Coca-Cola", price: 1.50, stock_quantity: 50, category_id: 1)
**Then** the product is created and they are redirected to the products index
**And** the product appears in the list with its category name "Bebidas"

### Scenario 3: Admin edits product stock
**Given** an authenticated admin and a product "Coca-Cola" with stock_quantity: 50
**When** they PUT to `/products/1` with stock_quantity: 30
**Then** the product stock is updated to 30
**And** the inventory dashboard reflects the new quantity

### Scenario 4: Product triggers low-stock alert
**Given** a product "Coca-Cola" with stock_quantity: 3 and min_stock_alert: 5
**When** the admin visits the inventory page
**Then** the product appears with a low-stock badge/indicator
**And** the summary card shows the count of low-stock items

### Scenario 5: Admin cannot delete category with products
**Given** a category "Bebidas" with 2 associated products
**When** they attempt to DELETE `/categories/1`
**Then** the deletion is blocked with an error message
**And** the category still exists in the database
**And** the response contains an error indicating products must be reassigned first

### Scenario 6: Admin configures IVA rate
**Given** an authenticated admin
**When** they PUT to `/settings/iva` with rate: 0.19
**Then** the setting is saved with key `iva_rate` and value `"0.19"`
**And** when they visit `/settings/iva` again, the form shows 0.19

### Scenario 7: Admin cannot create category with duplicate name
**Given** a category "Bebidas" already exists
**When** they POST to `/categories` with name: "Bebidas"
**Then** validation fails with a "name already taken" error
**And** the category is not created

### Scenario 8: Admin cannot set negative stock
**Given** an authenticated admin
**When** they POST to `/products` with stock_quantity: -5
**Then** validation fails with a "must be at least 0" error
**And** the product is not created

### Scenario 9: Admin filters inventory by category
**Given** products in categories "Bebidas" and "Snacks"
**When** they visit `/inventory?category_id=1`
**Then** only products in category "Bebidas" are shown

### Scenario 10: Admin toggles product active status
**Given** an active product "Coca-Cola"
**When** they edit the product and set active: false
**Then** the product is saved as inactive
**And** the products list shows the inactive status
