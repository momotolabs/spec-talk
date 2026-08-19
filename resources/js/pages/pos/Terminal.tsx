import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { index as indexSales } from '@/routes/sales';
import { Search, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
};

type CartItem = {
    product: Product;
    quantity: number;
};

export default function Terminal({ products, ivaRate }: { products: Product[]; ivaRate: string }) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [cashTendered, setCashTendered] = useState('');

    const { post, transform, processing, errors } = useForm({
        items: [] as { product_id: number; quantity: number }[],
        payment_amount: 0,
    });

    const filteredProducts = useMemo(
        () =>
            products.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            ),
        [products, search]
    );

    const rate = parseFloat(ivaRate);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const ivaAmount = subtotal * (rate / (1 + rate));
    const total = subtotal;
    const cash = parseFloat(cashTendered) || 0;
    const change = cash - total;
    const canComplete = cash >= total;

    function addToCart(product: Product) {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }

    function updateQuantity(productId: number, delta: number) {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    }

    function handleCompleteSale() {
        if (!canComplete || processing) return;

        transform(() => ({
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
            payment_amount: cash,
        }));

        post('/sales', {
            onSuccess: () => {
                setCart([]);
                setCashTendered('');
                setPaymentOpen(false);
            },
        });
    }

    return (
        <>
            <Head title="POS Terminal" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title="POS Terminal" description="Point of Sale" />
                    <Button variant="outline" asChild>
                        <a href={indexSales.url()}>Sales History</a>
                    </Button>
                </div>

                {errors.items && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {errors.items}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                    {/* Product Grid */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors hover:bg-accent"
                                >
                                    <span className="font-medium text-sm leading-tight">{product.name}</span>
                                    <span className="text-lg font-semibold">${Number(product.price).toFixed(2)}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        Stock: {product.stock_quantity}
                                    </Badge>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <p className="col-span-full py-8 text-center text-muted-foreground">
                                    No products found.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex items-center gap-2 border-b px-6 py-4">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="font-semibold">Cart</span>
                            <Badge variant="secondary" className="ml-auto">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {cart.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Add products to start a sale
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div
                                            key={item.product.id}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium">{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ${Number(item.product.price).toFixed(2)} each
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    disabled={item.quantity >= item.product.stock_quantity}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="w-20 text-right text-sm font-medium">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive"
                                                onClick={() => removeFromCart(item.product.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 border-t px-6 py-4">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">IVA ({(rate * 100).toFixed(0)}%)</span>
                                    <span>${ivaAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 text-base font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                disabled={cart.length === 0}
                                onClick={() => {
                                    setCashTendered('');
                                    setPaymentOpen(true);
                                }}
                            >
                                Pay ${total.toFixed(2)}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Dialog */}
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Payment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-sm text-muted-foreground">Total due</p>
                            <p className="text-3xl font-bold">${total.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Cash tendered</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={cashTendered}
                                onChange={(e) => setCashTendered(e.target.value)}
                                className="text-lg text-center"
                                autoFocus
                            />
                        </div>

                        {cash > 0 && (
                            <div className="flex justify-between rounded-lg border p-3 text-sm">
                                <span className="font-medium">Change</span>
                                <span className={change < 0 ? 'font-medium text-destructive' : 'font-medium text-green-600'}>
                                    ${change < 0 ? '0.00' : change.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {errors.payment_amount && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {errors.payment_amount}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPaymentOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCompleteSale}
                            disabled={!canComplete || processing}
                        >
                            {processing ? 'Processing...' : 'Complete Sale'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Terminal.layout = {
    breadcrumbs: [
        { title: 'POS Terminal', href: '/pos' },
    ],
};
