import { trapFocus } from '../../lib/focus-trap';
import { MODS, findProduct } from '../../data/menu';
import { isRestaurantOpen } from '../../lib/hours';
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  type DeliveryType,
  type OrderCustomer,
} from '../../lib/whatsapp';
import type { CartCalc, CartItem, CartMod, Product, SheetSelections } from '../../types/menu';

const STORAGE_KEY = 'temaky-v6-cart';

let lastFocus: HTMLElement | null = null;
let releaseTrap: (() => void) | null = null;

interface AddDetail {
  product: Product;
  qty: number;
  sels: SheetSelections;
  notes: string;
}

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cart: CartItem[] = [];

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* quota or unavailable, ignore */
  }
}

export function cartCalc(): CartCalc {
  let subtotal = 0;
  cart.forEach(ci => {
    subtotal += ci.lineTotal;
  });
  const clasicoQty = cart.filter(ci => ci.bundle === 'clasico').reduce((s, ci) => s + ci.qty, 0);
  const sigQty = cart.filter(ci => ci.bundle === 'signature').reduce((s, ci) => s + ci.qty, 0);
  const cPairs = Math.floor(clasicoQty / 2);
  const sPairs = Math.floor(sigQty / 2);
  const bundleSaving = cPairs * 51 + sPairs * 41;
  const clasicoQtyOdd = clasicoQty % 2 === 1;
  const sigQtyOdd = sigQty % 2 === 1;
  let hintMessage: string | null = null;
  if (clasicoQty === 1) {
    hintMessage = 'Agrega 1 Clásico más — pagas $199 y ahorras $51';
  } else if (clasicoQty > 1 && clasicoQtyOdd) {
    hintMessage = 'Lleva 1 Clásico más para completar otro par';
  } else if (sigQty === 1) {
    hintMessage = 'Agrega 1 Signature más — pagas $229 y ahorras $41';
  } else if (sigQty > 1 && sigQtyOdd) {
    hintMessage = 'Lleva 1 Signature más para completar otro par';
  }
  return {
    subtotal,
    bundleSaving,
    total: subtotal - bundleSaving,
    cPairs,
    sPairs,
    clasicoQty,
    sigQty,
    clasicoQtyOdd,
    sigQtyOdd,
    hintMessage,
  };
}

const TOP_PICK_IDS: readonly string[] = ['combo-clasico', 'philadelphia', 'arjona'];

const BOLT_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>' +
  '</svg>';

function esc(html: string): string {
  return html.replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string),
  );
}

export function cartAdd(detail: AddDetail) {
  const { product: prod, qty, sels, notes } = detail;
  const mods: CartMod[] = [];
  let modsExtra = 0;
  Object.entries(sels).forEach(([gid, ids]) => {
    const grp = MODS[gid];
    if (!grp) return;
    ids.forEach(id => {
      const item = grp.items.find(i => i.id === id);
      if (!item) return;
      mods.push({ id, name: item.name, price: item.price, group: gid });
      modsExtra += item.price;
    });
  });
  const basePrice = prod.price;
  const lineTotal = (basePrice + modsExtra) * qty;
  const cartId = `${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  cart.push({
    cartId,
    id: prod.id,
    name: prod.name,
    price: basePrice,
    modsTotal: modsExtra,
    mods,
    notes,
    qty,
    lineTotal,
    bundle: prod.bundle ?? null,
  });
  save();
  renderCart();
  updateCartUI();
  flashCartFab();
}

export function cartChangeQty(cartId: string, delta: number) {
  const ci = cart.find(c => c.cartId === cartId);
  if (!ci) return;
  ci.qty = Math.max(0, ci.qty + delta);
  if (ci.qty === 0) {
    cart = cart.filter(c => c.cartId !== cartId);
  } else {
    ci.lineTotal = (ci.price + ci.modsTotal) * ci.qty;
  }
  save();
  renderCart();
  updateCartUI();
}

export function cartRemove(cartId: string) {
  cart = cart.filter(c => c.cartId !== cartId);
  save();
  renderCart();
  updateCartUI();
}

function renderCart() {
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if (!body || !foot) return;

  if (!cart.length) {
    const picks = TOP_PICK_IDS.map(id => findProduct(id)).filter(
      (p): p is NonNullable<ReturnType<typeof findProduct>> => Boolean(p),
    );
    const picksHtml = picks
      .map(
        p => `<button class="ce-pick" type="button" data-pick="${esc(p.id)}" aria-label="Agregar ${esc(p.name)} — $${p.price}">
          <img class="ce-pick-img" src="${esc(p.img)}" alt="" width="80" height="80" loading="lazy" decoding="async" />
          <span class="ce-pick-inf">
            <span class="ce-pick-name">${esc(p.name)}</span>
            <span class="ce-pick-price"><span class="currency">$</span>${p.price}</span>
          </span>
          <span class="ce-pick-add" aria-hidden="true">＋</span>
        </button>`,
      )
      .join('');

    body.innerHTML = `<div class="ce">
      <div class="ce-ico">
        <svg viewBox="0 0 56 56" width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 38 Q28 52 46 38" stroke="#B8102E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <line x1="10" y1="38" x2="46" y2="38" stroke="#B8102E" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="18" y1="8" x2="30" y2="36" stroke="rgba(255,255,255,0.75)" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="26" y1="8" x2="38" y2="36" stroke="rgba(255,255,255,0.75)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="ce-t">Tu pedido esta vacio</div>
      <div class="ce-s">Empieza con los más pedidos:</div>
      <div class="ce-top3" role="list">${picksHtml}</div>
      <button class="ce-btn" type="button" id="ce-open-menu">Ver Menú</button>
    </div>`;
    foot.hidden = true;
    return;
  }

  const calc = cartCalc();

  let html = cart.map(ci => `
    <div class="ci">
      <div class="ci-inf">
        <div class="ci-name">${esc(ci.name)}</div>
        ${ci.mods.length ? `<div class="ci-mods">${ci.mods.map(m => esc(m.name) + (m.price > 0 ? ` +$${m.price}` : '')).join(' · ')}</div>` : ''}
        ${ci.notes ? `<div class="ci-notes">📝 ${esc(ci.notes)}</div>` : ''}
      </div>
      <div class="ci-r">
        <span class="ci-price"><span class="currency">$</span>${ci.lineTotal}</span>
        <div class="ci-ctrl">
          <button class="cib" type="button" data-action="dec" data-id="${esc(ci.cartId)}" aria-label="Disminuir cantidad de ${esc(ci.name)}">−</button>
          <span class="cin" aria-hidden="true">${ci.qty}</span>
          <button class="cib" type="button" data-action="inc" data-id="${esc(ci.cartId)}" aria-label="Aumentar cantidad de ${esc(ci.name)}">+</button>
          <button class="cib del" type="button" data-action="rm" data-id="${esc(ci.cartId)}" aria-label="Eliminar ${esc(ci.name)}">✕</button>
        </div>
      </div>
    </div>`).join('');

  if (calc.cPairs > 0) {
    html += `<div class="bundle-tip">
      <div class="bt-lbl"><span class="bt-ico" aria-hidden="true">${BOLT_SVG}</span>Promo 2×$199 aplicada</div>
      <div class="bt-txt">${calc.cPairs} par${calc.cPairs > 1 ? 'es' : ''} de Rollos Clásicos — <span class="bt-save">ahorro $${calc.cPairs * 51}</span></div>
    </div>`;
  }
  if (calc.sPairs > 0) {
    html += `<div class="bundle-tip">
      <div class="bt-lbl"><span class="bt-ico" aria-hidden="true">${BOLT_SVG}</span>Promo 2×$229 aplicada</div>
      <div class="bt-txt">${calc.sPairs} par${calc.sPairs > 1 ? 'es' : ''} de Signature Rolls — <span class="bt-save">ahorro $${calc.sPairs * 41}</span></div>
    </div>`;
  }
  if (calc.hintMessage) {
    html += `<div class="bundle-hint" role="status">
      <span class="bh-ico" aria-hidden="true">${BOLT_SVG}</span>
      <span class="bh-txt">${esc(calc.hintMessage)}</span>
    </div>`;
  }

  body.innerHTML = html;

  let fhtml = `<div class="cart-lines">
    <div class="cl"><span class="cl-lbl">Subtotal</span><span class="cl-val">$${calc.subtotal}</span></div>`;
  if (calc.bundleSaving > 0) {
    fhtml += `<div class="cl saving"><span class="cl-lbl">Promo aplicada</span><span class="cl-val">−$${calc.bundleSaving}</span></div>`;
  }
  fhtml += `<div class="cl total"><span class="cl-lbl">Total del pedido</span><span class="cl-val">$${calc.total}</span></div>
  </div>
  <button class="cart-wa cart-wa-ok" type="button" id="cart-checkout">
    Enviar pedido
  </button>
  <p class="cart-note">Te abrimos WhatsApp con el pedido listo.</p>`;
  foot.innerHTML = fhtml;
  foot.hidden = false;
}

function updateCartUI() {
  const count = cart.reduce((s, ci) => s + ci.qty, 0);
  const { total } = cartCalc();
  const fab = document.getElementById('cart-fab');
  const fabTotal = document.getElementById('cart-fab-total');
  const fabCount = document.getElementById('cart-fab-count');
  if (fabTotal) fabTotal.textContent = `$${total}`;
  if (fabCount) fabCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  if (fab) fab.classList.toggle('show', count > 0);

  const mini = document.getElementById('cart-mini');
  const miniCount = document.getElementById('cart-mini-count');
  const miniTotal = document.getElementById('cart-mini-total');
  if (mini && miniCount && miniTotal) {
    if (count > 0) {
      mini.hidden = false;
      mini.classList.add('show');
      miniCount.textContent = `${count}`;
      miniTotal.textContent = `$${total}`;
    } else {
      mini.classList.remove('show');
      mini.hidden = true;
    }
  }
}

function flashCartFab() {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  fab.classList.add('pulse');
  setTimeout(() => fab.classList.remove('pulse'), 600);
}

function openCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  lastFocus = document.activeElement as HTMLElement | null;
  overlay.hidden = false;
  overlay.classList.remove('step-2');
  renderCart();
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    document.getElementById('cart-close')?.focus();
    releaseTrap?.();
    releaseTrap = trapFocus(overlay);
  });
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.classList.remove('step-2');
  overlay.setAttribute('aria-hidden', 'true');
  releaseTrap?.();
  releaseTrap = null;
  const restoreTo = lastFocus;
  lastFocus = null;
  setTimeout(() => {
    overlay.hidden = true;
    restoreTo?.focus();
  }, 300);
  const menuOpen = document.getElementById('menu-overlay')?.classList.contains('open');
  const sheetOpen = document.getElementById('psheet')?.classList.contains('open');
  if (!menuOpen && !sheetOpen) {
    document.body.style.overflow = '';
  }
}

function renderCheckoutSummary() {
  const form = document.getElementById('checkout-form') as HTMLFormElement | null;
  const empty = document.getElementById('ck-empty');
  if (!form) return;

  if (!cart.length) {
    form.classList.add('is-empty');
    if (empty) empty.hidden = false;
    return;
  }

  form.classList.remove('is-empty');
  if (empty) empty.hidden = true;

  const calc = cartCalc();
  const count = cart.reduce((s, ci) => s + ci.qty, 0);

  const countEl = document.getElementById('ck-sum-count');
  if (countEl) countEl.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
  const totalEl = document.getElementById('ck-sum-total');
  if (totalEl) totalEl.textContent = `$${calc.total}`;
  const saveWrap = document.getElementById('ck-sum-save');
  const saveVal = document.getElementById('ck-sum-save-val');
  if (saveWrap && saveVal) {
    if (calc.bundleSaving > 0) {
      saveWrap.hidden = false;
      saveVal.textContent = `$${calc.bundleSaving}`;
    } else {
      saveWrap.hidden = true;
    }
  }

  const list = document.getElementById('ck-sum-list');
  if (list) {
    list.innerHTML = cart
      .map(
        ci => `<li class="ck-sum-item">
          <span class="ck-sum-item-name"><span class="ck-sum-item-qty">${ci.qty}×</span>${esc(ci.name)}</span>
          <span class="ck-sum-item-price">$${ci.lineTotal}</span>
        </li>`,
      )
      .join('');
  }
}

function isFormValid(): boolean {
  const nameEl = document.getElementById('ck-name') as HTMLInputElement | null;
  const addrEl = document.getElementById('ck-address') as HTMLTextAreaElement | null;
  const delivery = document.querySelector<HTMLInputElement>('input[name="delivery"]:checked')?.value
    ?? 'pickup';
  const name = nameEl?.value.trim() ?? '';
  const address = addrEl?.value.trim() ?? '';
  if (!cart.length) return false;
  if (!name) return false;
  if (delivery === 'delivery' && !address) return false;
  return true;
}

function updateSubmitState() {
  const btn = document.getElementById('ck-submit') as HTMLButtonElement | null;
  if (!btn) return;
  const valid = isFormValid();
  btn.disabled = !valid;
  btn.setAttribute('aria-disabled', valid ? 'false' : 'true');
}

function updateOffHoursBanner() {
  const banner = document.getElementById('ck-off-banner');
  if (!banner) return;
  banner.hidden = isRestaurantOpen();
}

function goToCheckout() {
  if (!cart.length) return;
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.add('step-2');
  const title = overlay.querySelector('.cart-title');
  if (title) title.textContent = 'Checkout';
  renderCheckoutSummary();
  updateOffHoursBanner();
  updateSubmitState();
  setTimeout(() => {
    document.getElementById('ck-name')?.focus();
  }, 50);
}

function backToCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('step-2');
  const title = overlay.querySelector('.cart-title');
  if (title) title.textContent = 'Tu pedido';
}

function showOrderToast(msg: string) {
  const toast = document.getElementById('order-toast');
  if (!toast) return;
  const txt = toast.querySelector('.order-toast-txt');
  if (txt) txt.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 260);
  }, 3200);
}

function setFieldError(fieldId: string, errKey: string, invalid: boolean) {
  const input = document.getElementById(fieldId) as HTMLElement | null;
  const wrap = input?.closest('.ck-field');
  const err = document.querySelector<HTMLElement>(`[data-err="${errKey}"]`);
  wrap?.classList.toggle('invalid', invalid);
  if (err) err.hidden = !invalid;
  input?.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function clearAllCart() {
  cart = [];
  save();
  renderCart();
  updateCartUI();
}

function submitCheckout(e: Event) {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;

  if (!cart.length) {
    backToCart();
    return;
  }

  const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
  const delivery = (form.querySelector<HTMLInputElement>('input[name="delivery"]:checked')
    ?.value ?? 'pickup') as DeliveryType;
  const address = (form.elements.namedItem('address') as HTMLTextAreaElement).value.trim();
  const instructions = (form.elements.namedItem('instructions') as HTMLTextAreaElement).value.trim();

  const nameBad = !name;
  const addressBad = delivery === 'delivery' && !address;
  setFieldError('ck-name', 'name', nameBad);
  setFieldError('ck-address', 'address', addressBad);
  if (nameBad) {
    document.getElementById('ck-name')?.focus();
    return;
  }
  if (addressBad) {
    document.getElementById('ck-address')?.focus();
    return;
  }

  const customer: OrderCustomer = {
    name,
    delivery,
    ...(delivery === 'delivery' ? { address } : {}),
    ...(instructions ? { instructions } : {}),
  };
  const calc = cartCalc();
  const now = new Date();
  const isOpen = isRestaurantOpen(now);
  const text = buildOrderMessage(cart, customer, calc, { now, isOpen });
  const url = buildWhatsAppUrl(text);

  if (!isOpen) {
    window.dispatchEvent(
      new CustomEvent('offhours:open', { detail: { pendingUrl: url } }),
    );
    return;
  }

  window.open(url, '_blank', 'noopener');
  clearAllCart();
  backToCart();
  closeCart();
  showOrderToast('Pedido enviado, revisa tu WhatsApp');
  form.reset();
  toggleAddressField(false);
}

function toggleAddressField(show: boolean) {
  const wrap = document.getElementById('ck-addr-wrap');
  if (!wrap) return;
  wrap.hidden = !show;
  if (!show) {
    const addr = document.getElementById('ck-address') as HTMLTextAreaElement | null;
    if (addr) addr.value = '';
    setFieldError('ck-address', 'address', false);
  }
}

export function initCart() {
  cart = load();
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;

  updateCartUI();

  window.addEventListener('temaky:add-cart', (e: Event) => {
    const detail = (e as CustomEvent<AddDetail>).detail;
    if (detail && detail.product) cartAdd(detail);
  });

  window.addEventListener('temaky:open-cart', openCart);
  window.addEventListener('temaky:close-cart', closeCart);

  document.getElementById('cart-fab')?.addEventListener('click', openCart);
  document.getElementById('cart-mini')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('temaky:close-menu'));
    openCart();
  });
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-scrim')?.addEventListener('click', closeCart);

  const body = document.getElementById('cart-body');
  body?.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-action]');
    if (btn) {
      const id = btn.dataset.id ?? '';
      const action = btn.dataset.action;
      if (action === 'inc') cartChangeQty(id, 1);
      else if (action === 'dec') cartChangeQty(id, -1);
      else if (action === 'rm') cartRemove(id);
      return;
    }
    if (target.closest('#ce-open-menu')) {
      closeCart();
      window.dispatchEvent(new CustomEvent('temaky:open-menu'));
      return;
    }
    const pick = target.closest<HTMLElement>('[data-pick]');
    if (pick) {
      const id = pick.dataset.pick ?? '';
      if (!id) return;
      closeCart();
      window.dispatchEvent(new CustomEvent('temaky:open-sheet', { detail: id }));
    }
  });

  document.getElementById('cart-foot')?.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (target.closest('#cart-checkout')) goToCheckout();
  });

  document.getElementById('checkout-back')?.addEventListener('click', backToCart);

  const form = document.getElementById('checkout-form') as HTMLFormElement | null;
  form?.addEventListener('submit', submitCheckout);
  form?.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    if (target.name === 'delivery') {
      toggleAddressField(target.value === 'delivery');
    }
    updateSubmitState();
  });
  form?.addEventListener('input', e => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.id === 'ck-name') {
      const filled = target.value.trim().length > 0;
      if (filled) setFieldError('ck-name', 'name', false);
    } else if (target.id === 'ck-address') {
      const filled = (target as HTMLTextAreaElement).value.trim().length > 0;
      if (filled) setFieldError('ck-address', 'address', false);
    }
    updateSubmitState();
  });
  document.getElementById('ck-name')?.addEventListener('blur', () => {
    const el = document.getElementById('ck-name') as HTMLInputElement | null;
    const bad = !el?.value.trim();
    setFieldError('ck-name', 'name', bad);
    updateSubmitState();
  });
  document.getElementById('ck-address')?.addEventListener('blur', () => {
    const delivery = document.querySelector<HTMLInputElement>(
      'input[name="delivery"]:checked',
    )?.value ?? 'pickup';
    if (delivery !== 'delivery') return;
    const el = document.getElementById('ck-address') as HTMLTextAreaElement | null;
    const bad = !el?.value.trim();
    setFieldError('ck-address', 'address', bad);
    updateSubmitState();
  });
  document.getElementById('ck-empty-menu')?.addEventListener('click', () => {
    backToCart();
    closeCart();
    window.dispatchEvent(new CustomEvent('temaky:open-menu'));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) {
      if (overlay.classList.contains('step-2')) backToCart();
      else closeCart();
    }
  });
}
