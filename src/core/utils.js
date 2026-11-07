/* =====================================================================
   CORE — utils: dates, formatting, small helpers shared everywhere
   ===================================================================== */
import { MONTHS, MONTHS_LONG, WEEKDAYS, WEEKDAYS_LONG, getLang, isZh, t } from './i18n.js';
// Web fonts load without blocking first paint (the link starts as media=print).
document.querySelectorAll('link[data-font]').forEach(l => {
  l.media = 'all';
});
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const uid = (p = 'x') => p + Math.random().toString(36).slice(2, 8);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const MOD = isMac ? '⌘' : 'Ctrl';

/* ---------- dates ---------- */
export const DAY = 864e5;
export const sod = d => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const TODAY = sod(new Date());
export const iso = d => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const parse = s => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addD = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const dOff = n => iso(addD(TODAY, n));
export const diffD = (a, b) => Math.round((sod(a) - sod(b)) / DAY);
/* Month and weekday labels are swapped in place by `syncDateLocale()` (called
   from core/theme.js on every render) so importers never hold a stale copy. */
export const MON = [...MONTHS.en];
export const MONL = [...MONTHS_LONG.en];
export const WD = [...WEEKDAYS.en];
export const WDL = [...WEEKDAYS_LONG.en];
export function syncDateLocale() {
  const l = getLang();
  MON.splice(0, MON.length, ...MONTHS[l]);
  MONL.splice(0, MONL.length, ...MONTHS_LONG[l]);
  WD.splice(0, WD.length, ...WEEKDAYS[l]);
  WDL.splice(0, WDL.length, ...WEEKDAYS_LONG[l]);
}
/* Set from preferences on every render (core/theme.js), so utils never depends on the store. */
export let dateFormat = 'MMM d';
export function setDateFormat(f) {
  dateFormat = f || 'MMM d';
}
export function fmtDate(s, long) {
  const d = typeof s === 'string' ? parse(s) : s;
  if (!d) return '';
  const fmt = dateFormat;
  if (fmt === 'd/M') return `${d.getDate()}/${d.getMonth() + 1}${long ? '/' + d.getFullYear() : ''}`;
  if (fmt === 'M/d') return `${d.getMonth() + 1}/${d.getDate()}${long ? '/' + d.getFullYear() : ''}`;
  if (fmt === 'yyyy-MM-dd') return iso(d);
  const y = long || d.getFullYear() !== TODAY.getFullYear();
  if (isZh()) return `${y ? d.getFullYear() + '年' : ''}${MON[d.getMonth()]}${d.getDate()}日`;
  return `${MON[d.getMonth()]} ${d.getDate()}${y ? ', ' + d.getFullYear() : ''}`;
}
export function relDate(s) {
  if (!s) return '';
  const n = diffD(parse(s), TODAY);
  if (n === 0) return t('Today');
  if (n === 1) return t('Tomorrow');
  if (n === -1) return t('Yesterday');
  if (n > 1 && n < 7) return WD[parse(s).getDay()];
  return fmtDate(s);
}
export function ago(ts) {
  const m = Math.round((Date.now() - ts) / 6e4);
  if (m < 1) return t('just now');
  if (m < 60) return t('{n}m ago', { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('{n}h ago', { n: h });
  const d = Math.round(h / 24);
  if (d < 7) return t('{n}d ago', { n: d });
  return fmtDate(iso(new Date(ts)));
}
export const minsAgo = m => Date.now() - m * 6e4;
export function dayBucket(ts) {
  const n = diffD(new Date(ts), TODAY);
  if (n === 0) return t('Today');
  if (n === -1) return t('Yesterday');
  if (n > -7) return t('This week');
  return t('Earlier');
}
