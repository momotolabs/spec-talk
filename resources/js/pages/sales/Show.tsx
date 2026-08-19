import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { index as indexSales } from '@/routes/sales';

type SaleItem = {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: { name: string };
};

type Sale = {
    id: number;
    sale_number: string;
    subtotal: number;
    iva_amount: number;
    total: number;
    payment_amount: number;
    change_amount: number;
    created_at: string;
    user: { name: string };
    items: SaleItem[];
};

export default function SalesShow({ sale }: { sale: Sale }) {
    return (
        <>
            <Head title={`Sale ${sale.sale_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title={`Sale ${sale.sale_number}`} description="Sale detail" />
                    <Button variant="outline" asChild>
                        <a href={indexSales.url()}>Back to Sales</a>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border p-6">
                        <h3 className="mb-4 font-semibold">Sale Info</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Sale Number</dt>
                                <dd className="font-medium">{sale.sale_number}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Date</dt>
                                <dd>{new Date(sale.created_at).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Cashier</dt>
                                <dd>{sale.user?.name}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl border p-6">
                        <h3 className="mb-4 font-semibold">Payment</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Subtotal</dt>
                                <dd>${Number(sale.subtotal).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">IVA</dt>
                                <dd>${Number(sale.iva_amount).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                <dt>Total</dt>
                                <dd>${Number(sale.total).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Paid</dt>
                                <dd>${Number(sale.payment_amount).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Change</dt>
                                <dd>${Number(sale.change_amount).toFixed(2)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Product</th>
                                <th className="px-4 py-3 text-right font-medium">Qty</th>
                                <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{item.product?.name}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">
                                        ${Number(item.unit_price).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        ${Number(item.subtotal).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

SalesShow.layout = {
    breadcrumbs: [
        { title: 'Sales', href: indexSales.url() },
    ],
};
