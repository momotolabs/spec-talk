# Proposal: POS Sale — Terminal + History

## Intent

Build the core POS sale flow: a terminal page where cashiers search products, build a cart, process cash payment with IVA calculation and change, and automatically decrement inventory. Plus a sales history view.

## Scope

### In Scope
1. **Sale model** — records each transaction (cashier, totals, payment, change)
2. **SaleItem model** — line items per sale (product, quantity, unit price, subtotal)
3. **Migrations** — `sales` and `sale_items` tables
4. **POS Terminal page** — the main cashier screen with product search, cart, checkout
5. **SaleController** — `store` (create sale) and `index` (list sales)
6. **Stock decrement** — atomic decrement on sale completion with stock validation
7. **Sales history** — list of past sales with totals and cashier info
8. **Sales detail** — view a past sale with its items

### Out of Scope
- Card/digital payments (cash only MVP)
- Receipt printing/PDF
- Customer tracking (anonymous sales)
- Returns/refunds
- Multi-register support
- Sales reports/analytics

## User Stories

1. **As a cashier**, I can search for products by name to quickly add them to the cart.
2. **As a cashier**, I can adjust quantities and remove items from the cart before checkout.
3. **As a cashier**, I can see the subtotal, IVA, and total before processing payment.
4. **As a cashier**, I can enter the cash amount received and see the change to give back.
5. **As a cashier**, I can complete a sale which decrements stock and records the transaction.
6. **As a manager**, I can view a list of all sales with date, cashier, and total.
7. **As a manager**, I can view the details of a specific sale including all line items.

## Dependencies

- Existing Product model (with price, stock, iva_included fields)
- Existing Setting model (IVA rate)
- Existing user authentication (auth middleware)

## Acceptance Criteria

- [ ] POS Terminal page loads with product search
- [ ] Products can be added to cart by clicking/searching
- [ ] Cart shows items with quantity controls and remove
- [ ] Subtotal, IVA, and total calculate correctly
- [ ] Cash payment input calculates change accurately
- [ ] Sale completion decrements stock atomically
- [ ] Sale completion validates sufficient stock
- [ ] Sales history lists all sales with correct data
- [ ] Sale detail shows all line items
- [ ] All operations are authenticated
- [ ] All tests pass

## Estimated Effort

Small — 1 day implementation, following established patterns from Cycle 1.
