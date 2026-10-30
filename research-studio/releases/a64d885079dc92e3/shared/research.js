(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.InvestigationResearch = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FACTORS = [
    { id: 'Momentum', name: '动量', description: '过去六个模拟月累计收益；趋势可能反转。' },
    { id: 'Value', name: '价值', description: '虚拟篮子 E/P；便宜可能伴随经营风险。' },
    { id: 'Quality', name: '质量', description: '虚拟篮子 ROE；单一指标不能覆盖完整盈利质量。' },
    { id: 'LowVol', name: '低波动', description: '过去六个月样本波动率的负值；低波动不等于无风险。' }
  ];
  const SECTORS = [
    { id: 'semiconductors', name: '半导体' }, { id: 'robotics', name: '机器人' },
    { id: 'materials', name: '先进材料' }, { id: 'cleanenergy', name: '清洁能源' },
    { id: 'AI', name: 'AI 基础设施' }
  ];
  const REAL_CASE = {
    title: '现实档案 · 2024 年半导体供给与存储周期',
    facts: [
      { date: '2024-02-19', category: '政策', source: '美国商务部 / NIST',
        text: '美国商务部与 GlobalFoundries 公布无约束力的初步条款，拟提供约 15 亿美元直接资助，支持美国成熟制程产能。当日属于拟议支持，不是已拨款。',
        url: 'https://www.nist.gov/news-events/news/2024/02/biden-harris-administration-announces-preliminary-terms-globalfoundries' },
      { date: '2024-03-20', category: '企业经营', source: 'Micron FY2024 Q2 财报',
        text: 'Micron 披露截至 2024-02-29 的季度收入为 58.2 亿美元，上季为 47.3 亿美元，上年同期为 36.9 亿美元。这是单家公司披露，不能代替全行业表现。',
        url: 'https://investors.micron.com/news/press-release/2024/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2024-03-20-2024/default.aspx' },
      { date: '2024-03-20', category: '产品价格', source: 'Micron FY2024 Q2 投资者简报，第 11、18 页',
        text: 'Micron 披露该季度 DRAM 平均售价环比增长百分之十几的高段（high teens），NAND 平均售价环比增长超过 30%。这是存储产品售价，不是股票涨幅。',
        url: 'https://micron.gcs-web.com/static-files/c531bd08-22cd-4d6b-9540-f8aa72459716' }
    ],
    note: '真实历史只用于比较政策、经营和产品价格证据；不是模拟情景输入，不提供证券价格回测，也不能证明模型收益或现实因子有效。'
  };
  const METHODS = [
    { name: 'Spearman Rank IC：Reference；未安装或复制 SciPy 代码', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html' },
    { name: '平均秩处理并列：Reference', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html' }
  ];
  const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  function stdev(values) {
    if (values.length < 2) return null;
    const m = mean(values);
    return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
  }
  function ranks(values) {
    const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
    const result = [];
    for (let i = 0; i < ordered.length;) {
      let end = i + 1;
      while (end < ordered.length && ordered[end].value === ordered[i].value) end++;
      for (let j = i; j < end; j++) result[ordered[j].index] = (i + 1 + end) / 2;
      i = end;
    }
    return result;
  }
  function rankIC(scores, returns) {
    if (!Array.isArray(scores) || !Array.isArray(returns) || scores.length !== returns.length) throw new Error('IC 配对长度不一致');
    const pairs = scores.map((s, i) => [s, returns[i]]).filter(p => p.every(Number.isFinite));
    if (pairs.length < 3) return null;
    const x = ranks(pairs.map(p => p[0]));
    const y = ranks(pairs.map(p => p[1]));
    const mx = mean(x), my = mean(y);
    let numerator = 0, dx = 0, dy = 0;
    x.forEach((v, i) => { numerator += (v - mx) * (y[i] - my); dx += (v - mx) ** 2; dy += (y[i] - my) ** 2; });
    return dx === 0 || dy === 0 ? null : numerator / Math.sqrt(dx * dy);
  }
  function performance(returns) {
    const nav = [1];
    let peak = 1, maxDrawdown = 0;
    returns.forEach(r => {
      if (!Number.isFinite(r) || r <= -1) throw new Error('收益必须有限且大于 -100%');
      const next = nav[nav.length - 1] * (1 + r);
      nav.push(next); peak = Math.max(peak, next); maxDrawdown = Math.max(maxDrawdown, 1 - next / peak);
    });
    return { totalReturn: returns.length ? nav[nav.length - 1] - 1 : null, maxDrawdown: returns.length ? maxDrawdown : null, nav };
  }
  function normalizePreferences(input) {
    const defaults = Object.fromEntries(FACTORS.map(f => [f.id, 0.25]));
    if (input === undefined) return defaults;
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !Object.hasOwn(defaults, k))) throw new Error('未知因子偏好');
    const values = FACTORS.map(f => Object.hasOwn(input, f.id) ? input[f.id] : 0);
    const total = values.reduce((a, b) => a + b, 0);
    if (values.some(v => !Number.isFinite(v) || v < 0) || !Number.isFinite(total) || total <= 0) throw new Error('因子偏好须非负，且至少一个大于零');
    return Object.fromEntries(FACTORS.map((f, i) => [f.id, values[i] / total]));
  }
  function createHistory() {
    return Array.from({ length: 42 }, (_, t) => {
      const returns = { Cash: 0.001 }, fundamentals = {};
      SECTORS.forEach((s, i) => {
        returns[s.id] = 0.006 + 0.035 * Math.sin(t * 0.67 + i * 1.3) + 0.025 * Math.cos(t * 1.17 - i * 0.9) + 0.009 * Math.sin(t * (i + 2));
        fundamentals[s.id] = { ep: 0.035 + i * 0.005 + 0.017 * Math.cos(t * 0.31 + i), roe: 0.11 + 0.018 * i + 0.055 * Math.sin(t * 0.23 + i * 1.5), observedAt: t + 1, availableAt: t + 1 };
      });
      return { month: t + 1, returns, fundamentals };
    });
  }
  function signals(history, monthIndex, input) {
    if (!Array.isArray(history) || !Number.isInteger(monthIndex) || monthIndex < 6 || monthIndex > history.length) throw new Error('需要六个月事前历史');
    const preferences = normalizePreferences(input);
    const rows = SECTORS.map(sector => {
      const prior = history.slice(monthIndex - 6, monthIndex).map(row => row.returns[sector.id]);
      if (prior.some(r => !Number.isFinite(r) || r <= -1)) throw new Error('事前收益不完整');
      let latest = null;
      for (let t = 0; t < monthIndex; t++) {
        const f = history[t].fundamentals[sector.id];
        if (f && Number.isFinite(f.observedAt) && Number.isFinite(f.availableAt) && f.observedAt <= f.availableAt && f.availableAt <= monthIndex && (!latest || f.observedAt > latest.observedAt)) latest = f;
      }
      return { id: sector.id, name: sector.name, availableAt: monthIndex, raw: {
        Momentum: prior.reduce((wealth, r) => wealth * (1 + r), 1) - 1,
        Value: latest && Number.isFinite(latest.ep) ? latest.ep : null,
        Quality: latest && Number.isFinite(latest.roe) ? latest.roe : null,
        LowVol: -stdev(prior)
      }, scores: {} };
    });
    FACTORS.forEach(f => {
      const valid = rows.filter(row => Number.isFinite(row.raw[f.id]));
      const ranked = ranks(valid.map(row => row.raw[f.id]));
      rows.forEach(row => { row.scores[f.id] = null; });
      valid.forEach((row, i) => { row.scores[f.id] = valid.length > 1 ? 100 * (ranked[i] - 1) / (valid.length - 1) : null; });
    });
    rows.forEach(row => { row.score = FACTORS.some(f => preferences[f.id] > 0 && row.scores[f.id] === null) ? null : FACTORS.reduce((sum, f) => sum + preferences[f.id] * (row.scores[f.id] || 0), 0); });
    return rows.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
  function analyze(input, history = createHistory()) {
    const preferences = normalizePreferences(input);
    if (!Array.isArray(history) || history.length !== 42) throw new Error('历史必须为六个月预热与三十六个月回测；不得追加游戏未来');
    history.forEach((row, i) => {
      if (!row || row.month !== i + 1 || !row.returns || !row.fundamentals || SECTORS.some(s => !row.fundamentals[s.id] || !Number.isFinite(row.returns[s.id]) || row.returns[s.id] <= -1)) throw new Error('历史时序或数据无效');
    });
    const months = [];
    for (let t = 6; t < 42; t++) {
      const rankings = signals(history, t, preferences);
      if (rankings.some(row => row.score === null)) throw new Error('综合信号缺失，不能生成完整回测');
      const top = rankings.slice(0, 2).map(row => row.id), bottom = rankings.slice(-2).map(row => row.id);
      const forward = history[t].returns;
      const strategyReturn = mean(top.map(id => forward[id]));
      const ic = Object.fromEntries(FACTORS.map(f => [f.id, rankIC(rankings.map(row => row.scores[f.id]), rankings.map(row => forward[row.id]))]));
      months.push({ month: t - 5, decisionTime: t, rankings, top, bottom, tied: rankings.some((row, i) => i > 0 && row.score === rankings[i - 1].score), strategyReturn, benchmarkReturn: mean(SECTORS.map(s => forward[s.id])), spread: strategyReturn - mean(bottom.map(id => forward[id])), ic });
    }
    const strategy = performance(months.map(m => m.strategyReturn));
    const benchmark = performance(months.map(m => m.benchmarkReturn));
    return {
      label: '36 个月合成历史 · 方法练习', dataVersion: 'investigation-synthetic-v1', sampleCount: months.length, lookback: 6,
      preferences, strategy, benchmark, excessReturn: strategy.totalReturn - benchmark.totalReturn, meanSpread: mean(months.map(m => m.spread)), months,
      factors: FACTORS.map(f => { const valid = months.map(m => m.ic[f.id]).filter(Number.isFinite); return { id: f.id, name: f.name, meanIC: mean(valid), validMonths: valid.length, missingMonths: months.length - valid.length }; }),
      note: '六个月预热后逐月以事前综合分数选前二，各持有 50%；后两名仅用于 Top–Bottom 比较。基准为五板块每月等权，Cash 不参与排序。并列以 sectorId 排序，IC 用平均秩；交易成本为零。全部历史由固定公式合成，样本内反复调参有选择偏差，不报告显著性，也不证明现实有效。',
      methods: METHODS
    };
  }
  return { FACTORS, SECTORS, REAL_CASE, METHODS, createHistory, signals, analyze, normalizePreferences, rankIC, performance };
});
