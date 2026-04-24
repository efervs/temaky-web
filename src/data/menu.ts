import type { Cat, ModsMap, Product } from '../types/menu';
import { productImages } from './image-map';

const IMG = (slug: string): string =>
  productImages[slug] ?? productImages['default-product-image'];

const GR = {
  entrada: 'linear-gradient(145deg,#0d0a04,#1a1208)',
  combo: 'linear-gradient(145deg,#1a0303,#2d0808)',
  ensalada: 'linear-gradient(145deg,#041208,#0a2010)',
  arroz: 'linear-gradient(145deg,#100e04,#1f1a06)',
  clasico_frio: 'linear-gradient(145deg,#04080f,#091325)',
  clasico_emp: 'linear-gradient(145deg,#100804,#201008)',
  clasico_cap: 'linear-gradient(145deg,#100404,#200808)',
  sig_frio: 'linear-gradient(145deg,#07051a,#100a2d)',
  sig_emp: 'linear-gradient(145deg,#04100c,#0a1f16)',
  sig_cap: 'linear-gradient(145deg,#060815,#0d1230)',
  esp: 'linear-gradient(145deg,#050610,#0a0c20)',
  teppan: 'linear-gradient(145deg,#0d0803,#1f1005)',
  kids: 'linear-gradient(145deg,#0d0604,#1f0c08)',
  alita: 'linear-gradient(145deg,#170404,#2a0808)',
  postre: 'linear-gradient(145deg,#0e0510,#1a0820)',
  bebida: 'linear-gradient(145deg,#04080d,#081218)',
} as const;

export const MENU: Product[] = [
  // ── COMBOS ─────────────────────────────────────────
  { id: 'combo-clasico', cat: 'combos', name: 'Combo Clásico', desc: 'Rollo Clásico a elegir + ½ arroz de pollo ó ½ arroz de verduras. Agrega 2 kushiages por $30 más.', price: 139, badge: 'El más pedido', gr: GR.combo, img: IMG('combo-especial'), mods: ['combo-c-rollo', 'combo-c-arroz', 'combo-addon'] },
  { id: 'combo-signature', cat: 'combos', name: 'Combo Signature', desc: 'Rollo Signature a elegir + ½ arroz a elegir + ½ ensalada de cangrejo ó ½ cangrejo nevado. Agrega 2 kushiages por $30 más.', price: 175, badge: 'Premium', gr: GR.combo, img: IMG('combo-especial'), mods: ['combo-s-rollo', 'combo-s-arroz', 'combo-ensalada', 'combo-addon'] },

  // ── ENTRADAS ───────────────────────────────────────
  { id: 'kushiages', cat: 'entradas', name: '8 Kushiages', desc: 'Brochetas de queso empanizadas.', price: 109, gr: GR.entrada, img: IMG('2-kushiagues') },
  { id: 'brochetas-t', cat: 'entradas', name: 'Brochetas Temaky', desc: '2 camarón + 2 salmón + 2 kushiages con morrón y cebolla. Acompañadas de ½ arroz gohan.', price: 129, gr: GR.entrada, img: IMG('brochetas-temaky') },
  { id: 'brochetas-p', cat: 'entradas', name: '3 Brochetas de Pollo', desc: 'Con morrón y cebolla, acompañadas de ½ arroz gohan.', price: 139, gr: GR.entrada, img: IMG('brochetas-de-pollo-a-la-plancha') },
  { id: 'cangrejo-nev', cat: 'entradas', name: 'Cangrejo Nevado', desc: '2 barras de surimi rellenas de queso Philadelphia, capeadas y bañadas en salsa de anguila con ajonjolí.', price: 115, gr: GR.entrada, img: IMG('cangrejo-nevado') },
  { id: 'yasai', cat: 'entradas', name: 'Yasai Tempura', desc: 'Verduras capeadas. Puedes agregar 5 camarones por $60 más.', price: 99, gr: GR.entrada, img: IMG('yasal-tempura'), mods: ['yasai-addon'] },
  { id: 'ebi-furai', cat: 'entradas', name: '5 Ebi Furai', desc: 'Camarones con queso empanizados.', price: 169, gr: GR.entrada, img: IMG('eby-furay') },
  { id: 'dumplings', cat: 'entradas', name: '6 Dumplings', desc: 'Rellenos de pollo y vegetales, al vapor.', price: 149, gr: GR.entrada, img: IMG('dumplings') },
  { id: 'shitakes', cat: 'entradas', name: '6 Shitakes', desc: 'Champiñones rellenos de queso gouda, pasta Tampico y empanizados.', price: 129, gr: GR.entrada, img: IMG('shitakes') },
  { id: 'rollos-prim', cat: 'entradas', name: '5 Rollos Primavera', desc: 'Mini rollos rellenos de verdura.', price: 129, gr: GR.entrada, img: IMG('rollos-primavera') },
  { id: 'edamames', cat: 'entradas', name: 'Edamames', desc: 'Vainas de soja salteadas con salsa de soya y shishimi.', price: 109, gr: GR.entrada, img: IMG('edamame') },
  { id: 'gyosas', cat: 'entradas', name: '8 Gyosas', desc: 'Empanaditas rellenas de pollo y verduras.', price: 109, gr: GR.entrada, img: IMG('gyosas') },

  // ── ENSALADAS / SUNOMONO ───────────────────────────
  { id: 'suno-camaron', cat: 'ensaladas', name: 'Sunomono de Camarón', desc: 'Ensalada a base de pepino, furikake y vinagreta de la casa con camarón.', price: 135, gr: GR.ensalada, img: IMG('ensalada-de-camaron') },
  { id: 'suno-salmon', cat: 'ensaladas', name: 'Sunomono de Salmón', desc: 'Ensalada a base de pepino, furikake y vinagreta de la casa con salmón.', price: 109, gr: GR.ensalada, img: IMG('ensalada-de-salmon') },
  { id: 'suno-mixto', cat: 'ensaladas', name: 'Sunomono Mixto', desc: 'Ensalada a base de pepino, furikake y vinagreta de la casa. Mixto: camarón, pulpo y cangrejo.', price: 145, gr: GR.ensalada, img: IMG('ensalada-mixta') },
  { id: 'suno-cangrejo', cat: 'ensaladas', name: 'Sunomono de Cangrejo', desc: 'Ensalada a base de pepino, furikake y vinagreta de la casa con cangrejo.', price: 135, gr: GR.ensalada, img: IMG('ensalada-de-cangrejo') },

  // ── ARROCES / GOHAN ────────────────────────────────
  { id: 'a-pollo', cat: 'arroces', name: 'Arroz Frito de Pollo', desc: 'Arroz frito con zanahoria y morrón picados, con pollo.', price: 95, gr: GR.arroz, img: IMG('arroz-pollo') },
  { id: 'a-camaron', cat: 'arroces', name: 'Arroz Frito de Camarón', desc: 'Arroz frito con zanahoria y morrón picados, con camarón.', price: 105, gr: GR.arroz, img: IMG('arroz-camaron') },
  { id: 'a-carne', cat: 'arroces', name: 'Arroz Frito de Carne', desc: 'Arroz frito con zanahoria y morrón picados, con carne de res.', price: 99, gr: GR.arroz, img: IMG('arroz-carne') },
  { id: 'a-temaky', cat: 'arroces', name: 'Arroz Frito Temaky', desc: 'Camarón, salmón y calamar.', price: 115, gr: GR.arroz, img: IMG('arroz-especial') },
  { id: 'a-mixto', cat: 'arroces', name: 'Arroz Frito Mixto', desc: 'Pollo, carne de res y camarón.', price: 119, gr: GR.arroz, img: IMG('arroz-especial') },
  { id: 'a-especial', cat: 'arroces', name: 'Arroz Frito Especial', desc: 'Pollo, carne de res, camarón, germen y champiñones.', price: 149, badge: 'Especial', gr: GR.arroz, img: IMG('arroz-especial') },
  { id: 'a-verduras', cat: 'arroces', name: 'Arroz Frito de Verduras', desc: 'Arroz frito con zanahoria y morrón picados.', price: 89, gr: GR.arroz, img: IMG('arroz-verduras') },
  { id: 'a-vegetariano', cat: 'arroces', name: 'Arroz Frito Vegetariano', desc: 'Con germen y champiñón.', price: 105, gr: GR.arroz, img: IMG('arroz-vegetariano') },
  { id: 'gohan', cat: 'arroces', name: 'Gohan (Arroz al Vapor)', desc: '14 oz de arroz japonés al vapor.', price: 109, gr: GR.arroz, img: IMG('default-product-image') },
  { id: 'unagi-don', cat: 'arroces', name: 'Unagi Don', desc: 'Con anguilla y ajonjolí.', price: 115, gr: GR.arroz, img: IMG('unagi-don') },
  { id: 'gohan-especial', cat: 'arroces', name: 'Gohan Especial', desc: 'Con tampico.', price: 105, gr: GR.arroz, img: IMG('gohan-especial') },

  // ── ROLLOS CLÁSICOS — FRÍOS ───────────────────────
  { id: 'cali-esp', cat: 'clasicos-frios', name: 'California Especial', desc: 'Aguacate, pepino y camarón.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('california'), mods: ['extras-rollo'] },
  { id: 'california', cat: 'clasicos-frios', name: 'California', desc: 'Aguacate, pepino y cangrejo; ajonjolí por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('california'), mods: ['extras-rollo'] },
  { id: 'philadelphia', cat: 'clasicos-frios', name: 'Philadelphia', desc: 'Queso Philadelphia y salmón; ajonjolí por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('philadelphia'), mods: ['extras-rollo'] },
  { id: 'lino', cat: 'clasicos-frios', name: 'Lino', desc: 'Queso Philadelphia y salmón; aguacate por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('lino'), mods: ['extras-rollo'] },
  { id: 'intrepid', cat: 'clasicos-frios', name: 'Intrepid', desc: 'Salmón, cangrejo y aguacate; aguacate y tártara por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'tampico-r', cat: 'clasicos-frios', name: 'Tampico', desc: 'Pasta tampico.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'regional', cat: 'clasicos-frios', name: 'Regional', desc: 'Queso Philadelphia, aguacate y camarón empanizado; tampico por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', badge: 'Fan fav', gr: GR.clasico_frio, img: IMG('regional'), mods: ['extras-rollo'] },
  { id: 'colorado', cat: 'clasicos-frios', name: 'Colorado', desc: 'Cangrejo, queso Philadelphia y aguacate; masago y salmón por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('colorado'), mods: ['extras-rollo'] },
  { id: 'obispado', cat: 'clasicos-frios', name: 'Obispado', desc: 'Camarón, masago, cangrejo y pulpo; queso Philadelphia, aguacate y cangrejo por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('obispado'), mods: ['extras-rollo'] },
  { id: 'garfield', cat: 'clasicos-frios', name: 'Garfield', desc: 'Queso Philadelphia, aguacate, salmón y cangrejo.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('garfield'), mods: ['extras-rollo'] },
  { id: 'popito', cat: 'clasicos-frios', name: 'Popito', desc: 'Arroz frito, queso Philadelphia, aguacate, salmón y chiles toreados.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'kiko', cat: 'clasicos-frios', name: 'Kiko', desc: 'Camarón empanizado y aguacate; masago por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('kiko'), mods: ['extras-rollo'] },
  { id: 'intocable', cat: 'clasicos-frios', name: 'Intocable', desc: 'Aguacate, tampico, tártara, camarón, shishimi y queso Philadelphia; kanikama por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'futomaki', cat: 'clasicos-frios', name: 'Futomaki', desc: 'Aguacate, camarón, cangrejo, salmón, pepino, zanahoria y masago.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'mango-roll', cat: 'clasicos-frios', name: 'Mango Roll', desc: 'Queso Philadelphia, aguacate, camarón y mango-habanero; mango, ajonjolí y salsa de anguila por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', badge: 'Especial', gr: GR.clasico_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },

  // ── ROLLOS CLÁSICOS — EMPANIZADOS ─────────────────
  { id: 'scobby', cat: 'clasicos-emp', name: 'Scobby', desc: 'Arroz frito, queso Philadelphia, aguacate y chile toreados.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('scooby'), mods: ['extras-rollo'] },
  { id: 'greta', cat: 'clasicos-emp', name: 'Greta', desc: 'Arroz frito, queso Philadelphia, aguacate, verduras al vapor, pepino, chamoy y shishimi.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'onix', cat: 'clasicos-emp', name: 'Onix', desc: 'Queso Philadelphia, aguacate y cangrejo.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'rockefeller', cat: 'clasicos-emp', name: 'Rockefeller', desc: 'Queso Philadelphia, aguacate, cangrejo, pepino, chamoy y shishimi.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'medicina', cat: 'clasicos-emp', name: 'Medicina', desc: 'Arroz frito, gouda, morrón y pollo empanizado; salsa de anguila y ajonjolí por fuera.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'zafira', cat: 'clasicos-emp', name: 'Zafira', desc: 'Queso Philadelphia, aguacate, cangrejo y camarón.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'esmeralda', cat: 'clasicos-emp', name: 'Esmeralda', desc: 'Queso Philadelphia, aguacate y chiles toreados.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'tribilin', cat: 'clasicos-emp', name: 'Tribilin', desc: 'Queso Philadelphia, aguacate y salmón empanizado.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('tribilin'), mods: ['extras-rollo'] },
  { id: 'sayonara', cat: 'clasicos-emp', name: 'Sayonara', desc: 'Queso Philadelphia, aguacate, camarón empanizado y chiles toreados.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('sayonara'), mods: ['extras-rollo'] },
  { id: 'leyes', cat: 'clasicos-emp', name: 'Leyes', desc: 'Arroz frito, gouda, aguacate y pollo a la plancha.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('leyes'), mods: ['extras-rollo'] },
  { id: 'cordero', cat: 'clasicos-emp', name: 'Cordero', desc: 'Arroz frito, queso, aguacate, cebollín y carne de res.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },

  // ── ROLLOS CLÁSICOS — CAPEADOS ────────────────────
  { id: 'villarreal', cat: 'clasicos-cap', name: 'Villarreal', desc: 'Arroz frito, queso Philadelphia, aguacate y camarón empanizado.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('villarreal'), mods: ['extras-rollo'] },
  { id: 'zaru', cat: 'clasicos-cap', name: 'Zaru', desc: 'Queso Philadelphia, aguacate, camarón y cangrejo.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('zaru'), mods: ['extras-rollo'] },
  { id: 'vagabundo', cat: 'clasicos-cap', name: 'Vagabundo', desc: 'Arroz frito, queso Philadelphia, aguacate, cangrejo y verduras al vapor.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('vagabundo'), mods: ['extras-rollo'] },
  { id: 'nori-r', cat: 'clasicos-cap', name: 'Nori', desc: 'Queso Philadelphia, aguacate y verduras al vapor.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'ika', cat: 'clasicos-cap', name: 'Ika', desc: 'Queso Philadelphia, brócoli y camarón empanizado.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'pittsburgh', cat: 'clasicos-cap', name: 'Pittsburgh', desc: 'Queso Philadelphia, aguacate y cangrejo.', price: 125, bundle: 'clasico', deal: '2×$199', gr: GR.clasico_cap, img: IMG('default-product-image'), mods: ['extras-rollo'] },

  // ── SIGNATURE ROLLS — FRÍOS ───────────────────────
  { id: 'barry', cat: 'sig-frios', name: 'Barry', desc: 'Queso Philadelphia, aguacate, salmón y camarón; tampico por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('barry'), mods: ['extras-rollo'] },
  { id: 'plasma', cat: 'sig-frios', name: 'Plasma', desc: 'Queso Philadelphia, tampico, shishimi y masago; salmón por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('plasma'), mods: ['extras-rollo'] },
  { id: 'temaky-r', cat: 'sig-frios', name: 'Temaky', desc: 'Queso Philadelphia, aguacate, tampico y anguila; masago por fuera.', price: 135, bundle: 'signature', deal: '2×$229', badge: 'Signature', gr: GR.sig_frio, img: IMG('temaky-masago'), mods: ['extras-rollo'] },
  { id: 'arjona', cat: 'sig-frios', name: 'Arjona', desc: 'Arroz frito, queso Philadelphia, aguacate, cangrejo, salmón, camarón y pulpo.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('arjona'), mods: ['extras-rollo'] },
  { id: 'caricatura', cat: 'sig-frios', name: 'Caricatura', desc: 'Camarón, anguila, tampico y shishimi; masago por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('caricatura'), mods: ['extras-rollo'] },
  { id: 'coronavirus', cat: 'sig-frios', name: 'Coronavirus', desc: 'Tampico, camarón empanizado, chamoy y queso; aguacate y seaweed salad por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('coronavirus'), mods: ['extras-rollo'] },
  { id: 'chepevera', cat: 'sig-frios', name: 'Chepevera', desc: 'Cangrejo, camarón y tártara; queso Philadelphia, anguila, salsa de anguila y ajonjolí por fuera.', price: 135, bundle: 'signature', deal: '2×$229', badge: 'Fan fav', gr: GR.sig_frio, img: IMG('chepevera'), mods: ['extras-rollo'] },
  { id: 'oyster', cat: 'sig-frios', name: 'Oyster Roll', desc: 'Camarón, queso Philadelphia y aguacate; ostión y salsa de ostión por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'tuna-spicy', cat: 'sig-frios', name: 'Tuna Spicy', desc: 'Queso Philadelphia, aguacate y surimi; atún, ajonjolí y salsa especial por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_frio, img: IMG('default-product-image'), mods: ['extras-rollo'] },

  // ── SIGNATURE ROLLS — EMPANIZADOS ─────────────────
  { id: 'cuarzo', cat: 'sig-emp', name: 'Cuarzo', desc: 'Queso Philadelphia, aguacate, cangrejo, camarón, salmón y pulpo.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_emp, img: IMG('cuarzo'), mods: ['extras-rollo'] },
  { id: 'dinamita', cat: 'sig-emp', name: 'Dinamita Roll', desc: 'Arroz frito, queso Philadelphia, gouda, cebollín, aguacate, chiles toreados, salsa mango-habanero, camarón empanizado, pollo y carne de res.', price: 135, bundle: 'signature', deal: '2×$229', badge: 'Especial', gr: GR.sig_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'chili', cat: 'sig-emp', name: 'Chili', desc: 'Aguacate, tampico, camarón, cebollín y shishimi; salmón por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_emp, img: IMG('rollo-chili'), mods: ['extras-rollo'] },
  { id: 'sake', cat: 'sig-emp', name: 'Sake', desc: 'Queso Philadelphia, anguila, camarón y salmón.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_emp, img: IMG('rollo-sake'), mods: ['extras-rollo'] },
  { id: 'houston', cat: 'sig-emp', name: 'Houston', desc: 'Arroz frito, aguacate, anguila y camarón.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'makisu', cat: 'sig-emp', name: 'Makisu', desc: 'Queso Philadelphia y anguila; cangrejo por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_emp, img: IMG('default-product-image'), mods: ['extras-rollo'] },

  // ── SIGNATURE ROLLS — CAPEADOS ────────────────────
  { id: 'sig-cap-1', cat: 'sig-cap', name: 'Dallas', desc: 'Queso Philadelphia, anguila y salmón por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_cap, img: IMG('dallas'), mods: ['extras-rollo'] },
  { id: 'sig-cap-2', cat: 'sig-cap', name: 'Rubi', desc: 'Queso Philadelphia, anguila y salmón por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_cap, img: IMG('default-product-image'), mods: ['extras-rollo'] },
  { id: 'sig-cap-3', cat: 'sig-cap', name: 'Cantinflas', desc: 'Queso Philadelphia, anguila y salmón por fuera.', price: 135, bundle: 'signature', deal: '2×$229', gr: GR.sig_cap, img: IMG('cantinflas'), mods: ['extras-rollo'] },

  // ── ESPECIALIDADES ────────────────────────────────
  { id: 'misoshiru', cat: 'especialidades', name: 'Misoshiru', desc: 'Pasta de soya con cebollín y tofu.', price: 95, gr: GR.esp, img: IMG('sopa-miso') },
  { id: 'miso-esp', cat: 'especialidades', name: 'Miso Especial', desc: 'Con pescado y mariscos.', price: 115, gr: GR.esp, img: IMG('sopa-miso') },
  { id: 'fideos', cat: 'especialidades', name: 'Fideos', desc: 'Fideo japonés con verduras.', price: 105, gr: GR.esp, img: IMG('sopa-de-fideos') },
  { id: 'ramen', cat: 'especialidades', name: 'Ramen', desc: 'Ramen con proteína y verduras. Indícanos tu preferencia en notas.', price: 199, badge: 'Especial', gr: GR.esp, img: IMG('ramen-de-pollo') },

  // ── TEPPANYAKI ────────────────────────────────────
  { id: 'teppan-veg', cat: 'teppanyaki', name: 'Teppanyaki de Verduras', desc: 'Brócoli, coliflor, zanahoria, cebolla, morrón y germen con el sazón de la casa.', price: 159, gr: GR.teppan, img: IMG('teppanyaki-verduras'), mods: ['teppan-extras'] },
  { id: 'teppan-pollo', cat: 'teppanyaki', name: 'Teppanyaki de Pollo', desc: 'Con elote, naruto, aguacate, brócoli, zanahoria, huevo, cebollín, alga Nori y pollo.', price: 189, gr: GR.teppan, img: IMG('default-product-image'), mods: ['teppan-extras'] },
  { id: 'teppan-mixto', cat: 'teppanyaki', name: 'Teppanyaki Mixto', desc: 'Pollo, res y camarón con verduras al sazón de la casa.', price: 245, badge: 'Especial', gr: GR.teppan, img: IMG('teppanyaki-mixto'), mods: ['teppan-extras'] },

  // ── ALITAS ────────────────────────────────────────
  { id: 'alitas', cat: 'alitas', name: 'Alitas (10 piezas)', desc: 'Elige tu sabor: Buffalo, Mango Habanero, BBQ, Teriyaki o Lemon Pepper.', price: 165, gr: GR.alita, img: IMG('alitas'), mods: ['alitas-sabor'] },
  { id: 'boneless', cat: 'alitas', name: 'Boneless', desc: 'Elige tu sabor: Buffalo, Mango Habanero, BBQ, Teriyaki o Lemon Pepper.', price: 165, gr: GR.alita, img: IMG('default-product-image'), mods: ['alitas-sabor'] },

  // ── KIDS ──────────────────────────────────────────
  { id: 'kids-1', cat: 'kids', name: 'Combo Kids 1', desc: '16 nuggets de pollo empanizado + papas a la francesa.', price: 129, gr: GR.kids, img: IMG('default-product-image') },
  { id: 'kids-2', cat: 'kids', name: 'Combo Kids 2', desc: 'Mini rollo de pollo y queso gouda empanizado + 3 kushiages.', price: 129, gr: GR.kids, img: IMG('default-product-image') },

  // ── POSTRES ───────────────────────────────────────
  { id: 'helado-t', cat: 'postres', name: 'Helado Tempura', desc: 'Helado empanizado frito.', price: 99, gr: GR.postre, img: IMG('helado-tempura') },
  { id: 'nieve', cat: 'postres', name: 'Nieve', desc: 'Bola de helado.', price: 49, gr: GR.postre, img: IMG('nieve') },
  { id: 'brownie', cat: 'postres', name: 'Brownie con Nieve', desc: 'Brownie caliente con bola de helado.', price: 99, gr: GR.postre, img: IMG('brownie-con-nieve') },
  { id: 'sandwich-nieve', cat: 'postres', name: 'Sandwich de Nieve', desc: 'Postre frío con galletas y helado.', price: 99, gr: GR.postre, img: IMG('default-product-image') },
  { id: 'carlota', cat: 'postres', name: 'Carlota de Limón', desc: 'Postre frío de galleta y crema de limón.', price: 45, gr: GR.postre, img: IMG('default-product-image') },

  // ── BEBIDAS ───────────────────────────────────────
  { id: 'refresco', cat: 'bebidas', name: 'Refresco', desc: '355 ml.', price: 42, gr: GR.bebida, img: IMG('default-product-image') },
  { id: 'agua-sab', cat: 'bebidas', name: 'Agua de Sabores', desc: '600 ml.', price: 49, gr: GR.bebida, img: IMG('default-product-image') },
  { id: 'agua-bot', cat: 'bebidas', name: 'Botella de Agua', desc: '500 ml.', price: 45, gr: GR.bebida, img: IMG('default-product-image') },
  { id: 'agua-min', cat: 'bebidas', name: 'Agua Mineral', desc: '600 ml.', price: 49, gr: GR.bebida, img: IMG('default-product-image') },
  { id: 'limonada', cat: 'bebidas', name: 'Limonada Natural', desc: '500 ml.', price: 49, gr: GR.bebida, img: IMG('default-product-image') },
  { id: 'limonada-m', cat: 'bebidas', name: 'Limonada Mineral', desc: '500 ml.', price: 59, gr: GR.bebida, img: IMG('default-product-image') },
];

export const MODS: ModsMap = {
  'extras-rollo': {
    lbl: 'Extras opcionales', type: 'check', req: false,
    items: [
      { id: 'capeado', name: 'Capeado', price: 19 },
      { id: 'empanizado', name: 'Empanizado', price: 19 },
      { id: 'sin-alga', name: 'Sin alga', price: 19 },
      { id: 'ph-extra', name: 'Philadelphia extra', price: 19 },
      { id: 'aguacate-extra', name: 'Aguacate extra', price: 19 },
      { id: 'tampico-3', name: '1/3 Tampico', price: 19 },
      { id: 'proteina-extra', name: 'Proteína extra', price: 19 },
    ],
  },
  'combo-c-rollo': { lbl: 'Elige tu Rollo Clásico', type: 'radio', req: true, items: [] },
  'combo-s-rollo': { lbl: 'Elige tu Rollo Signature', type: 'radio', req: true, items: [] },
  'combo-c-arroz': {
    lbl: 'Elige tu arroz', type: 'radio', req: true,
    items: [
      { id: 'a-pollo', name: 'Arroz de Pollo', price: 0 },
      { id: 'a-verduras', name: 'Arroz de Verduras', price: 0 },
    ],
  },
  'combo-s-arroz': {
    lbl: 'Elige tu arroz', type: 'radio', req: true,
    items: [
      { id: 'a-pollo', name: 'Arroz de Pollo', price: 0 },
      { id: 'a-verduras', name: 'Arroz de Verduras', price: 0 },
      { id: 'a-camaron', name: 'Arroz de Camarón', price: 0 },
      { id: 'a-carne', name: 'Arroz de Carne', price: 0 },
      { id: 'a-temaky', name: 'Arroz Temaky', price: 0 },
      { id: 'a-mixto', name: 'Arroz Mixto', price: 0 },
    ],
  },
  'combo-ensalada': {
    lbl: 'Elige tu complemento', type: 'radio', req: true,
    items: [
      { id: 'ens-cangrejo', name: '½ Ensalada de Cangrejo', price: 0 },
      { id: 'cangrejo-nev', name: '½ Cangrejo Nevado', price: 0 },
    ],
  },
  'combo-addon': {
    lbl: 'Agrega al combo', type: 'check', req: false,
    items: [{ id: 'add-kushi', name: '2 Kushiages extra', price: 30 }],
  },
  'yasai-addon': {
    lbl: 'Opcional', type: 'check', req: false,
    items: [{ id: 'add-camarones', name: '5 camarones extra', price: 60 }],
  },
  'alitas-sabor': {
    lbl: 'Elige tu sabor (puedes elegir varios)', type: 'check', req: true,
    items: [
      { id: 'buffalo', name: 'Buffalo', price: 0 },
      { id: 'mango-hab', name: 'Mango Habanero', price: 0 },
      { id: 'bbq', name: 'BBQ', price: 0 },
      { id: 'teriyaki', name: 'Teriyaki', price: 0 },
      { id: 'lemon', name: 'Lemon Pepper', price: 0 },
    ],
  },
  'teppan-extras': {
    lbl: 'Adicionales (+$39 c/u)', type: 'check', req: false,
    items: [
      { id: 'tp-aguacate', name: 'Aguacate', price: 39 },
      { id: 'tp-pollo', name: 'Pollo', price: 39 },
      { id: 'tp-res', name: 'Res', price: 39 },
      { id: 'tp-camaron', name: 'Camarón', price: 39 },
      { id: 'tp-tampico', name: 'Tampico', price: 39 },
    ],
  },
};

// Populate combo rollo options dynamically from MENU
MODS['combo-c-rollo'].items = MENU
  .filter(i => ['clasicos-frios', 'clasicos-emp', 'clasicos-cap'].includes(i.cat))
  .map(i => ({
    id: i.id, name: i.name, price: 0,
    sub: i.cat.replace('clasicos-', '').replace('-', '').toUpperCase(),
  }));

MODS['combo-s-rollo'].items = MENU
  .filter(i => ['sig-frios', 'sig-emp', 'sig-cap'].includes(i.cat))
  .map(i => ({
    id: i.id, name: i.name, price: 0,
    sub: i.cat.replace('sig-', '').replace('-', '').toUpperCase(),
  }));

export const CATS: Cat[] = [
  { id: 'all', lbl: 'Todo' },
  { id: 'combos', lbl: 'Combos ⭐' },
  { id: 'entradas', lbl: 'Entradas' },
  { id: 'ensaladas', lbl: 'Ensaladas' },
  { id: 'clasicos-frios', lbl: 'Clásicos Fríos' },
  { id: 'clasicos-emp', lbl: 'Clásicos Emp.' },
  { id: 'clasicos-cap', lbl: 'Clásicos Cap.' },
  { id: 'sig-frios', lbl: 'Signature Fríos' },
  { id: 'sig-emp', lbl: 'Signature Emp.' },
  { id: 'sig-cap', lbl: 'Signature Cap.' },
  { id: 'arroces', lbl: 'Arroces / Gohan' },
  { id: 'especialidades', lbl: 'Especialidades' },
  { id: 'teppanyaki', lbl: 'Teppanyaki' },
  { id: 'alitas', lbl: 'Alitas & Boneless' },
  { id: 'kids', lbl: 'Kids' },
  { id: 'postres', lbl: 'Postres' },
  { id: 'bebidas', lbl: 'Bebidas' },
];

export const CAT_LBL: Record<string, string> = {
  combos: 'Combos',
  entradas: 'Entradas',
  ensaladas: 'Ensaladas / Sunomono',
  'clasicos-frios': 'Rollos Clásicos — Fríos',
  'clasicos-emp': 'Rollos Clásicos — Empanizados',
  'clasicos-cap': 'Rollos Clásicos — Capeados',
  'sig-frios': 'Signature Rolls — Fríos',
  'sig-emp': 'Signature Rolls — Empanizados',
  'sig-cap': 'Signature Rolls — Capeados',
  arroces: 'Arroces / Gohan / Yakimeshi',
  especialidades: 'Especialidades',
  teppanyaki: 'Teppanyaki',
  alitas: 'Alitas & Boneless',
  kids: 'Menú Kids',
  postres: 'Postres',
  bebidas: 'Bebidas',
};

export const BUNDLE_CATS = [
  'clasicos-frios', 'clasicos-emp', 'clasicos-cap',
  'sig-frios', 'sig-emp', 'sig-cap',
] as const;

export const ORDERED_CATS = CATS.filter(c => c.id !== 'all').map(c => c.id);

export function findProduct(id: string): Product | undefined {
  return MENU.find(p => p.id === id);
}
