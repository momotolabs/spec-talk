<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function editIva(): Response
    {
        $ivaRate = Setting::get('iva_rate');

        return Inertia::render('settings/Iva', [
            'ivaRate' => $ivaRate?->value ?? '0.19',
        ]);
    }

    public function updateIva(Request $request): RedirectResponse
    {
        $request->validate([
            'iva_rate' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        Setting::set('iva_rate', $request->iva_rate);

        return to_route('settings.iva.edit');
    }
}
