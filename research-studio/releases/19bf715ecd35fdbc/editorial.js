(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const palette = $('command-palette'), query = $('command-query'), results = $('command-results');
  const en = () => document.documentElement.lang === 'en';
  const routes = [
    ['research','行情与证据','Market & evidence'], ['backtest','因子与回测','Factors & backtest'],
    ['portfolio','配置决策','Allocation'], ['risk','风险与归因','Risk & attribution'], ['journal','决策复盘','Decision review']
  ];
  let opener;
  function ask(question) {
    const studio = window.FactorLabStudio;
    if (!studio || !question) return;
    studio.openChat();
    const input = $('question');
    input.value = question;
    input.dispatchEvent(new Event('input', {bubbles:true}));
    if (!$('ask').disabled) $('coach-form').requestSubmit();
    else input.focus({preventScroll:true});
  }
  function addResult(label, action) {
    const row = document.createElement('button');
    row.type = 'button';
    row.textContent = label;
    row.addEventListener('click', () => { palette.close(); action(); });
    results.append(row);
  }
  function filter() {
    const term = query.value.trim(), search = term.toLowerCase();
    results.replaceChildren();
    for (const route of routes.filter(r => r.some(s => s.toLowerCase().includes(search)))) {
      addResult(route[en() ? 2 : 1], () => {
        if (route[0] === 'research') window.FactorLabWorkspace.setEvidenceTab('market');
        void window.FactorLabWorkspace.go(route[0], {focus:true});
      });
    }
    if (term) addResult((en() ? 'Ask the research partner · ' : '问研究伴侣 · ') + term, () => ask(term));
  }
  function open() {
    if (document.documentElement.hasAttribute('data-auth-pending')) return;
    if (palette.open) { palette.close(); return; }
    if (document.querySelector('dialog[open]:not(#coach-drawer)')) return;
    opener = document.activeElement;
    if ($('coach-drawer').open) { $('coach-drawer').close(); opener = $('open-coach'); }
    query.value = '';
    query.placeholder = en() ? 'Find a page or ask a question' : '查找页面，或输入问题';
    filter(); palette.showModal(); query.focus();
  }
  $('open-commands').onclick = open;
  $('open-commands').querySelector('kbd').textContent = /Mac|iPad|iPhone/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  $('command-close').onclick = () => palette.close();
  palette.addEventListener('close', () => {
    if ((!document.activeElement || document.activeElement === document.body) && opener?.isConnected) opener.focus({preventScroll:true});
  });
  query.addEventListener('input', filter);
  palette.addEventListener('keydown', e => {
    if (e.isComposing) return;
    if (e.key === 'Enter' && e.target === query) { e.preventDefault(); results.firstElementChild?.click(); return; }
    if (!['ArrowDown','ArrowUp'].includes(e.key)) return;
    const options = [...results.children];
    if (!options.length) return;
    const current = options.indexOf(document.activeElement);
    const next = current < 0 ? (e.key === 'ArrowDown' ? 0 : options.length-1) : (current + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    e.preventDefault(); options[next].focus();
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing && e.key.toLowerCase() === 'k') {
      e.preventDefault(); if (!e.repeat) open();
    }
  });
  document.addEventListener('click', e => {
    const trigger = e.target.closest('button[data-explain-metric]');
    if (trigger) ask(trigger.dataset.explainMetric);
  });
  const values = new WeakMap();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function number(node, value, format) {
    const last = values.get(node);
    if (last?.target === value && last.lang === document.documentElement.lang) return;
    if (last?.frame) cancelAnimationFrame(last.frame);
    const next = {target:value, current:value, lang:document.documentElement.lang, frame:0};
    values.set(node,next);
    if (!last || !Number.isFinite(value) || !Number.isFinite(last.current) || reduced.matches || document.hidden) {
      node.textContent = format(value); return;
    }
    const start = performance.now(), from = last.current;
    function step(now) {
      const p = reduced.matches ? 1 : Math.min(1, (now-start)/180);
      next.current = p === 1 ? value : value + (from-value)*(1-p)**3;
      node.textContent = format(next.current);
      if (p<1 && node.isConnected) next.frame = requestAnimationFrame(step);
    }
    next.frame = requestAnimationFrame(step);
  }
  window.FactorLabEditorial = {number};
})();
