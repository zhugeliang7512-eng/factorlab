(function () {
  'use strict';
  let selectedId = '', compareId = '', range = 'all', showWarmup = false, compareMode = false;

  function pointsOf(record) {
    return (record?.data?.points || []).filter(point => showWarmup || point.day >= 0);
  }
  function sliceRange(points) {
    const size = Number(range);
    return Number.isFinite(size) && size > 0 ? points.slice(-size) : points;
  }
  function dayLabel(point, tr) {
    return point.day < 0 ? tr('D−' + Math.abs(point.day), 'D−' + Math.abs(point.day)) : 'D' + point.day;
  }
  function summary(points, tr, num) {
    if (!points.length) return '';
    const first = points[0], last = points.at(-1), change = first.value ? last.value / first.value - 1 : null;
    return `<div class="price-summary"><div><span>${tr('区间起点','Range start')}</span><strong>${num(first.value, 4)}</strong><small>${dayLabel(first, tr)}</small></div><div><span>${tr('区间终点','Range end')}</span><strong>${num(last.value, 4)}</strong><small>${dayLabel(last, tr)}</small></div><div><span>${tr('区间涨跌','Range change')}</span><strong class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : '—'}</strong><small>${tr('价格口径','Price basis')}</small></div></div>`;
  }

  function render(root, ctx) {
    const { records, view, tr, esc, num, title, securityName, meta, actions, bindActions, FactorVisuals } = ctx;
    if (!root || !view) return;
    const prices = records.filter(record => /price|market/.test(String(record.type).toLowerCase()) && Array.isArray(record.data?.points));
    if (!prices.length) {
      root.innerHTML = `<h2>${tr('价格材料尚不可用','Price material unavailable')}</h2><p>${tr('当前快照未提供证券价格。','This snapshot does not contain security prices.')}</p>`;
      return;
    }
    const ids = prices.map(record => record.instrumentIds?.[0]).filter(Boolean);
    if (!ids.includes(selectedId)) selectedId = ids[0];
    if (!ids.includes(compareId) || compareId === selectedId) compareId = ids.find(id => id !== selectedId) || selectedId;
    const primary = prices.find(record => record.instrumentIds?.includes(selectedId)) || prices[0];
    const secondary = prices.find(record => record.instrumentIds?.includes(compareId)) || null;
    const primaryPoints = sliceRange(pointsOf(primary));
    const secondaryPoints = secondary ? sliceRange(pointsOf(secondary)) : [];
    const commonDays = new Set(secondaryPoints.map(point => point.day));
    const pairs = primaryPoints.filter(point => commonDays.has(point.day));
    const canCompare = compareMode && pairs.length > 1;
    const baseA = pairs[0]?.value || primaryPoints[0]?.value || 1;
    const baseB = secondaryPoints.find(point => point.day === pairs[0]?.day)?.value || 1;
    const rows = canCompare ? pairs.map(point => {
      const other = secondaryPoints.find(candidate => candidate.day === point.day);
      return { day: point.day, primary: point.value / baseA, comparison: other.value / baseB };
    }) : primaryPoints.map(point => ({ day: point.day, primary: point.value }));
    const latest = primaryPoints.at(-1);
    const change = primaryPoints.length > 1 ? latest.value / primaryPoints[0].value - 1 : null;
    const warmupVisible = showWarmup && primaryPoints.some(point => point.day < 0);
    const selection = primaryPoints.length ? { from: primaryPoints[0].day, to: latest.day } : {};
    const options = (list, selected) => list.map(id => `<option value="${esc(id)}" ${id === selected ? 'selected' : ''}>${esc(securityName(id))}</option>`).join('');

    root.innerHTML = `<div class="panel-head"><h2>${tr('证券价格与比较','Security prices & comparison')}</h2><span class="source-badge">${tr('模拟价格 · USD/股','Simulated price · USD/share')}</span></div>
      <div class="evidence-toolbar market-toolbar"><label>${tr('证券','Security')} <select id="market-instrument">${options(ids, selectedId)}</select></label><label>${tr('区间','Range')} <select id="market-range"><option value="all" ${range === 'all' ? 'selected' : ''}>${tr('开局至今','Since D0')}</option>${[10,30,90,365].map(size => `<option value="${size}" ${String(size) === String(range) ? 'selected' : ''}>${size}${tr(' 个观测',' observations')}</option>`).join('')}</select></label><label class="market-toggle"><input id="market-compare" type="checkbox" ${compareMode ? 'checked' : ''}> ${tr('同起点比较','Compare from same start')}</label><label class="market-toggle"><input id="market-warmup" type="checkbox" ${showWarmup ? 'checked' : ''}> ${tr('包含热身段','Include warm-up')}</label></div>
      ${compareMode ? `<div class="evidence-toolbar market-toolbar"><label>${tr('对比证券','Compare with')} <select id="market-compare-instrument">${options(ids.filter(id => id !== selectedId), compareId)}</select></label></div>` : ''}
      <div class="price-readout"><span>${tr('最近可见报价','Latest visible quote')}</span><strong>${num(latest?.value, 2)} <small>USD</small></strong><time>${esc(latest?.time?.slice(0, 10) || '')} · ${dayLabel(latest || { day: 0 }, tr)}</time><span class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : tr('下一日形成涨跌','Change forms next day')}</span></div>
      <p class="market-mode-note">${compareMode ? tr('两条线都以区间内第一个共同可见报价归一为 100；只能比较相对走势，不能比较绝对价格。','Both lines are normalized to 100 at the first common visible quote. Compare relative paths, not absolute prices.') : tr('图为原始教学报价，单位是美元/股。价格不是行业指数点位。','This chart shows the raw teaching quote in USD/share, not an index level.')}</p><button class="text-button price-data-jump" id="open-price-data">${tr('打开价格数据表','Open price data table')}</button>
      ${warmupVisible ? `<p class="market-warmup-note">${tr('热身段 D−30 至 D−1 共用一条教学曲线，只用于熟悉界面；它不进入日频因子样本或组合收益。','Warm-up D−30 to D−1 shares one teaching curve for interface practice. It does not enter daily factor samples or portfolio returns.')}</p>` : ''}
      <div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('图表脚本未加载，价格数据仍可查看。','Chart script did not load. Price data remain available.')}</p>
      ${primaryPoints.length > 1 ? summary(primaryPoints, tr, num) : `<p class="chart-empty-note">${tr('D0 只有一个报价点；下一日才形成涨跌。','D0 has only one quote; a change forms on the next day.')}</p>`}
      <details class="price-data"><summary>${tr('查看价格数据','View price data')} · ${primaryPoints.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('日期','Date')}</th>${canCompare ? `<th>${esc(securityName(selectedId))} ${tr('归一值','normalized')}</th><th>${esc(securityName(compareId))} ${tr('归一值','normalized')}</th>` : `<th>${tr('价格 USD','Price USD')}</th>`}</tr></thead><tbody>${rows.map(row => `<tr><td>${dayLabel(row, tr)}</td>${canCompare ? `<td>${num(row.primary, 3)}</td><td>${num(row.comparison, 3)}</td>` : `<td>${num(row.primary, 4)}</td>`}</tr>`).join('')}</tbody></table></div></details>
      ${warmupVisible ? `<details class="warmup-explain"><summary>${tr('热身段是什么？','What is the warm-up?')}</summary><p>${tr('为熟悉界面而编写的 30 个观测，所有证券在热身段共用同一比例路径；不能把它当作行业差异或本局收益。','Thirty authored observations for interface practice. All securities share the same proportional path in the warm-up; do not read it as sector differentiation or campaign performance.')}</p></details>` : ''}
      ${meta(primary)}${actions(primary, selection)}
      <details class="evidence-explanation"><summary>${tr('如何解读','Interpretation')}</summary><p>${esc(primary.interpretation?.[document.documentElement.lang] || primary.interpretation?.en || '')}</p></details>`;

    const chartRows = canCompare ? rows.map(row => ({ label: dayLabel(row, tr), primary: row.primary, comparison: row.comparison })) : rows.map(row => ({ label: dayLabel(row, tr), primary: row.primary }));
    FactorVisuals.chart(root.querySelector('#evidence-price-chart'), {
      rows: chartRows,
      series: canCompare
        ? [{ key: 'primary', name: securityName(selectedId), color: '#675c48' }, { key: 'comparison', name: securityName(compareId), color: '#8d9b8d', dash: true }]
        : [{ key: 'primary', name: securityName(selectedId), color: '#675c48' }],
      label: compareMode ? tr('同起点归一价格比较','Normalized price comparison') : tr('教学证券价格','Teaching security price'),
      format: value => num(value, canCompare ? 3 : 2),
      xLabel: row => row.label,
      markLine: warmupVisible ? { value: 'D0', label: tr('D0 开局','D0 start') } : null
    });
    root.querySelector('#open-price-data')?.addEventListener('click', () => { const details = root.querySelector('.price-data'); if (details) { details.open = true; details.scrollIntoView({ block: 'start', behavior: 'smooth' }); } });
    root.querySelector('#market-instrument').onchange = event => { selectedId = event.target.value; if (selectedId === compareId) compareId = ids.find(id => id !== selectedId) || selectedId; render(root, ctx); };
    root.querySelector('#market-range').onchange = event => { range = event.target.value; render(root, ctx); };
    root.querySelector('#market-compare').onchange = event => { compareMode = event.target.checked; render(root, ctx); };
    root.querySelector('#market-warmup').onchange = event => { showWarmup = event.target.checked; render(root, ctx); };
    if (root.querySelector('#market-compare-instrument')) root.querySelector('#market-compare-instrument').onchange = event => { compareId = event.target.value; render(root, ctx); };
    bindActions(root);
  }
  window.FactorLabMarketView = { render, reset() { selectedId = ''; compareId = ''; range = 'all'; showWarmup = false; compareMode = false; } };
})();
