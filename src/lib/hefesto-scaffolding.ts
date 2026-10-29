/**
 * Cliente Headless de Hefesto Scaffolding (Filament / Laravel 13 API)
 *
 * En cada despliegue (build-time SSG en Cloudflare Pages / GitHub Actions),
 * Astro consulta la API de Hefesto Scaffolding usando:
 *   - HEFESTO_API_URL (o FILAMENT_API_URL) -> p. ej. https://panel.hefesto-studio.cl/api/v1
 *   - HEFESTO_API_TOKEN (o FILAMENT_API_TOKEN) -> Token Bearer exclusivo de servidor
 *
 * Si la API no está configurada o no responde durante el build, aplica fallback
 * automático a los documentos JSON versionados en `content/` y `modules/plantillas/dist/catalog.json`.
 *
 * En cliente (runtime), expone ayudantes para enviar solicitudes de cotización
 * y consultas al asistente contra `PUBLIC_HEFESTO_API_URL` (o rutas relativas `/api/*`).
 */
import fs from 'node:fs';
import path from 'node:path';

export type BilingualPair = [string, string];
export type BilingualFeatureTuple = [string, string, string, string];

export interface ProductRecord {
  slug: string;
  name: string;
  num: string;
  tag: BilingualPair;
  headline: BilingualPair;
  intro: BilingualPair;
  audience: BilingualPair;
  features: BilingualFeatureTuple[];
  flow: BilingualFeatureTuple[];
  limits: BilingualPair;
  stack: string[];
  live: string | null;
  quote: string;
  faq: BilingualFeatureTuple[];
  source: 'scaffolding-api' | 'local';
}

export interface EcosystemSolution {
  id: string;
  name: string;
  category: 'education' | 'business' | 'content' | 'team' | 'growth' | string;
  kind_es: string;
  kind_en: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  url: string;
  status: string;
  verified_on: string;
  source?: 'scaffolding-api' | 'local';
}

export interface KraftdoFeature {
  id: string;
  category: 'experience' | 'business' | 'operations' | string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
}

export interface KraftdoIntegration {
  id: string;
  name: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  status_es: string;
  status_en: string;
}

export interface KraftdoCaseData {
  schema_version: number;
  id: string;
  client: string;
  featured: boolean;
  first_client: boolean;
  first_custom_project: boolean;
  urls: {
    website: string;
    platform: string;
    instagram: string;
  };
  stack: string[];
  features: KraftdoFeature[];
  integrations: KraftdoIntegration[];
  source: 'scaffolding-api' | 'local';
}

export interface RubroPack {
  id: string;
  version: string;
  name: string;
  category: string;
  origin: string;
  status: string;
  featured: boolean;
  layout: string;
  minimum_plan: string;
  tags: string[];
  brand: {
    name: string;
    headline: string;
    primary: string;
    secondary: string;
    logo: string | null;
  };
  cta: string;
  categories: string[];
  pages: string[];
  modules: string[];
  systems: string[];
  source?: 'scaffolding-api' | 'local';
}

export interface LegalDocument {
  slug: string;
  title: string;
  html: string;
  updatedAt: string;
  source: 'scaffolding-api' | 'local';
}

export interface DynamicCaseSummary {
  slug: string;
  name: string;
  type: 'custom_project' | 'own_project' | 'product';
  status: string;
  summary_es: string;
  summary_en: string;
  stack: string[];
  url: string | null;
  detailHref: string;
  source: 'scaffolding-api' | 'local';
}

export interface ScaffoldingRuntimeConfig {
  apiUrl?: string;
  apiToken?: string;
  fetcher?: typeof fetch;
}

function resolveEnv(config?: ScaffoldingRuntimeConfig): { baseUrl: string | null; token: string | null } {
  const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env) || {};
  const procEnv = typeof process !== 'undefined' ? process.env : {};

  const rawUrl =
    config?.apiUrl ??
    metaEnv.HEFESTO_API_URL ??
    metaEnv.FILAMENT_API_URL ??
    procEnv.HEFESTO_API_URL ??
    procEnv.FILAMENT_API_URL ??
    '';

  const rawToken =
    config?.apiToken ??
    metaEnv.HEFESTO_API_TOKEN ??
    metaEnv.FILAMENT_API_TOKEN ??
    procEnv.HEFESTO_API_TOKEN ??
    procEnv.FILAMENT_API_TOKEN ??
    '';

  const cleanedUrl = rawUrl.trim().replace(/\/+$/, '');
  return {
    baseUrl: cleanedUrl ? cleanedUrl : null,
    token: rawToken.trim() ? rawToken.trim() : null,
  };
}

function buildEndpointUrl(baseUrl: string, resourcePath: string): string {
  const cleanResource = resourcePath.replace(/^\/+/, '');
  if (baseUrl.endsWith(`/${cleanResource}`)) {
    return baseUrl;
  }
  if (/\/api(\/v\d+)?$/.test(baseUrl)) {
    return `${baseUrl}/${cleanResource}`;
  }
  return `${baseUrl}/api/v1/${cleanResource}`;
}

export async function fetchScaffoldingResource<T>(
  resourcePath: string,
  config?: ScaffoldingRuntimeConfig,
): Promise<T[] | T | null> {
  const { baseUrl, token } = resolveEnv(config);
  if (!baseUrl) return null;

  const fetcher = config?.fetcher ?? fetch;
  const endpoint = buildEndpointUrl(baseUrl, resourcePath);

  try {
    const res = await fetcher(endpoint, {
      headers: {
        Accept: 'application/json',
        'X-Hefesto-Client': 'astro-ssg/2.0',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} en ${endpoint}`);
    }

    const payload = (await res.json()) as unknown;
    if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
      return (payload as { data: T[] | T }).data;
    }
    return payload as T[] | T;
  } catch (err) {
    console.warn(`[hefesto-scaffolding] Fallback local para "${resourcePath}": ${(err as Error).message}`);
    return null;
  }
}

function readJsonFile<T>(relPath: string): T {
  const fullPath = path.resolve(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
}

function normalizePair(val: unknown, fallbackEs = '', fallbackEn = ''): BilingualPair {
  if (Array.isArray(val) && val.length >= 2) {
    return [String(val[0] ?? fallbackEs), String(val[1] ?? fallbackEn)];
  }
  return [fallbackEs, fallbackEn];
}

function normalizeTupleList(val: unknown): BilingualFeatureTuple[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((item): BilingualFeatureTuple | null => {
      if (Array.isArray(item) && item.length >= 4) {
        return [String(item[0]), String(item[1]), String(item[2]), String(item[3])];
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return [
          String(obj.title_es ?? obj.question_es ?? ''),
          String(obj.title_en ?? obj.question_en ?? ''),
          String(obj.body_es ?? obj.answer_es ?? ''),
          String(obj.body_en ?? obj.answer_en ?? ''),
        ];
      }
      return null;
    })
    .filter((t): t is BilingualFeatureTuple => t !== null && Boolean(t[0]));
}

export function normalizeProductRecord(slug: string, raw: Record<string, unknown>, source: 'scaffolding-api' | 'local'): ProductRecord | null {
  const cleanSlug = String(raw.slug ?? slug).trim();
  const name = String(raw.name ?? '').trim();
  if (!cleanSlug || !name) return null;

  const tag = normalizePair(
    raw.tag,
    String(raw.tag_es ?? 'PRODUCTO HEFESTO'),
    String(raw.tag_en ?? 'HEFESTO PRODUCT'),
  );
  const headline = normalizePair(
    raw.headline,
    String(raw.headline_es ?? name),
    String(raw.headline_en ?? name),
  );
  const intro = normalizePair(
    raw.intro,
    String(raw.intro_es ?? ''),
    String(raw.intro_en ?? ''),
  );
  const audience = normalizePair(
    raw.audience,
    String(raw.audience_es ?? ''),
    String(raw.audience_en ?? ''),
  );
  const limits = normalizePair(
    raw.limits,
    String(raw.limits_es ?? ''),
    String(raw.limits_en ?? ''),
  );

  return {
    slug: cleanSlug,
    name,
    num: String(raw.num ?? '00'),
    tag,
    headline,
    intro,
    audience,
    features: normalizeTupleList(raw.features),
    flow: normalizeTupleList(raw.flow),
    limits,
    stack: Array.isArray(raw.stack) ? raw.stack.map(String) : [],
    live: typeof raw.live === 'string' && raw.live.trim() ? raw.live.trim() : null,
    quote: String(raw.quote ?? cleanSlug),
    faq: normalizeTupleList(raw.faq),
    source,
  };
}

export async function getProducts(config?: ScaffoldingRuntimeConfig): Promise<ProductRecord[]> {
  const localMap = readJsonFile<Record<string, Record<string, unknown>>>('content/products.json');
  const localProducts = Object.entries(localMap)
    .map(([slug, data]) => normalizeProductRecord(slug, data, 'local'))
    .filter((p): p is ProductRecord => p !== null);

  const remote = await fetchScaffoldingResource<unknown>('products', config);
  if (!remote) return localProducts;

  const remoteList: ProductRecord[] = [];
  if (Array.isArray(remote)) {
    for (const item of remote) {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const norm = normalizeProductRecord(String(obj.slug ?? obj.id ?? ''), obj, 'scaffolding-api');
        if (norm) remoteList.push(norm);
      }
    }
  } else if (typeof remote === 'object') {
    for (const [slug, data] of Object.entries(remote as Record<string, unknown>)) {
      if (data && typeof data === 'object') {
        const norm = normalizeProductRecord(slug, data as Record<string, unknown>, 'scaffolding-api');
        if (norm) remoteList.push(norm);
      }
    }
  }

  if (remoteList.length === 0) return localProducts;

  // Merge: remote overrides local by slug, while keeping local products if not present in remote partial list
  const merged = new Map<string, ProductRecord>();
  for (const p of localProducts) merged.set(p.slug, p);
  for (const p of remoteList) merged.set(p.slug, p);
  return Array.from(merged.values());
}

export async function getEcosystemSolutions(config?: ScaffoldingRuntimeConfig): Promise<EcosystemSolution[]> {
  const localItems = readJsonFile<EcosystemSolution[]>('content/ecosystem.json').map((item) => ({
    ...item,
    source: 'local' as const,
  }));

  const remote = await fetchScaffoldingResource<unknown>('ecosystem', config);
  if (!Array.isArray(remote) || remote.length === 0) {
    return localItems;
  }

  const normalizedRemote = remote
    .map((raw): EcosystemSolution | null => {
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      const id = String(r.id ?? r.slug ?? '').trim();
      const name = String(r.name ?? '').trim();
      if (!id || !name) return null;
      return {
        id,
        name,
        category: String(r.category ?? 'business'),
        kind_es: String(r.kind_es ?? 'Solución'),
        kind_en: String(r.kind_en ?? 'Solution'),
        title_es: String(r.title_es ?? name),
        title_en: String(r.title_en ?? name),
        body_es: String(r.body_es ?? ''),
        body_en: String(r.body_en ?? ''),
        url: String(r.url ?? 'https://hefesto-studio.cl'),
        status: String(r.status ?? 'proposed'),
        verified_on: String(r.verified_on ?? new Date().toISOString().slice(0, 10)),
        source: 'scaffolding-api',
      };
    })
    .filter((i): i is EcosystemSolution => i !== null);

  if (normalizedRemote.length === 0) return localItems;

  const merged = new Map<string, EcosystemSolution>();
  for (const item of localItems) merged.set(item.id, item);
  for (const item of normalizedRemote) merged.set(item.id, item);
  return Array.from(merged.values());
}

export async function getKraftdoCase(config?: ScaffoldingRuntimeConfig): Promise<KraftdoCaseData> {
  const localData = readJsonFile<Omit<KraftdoCaseData, 'source'>>('content/kraftdo.json');
  const fallback: KraftdoCaseData = { ...localData, source: 'local' };

  const remote = await fetchScaffoldingResource<Record<string, unknown>>('cases/kraftdo', config);
  if (!remote || Array.isArray(remote) || typeof remote !== 'object') {
    return fallback;
  }

  const features = Array.isArray(remote.features) && remote.features.length > 0
    ? (remote.features as KraftdoFeature[])
    : fallback.features;
  const integrations = Array.isArray(remote.integrations) && remote.integrations.length > 0
    ? (remote.integrations as KraftdoIntegration[])
    : fallback.integrations;

  return {
    ...fallback,
    stack: Array.isArray(remote.stack) ? remote.stack.map(String) : fallback.stack,
    features,
    integrations,
    source: 'scaffolding-api',
  };
}

export async function getDynamicCases(config?: ScaffoldingRuntimeConfig): Promise<DynamicCaseSummary[]> {
  const kraftdo = await getKraftdoCase(config);
  const products = await getProducts(config);

  const baseCases: DynamicCaseSummary[] = [
    {
      slug: 'kraftdo',
      name: kraftdo.client,
      type: 'custom_project',
      status: 'featured_case_study',
      summary_es: 'Sitio de marca, perfiles NFC/QR, regalos digitales, pedidos, gestión interna y automatizaciones.',
      summary_en: 'Brand website, NFC/QR profiles, digital gifts, orders, internal operations and automation.',
      stack: kraftdo.stack,
      url: kraftdo.urls.website,
      detailHref: '/proyectos/kraftdo/',
      source: kraftdo.source,
    },
    ...products.map((p) => ({
      slug: p.slug,
      name: p.name,
      type: (p.slug === 'ordenia' ? 'own_project' : 'product') as 'own_project' | 'product',
      status: p.live ? 'live_preview' : 'implemented',
      summary_es: p.intro[0],
      summary_en: p.intro[1],
      stack: p.stack,
      url: p.live,
      detailHref: `/proyectos/${p.slug}/`,
      source: p.source,
    })),
  ];

  const remote = await fetchScaffoldingResource<unknown>('cases', config);
  if (!Array.isArray(remote) || remote.length === 0) {
    return baseCases;
  }

  const merged = new Map<string, DynamicCaseSummary>();
  for (const c of baseCases) merged.set(c.slug, c);

  for (const raw of remote) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const slug = String(r.slug ?? r.id ?? '').trim();
    const name = String(r.name ?? r.title ?? '').trim();
    if (!slug || !name) continue;
    merged.set(slug, {
      slug,
      name,
      type: (r.type as DynamicCaseSummary['type']) ?? 'custom_project',
      status: String(r.status ?? 'published'),
      summary_es: String(r.summary_es ?? r.summary ?? ''),
      summary_en: String(r.summary_en ?? r.summary ?? ''),
      stack: Array.isArray(r.stack) ? r.stack.map(String) : [],
      url: typeof r.url === 'string' ? r.url : null,
      detailHref: slug === 'kraftdo' ? '/proyectos/kraftdo/' : `/casos/${slug}/`,
      source: 'scaffolding-api',
    });
  }

  return Array.from(merged.values());
}

export async function getRubrosCatalog(config?: ScaffoldingRuntimeConfig): Promise<RubroPack[]> {
  const rawCatalog = readJsonFile<{ packs: RubroPack[] }>('modules/plantillas/dist/catalog.json');
  const localPacks = (rawCatalog.packs ?? []).map((p) => ({
    ...p,
    source: 'local' as const,
  }));

  const remote = await fetchScaffoldingResource<unknown>('templates', config);
  if (!Array.isArray(remote) || remote.length === 0) {
    return localPacks;
  }

  const merged = new Map<string, RubroPack>();
  for (const p of localPacks) merged.set(p.id, p);
  for (const item of remote) {
    if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
      const pack = item as RubroPack;
      merged.set(pack.id, { ...pack, source: 'scaffolding-api' });
    }
  }
  return Array.from(merged.values());
}

export async function getLegalDocuments(config?: ScaffoldingRuntimeConfig): Promise<LegalDocument[]> {
  const slugs = ['aviso-legal', 'privacidad', 'cookies', 'terminos', 'accesibilidad', 'proteccion-datos'];
  const localDocs: LegalDocument[] = slugs.map((slug) => {
    const filePath = path.resolve(process.cwd(), `src/data/legal/${slug}.html`);
    const html = fs.readFileSync(filePath, 'utf-8');
    return {
      slug,
      title: slug.replace(/-/g, ' '),
      html,
      updatedAt: '2026-10-09',
      source: 'local',
    };
  });

  const remote = await fetchScaffoldingResource<unknown>('legal', config);
  if (!Array.isArray(remote) || remote.length === 0) {
    return localDocs;
  }

  const merged = new Map<string, LegalDocument>();
  for (const doc of localDocs) merged.set(doc.slug, doc);
  for (const item of remote) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const slug = String(r.slug ?? '').trim();
    const html = String(r.html ?? r.body_html ?? '').trim();
    // Statutory pages keep their verified legal snapshot unless a new slug is added
    if (slug && html && !merged.has(slug)) {
      merged.set(slug, {
        slug,
        title: String(r.title ?? slug),
        html,
        updatedAt: String(r.updated_at ?? new Date().toISOString().slice(0, 10)),
        source: 'scaffolding-api',
      });
    }
  }

  return Array.from(merged.values());
}
