import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as indexInventory } from '@/routes/inventory';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    stock_quantity: number;
    min_stock_alert: number;
    category: Category;
};

type Summary = {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
};

export default function InventoryIndex({
    products,
    categories,
    summary,
    filters,
}: {
    products: Product[];
    categories: Category[];
    summary: Summary;
    filters: { low_stock_only?: boolean; category_id?: string };
}) {
    const [lowStockOnly, setLowStockOnly] = useState(filters.low_stock_only ?? false);

    function handleLowStockToggle(checked: boolean) {
        setLowStockOnly(checked);
        router.get(indexInventory.url(), { low_stock_only: checked, category_id: filters.category_id }, { preserveState: true, replace: true });
    }

    function handleCategoryFilter(value: string) {
        const categoryId = value === 'all' ? undefined : value;
        router.get(indexInventory.url(), { low_stock_only: lowStockOnly, category_id: categoryId }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Inventory" />

            <div className="space-y-6">
                <Heading title="Inventory" description="Monitor stock levels across all products" />

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_products}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{summary.low_stock_count}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{summary.out_of_stock_count}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="low-stock"
                            checked={lowStockOnly}
                            onCheckedChange={(checked) => handleLowStockToggle(checked === true)}
                        />
                        <label htmlFor="low-stock" className="text-sm">Show low stock only</label>
                    </div>
                    <Select value={filters.category_id ?? 'all'} onValueChange={handleCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Product</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-right font-medium">Min Alert</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => {
                                const isOutOfStock = product.stock_quantity === 0;
                                const isLowStock = product.stock_quantity <= product.min_stock_alert;
                                return (
                                    <tr key={product.id} className="border-b last:border-0">
                                        <td className="px-4 py-3 font-medium">{product.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.category?.name}</td>
                                        <td className="px-4 py-3 text-right">{product.stock_quantity}</td>
                                        <td className="px-4 py-3 text-right">{product.min_stock_alert}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'destructive' : 'default'}>
                                                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Inventory', href: indexInventory.url() },
    ],
};
