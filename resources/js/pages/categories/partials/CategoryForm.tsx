import { useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/categories';

type Category = {
    id: number;
    name: string;
    description: string;
};

export default function CategoryForm({
    category,
    action,
}: {
    category?: Category;
    action: 'store' | 'update';
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (action === 'update' && category) {
            put(update.url(category.id));
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
                    placeholder="Category name"
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

            <div className="flex items-center gap-4">
                <Button disabled={processing}>
                    {action === 'update' ? 'Update' : 'Create'} Category
                </Button>
            </div>
        </form>
    );
}
