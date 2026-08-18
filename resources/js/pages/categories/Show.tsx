import { Head } from '@inertiajs/react';

export default function CategoriesShow({ category }: { category: any }) {
    return (
        <>
            <Head title="Category" />
            <div className="p-4">
                <h1>Category</h1>
            </div>
        </>
    );
}
