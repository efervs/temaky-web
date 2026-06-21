import { describe, expect, it } from 'vitest';
import {
  buildEventId,
  buildUserData,
  digitsOnly,
  eventTimeFromLocal,
  isWithinCapiWindow,
  normalizeCity,
  normalizeCountry,
  normalizeEmail,
  normalizeName,
  normalizeState,
  normalizeZip,
  phoneVariants,
  sha256Hex,
  splitName,
  toE164,
} from '../capi';

describe('digitsOnly', () => {
  it('quita todo lo que no sea dígito', () => {
    expect(digitsOnly('+52 81 2747-4440')).toBe('528127474440');
    expect(digitsOnly('abc')).toBe('');
  });
});

describe('toE164', () => {
  it('toma los últimos 10 dígitos y antepone 52', () => {
    expect(toE164('81 2747 4440')).toBe('528127474440');
    expect(toE164('8127474440')).toBe('528127474440');
  });
  it('no duplica el código de país si ya viene', () => {
    expect(toE164('528127474440')).toBe('528127474440');
    expect(toE164('+52 81 2747 4440')).toBe('528127474440');
  });
});

describe('phoneVariants', () => {
  it('devuelve E.164 (52+10) y el formato móvil MX (52 1 +10)', () => {
    expect(phoneVariants('81 2747 4440')).toEqual(['528127474440', '5218127474440']);
    expect(phoneVariants('528127474440')).toEqual(['528127474440', '5218127474440']);
  });
  it('devuelve vacío si no hay 10 dígitos', () => {
    expect(phoneVariants('123')).toEqual([]);
  });
});

describe('splitName', () => {
  it('separa nombre y apellido(s)', () => {
    expect(splitName('Juan Pérez García')).toEqual({ fn: 'Juan', ln: 'Pérez García' });
  });
  it('omite ln cuando solo hay un token', () => {
    expect(splitName('Ana')).toEqual({ fn: 'Ana' });
  });
  it('maneja vacío y espacios', () => {
    expect(splitName('   ')).toEqual({ fn: '' });
  });
});

describe('normalización por campo', () => {
  it('email: trim + lowercase', () => {
    expect(normalizeEmail('  Foo@BAR.com ')).toBe('foo@bar.com');
  });
  it('nombre: minúsculas, sin puntuación, conserva acentos', () => {
    expect(normalizeName('Pérez García')).toBe('pérez garcía');
    expect(normalizeName("O'Brien")).toBe('obrien');
  });
  it('ciudad: sin acentos, sin espacios ni puntuación', () => {
    expect(normalizeCity('San Pedro Garza García')).toBe('sanpedrogarzagarcia');
    expect(normalizeCity('Monterrey')).toBe('monterrey');
  });
  it('estado: nuevo león → nuevoleon', () => {
    expect(normalizeState('Nuevo León')).toBe('nuevoleon');
  });
  it('cp: primeros 5 dígitos', () => {
    expect(normalizeZip('64000-1234')).toBe('64000');
    expect(normalizeZip('6400')).toBe('6400');
  });
  it('país: ISO-2 minúsculas', () => {
    expect(normalizeCountry('MX')).toBe('mx');
  });
});

describe('eventTimeFromLocal', () => {
  it('interpreta la hora como Monterrey UTC−6', () => {
    const ts = eventTimeFromLocal('2026-06-19T14:30');
    expect(ts).toBe(Date.UTC(2026, 5, 19, 14, 30) / 1000 + 6 * 3600);
  });
  it('cruza al día siguiente en UTC cuando corresponde', () => {
    const ts = eventTimeFromLocal('2026-06-19T20:00')!;
    // 20:00 en Monterrey (UTC−6) = 02:00 UTC del día siguiente.
    expect(new Date(ts * 1000).toISOString()).toBe('2026-06-20T02:00:00.000Z');
  });
  it('devuelve null para formato inválido', () => {
    expect(eventTimeFromLocal('no-es-fecha')).toBeNull();
  });
});

describe('isWithinCapiWindow', () => {
  const now = 1_750_000_000;
  it('rechaza eventos de más de 7 días', () => {
    expect(isWithinCapiWindow(now - 8 * 24 * 3600, now)).toBe(false);
  });
  it('acepta un evento reciente', () => {
    expect(isWithinCapiWindow(now - 3600, now)).toBe(true);
  });
  it('rechaza un evento muy en el futuro pero tolera pequeño desfase', () => {
    expect(isWithinCapiWindow(now + 3600, now)).toBe(false);
    expect(isWithinCapiWindow(now + 100, now)).toBe(true);
  });
});

describe('buildEventId', () => {
  it('genera id determinístico', () => {
    expect(buildEventId({ eventTimeUnix: 1750100400, phoneE164: '528127474440', value: 139 })).toBe(
      'TMK-1750100400-4440-139',
    );
  });
  it('incluye el folio cuando existe', () => {
    expect(
      buildEventId({ eventTimeUnix: 1750100400, phoneE164: '528127474440', value: 139, orderId: '42' }),
    ).toBe('TMK-1750100400-4440-139-42');
  });
});

describe('sha256Hex', () => {
  it('coincide con el vector conocido', async () => {
    expect(await sha256Hex('test')).toBe(
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    );
  });
});

describe('buildUserData', () => {
  it('hashea, omite vacíos, manda ph en ambos formatos MX y external_id = E.164', async () => {
    const ud = await buildUserData({
      phone: '81 2747 4440',
      name: 'Ana',
      city: 'Monterrey',
      state: 'Nuevo León',
      // sin email, sin zip → deben omitirse
    });
    expect(ud.ph).toHaveLength(2);
    expect(ud.ph?.[0]).toBe(await sha256Hex('528127474440')); // E.164 estándar
    expect(ud.ph?.[1]).toBe(await sha256Hex('5218127474440')); // formato móvil MX con "1"
    expect(ud.external_id?.[0]).toBe(ud.ph?.[0]); // external_id = E.164 estándar
    expect(ud.fn?.[0]).toBe(await sha256Hex('ana'));
    expect(ud.ln).toBeUndefined(); // un solo token
    expect(ud.ct?.[0]).toBe(await sha256Hex('monterrey'));
    expect(ud.st?.[0]).toBe(await sha256Hex('nuevoleon'));
    expect(ud.country?.[0]).toBe(await sha256Hex('mx')); // default MX
    expect(ud.em).toBeUndefined();
    expect(ud.zp).toBeUndefined();
  });
});
