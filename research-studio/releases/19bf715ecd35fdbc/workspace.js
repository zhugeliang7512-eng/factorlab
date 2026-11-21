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
      weights: '因子权重', run: '运行回测', reset: '四因子恢复等权', pending: '已预览新偏好。运行回测可记录本次结果。', applied: '36 个月回测完成', invalid: '请将至少一个因子权重设为大于 0。',
      researchNote: '这里只做研究，调整偏好不会改变持仓。', strategy: '策略收益', benchmark: '五行业等权收益', drawdown: '最大回撤', spread: '前二与后二行业的月均收益差', sampleBadge: '合成教学回测 · 36 个月', specTitle: '实验口径（与日频快照分开）', specSample: '5 个行业；6 个月预热后逐月评估 36 个月', specFactors: '四个因子：动量、价值、质量、低波动', specRules: '前二行业各 50%，五行业等权基准；零交易费、不加杠杆', specNote: '证券日频快照只回答“当前可见价格能算哪些信号”；这里回答“四因子排序在这组合成历史中表现如何”。两者不能合并成一个结论。', monthPick: '选择一个样本月，亲自核对一次', monthDetail: '当时的因子排名 → 下一期收益 → 当月 IC', monthLabel: '样本月', sector: '行业', score: '综合分数', nextReturn: '下一期收益', icLabel: '当月 Rank IC', monthHint: '分数越高，事前排序越靠前；IC 衡量分数与随后收益的排序相关性，接近 0 表示关系弱。',
      preview: '等权示例已计算；运行回测后记录本次检验。', factorIntro: '因子是给行业打分的线索；权重越高，排序越重视它。',
      drawdownHelp: '最大回撤：资产从此前最高点下跌最多的幅度。',
      icHelp: '排序相关性越接近 1，打分高的行业随后越倾向涨得好；接近 0 表示关系弱，负值表示相反。',
      validityDetails: '查看差值与样本限制', sampleHelp: '可计算月份只表示数据足以计算，不能当作获利月份或胜率。', tuningHelp: '样本小、反复调参可能产生偶然结果。',
      macroDetails: '查看利率、需求与风险指标', noConclusion: '未披露的信息，暂不下结论。', positioning: '长期定位：你持续看好的行业；短期战术：因本轮新证据做的调整。',
      strategyCurve:'策略净值', benchmarkCurve:'等权基准净值', recordedDetails:'下列因子功效与逐月结果来自上次手动回测。', exampleDetails:'下列因子功效与逐月结果来自初始等权示例。', chartTitle: '36 个月合成历史', chartLabel: '事前因子策略与五行业等权基准净值', firstNav: '初始净值 1', months: '36 个月', factorValidity: '因子打分与随后收益的关系', factor: '因子', ic: '排序相关性（平均 Rank IC）', samples: '可计算月份',
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
      weights: 'Research factor preferences', run: 'Run backtest', reset: 'Equal weights', pending: 'Preferences changed. Run the backtest to record this preview.', applied: '36-month replay complete', invalid: 'At least one factor weight must be positive',
      researchNote: 'This is a method exercise. These preferences do not change holdings.', strategy: 'Strategy return', benchmark: 'Equal-sector return', drawdown: 'Maximum drawdown', spread: 'Top two minus bottom two monthly mean', sampleBadge: 'Synthetic teaching backtest · 36 months', specTitle: 'Experiment specification (separate from the daily snapshot)', specSample: 'Five sectors; 6 warm-up months, then 36 monthly evaluations', specFactors: 'Four factors: momentum, value, quality, low volatility', specRules: 'Top two sectors 50% each; equal-sector benchmark; zero trading costs, no leverage', specNote: 'The daily security snapshot only answers “which signals can current visible prices produce?” This experiment asks “how did the four-factor ranking behave in this synthetic history?” Do not merge them into one conclusion.', monthPick: 'Pick one sample month and check it yourself', monthDetail: 'Factor ranking then → next-period return → that month’s IC', monthLabel: 'Month', sector: 'Sector', score: 'Composite score', nextReturn: 'Next-period return', icLabel: 'Monthly Rank IC', monthHint: 'A higher score ranks earlier before the return. IC measures rank correlation between scores and subsequent returns; near zero means a weak relationship.',
      preview: 'Equal-weight example calculated; run a backtest to record your test.', factorIntro: 'Factors are clues used to score sectors. A higher weight gives a clue more influence.',
      drawdownHelp: 'Maximum drawdown is the largest decline from an earlier asset peak.',
      icHelp: 'Closer to 1 means higher-scored sectors tended to have higher subsequent returns; near 0 means a weak relationship, and a negative value means the reverse.',
      validityDetails: 'View spread and sample limits', sampleHelp: 'Calculable months are months with sufficient data. They are not winning months or a win rate.', tuningHelp: 'Small samples and repeated tuning can produce chance results.',
      macroDetails: 'View rates, demand and risk indicators', noConclusion: 'Do not conclude from information that has not been disclosed.', positioning: 'Long-term positioning is the sector case you maintain; short-term tactics are changes based on new evidence this round.',
      strategyCurve:'Strategy NAV', benchmarkCurve:'Equal-sector NAV', recordedDetails:'Factor efficacy and the monthly records below use your last recorded backtest.', exampleDetails:'Factor efficacy and the monthly records below use the initial equal-weight example.', chartTitle: '36 months of synthetic history', chartLabel: 'Prior-information factor strategy versus equal-sector benchmark NAV', firstNav: 'Initial NAV 1', months: '36 months', factorValidity: 'Factor validity', factor: 'Factor', ic: 'Mean Rank IC', samples: 'Valid months',
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
  let current = 'research', phase = null, lang = 'zh-CN', initialized = false;
  let entryAnimation = null, settled = Promise.resolve(), preferences = [25, 25, 25, 25], researchResult = null, researchLanguage = null, researchDirty = false, researchRun = false, selectedMonth = 0;
  let resultPreferences = [25, 25, 25, 25], researchEfficacy = false, researchIdentity = null;
  const researchIds = ['Momentum', 'Value', 'Quality', 'LowVol'];
  const executionIds = {Momentum:'momentum', Value:'value', Quality:'quality', LowVol:'lowVol'};
  let previewKey = null, previewResult = null, previewFrame = 0, unsavedPreferences = false;
  const text = () => labels[lang];

  const formats = new Map();
  function numeric(value, digits = 2) {
    if (!Number.isFinite(value)) return '—';
    const key = lang + digits;
    if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(lang, {minimumFractionDigits:digits,maximumFractionDigits:digits}));
    return formats.get(key).format(Math.abs(value) < .5 * 10 ** -digits ? 0 : value);
  }
  const pct = value => Number.isFinite(value) ? numeric(value * 100) + '%' : '—';
  function tone(value, digits=2) {
    if (!Number.isFinite(value) || Math.abs(value) < .5 * 10 ** -digits) return '';
    return value < 0 ? 'negative' : 'positive';
  }
  function signed(value, digits=2, unit='') {
    return Number.isFinite(value) ? (tone(value,digits) === 'positive' ? '+' : '') + numeric(value,digits) + unit : '—';
  }
  function returnText(fraction) {
    return Number.isFinite(fraction) ? signed(fraction * 100, 2, '%') : '—';
  }
  function returnCell(fraction) {
    return `<td class="${tone(fraction * 100)}">${returnText(fraction)}</td>`;
  }
  function explain(question) {
    return `<button type="button" class="metric-explain" data-explain-metric="${esc(question)}" aria-label="${esc(question)}">${lang === 'en' ? 'Explain' : '解释'}</button>`;
  }
  const analyze = weights => window.InvestigationResearch.analyze(Object.fromEntries(researchIds.map((id,i) => [id,weights[i]])));
  function flushPreferences() {
    if (!unsavedPreferences) return;
    unsavedPreferences = false;
    saveResearchProgress();
  }

  function getResearchProgress() {
    return {hasRun:researchRun,dirty:researchDirty,hasEfficacy:researchEfficacy,preferences:[...preferences],resultPreferences:[...resultPreferences]};
  }
  function getResearch() {
    if (!researchResult && researchRun && window.InvestigationResearch) {
      researchResult = analyze(resultPreferences);
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
    if (previewFrame) cancelAnimationFrame(previewFrame);
    previewFrame = 0; previewKey = null; previewResult = null; unsavedPreferences = false;
    researchResult = null; researchLanguage = null;
    renderHandoff();
    if (current === 'backtest') renderResearch(true);
  }
  function renderHandoff() {
    const app = window.FactorLabApp, host = $('view-portfolio'); if (!host || !app) return;
    let root = $('allocation-handoff');
    if (!root) { root = document.createElement('details'); root.id = 'allocation-handoff'; root.className = 'allocation-handoff panel'; host.appendChild(root); }
    const en = lang === 'en', t = text(), ui = app.getUI();
    const status = !researchRun ? (en ? 'Not yet tested with your own backtest.' : '尚未运行自己的回测。') : researchDirty ? (en ? 'Preferences changed. The new preview has not been recorded.' : '偏好已更改，新的预览尚未记录。') : (en ? 'Current preferences have a recorded synthetic backtest.' : '当前偏好已完成合成回测。');
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


  function updateEvidenceNavigation() {
    document.body.dataset.activeEvidenceTab = selectedEvidenceTab;
    const tabs = $('evidence-tabs');
    if (!tabs) return;
    let index = 0;
    tabs.querySelectorAll('button').forEach((button,i) => {
      const active = current === 'backtest' ? button.dataset.openView === 'backtest' : current === 'research' && button.dataset.evidenceTab === selectedEvidenceTab;
      button.classList.toggle('active', active);
      if (active) {
        index = i;
        button.setAttribute('aria-current','page');
      } else button.removeAttribute('aria-current');
    });
    tabs.style.setProperty('--selected-index', index);
  }

  function setEvidenceTab(tab) {
    if (!['market', 'options', 'fundamentals', 'news'].includes(tab) || selectedEvidenceTab === tab) return;
    selectedEvidenceTab = tab;
    updateEvidenceNavigation();
    document.dispatchEvent(new CustomEvent('factorlab:evidence-tab', {detail:{tab}}));
  }

  function updateLabels() {
    const t = text();
    if ($('view-title') && $('view-title').textContent!==t[current][0]) $('view-title').textContent = t[current][0];
    if ($('view-description')) { $('view-description').textContent = t[current][1]; $('view-description').hidden = !t[current][1]; }
    updateEvidenceNavigation();
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === (current==='backtest'?'research':current);
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      const label = button.querySelector('[data-nav-label]');
      if (label && t[button.dataset.view] && label.textContent!==t[button.dataset.view][0]) label.textContent = t[button.dataset.view][0];
    });
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { const copy = lang === 'en' ? el.dataset.en : el.dataset.zh; if (el.textContent !== copy) el.textContent = copy; });
  }

  let resetScroll=false;
  window.addEventListener('scroll',()=>{resetScroll=true;},{passive:true});
  function applyView(view, focus, historyMode = 'replace', animate = false) {
    const started = animate ? window.performance?.now() : null;
    if (resetScroll) {
      window.scrollTo({top:0,left:0,behavior:'instant'});
      resetScroll=false;
    }
    const source=document.activeElement;
    current = view;
    document.body.dataset.currentView = current;
    document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== current; });
    const panel=$('view-'+view);
    if (animate && !reduced() && panel?.animate) {
      entryAnimation = panel.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:140,easing:'cubic-bezier(.16,1,.3,1)'});
      if (Number.isFinite(started)) entryAnimation.startTime=started;
      settled=entryAnimation.finished.catch(()=>{});
    }
    const market = $('shared-market');
    const host = $(current === 'risk' ? 'market-host-risk' : 'market-host-research');
    if (market && host && market.parentElement !== host) host.appendChild(market);
    if ($('evidence-tabs')) $('evidence-tabs').hidden = !['research','backtest'].includes(current);
    updateLabels();
    if (current === 'backtest') renderResearch();
    try { if (historyMode !== 'none' && location.hash !== '#/' + current) history[historyMode === 'push' ? 'pushState' : 'replaceState'](null, '', '#/' + current); } catch {}
    document.dispatchEvent(new CustomEvent('factorlab:view', { detail: { view: current } }));
    const title=$('view-title');
    if (focus && title && source!==title) {
      title.tabIndex=-1;
      const focused=new Promise(done=>requestAnimationFrame(()=>setTimeout(()=>{
        if (current===view && (document.activeElement===source || document.activeElement===document.body)) title.focus({preventScroll:true});
        done();
      },0)));
      settled=Promise.all([settled,focused]).then(()=>{});
    }
  }


  function go(view, options = {}) {
    if (!views.includes(view)) return settled;
    if (current === view && location.hash === '#/' + view) {
      updateEvidenceNavigation();
      return settled;
    }
    flushPreferences();
    entryAnimation?.cancel();
    entryAnimation = null;
    settled = Promise.resolve();
    applyView(view, options.focus === true, options.history || 'push', options.animate !== false);
    return settled;
  }


  function sectorName(id) {
    const sectors = window.InvestigationResearch.SECTORS;
    const index = sectors.findIndex(sector => sector.id === id);
    return lang === 'en' ? ['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure'][index] || id : sectors[index]?.name || id;
  }

  function preview() {
    const key = preferences.join(',');
    if (previewKey !== key) {
      previewKey = key;
      previewResult = preferences.some(value => value > 0)
        ? key === resultPreferences.join(',') ? researchResult : analyze(preferences)
        : null;
    }
    return previewResult;
  }

  function paintPreview() {
    previewFrame = 0;
    if (current !== 'backtest') return;
    const root = $('backtest-content'), host = root?.querySelector('.backtest-chart');
    if (!host) return;
    const a = preview(), t = text();
    const values = a ? [a.strategy.totalReturn, a.benchmark.totalReturn, -a.strategy.maxDrawdown] : [null,null,null];
    root.querySelectorAll('[data-backtest-kpi]').forEach((el,i) => {
      const value = values[i];
      el.className = tone(value * 100);
      if (window.FactorLabEditorial?.number) window.FactorLabEditorial.number(el,value,returnText);
      else el.textContent = returnText(value);
    });
    $('backtest-status').textContent = !a ? t.invalid : researchDirty ? t.pending : researchRun ? t.applied : t.preview;
    const notice = root.querySelector('.backtest-stale');
    notice.hidden = !researchDirty;
    notice.textContent = researchRun ? t.recordedDetails : t.exampleDetails;
    if (!a) {
      FactorVisuals.releaseChart(host);
      host.dataset.chartState = 'empty';
      host.textContent = t.invalid;
      return;
    }
    const rows = a.strategy.nav.map((nav,month) => ({nav,month,benchmarkNav:a.benchmark.nav[month]}));
    if (host.dataset.chartState && host.dataset.chartState !== 'empty') {
      FactorVisuals.updateRows(host, rows);
    } else {
      FactorVisuals.chart(host, {
        rows, series:[{key:'nav',name:t.strategyCurve}, {key:'benchmarkNav',name:t.benchmarkCurve,dash:true}],
        label:t.chartLabel, unit:lang === 'en' ? 'NAV' : '净值', format:v=>numeric(v),
        xLabel:row => (lang === 'en' ? 'Month ' : '样本月 ') + row.month
      });
    }
  }

  function preferencesChanged() {
    unsavedPreferences = true;
    researchDirty = true;
    researchEfficacy = false;
    if (!previewFrame) previewFrame = requestAnimationFrame(paintPreview);
  }

  function fillMonth(a) {
    const host = $('month-detail');
    if (!host || !a.months.length) return;
    selectedMonth = Math.max(0,Math.min(a.months.length - 1,Number(selectedMonth) || 0));
    const t = text(), month = a.months[selectedMonth];
    host.innerHTML = `<div class="month-summary"><span>${esc(t.monthLabel)} ${selectedMonth+1}</span><span>${esc(t.strategy)} <b class="${tone(month.strategyReturn*100)}">${returnText(month.strategyReturn)}</b></span><span>${esc(t.benchmark)} <b class="${tone(month.benchmarkReturn*100)}">${returnText(month.benchmarkReturn)}</b></span></div>
      <div class="table-scroll" tabindex="0" role="region" aria-label="${esc(t.monthDetail)}"><table><thead><tr><th>${esc(t.sector)}</th><th>${esc(t.score)}</th>${t.factorNames.map(n=>`<th>${esc(n)}</th>`).join('')}<th>${esc(t.nextReturn)}</th></tr></thead>
      <tbody>${month.rankings.map(row => `<tr><td>${esc(sectorName(row.id))}</td><td>${numeric(row.score,1)}</td>${researchIds.map(id=>id==='Momentum'?returnCell(row.raw[id]):`<td>${pct(row.raw[id])}</td>`).join('')}${returnCell(month.forward[row.id])}</tr>`).join('')}</tbody></table></div>
      <div class="month-ic"><strong>${esc(t.icLabel)}</strong>${researchIds.map((id,i)=>`<span>${esc(t.factorNames[i])} ${signed(month.ic[id],3)}</span>`).join('')}</div><p class="footnote">${esc(t.monthHint)}</p>`;
  }

  function renderResearch(force = false) {
    const root = $('backtest-content');
    if (!root || !window.InvestigationResearch) return;
    if (researchLanguage === lang && root.querySelector('.backtest-chart') && !force) {
      if (previewKey !== preferences.join(',')) paintPreview();
      return;
    }
    const focusId = root.contains(document.activeElement) ? document.activeElement.id : '';
    const oldChart = root.querySelector('.backtest-chart');
    if (oldChart) FactorVisuals.releaseChart(oldChart);
    if (!researchResult) researchResult = analyze(resultPreferences);
    const a = researchResult, t = text(), en = lang === 'en';
    researchLanguage = lang;
    const questions = en ? ['How is the 36-month strategy return calculated?','What does the equal-sector return compare with?','How large was the strategy’s largest loss from its previous peak?'] :
      ['36 个月的策略累计收益怎样计算？','五行业等权基准收益与策略收益有什么区别？','策略从前期高点到低点的最大跌幅怎样计算？'];
    const inputs = preferences.map((v,i) => `<div class="backtest-factor"><label for="research-weight-${i}">${esc(t.factorNames[i])}</label><output id="research-output-${i}" for="research-weight-${i}">${v}</output><input id="research-weight-${i}" data-research-factor="${i}" type="range" min="0" max="100" step="5" value="${v}" aria-describedby="research-help-${i}"><small id="research-help-${i}">${esc(t.factorHelp[i])}</small></div>`).join('');
    const metrics = [t.strategy,t.benchmark,t.drawdown].map((label,i) => `<div><button class="backtest-metric-label" type="button" data-explain-metric="${esc(questions[i])}" aria-label="${esc(questions[i])}"><span>${esc(label)}</span><span class="metric-info" aria-hidden="true">?</span></button><strong data-backtest-kpi="${i}">—</strong></div>`).join('');
    const monthOptions = a.months.map((m,i)=>`<option value="${i}" ${i===selectedMonth?'selected':''}>${i+1} · ${esc(m.top.map(sectorName).join(en?' / ':'、'))}</option>`).join('');
    root.innerHTML = `<div class="backtest-results">
      <div class="backtest-heading"><div><h2>${esc(t.chartTitle)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><button id="run-backtest" class="primary">${esc(t.run)}</button></div>
      <section class="backtest-summary" aria-label="${esc(t.chartLabel)}">${metrics}</section>
      <div class="backtest-layout">
        <section class="backtest-controls"><h3>${esc(t.weights)}</h3><p class="footnote">${esc(t.factorIntro)}</p>${inputs}
          <div class="backtest-actions"><button id="reset-backtest">${esc(t.reset)}</button></div>
          <p id="backtest-status" class="backtest-status" role="status"></p><p class="footnote">${esc(t.researchNote)}</p></section>
        <section class="backtest-plot"><div class="panel-head"><h3>${esc(t.chartLabel)}</h3><span>${esc(t.firstNav)}</span></div><div class="backtest-chart"></div><p class="footnote">${esc(t.drawdownHelp)}</p></section>
      </div>
      <section class="factor-validity"><h2>${esc(t.factorValidity)}</h2><p class="backtest-stale footnote" hidden></p><p class="footnote">${esc(t.icHelp)}</p>
        <div class="table-scroll"><table><thead><tr><th>${esc(t.factor)}</th><th>${esc(t.ic)}</th><th>${esc(t.samples)}</th></tr></thead><tbody>${a.factors.map((f,i) => `<tr><td>${esc(t.factorNames[i])}</td><td>${signed(f.meanIC,3)}</td><td>${f.validMonths} / ${a.sampleCount}</td></tr>`).join('')}</tbody></table></div>
        ${explain(en ? 'How should I interpret mean Rank IC and the number of valid months in this backtest?' : '在这次合成回测中，如何解读平均 Rank IC 和可计算月份？')}
        <p class="footnote">${esc(t.limitation)}</p>
        <details class="factor-sample-details"><summary>${esc(t.validityDetails)}</summary><p>${esc(t.spread)} <strong class="${tone(a.meanSpread*100,3)}">${signed(a.meanSpread*100,3)} ${en?'percentage points':'个百分点'}</strong></p><p>${esc(t.sampleHelp)}</p><p>${esc(t.tuningHelp)}</p></details></section>
      <section class="month-inspector"><div class="panel-head"><h2>${esc(t.monthPick)}</h2><span class="source-tag">${esc(t.synthetic)}</span></div><p class="footnote">${esc(t.monthDetail)}</p>
        <label for="research-month">${esc(t.monthLabel)} <select id="research-month">${monthOptions}</select></label><div id="month-detail"></div></section>
      <details class="research-spec"><summary>${esc(t.specTitle)}</summary><dl><div><dt>${esc(t.samples)}</dt><dd>${esc(t.specSample)}</dd></div><div><dt>${esc(t.factor)}</dt><dd>${esc(t.specFactors)}</dd></div><div><dt>${esc(t.selected)}</dt><dd>${esc(t.specRules)}</dd></div></dl><p class="footnote">${esc(t.specNote)}</p></details>
      <details class="backtest-method"><summary>${esc(t.method)}</summary><p>${esc(t.methodText)}</p><div class="backtest-months"><table><thead><tr><th>${esc(t.month)}</th><th>${esc(t.selected)}</th><th>${esc(t.monthlyStrategy)}</th><th>${esc(t.monthlyBenchmark)}</th></tr></thead><tbody>${a.months.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.top.map(sectorName).join(en?' / ':'、'))}</td>${returnCell(m.strategyReturn)}${returnCell(m.benchmarkReturn)}</tr>`).join('')}</tbody></table></div></details>
      </div>`;
    fillMonth(a);
    paintPreview();
    $('research-month').addEventListener('change', e => { selectedMonth = Number(e.target.value); fillMonth(a); });
    root.querySelectorAll('[data-research-factor]').forEach(input => {
      input.addEventListener('input', () => {
        const i = Number(input.dataset.researchFactor);
        if (preferences[i] === Number(input.value)) return;
        preferences[i] = Number(input.value);
        $('research-output-'+i).textContent = input.value;
        preferencesChanged();
      });
      input.addEventListener('change', flushPreferences);
    });
    $('run-backtest').addEventListener('click', () => {
      const currentPreview = preview();
      if (!currentPreview) { $('backtest-status').textContent = t.invalid; return; }
      researchResult = currentPreview;
      resultPreferences = [...preferences];
      researchRun = true;
      researchDirty = false;
      researchEfficacy = false;
      unsavedPreferences = false;
      saveResearchProgress();
      renderResearch(true);
      document.dispatchEvent(new CustomEvent('factorlab:feedback', {detail:{kind:'backtest',stage:'success'}}));
    });
    $('reset-backtest').addEventListener('click', () => {
      preferences = [25,25,25,25];
      preferences.forEach((value,i) => { $('research-weight-'+i).value=value; $('research-output-'+i).textContent=value; });
      preferencesChanged();
      flushPreferences();
    });
    root.querySelector('.factor-sample-details').addEventListener('toggle', e => {
      if (e.target.open && researchRun && !researchDirty && !researchEfficacy) { researchEfficacy = true; saveResearchProgress(); }
    });
    if (focusId) $(focusId)?.focus({preventScroll:true});
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
      const initial = views.includes(requested) ? requested : ['review', 'complete'].includes(phase) ? 'journal' : phase === 'event' || state.day === 0 ? 'research' : 'portfolio';
      applyView(initial, false);
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
  $('evidence-tabs')?.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll('button')], index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].click();
    buttons[next].focus({preventScroll:true});
  });
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-open-view]');
    if (action) { event.preventDefault(); go(action.dataset.openView, { focus: true }); }
  });
  window.addEventListener('hashchange', () => { const requested = hashView(); if (views.includes(requested)) go(requested, {history:'none'}); });
  for (const [openId, closeId, dialogId] of [['open-coach', 'close-coach', 'coach-drawer'], ['open-context', 'close-context', 'course-context']]) {
    $(openId)?.addEventListener('click', () => { document.dispatchEvent(new Event('factorlab:pause')); const dialog = $(dialogId); if(dialogId==='coach-drawer'){window.FactorLabStudio?.openChat();}else dialog.showModal(); });
    $(closeId)?.addEventListener('click', () => $(dialogId).close());
  }
  document.addEventListener('factorlab:render', sync);
  document.addEventListener('factorlab:profile', restoreResearchProgress);
  document.addEventListener('factorlab:restore', restoreResearchProgress);
  document.addEventListener('factorlab:new', restoreResearchProgress);
  window.addEventListener('pagehide', flushPreferences);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushPreferences(); });
  window.FactorLabWorkspace = { go, setEvidenceTab, getView: () => current, get settled() { return settled; }, getResearch, getResearchStatus: getResearchProgress, getResearchProgress };
  sync();
})();
