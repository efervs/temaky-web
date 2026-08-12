/**
 * Guardia del INSERT de functions/api/registro.ts.
 *
 * Ese INSERT es lo único que hoy mide dinero en producción: si columnas, placeholders y binds se
 * desalinean, D1 rechaza el registro, la venta no se guarda y el evento nunca llega a Meta. El
 * fallo se manifiesta como silencio, no como error visible — nadie se entera hasta que alguien
 * revisa la bitácora semanas después.
 *
 * Contar a mano tres listas de 19 elementos es exactamente el tipo de cosa que sale mal al agregar
 * una columna. Esto lo cuenta por nosotros.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fuente = readFileSync(join(process.cwd(), 'functions/api/registro.ts'), 'utf8');

describe('INSERT INTO ventas', () => {
  const insert = /INSERT INTO ventas\s*\(([\s\S]*?)\)\s*VALUES\s*\(([^)]*)\)/.exec(fuente);
  const bind = /\.bind\(([\s\S]*?)\)\s*\.run\(\)/.exec(fuente);

  it('el INSERT y el .bind() siguen ahí y son parseables', () => {
    expect(insert).not.toBeNull();
    expect(bind).not.toBeNull();
  });

  const columnas = insert![1].split(',').map((c) => c.trim()).filter(Boolean);
  const placeholders = insert![2].split(',').map((p) => p.trim()).filter(Boolean);
  const binds = bind![1]
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && b !== '');

  it('columnas, placeholders y binds cuadran en número', () => {
    expect(placeholders.length).toBe(columnas.length);
    expect(binds.length).toBe(columnas.length);
  });

  it('todos los placeholders son "?"', () => {
    expect(placeholders.every((p) => p === '?')).toBe(true);
  });

  it('conserva las 18 columnas originales y suma gclid', () => {
    expect(columnas).toEqual([
      'event_id', 'created_at', 'event_time', 'nombre', 'telefono', 'colonia', 'calle',
      'ciudad', 'estado', 'cp', 'canal', 'como_llego', 'correo', 'value', 'order_id',
      'notas', 'status', 'enviado_por', 'gclid',
    ]);
  });

  it('el click id no se cuela en el evento que se manda a Meta', () => {
    const evento = /const event = \{[\s\S]*?\n  \};/.exec(fuente);
    expect(evento).not.toBeNull();
    expect(evento![0]).not.toMatch(/gclid|clickId/i);
  });

  it('buildEventId sigue recibiendo los mismos 4 campos: si cambia, se rompe la idempotencia', () => {
    expect(fuente).toContain('buildEventId({ eventTimeUnix: eventTime!, phoneE164, value, orderId: folio })');
  });
});
