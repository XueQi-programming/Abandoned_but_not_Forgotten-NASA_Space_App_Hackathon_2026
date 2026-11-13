import { getMissions } from '../utils/data.js';
import { filterMissions, getCategories } from '../utils/search.js';
import { sortMissions } from '../utils/sort.js';
import { animateBookOpen } from '../utils/animations.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export async function renderHome(app, openBook) {
  app.innerHTML = `
    <main class="library-page">
      <header class="library-header">
        <div class="eyebrow">A FIELD GUIDE TO HUMANITY'S JOURNEY</div>
        <h1>The Spacebound <em>Library</em></h1>
        <p class="header-copy">Stories of distant worlds, remarkable machines, and the people who sent them there.</p>
        <div class="header-rule"><span>✦</span></div>
      </header>
      <section class="library-tools">
        <label class="search-wrap"><span>⌕</span><input id="search" type="search" placeholder="Search missions, worlds, agencies…" aria-label="Search missions"></label>
        <select id="category" aria-label="Filter category"><option>All</option></select>
        <select id="sort" aria-label="Sort missions">
          <option value="az">A–Z</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select>
      </section>
      <div id="library-status" class="status-line">Gathering volumes…</div>
      <section id="shelves" class="shelves" aria-live="polite"></section>
      <footer class="library-footer">THE SPACEBOUND LIBRARY<span>·</span>AN OPEN COLLECTION OF SPACE EXPLORATION</footer>
    </main>`;

  const status = app.querySelector('#library-status');
  const shelves = app.querySelector('#shelves');
  try {
    const missions = await getMissions();
    if (!missions.length) {
      status.textContent = 'No missions found. Check that your missions table contains records.';
      return;
    }
    const categories = getCategories(missions);
    app.querySelector('#category').innerHTML = categories.map(c => `<option>${escapeHTML(c)}</option>`).join('');

    function draw() {
      const visible = sortMissions(filterMissions(
        missions, app.querySelector('#search').value, app.querySelector('#category').value
      ), app.querySelector('#sort').value);
      status.textContent = `${visible.length} ${visible.length === 1 ? 'volume' : 'volumes'} in the collection`;
      const grouped = new Map();
      visible.forEach(m => {
        const key = m.destination || m.mission_type || 'Other expeditions';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(m);
      });
      shelves.innerHTML = [...grouped.entries()].map(([category, items]) => `
        <section class="shelf-section">
          <div class="shelf-heading"><h2>${escapeHTML(category)}</h2><span>${String(items.length).padStart(2, '0')} VOLUMES</span></div>
          <div class="shelf-row">
            ${items.map((m, i) => `
              <button class="book-spine spine-${i % 6}" data-id="${escapeHTML(m.mission_id)}" aria-label="Open ${escapeHTML(m.name)}">
                <span class="spine-mark">✦</span><span class="spine-title">${escapeHTML(m.name)}</span><span class="spine-subtitle">${escapeHTML(m.agency || 'MISSION ARCHIVE')}</span>
                <span class="book-tooltip">
                  <span class="tooltip-image">${m.cover_image ? `<img src="${escapeHTML(m.cover_image)}" alt="">` : '<span class="placeholder-star">✦</span>'}</span>
                  <span class="tooltip-copy"><strong>${escapeHTML(m.name)}</strong><small>${escapeHTML(m.destination || m.mission_type || 'Space mission')}</small><span>${escapeHTML(m.main_purpose || m.description || 'Explore the story, discoveries, and legacy of this mission.')}</span><i>OPEN VOLUME →</i></span>
                </span>
              </button>`).join('')}
            <div class="shelf-wood"></div>
          </div>
        </section>`).join('') || '<p class="empty-state">No volumes match your search.</p>';

      shelves.querySelectorAll('.book-spine').forEach(button => {
        button.addEventListener('click', () => {
          animateBookOpen(button, () => openBook(button.dataset.id));
        });
      });
    }
    ['search', 'category', 'sort'].forEach(id => app.querySelector(`#${id}`).addEventListener(id === 'search' ? 'input' : 'change', draw));
    draw();
  } catch (error) {
    status.innerHTML = `<span class="error-title">The archive could not be opened.</span><br>${escapeHTML(error.message)}<br><small>Confirm your .env settings and Supabase Row Level Security policies.</small>`;
  }
}
