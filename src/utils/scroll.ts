/**
 * utils/scroll.ts
 * Tiện ích cuộn tới section theo id, bù trừ chiều cao navbar dính (~80px).
 */
export const NAV_OFFSET = 80;

export function scrollToId(id: string, offset: number = NAV_OFFSET): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
  return true;
}
