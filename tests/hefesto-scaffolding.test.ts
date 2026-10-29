import { describe, expect, it } from 'vitest';
import {
  getDynamicCases,
  getEcosystemSolutions,
  getKraftdoCase,
  getLegalDocuments,
  getProducts,
  getRubrosCatalog,
} from '../src/lib/hefesto-scaffolding';

describe('Hefesto Scaffolding CMS Client (SSG Build-Time & Fallback)', () => {
  it('loads local fallback products when API is not configured', async () => {
    const products = await getProducts({ apiUrl: '' });
    expect(products.length).toBeGreaterThanOrEqual(2);
    expect(products.map((p) => p.slug)).toContain('ordenia');
    expect(products.map((p) => p.slug)).toContain('public-lead-finder');
  });

  it('merges dynamic products returned by Hefesto Scaffolding API', async () => {
    const mockFetcher = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            slug: 'hefesto-erp-vertical',
            name: 'Hefesto ERP Vertical',
            num: '04',
            tag_es: 'GESTIÓN INTEGRAL',
            tag_en: 'INTEGRATED MANAGEMENT',
            headline_es: 'Operación unificada.',
            headline_en: 'Unified operation.',
            intro_es: 'Módulo dinámico publicado desde Hefesto Scaffolding.',
            intro_en: 'Dynamic module published from Hefesto Scaffolding.',
            audience_es: 'Empresas medianas.',
            audience_en: 'Mid-sized companies.',
            stack: ['Laravel 13', 'Filament 5', 'PostgreSQL'],
            features: [
              ['Control total', 'Full control', 'Sincronización en tiempo real.', 'Real-time sync.'],
            ],
            flow: [
              ['Conecta', 'Connect', 'API lista.', 'API ready.'],
            ],
            limits_es: 'Requiere instancia activa.',
            limits_en: 'Requires active instance.',
            quote: 'erp',
            faq: [],
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const products = await getProducts({
      apiUrl: 'https://panel.hefesto-studio.cl/api/v1',
      apiToken: 'test-token',
      fetcher: mockFetcher,
    });

    const dynamicProduct = products.find((p) => p.slug === 'hefesto-erp-vertical');
    expect(dynamicProduct).toBeDefined();
    expect(dynamicProduct?.source).toBe('scaffolding-api');
    expect(dynamicProduct?.name).toBe('Hefesto ERP Vertical');
    expect(dynamicProduct?.stack).toContain('Filament 5');
  });

  it('merges dynamic ecosystem solutions from Hefesto Scaffolding API', async () => {
    const mockFetcher = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: 'chatwoot',
            name: 'Chatwoot',
            category: 'growth',
            kind_es: 'Atención omnicanal',
            kind_en: 'Omnichannel support',
            title_es: 'Todas tus conversaciones en un lugar.',
            title_en: 'All your conversations in one place.',
            body_es: 'Bandeja compartida conectada con WhatsApp, Instagram y correo.',
            body_en: 'Shared inbox connected with WhatsApp, Instagram and email.',
            url: 'https://www.chatwoot.com/',
            status: 'proposed',
            verified_on: '2026-10-29',
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const solutions = await getEcosystemSolutions({
      apiUrl: 'https://panel.hefesto-studio.cl/api/v1',
      fetcher: mockFetcher,
    });

    expect(solutions.length).toBe(9);
    expect(solutions.some((s) => s.id === 'chatwoot' && s.source === 'scaffolding-api')).toBe(true);
  });

  it('loads all 48 rubros from catalog and KraftDo case study', async () => {
    const rubros = await getRubrosCatalog({ apiUrl: '' });
    expect(rubros.length).toBe(48);

    const kraftdo = await getKraftdoCase({ apiUrl: '' });
    expect(kraftdo.features.length).toBe(12);
    expect(kraftdo.integrations.length).toBe(14);

    const cases = await getDynamicCases({ apiUrl: '' });
    expect(cases.map((c) => c.slug)).toEqual(expect.arrayContaining(['kraftdo', 'ordenia', 'public-lead-finder']));

    const legal = await getLegalDocuments({ apiUrl: '' });
    expect(legal.length).toBe(6);
  });

  it('verifies Astro SSG generated dynamic pages in dist/', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dist = path.resolve(process.cwd(), 'dist');

    // 8 dynamic solution pages with React SolutionConfigurator island
    for (const sol of ['moodle', 'erpnext', 'dolibarr', 'strapi', 'nextcloud', 'openproject', 'mautic', 'keycloak']) {
      const p = path.join(dist, 'soluciones', sol, 'index.html');
      expect(fs.existsSync(p)).toBe(true);
      const html = fs.readFileSync(p, 'utf-8');
      expect(html).toContain('astro-island');
      expect(html).toContain('SolutionConfigurator');
    }

    // 48 dynamic rubric pages with React RubroExplorer island
    const rubros = await getRubrosCatalog({ apiUrl: '' });
    for (const r of rubros) {
      const p = path.join(dist, 'rubros', r.id, 'index.html');
      expect(fs.existsSync(p)).toBe(true);
      const html = fs.readFileSync(p, 'utf-8');
      expect(html).toContain('astro-island');
      expect(html).toContain('RubroExplorer');
    }

    // Dynamic cases & products
    for (const slug of ['kraftdo', 'ordenia', 'public-lead-finder']) {
      expect(fs.existsSync(path.join(dist, 'casos', slug, 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(dist, 'proyectos', slug, 'index.html'))).toBe(true);
    }
  });
});
