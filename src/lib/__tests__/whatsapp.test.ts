import { describe, expect, it } from 'vitest';
import type { CartCalc, CartItem } from '../../types/menu';
import {
  buildOrderMessage,
  buildReservationMessage,
  buildWhatsAppUrl,
  WA_NUMBER,
  type OrderCustomer,
} from '../whatsapp';

describe('buildOrderMessage', () => {
  const cart: CartItem[] = [
    {
      cartId: 'a', id: 'dragon', name: 'Dragon Roll', price: 135,
      modsTotal: 0, mods: [], notes: '',
      qty: 2, lineTotal: 270, bundle: 'signature',
    },
    {
      cartId: 'b', id: 'california', name: 'California', price: 125,
      modsTotal: 0, mods: [], notes: '',
      qty: 1, lineTotal: 125, bundle: 'clasico',
    },
    {
      cartId: 'c', id: 'phila', name: 'Philadelphia', price: 125,
      modsTotal: 20,
      mods: [
        { id: 'soya', name: 'Salsa extra', price: 0, group: 'salsas' },
        { id: 'qc', name: 'Queso crema', price: 20, group: 'extras' },
      ],
      notes: 'sin cebolla',
      qty: 1, lineTotal: 145, bundle: 'clasico',
    },
  ];
  const customer: OrderCustomer = {
    name: 'Juan Pérez',
    delivery: 'delivery',
    address: 'Calle Falsa 123',
    instructions: 'Tocar timbre 3 veces',
  };
  const calc: CartCalc = {
    subtotal: 540, bundleSaving: 92, total: 448, cPairs: 1, sPairs: 1,
  };

  it('genera la plantilla exacta para delivery con mods + notes', () => {
    const expected = [
      'Hola Temaky! Quiero hacer un pedido 🍣',
      '',
      'Nombre: Juan Pérez',
      'Entrega: Entrega a domicilio',
      'Dirección: Calle Falsa 123',
      '',
      'PEDIDO:',
      '• 2× Dragon Roll — $270',
      '• 1× California — $125',
      '• 1× Philadelphia — $145',
      '  (Salsa extra, Queso crema)',
      '  [Nota: sin cebolla]',
      '',
      'Subtotal: $540',
      'Ahorro por promos: -$92',
      'TOTAL: $448',
      '',
      'Notas del pedido: Tocar timbre 3 veces',
      '',
      '¿Me confirman disponibilidad y tiempo de entrega? Gracias!',
    ].join('\n');
    expect(buildOrderMessage(cart, customer, calc)).toBe(expected);
  });

  it('omite Dirección y Notas del pedido cuando no aplican (pickup)', () => {
    const pickup: OrderCustomer = { name: 'Ana', delivery: 'pickup' };
    const simpleCalc: CartCalc = {
      subtotal: 270, bundleSaving: 0, total: 270, cPairs: 0, sPairs: 0,
    };
    const msg = buildOrderMessage([cart[0]], pickup, simpleCalc);
    expect(msg).not.toContain('Dirección:');
    expect(msg).not.toContain('Ahorro por promos');
    expect(msg).not.toContain('Notas del pedido');
    expect(msg).toContain('Entrega: Recoger en restaurante');
  });
});

describe('buildWhatsAppUrl', () => {
  it('preserva saltos de línea como %0A en el query encoded', () => {
    const text = 'línea 1\nlínea 2\nlínea 3';
    const url = buildWhatsAppUrl(text);
    expect(url.startsWith(`https://wa.me/${WA_NUMBER}?text=`)).toBe(true);
    const encoded = url.split('?text=')[1];
    expect(encoded).toContain('%0A');
    expect((encoded.match(/%0A/g) ?? []).length).toBe(2);
    // Decoder must roundtrip back to the original text.
    expect(decodeURIComponent(encoded)).toBe(text);
  });
});

describe('buildReservationMessage', () => {
  it('incluye fecha, hora, personas y notas opcionales', () => {
    const msg = buildReservationMessage({
      name: 'Laura',
      date: '2026-05-01',
      time: '20:00',
      guests: 4,
      notes: 'cumpleaños',
    });
    expect(msg).toContain('Hola Temaky! Quiero hacer una reservación 🍱');
    expect(msg).toContain('Nombre: Laura');
    expect(msg).toContain('Fecha: 2026-05-01');
    expect(msg).toContain('Hora: 20:00');
    expect(msg).toContain('Personas: 4');
    expect(msg).toContain('Notas: cumpleaños');
  });
});
