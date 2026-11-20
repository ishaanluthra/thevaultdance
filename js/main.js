// Header state, mobile menu, branch picker, click-to-load map, today's hours.
(() => {
  const d = document;
  const hdr = d.querySelector('[data-hdr]');
  const dock = d.querySelector('.dock');

  // Solid header after a little scroll; contact dock once the hero is passed
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 24);
    if (dock) dock.classList.toggle('is-up', y > innerHeight * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const burger = d.querySelector('[data-burger]');
  const setMenu = open => {
    d.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!d.body.classList.contains('nav-open')));
  d.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && d.body.classList.contains('nav-open')) { setMenu(false); burger.focus(); } });

  // Branch picker: accessible tabs with a sliding highlight
  const picker = d.querySelector('[data-picker]');
  if (picker) {
    const tabs = [...picker.querySelectorAll('[role="tab"]')];
    const ink = picker.querySelector('.tabs-ink');
    const moveInk = t => { ink.style.width = `${t.offsetWidth}px`; ink.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, focus) => {
      tabs.forEach(o => {
        const on = o === t;
        o.setAttribute('aria-selected', on);
        o.tabIndex = on ? 0 : -1;
        const p = d.getElementById(o.getAttribute('aria-controls'));
        p.hidden = !on;
        p.classList.toggle('is-in', on);
      });
      moveInk(t);
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.at(-1), true); }
      });
    });
    const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true');
    d.fonts?.ready.then(() => moveInk(current()));
    addEventListener('resize', () => moveInk(current()));
    moveInk(current());
  }

  // Google Maps loads only when asked (keeps pages light)
  d.querySelectorAll('[data-map]').forEach(m => {
    m.querySelector('.map-btn').addEventListener('click', () => {
      const f = d.createElement('iframe');
      f.src = m.dataset.map;
      f.title = m.dataset.title;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      m.prepend(f);
      m.classList.add('is-live');
    });
  });

  // Highlight today's row in the hours table (studio time is IST)
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date());
  d.querySelectorAll(`.hours tr[data-day="${today}"]`).forEach(r => r.classList.add('is-today'));

  // Contact form: compose a WhatsApp message instead of posting anywhere
  const enq = d.querySelector('[data-enq]');
  if (enq) enq.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(enq);
    const msg = `Hi, I'm ${f.get('name')}. I'd like a trial class.\nWho: ${f.get('who')}\nClass: ${f.get('style')}\nStudio: ${f.get('studio')}\nBest time: ${f.get('time')}`;
    open(`https://wa.me/919311504495?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  d.querySelectorAll('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });
})();
