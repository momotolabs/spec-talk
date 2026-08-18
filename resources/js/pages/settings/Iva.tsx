import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit as editIva, update as updateIva } from '@/routes/settings/iva';

export default function SettingsIva({ ivaRate }: { ivaRate: string }) {
    const { data, setData, put, processing, errors } = useForm({
        iva_rate: ivaRate,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(updateIva.url());
    }

    const rateAsPercent = data.iva_rate ? (parseFloat(data.iva_rate) * 100).toFixed(1) : '0';

    return (
        <>
            <Head title="IVA Settings" />

            <div className="space-y-6">
                <Heading title="IVA Settings" description="Configure the IVA (tax) rate" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2 max-w-sm">
                        <Label htmlFor="iva_rate">IVA Rate</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="iva_rate"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={data.iva_rate}
                                onChange={(e) => setData('iva_rate', e.target.value)}
                                required
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">= {rateAsPercent}%</span>
                        </div>
                        <InputError message={errors.iva_rate} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SettingsIva.layout = {
    breadcrumbs: [
        { title: 'IVA Settings', href: editIva.url() },
    ],
};
