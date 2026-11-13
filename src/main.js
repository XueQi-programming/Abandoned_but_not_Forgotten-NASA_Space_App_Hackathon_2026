
import './styles/global.css';
import './styles/bookshelf.css';
import './styles/book.css';
import './styles/animations.css';

import { renderHome } from './pages/home.js';
import { renderBook } from './pages/book.js';

const app = document.querySelector('#app');

function route() {
    const params = new URLSearchParams(location.search);
    const missionId = params.get('book');

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

function navigateHome() {
    history.pushState({}, '', location.pathname);
    route();
    window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('popstate', route);

route();
