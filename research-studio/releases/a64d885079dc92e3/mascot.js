(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactorMascot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const actions = Object.freeze({ idle: 1, welcome: 2, thinking: 3, success: 4, growth: 4, milestone: 5, caution: 6 });
  const validId = id => (typeof id === 'string' && id.length > 0 && id.length <= 160) || (typeof id === 'number' && Number.isSafeInteger(id));

  function createController(options = {}) {
    const now = options.now || Date.now, later = options.setTimeout || setTimeout, cancel = options.clearTimeout || clearTimeout;
    const random = options.random || Math.random, onChange = options.onChange || (() => {});
    const context = options.context || 'login', seen = new Map(), requests = new Map();
    let active = null, token = 0, timer = null, latestRequest = null, busy = false, welcomeAt = -Infinity;
    let visible = options.visible !== false, enabled = options.enabled !== false, reduced = !!options.reducedMotion;
    let editing = false, failed = false, destroyed = false;
    const blocked = () => destroyed || !visible || !enabled || reduced || editing || failed;
    const snapshot = () => Object.freeze({ state: active?.state || 'static', token, video: active && active.state !== 'caution' ? active.state + '.mp4' : null, busyRequestId: busy ? latestRequest : null, blocked: blocked(), editing, visible, enabled, reducedMotion: reduced, failed, destroyed });
    function publish() { try { onChange(snapshot()); } catch {} }
    function clearTimer() { if (timer !== null) cancel(timer); timer = null; }
    function remember(map, key, value) {
      map.set(key, value);
      if (map.size > 256) map.delete(map.keys().next().value);
    }
    function schedule(delay, fn) { clearTimer(); timer = later(() => { timer = null; if (!destroyed) fn(); }, delay); }
    function rest() {
      clearTimer();
      if (active) { active = null; token++; }
      publish();
      if (blocked()) return;
      if (busy) schedule(700, () => { if (!blocked() && busy) start('thinking', latestRequest); });
      else if (context === 'login') schedule(12000 + Math.round(Math.max(0, Math.min(1, random())) * 8000), () => { if (!blocked() && !busy) start('idle'); });
    }
    function start(state, requestId) {
      clearTimer(); active = { state, requestId }; token++;
      const current = token;
      publish();
      if (active && token === current && !blocked()) schedule(state === 'caution' ? 1200 : 5000, () => state === 'caution' ? finish(current) : fail(current));
    }
    function finish(current) {
      if (destroyed || !active || current !== token) return false;
      rest(); return true;
    }
    function fail(current) {
      if (destroyed || !active || current !== token) return false;
      failed = true; rest(); return true;
    }
    function emit(state, event = {}) {
      if (destroyed || !Object.hasOwn(actions, state) || state === 'thinking') return false;
      if (event.requestId !== undefined && event.requestId !== latestRequest) return false;
      if (event.id !== undefined) {
        if (!validId(event.id) || (seen.get(event.id) || 0) >= actions[state]) return false;
        remember(seen, event.id, actions[state]);
      }
      if (blocked() || (active && actions[active.state] >= actions[state])) return false;
      if (state === 'welcome' && now() - welcomeAt < 5000) return false;
      if (state === 'welcome') welcomeAt = now();
      start(state, event.requestId); return true;
    }
    function setBusy(id, value) {
      if (destroyed || !validId(id)) return false;
      if (value) {
        if (requests.has(id)) return false;
        remember(requests, id, true); latestRequest = id; busy = true;
        if (active?.state === 'thinking' || (active?.requestId !== undefined && active.requestId !== id)) { clearTimer(); active = null; token++; }
        if (!blocked() && (!active || actions[active.state] < actions.thinking)) start('thinking', id);
        else publish();
      } else {
        if (!busy || id !== latestRequest) return false;
        busy = false;
        if (!active || active.state === 'thinking') rest(); else publish();
      }
      return true;
    }
    function setRestriction(key, value) {
      if (destroyed) return;
      const current = key === 'editing' ? editing : key === 'visible' ? visible : key === 'enabled' ? enabled : reduced;
      value = !!value; if (current === value) return;
      if (key === 'editing') editing = value;
      else if (key === 'visible') visible = value;
      else if (key === 'enabled') enabled = value;
      else reduced = value;
      rest();
    }
    const api = {
      emit, setBusy, finish, fail, getState: snapshot,
      setEditing: value => setRestriction('editing', value),
      setVisible: value => setRestriction('visible', value),
      setEnabled: value => setRestriction('enabled', value),
      setReducedMotion: value => setRestriction('reduced', value),
      destroy() { if (!destroyed) { destroyed = true; busy = false; rest(); seen.clear(); requests.clear(); } }
    };
    rest();
    return api;
  }

  const words = {
    'zh-CN': { greet: '向研究伙伴打招呼', static: '研究助手', idle: '慢慢来，先看证据', welcome: '欢迎回来', thinking: '正在核对信息', success: '操作已完成', growth: '本轮资产增长', milestone: '研究里程碑已完成', caution: '请核对风险与证据', failed: '研究伙伴 · 静态显示' },
    en: { greet: 'Greet your research companion', static: 'Research companion', idle: 'Take your time. Check the evidence.', welcome: 'Welcome back', thinking: 'Checking information', success: 'Action completed', growth: 'Portfolio grew this round', milestone: 'Research milestone completed', caution: 'Review the risks and evidence', failed: 'Research companion · Still image' }
  };
  const mounted = new WeakMap(), instances = new Set();
  let motionEnabled = true;

  function mount(host, options = {}) {
    if (!host?.ownerDocument) throw TypeError('A mascot host element is required');
    const existing = mounted.get(host);
    if (existing) { if (options.language) existing.setLanguage(options.language); return existing; }
    const doc = host.ownerDocument, view = doc.defaultView;
    const scope = options.focusRoot || host.closest('dialog') || host.parentElement;
    const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
    const removers = [];
    let language = options.language === 'en' ? 'en' : 'zh-CN', controller, latest, renderedToken = -1;
    let visible = options.visible !== false, pageVisible = true, manuallyEditing = false, composing = false, destroyed = false;
    let stopMedia = () => {}, cautionAnimation = null;
    const base = new URL(options.assetBase || 'releases/a64d885079dc92e3/assets/mascot/', doc.baseURI).href.replace(/\/?$/, '/');
    const button = doc.createElement('button'), stage = doc.createElement('span');
    const poster = doc.createElement('img'), video = doc.createElement('video'), marker = doc.createElement('span'), caption = doc.createElement('p');
    host.classList.add('factor-mascot'); host.dataset.context = options.context || 'login';
    button.className = 'mascot-greet'; button.type = 'button'; stage.className = 'mascot-stage';
    poster.className = 'mascot-poster'; poster.src = base + 'poster.png'; poster.alt = ''; poster.decoding = 'async';
    video.className = 'mascot-video'; video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.loop = false; video.preload = 'none'; video.hidden = true; video.poster = poster.src;
    video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1'); video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    marker.className = 'mascot-caution'; marker.textContent = '!'; marker.hidden = true; marker.setAttribute('aria-hidden', 'true');
    caption.className = 'mascot-caption'; caption.setAttribute('aria-live', 'off');
    stage.append(poster, video, marker); button.append(stage); host.replaceChildren(button, caption);
    function listen(target, name, listener) {
      if (!target?.addEventListener) return;
      target.addEventListener(name, listener); removers.push(() => target.removeEventListener(name, listener));
    }
    function label() {
      const text = words[language]; button.setAttribute('aria-label', text.greet);
      caption.textContent = text[latest?.failed ? 'failed' : latest?.state === 'static' && latest.busyRequestId !== null ? 'thinking' : latest?.state || 'static'];
      host.lang = language;
    }
    function stop() {
      stopMedia(); stopMedia = () => {};
      cautionAnimation?.cancel(); cautionAnimation = null;
      for (const animation of host.getAnimations?.({ subtree: true }) || []) animation.cancel();
      video.pause(); video.hidden = true; poster.hidden = false; marker.hidden = true;
      if (video.getAttribute('src') || video.src) { video.removeAttribute('src'); try { video.load(); } catch {} }
    }
    function render(state) {
      latest = state; host.dataset.state = state.state; host.dataset.blocked = String(state.blocked);
      host.dataset.editing = String(state.editing); label();
      if (state.token === renderedToken) { if (state.blocked) stop(); return; }
      renderedToken = state.token; stop();
      if (state.destroyed || state.blocked || state.state === 'static') return;
      if (state.state === 'caution') {
        marker.hidden = false;
        cautionAnimation = stage.animate?.([{ boxShadow: '0 0 0 0 rgba(184,188,195,0)' }, { boxShadow: '0 0 0 4px rgba(184,188,195,.45)', offset: .4 }, { boxShadow: '0 0 0 0 rgba(184,188,195,0)' }], { duration: 1200, iterations: 1 });
        return;
      }
      const current = state.token;
      const active = () => !destroyed && controller?.getState().token === current;
      const playing = () => { if (active()) { video.hidden = false; poster.hidden = true; } };
      const ended = () => { if (active()) controller.finish(current); };
      const error = () => { if (active()) controller.fail(current); };
      video.addEventListener('playing', playing); video.addEventListener('ended', ended); video.addEventListener('error', error);
      stopMedia = () => { video.removeEventListener('playing', playing); video.removeEventListener('ended', ended); video.removeEventListener('error', error); };
      video.src = base + state.video;
      try { Promise.resolve(video.play()).catch(error); } catch { error(); }
    }
    controller = createController({
      context: options.context, visible: visible && !doc.hidden, enabled: motionEnabled && options.enabled !== false,
      reducedMotion: !!media?.matches, now: () => view.performance?.now() ?? Date.now(),
      setTimeout: view.setTimeout.bind(view), clearTimeout: view.clearTimeout.bind(view), onChange: render
    });
    const editable = node => !!node?.matches?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]');
    function updateEditing() {
      if (destroyed) return;
      controller.setEditing(manuallyEditing || composing || (editable(doc.activeElement) && !!scope?.contains(doc.activeElement)));
    }
    function updateVisibility() { if (!destroyed) controller.setVisible(visible && pageVisible && !doc.hidden); }
    listen(button, 'click', () => controller.emit('welcome'));
    listen(scope, 'focusin', updateEditing);
    listen(scope, 'focusout', () => queueMicrotask(updateEditing));
    listen(scope, 'compositionstart', event => { if (editable(event.target)) { composing = true; updateEditing(); } });
    listen(scope, 'compositionend', () => { composing = false; updateEditing(); });
    listen(scope, 'input', updateEditing);
    listen(doc, 'visibilitychange', updateVisibility);
    listen(view, 'pagehide', () => { pageVisible = false; updateVisibility(); });
    listen(view, 'pageshow', () => { pageVisible = true; updateVisibility(); });
    if (media?.addEventListener) listen(media, 'change', () => controller.setReducedMotion(media.matches));
    else if (media?.addListener) { const changed = () => controller.setReducedMotion(media.matches); media.addListener(changed); removers.push(() => media.removeListener(changed)); }
    const api = {
      emit: controller.emit, setBusy: controller.setBusy, getState: controller.getState,
      setLanguage(value) { if (!destroyed) { language = value === 'en' ? 'en' : 'zh-CN'; label(); } },
      setEditing(value) { manuallyEditing = !!value; updateEditing(); },
      setVisible(value) { visible = !!value; updateVisibility(); },
      setEnabled(value) { controller.setEnabled(value); },
      destroy() {
        if (destroyed) return;
        destroyed = true; controller.destroy(); stop();
        for (const remove of removers.splice(0)) remove();
        host.replaceChildren(); mounted.delete(host); instances.delete(api);
      }
    };
    mounted.set(host, api); instances.add(api); updateEditing();
    return api;
  }

  return { createController, mount, getEnabled: () => motionEnabled, setEnabled(value) { motionEnabled = !!value; for (const instance of instances) instance.setEnabled(motionEnabled); } };
});
