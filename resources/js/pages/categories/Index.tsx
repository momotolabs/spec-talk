import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { index as indexCategories, create as createCategory, edit as editCategory, destroy as destroyCategory } from '@/routes/categories';

type Category = {
    id: number;
    name: string;
    description: string;
    products_count: number;
};

export default function CategoriesIndex({
    categories,
    filters,
}: {
    categories: { data: Category[]; current_page: number; last_page: number; per_page: number };
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    function handleSearch(value: string) {
        setSearch(value);
        router.get(indexCategories.url(), { search: value }, { preserveState: true, replace: true });
    }

    function handleDelete() {
        if (deleteId === null) return;
        router.delete(destroyCategory.url(deleteId), {
            onSuccess: () => setDeleteId(null),
        });
    }

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title="Categories" description="Manage your product categories" />
                    <Button asChild>
                        <a href={createCategory.url()}>Create Category</a>
                    </Button>
                </div>

                <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-left font-medium">Products</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data.map((category) => (
                                <tr key={category.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{category.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{category.description || '—'}</td>
                                    <td className="px-4 py-3">{category.products_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={editCategory.url(category.id)}>Edit</a>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(category.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {categories.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: categories.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === categories.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(indexCategories.url(), { search, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Categories', href: indexCategories.url() },
    ],
};
