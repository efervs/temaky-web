import { trapFocus } from '../../lib/focus-trap';
import { MENU, MODS, findProduct } from '../../data/menu';
import type { Product, SheetSelections } from '../../types/menu';

interface SheetState {
  prod: Product | null;
  qty: number;
  sels: SheetSelections;
  notes: string;
}

const state: SheetState = {
  prod: null,
  qty: 1,
  sels: {},
  notes: '',
};

let lastFocus: HTMLElement | null = null;
let releaseTrap: (() => void) | null = null;

function esc(html: string): string {
  return html.replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string),
  );
}

function calcTotal(): number {
  if (!state.prod) return 0;
  let total = state.prod.price;
  Object.entries(state.sels).forEach(([gid, ids]) => {
    const grp = MODS[gid];
    if (!grp) return;
    ids.forEach(id => {
      const item = grp.items.find(i => i.id === id);
      if (item) total += item.price;
    });
  });
  return total * state.qty;
}

function canAdd(): boolean {
  if (!state.prod) return false;
  return (state.prod.mods ?? []).every(gid => {
    const grp = MODS[gid];
    if (!grp) return true;
    if (!grp.req) return true;
    return (state.sels[gid]?.size ?? 0) > 0;
  });
}

function openSheet(prodId: string) {
  const prod = findProduct(prodId);
  if (!prod) return;
  state.prod = prod;
  state.qty = 1;
  state.sels = {};
  state.notes = '';
  (prod.mods ?? []).forEach(gid => {
    state.sels[gid] = new Set();
  });
  renderSheet();
  const sheet = document.getElementById('psheet');
  const scrim = document.getElementById('psheet-scrim');
  if (sheet && scrim) {
    lastFocus = document.activeElement as HTMLElement | null;
    sheet.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add('open');
      scrim.classList.add('open');
      requestAnimationFrame(() => {
        document.getElementById('psh-close')?.focus();
        releaseTrap?.();
        releaseTrap = trapFocus(sheet);
      });
    });
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeSheet() {
  const sheet = document.getElementById('psheet');
  const scrim = document.getElementById('psheet-scrim');
  if (!sheet || !scrim) return;
  sheet.classList.remove('open');
  scrim.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  releaseTrap?.();
  releaseTrap = null;
  const restoreTo = lastFocus;
  lastFocus = null;
  setTimeout(() => {
    sheet.hidden = true;
    scrim.hidden = true;
    restoreTo?.focus();
  }, 340);
  // only restore scroll if no other overlays open
  const menuOpen = document.getElementById('menu-overlay')?.classList.contains('open');
  const cartOpen = document.getElementById('cart-overlay')?.classList.contains('open');
  if (!menuOpen && !cartOpen) {
    document.body.style.overflow = '';
  }
}

function renderSheet() {
  if (!state.prod) return;
  const p = state.prod;

  const hero = document.getElementById('psh-hero') as HTMLElement;
  hero.innerHTML = `
    <img src="${esc(p.img)}" alt="${esc(p.name)}" />
    <button class="sheet-close" id="psh-close" type="button" aria-label="Cerrar">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  `;

  const head = document.getElementById('psh-head') as HTMLElement;
  head.innerHTML = `
    <div class="sh-head">
      <span class="sh-name">${esc(p.name)}</span>
      <span class="sh-price"><span class="currency">$</span>${p.price}</span>
    </div>
    ${p.deal || p.badge ? `<div class="sh-tags">
      ${p.badge ? `<span class="sh-tag cat">${esc(p.badge)}</span>` : ''}
      ${p.deal ? `<span class="sh-tag promo">Promo ${esc(p.deal)}</span>` : ''}
    </div>` : ''}
    <p class="sh-desc">${esc(p.desc)}</p>
  `;

  const body = document.getElementById('psh-body') as HTMLElement;
  let html = '';
  (p.mods ?? []).forEach(gid => {
    const grp = MODS[gid];
    if (!grp) return;
    const isRadio = grp.type === 'radio';
    const groupRole = isRadio ? 'radiogroup' : 'group';
    const labelId = `mod-lbl-${esc(gid)}`;
    html += `<div class="mod-group">
      <div class="mod-head">
        <span class="mod-label" id="${labelId}">${esc(grp.lbl)}</span>
        <span class="mod-hint">${grp.req ? 'Requerido' : 'Opcional'}</span>
      </div>
      <div class="mod-list" role="${groupRole}" aria-labelledby="${labelId}">`;
    grp.items.forEach(item => {
      const selected = state.sels[gid]?.has(item.id) ?? false;
      const itemRole = isRadio ? 'radio' : 'checkbox';
      html += `<button class="mod-item${selected ? ' sel' : ''}" type="button"
        role="${itemRole}" aria-checked="${selected ? 'true' : 'false'}"
        data-gid="${esc(gid)}" data-item="${esc(item.id)}" data-radio="${isRadio ? '1' : '0'}">
        <span class="mod-box ${isRadio ? 'radio' : 'check'}"><span class="inner"></span></span>
        <span class="mod-name">${esc(item.name)}${item.sub ? ` <span class="mod-sub">· ${esc(item.sub)}</span>` : ''}</span>
        <span class="mod-plus${item.price === 0 ? ' free' : ''}">${item.price > 0 ? `+$${item.price}` : 'Incluido'}</span>
      </button>`;
    });
    html += '</div></div>';
  });
  html += `<div class="mod-group">
    <div class="mod-head"><label class="mod-label" for="psh-notes">Notas especiales</label><span class="mod-hint">Opcional</span></div>
    <textarea class="sh-notes" id="psh-notes" rows="2" placeholder="Ej: Sin alga, extra picante, alergia a…">${esc(state.notes)}</textarea>
  </div>`;
  body.innerHTML = html;

  renderFooter();
}

function renderFooter() {
  const foot = document.getElementById('psh-foot') as HTMLElement;
  const total = calcTotal();
  const enabled = canAdd();
  foot.innerHTML = `
    <div class="qty">
      <button class="qty-btn" id="psh-dec" type="button" aria-label="Disminuir cantidad" ${state.qty <= 1 ? 'disabled' : ''}>−</button>
      <span class="qty-val" aria-hidden="true">${state.qty}</span>
      <button class="qty-btn" id="psh-inc" type="button" aria-label="Aumentar cantidad">+</button>
    </div>
    <button class="add-btn" id="psh-add" type="button" ${enabled ? '' : 'disabled'}>
      <span class="label">Agregar al pedido</span>
      <span class="price"><span class="currency">$</span>${total}</span>
    </button>
  `;
}

function toggleMod(gid: string, itemId: string, isRadio: boolean) {
  if (!state.sels[gid]) state.sels[gid] = new Set();
  if (isRadio) {
    state.sels[gid] = new Set([itemId]);
  } else {
    const set = state.sels[gid];
    if (set.has(itemId)) set.delete(itemId);
    else set.add(itemId);
  }
  renderSheet();
}

function submitSheet() {
  if (!state.prod || !canAdd()) return;
  const notesEl = document.getElementById('psh-notes') as HTMLTextAreaElement | null;
  const notes = notesEl?.value ?? state.notes;
  window.dispatchEvent(new CustomEvent('temaky:add-cart', {
    detail: {
      product: state.prod,
      qty: state.qty,
      sels: state.sels,
      notes,
    },
  }));
  closeSheet();
}

export function initSheet() {
  const sheet = document.getElementById('psheet');
  const scrim = document.getElementById('psheet-scrim');
  if (!sheet || !scrim) return;

  window.addEventListener('temaky:open-sheet', (e: Event) => {
    const detail = (e as CustomEvent<string>).detail;
    if (typeof detail === 'string') openSheet(detail);
  });

  scrim.addEventListener('click', closeSheet);

  sheet.addEventListener('click', e => {
    const target = e.target as HTMLElement;

    if (target.closest('#psh-close')) {
      closeSheet();
      return;
    }

    const modItem = target.closest<HTMLElement>('.mod-item');
    if (modItem) {
      const gid = modItem.dataset.gid ?? '';
      const item = modItem.dataset.item ?? '';
      const isRadio = modItem.dataset.radio === '1';
      toggleMod(gid, item, isRadio);
      return;
    }

    if (target.closest('#psh-dec')) {
      state.qty = Math.max(1, state.qty - 1);
      renderFooter();
      return;
    }
    if (target.closest('#psh-inc')) {
      state.qty += 1;
      renderFooter();
      return;
    }
    if (target.closest('#psh-add')) {
      submitSheet();
    }
  });

  sheet.addEventListener('input', e => {
    const target = e.target as HTMLElement;
    if (target.id === 'psh-notes') {
      state.notes = (target as HTMLTextAreaElement).value;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });
}

// Touch MENU to avoid unused-import TS error under strict settings
void MENU;
