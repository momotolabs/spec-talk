import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as indexProducts, create as createProduct, edit as editProduct, destroy as destroyProduct } from '@/routes/products';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    min_stock_alert: number;
    active: boolean;
    category: Category;
};

export default function ProductsIndex({
    products,
    categories,
    filters,
}: {
    products: { data: Product[]; current_page: number; last_page: number };
    categories: Category[];
    filters: { search?: string; category_id?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(value: string) {
        setSearch(value);
        router.get(indexProducts.url(), { search: value, category_id: filters.category_id }, { preserveState: true, replace: true });
    }

    function handleCategoryFilter(value: string) {
        const categoryId = value === 'all' ? undefined : value;
        router.get(indexProducts.url(), { search, category_id: categoryId }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title="Products" description="Manage your product catalog" />
                    <Button asChild>
                        <a href={createProduct.url()}>Create Product</a>
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="max-w-sm"
                    />
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
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-right font-medium">Min Alert</th>
                                <th className="px-4 py-3 text-center font-medium">Active</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name}</td>
                                    <td className="px-4 py-3 text-right">${Number(product.price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{product.stock_quantity}</td>
                                    <td className="px-4 py-3 text-right">{product.min_stock_alert}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={product.active ? 'default' : 'destructive'}>
                                            {product.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={editProduct.url(product.id)}>Edit</a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this product?')) {
                                                        router.delete(destroyProduct.url(product.id));
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {products.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === products.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(indexProducts.url(), { search, category_id: filters.category_id, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Products', href: indexProducts.url() },
    ],
};
