import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { create as createProduct } from '@/routes/products';
import ProductForm from './partials/ProductForm';

type Category = {
    id: number;
    name: string;
};

export default function ProductCreate({ categories }: { categories: Category[] }) {
    return (
        <>
            <Head title="Create Product" />

            <div className="space-y-6">
                <Heading title="Create Product" description="Add a new product to the catalog" />
                <ProductForm categories={categories} action="store" />
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Create Product', href: createProduct.url() },
    ],
};
