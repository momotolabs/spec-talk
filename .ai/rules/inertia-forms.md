# Inertia v3 Form Data — CRITICAL RULE

## The trap

In Inertia v3, `post(url, secondArg)` — the second argument is **VisitOptions** (`{ preserveState, onSuccess, except, ... }`), **NOT form data**. Any data properties passed there (like `items`, `payment_amount`) are silently ignored. The request goes out with the **initial** `useForm({...})` data, unchanged.

```ts
// WRONG — sends empty initial data, items/payment_amount are ignored
post('/sales', {
    items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),  // IGNORED
    payment_amount: payment,  // IGNORED
    onSuccess: () => { ... },  // This IS a valid option
});
```

## Two correct patterns

### Pattern 1: `setData` + `post` (when data is already in state)

```ts
const { data, setData, post } = useForm({ name: '', email: '' });

// In onChange handlers or before submit:
setData('name', value);
post('/users');  // sends data.name and data.email
```

### Pattern 2: `transform` + `post` (when data lives outside the form)

Best when form data is derived from local state (carts, dynamic lists, computed values):

```ts
const { post, transform } = useForm({ items: [], payment_amount: 0 });

// transform() sets the mapper — call it BEFORE post(), they are separate calls
transform(() => ({
    items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
    payment_amount: payment,
}));

post('/sales', {
    onSuccess: () => { /* clear cart */ },
});
```

`transform()` takes a callback that returns the payload to send. It runs right before the request. Call `transform()` first, then `post()` — **do NOT chain them** (transform returns void).

## Rules

1. **NEVER** pass form data as the second argument to `post()`, `put()`, `patch()`, `delete()`, or `get()`. That argument is always VisitOptions.
2. Use `setData()` when the data maps 1:1 with form state and user inputs.
3. Use `transform()` when the data is derived from local React state that isn't part of the form object.
4. All existing forms in this project use Pattern 1 (CategoryForm, ProductForm, SettingsIva). The Terminal uses Pattern 2 because cart state lives in `useState`, not in `useForm`.

## Reference

Inertia v3 docs: https://inertiajs.com/docs/v3/the-basics/forms

> `post(url, options)` — options support `preserveState`, `preserveScroll`, `except`, `onSuccess`, `onError`, ` onFinish`, `only`, `headers`, `errorBag`, `forceFormData`, `refresh`.
