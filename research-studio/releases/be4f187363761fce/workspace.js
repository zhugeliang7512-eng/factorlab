(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const views = ['research', 'portfolio', 'backtest', 'risk', 'journal'];
  const hashView = () => ({evidence:'research',allocation:'portfolio',review:'journal'}[location.hash.replace(/^#\/?/, '')] || location.hash.replace(/^#\/?/, ''));
  const labels = {
    'zh-CN': {
      research: ['行情与资料', ''],
      portfolio: ['配置决策', ''],
      backtest: ['因子与回测', ''],
      risk: ['风险与归因', ''],
      journal: ['决策复盘', ''],
      factorNames: ['动量', '价值', '质量', '低波动'],
      factorHelp: ['动量：过去六个月的涨跌表现', '价值：盈利相对价格的水平（E/P）', '质量：股东投入资本的盈利水平（ROE）', '低波动：过去六个月波动较小'],
      weights: '你更看重哪些选行业线索？', run: '运行回测', reset: '四因子恢复等权', pending: '偏好已更改，请重新运行回测。', applied: '36 个月回测完成', invalid: '请将至少一个因子权重设为大于 0。',
      researchNote: '这里只做研究，调整偏好不会改变持仓。', strategy: '策略收益', benchmark: '五行业等权收益', drawdown: '最大回撤', spread: '前二与后二行业的月均收益差', sampleBadge: '36 个月合成样本',
      preview: '等权示例已计算；运行回测后记录本次检验。', factorIntro: '因子是给行业打分的线索；权重越高，排序越重视它。',
      drawdownHelp: '最大回撤：资产从此前最高点下跌最多的幅度。',
      icHelp: '排序相关性越接近 1，打分高的行业随后越倾向涨得好；接近 0 表示关系弱，负值表示相反。',
      validityDetails: '查看差值与样本限制', sampleHelp: '可计算月份只表示数据足以计算，不能当作获利月份或胜率。', tuningHelp: '样本小、反复调参可能产生偶然结果。',
      macroDetails: '查看利率、需求与风险指标', noConclusion: '未披露的信息，暂不下结论。', positioning: '长期定位：你持续看好的行业；短期战术：因本轮新证据做的调整。',
      chartTitle: '36 个月合成历史', chartLabel: '事前因子策略与五行业等权基准净值', firstNav: '初始净值 1', months: '36 个月', factorValidity: '因子打分与随后收益的关系', factor: '因子', ic: '排序相关性（平均 Rank IC）', samples: '可计算月份',
      method: '查看回测规则和逐月结果', methodText: '先用 6 个月形成线索，再逐月用当时已知信息排序。前二行业各 50%，基准五行业各 20%；均每月调仓，免交易费、不加杠杆。',
      limitation: '合成回测，不证明真实市场有效。此实验每行业可达 50%、免交易费，与本轮配置规则不同。',
      month: '样本月', selected: '事前选择', monthlyStrategy: '策略收益', monthlyBenchmark: '基准收益', synthetic: '合成观测', inference: '根据证据判断',
      cycle: '周期观察', rate: '政策利率', growth: '经济增长', credit: '信用压力',
      cycleNote: '周期标签来自教学模型。',
      inferenceText: '看订单、库存和利润是否互相印证。只看价格上涨，不能确认行业复苏。',
      percent: '百分比', source: '来源与课程范围'
    },
    en: {
      research: ['Market & research', ''],
      portfolio: ['Allocation', ''],
      backtest: ['Factors & backtest', ''],
      risk: ['Risk & attribution', ''],
      journal: ['Decision review', ''],
      factorNames: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      factorHelp: ['Prior six-month cumulative return', 'Synthetic E/P known at that time', 'Synthetic ROE known at that time', 'Negative prior six-month volatility'],
      weights: 'Research factor preferences', run: 'Run backtest', reset: 'Equal weights', pending: 'Preferences changed. Run the backtest to update results.', applied: '36-month replay complete', invalid: 'At least one factor weight must be positive',
      researchNote: 'This is a method exercise. These preferences do not change holdings.', strategy: 'Strategy return', benchmark: 'Equal-sector return', drawdown: 'Maximum drawdown', spread: 'Top two minus bottom two monthly mean', sampleBadge: '36 months of synthetic samples',
      preview: 'Equal-weight example calculated; run a backtest to record your test.', factorIntro: 'Factors are clues used to score sectors. A higher weight gives a clue more influence.',
      drawdownHelp: 'Maximum drawdown is the largest decline from an earlier asset peak.',
      icHelp: 'Closer to 1 means higher-scored sectors tended to have higher subsequent returns; near 0 means a weak relationship, and a negative value means the reverse.',
      validityDetails: 'View spread and sample limits', sampleHelp: 'Calculable months are months with sufficient data. They are not winning months or a win rate.', tuningHelp: 'Small samples and repeated tuning can produce chance results.',
      macroDetails: 'View rates, demand and risk indicators', noConclusion: 'Do not conclude from information that has not been disclosed.', positioning: 'Long-term positioning is the sector case you maintain; short-term tactics are changes based on new evidence this round.',
      chartTitle: '36 months of synthetic history', chartLabel: 'Prior-information factor strategy versus equal-sector benchmark NAV', firstNav: 'Initial NAV 1', months: '36 months', factorValidity: 'Factor validity', factor: 'Factor', ic: 'Mean Rank IC', samples: 'Valid months',
      method: 'Method and monthly records', methodText: 'After six warm-up months, rank only information known at each decision time. The top two sectors receive 50% each. The benchmark holds 20% in each sector. Both rebalance monthly with zero costs and no leverage.',
      limitation: 'All history is synthetic. Small samples and repeated tuning cannot establish real-world validity. This method exercise differs from the simulation’s 40% sector cap and trading costs.',
      month: 'Month', selected: 'Prior selection', monthlyStrategy: 'Strategy return', monthlyBenchmark: 'Benchmark return', synthetic: 'Synthetic observation', inference: 'Interpretation',
      cycle: 'Macro conditions and sector judgment', rate: 'Policy rate', growth: 'Economic growth', credit: 'Credit pressure',
      cycleNote: 'The cycle label is produced by a teaching model. It is not a real-market assessment.',
      inferenceText: 'Check orders, inventories and earnings. Rising prices alone do not establish recovery.',
      percent: 'percent', source: 'Sources and course scope'
    }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selectedEvidenceTab = 'market';
  let current = 'research', desired = current, phase = null, lang = 'zh-CN', initialized = false;
  let transition = null, settled = Promise.resolve(), preferences = [25, 25, 25, 25], researchResult = null, researchLanguage = null, researchDirty = false, researchRun = false;
  let resultPreferences = [25, 25, 25, 25], researchEfficacy = false, researchIdentity = null;
  const researchIds = ['Momentum', 'Value', 'Quality', 'LowVol'];
  const executionIds = {Momentum:'momentum', Value:'value', Quality:'quality', LowVol:'lowVol'};
  let researchChartSize = '';
  const researchChartObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => renderResearchChart()) : null;
  const text = () => labels[lang];
  const numeric = (value, digits = 2) => Number.isFinite(value) ? (Math.abs(value) < .5 * 10 ** -digits ? 0 : value).toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
  const pct = value => Number.isFinite(value) ? numeric(value * 100) + '%' : '—';

  function getResearchProgress() {
    return {hasRun:researchRun,dirty:researchDirty,hasEfficacy:researchEfficacy,preferences:[...preferences],resultPreferences:[...resultPreferences]};
  }
  function getResearch() {
    if (!researchResult && researchRun && window.InvestigationResearch) {
      researchResult = window.InvestigationResearch.analyze(Object.fromEntries(researchIds.map((id,i)=>[id,resultPreferences[i]])));
    }
    return researchResult;
  }
  function saveResearchProgress() {
    window.FactorLabApp?.setResearchProgress?.(getResearchProgress());
    renderHandoff();
  }
  function restoreResearchProgress() {
    const progress = window.FactorLabApp?.getUI().researchProgress || {};
    const valid = value => Array.isArray(value) && value.length === 4 && value.every(v=>Number.isFinite(v) && v >= 0 && v <= 100);
    preferences = valid(progress.preferences) ? [...progress.preferences] : [25,25,25,25];
    resultPreferences = valid(progress.resultPreferences) && progress.resultPreferences.some(v=>v>0) ? [...progress.resultPreferences] : [25,25,25,25];
    researchRun = progress.hasRun === true;
    researchDirty = progress.dirty === true || preferences.some((value,i)=>value !== resultPreferences[i]);
    researchEfficacy = progress.hasEfficacy === true && researchRun && !researchDirty;
    researchResult = null; researchLanguage = null;
    renderHandoff();
    if (current === 'backtest') renderResearch(true);
  }
  function renderHandoff() {
    const app = window.FactorLabApp, host = $('view-portfolio'); if (!host || !app) return;
    let root = $('allocation-handoff');
    if (!root) { root = document.createElement('details'); root.id = 'allocation-handoff'; root.className = 'allocation-handoff panel'; host.appendChild(root); }
    const en = lang === 'en', t = text(), ui = app.getUI();
    const status = !researchRun ? (en ? 'Not yet tested with your own backtest.' : '尚未运行自己的回测。') : researchDirty ? (en ? 'Preferences changed; displayed results are from the previous run.' : '偏好已更改；当前显示的是上次回测结果。') : (en ? 'Current preferences have a recorded synthetic backtest.' : '当前偏好已完成合成回测。');
    const summary = preferences.map((value,i)=>t.factorNames[i] + ' ' + value).join(en ? ' / ' : ' · ');
    const disabled = app.getState().phase !== 'decision' || ui.busy || !preferences.some(v=>v>0);
    const html = `<summary>${en ? 'Use factor preferences' : '按因子偏好配置'}</summary><a href="#/backtest" data-open-view="backtest">${en ? 'Edit factors' : '调整因子'}</a><p class="handoff-factors">${esc(summary)}</p><p id="handoff-status" role="status">${esc(status)}</p><p class="footnote">${en ? 'Research uses monthly top-two sectors at 50% each with no fees. Execution keeps your cash, caps each sector at 40% and charges trading costs. A draft remains editable until you confirm.' : '研究回测每月选前二行业、各占 50%、免交易费；本轮配置保留现金、单行业上限 40%，并计交易费。生成后仍是草案，须由你确认。'}</p><button id="apply-research-draft" class="secondary" ${disabled ? 'disabled' : ''}>${en ? 'Generate allocation draft from these factors' : '按这些因子生成配置草案'}</button>`;
    if (root.innerHTML === html) return;
    root.innerHTML = html;
    $('apply-research-draft').addEventListener('click',()=>{
      const factors = Object.fromEntries(researchIds.map((id,i)=>[executionIds[id],preferences[i]]));
      app.applyResearchDraft(factors);
    });
  }

  function animateSurface(root) {
    if (window.FactorExperience) return window.FactorExperience.surface(root);
    if (reduced() || !root || !window.Motion?.animate) return;
    const targets = [...root.querySelectorAll('.panel, .review-card, .backtest-controls, .backtest-summary, .cycle-evidence, .cycle-inference')].filter(el => el.getClientRects().length);
    if (!targets.length) targets.push(root);
    try { window.Motion.animate(targets, { opacity: [0.35, 1], y: [10, 0] }, { duration: .32, delay: window.Motion.stagger ? window.Motion.stagger(.025) : 0, ease: [0.22, 1, 0.36, 1] }); } catch {}
  }

  function updateEvidenceNavigation() {
    document.querySelectorAll('#evidence-tabs button').forEach(button => {
      const selected = current === 'backtest' ? button.dataset.openView === 'backtest' : current === 'research' && button.dataset.evidenceTab === selectedEvidenceTab;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
  }
  function setEvidenceTab(tab) {
    if (['market', 'options', 'fundamentals', 'news'].includes(tab)) selectedEvidenceTab = tab;
    updateEvidenceNavigation();
  }

  function updateLabels() {
    const t = text();
    if ($('view-title')) $('view-title').textContent = t[current][0];
    if ($('view-description')) { $('view-description').textContent = t[current][1]; $('view-description').hidden = !t[current][1]; }
    updateEvidenceNavigation();
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === (current==='backtest'?'research':current);
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      const label = button.querySelector('[data-nav-label]');
      if (label && t[button.dataset.view]) label.textContent = t[button.dataset.view][0];
    });
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = lang === 'en' ? el.dataset.en : el.dataset.zh; });
  }

  function applyView(view, focus, historyMode = 'replace') {
    current = view;
    document.body.dataset.currentView = current;
    document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== current; });
    const market = $('shared-market');
    const host = $(current === 'risk' ? 'market-host-risk' : 'market-host-research');
    if (market && host && market.parentElement !== host) host.appendChild(market);
    if ($('evidence-tabs')) $('evidence-tabs').hidden = !['research','backtest'].includes(current);
    updateLabels();
    if (current === 'backtest') renderResearch();
    const panel = document.querySelector(`[data-view-panel="${current}"]`);
    if (panel) panel.scrollTop = 0;
    if (window.scrollY) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (focus && $('view-title')) { $('view-title').setAttribute('tabindex', '-1'); $('view-title').focus({ preventScroll: true }); }
    try { if (historyMode !== 'none' && location.hash !== '#/' + current) history[historyMode === 'push' ? 'pushState' : 'replaceState'](null, '', '#/' + current); } catch {}
    document.dispatchEvent(new CustomEvent('factorlab:view', { detail: { view: current } }));
  }

  function go(view, options = {}) {
    if (!views.includes(view)) return settled;
    desired = view;
    const focus = options.focus === true;
    if (current === view && !transition) { if (location.hash !== '#/' + view) applyView(view, focus, options.history || 'push'); else updateLabels(); return settled; }
    if (transition) { transition.skipTransition(); return settled.then(() => go(desired, options)); }
    const apply = () => applyView(desired, focus, options.history || 'push');
    if (!reduced() && typeof document.startViewTransition === 'function' && options.animate !== false) {
      transition = document.startViewTransition(apply);
      settled = transition.finished.catch(() => {}).then(() => { transition = null; });
    } else {
      apply();
      if (options.animate !== false) animateSurface(document.querySelector(`[data-view-panel="${current}"]`));
      settled = Promise.resolve();
    }
    return settled;
  }

  function researchChart(result, width, height) {
    const t = text(), left = 56, right = 20, top = 22, bottom = 32;
    const values = result.strategy.nav.concat(result.benchmark.nav);
    let min = Math.min(...values), max = Math.max(...values);
    const pad = Math.max(.035, (max - min) * .12); min -= pad; max += pad;
    const y = value => top + (max - value) / (max - min) * (height - top - bottom);
    const points = values => values.map((value, i) => `${left + i / 36 * (width - left - right)},${y(value)}`).join(' ');
    const grid = [0, 1, 2].map(i => { const value = min + (max - min) * i / 2, yy = y(value); return `<line x1="${left}" x2="${width-right}" y1="${yy}" y2="${yy}" stroke="#444953"/><text x="${left-10}" y="${yy+5}" fill="#b8bcc3" font-size="14" text-anchor="end">${numeric(value)}</text>`; }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t.chartLabel)}" xmlns="http://www.w3.org/2000/svg">${grid}<polyline data-series="benchmarkNav" points="${points(result.benchmark.nav)}" stroke="#b8bcc3" stroke-width="2" stroke-dasharray="6 5" fill="none"/><polyline data-series="nav" points="${points(result.strategy.nav)}" stroke="#a8bfdb" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/><text x="${left}" y="${height-5}" fill="#b8bcc3" font-size="14">${esc(t.firstNav)}</text><text x="${width-right}" y="${height-5}" fill="#b8bcc3" font-size="14" text-anchor="end">${esc(t.months)}</text></svg>`;
  }

  function renderResearchChart(force = false) {
    const host = $('backtest-content')?.querySelector('.backtest-chart');
    if (!host || !researchResult || !host.getClientRects().length || !host.clientWidth || !host.clientHeight) return;
    const size = host.clientWidth + 'x' + host.clientHeight;
    if (!force && researchChartSize === size) return;
    FactorVisuals.chart(host,{rows:researchResult.strategy.nav.map((nav,i)=>({nav,benchmarkNav:researchResult.benchmark.nav[i],month:i})),series:[{key:'benchmarkNav',name:text().benchmark,color:'#54534e',dash:true},{key:'nav',name:text().strategy,color:'#814d68'}],label:text().chartLabel,format:v=>numeric(v,2),xLabel:r=>(lang==='en'?'Month ':'样本月 ')+(r?.month||0)});
    researchChartSize=size;
  }

  function renderResearch(force = false) {
    const root = $('backtest-content'), R = window.InvestigationResearch;
    if (!root || !R) return;
    if (researchResult && researchLanguage === lang && !force) return;
    const focusedControl = root.contains(document.activeElement) ? document.activeElement.id : null;
    const t = text();
    if (!researchResult) researchResult = R.analyze(Object.fromEntries(researchIds.map((id,i)=>[id,resultPreferences[i]])));
    researchLanguage = lang;
    const a = researchResult, sectorName = id => {
      const index = R.SECTORS.findIndex(sector => sector.id === id);
      return lang === 'en' ? ['Semiconductors', 'Robotics', 'Advanced materials', 'Clean energy', 'AI infrastructure'][index] : R.SECTORS[index]?.name || id;
    };
    const stats = [[t.strategy, pct(a.strategy.totalReturn)], [t.benchmark, pct(a.benchmark.totalReturn)], [t.drawdown, pct(a.strategy.maxDrawdown)]];
    researchChartObserver?.disconnect();
    researchChartSize = '';
    root.innerHTML = `<div class="backtest-layout"><section class="backtest-controls panel"><div class="panel-head"><h2>${esc(t.weights)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><p class="footnote">${esc(t.factorIntro)}</p>${preferences.map((value, i) => `<div class="backtest-factor"><label for="research-weight-${i}">${esc(t.factorNames[i])}</label><output id="research-output-${i}" for="research-weight-${i}">${value}</output><input id="research-weight-${i}" data-research-factor="${i}" type="range" min="0" max="100" step="5" value="${value}" aria-label="${esc(t.factorNames[i])}"><small>${esc(t.factorHelp[i])}</small></div>`).join('')}<div class="backtest-actions"><button id="run-backtest" class="primary">${esc(t.run)}</button><button id="reset-backtest">${esc(t.reset)}</button></div><p class="backtest-status" id="backtest-status" role="status">${esc(t.applied)}</p><p class="footnote">${esc(t.researchNote)}</p></section><div class="backtest-results"><section class="backtest-summary">${stats.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong>${label === t.drawdown ? `<small>${esc(t.drawdownHelp)}</small>` : ''}</div>`).join('')}</section><section class="panel"><div class="panel-head"><h2>${esc(t.chartTitle)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><div class="backtest-chart"></div><div class="chart-legend"><span class="legend portfolio-line">${esc(t.strategy)}</span><span class="legend benchmark-line">${esc(t.benchmark)}</span></div></section><section class="panel factor-validity"><h2>${esc(t.factorValidity)}</h2><p class="footnote">${esc(t.icHelp)}</p><table><thead><tr><th>${esc(t.factor)}</th><th>${esc(t.ic)}</th><th>${esc(t.samples)}</th></tr></thead><tbody>${a.factors.map((factor, i) => `<tr><td>${esc(t.factorNames[i])}</td><td>${numeric(factor.meanIC, 3)}</td><td>${factor.validMonths} / ${a.sampleCount}</td></tr>`).join('')}</tbody></table><p class="footnote">${esc(t.limitation)}</p><details class="factor-sample-details"><summary>${esc(t.validityDetails)}</summary><p>${esc(t.spread)}: <strong>${numeric(a.meanSpread * 100, 3)} ${lang === 'en' ? 'percentage points' : '个百分点'}</strong></p><p>${esc(t.sampleHelp)}</p><p>${esc(t.tuningHelp)}</p></details></section></div></div><details class="backtest-method"><summary>${esc(t.method)}</summary><p>${esc(t.methodText)}</p><div class="backtest-months"><table><thead><tr><th>${esc(t.month)}</th><th>${esc(t.selected)}</th><th>${esc(t.monthlyStrategy)}</th><th>${esc(t.monthlyBenchmark)}</th></tr></thead><tbody>${a.months.map((month, i) => `<tr><td>${i+1}</td><td>${esc(month.top.map(sectorName).join(lang === 'en' ? ' / ' : '、'))}</td><td>${pct(month.strategyReturn)}</td><td>${pct(month.benchmarkReturn)}</td></tr>`).join('')}</tbody></table></div></details>`;
    renderResearchChart(true);
    if (researchChartObserver) researchChartObserver.observe(root.querySelector('.backtest-chart'));
    root.querySelectorAll('[data-research-factor]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.researchFactor); preferences[i] = Number(input.value); researchDirty = true; researchEfficacy = false;
      $('research-output-' + i).textContent = input.value;
      $('backtest-status').textContent = t.pending;
      const stale = root.querySelector('.backtest-stale'); if (stale) stale.hidden = false;
      saveResearchProgress();
    }));
    $('run-backtest').addEventListener('click', () => {
      try {
        researchResult = R.analyze(Object.fromEntries(researchIds.map((id, i) => [id, preferences[i]]))); resultPreferences = [...preferences]; researchDirty = false; researchRun = true; researchEfficacy = false;
        saveResearchProgress();
        renderResearch(true); animateSurface(root);
        document.dispatchEvent(new CustomEvent('factorlab:feedback', {detail:{kind:'backtest', stage:'success'}}));
      } catch { $('backtest-status').textContent = t.invalid; }
    });
    $('reset-backtest').addEventListener('click', () => { preferences = [25, 25, 25, 25]; researchDirty = true; researchEfficacy = false; saveResearchProgress(); renderResearch(true); animateSurface(root); });
    const stale = document.createElement('p'); stale.className = 'backtest-stale footnote'; stale.hidden = !researchDirty;
    stale.textContent = lang === 'en' ? 'These results use the previous factor preferences. Run the backtest again to test the changed preferences.' : '下方仍为上次偏好的结果。重新运行回测，才能检验刚修改的偏好。';
    root.querySelector('.backtest-results').prepend(stale);
    root.querySelector('.factor-sample-details').addEventListener('toggle',event=>{
      if (event.target.open && researchRun && !researchDirty && !researchEfficacy) { researchEfficacy = true; saveResearchProgress(); }
    });
    $('backtest-status').textContent = researchDirty ? t.pending : researchRun ? t.applied : t.preview;
    if (focusedControl && $(focusedControl)?.getClientRects().length) $(focusedControl).focus({ preventScroll: true });
  }

  function renderCycle(state) {
    const root = $('cycle-notes'); if (!root) return;
    const t = text(), macro = state.macro, wasOpen = root.querySelector('details')?.open;
    root.innerHTML = `<details class="cycle-evidence" ${wasOpen ? 'open' : ''}><summary>${esc(t.macroDetails)}</summary><span class="source-tag" title="${esc(t.cycleNote)}">${esc(t.synthetic)}</span><div class="cycle-row"><span>${esc(t.rate)} <strong>${numeric(macro.rate, 1)}%</strong></span><span>${esc(t.growth)} <strong>${numeric(macro.growth, 1)}%</strong></span><span>${esc(t.credit)} <strong>${numeric(macro.credit, 0)} / 100</strong></span></div><p class="footnote">${esc(t.positioning)}</p><p>${esc(t.inferenceText)}</p></details>`;
  }

  function sync() {
    const app = window.FactorLabApp; if (!app) return;
    const ui = app.getUI(), state = app.getState(), nextLang = ui.lang;
    const changedLanguage = nextLang !== lang;
    lang = nextLang;
    const identity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (researchIdentity !== identity) { researchIdentity = identity; restoreResearchProgress(); }
    updateLabels(); renderCycle(state);
    renderHandoff();
    if (changedLanguage && current === 'backtest') renderResearch(true);
    if (!initialized) {
      initialized = true; phase = state.phase;
      const requested = hashView();
      const initial = views.includes(requested) ? requested : ['review', 'complete'].includes(phase) ? 'journal' : phase === 'event' ? 'research' : 'portfolio';
      applyView(initial, false);
      animateSurface(document.querySelector(`[data-view-panel="${current}"]`));
      return;
    }
    if (state.phase !== phase) {
      const previous = phase; phase = state.phase;
      if (['review', 'complete'].includes(phase)) go('journal', { focus: true });
      else if (phase === 'event') go('research', { focus: true });
      else if (phase === 'simulating') go('portfolio', { focus: true });
      else if (phase === 'decision' && previous !== null) go('portfolio', { focus: true });
    }
  }

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => go(button.dataset.view, { focus: true })));
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-open-view]');
    if (action) { event.preventDefault(); go(action.dataset.openView, { focus: true }); }
  });
  window.addEventListener('hashchange', () => { const requested = hashView(); if (views.includes(requested)) go(requested, {history:'none'}); });
  for (const [openId, closeId, dialogId] of [['open-coach', 'close-coach', 'coach-drawer'], ['open-context', 'close-context', 'course-context']]) {
    $(openId)?.addEventListener('click', () => { document.dispatchEvent(new Event('factorlab:pause')); const dialog = $(dialogId); if(dialogId==='coach-drawer'){window.FactorLabStudio?.openChat();}else dialog.showModal(); animateSurface(dialog); });
    $(closeId)?.addEventListener('click', () => $(dialogId).close());
  }
  document.addEventListener('toggle', event => { if (event.target instanceof HTMLDetailsElement && event.target.open) animateSurface(event.target); }, true);
  document.addEventListener('factorlab:render', sync);
  document.addEventListener('factorlab:view', () => renderResearchChart());
  document.addEventListener('factorlab:profile', restoreResearchProgress);
  document.addEventListener('factorlab:restore', restoreResearchProgress);
  document.addEventListener('factorlab:new', restoreResearchProgress);
  if (!researchChartObserver) window.addEventListener('resize', () => renderResearchChart());
  window.FactorLabWorkspace = { go, setEvidenceTab, getView: () => current, get settled() { return settled; }, getResearch, getResearchStatus: getResearchProgress, getResearchProgress };
  sync();
})();
