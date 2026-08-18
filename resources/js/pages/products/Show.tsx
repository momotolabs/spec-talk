import { Head } from '@inertiajs/react';

export default function ProductsShow({ product }: { product: any }) {
    return (
        <>
            <Head title="Product" />
            <div className="p-4">
                <h1>Product</h1>
            </div>
        </>
    );
}
