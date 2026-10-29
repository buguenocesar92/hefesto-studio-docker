import React, { useState } from 'react';
import type { EcosystemSolution } from '../../lib/hefesto-scaffolding';

interface Props {
  solution: EcosystemSolution;
  apiBaseUrl?: string;
}

const DEPLOY_MODES = [
  {
    id: 'coolify',
    labelEs: 'Coolify / VPS Administrado',
    labelEn: 'Coolify / Managed VPS',
    descEs: 'Contenedores aislados con Traefik, TLS automático y respaldos programados.',
    descEn: 'Isolated containers with Traefik, automatic TLS and scheduled backups.',
  },
  {
    id: 'hybrid',
    labelEs: 'Cloudflare Edge + Túnel Zero Trust',
    labelEn: 'Cloudflare Edge + Zero Trust Tunnel',
    descEs: 'Frontend en Cloudflare Pages y backend protegido detrás de Cloudflare Tunnel + Tailscale.',
    descEn: 'Frontend on Cloudflare Pages and backend protected behind Cloudflare Tunnel + Tailscale.',
  },
  {
    id: 'onprem',
    labelEs: 'Infraestructura propia del cliente',
    labelEn: 'Customer-owned infrastructure',
    descEs: 'Despliegue reproducible con Docker Compose y entrega documentada.',
    descEn: 'Reproducible Docker Compose deployment and documented handoff.',
  },
] as const;

const ADDON_MODULES = [
  { id: 'scaffolding', labelEs: 'Conector API Hefesto Scaffolding (Filament)', labelEn: 'Hefesto Scaffolding API Connector (Filament)' },
  { id: 'automation', labelEs: 'Flujos y webhooks con n8n', labelEn: 'Workflows and webhooks with n8n' },
  { id: 'bot', labelEs: 'Asistente de atención conectado', labelEn: 'Connected support assistant' },
  { id: 'rag', labelEs: 'Consulta documental (RAG)', labelEn: 'Document search (RAG)' },
] as const;

export default function SolutionConfigurator({ solution, apiBaseUrl = '' }: Props) {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [deployMode, setDeployMode] = useState<string>('coolify');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['scaffolding']);
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!business.trim() || !email.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);

    const endpoint = apiBaseUrl ? `${apiBaseUrl.replace(/\/+$/, '')}/api/quotes` : '/api/quotes';
    const mappedModules = Array.from(
      new Set([
        solution.category === 'education' ? 'moodle' : 'erp',
        ...selectedAddons.filter((m) => ['automation', 'bot', 'rag'].includes(m)),
      ]),
    );

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: business.trim(),
          email: email.trim(),
          modules: mappedModules,
          goal: `[${solution.name} · ${deployMode}] ${goal.trim() || 'Implementación e integración con Hefesto Scaffolding'}`,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { id?: string };
      setStatusMessage(
        lang === 'es'
          ? `Solicitud registrada en Hefesto API. Referencia: ${data.id ?? 'OK'}`
          : `Request registered in Hefesto API. Reference: ${data.id ?? 'OK'}`,
      );
    } catch {
      const targetUrl = `../../index.html?solucion=${encodeURIComponent(solution.id)}#cotizador`;
      window.location.href = targetUrl;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scaffolding-configurator" style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      padding: '28px',
      background: 'rgba(18, 19, 24, 0.85)',
      color: '#f4f1ea',
      marginTop: '32px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#d4a373', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {lang === 'es' ? 'ARQUITECTURA INTERACTIVA · REACT + ASTRO SSG' : 'INTERACTIVE ARCHITECTURE · REACT + ASTRO SSG'}
          </span>
          <h3 style={{ fontSize: '22px', margin: '6px 0 0' }}>
            {lang === 'es' ? `Configurar implementación de ${solution.name}` : `Configure ${solution.name} implementation`}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setLang('es')}
            aria-pressed={lang === 'es'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: lang === 'es' ? '#d4a373' : 'transparent',
              color: lang === 'es' ? '#111' : '#f4f1ea',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: lang === 'en' ? '#d4a373' : 'transparent',
              color: lang === 'en' ? '#111' : '#f4f1ea',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            EN
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {DEPLOY_MODES.map((m) => {
          const active = deployMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setDeployMode(m.id)}
              style={{
                textAlign: 'left',
                padding: '16px',
                borderRadius: '12px',
                border: active ? '1px solid #d4a373' : '1px solid rgba(255,255,255,0.12)',
                background: active ? 'rgba(212, 163, 115, 0.12)' : 'rgba(255,255,255,0.03)',
                color: '#f4f1ea',
                cursor: 'pointer',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                {lang === 'es' ? m.labelEs : m.labelEn}
              </strong>
              <span style={{ fontSize: '12px', opacity: 0.78, lineHeight: 1.45, display: 'block' }}>
                {lang === 'es' ? m.descEs : m.descEn}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontFamily: 'monospace', marginBottom: '10px', opacity: 0.85 }}>
          {lang === 'es' ? 'CONECTORES DE HEFESTO SCAFFOLDING:' : 'HEFESTO SCAFFOLDING CONNECTORS:'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {ADDON_MODULES.map((addon) => {
            const checked = selectedAddons.includes(addon.id);
            return (
              <label
                key={addon.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: checked ? '1px solid #d4a373' : '1px solid rgba(255,255,255,0.15)',
                  background: checked ? 'rgba(212, 163, 115, 0.16)' : 'transparent',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAddon(addon.id)}
                />
                <span>{lang === 'es' ? addon.labelEs : addon.labelEn}</span>
              </label>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            required
            maxLength={100}
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder={lang === 'es' ? 'Nombre de tu organización' : 'Your organisation name'}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
            }}
          />
          <input
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === 'es' ? 'Correo de contacto' : 'Contact email'}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
            }}
          />
        </div>
        <textarea
          rows={3}
          maxLength={2000}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={
            lang === 'es'
              ? `¿Qué procesos quieres resolver con ${solution.name}?`
              : `What processes do you want to solve with ${solution.name}?`
          }
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(0,0,0,0.35)',
            color: '#fff',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 22px',
              borderRadius: '999px',
              border: 'none',
              background: '#d4a373',
              color: '#111',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {submitting
              ? lang === 'es'
                ? 'Enviando…'
                : 'Sending…'
              : lang === 'es'
                ? `Solicitar alcance para ${solution.name} ↗`
                : `Request scope for ${solution.name} ↗`}
          </button>
          <a
            href={`../../index.html?solucion=${encodeURIComponent(solution.id)}#cotizador`}
            style={{ color: '#d4a373', fontSize: '13px', textDecoration: 'underline' }}
          >
            {lang === 'es' ? 'Abrir en cotizador unificado' : 'Open in unified quote builder'}
          </a>
        </div>
        {statusMessage && (
          <p role="status" style={{ margin: 0, fontSize: '13px', color: '#86efac' }}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
