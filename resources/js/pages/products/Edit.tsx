import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index as indexProducts } from '@/routes/products';
import ProductForm from './partials/ProductForm';

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

export default function ProductEdit({
    product,
    categories,
}: {
    product: Product;
    categories: Category[];
}) {
    return (
        <>
            <Head title="Edit Product" />

            <div className="space-y-6">
                <Heading title="Edit Product" description={`Editing "${product.name}"`} />
                <ProductForm product={product} categories={categories} action="update" />
            </div>
        </>
    );
}

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Edit Product', href: indexProducts.url() },
    ],
};
