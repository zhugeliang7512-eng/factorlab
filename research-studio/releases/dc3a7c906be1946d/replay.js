(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const en = () => document.documentElement.lang === 'en';
  const tr = (zh, english) => en() ? english : zh;
  const data = () => window.FactorLabReplay;
  let releaseId = '', sourceChoice = '';
  const revealed = new Set();

  function valueText(value, unit) {
    if (value === null || value === undefined) return tr('本案例未提供','Not provided in this case');
    return String(value) + (unit ? ' ' + unit : '');
  }
  function releaseRows(release) {
    const units = release.units || {};
    const payrollText = value => value === null || value === undefined ? tr('本案例未提供','Not provided in this case') : (en() ? value + 'k' : (value / 10).toFixed(1) + ' 万');
    const percentText = value => value === null || value === undefined ? tr('本案例未提供','Not provided in this case') : value + '%';
    if (release.indicator.includes('Employment')) {
      const current = release.current || {}, previous = release.previousPublished || {}, revision = release.revision || {};
      const revisionNote = revision.nonfarmPayrolls === null || revision.nonfarmPayrolls === undefined ? tr('本次公告未提供上一期修订值','No prior-month revision in this release') : (en() ? revision.note : `上一期非农就业从 ${payrollText(previous.nonfarmPayrolls)} 修订为 ${payrollText(revision.nonfarmPayrolls)}${revision.unemploymentRate === undefined ? '' : `；失业率 ${percentText(revision.unemploymentRate)}`}。`);
      return [
        [tr('本期非农就业','Current payroll change'), payrollText(current.nonfarmPayrolls)],
        [tr('本期失业率','Current unemployment rate'), percentText(current.unemploymentRate)],
        [tr('上期首次公布','Prior first print'), payrollText(previous.nonfarmPayrolls)],
        [tr('上期本次修订','Prior revised in this release'), payrollText(revision.nonfarmPayrolls)],
        [tr('修订说明','Revision note'), revisionNote]
      ];
    }
    const current = release.current || {};
    return [
      [tr('CPI 环比（季调）','CPI month over month (SA)'), percentText(current.cpiMonthOverMonth)],
      [tr('CPI 同比（未季调）','CPI year over year (NSA)'), percentText(current.cpiYearOverYear)],
      [tr('季调口径','Seasonal adjustment'), release.seasonalAdjustment]
    ];
  }

  function renderNews(host, context) {
    const api = data();
    if (!host || !api) return;
    if (!releaseId || !api.byId(releaseId)) releaseId = api.RELEASES[0].id;
    const release = api.byId(releaseId);
    const isRevealed = revealed.has(release.id);
    host.innerHTML = `<div class="panel-head"><h2>${tr('真实宏观发布回放','Real macro release replay')}</h2><span class="source-badge">${tr('真实历史 · 不进入合成收益','Real history · not in synthetic returns')}</span></div>
      <p class="replay-intro">${tr('三份历史公告、两类发布、三个核心指标。先看发布前已知，再点击公布本期数据；真实发布日期与游戏模拟日分开显示。','Three historical releases, two release types and three core indicators. Read what was known first, then reveal the release; actual dates and simulation days are shown separately.')}</p>
      <div class="release-tabs" role="tablist">${api.RELEASES.map(item => `<button data-release-id="${esc(item.id)}" aria-pressed="${item.id === release.id}">${esc(item.period)}<small>${esc(item.indicator.includes('CPI') ? 'CPI' : tr('就业报告','Employment'))}</small></button>`).join('')}</div>
      <article class="release-card">
        <div class="release-meta"><span>${esc(release.institution)}</span><span>${esc(release.period)}</span></div>
        <h3>${esc(release.indicator)}</h3>
        <div class="release-clock"><span>${tr('真实发布','Actual release')}: ${esc(release.releaseLocal)}</span><span>${tr('模拟日','Simulation day')}: D${Number(context?.day || 0)} ${tr('（与真实日期无映射）','(no mapping to real dates)')}</span></div>
        <div class="known-before"><strong>${tr('发布前已知','Known before release')}</strong><ul>${release.knownBefore.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
        ${isRevealed ? `<table class="release-values"><tbody>${releaseRows(release).map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table><div class="release-practice"><strong>${tr('核对练习','Check your reading')}</strong><p>${esc(release.practice.question)}</p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(release.practice.answer)}</p></details></div>` : `<button id="reveal-release" class="primary">${tr('公布本期数据','Reveal this release')}</button><p class="footnote">${tr('点击后才会显示本期值和此次修订；六月回放不会提前出现七月的修订。','The current value and this release’s revision stay hidden until you click. The June replay cannot show the July revision early.')}</p>`}
        <div class="expectation-note"><strong>${tr('市场预期','Market expectation')}:</strong> ${tr('暂无可核验数据。没有具备来源、发布时间和使用许可的一致预期，不判断“超预期”。','No verifiable data. Without sourced, timestamped and licensed consensus estimates, this page does not judge a “surprise”.')}</div>
        <p class="release-caveat">${esc(release.caveat)}</p>
        <a href="${esc(release.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(release.sourceLabel)}</a>
      </article>
      <details class="consumer-confidence"><summary>${esc(api.CONSUMER_CONFIDENCE.title[en() ? 'en' : 'zh-CN'])}</summary><p>${esc(api.CONSUMER_CONFIDENCE.body[en() ? 'en' : 'zh-CN'])}</p><p>${api.CONSUMER_CONFIDENCE.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join(' · ')}</p></details>
      <article class="source-check"><h3>${esc(api.SOURCE_CHECK.title[en() ? 'en' : 'zh-CN'])}</h3><p class="source-claim">${esc(api.SOURCE_CHECK.claim[en() ? 'en' : 'zh-CN'])}</p><div class="source-options">${api.SOURCE_CHECK.options.map(option => `<label><input type="radio" name="source-check" value="${esc(option.id)}" ${sourceChoice === option.id ? 'checked' : ''}> ${esc(option.label[en() ? 'en' : 'zh-CN'])}</label>`).join('')}</div><button id="check-source" class="secondary">${tr('核对这份说法','Check this claim')}</button><p id="source-feedback" class="source-feedback" role="status"></p></article>
      <p class="replay-boundary">${esc(api.RELEASE_NOTE[en() ? 'en' : 'zh-CN'])}</p>`;
    host.querySelectorAll('[data-release-id]').forEach(button => button.onclick = () => { releaseId = button.dataset.releaseId; renderNews(host, context); });
    host.querySelector('#reveal-release')?.addEventListener('click', () => { revealed.add(release.id); renderNews(host, context); });
    host.querySelectorAll('input[name="source-check"]').forEach(input => input.onchange = () => { sourceChoice = input.value; });
    host.querySelector('#check-source')?.addEventListener('click', () => {
      const feedback = host.querySelector('#source-feedback');
      if (!sourceChoice) { feedback.textContent = tr('先选择一个核对来源。','Choose a source first.'); return; }
      const correct = sourceChoice === api.SOURCE_CHECK.answer;
      feedback.dataset.result = correct ? 'correct' : 'retry';
      feedback.textContent = correct ? api.SOURCE_CHECK.feedback[en() ? 'en' : 'zh-CN'] : tr('这份材料不能直接核对公司订单。请选择公司公告、财报或可验证的订单披露。','That document cannot verify the company’s orders. Choose company filings or verifiable order disclosures.');
    });
  }

  function optionsIntro(quote) {
    const api = data();
    if (!api) return '';
    const cases = api.OPTION_CASES.map(item => `<article class="case-card"><span class="source-badge">${tr('真实案例','Real case')}</span><h3>${esc(item.title[en() ? 'en' : 'zh-CN'])}</h3>${item.facts.map(fact => `<p>${esc(fact[en() ? 'en' : 'zh-CN'])}</p>`).join('')}<p><strong>${esc(item.question[en() ? 'en' : 'zh-CN'])}</strong></p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(item.answer[en() ? 'en' : 'zh-CN'])}</p></details><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('');
    const quoteHTML = quote ? `<div class="option-quote-card"><span class="source-badge">${tr('教学报价','Teaching quote')}</span><h3>${esc(quote.kind)} · ${tr('行权价','Strike')} ${esc(quote.strike)} · ${esc(quote.expiry)}</h3><dl><div><dt>Bid</dt><dd>${esc(quote.bid)}</dd></div><div><dt>Ask</dt><dd>${esc(quote.ask)}</dd></div><div><dt>${tr('成交量','Volume')}</dt><dd>${esc(quote.volume)}</dd></div><div><dt>${tr('未平仓量 OI','Open interest')}</dt><dd>${esc(quote.openInterest)}</dd></div></dl><label for="option-spread">${tr('算一算：Spread = Ask − Bid','Calculate: Spread = Ask − Bid')} <input id="option-spread" inputmode="decimal" autocomplete="off" placeholder="USD"></label><button id="check-option-spread" class="secondary">${tr('核对价差','Check spread')}</button><p id="option-spread-feedback" class="source-feedback" role="status"></p></div>` : '';
    return `<div class="concept-card"><h3>${tr('先理解权利，再看报价','Understand the right before the quote')}</h3><p>${tr('期权买方支付权利金，取得按约定条件买入（Call）或卖出（Put）相关资产的权利，而不是义务。权利金是成本，不是保证金。','An option buyer pays a premium for the right, not the obligation, to buy (call) or sell (put) an underlying asset on agreed terms. The premium is a cost, not collateral.')}</p><p>${tr('Bid 是买方愿意支付的价格，Ask 是卖方愿意接受的价格；价差是交易成本的一部分。未平仓量 OI 统计尚未平仓的合约，每份合约同时有买方与卖方。成交活跃、Call 数量增加或 OI 上升，都不能单独确定涨跌。','Bid is what a buyer is willing to pay; ask is what a seller is willing to accept; the spread is part of trading cost. Open interest counts outstanding contracts, each with a buyer and a seller. Active trading, more calls or rising OI alone cannot determine direction.')}</p>${quoteHTML}</div><h3 class="replay-subhead">${tr('两个真实事件','Two real events')}</h3><div class="case-grid">${cases}</div>`;
  }

  function bindOptions(host, quote) {
    if (!host || !quote) return;
    const input = host.querySelector('#option-spread');
    host.querySelector('#check-option-spread')?.addEventListener('click', () => {
      const feedback = host.querySelector('#option-spread-feedback');
      const answer = Math.round((Number(quote.ask) - Number(quote.bid)) * 100) / 100;
      const value = Number(String(input?.value || '').replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(value)) { feedback.textContent = tr('先输入一个数字。','Enter a number first.'); return; }
      if (Math.abs(value - answer) <= 0.011) { feedback.dataset.result = 'correct'; feedback.textContent = tr('正确：Ask − Bid = ', 'Correct: Ask − Bid = ') + answer.toFixed(2) + ' USD。' + tr('价差不是预期收益。','The spread is not an expected return.'); }
      else { feedback.dataset.result = 'retry'; feedback.textContent = tr('再算一次：用 Ask 减去 Bid，不要求方向判断。','Try again: subtract Bid from Ask; no direction call is required.'); }
    });
  }

  function industryCards() {
    const api = data();
    if (!api) return '';
    return `<section class="industry-judgment"><div class="panel-head"><h2>${tr('五个行业：一个判断与一个反例','Five industries: one judgment and one counter-example')}</h2><span class="source-badge">${tr('真实案例 · 与虚构证券分栏','Real cases · separate from fictional securities')}</span></div><p class="replay-intro">${tr('先写下长期跟踪什么，再写什么新证据会改变短期配置；每个行业都配一个可能推翻简单推断的反例。','State what to track long term, then what new evidence would change the tactical allocation; each industry includes a counter-example that can overturn a simple inference.')}</p><div class="industry-grid">${api.INDUSTRY_CASES.map(item => `<article class="industry-card"><h3>${esc(item.name[en() ? 'en' : 'zh-CN'])}</h3><p><strong>${tr('长期跟踪','Long-term')}:</strong> ${esc(item.longTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('短期证据','Tactical evidence')}:</strong> ${esc(item.shortTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('反例','Counter-example')}:</strong> ${esc(item.counterExample[en() ? 'en' : 'zh-CN'])}</p><p class="footnote">${esc(item.appliesTo[en() ? 'en' : 'zh-CN'])}</p><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('')}</div></section>`;
  }

  function fundamentalsTimeNote() {
    return `<div class="time-basis-note"><h3>${tr('四个时间不要混用','Do not mix four different dates')}</h3><ul><li><strong>${tr('报告期结束','Period end')}</strong>: ${tr('财务数字覆盖的期末。','The end of the period the numbers cover.')}</li><li><strong>${tr('对外公布','Published')}</strong>: ${tr('公告对外发布的日期。','The date the release was published.')}</li><li><strong>${tr('平台首次可见','First visible here')}</strong>: ${tr('本教学平台第一次能引用该报告的日期。','The first date this teaching platform can cite the report.')}</li><li><strong>${tr('估值报价','Price observed')}</strong>: ${tr('P/E 使用的当前教学股价日期。','The date of the teaching price used in P/E.')}</li></ul><p class="footnote">${tr('本页 P/E = 当前教学股价 ÷ 单期每股收益；ROE = 期间净利润 ÷ 期末权益。两者都不是 TTM 口径，缺失值保留为空。','P/E here = current teaching price ÷ period EPS; ROE = period net income ÷ ending equity. Neither is TTM; missing values stay empty.')}</p></div>`;
  }

  window.FactorLabReplayUI = { renderNews, optionsIntro, bindOptions, industryCards, fundamentalsTimeNote };
})();
