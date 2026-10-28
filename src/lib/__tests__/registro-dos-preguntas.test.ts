/**
 * D26 (2026-10-28): «¿Cómo llegó el cliente?» y «¿Es la primera vez que pide el cliente?».
 *
 * Obligatorias en la página; el servidor NO rechaza una compra porque falten (una pestaña vieja
 * abierta en la tablet no debe perder la venta): guarda NULL. Los textos viejos de «cómo llegó»
 * se guardan tal cual llegan.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/registro';
import { normalizaPrimeraVez } from '../primera-vez';

const pagina = readFileSync(join(process.cwd(), 'src/pages/registro-de-compras.astro'), 'utf8');
const servidor = readFileSync(join(process.cwd(), 'functions/api/registro.ts'), 'utf8');

function selectDe(id: string): string {
  const m = new RegExp(`<select[^>]*id="${id}"[^>]*>([\\s\\S]*?)</select>`).exec(pagina);
  expect(m, `falta el select ${id}`).not.toBeNull();
  return m![0];
}

function opciones(select: string): Array<[string, string]> {
  return [...select.matchAll(/<option value="([^"]*)"[^>]*>([^<]*)<\/option>/g)].map((m) => [m[1], m[2].trim()]);
}

describe('página: las dos preguntas', () => {
  it('«¿Cómo llegó el cliente?» es obligatoria, con «Elige…» y las 5 opciones nuevas', () => {
    const s = selectDe('rComo');
    expect(s).toMatch(/<select[^>]*\brequired\b/);
    expect(s).toContain('<option value="" disabled selected>Elige…</option>');
    expect(opciones(s).slice(1)).toEqual([
      ['Meta Ads', 'Meta Ads'],
      ['Google Ads / Maps', 'Google Ads / Maps'],
      ['Página web', 'Página web'],
      ['Recomendación', 'Recomendación'],
      ['No sé', 'No sé'],
    ]);
    expect(pagina).toContain('¿Cómo llegó el cliente?');
  });

  it('«¿Es la primera vez que pide el cliente?» es obligatoria, con «Elige…», si y no', () => {
    const s = selectDe('rPrimeraVez');
    expect(s).toMatch(/<select[^>]*\brequired\b/);
    expect(s).toMatch(/class="f-input f-select"/);
    expect(s).toContain('<option value="" disabled selected>Elige…</option>');
    expect(opciones(s).slice(1)).toEqual([
      ['si', 'Sí, es su primera vez'],
      ['no', 'No, es cliente frecuente'],
    ]);
    expect(pagina).toContain('<label class="f-label" for="rPrimeraVez">¿Es la primera vez que pide el cliente?</label>');
  });

  it('no deja guardar sin ellas y las manda en el envío', () => {
    const req = /const required:[^=]*=\s*\[([\s\S]*?)\];/.exec(pagina);
    expect(req).not.toBeNull();
    expect(req![1]).toMatch(/\bcomo\b/);
    expect(req![1]).toMatch(/\bprimeraVez\b/);
    expect(pagina).toMatch(/comoLlego: como\.value,/);
    expect(pagina).toMatch(/primeraVez: primeraVez\.value,/);
    expect(pagina).toMatch(/primeraVez\.selectedIndex = 0;/);
  });
});

describe('normalizaPrimeraVez', () => {
  it('la clase de acentos va escapada, sin caracteres invisibles en la fuente', () => {
    const fuente = readFileSync(join(process.cwd(), 'src/lib/primera-vez.ts'), 'utf8');
    expect(fuente).toContain('[\\u0300-\\u036f]');
    expect(/[\u0300-\u036f]/.test(fuente)).toBe(false);
  });
  it('acepta si / sí / no y nada más', () => {
    expect(normalizaPrimeraVez('si')).toBe('si');
    expect(normalizaPrimeraVez('Sí')).toBe('si');
    expect(normalizaPrimeraVez(' NO ')).toBe('no');
    expect(normalizaPrimeraVez('')).toBeNull();
    expect(normalizaPrimeraVez(undefined)).toBeNull();
    expect(normalizaPrimeraVez('quizá')).toBeNull();
  });
});

describe('servidor: guarda primera_vez y no rechaza la venta sin las preguntas', () => {
  let binds: unknown[][];
  let sqls: string[];

  function env() {
    return {
      REGISTRO_PIN: '1234',
      META_DATASET_ID: 'dataset',
      META_CAPI_TOKEN: 'x',
      DB: {
        prepare(sql: string) {
          sqls.push(sql);
          const stmt = {
            bind(...values: unknown[]) {
              binds.push(values);
              return stmt;
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            },
          };
          return stmt;
        },
      },
    };
  }

  function fechaReciente(): string {
    // Hora local de Monterrey (UTC-6) de hace 1 hora, en formato datetime-local.
    const d = new Date(Date.now() - 3600_000 - 6 * 3600_000);
    return d.toISOString().slice(0, 16);
  }

  async function registrar(extra: Record<string, unknown>) {
    const body = {
      fechaHora: fechaReciente(),
      nombre: 'Prueba Uno',
      whatsapp: '8100000000',
      canal: 'recoge',
      monto: '250',
      ...extra,
    };
    const request = new Request('https://x/api/registro', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-registro-pin': '1234' },
      body: JSON.stringify(body),
    });
    const res = await onRequestPost({ request, env: env() } as never);
    return (await res.json()) as { ok?: boolean };
  }

  function columnaInsert(nombre: string): unknown {
    const i = sqls.findIndex((s) => s.includes('INSERT INTO ventas'));
    const cols = /INSERT INTO ventas\s*\(([\s\S]*?)\)/.exec(sqls[i])![1].split(',').map((c) => c.trim());
    return binds[i][cols.indexOf(nombre)];
  }

  beforeEach(() => {
    binds = [];
    sqls = [];
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"events_received":1}', { status: 200 })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('con las dos respuestas guarda el texto de cómo llegó y si | no', async () => {
    const r = await registrar({ comoLlego: 'Página web', primeraVez: 'si' });
    expect(r.ok).toBe(true);
    expect(columnaInsert('como_llego')).toBe('Página web');
    expect(columnaInsert('primera_vez')).toBe('si');
  });

  it('una pestaña vieja sin las preguntas guarda la venta con NULL', async () => {
    const r = await registrar({});
    expect(r.ok).toBe(true);
    expect(columnaInsert('como_llego')).toBeNull();
    expect(columnaInsert('primera_vez')).toBeNull();
  });

  it('los textos viejos de cómo llegó se guardan tal cual', async () => {
    for (const viejo of ['Anuncio FB/IG', 'Google / Maps', 'Cliente frecuente', 'Recurrente', 'Google Ads']) {
      binds = [];
      sqls = [];
      const r = await registrar({ comoLlego: viejo });
      expect(r.ok).toBe(true);
      expect(columnaInsert('como_llego')).toBe(viejo);
    }
  });

  it('primera_vez no se manda a Meta', () => {
    const evento = /const event = \{[\s\S]*?\n  \};/.exec(servidor.replace(/\r/g, ''));
    expect(evento).not.toBeNull();
    expect(evento![0]).not.toMatch(/primera/i);
  });
});
