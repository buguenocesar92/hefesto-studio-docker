import React, { useState } from 'react';
import type { RubroPack } from '../../lib/hefesto-scaffolding';

interface Props {
  pack: RubroPack;
}

const PLANS: Record<string, { label: string; systems: string[]; pos: boolean }> = {
  basico: {
    label: 'Plan Básico',
    systems: ['WordPress', 'WooCommerce', 'Odoo ERP Base'],
    pos: false,
  },
  intermedio: {
    label: 'Plan Intermedio',
    systems: ['WordPress', 'WooCommerce', 'Odoo ERP + POS', 'Chatwoot', 'WhatsApp Business'],
    pos: true,
  },
  premium: {
    label: 'Plan Premium / A Medida',
    systems: ['WordPress / Astro SSG', 'WooCommerce', 'Odoo ERP + POS', 'Chatwoot', 'WhatsApp Business', 'Invoice Ninja', 'Hefesto Scaffolding API'],
    pos: true,
  },
};

export default function RubroExplorer({ pack }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>(pack.minimum_plan || 'basico');
  const currentPlan = PLANS[selectedPlan] ?? PLANS.basico;

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      padding: '28px',
      background: 'rgba(18, 19, 24, 0.88)',
      color: '#f4f1ea',
      marginTop: '28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: pack.brand?.primary || '#d4a373' }}>
            SIMULADOR DE ALCANCE POR PLAN · REACT 19
          </span>
          <h3 style={{ margin: '6px 0 0', fontSize: '22px' }}>
            Arquitectura recomendada para {pack.name}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPlan(key)}
              aria-pressed={selectedPlan === key}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: selectedPlan === key ? '1px solid #d4a373' : '1px solid rgba(255,255,255,0.18)',
                background: selectedPlan === key ? '#d4a373' : 'transparent',
                color: selectedPlan === key ? '#111' : '#f4f1ea',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {plan.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontFamily: 'monospace', color: '#d4a373' }}>
            SISTEMAS CONECTADOS ({currentPlan.label})
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', lineHeight: 1.7 }}>
            {currentPlan.systems.map((sys) => (
              <li key={sys}>{sys}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontFamily: 'monospace', color: '#d4a373' }}>
            MÓDULOS DEL RUBRO ({pack.modules?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(pack.modules ?? []).map((m) => (
              <span
                key={m}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <a
          href={`../../plantillas/index.html?pack=${encodeURIComponent(pack.id)}&plan=${encodeURIComponent(selectedPlan)}`}
          style={{
            padding: '12px 20px',
            borderRadius: '999px',
            background: '#d4a373',
            color: '#111',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          Abrir simulador interactivo de {pack.name} ↗
        </a>
        <a
          href={`../../index.html?plantilla=${encodeURIComponent(pack.id)}&plan=${encodeURIComponent(selectedPlan)}#contacto`}
          style={{
            padding: '12px 20px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#f4f1ea',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          Consultar implementación con este plan ↗
        </a>
      </div>
    </div>
  );
}
