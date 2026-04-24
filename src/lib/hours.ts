const TZ = 'America/Monterrey';

const dayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  weekday: 'short',
});

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const DAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

const OPEN_MIN = 12 * 60;
const CLOSE_MIN = 22 * 60;

export function isRestaurantOpen(now: Date = new Date()): boolean {
  const weekday = dayFmt.format(now);
  const day = DAY_MAP[weekday];
  if (day === undefined || day === 0) return false;

  const hhmm = timeFmt.format(now);
  const [hStr, mStr] = hhmm.split(':');
  const minutes = Number(hStr) * 60 + Number(mStr);

  return minutes >= OPEN_MIN && minutes < CLOSE_MIN;
}
