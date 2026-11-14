(function () {
  'use strict';
  const started = Date.now();
  let failed = false, done = false, panel;
  const isLogin = /\/login(?:\.html)?$/.test(location.pathname);
  const ready = () => isLogin ? window.FactorLabAuth?.ready : window.FactorLabAccounts?.ready && !document.documentElement.hasAttribute('data-auth-pending');
  const alternate = location.hostname === 'factorlab-research.zhugeliang-7512.chatgpt.site'
    ? 'https://zhugeliang7512-eng.github.io/factorlab/research-studio/'
    : 'https://factorlab-research.zhugeliang-7512.chatgpt.site/research-studio/';
  function show() {
    if (done || panel || !document.body) return;
    panel = document.createElement('section');
    panel.id = 'startup-recovery';
    panel.setAttribute('role', 'status');
    panel.style.cssText = 'position:fixed;z-index:20000;bottom:16px;left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 32px));box-sizing:border-box;padding:18px;background:#faf9f6;color:#252523;border:1px solid #d8d7d1;border-radius:12px;box-shadow:0 8px 30px #0002;font:14px/1.6 system-ui';
    panel.style.setProperty('display', 'block', 'important');
    panel.style.setProperty('visibility', 'visible', 'important');
    const title = document.createElement('strong');
    title.textContent = '连接较慢或部分内容未载入 / Loading interrupted';
    const note = document.createElement('p');
    note.textContent = '可重试加载，已有浏览器进度会保留。备用站点的浏览器存档独立。';
    const links = document.createElement('div');
    links.style.cssText = 'display:flex;gap:10px 20px;flex-wrap:wrap';
    const retry = new URL(location.href); retry.searchParams.set('retry', String(Date.now()));
    for (const [label, href] of [['重试 / Retry', retry.href], ['访客进入 / Guest', './?guest=1#/research'], ['项目介绍 / About', 'about.html'], ['备用站点 / Alternative', alternate + (isLogin ? 'login.html' : '?guest=1#/research')]]) {
      const link = document.createElement('a'); link.textContent = label; link.href = href;
      link.style.cssText = 'color:#814d68;min-height:36px;display:inline-flex;align-items:center;text-underline-offset:4px';
      links.append(link);
    }
    panel.append(title, note, links); document.body.append(panel);
  }
  window.addEventListener('error', event => {
    if (!done && (event.target?.tagName === 'SCRIPT' || event.target?.tagName === 'LINK' || event.error)) { failed = true; show(); }
  }, true);
  const timer = setInterval(() => {
    if (ready()) { done = true; clearInterval(timer); panel?.remove(); }
    else if (failed || Date.now() - started > 8000) show();
  }, 200);
  window.addEventListener('pagehide', () => clearInterval(timer), {once:true});
})();
