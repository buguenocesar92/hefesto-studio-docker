<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CaseStudy;
use App\Models\EcosystemSolution;
use App\Models\LegalDocument;
use App\Models\Product;
use App\Models\TemplatePack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ScaffoldingCmsController extends Controller
{
    public function verifyToken(Request $request): void
    {
        $expected = (string) config('services.hefesto_astro.api_token', '');
        if ($expected !== '' && ! hash_equals($expected, (string) $request->bearerToken())) {
            abort(401, 'Unauthorized Hefesto Scaffolding Client');
        }
    }

    /**
     * GET /api/v1/products
     */
    public function products(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $items = Product::query()
            ->where('is_published', true)
            ->orderBy('num')
            ->get()
            ->map(fn (Product $p): array => [
                'slug' => $p->slug,
                'name' => $p->name,
                'num' => $p->num ?? '00',
                'tag' => [$p->tag_es, $p->tag_en],
                'headline' => [$p->headline_es, $p->headline_en],
                'intro' => [$p->intro_es, $p->intro_en],
                'audience' => [$p->audience_es, $p->audience_en],
                'features' => $p->features ?? [],
                'flow' => $p->flow ?? [],
                'limits' => [$p->limits_es, $p->limits_en],
                'stack' => $p->stack ?? [],
                'live' => $p->live_url,
                'quote' => $p->quote_slug ?? $p->slug,
                'faq' => $p->faq ?? [],
            ]);

        return response()->json(['data' => $items]);
    }

    /**
     * GET /api/v1/ecosystem
     */
    public function ecosystem(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $items = EcosystemSolution::query()
            ->where('status', '!=', 'draft')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (EcosystemSolution $s): array => [
                'id' => $s->slug,
                'name' => $s->name,
                'category' => $s->category,
                'kind_es' => $s->kind_es,
                'kind_en' => $s->kind_en,
                'title_es' => $s->title_es,
                'title_en' => $s->title_en,
                'body_es' => $s->body_es,
                'body_en' => $s->body_en,
                'url' => $s->url,
                'status' => $s->status,
                'verified_on' => optional($s->verified_on)->format('Y-m-d') ?? now()->toDateString(),
            ]);

        return response()->json(['data' => $items]);
    }

    /**
     * GET /api/v1/cases
     */
    public function cases(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $items = CaseStudy::query()
            ->where('status', '!=', 'draft')
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (CaseStudy $c): array => [
                'slug' => $c->slug,
                'name' => $c->name,
                'type' => $c->type ?? 'custom_project',
                'status' => $c->status ?? 'published',
                'summary_es' => $c->summary_es,
                'summary_en' => $c->summary_en,
                'stack' => $c->stack ?? [],
                'url' => $c->url,
            ]);

        return response()->json(['data' => $items]);
    }

    /**
     * GET /api/v1/cases/kraftdo
     */
    public function kraftdoCase(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $kraftdo = CaseStudy::query()->where('slug', 'kraftdo')->first();
        if (! $kraftdo) {
            return response()->json(['data' => null], 404);
        }

        return response()->json([
            'data' => [
                'id' => 'kraftdo',
                'client' => $kraftdo->name,
                'stack' => $kraftdo->stack ?? [],
                'features' => $kraftdo->features ?? [],
                'integrations' => $kraftdo->integrations ?? [],
            ],
        ]);
    }

    /**
     * GET /api/v1/templates
     */
    public function templates(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $items = TemplatePack::query()
            ->where('status', 'ready')
            ->orderBy('id')
            ->get()
            ->map(fn (TemplatePack $t): array => [
                'id' => $t->slug,
                'version' => $t->version ?? '1.0.0',
                'name' => $t->name,
                'category' => $t->category,
                'origin' => $t->origin ?? 'scaffolding',
                'status' => $t->status,
                'featured' => (bool) $t->featured,
                'layout' => $t->layout,
                'minimum_plan' => $t->minimum_plan ?? 'starter',
                'tags' => $t->tags ?? [],
                'brand' => $t->brand ?? [
                    'name' => $t->name,
                    'headline' => $t->headline ?? '',
                    'primary' => '#c5a059',
                    'secondary' => '#141413',
                    'logo' => null,
                ],
                'cta' => $t->cta ?? 'Solicitar demo',
                'categories' => $t->categories ?? [],
                'pages' => $t->pages ?? ['Inicio', 'Catálogo', 'Contacto'],
                'modules' => $t->modules ?? [],
                'systems' => $t->systems ?? [],
            ]);

        return response()->json(['data' => $items]);
    }

    /**
     * GET /api/v1/legal
     */
    public function legal(Request $request): JsonResponse
    {
        $this->verifyToken($request);

        $items = LegalDocument::query()
            ->where('is_published', true)
            ->get()
            ->map(fn (LegalDocument $doc): array => [
                'slug' => $doc->slug,
                'title' => $doc->title,
                'html' => $doc->body_html,
                'updated_at' => optional($doc->updated_at)->format('Y-m-d') ?? now()->toDateString(),
            ]);

        return response()->json(['data' => $items]);
    }
}
