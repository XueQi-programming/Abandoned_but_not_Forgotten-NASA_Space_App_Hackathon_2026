import './styles/global.css';
import './styles/bookshelf.css';
import './styles/book.css';
import './styles/animations.css';

import { renderHome } from './pages/home.js';
import { renderBook } from './pages/book.js';
import { animateBookClose } from './utils/animations.js';
import { supabaseClient } from './config/supabaseClient.js';

const app = document.querySelector('#app');

function setPageMode(isReader) {
  document.body.classList.toggle('is-reader', isReader);
  document.body.classList.toggle('is-library', !isReader);

  if (isReader) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
  }
}

function route() {
  const missionId = new URLSearchParams(location.search).get('book');

  setPageMode(Boolean(missionId));

  if (missionId) {
    renderBook(app, missionId, navigateHome);
  } else {
    renderHome(app, openBook);
  }
}

function openBook(id) {
  history.pushState({}, '', `?book=${encodeURIComponent(id)}`);
  route();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

let closingToHome = false;
function navigateHome() {
  if (closingToHome) return;
  closingToHome = true;
  animateBookClose(() => {
    history.pushState({}, '', location.pathname);
    setPageMode(false);
    route();
    window.scrollTo({ top: 0, behavior: 'instant' });
    closingToHome = false;
  });
}

void supabaseClient;

window.addEventListener('popstate', () => {
  const returningToLibrary = !new URLSearchParams(location.search).get('book');
  if (returningToLibrary) {
    // Browser Alt+Left / Back has already changed history. Render the library
    // immediately underneath the closing-cover overlay.
    setPageMode(false);
    route();
    animateBookClose();
  } else {
    route();
  }
});

route();
