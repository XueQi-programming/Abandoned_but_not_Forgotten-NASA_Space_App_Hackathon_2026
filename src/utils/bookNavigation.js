export function clampPage(page, total) {
  return Math.max(0, Math.min(page, Math.max(0, total - 1)));
}

export function attachSwipe(element, onPrevious, onNext) {
  let startX = 0;
  let startY = 0;
  element.addEventListener('touchstart', event => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });
  element.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx < 0 ? onNext() : onPrevious();
    }
  }, { passive: true });
}
