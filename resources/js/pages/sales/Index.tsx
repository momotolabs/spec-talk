import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { index as indexSales, show as showSale } from '@/routes/sales';

type Sale = {
    id: number;
    sale_number: string;
    total: number;
    payment_amount: number;
    change_amount: number;
    created_at: string;
    user: { name: string };
    items: { id: number }[];
};

export default function SalesIndex({
    sales,
}: {
    sales: { data: Sale[]; current_page: number; last_page: number };
}) {
    return (
        <>
            <Head title="Sales" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title="Sales" description="Sales history" />
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Sale #</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Cashier</th>
                                <th className="px-4 py-3 text-right font-medium">Items</th>
                                <th className="px-4 py-3 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.data.map((sale) => (
                                <tr
                                    key={sale.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                                    onClick={() => router.visit(showSale.url(sale.id))}
                                >
                                    <td className="px-4 py-3 font-medium">{sale.sale_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(sale.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{sale.user?.name}</td>
                                    <td className="px-4 py-3 text-right">{sale.items.length}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        ${Number(sale.total).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {sales.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No sales yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {sales.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: sales.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === sales.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    router.get(indexSales.url(), { page }, { preserveState: true })
                                }
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

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Sales', href: indexSales.url() },
    ],
};
