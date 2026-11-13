export function animateBookOpen(element, callback) {
  element.classList.add('book-opening');
  window.setTimeout(callback, 520);
}
