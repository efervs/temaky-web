import { describe, expect, it } from 'vitest';
import { isRestaurantOpen } from '../hours';

// Monterrey sits at UTC-6 year-round (no DST after Oct 2022).
// Monterrey local time = UTC - 6h. Below we feed UTC Dates
// that correspond to the intended local wall-clock time.

describe('isRestaurantOpen', () => {
  it('lunes 11:59 local = false (still closed)', () => {
    // 2026-04-06 (Mon) 11:59 Monterrey → 17:59 UTC
    expect(isRestaurantOpen(new Date('2026-04-06T17:59:00Z'))).toBe(false);
  });

  it('lunes 12:00 local = true (just opened)', () => {
    // 2026-04-06 (Mon) 12:00 Monterrey → 18:00 UTC
    expect(isRestaurantOpen(new Date('2026-04-06T18:00:00Z'))).toBe(true);
  });

  it('sábado 21:59 local = true (still open)', () => {
    // 2026-04-04 (Sat) 21:59 Monterrey → 03:59 UTC Apr 5
    expect(isRestaurantOpen(new Date('2026-04-05T03:59:00Z'))).toBe(true);
  });

  it('sábado 22:01 local = false (just closed)', () => {
    // 2026-04-04 (Sat) 22:01 Monterrey → 04:01 UTC Apr 5
    expect(isRestaurantOpen(new Date('2026-04-05T04:01:00Z'))).toBe(false);
  });

  it('domingo al mediodía = false (cerrado todo el día)', () => {
    // 2026-04-05 (Sun) 14:00 Monterrey → 20:00 UTC
    expect(isRestaurantOpen(new Date('2026-04-05T20:00:00Z'))).toBe(false);
  });

  it('domingo a las 20:00 = false', () => {
    // 2026-04-05 (Sun) 20:00 Monterrey → 02:00 UTC Apr 6
    expect(isRestaurantOpen(new Date('2026-04-06T02:00:00Z'))).toBe(false);
  });
});
