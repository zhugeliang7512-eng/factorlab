(function(){
  'use strict';
  const script = document.currentScript || document.querySelector('script[src$="enhancements.js"]');
  const base = new URL('./',script?.src || location.href), pending = new Map();
  function chartStatus(ready) {
    const state = ready ? 'ready' : 'failed';
    if (document.documentElement.dataset.charts === state) return;
    document.documentElement.dataset.charts = state;
    document.dispatchEvent(new Event(ready ? 'factorlab:charts-ready' : 'factorlab:charts-failed'));
  }
  function request(name,retry) {
    return new Promise(resolve => {
      const element = document.createElement('script');
      element.src = new URL('vendor/'+name+(retry?'?retry='+Date.now():''),base).href;
      element.async = true;
      element.onload = () => {
        if(name === 'echarts.min.js' && window.echarts) chartStatus(true);
        resolve(true);
      };
      element.onerror = () => {element.remove();resolve(retry ? false : request(name,true));};
      document.head.appendChild(element);
    });
  }
  function load(name) {
    if (pending.has(name)) return pending.get(name);
    const result = Promise.race([request(name,false),new Promise(resolve=>setTimeout(()=>resolve(false),15000))]);
    pending.set(name,result);
    return result;
  }
  let chartRequest, checkFrame = 0;
  const waiting = new Set();
  const ready = () => window.FactorLabApp && !document.documentElement.hasAttribute('data-auth-pending');
  function loadCharts() {
    if (!ready()) return Promise.resolve(false);
    if (window.echarts) { chartStatus(true); return Promise.resolve(true); }
    if (chartRequest) return chartRequest;
    intersection?.disconnect();
    waiting.clear();
    chartRequest = load('echarts.min.js').then(ok => {
      const loaded = !!(ok && window.echarts);
      chartStatus(loaded);
      return loaded;
    });
    return chartRequest;
  }
  function nearViewport(host) {
    if (!host.isConnected || host.closest('[hidden],dialog:not([open])')) return false;
    const rect = host.getBoundingClientRect();
    return rect.width>0 && rect.height>0 && rect.bottom>0 && rect.top<innerHeight && rect.left<innerWidth && rect.right>0;
  }
  function checkViewport() {
    if (!ready() || chartRequest || checkFrame) return;
    checkFrame = requestAnimationFrame(() => {
      checkFrame = 0;
      for (const host of waiting) {
        if (nearViewport(host)) { void loadCharts(); break; }
      }
    });
  }
  const intersection = typeof IntersectionObserver==='function'
    ? new IntersectionObserver(entries => {
      if (entries.some(({target,isIntersecting,intersectionRect})=>isIntersecting && intersectionRect.height>0 && intersectionRect.width>0 &&
        waiting.has(target) && target.isConnected && !target.closest('[hidden],dialog:not([open]),details:not([open])'))) void loadCharts();
    },{rootMargin:'0px'})
    : null;
  function observeChart(host) {
    if (!host || !ready() || chartRequest || window.echarts) return;
    for (const old of waiting) {
      if (!old.isConnected) { intersection?.unobserve(old); waiting.delete(old); }
    }
    if (!waiting.has(host)) { waiting.add(host); intersection?.observe(host); }
    if (!intersection) checkViewport();
  }
  function observeView() {
    if (!ready() || chartRequest || window.echarts) return;
    document.querySelectorAll('[data-view-panel]:not([hidden]) .standard-chart,[data-view-panel]:not([hidden]) .backtest-chart,[data-view-panel]:not([hidden]) #nav-chart,[data-view-panel]:not([hidden]) #money-flow,#asset-sheet[open] #asset-chart').forEach(observeChart);
  }
  const observer = new MutationObserver(observeView);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  document.addEventListener('factorlab:view', observeView);
  document.addEventListener('factorlab:render', observeView);
  document.addEventListener('toggle', observeView,true);
  if (!intersection) {
    window.addEventListener('scroll',checkViewport,{passive:true});
    window.addEventListener('resize',checkViewport);
  }
  const explicitChart = '#asset-resize,#asset-details-toggle,#market-warmup,#market-compare,#market-range,#market-instrument,#market-scope,#market-compare-instrument';
  document.addEventListener('change', e => { if (e.target.matches(explicitChart)) void loadCharts(); });
  document.addEventListener('click', e => { if (e.target.closest('#asset-resize,#asset-details-toggle')) void loadCharts(); });
  document.addEventListener('click', () => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) void load('anime.js');
  },{once:true});
  window.FactorLabEnhancements = {loadBadge:()=>load('lottie.js'),loadCharts,observeChart};
  observeView();
})();
