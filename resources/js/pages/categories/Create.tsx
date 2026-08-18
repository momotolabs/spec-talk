import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { create as createCategory } from '@/routes/categories';
import CategoryForm from './partials/CategoryForm';

export default function CategoryCreate() {
    return (
        <>
            <Head title="Create Category" />

            <div className="space-y-6">
                <Heading title="Create Category" description="Add a new product category" />
                <CategoryForm action="store" />
            </div>
        </>
    );
}

CategoryCreate.layout = {
    breadcrumbs: [
        { title: 'Create Category', href: createCategory.url() },
    ],
};
