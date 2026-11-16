(function () {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const constrained = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
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
    const link = e.target.closest('[data-warm-entry],#auth-guest');
    if (link) void warm(link.getAttribute('href') || './');
  }, {passive:true});
  const isLogin = /\/login(?:\.html)?$/.test(location.pathname);
  const whenIdle = callback => 'requestIdleCallback' in window ? requestIdleCallback(callback, {timeout:2500}) : setTimeout(callback, 800);
  window.addEventListener('load', () => whenIdle(() => { if (!constrained) void warm(isLogin ? './' : 'login.html'); }), {once:true});
  for (const link of document.querySelectorAll('[data-alternate]')) if (location.hostname === 'factorlab-research.zhugeliang-7512.chatgpt.site') link.href = 'https://zhugeliang7512-eng.github.io/factorlab/research-studio/' + (isLogin ? 'login.html' : 'about.html');
  if (!isLogin && !constrained && matchMedia('(min-width:761px) and (prefers-reduced-motion:no-preference)').matches) whenIdle(() => {
    function load(name) { return new Promise((resolve,reject) => { const script = document.createElement('script'); script.src = new URL('assets/introduction/' + name, base).href; script.onload=resolve; script.onerror=reject; document.head.append(script); }); }
    load('three.min.js').then(() => load('scene.js')).then(() => window.FactorLabScene?.setPaused(document.body.classList.contains('motion-paused'))).catch(() => {});
  });
})();
