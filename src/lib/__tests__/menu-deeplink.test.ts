import { describe, expect, it } from 'vitest';
import {
  shouldAutoOpenMenuFromURL,
  urlWithMenuOpen,
  urlWithMenuClosed,
} from '../menu-deeplink';

describe('shouldAutoOpenMenuFromURL', () => {
  it('abre con ?menu', () => {
    expect(shouldAutoOpenMenuFromURL('?menu', '')).toBe(true);
  });

  it('abre con ?menu=1', () => {
    expect(shouldAutoOpenMenuFromURL('?menu=1', '')).toBe(true);
  });

  it('abre con #menu', () => {
    expect(shouldAutoOpenMenuFromURL('', '#menu')).toBe(true);
  });

  it('abre con #MENU (insensible a mayúsculas)', () => {
    expect(shouldAutoOpenMenuFromURL('', '#MENU')).toBe(true);
  });

  it('abre cuando ?menu convive con UTMs de campaña', () => {
    expect(shouldAutoOpenMenuFromURL('?utm_source=ig&menu', '')).toBe(true);
  });

  it('NO abre sin señal', () => {
    expect(shouldAutoOpenMenuFromURL('', '')).toBe(false);
  });

  it('NO abre con otros params/hashes', () => {
    expect(shouldAutoOpenMenuFromURL('?utm_source=ig', '#reserva')).toBe(false);
  });
});

describe('urlWithMenuOpen', () => {
  it('agrega #menu en una URL limpia', () => {
    expect(urlWithMenuOpen('/', '')).toBe('/#menu');
  });

  it('convierte ?menu en #menu', () => {
    expect(urlWithMenuOpen('/', '?menu')).toBe('/#menu');
  });

  it('preserva UTMs y quita menu', () => {
    expect(urlWithMenuOpen('/', '?utm_source=ig&menu')).toBe('/?utm_source=ig#menu');
  });
});

describe('urlWithMenuClosed', () => {
  it('deja la raíz limpia', () => {
    expect(urlWithMenuClosed('/', '')).toBe('/');
  });

  it('preserva UTMs al cerrar y quita menu', () => {
    expect(urlWithMenuClosed('/', '?utm_source=ig&menu')).toBe('/?utm_source=ig');
  });
});
