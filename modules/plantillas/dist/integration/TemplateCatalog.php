<?php
declare(strict_types=1);

/** Pure selection service. Caller must authorize tenant and supply server-verified plan. */
final class TemplateCatalog
{
    private array $catalog;
    public function __construct(string $catalogPath)
    {
        $this->catalog = json_decode(file_get_contents($catalogPath), true, 512, JSON_THROW_ON_ERROR);
    }
    public function resolve(string $packId, string $verifiedPlan, string $style, array $brand = []): array
    {
        $plan = $this->catalog['plans'][$verifiedPlan] ?? null;
        if (!$plan || !in_array($style, array_column($this->catalog['styles'], 'id'), true)) {
            throw new InvalidArgumentException('Plan o estilo no válido.');
        }
        $packs = array_column($this->catalog['packs'], null, 'id');
        $pack = $packs[$packId] ?? null;
        if (!$pack) { throw new InvalidArgumentException('Pack desconocido.'); }
        $clean = [];
        foreach (['name' => 80, 'headline' => 160] as $key => $limit) {
            $value = $brand[$key] ?? $pack['brand'][$key];
            if (!is_string($value)) { throw new InvalidArgumentException('Marca inválida.'); }
            $value = trim(strip_tags($value));
            $clean[$key] = function_exists('mb_substr') ? mb_substr($value, 0, $limit) : substr($value, 0, $limit);
            if ($clean[$key] === '') { $clean[$key] = $pack['brand'][$key]; }
        }
        $color = $brand['primary'] ?? $pack['brand']['primary'];
        $clean['primary'] = is_string($color) && preg_match('/^#[0-9a-f]{6}$/i', $color) ? $color : $pack['brand']['primary'];
        return [
            'schema_version' => $this->catalog['schema_version'],
            'pack_id' => $pack['id'], 'pack_version' => $pack['version'],
            'style_id' => $style, 'plan' => $verifiedPlan, 'brand' => $clean,
            'origin' => 'owner', 'status' => 'draft', 'requires_owner_review' => true,
            'runtime_ai' => false,
            'systems' => array_intersect_key($pack['systems'], array_flip($plan['systems'])),
            'pos_enabled' => $plan['pos'] && in_array('pos', $pack['modules'], true),
            'deployment' => ['applied' => false, 'requires_adapter' => true, 'requires_backup' => true],
            'requirements' => $pack['requirements'],
        ];
    }
}
