/** Keep the selected entry visible without scrolling the page or taking focus. */
export function keepCurrentChapterVisible(nav) {
  let disposed = false;
  function align() {
    if (disposed || !nav.clientWidth) return;
    const current = nav.querySelector('a[aria-current="page"]');
    if (!current) return;
    const viewport = nav.getBoundingClientRect();
    const entry = current.getBoundingClientRect();
    const left = viewport.left + nav.clientLeft;
    const right = left + nav.clientWidth;
    const inset = 8;
    if (entry.left < left + inset) nav.scrollLeft += entry.left - left - inset;
    else if (entry.right > right - inset) nav.scrollLeft += entry.right - right + inset;
  }
  align();
  const observer = new ResizeObserver(align);
  observer.observe(nav);
  // The web font can change entry widths without changing the clipped nav width.
  document.fonts.ready.then(align);
  return () => { disposed = true; observer.disconnect(); };
}
