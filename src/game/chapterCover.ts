/** Remount the current chapter at its introduction without reloading its assets. */
export function returnToChapterCover() {
  window.dispatchEvent(new Event('chapter-cover-request'));
}
