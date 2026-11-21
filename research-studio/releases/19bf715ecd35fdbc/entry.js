(function () {
  'use strict';
  function safeReturn(value, href) {
    const here = new URL(href);
    const base = new URL('./', here);
    const fallback = base.pathname + '#/research';
    try {
      const next = new URL(value || fallback, here);
      if (next.origin !== here.origin || ![base.pathname, base.pathname + 'index.html'].includes(next.pathname)) return fallback;
      const view = /^#\/(research|portfolio|backtest|risk|journal|evidence|allocation|review)$/.test(next.hash) ? next.hash : '#/research';
      return next.pathname + view;
    } catch {
      return fallback;
    }
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {safeReturn};
    return;
  }

  const base = new URL('.', document.currentScript.src);
  const constrained = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  const isLogin = /\/login(?:\.html)?$/.test(location.pathname);
  const entry = {safeReturn, leaving: false};
  window.FactorLabEntry = entry;

  function setUpGuest() {
    const guest = document.getElementById('auth-guest');
    const requested = new URLSearchParams(location.search).get('return');
    if (requested) {
      const target = new URL(safeReturn(requested, location.href), location.href);
      target.searchParams.set('guest', '1');
      guest.href = target.href;
    }
    guest.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (entry.leaving) return;
      entry.leaving = true;
      try { sessionStorage.setItem('factorlab-v3-guest-session', '1'); } catch {}
      try { localStorage.setItem('factorlab-v3-welcome-seen', '1'); } catch {}
      location.replace(guest.href);
    });
    const language = document.getElementById('auth-language');
    const earlyLanguage = () => {
      const lang = language.value === 'en' ? 'en' : 'zh-CN';
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-zh]').forEach(el => {
        el.textContent = lang === 'en' ? el.dataset.en : el.dataset.zh;
      });
    };
    try {
      language.value = localStorage.getItem('factorlab-simulation-language-v3') === 'en' ? 'en' : 'zh-CN';
      if (localStorage.getItem('factorlab-simulation-ui-v3') || localStorage.getItem('factorlab-simulation-ui-v2')) {
        const label = document.getElementById('guest-label');
        label.dataset.zh = '继续此浏览器的练习';
        label.dataset.en = 'Continue this browser’s practice';
      }
    } catch {}
    earlyLanguage();
    language.addEventListener('change', () => {
      if (language.onchange) return;
      earlyLanguage();
      try { localStorage.setItem('factorlab-simulation-language-v3', language.value); } catch {}
    });
  }

  function setUpTrend() {
    const series = document.getElementById('trend-series');
    const prices = series.dataset.prices.split(' ').map(Number);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const points = prices.map((price, index) => ({
      x: 4 + 232 * index / (prices.length - 1),
      y: 36 - 28 * (price - low) / (high - low)
    }));
    series.setAttribute('points', points.map(p => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' '));
    const day = document.getElementById('trend-day');
    const value = document.getElementById('trend-value');
    const guide = document.getElementById('trend-guide');
    const dot = document.querySelector('.trend-dot');
    function selectDay() {
      const index = day.valueAsNumber - Number(day.min);
      const point = points[index];
      const label = 'D' + day.value.replace('-', '−') + ' · ' + prices[index].toFixed(2) + ' USD';
      guide.setAttribute('d', 'M' + point.x + ' ' + point.y + 'V37');
      dot.style.left = point.x / 240 * 100 + '%';
      dot.style.top = point.y / 44 * 100 + '%';
      value.textContent = label;
      day.setAttribute('aria-valuetext', label);
    }
    day.addEventListener('input', selectDay);
    selectDay();
    dot.hidden = false;
  }

  function setUpLight() {
    const plate = document.querySelector('.video-panel');
    const glow = plate.querySelector('.plate-glow');
    const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let box, frame = 0, x = 0, y = 0;
    plate.addEventListener('pointerenter', () => { if (motion.matches) box = plate.getBoundingClientRect(); });
    plate.addEventListener('pointermove', event => {
      if (!box || !motion.matches || event.pointerType === 'touch') return;
      x = (event.clientX - box.left - box.width / 2) * .15;
      y = (event.clientY - box.top - box.height / 2) * .15;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        glow.style.setProperty('--glow-x', x + 'px');
        glow.style.setProperty('--glow-y', y + 'px');
      });
    }, {passive: true});
    plate.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      box = null;
      glow.style.removeProperty('--glow-x');
      glow.style.removeProperty('--glow-y');
    });
  }

  if (isLogin) {
    setUpGuest();
    setUpTrend();
    setUpLight();
  }

  const seen = new Set();
  async function warm(href) {
    if (constrained || document.hidden) return;
    const target = new URL(href, location.href);
    if (target.origin !== location.origin || seen.has(target.pathname)) return;
    seen.add(target.pathname);
    try {
      const response = await fetch(target.pathname, {cache:'force-cache', credentials:'same-origin'});
      if (!response.ok) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const urls = [...doc.querySelectorAll('script[src],link[rel="stylesheet"]')].map(el => new URL(el.getAttribute('src') || el.getAttribute('href'), target));
      const queue = urls.filter(url => url.origin === location.origin && /\.(js|css)$/.test(url.pathname));
      await Promise.all([0,1,2].map(async () => { while (queue.length && !document.hidden) { const url = queue.shift(); await fetch(url.href, {cache:'force-cache',credentials:'same-origin'}).then(r => r.arrayBuffer()).catch(() => {}); } }));
    } catch {}
  }
  for (const event of ['pointerover','focusin','touchstart']) document.addEventListener(event, e => {
    if (isLogin && (e.type === 'touchstart' || e.pointerType === 'touch' || !matchMedia('(hover: hover)').matches)) return;
    const link = e.target.closest('[data-warm-entry],#auth-guest');
    if (link) void warm(link.getAttribute('href') || './');
  }, {passive:true});
  const whenIdle = callback => 'requestIdleCallback' in window ? requestIdleCallback(callback, {timeout:2500}) : setTimeout(callback, 800);
  if (!isLogin) window.addEventListener('load', () => whenIdle(() => { if (!constrained) void warm('login.html'); }), {once:true});
  for (const link of document.querySelectorAll('[data-alternate]')) if (location.hostname === 'factorlab-research.zhugeliang-7512.chatgpt.site') link.href = 'https://zhugeliang7512-eng.github.io/factorlab/research-studio/' + (isLogin ? 'login.html' : 'about.html');
  if (!isLogin && !constrained && matchMedia('(min-width:761px) and (prefers-reduced-motion:no-preference)').matches) whenIdle(() => {
    function load(name) { return new Promise((resolve,reject) => { const script = document.createElement('script'); script.src = new URL('assets/introduction/' + name, base).href; script.onload=resolve; script.onerror=reject; document.head.append(script); }); }
    load('three.min.js').then(() => load('scene.js')).then(() => window.FactorLabScene?.setPaused(document.body.classList.contains('motion-paused'))).catch(() => {});
  });
})();
