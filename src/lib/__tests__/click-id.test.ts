import { beforeEach, describe, expect, it } from 'vitest';
import {
  CLICK_ID_TTL_DAYS,
  appendRef,
  appendRefToWaHref,
  formatRef,
  loadClickId,
  parseClickId,
  saveClickId,
} from '../click-id';

/* 2026-08-12 12:00 Monterrey. */
const AHORA = new Date('2026-08-12T18:00:00.000Z').getTime();
const UN_DIA = 24 * 60 * 60 * 1000;

describe('parseClickId', () => {
  it('lee un gclid del query string', () => {
    expect(parseClickId('?gclid=Cj0KCQjw_abc123')).toEqual({ type: 'gclid', value: 'Cj0KCQjw_abc123' });
  });

  it('lee gbraid y wbraid (campañas de iOS)', () => {
    expect(parseClickId('?gbraid=AbC-dEf')).toEqual({ type: 'gbraid', value: 'AbC-dEf' });
    expect(parseClickId('?wbraid=XyZ_123')).toEqual({ type: 'wbraid', value: 'XyZ_123' });
  });

  it('devuelve null cuando no hay ninguno (tráfico orgánico)', () => {
    expect(parseClickId('')).toBeNull();
    expect(parseClickId('?utm_source=instagram&menu')).toBeNull();
  });

  it('ignora un parámetro presente pero vacío', () => {
    expect(parseClickId('?gclid=')).toBeNull();
    expect(parseClickId('?gclid=%20%20')).toBeNull();
  });

  it('prioriza gclid cuando por error llegan varios: Google exige exactamente uno por fila', () => {
    expect(parseClickId('?wbraid=W1&gclid=G1&gbraid=B1')).toEqual({ type: 'gclid', value: 'G1' });
    expect(parseClickId('?wbraid=W1&gbraid=B1')).toEqual({ type: 'gbraid', value: 'B1' });
  });

  it('convive con otros parámetros y con el param menu', () => {
    expect(parseClickId('?menu&gclid=G1&utm_source=google')).toEqual({ type: 'gclid', value: 'G1' });
  });

  it('descarta valores absurdamente largos o con caracteres fuera del alfabeto de Google', () => {
    expect(parseClickId(`?gclid=${'a'.repeat(600)}`)).toBeNull();
    expect(parseClickId('?gclid=<script>alert(1)</script>')).toBeNull();
  });
});

describe('formatRef', () => {
  it('lleva el tipo, porque el CSV de carga tiene columna distinta para cada uno', () => {
    expect(formatRef({ type: 'gclid', value: 'G1' })).toBe('[ref: gclid:G1]');
    expect(formatRef({ type: 'wbraid', value: 'W1' })).toBe('[ref: wbraid:W1]');
  });

  it('devuelve cadena vacía si no hay click id', () => {
    expect(formatRef(null)).toBe('');
  });
});

describe('appendRef', () => {
  const texto = 'Hola Temaky! Quiero hacer un pedido\nTOTAL: $229';

  it('anexa el ref al final, separado por una línea en blanco', () => {
    expect(appendRef(texto, { type: 'gclid', value: 'G1' })).toBe(`${texto}\n\n[ref: gclid:G1]`);
  });

  it('deja el mensaje intacto cuando no hay click id: el orgánico no se marca', () => {
    expect(appendRef(texto, null)).toBe(texto);
  });

  it('no duplica el ref si ya venía puesto', () => {
    const conRef = appendRef(texto, { type: 'gclid', value: 'G1' });
    expect(appendRef(conRef, { type: 'gclid', value: 'G1' })).toBe(conRef);
  });
});

describe('appendRefToWaHref', () => {
  it('anexa el ref al parámetro text del enlace, ya codificado', () => {
    const href = 'https://wa.me/5218136080040?text=Hola';
    expect(appendRefToWaHref(href, { type: 'gclid', value: 'G1' }))
      .toBe('https://wa.me/5218136080040?text=Hola%0A%0A%5Bref%3A%20gclid%3AG1%5D');
  });

  it('funciona en un enlace sin parámetro text', () => {
    const href = 'https://wa.me/5218136080040';
    expect(appendRefToWaHref(href, { type: 'gclid', value: 'G1' }))
      .toBe('https://wa.me/5218136080040?text=%5Bref%3A%20gclid%3AG1%5D');
  });

  it('deja el href intacto sin click id', () => {
    const href = 'https://wa.me/5218136080040?text=Hola';
    expect(appendRefToWaHref(href, null)).toBe(href);
  });

  it('no duplica el ref si el href ya lo trae', () => {
    const href = 'https://wa.me/5218136080040?text=Hola';
    const una = appendRefToWaHref(href, { type: 'gclid', value: 'G1' });
    expect(appendRefToWaHref(una, { type: 'gclid', value: 'G1' })).toBe(una);
  });

  it('preserva el texto original al decodificar', () => {
    const href = `https://wa.me/5218136080040?text=${encodeURIComponent('Línea 1\nLínea 2')}`;
    const conRef = appendRefToWaHref(href, { type: 'gclid', value: 'G1' });
    const texto = decodeURIComponent(new URL(conRef).searchParams.get('text') ?? '');
    expect(texto).toBe('Línea 1\nLínea 2\n\n[ref: gclid:G1]');
  });
});

/**
 * vitest corre en entorno node, donde no hay localStorage. Se stubbea a mano en vez de instalar
 * jsdom: la superficie que usa click-id.ts son tres métodos.
 */
function stubLocalStorage(): void {
  const datos = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, String(v)),
    removeItem: (k: string) => void datos.delete(k),
    clear: () => datos.clear(),
  };
}

describe('saveClickId / loadClickId', () => {
  beforeEach(() => stubLocalStorage());

  it('guarda y recupera dentro de la ventana', () => {
    saveClickId({ type: 'gclid', value: 'G1' }, AHORA);
    expect(loadClickId(AHORA)).toEqual({ type: 'gclid', value: 'G1' });
    expect(loadClickId(AHORA + 89 * UN_DIA)).toEqual({ type: 'gclid', value: 'G1' });
  });

  it('caduca a los 90 días, que es la ventana de importación offline de Google', () => {
    expect(CLICK_ID_TTL_DAYS).toBe(90);
    saveClickId({ type: 'gclid', value: 'G1' }, AHORA);
    expect(loadClickId(AHORA + 91 * UN_DIA)).toBeNull();
  });

  it('el click id más reciente pisa al anterior', () => {
    saveClickId({ type: 'gclid', value: 'VIEJO' }, AHORA);
    saveClickId({ type: 'gclid', value: 'NUEVO' }, AHORA + UN_DIA);
    expect(loadClickId(AHORA + UN_DIA)).toEqual({ type: 'gclid', value: 'NUEVO' });
  });

  it('devuelve null si no hay nada guardado', () => {
    expect(loadClickId(AHORA)).toBeNull();
  });

  it('no revienta con basura en localStorage', () => {
    localStorage.setItem('temaky-click-id', '{no es json');
    expect(loadClickId(AHORA)).toBeNull();
    localStorage.setItem('temaky-click-id', '{"type":"inventado","value":"X","ts":1}');
    expect(loadClickId(AHORA)).toBeNull();
  });
});
