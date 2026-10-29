<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class CloudflarePagesRebuilder
{
    private const CACHE_LOCK_KEY = 'hefesto:astro_pages_rebuild:cooldown';

    /**
     * Dispara la reconstrucción de hefesto-studio en Cloudflare Pages (y opcionalmente GitHub)
     * aplicando un debounce en Redis/Cache para no disparar 10 builds si se editan 10 registros seguidos.
     */
    public function trigger(string $reason = 'cms-updated', array $context = [], bool $force = false): bool
    {
        $cooldown = (int) config('services.hefesto_astro.cooldown_seconds', 60);

        if (! $force && $cooldown > 0) {
            $acquired = Cache::add(self::CACHE_LOCK_KEY, [
                'reason' => $reason,
                'triggered_at' => now()->toIso8601String(),
                'context' => $context,
            ], now()->addSeconds($cooldown));

            if (! $acquired) {
                Log::info('[CloudflarePagesRebuilder] Rebuild omitido por debounce activo.', [
                    'reason' => $reason,
                    'context' => $context,
                ]);

                return false;
            }
        }

        $dispatched = false;

        // Opción A (Recomendada): Deploy Hook directo de Cloudflare Pages
        $cfHookUrl = (string) config('services.hefesto_astro.cf_deploy_hook', '');
        if ($cfHookUrl !== '') {
            try {
                $response = Http::timeout(10)
                    ->acceptJson()
                    ->post($cfHookUrl);

                if ($response->successful()) {
                    $dispatched = true;
                    Log::info('[CloudflarePagesRebuilder] Cloudflare Pages Deploy Hook disparado con éxito.', [
                        'reason' => $reason,
                        'context' => $context,
                    ]);
                } else {
                    Log::warning('[CloudflarePagesRebuilder] Respuesta no exitosa de Cloudflare Deploy Hook.', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (Throwable $e) {
                Log::error('[CloudflarePagesRebuilder] Error al invocar Cloudflare Deploy Hook: ' . $e->getMessage());
            }
        }

        // Opción B (Respaldo/Complemento): GitHub repository_dispatch
        $ghToken = (string) config('services.hefesto_astro.github_token', '');
        $ghRepo = (string) config('services.hefesto_astro.github_repo', 'buguenocesar92/hefesto-studio-docker');

        if (! $dispatched && $ghToken !== '' && $ghRepo !== '') {
            try {
                $response = Http::timeout(10)
                    ->withToken($ghToken)
                    ->withHeaders([
                        'Accept' => 'application/vnd.github+json',
                        'X-GitHub-Api-Version' => '2022-11-28',
                    ])
                    ->post("https://api.github.com/repos/{$ghRepo}/dispatches", [
                        'event_type' => 'hefesto-scaffolding-updated',
                        'client_payload' => [
                            'reason' => $reason,
                            'triggered_at' => now()->toIso8601String(),
                            'context' => $context,
                        ],
                    ]);

                if ($response->successful()) {
                    $dispatched = true;
                    Log::info('[CloudflarePagesRebuilder] GitHub repository_dispatch enviado con éxito.', [
                        'repo' => $ghRepo,
                        'reason' => $reason,
                    ]);
                }
            } catch (Throwable $e) {
                Log::error('[CloudflarePagesRebuilder] Error al enviar repository_dispatch a GitHub: ' . $e->getMessage());
            }
        }

        return $dispatched;
    }
}
