import { getMissionDetails } from '../utils/data.js';
import { clampPage, attachSwipe } from '../utils/bookNavigation.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '—';

export async function renderBook(app, missionId, goHome) {
  app.innerHTML = `<main class="reader-loading"><button id="back-home" class="text-button">← Back to bookshelf</button><div class="boot-screen"><span class="loader"></span><p>Turning the pages…</p></div></main>`;
  app.querySelector('#back-home').addEventListener('click', goHome);

  try {
    const data = await getMissionDetails(missionId);
    const { mission, chapters, sections, equipment, media, sources } = data;
    const pages = buildPages(mission, chapters, sections, equipment, sources);
    let current = 0;

    app.innerHTML = `
      <main class="reader">
        <header class="reader-topbar">
          <button id="back-home" class="text-button">← THE BOOKSHELF</button>
          <div class="reader-brand">THE SPACEBOUND LIBRARY</div>
          <span class="reader-counter" id="top-counter"></span>
        </header>
        <section class="reader-stage" id="reader-stage">
          <div class="scroll-art" id="scroll-art">
            <div class="art-caption">FIELD NOTES · ${esc(mission.name)}</div>
            <div class="art-image" id="art-image"></div>
            <div class="art-bottom">A RECORD OF EXPLORATION <span>✦</span></div>
          </div>
          <article class="page-content" id="page-content"></article>
        </section>
        <nav class="reader-controls" aria-label="Page navigation">
          <button id="first" title="First page">⇤</button><button id="previous" title="Previous page">←</button>
          <span id="page-indicator"></span>
          <button id="next" title="Next page">→</button><button id="last" title="Last page">⇥</button>
        </nav>
        <div class="reader-hint">SWIPE LEFT OR RIGHT TO TURN THE PAGE</div>
      </main>`;

    app.querySelector('#back-home').addEventListener('click', goHome);
    const content = app.querySelector('#page-content');
    const stage = app.querySelector('#reader-stage');

    function showPage(index) {
      current = clampPage(index, pages.length);
      const page = pages[current];
      content.classList.remove('page-enter');
      void content.offsetWidth;
      content.innerHTML = `
        <div class="page-kicker">${esc(page.kicker)}</div>
        <h1>${esc(page.title)}</h1>
        <div class="page-ornament">✦ ───────── ✦</div>
        <div class="page-body">${page.html}</div>`;
      content.classList.add('page-enter');
      app.querySelector('#page-indicator').textContent = `${current + 1} / ${pages.length}`;
      app.querySelector('#top-counter').textContent = `PAGE ${String(current + 1).padStart(2, '0')} OF ${String(pages.length).padStart(2, '0')}`;
      app.querySelector('#first').disabled = current === 0;
      app.querySelector('#previous').disabled = current === 0;
      app.querySelector('#next').disabled = current === pages.length - 1;
      app.querySelector('#last').disabled = current === pages.length - 1;
      const image = page.image || mission.cover_image || media.find(m => m.media_url)?.media_url;
      app.querySelector('#art-image').innerHTML = image
        ? `<img src="${esc(image)}" alt="${esc(page.title)}">`
        : `<div class="art-placeholder"><span>✦</span><p>${esc(mission.destination || 'DEEP SPACE')}</p></div>`;
    }

    app.querySelector('#first').addEventListener('click', () => showPage(0));
    app.querySelector('#previous').addEventListener('click', () => showPage(current - 1));
    app.querySelector('#next').addEventListener('click', () => showPage(current + 1));
    app.querySelector('#last').addEventListener('click', () => showPage(pages.length - 1));
    attachSwipe(stage, () => showPage(current - 1), () => showPage(current + 1));
    window.addEventListener('keydown', keyboard);
    function keyboard(event) {
      if (event.key === 'ArrowLeft') showPage(current - 1);
      if (event.key === 'ArrowRight') showPage(current + 1);
      if (event.key === 'Escape') goHome();
    }
    showPage(0);
  } catch (error) {
    app.innerHTML = `<main class="reader-error"><button id="back-home" class="text-button">← Back to bookshelf</button><h1>We lost this volume in the stacks.</h1><p>${esc(error.message)}</p></main>`;
    app.querySelector('#back-home').addEventListener('click', goHome);
  }
}

function buildPages(mission, chapters, sections, equipment, sources) {
  const pages = [{
    kicker: 'MISSION DOSSIER · OVERVIEW',
    title: mission.name,
    image: mission.cover_image,
    html: `<p class="lead">${esc(mission.main_purpose || 'A journey into the unknown.')}</p>
      <dl class="mission-facts">
        <div><dt>Agency</dt><dd>${esc(mission.agency || '—')}</dd></div>
        <div><dt>Destination</dt><dd>${esc(mission.destination || '—')}</dd></div>
        <div><dt>Mission type</dt><dd>${esc(mission.mission_type || '—')}</dd></div>
        <div><dt>Launch</dt><dd>${date(mission.launch_date)}</dd></div>
        <div><dt>Landing</dt><dd>${date(mission.landing_date)}</dd></div>
        <div><dt>Final location</dt><dd>${esc(mission.final_location || '—')}</dd></div>
      </dl>`
  }];

  chapters.forEach(chapter => {
    const chapterSections = sections.filter(s => s.chapter_id === chapter.chapter_id);
    if (!chapterSections.length) {
      pages.push({ kicker: `CHAPTER ${chapter.chapter_number}`, title: chapter.title, html: `<p class="lead">${esc(chapter.description || '')}</p><p>More details for this chapter will be added to the archive.</p>` });
    } else {
      chapterSections.forEach(section => {
        const related = section.content_type === 'html'
          ? section.content
          : `<p>${esc(section.content).replace(/\n/g, '</p><p>')}</p>`;
        pages.push({
          kicker: `CHAPTER ${chapter.chapter_number} · SECTION ${section.section_number}`,
          title: section.title || chapter.title,
          html: `<p class="lead">${esc(chapter.description || '')}</p><div class="section-text">${related || '<p>Content coming soon.</p>'}</div>`
        });
      });
    }
  });

  if (equipment.length) {
    pages.push({
      kicker: 'MISSION DOSSIER · HARDWARE', title: 'Machines & equipment',
      html: `<div class="equipment-list">${equipment.map(item => `<section><h3>${esc(item.name)}</h3><p class="equipment-type">${esc(item.equipment_type || '')} · ${esc(item.operational_status || 'Status not recorded')}</p><p>${esc(item.description || item.purpose || '')}</p>${item.location ? `<small>LOCATION · ${esc(item.location)}</small>` : ''}</section>`).join('')}</div>`
    });
  }
  if (sources.length) {
    pages.push({
      kicker: 'FURTHER READING', title: 'Sources & references',
      html: `<ol class="source-list">${sources.map(s => `<li><strong>${esc(s.title)}</strong><span>${esc(s.publisher || '')}</span>${s.source_url ? `<a href="${esc(s.source_url)}" target="_blank" rel="noopener noreferrer">Read source ↗</a>` : ''}</li>`).join('')}</ol>`
    });
  }
  return pages;
}
