const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface TrapEntry { container: HTMLElement; handler: (e: KeyboardEvent) => void }
const stack: TrapEntry[] = [];

function makeHandler(container: HTMLElement): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const top = stack[stack.length - 1];
    if (!top || top.container !== container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter(el => {
      let n: HTMLElement | null = el;
      while (n && n !== container) {
        if (n.hidden) return false;
        n = n.parentElement;
      }
      return true;
    });
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };
}

export function trapFocus(container: HTMLElement): () => void {
  const handler = makeHandler(container);
  stack.push({ container, handler });
  document.addEventListener('keydown', handler);
  return (): void => {
    document.removeEventListener('keydown', handler);
    const idx = stack.findIndex(t => t.container === container);
    if (idx !== -1) stack.splice(idx, 1);
  };
}
