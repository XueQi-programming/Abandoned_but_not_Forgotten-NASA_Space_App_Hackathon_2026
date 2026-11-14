let activeOpeningOverlay = null;

import panoramaUrl from '../assets/images/spacebound-panorama.svg';

/** Full-screen cover opening followed by the illustrated archive panorama. */
export function animateBookOpen(_element, callback) {
  activeOpeningOverlay?.remove();
  document.querySelectorAll('.book-closing-overlay').forEach(node => node.remove());

  const overlay = document.createElement('div');
  overlay.className = 'book-opening-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-label', 'Opening The Spacebound Library');
  overlay.innerHTML = `
    <div class="opening-book" role="presentation">
      <div class="opening-page-left" aria-hidden="true"></div>
      <div class="opening-page-right" aria-hidden="true"></div>
      <div class="opening-panorama" aria-hidden="true">
        <div class="panorama-moving-track">
          <img class="panorama-art" src="${panoramaUrl}" alt="" aria-hidden="true">
          <img class="panorama-art" src="${panoramaUrl}" alt="" aria-hidden="true">
        </div>
        <div class="panorama-message"><p>RETRIEVING MISSION ARCHIVE…</p></div>
      </div>
      <div class="opening-cover" aria-hidden="true"></div>
    </div>`;

  document.body.appendChild(overlay);
  activeOpeningOverlay = overlay;
  window.setTimeout(() => {
    if (!overlay.isConnected) return;
    overlay.classList.add('panorama-active');
    callback?.();
  }, 1100);
}

export function finishBookOpening() {
  const overlay = activeOpeningOverlay || document.querySelector('.book-opening-overlay:not(.book-closing-overlay)');
  if (!overlay) return;
  overlay.classList.add('book-opening-complete');
  const remove = () => {
    overlay.removeEventListener('transitionend', remove);
    overlay.remove();
    if (activeOpeningOverlay === overlay) activeOpeningOverlay = null;
  };
  overlay.addEventListener('transitionend', remove, { once: true });
  window.setTimeout(remove, 700);
}

/** Close the open book: the plain walnut right cover swings left over the pages. */
export function animateBookClose(callback) {
  activeOpeningOverlay?.remove();
  activeOpeningOverlay = null;
  document.querySelectorAll('.book-opening-overlay, .book-closing-overlay').forEach(node => node.remove());

  const overlay = document.createElement('div');
  overlay.className = 'book-opening-overlay book-closing-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="opening-book" role="presentation">
      <div class="opening-page-left"></div>
      <div class="opening-page-right"></div>
      <div class="opening-cover closing-cover"></div>
    </div>`;
  document.body.appendChild(overlay);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    overlay.remove();
    document.querySelectorAll('.book-closing-overlay').forEach(node => node.remove());
    callback?.();
  };

  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('book-closing-active')));
  window.setTimeout(finish, 1050);
}
