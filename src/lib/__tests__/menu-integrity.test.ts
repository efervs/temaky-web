import { describe, expect, it } from 'vitest';
import { CAT_LBL, MENU, MODS } from '../../data/menu';

describe('integridad del menú', () => {
  it('los ids de producto son únicos', () => {
    const ids = MENU.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo producto tiene precio mayor que 0, nombre y categoría conocida', () => {
    for (const p of MENU) {
      expect(p.price, p.id).toBeGreaterThan(0);
      expect(p.name.trim(), p.id).not.toBe('');
      expect(CAT_LBL[p.cat], p.id).toBeDefined();
    }
  });

  it('todo grupo de opciones que usa un producto existe', () => {
    for (const p of MENU) {
      for (const gid of p.mods ?? []) {
        expect(MODS[gid], `${p.id} → ${gid}`).toBeDefined();
      }
    }
  });

  it('los grupos obligatorios tienen opciones y sin ids repetidos', () => {
    for (const [gid, grp] of Object.entries(MODS)) {
      if (grp.req) expect(grp.items.length, gid).toBeGreaterThan(0);
      const ids = grp.items.map(i => i.id);
      expect(new Set(ids).size, gid).toBe(ids.length);
    }
  });

  it('los grupos de rollo de combos sólo ofrecen rollos del menú', () => {
    const ids = new Set(MENU.map(p => p.id));
    const grupos = Object.keys(MODS).filter(g => /-r\d$|^combo-[cs]-rollo$/.test(g));
    expect(grupos.length).toBeGreaterThan(0);
    for (const gid of grupos) {
      for (const op of MODS[gid].items) expect(ids.has(op.id), `${gid} → ${op.id}`).toBe(true);
    }
  });
});
