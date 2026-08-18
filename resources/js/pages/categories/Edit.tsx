import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index as indexCategories } from '@/routes/categories';
import CategoryForm from './partials/CategoryForm';

type Category = {
    id: number;
    name: string;
    description: string;
};

export default function CategoryEdit({ category }: { category: Category }) {
    return (
        <>
            <Head title="Edit Category" />

            <div className="space-y-6">
                <Heading title="Edit Category" description={`Editing "${category.name}"`} />
                <CategoryForm category={category} action="update" />
            </div>
        </>
    );
}

CategoryEdit.layout = {
    breadcrumbs: [
        { title: 'Edit Category', href: indexCategories.url() },
    ],
};
