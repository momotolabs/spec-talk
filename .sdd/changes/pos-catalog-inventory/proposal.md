# Proposal: Product Catalog + Inventory MVP

**Change ID**: pos-catalog-inventory
**Date**: 2026-08-18
**Status**: Draft — Pending Approval

---

## Intent

Build the foundational product catalog and inventory management layer for a POS system. This delivers the data model (Categories, Products, IVA settings) with full CRUD operations, an inventory dashboard with low-stock alerts, and complete TDD coverage — all built on the existing Laravel 13 + Inertia React 19 starter kit.

This is the **first SDD cycle** for the POS system. It establishes the core data entities that all future features (sales, clients, reporting) will depend on.

---

## Why

- The business needs to **track products** with pricing, stock levels, and category organization
- Admins need to **monitor inventory** and receive alerts when stock is low
- **IVA (tax) rate** needs to be configurable as a system setting, not hardcoded
- Without this foundation, no sales or transaction features can be built

---

## Scope

### In Scope
- **Category CRUD**: Create, read, update, delete product categories
- **Product CRUD**: Create, read, update, delete products with category association
- **Inventory Dashboard**: View all products sorted by stock level, low-stock alerts, summary cards
- **IVA Rate Configuration**: Key-value settings store with IVA rate as the first setting
- **TDD Coverage**: Feature tests for all controllers using Pest 5

### Out of Scope
- Sales/transactions (next cycle)
- Client management
- User roles and permissions (using existing auth only)
- Barcode generation
- Receipt printing
- Image uploads for products
- Multi-warehouse inventory
- Import/export functionality

---

## Success Criteria

1. Admin can create, edit, and delete **categories** (with protection against deleting categories that have products)
2. Admin can create, edit, and delete **products** with name, description, price, stock quantity, min stock alert, and category
3. **Inventory dashboard** shows all products sorted by stock level, with low-stock badges and summary cards
4. Admin can **configure IVA rate** (stored as a decimal, e.g., 0.19 = 19%)
5. All operations are covered by **feature tests** that pass
6. All pages use existing **Inertia + React patterns** from the starter kit
7. No TypeScript or lint errors

---

## Entities

| Entity     | Purpose                              |
|------------|--------------------------------------|
| Category   | Organize products into groups        |
| Product    | Individual items for sale            |
| Setting    | Key-value store for system config    |

---

## Decisions

| Decision                     | Rationale                                                              |
|------------------------------|------------------------------------------------------------------------|
| Key-value settings table     | Extensible for future settings without new migrations each time        |
| Category delete protection   | Prevents orphaned products; admin must reassign first                  |
| Hard deletes (no soft deletes) | Simplicity for MVP; add when data model grows                       |
| Stock as unsigned integer    | General POS, no fractional units; change to decimal later if needed   |
| IVA stored as decimal        | 0.19 = 19%; consistent with math operations                           |
| No image uploads in MVP      | Out of scope; add when product presentation needs it                  |
