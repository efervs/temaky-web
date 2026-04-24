export type Bundle = 'clasico' | 'signature';

export type ModType = 'radio' | 'check';

export interface ModItem {
  id: string;
  name: string;
  price: number;
  sub?: string;
}

export interface ModGroup {
  lbl: string;
  type: ModType;
  req: boolean;
  items: ModItem[];
}

export type ModsMap = Record<string, ModGroup>;

export interface Product {
  id: string;
  cat: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  gr?: string;
  badge?: string;
  bundle?: Bundle;
  deal?: string;
  mods?: string[];
}

export interface Cat {
  id: string;
  lbl: string;
}

export interface CartMod {
  id: string;
  name: string;
  price: number;
  group: string;
}

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  price: number;
  modsTotal: number;
  mods: CartMod[];
  notes: string;
  qty: number;
  lineTotal: number;
  bundle: Bundle | null;
}

export type SheetSelections = Record<string, Set<string>>;

export interface CartCalc {
  subtotal: number;
  bundleSaving: number;
  total: number;
  cPairs: number;
  sPairs: number;
}
