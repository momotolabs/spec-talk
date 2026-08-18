import { useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store, update } from '@/routes/products';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    min_stock_alert: number;
    category_id: number;
    active: boolean;
};

export default function ProductForm({
    product,
    categories,
    action,
}: {
    product?: Product;
    categories: Category[];
    action: 'store' | 'update';
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price?.toString() ?? '',
        stock_quantity: product?.stock_quantity?.toString() ?? '0',
        min_stock_alert: product?.min_stock_alert?.toString() ?? '0',
        category_id: product?.category_id?.toString() ?? '',
        active: product?.active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (action === 'update' && product) {
            put(update.url(product.id));
        } else {
            post(store.url());
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    placeholder="Product name"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="border-input placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    placeholder="Optional description"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        required
                        placeholder="0.00"
                    />
                    <InputError message={errors.price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.category_id} />
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={data.stock_quantity}
                        onChange={(e) => setData('stock_quantity', e.target.value)}
                        required
                    />
                    <InputError message={errors.stock_quantity} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="min_stock_alert">Min Stock Alert</Label>
                    <Input
                        id="min_stock_alert"
                        type="number"
                        min="0"
                        value={data.min_stock_alert}
                        onChange={(e) => setData('min_stock_alert', e.target.value)}
                        required
                    />
                    <InputError message={errors.min_stock_alert} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="active"
                    checked={data.active}
                    onCheckedChange={(checked) => setData('active', checked === true)}
                />
                <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex items-center gap-4">
                <Button disabled={processing}>
                    {action === 'update' ? 'Update' : 'Create'} Product
                </Button>
            </div>
        </form>
    );
}
