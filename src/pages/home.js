import { getMissions } from '../utils/data.js';
import { filterMissions, getCategories } from '../utils/search.js';
import { sortMissions } from '../utils/sort.js';
import { animateBookOpen } from '../utils/animations.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function enhanceGlassDropdown(select, label) {
  if (!select || select.dataset.glassEnhanced) return;
  select.dataset.glassEnhanced = 'true';
  const wrapper = document.createElement('div');
  wrapper.className = 'glass-select-wrap';
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);
  select.classList.add('glass-native-select');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'glass-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `<span class="glass-select-value"></span><span class="glass-select-arrows" aria-hidden="true"><i class="arrow-down">↓</i><i class="arrow-up">↑</i></span>`;
  const menu = document.createElement('div');
  menu.className = 'glass-select-menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;
  wrapper.append(trigger, menu);
  const valueNode = trigger.querySelector('.glass-select-value');
  function sync() {
    valueNode.textContent = select.selectedOptions[0]?.textContent || label;
    menu.innerHTML = [...select.options].map((option, i) => `<button type="button" role="option" aria-selected="${option.selected}" data-value="${esc(option.value)}">${esc(option.textContent)}</button>`).join('');
    menu.querySelectorAll('button').forEach(item => item.addEventListener('click', () => {
      select.value = item.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      close(); sync();
    }));
  }
  function close() { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); wrapper.classList.remove('is-open'); }
  trigger.addEventListener('click', () => {
    const opening = menu.hidden;
    document.querySelectorAll('.glass-select-wrap.is-open').forEach(node => { node.classList.remove('is-open'); node.querySelector('.glass-select-menu').hidden = true; node.querySelector('.glass-select-trigger').setAttribute('aria-expanded', 'false'); });
    menu.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening)); wrapper.classList.toggle('is-open', opening);
  });
  document.addEventListener('click', event => { if (!wrapper.contains(event.target)) close(); });
  select.addEventListener('change', sync);
  sync();
}

export async function renderHome(app, openBook) {
  app.innerHTML = `
    <main class="library-page">
      <header class="library-header">
        <div class="header-glass">
          <div class="eyebrow">A FIELD GUIDE TO HUMANITY'S JOURNEY</div>
          <h1><span>The Spacebound</span><em>Library</em></h1>
          <p class="header-copy">Stories of distant worlds, remarkable machines, and the people who sent them there.</p>
          <div class="header-rule"><span>✦</span></div>
        </div>
      </header>

      <section class="library-stickybar" aria-label="Library navigation">
        <div class="current-category" id="current-category">THE COLLECTION</div>
        <div class="library-tools">
          <label class="search-wrap"><span class="search-icon" aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search mission, worlds, agencies..." aria-label="Search missions"></label>
          <select id="category" aria-label="Filter destination">
            <option value="All">All destinations</option>
          </select>
          <select id="sort" aria-label="Sort missions">
            <option value="az">A–Z</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </section>
      <div id="library-status" class="status-line">Gathering volumes…</div>
      <section id="shelves" class="shelves" aria-live="polite"></section>
      <footer class="library-footer">THE SPACEBOUND LIBRARY <span>·</span> AN OPEN COLLECTION OF SPACE EXPLORATION</footer>
    </main>`;

  const status = app.querySelector('#library-status');
  const shelves = app.querySelector('#shelves');
  try {
    const missions = await getMissions();
    if (!missions.length) {
      status.textContent = 'No missions found. Add records to your missions table to begin.';
      return;
    }

    app.querySelector('#category').innerHTML = getCategories(missions)
      .map(category => `<option value="${esc(category)}">${esc(category === 'All' ? 'All destinations' : category)}</option>`).join('');

    // Replace native popup menus with accessible glass menus while retaining the original selects as state.
    enhanceGlassDropdown(app.querySelector('#category'), 'Destination');
    enhanceGlassDropdown(app.querySelector('#sort'), 'Sort');

    function draw() {
      const visible = sortMissions(filterMissions(
        missions,
        app.querySelector('#search').value,
        app.querySelector('#category').value
      ), app.querySelector('#sort').value);

      status.textContent = `${visible.length} ${visible.length === 1 ? 'volume' : 'volumes'} in the collection`;
      const grouped = new Map();
      visible.forEach(mission => {
        const category = mission.destination || mission.mission_type || 'Other expeditions';
        if (!grouped.has(category)) grouped.set(category, []);
        grouped.get(category).push(mission);
      });

      shelves.innerHTML = [...grouped.entries()].map(([category, items], groupIndex) => `
        <section class="shelf-section" data-category="${esc(category)}" id="shelf-${groupIndex}">
          <div class="shelf-label"><h2>${esc(category)}</h2><span>${String(items.length).padStart(2, '0')} VOLUMES</span></div>
          <div class="shelf-body"><div class="shelf-row">
            ${items.map((mission, index) => `
              <button class="book-spine spine-${index % 6}" data-id="${esc(mission.mission_id)}" aria-label="Open ${esc(mission.name)}">
                <span class="spine-mark">✦</span>
                <span class="spine-title">${esc(mission.name)}</span>
                <span class="spine-subtitle">${esc(mission.agency || 'MISSION ARCHIVE')}</span>
                <span class="book-tooltip">
                  <span class="tooltip-image">${mission.cover_image ? `<img src="${esc(mission.cover_image)}" alt="${esc(mission.name)}">` : '<span class="placeholder-star">✦</span>'}</span>
                  <span class="tooltip-copy"><strong>${esc(mission.name)}</strong><small>${esc(mission.destination || mission.mission_type || 'Space mission')}</small><span>${esc(mission.main_purpose || 'Explore the story, discoveries, and legacy of this mission.')}</span><i>OPEN VOLUME →</i></span>
                </span>
              </button>`).join('')}
            <div class="shelf-wood"></div>
          </div></div>
        </section>`).join('') || '<p class="empty-state">No volumes match your search.</p>';

      shelves.querySelectorAll('.book-spine').forEach(button => {
        button.addEventListener('mouseenter', () => { clearTimeout(tooltipHideTimer); showBookTooltip(button); });
        button.addEventListener('focus', () => showBookTooltip(button));
        button.addEventListener('mouseleave', scheduleTooltipHide);
        button.addEventListener('blur', scheduleTooltipHide);
        button.addEventListener('click', () => {
          hideBookTooltip();
          animateBookOpen(button, () => openBook(button.dataset.id));
        });
      });
      observeShelfHeadings();
    }

    let activeTooltip;
    let activeTooltipBook;
    let tooltipHideTimer;
    function scheduleTooltipHide() {
      clearTimeout(tooltipHideTimer);
      // A short bridge delay lets the pointer cross the small visual gap.
      // Once the pointer is on the card, its position remains anchored to the book.
      tooltipHideTimer = window.setTimeout(() => {
        const pointerStillOnBook = activeTooltipBook?.matches(':hover');
        const pointerStillOnCard = activeTooltip?.matches(':hover');
        if (!pointerStillOnBook && !pointerStillOnCard) hideBookTooltip();
      }, activeTooltipBook?.matches(':hover') ? 180 : 80);
    }
    function showBookTooltip(button) {
      clearTimeout(tooltipHideTimer);
      hideBookTooltip();
      const row = button.closest('.shelf-row');
      const rowBooks = [...row.querySelectorAll('.book-spine')];
      const isLastBookOnRight = rowBooks.at(-1) === button;
      const rect = button.getBoundingClientRect();
      const mission = missions.find(item => String(item.mission_id) === button.dataset.id);
      if (!mission) return;
      const tooltip = document.createElement('div');
      tooltip.className = `book-tooltip-floating${isLastBookOnRight ? ' tooltip-left' : ''}`;
      tooltip.setAttribute('role', 'group');
      tooltip.setAttribute('aria-label', `${mission.name} information`);
      tooltip.innerHTML = `
        <span class="tooltip-image">${mission.cover_image ? `<img src="${esc(mission.cover_image)}" alt="${esc(mission.name)}">` : '<span class="placeholder-star">✦</span>'}</span>
        <span class="tooltip-copy"><strong>${esc(mission.name)}</strong><small>${esc(mission.destination || mission.mission_type || 'Space mission')}</small><span>${esc(mission.main_purpose || 'Explore the story, discoveries, and legacy of this mission.')}</span><button type="button" class="tooltip-open-volume">OPEN VOLUME <span aria-hidden="true">→</span></button></span>`;
      document.body.appendChild(tooltip);
      tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipHideTimer));
      tooltip.addEventListener('pointerenter', () => clearTimeout(tooltipHideTimer));
      tooltip.addEventListener('mouseleave', event => {
        if (event.relatedTarget === button || button.contains(event.relatedTarget)) return;
        scheduleTooltipHide();
      });
      tooltip.addEventListener('pointerleave', event => {
        if (event.relatedTarget === button || button.contains(event.relatedTarget)) return;
        scheduleTooltipHide();
      });
      tooltip.querySelector('.tooltip-open-volume').addEventListener('click', () => {
        const id = button.dataset.id;
        hideBookTooltip();
        animateBookOpen(button, () => openBook(id));
      });
      // Place the information card immediately after the book on its right.
      // Use the remaining viewport width so the book spine/title is never covered.
      const width = Math.min(350, window.innerWidth - 28);
      const gap = 16;
      const preferredLeft = rect.right + gap;
      const fitsRight = preferredLeft + width <= window.innerWidth - 10;
      const left = fitsRight ? preferredLeft : Math.max(10, rect.left - width - gap);
      tooltip.style.width = `${width}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = '0px';
      // Centre the card vertically on the book so its placement follows the book,
      // not the cursor. It therefore stays aligned while the pointer enters the card.
      const measuredHeight = tooltip.offsetHeight;
      const bookCenterY = rect.top + rect.height / 2;
      const top = Math.max(10, Math.min(bookCenterY - measuredHeight / 2, window.innerHeight - measuredHeight - 10));
      tooltip.style.top = `${top}px`;
      tooltip.style.setProperty('--tooltip-anchor-y', `${bookCenterY - top}px`);
      requestAnimationFrame(() => tooltip.classList.add('tooltip-visible'));
      activeTooltip = tooltip;
      activeTooltipBook = button;
    }
    function hideBookTooltip() {
      clearTimeout(tooltipHideTimer);
      activeTooltip?.remove();
      activeTooltip = null;
      activeTooltipBook = null;
    }

    let headingObserver;
    function observeShelfHeadings() {
      headingObserver?.disconnect();
      const current = app.querySelector('#current-category');
      headingObserver = new IntersectionObserver(entries => {
        const visibleEntry = entries.filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry) current.textContent = visibleEntry.target.dataset.category.toUpperCase();
      }, { rootMargin: '-120px 0px -65% 0px', threshold: [0, .2, .5, .8] });
      shelves.querySelectorAll('.shelf-section').forEach(section => headingObserver.observe(section));
    }

    app.querySelector('#search').addEventListener('input', draw);
    app.querySelector('#category').addEventListener('change', draw);
    app.querySelector('#sort').addEventListener('change', draw);
    draw();
  } catch (error) {
    status.innerHTML = `<span class="error-title">The archive could not be opened.</span><br>${esc(error.message)}<br><small>Check your Supabase URL, publishable key, table permissions and Row Level Security policies.</small>`;
  }
}
