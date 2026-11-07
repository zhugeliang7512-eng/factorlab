(function (root) {
  'use strict';

  const languages = {
    'zh-CN': {
      title: '研究小结', intro: '汇总已发生的练习与当前反思，作为课程报告的素材。',
      download: '导出研究小结', reflect: '继续写反思', details: '查看小结与课程交付',
      downloaded: '已发起下载，请在浏览器下载列表查看。', failed: '下载未完成，请重试。',
      boundary: '合成数据教学练习；不证明真实市场有效性或学习效果，也不代表课程交付已完成。',
      sections: ['长期定位', '短期调整', '方法证据', '周期证据', '结果与反思', '课程交付'],
      sectors: ['半导体', '机器人', '先进材料', '清洁能源', 'AI 基础设施', '现金'],
      factors: ['动量', '价值', '质量', '低波动'],
      reasons: { evidence: '证据变化', risk: '风险控制', anchor: '长期定位', valuation: '估值判断' },
      noReflection: '尚未记录反思。请在上方写下你的判断和下一次要验证的问题。',
      noRounds: '尚无已结算轮次。', noBacktest: '本次会话尚未运行回测，或已恢复进度但没有保留运行记录。',
      dirtyBacktest: '因子偏好已修改，尚未重新运行回测；旧结果不计入本小结。',
      method: '独立的 36 个月合成历史实验，使用 6 个月预热；只用当时可得信息排序，前二行业各 50%，每月再平衡，零交易成本。五行业等权作为基准。它与配置练习的 40% 单行业上限和费用规则不同。',
      methodLimit: 'Rank IC 衡量因子排序与随后收益排序的关系。小样本、合成数据与反复调参不能证明现实有效性。',
      longPrompt: '待你补充：我持续看好哪些行业？哪些经营、竞争和周期证据支持长期定位？',
      shortPrompt: '待你补充：本轮为什么偏离长期定位？新证据、费用和集中度怎样影响取舍？',
      cyclePrompt: '待你补充：订单是否转为收入和利润？哪些信息仍是预期，下一轮要核对什么？',
      resultPrompt: '待你补充：结果来自市场、因子、行业还是事件？短期盈利不能直接证明判断正确。',
      ai: 'AI / 自动化：应用可自动回测与核算；在线 AI 是否连接以对话框状态为准。AI 输出仍需对照可见证据核验。',
      weekly: '每周过程：研究问题 → 证据与方法 → 交互实验 → 对照结果 → 反思与下周问题。请保留日期、版本、方法变化和实际反馈。',
      milestones: '课程计划：Week 7（10 月 26–30 日）集成功能；Week 8（11 月 2–6 日）冻结架构；Week 9（11 月 9–13 日）留存测试证据；Week 10（11 月 16–20 日）演示；Week 11（11 月 23–27 日）最终打包。以课程最新通知为准。',
      deliverables: '待人工核对：研究报告、方法与因子功效、周期证据与引用、演示记录、每周过程、个人反思、测试证据和最终版本。导出此文件不会自动提交作业。',
      partner: '伙伴背景：围绕证券研究、资产管理和风险管理说明可解释性、成本及仓位约束。课程原文的 CITIC Securities 与中文“中信建投证券股份有限公司”存在名称冲突，需向课程方核实；不据此声称真实合作或背书。',
      course: '子项目 B：高端制造与尖端科技行业配置，比较长期定位和短期战术。五行业 + 现金、四因子、六轮默认练习。',
      modelCycle: '周期为教学模型标签，不是现实市场判断。', noEvents: '尚无已披露事件。', noEvidence: '尚未打开证据卡。',
      units: '虚拟金额', missing: '—'
    },
    en: {
      title: 'Research summary', intro: 'Collect completed practice and your current reflection as material for the course report.',
      download: 'Export research summary', reflect: 'Continue reflection', details: 'Summary and course deliverables',
      downloaded: 'Download started. Check your browser downloads.', failed: 'Download did not complete. Please retry.',
      boundary: 'Synthetic teaching exercise. It does not establish market validity, learning outcomes or completion of course deliverables.',
      sections: ['Long-term positioning', 'Tactical adjustment', 'Method evidence', 'Cycle evidence', 'Results and reflection', 'Course deliverables'],
      sectors: ['Semiconductors', 'Robotics', 'Advanced materials', 'Clean energy', 'AI infrastructure', 'Cash'],
      factors: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      reasons: { evidence: 'Changed evidence', risk: 'Risk control', anchor: 'Long-term positioning', valuation: 'Valuation' },
      noReflection: 'No reflection recorded. Use the field above to record your judgment and the next question to test.',
      noRounds: 'No settled rounds yet.', noBacktest: 'No explicit backtest run in this session, or restored progress has no retained run record.',
      dirtyBacktest: 'Factor preferences changed. Rerun the backtest; the previous result is excluded from this summary.',
      method: 'An independent 36-month synthetic-history exercise with six warm-up months. Rank only information available at each decision time. Hold the top two sectors at 50% each, rebalance monthly and assume zero costs. Compare with the equal-sector benchmark. These rules differ from the allocation exercise’s 40% sector cap and trading costs.',
      methodLimit: 'Rank IC compares factor rankings with subsequent return rankings. Synthetic small samples and repeated tuning do not establish real-world validity.',
      longPrompt: 'To write: Which sectors do I favour for the long term, and which operating, competitive and cycle evidence supports that position?',
      shortPrompt: 'To write: Why did I deviate from the long-term position? How did new evidence, costs and concentration affect the trade-off?',
      cyclePrompt: 'To write: Have orders turned into revenue and earnings? Which claims remain expectations, and what should I check next?',
      resultPrompt: 'To write: Did market, factor, sector or event effects explain the outcome? A short-term gain does not prove a sound judgment.',
      ai: 'AI / automation: The app computes backtests and accounting automatically. Check the conversation status for online AI availability. Verify AI claims against visible evidence.',
      weekly: 'Weekly process: question → evidence and method → interactive experiment → compare outcomes → reflection and next question. Retain dates, versions, method changes and actual feedback.',
      milestones: 'Course plan: Week 7 (Oct 26–30) integration; Week 8 (Nov 2–6) architecture freeze; Week 9 (Nov 9–13) test evidence; Week 10 (Nov 16–20) demo; Week 11 (Nov 23–27) final packaging. Confirm against the latest course notice.',
      deliverables: 'Check manually: research report, methods and factor validity, cycle evidence and citations, demo record, weekly process, personal reflection, test evidence and final version. Exporting this file does not submit coursework.',
      partner: 'Partner context: Explain interpretability, costs and position limits through securities research, asset management and risk management. The brief names CITIC Securities alongside the conflicting Chinese name 中信建投证券股份有限公司. Confirm the institution with the course team; no actual partnership or endorsement is asserted.',
      course: 'Subproject B: advanced manufacturing and frontier technology allocation, comparing long-term positioning with tactical choices. Five sectors plus cash, four factors and six default rounds.',
      modelCycle: 'The cycle is a teaching-model label, not a real-market assessment.', noEvents: 'No disclosed events yet.', noEvidence: 'No evidence cards opened yet.',
      units: 'virtual amount', missing: '—'
    }
  };

  function buildReport({ state = {}, envelope = {}, research = null, researchStatus = {}, lang = 'zh-CN', translate = key => key } = {}) {
    lang = lang === 'en' ? 'en' : 'zh-CN';
    const t = languages[lang], en = lang === 'en';
    const choose = (zh, english) => en ? english : zh;
    const number = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString(lang, {minimumFractionDigits: digits, maximumFractionDigits: digits}) : t.missing;
    const percent = value => Number.isFinite(value) ? number(value * 100) + '%' : t.missing;
    const weights = values => Array.isArray(values) ? t.sectors.map((name, index) => name + ' ' + percent(values[index])).join(' / ') : t.missing;
    const reason = value => {
      const parts = String(value || '').split(' · ');
      if (t.reasons[parts[0]]) parts[0] = t.reasons[parts[0]];
      return parts.join(' · ') || choose('尚未记录', 'Not recorded');
    };
    const rows = Array.isArray(state.results) ? state.results : [];
    const progress = choose(`已完成 ${rows.length} / ${state.rounds ?? 6} 轮 · 第 ${state.day ?? 0} 日`, `${rows.length} / ${state.rounds ?? 6} rounds settled · Day ${state.day ?? 0}`);
    const metrics = state.metrics || {};
    const first = state.history?.[0];
    const initial = first && Number.isFinite(first.nav) && first.nav > 0 ? [...first.holdingsBefore.map(value => value / first.nav), first.cashBefore / first.nav] : null;
    const long = [
      t.longPrompt,
      choose('开局长期持有参照：', 'Opening buy-and-hold reference: ') + weights(initial),
      choose('截至当前，相对长期持有参照的差额：', 'Current difference versus opening buy-and-hold: ') + number(state.nav - state.anchorNav) + ' (' + t.units + ')'
    ];
    const short = [
      t.shortPrompt,
      choose('当前实际仓位：', 'Current actual weights: ') + weights(state.weights)
    ];
    if (state.phase === 'decision') short.push(choose('未确认的配置草稿：', 'Unconfirmed allocation draft: ') + weights(envelope.draft));
    short.push(choose('当前记录的理由：', 'Current recorded reason: ') + reason(envelope.reason));
    if (envelope.note) short.push(choose('你的证据说明：', 'Your evidence note: ') + String(envelope.note));
    if(state.phase==='decision'){
      short.push(choose('草案引用：','Draft citations: ')+(envelope.evidenceRefs||[]).join(' / '));
      short.push(choose('草案反证条件：','Draft reconsideration condition: ')+(envelope.falsifierIf||choose('未记录','Not recorded')));
    }
    const method = [t.method, t.methodLimit];
    const ran = researchStatus.hasRun === true && researchStatus.dirty !== true && research;
    if (ran) {
      method.unshift(choose(`本次会话已运行回测：${research.sampleCount} 个月合成样本。`, `Backtest run in this session: ${research.sampleCount} synthetic months.`));
      method.push(choose('研究因子偏好：', 'Research factor preferences: ') + (research.factors || []).map((factor, index) => `${t.factors[index] || factor.id} ${percent(research.preferences?.[factor.id])}`).join(' / '));
      method.push(choose('合成策略收益：', 'Synthetic strategy return: ') + percent(research.strategy?.totalReturn) + choose('；基准收益：', '; benchmark return: ') + percent(research.benchmark?.totalReturn) + choose('；策略最大回撤：', '; strategy max drawdown: ') + percent(research.strategy?.maxDrawdown));
      for (const [index, factor] of (research.factors || []).entries()) method.push(`${t.factors[index] || factor.id} · Rank IC ${number(factor.meanIC, 3)} · ${factor.validMonths} / ${research.sampleCount} ${choose('有效月份', 'valid months')}`);
    } else method.unshift(researchStatus.dirty ? t.dirtyBacktest : t.noBacktest);
    const evidence = (state.evidence || []).filter(item => (state.seen || []).includes(item.id));
    const events = (state.events || []).filter(event => event.startDay <= (state.day ?? 0));
    const cycle = [t.cyclePrompt, t.modelCycle];
    cycle.push(evidence.length ? choose('已打开证据：', 'Opened evidence: ') + evidence.map(item => `${item.id} ${translate(item.titleKey)}`).join(' / ') : t.noEvidence);
    cycle.push(...(events.length ? events.map(event => choose(`第 ${event.startDay} 日：`, `Day ${event.startDay}: `) + translate(event.titleKey) + ' — ' + translate(event.bodyKey)) : [t.noEvents]));
    const results = [
      t.resultPrompt,
      choose('累计组合收益：', 'Cumulative portfolio return: ') + percent(metrics.returnValue),
      choose('累计最大回撤：', 'Cumulative max drawdown: ') + percent(metrics.maxDrawdown),
      choose('年化 Sharpe：', 'Annualized Sharpe: ') + number(metrics.sharpe) + choose('（日频，年化 252，rf 为当日模型政策利率；样本不足或零方差显示 —）', ' (daily observations, annualization 252, rf = daily model policy rate; insufficient or zero-variance samples show —)')
    ];
    if (!rows.length) results.push(t.noRounds);
    for (const row of rows) {
      results.push(choose(`第 ${row.round} 轮`, `Round ${row.round}`) + ' | ' + reason(row.reason) + ' | ' + choose('收益 ', 'return ') + percent(row.returnValue) + ' | ' + choose('相对本轮不调仓 ', 'vs no trade this round ') + number(row.tacticalAmount) + ' | ' + choose('该轮费用 ', 'round costs ') + number(Number.isFinite(row.attribution?.cost) ? -row.attribution.cost : null) + ' (' + t.units + ')');
      if(row.decisionPolicy==='studio'){
        results.push(choose('本轮引用：','Evidence cited this round: ')+(row.evidenceRefs||[]).join(' / '));
        results.push(choose('反证条件：','Reconsideration condition: ')+(row.falsifierIf||choose('未记录','Not recorded')));
        results.push((row.reward?.badges?.includes('badge.recordComplete')?choose('决策记录完整','Decision record complete'):choose('决策记录未完整','Decision record incomplete'))+choose('；过程记录不代表判断正确。','; recording the process does not validate the judgment.'));
      }else if(row.decisionPolicy==='legacy')results.push(choose('历史记录保留旧规则积分。','Historical record retains legacy points.'));
    }
    results.push(choose('你的反思：', 'Your reflection: ') + (String(envelope.reflection || '').trim() || t.noReflection));
    const course = [t.course, t.ai, t.weekly, t.milestones, t.deliverables, t.partner];
    const sections = [long, short, method, cycle, results, course].map((lines, index) => ({title: t.sections[index], lines}));
    return {
      title: t.title, progress, boundary: t.boundary, sections, hasRunBacktest: !!ran,
      text: [t.title, progress, t.boundary, ...sections.flatMap(section => ['', section.title, ...section.lines])].join('\n')
    };
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {buildReport};
    return;
  }
  if (!root.document) return;
  let lastContent = '', scheduled = false;
  const $ = id => document.getElementById(id);
  const language = () => root.FactorLabApp?.getUI().lang === 'en' ? 'en' : 'zh-CN';
  function capture() {
    const lang = language(), source = root.FactorLabSimulation?.TEXTS?.[lang] || {};
    return buildReport({
      state: root.FactorLabApp.getState(),
      envelope: root.FactorLabApp.getEnvelope(),
      research: root.FactorLabWorkspace?.getResearch(),
      researchStatus: root.FactorLabWorkspace?.getResearchStatus?.() || {},
      lang, translate: key => source[key] || key
    });
  }
  function create() {
    const host = $('view-journal');
    if (!host || $('research-report')) return;
    const section = document.createElement('section');
    section.id = 'research-report';
    section.className = 'panel research-report';
    section.setAttribute('aria-labelledby', 'report-title');
    section.innerHTML = '<div class="panel-head"><h2 id="report-title"></h2><span class="source-tag" id="report-progress"></span></div><p id="report-intro"></p><div class="report-actions"><button id="export-report" class="secondary"></button><button id="report-reflect" class="text-button"></button></div><p id="report-feedback" class="footnote" role="status"></p><details id="report-details"><summary id="report-details-label"></summary><p id="report-boundary" class="footnote"></p><div class="report-sections" id="report-sections"></div></details>';
    host.append(section);
    $('report-reflect').addEventListener('click', () => {
      $('reflection')?.focus();
      $('reflection')?.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
    $('export-report').addEventListener('click', () => {
      const t = languages[language()];
      let url;
      try {
        url = URL.createObjectURL(new Blob(['\uFEFF' + capture().text], {type: 'text/plain;charset=utf-8'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'FactorLab-research-summary-' + new Date().toISOString().slice(0, 10) + '.txt';
        document.body.append(link);
        link.click();
        link.remove();
        $('report-feedback').textContent = t.downloaded;
      } catch {
        $('report-feedback').textContent = t.failed;
      } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
  }
  function render() {
    scheduled = false;
    if (!root.FactorLabApp) return;
    create();
    if (!$('research-report')) return;
    const report = capture(), t = languages[language()];
    if (lastContent === report.text) return;
    lastContent = report.text;
    for (const [id, text] of Object.entries({
      'report-title': t.title, 'report-intro': t.intro, 'report-progress': report.progress,
      'export-report': t.download, 'report-reflect': t.reflect, 'report-details-label': t.details,
      'report-boundary': report.boundary, 'report-feedback': ''
    })) $(id).textContent = text;
    const fragment = document.createDocumentFragment();
    for (const section of report.sections) {
      const article = document.createElement('section'), heading = document.createElement('h3');
      heading.textContent = section.title; article.append(heading);
      for (const line of section.lines) {
        const p = document.createElement('p'); p.textContent = line; article.append(p);
      }
      fragment.append(article);
    }
    $('report-sections').replaceChildren(fragment);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; queueMicrotask(render); }
  }
  for (const type of ['factorlab:render', 'factorlab:save', 'factorlab:profile', 'factorlab:restore', 'factorlab:view', 'factorlab:feedback']) document.addEventListener(type, schedule);
  document.addEventListener('input', event => { if (event.target.matches?.('[data-research-factor]')) schedule(); });
  document.addEventListener('click', event => { if (event.target.closest?.('#reset-backtest')) schedule(); });
  root.FactorLabReport = {build: capture, refresh: schedule};
  schedule();
})(typeof window === 'undefined' ? globalThis : window);
