import { getMissionDetails } from '../utils/data.js';
import { clampPage, attachSwipe } from '../utils/bookNavigation.js';
import { finishBookOpening } from '../utils/animations.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value ? new Date(value).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' }) : '—';

export async function renderBook(app, missionId, goHome) {
  const openingStartedAt = performance.now();
  const minimumOpeningMs = 5000; // Keep the retrieval panorama visible for at least five seconds after it begins.
  const waitForOpeningSequence = async () => {
    const remaining = minimumOpeningMs - (performance.now() - openingStartedAt);
    if (remaining > 0) await new Promise(resolve => window.setTimeout(resolve, remaining));
  };
  try {
    const { mission, chapters, sections, equipment, media, sources } = await getMissionDetails(missionId);
    const pages = buildPages(mission, chapters, sections, equipment, media, sources);
    let current = 0;
    let pointerStart = null;
    let wheelLocked = false;
    let wheelLockTimer;
    let removeSwipe = null;
    let resizeObserver = null;

    app.innerHTML = `
      <main class="reader immersive-reader">
        <div class="reader-panorama-backdrop" aria-hidden="true"></div>
        <header class="reader-topbar">
          <button id="back-home" class="reader-back">← BOOKSHELF</button>
          <div class="reader-brand">${esc(mission.name)}</div>
          <span class="reader-counter" id="top-counter"></span>
        </header>
        <section class="reader-viewport" id="reader-stage" aria-label="Mission book pages">
          <div class="reader-track" id="reader-track"></div>
        </section>
        <footer class="reader-footer">
          <div class="reader-footer-brand">THE SPACEBOUND LIBRARY <span>·</span> MISSION ARCHIVE</div>
          <nav class="reader-controls" aria-label="Page navigation">
            <button id="first" title="First page" aria-label="First page">⇤</button>
            <button id="previous" title="Previous page" aria-label="Previous page">←</button>
            <span id="page-indicator"></span>
            <button id="next" title="Next page" aria-label="Next page">→</button>
            <button id="last" title="Last page" aria-label="Last page">⇥</button>
          </nav>
          <div class="reader-hint">SCROLL / SWIPE HORIZONTALLY · USE ← → KEYS</div>
        </footer>
      </main>`;

    const stage = app.querySelector('#reader-stage');
    const track = app.querySelector('#reader-track');

    const tocItems = pages.map((page, index) => ({ page, index })).filter(item => item.page.isMainChapter);
    track.innerHTML = pages.map((page, index) => {
      if (index === 0) {
        return `<article class="reader-panel intro-panel" data-page="${index}" aria-label="Mission overview">
          <div class="intro-main">
            <div class="intro-cover-wrap">
              ${mission.cover_image ? `<button type="button" class="image-zoom-trigger cover-zoom-trigger" aria-label="Enlarge ${esc(mission.name)} cover image"><img class="intro-cover" src="${esc(mission.cover_image)}" alt="${esc(mission.name)} mission cover"></button>` : '<div class="intro-cover intro-cover-placeholder">✦</div>'}
              <span class="intro-cover-caption">MISSION DOSSIER</span>
            </div>
            <div class="intro-copy">
              <p class="page-kicker">THE MISSION · FIELD NOTES</p>
              <h1>${esc(mission.name)}</h1>
              <div class="intro-rule">✦ ───────── ✦</div>
              <p class="intro-synopsis">${esc(mission.main_purpose || 'A journey into the unknown.')}</p>
              <dl class="mission-facts">
                <div><dt>Agency</dt><dd>${esc(mission.agency || '—')}</dd></div>
                <div><dt>Destination</dt><dd>${esc(mission.destination || '—')}</dd></div>
                <div><dt>Mission type</dt><dd>${esc(mission.mission_type || '—')}</dd></div>
                <div><dt>Launch</dt><dd>${date(mission.launch_date)}</dd></div>
                <div><dt>Landing</dt><dd>${date(mission.landing_date)}</dd></div>
                <div><dt>Final location</dt><dd>${esc(mission.final_location || '—')}</dd></div>
              </dl>
              <p class="intro-direction">Choose a chapter or move right to begin reading <span>→</span></p>
            </div>
          </div>
          <aside class="intro-toc">
            <p class="page-kicker">IN THIS VOLUME</p>
            <h2>Table of Contents</h2>
            <ol>${tocItems.map(({page: item, index: pageIndex}, i) => `<li><button type="button" data-goto="${pageIndex}"><span class="toc-number">${String(i + 1).padStart(2,'0')}</span><span>${esc(item.tocTitle || item.title)}</span><span class="toc-arrow">→</span></button></li>`).join('') || '<li class="toc-empty">Chapters will appear here when available.</li>'}</ol>
          </aside>
        </article>`;
      }
      return `<article class="reader-panel chapter-panel ${page.isMainChapter ? 'chapter-opening-page' : 'chapter-continuation-page'}" data-page="${index}" data-main-chapter="${page.isMainChapter ? 'true' : 'false'}" data-chapter-page-index="${page.chapterPageIndex ?? 0}" aria-label="${esc(page.title)}">
        <header class="chapter-heading ${!page.isMainChapter && (page.chapterPageIndex || 0) > 0 ? 'chapter-heading-continuation' : ''}">
          <p class="page-kicker">${esc(page.kicker)}</p>
          <h2>${esc(page.chapterTitle || page.title)}</h2>
          <span class="chapter-rail-rule">✦ ───────── ✦</span>
          ${page.isMainChapter ? `<p class="chapter-rail-caption">${esc(page.caption || mission.name)}</p>` : ''}
        </header>
        <div class="chapter-reading-surface">
          <div class="chapter-reading-inner ${page.image ? 'has-section-photo' : 'text-only'}">
            ${page.image ? `<figure class="chapter-photo-card"><button type="button" class="image-zoom-trigger" aria-label="Enlarge image: ${esc(page.caption || page.title)}"><img src="${esc(page.image)}" alt="${esc(page.caption || page.title)}" loading="lazy"></button><figcaption>${esc(page.caption || page.title)}</figcaption></figure>` : ''}
            <div class="chapter-reading-copy ${page.hideContentTitle ? 'hide-content-title' : ''}">
              ${page.hideContentTitle ? '' : `<h1>${esc(page.title)}</h1><div class="intro-rule">✦ ───────── ✦</div>`}
              <div class="chapter-body">${page.html}</div>
            </div>
          </div>
        </div>
      </article>`;
    }).join('');

    function fitReaderContent(panel) {
      if (!panel) return;
      const inner = panel.querySelector('.chapter-reading-inner');
      if (!inner) return;
      inner.style.setProperty('--reader-fit-scale', '1');
      // Let the browser measure the natural content before applying a modest type scale.
      requestAnimationFrame(() => {
        const available = inner.clientHeight;
        const needed = inner.scrollHeight;
        if (!available || !needed || needed <= available + 2) return;
        const scale = Math.max(.82, Math.min(1, (available / needed) * .97));
        inner.style.setProperty('--reader-fit-scale', String(scale));
      });
    }

    function showPage(index) {
      const nextIndex = clampPage(index, pages.length);
      if (nextIndex === current && track.querySelector('.reader-panel.is-active')) return;
      current = nextIndex;
      // Use the measured reader viewport width rather than 100vw. This keeps
      // panels aligned even when browser scrollbars or viewport chrome differ.
      const panelWidth = stage.clientWidth || window.innerWidth;
      track.style.transition = 'none';
      track.style.transform = `translate3d(${-current * panelWidth}px,0,0)`;
      track.querySelectorAll('.reader-panel').forEach((panel, i) => {
        panel.classList.toggle('is-active', i === current);
        panel.setAttribute('aria-hidden', String(i !== current));
      });
      const active = track.querySelector(`.reader-panel[data-page="${current}"]`);
      // Chapter title remains part of its page. Do not animate it separately
      // or insert a title-only transition when moving in either direction.
      track.querySelectorAll('.chapter-panel').forEach(panel => {
        panel.classList.remove('chapter-title-docked', 'chapter-title-static', 'enter-from-right', 'enter-from-left');
      });
      if (active?.classList.contains('chapter-panel') &&
          Number(active.dataset.chapterPageIndex || 0) > 0) {
        active.classList.add('chapter-title-docked');
      }
      fitReaderContent(active);
      app.querySelector('#page-indicator').textContent = `${current + 1} / ${pages.length}`;
      app.querySelector('#top-counter').textContent = `PAGE ${String(current + 1).padStart(2,'0')} OF ${String(pages.length).padStart(2,'0')}`;
      app.querySelector('#first').disabled = current === 0;
      app.querySelector('#previous').disabled = current === 0;
      app.querySelector('#next').disabled = current === pages.length - 1;
      app.querySelector('#last').disabled = current === pages.length - 1;
    }

    const previous = () => showPage(current - 1, -1);
    const next = () => showPage(current + 1, 1);
    app.querySelector('#first').addEventListener('click', () => showPage(0, -1));
    app.querySelector('#previous').addEventListener('click', previous);
    app.querySelector('#next').addEventListener('click', next);
    app.querySelector('#last').addEventListener('click', () => showPage(pages.length - 1, 1));
    track.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => showPage(Number(button.dataset.goto), Number(button.dataset.goto) >= current ? 1 : -1)));

    removeSwipe = attachSwipe(stage, previous, next);
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') pointerStart = { x:event.clientX, y:event.clientY };
    });
    stage.addEventListener('pointerup', event => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.15) dx < 0 ? next() : previous();
      pointerStart = null;
    });
    stage.addEventListener('pointercancel', () => { pointerStart = null; });

    stage.addEventListener('wheel', event => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 18) return;
      event.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      delta > 0 ? next() : previous();
      window.clearTimeout(wheelLockTimer);
      wheelLockTimer = window.setTimeout(() => { wheelLocked = false; }, 900);
    }, { passive:false });

    function keyboard(event) {
      // Alt+Left is the browser's Back command on Windows; never hijack it.
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'Home') { event.preventDefault(); showPage(0, -1); }
      if (event.key === 'End') { event.preventDefault(); showPage(pages.length - 1, 1); }
      if (event.key === 'Escape') { event.preventDefault(); closeReader(); }
    }
    window.addEventListener('keydown', keyboard);
    const cleanup = () => {
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('keydown', lightboxKeyboard);
      closeLightbox();
      window.clearTimeout(wheelLockTimer);
      resizeObserver?.disconnect();
      if (typeof removeSwipe === 'function') removeSwipe();
    };
    let readerClosing = false;
    function closeReader() {
      if (readerClosing) return;
      readerClosing = true;
      // main.js owns the single closing animation in navigateHome().
      // Do not animate here as well, or two closing overlays create a blank spread.
      cleanup();
      goHome();
    }
    app.querySelector('#back-home').addEventListener('click', closeReader);
    resizeObserver = new ResizeObserver(() => {
      const panelWidth = stage.clientWidth || window.innerWidth;
      track.style.transition = 'none';
      track.style.transition = 'none';
      track.style.transform = `translate3d(${-current * panelWidth}px,0,0)`;
      requestAnimationFrame(() => { track.style.transition = ''; });
      fitReaderContent(track.querySelector('.reader-panel.is-active'));
    });
    resizeObserver.observe(stage);
    track.querySelectorAll('.chapter-photo-card img').forEach(img => img.addEventListener('load', () => fitReaderContent(img.closest('.reader-panel'))));

    let activeLightbox = null;
    function closeLightbox() {
      activeLightbox?.remove();
      activeLightbox = null;
    }
    function openLightbox(img) {
      closeLightbox();
      const overlay = document.createElement('div');
      overlay.className = 'spacebound-image-lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', img.alt || 'Enlarged mission image');
      const large = document.createElement('img');
      large.src = img.currentSrc || img.src;
      large.alt = img.alt || '';
      large.className = 'lightbox-image';
      const caption = document.createElement('p');
      caption.textContent = img.alt || 'Mission image';
      const close = document.createElement('button');
      close.type = 'button'; close.className = 'lightbox-close'; close.textContent = '×';
      close.setAttribute('aria-label', 'Close enlarged image');
      overlay.append(close, large, caption);
      overlay.addEventListener('click', event => { if (event.target === overlay) closeLightbox(); });
      close.addEventListener('click', closeLightbox);
      document.body.appendChild(overlay);
      activeLightbox = overlay;
      close.focus();
    }
    track.querySelectorAll('.image-zoom-trigger img').forEach(img => {
      img.closest('.image-zoom-trigger').addEventListener('click', () => openLightbox(img));
    });
    function lightboxKeyboard(event) { if (event.key === 'Escape' && activeLightbox) closeLightbox(); }
    window.addEventListener('keydown', lightboxKeyboard);

    showPage(0, 1);
    await waitForOpeningSequence();
    finishBookOpening();
  } catch (error) {
    app.innerHTML = `<main class="reader-error"><button id="back-home" class="text-button">← Back to bookshelf</button><h1>We lost this volume in the stacks.</h1><p>${esc(error.message)}</p></main>`;
    await waitForOpeningSequence();
    finishBookOpening();
  }
}

function buildPages(mission, chapters, sections, equipment, media, sources) {
  const pages = [{ title: mission.name, tocTitle: 'Mission overview', chapterTitle: mission.name }];
  [...chapters].sort((a, b) => Number(a.chapter_number || 0) - Number(b.chapter_number || 0)).slice(0, 6).forEach(chapter => {
    const chapterSections = sections.filter(section => String(section.chapter_id) === String(chapter.chapter_id))
      .sort((a, b) => Number(a.section_number || 0) - Number(b.section_number || 0));
    if (!chapterSections.length) {
      pages.push({ kicker:`CHAPTER ${chapter.chapter_number}`, title:chapter.title, tocTitle:chapter.title, chapterTitle:chapter.title, caption:chapter.title, image:null, isMainChapter:true,
        html:`<p class="chapter-lead">${esc(chapter.description || 'Continue exploring this chapter.')}</p>` });
      return;
    }
    chapterSections.forEach((section, sectionIndex) => {
      const sectionMedia = media.find(item => String(item.section_id) === String(section.section_id) && (item.media_url || item.image_url) && (!item.media_type || /image|photo|picture/i.test(item.media_type)));
      const image = sectionMedia?.media_url || sectionMedia?.image_url || null;
      const content = section.content_type === 'html'
        ? (section.content || '')
        : `<p>${esc(section.content || 'Content coming soon.').replace(/\r?\n/g, '</p><p>')}</p>`;
      pages.push({
        kicker:`CHAPTER ${chapter.chapter_number} · SECTION ${section.section_number}`,
        title:section.title || chapter.title,
        tocTitle: sectionIndex === 0 ? chapter.title : `${chapter.title} · ${section.title || `Section ${section.section_number}`}`,
        chapterTitle:chapter.title,
        isMainChapter: sectionIndex === 0,
        chapterPageIndex: sectionIndex,
        caption:`${chapter.title} · ${section.title || ''}`,
        image,
        html:`${sectionIndex === 0 && chapter.description ? `<p class="chapter-lead">${esc(chapter.description)}</p>` : ''}<div class="section-text">${content || '<p>Content coming soon.</p>'}</div>`
      });
    });
  });
  if (equipment.length) {
    const splitDescription = (value, maxChars = 520) => {
      const text = String(value || '').trim();
      if (!text) return [];
      const sentences = text.split(/(?<=[.!?])\s+/);
      const chunks = [];
      let current = '';
      for (const sentence of sentences) {
        if (current && (current.length + sentence.length + 1 > maxChars)) {
          chunks.push(current);
          current = sentence;
        } else {
          current = current ? `${current} ${sentence}` : sentence;
        }
      }
      if (current) chunks.push(current);
      return chunks;
    };

    [...equipment].forEach((item, equipmentIndex) => {
      const descriptionPages = splitDescription(item.description);
      const firstDescription = descriptionPages.shift() || '';
      const common = {
        name: esc(item.name),
        type: esc(item.equipment_type || 'Equipment'),
        purpose: esc(item.purpose || ''),
        image: item.image_url ? `<figure class="equipment-photo"><img src="${esc(item.image_url)}" alt="${esc(item.name)}" loading="lazy"></figure>` : '',
        location: esc(item.location || ''),
        status: esc(item.operational_status || ''),
        deployed: item.date_deployed ? date(item.date_deployed) : ''
      };
      const meta = `
        <div class="equipment-meta">
          ${common.location ? `<span>LOCATION · ${common.location}</span>` : ''}
          ${common.status ? `<span>STATUS · ${common.status}</span>` : ''}
          ${common.deployed ? `<span>DEPLOYED · ${esc(common.deployed)}</span>` : ''}
        </div>`;
      pages.push({
        kicker: `MISSION DOSSIER · HARDWARE ${equipmentIndex + 1}`,
        title: item.name,
        tocTitle: 'Mission hardware & equipment',
        chapterTitle: 'Mission hardware & equipment',
        caption: 'Mission hardware and equipment',
        image: null,
        isMainChapter: equipmentIndex === 0,
        chapterPageIndex: equipmentIndex,
        hideContentTitle: true,
        html: `
          <article class="equipment-single">
            <header class="equipment-card-heading">
              <h3>${common.name}</h3>
              <span>${common.type}</span>
            </header>
            ${common.image}
            ${common.purpose ? `<p class="equipment-purpose"><strong>Purpose:</strong> ${common.purpose}</p>` : ''}
            ${firstDescription ? `<p class="equipment-description">${esc(firstDescription)}</p>` : ''}
            ${meta}
          </article>`
      });

      descriptionPages.forEach((chunk, continuationIndex) => {
        pages.push({
          kicker: `MISSION DOSSIER · HARDWARE ${equipmentIndex + 1}`,
          title: `${item.name} · Continued`,
          tocTitle: 'Mission hardware & equipment',
          chapterTitle: 'Mission hardware & equipment',
          caption: 'Mission hardware and equipment',
          image: null,
          isMainChapter: false,
          chapterPageIndex: equipmentIndex + continuationIndex + 1,
          hideContentTitle: true,
          html: `
            <article class="equipment-single equipment-continuation">
              <header class="equipment-card-heading">
                <h3>${common.name}</h3>
                <span>CONTINUED · ${common.type}</span>
              </header>
              <p>${esc(chunk)}</p>
              ${continuationIndex === descriptionPages.length - 1 ? meta : ''}
            </article>`
        });
      });
    });
  }
  if (sources.length) pages.push({
    kicker:'FURTHER READING', title:'Sources & references', tocTitle:'Sources & references',
    chapterTitle:'Further reading', caption:'Continue your research', image:null,
    isMainChapter:true, chapterPageIndex:0,
    html:`<ol class="source-list">${sources.map(source => `<li><div class="source-entry"><strong>${esc(source.title)}</strong><span>${esc(source.publisher || '')}</span>${source.source_url ? `<a href="${esc(source.source_url)}" target="_blank" rel="noopener noreferrer">Read source ↗</a>` : ''}</div></li>`).join('')}</ol>`
  });
  return pages;
}
