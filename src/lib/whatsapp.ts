import type { CartCalc, CartItem } from '../types/menu';
import { isRestaurantOpen } from './hours';

export const WA_NUMBER = '528127474440';

export type DeliveryType = 'pickup' | 'delivery';

export interface OrderCustomer {
  name: string;
  delivery: DeliveryType;
  address?: string;
  instructions?: string;
}

export interface BuildOrderOptions {
  now?: Date;
  isOpen?: boolean;
}

export interface ReservationForm {
  name: string;
  email?: string;
  date: string;
  time: string;
  guests: number | string;
  phone?: string;
  notes?: string;
}

const DELIVERY_LABEL: Record<DeliveryType, string> = {
  pickup: 'Recoger en restaurante',
  delivery: 'Entrega a domicilio',
};

const TZ = 'America/Monterrey';

function fmtHHMM(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('hour')}:${get('minute')}`;
}

function fmtTimestamp(now: Date): string {
  const parts = new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

export function buildOrderMessage(
  cart: CartItem[],
  customer: OrderCustomer,
  calc: CartCalc,
  opts: BuildOrderOptions = {},
): string {
  const now = opts.now ?? new Date();
  const isOpen = opts.isOpen ?? isRestaurantOpen(now);
  const lines: string[] = [];

  if (!isOpen) {
    lines.push(
      `🕐 PEDIDO FUERA DE HORARIO — Recibido a las ${fmtHHMM(now)}. Confirmar a partir de las 12:00.`,
    );
    lines.push('');
  }

  lines.push('Hola Temaky! Quiero hacer un pedido 🍣');
  lines.push('');
  lines.push(`Nombre: ${customer.name}`);
  lines.push(`Entrega: ${DELIVERY_LABEL[customer.delivery]}`);
  if (customer.delivery === 'delivery' && customer.address) {
    lines.push(`Dirección: ${customer.address}`);
    lines.push(`Abrir en Maps: https://maps.google.com/?q=${encodeURIComponent(customer.address)}`);
  }
  lines.push('');
  lines.push('PEDIDO:');
  for (const item of cart) {
    lines.push(`• ${item.qty}× ${item.name} — $${item.lineTotal}`);
    if (item.mods.length > 0) {
      lines.push(`  (${item.mods.map(m => m.name).join(', ')})`);
    }
    if (item.notes) {
      lines.push(`  [Nota: ${item.notes}]`);
    }
  }
  lines.push('');
  lines.push(`Subtotal: $${calc.subtotal}`);
  if (calc.bundleSaving > 0) {
    lines.push(`Ahorro por promos: -$${calc.bundleSaving}`);
  }
  lines.push(`TOTAL: $${calc.total}`);
  lines.push('');
  if (customer.instructions) {
    lines.push(`Notas del pedido: ${customer.instructions}`);
    lines.push('');
  }
  lines.push('¿Me confirman disponibilidad y tiempo de entrega? Gracias!');
  lines.push('');
  lines.push(`_Pedido generado desde temakysushi.mx · ${fmtTimestamp(now)}_`);
  return lines.join('\n');
}

export function buildReservationMessage(form: ReservationForm): string {
  const lines: string[] = [
    'Hola Temaky! Quiero hacer una reservación 🍱',
    '',
    `Nombre: ${form.name}`,
  ];
  if (form.email) lines.push(`Correo: ${form.email}`);
  if (form.phone) lines.push(`WhatsApp: +52 ${form.phone}`);
  lines.push(`Fecha: ${form.date}`);
  lines.push(`Hora: ${form.time}`);
  lines.push(`Personas: ${form.guests}`);
  if (form.notes) {
    lines.push('');
    lines.push(`Notas: ${form.notes}`);
  }
  lines.push('');
  lines.push('¿Me confirman disponibilidad? Gracias!');
  return lines.join('\n');
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(text: string): void {
  window.open(buildWhatsAppUrl(text), '_blank', 'noopener');
}
