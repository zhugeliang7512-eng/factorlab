(function () {
  'use strict';
  let selectedId = '', compareId = '', range = 'all', scope = 'security', showWarmup = false, compareMode = false;

  function sliceRange(points) {
    const size = Number(range);
    return Number.isFinite(size) && size > 0 ? points.slice(-size) : points;
  }

  function dayLabel(point) {
    return point.day < 0 ? 'D−' + Math.abs(point.day) : 'D' + point.day;
  }

  function basketSeries(view, sector) {
    const ledger = view.ledger;
    const dates = new Map((ledger?.history || []).map(row => [row.day, row.asOf]));
    return (ledger?.baskets || []).map((basket, index) => {
      let level = 100;
      const points = [];
      for (const row of view.history) {
        if (row.day > view.day) break;
        if (row.day !== 0) {
          const dailyReturn = row.sectorReturns?.[index];
          if (!Number.isFinite(dailyReturn)) break;
          level *= 1 + dailyReturn;
        }
        points.push({day:row.day, time:dates.get(row.day), value:level});
      }
      return {id:'sector-' + index, name:sector ? sector(index) : basket.id, points};
    }).filter(item => item.points.length);
  }

  function summary(points, tr, num, unit) {
    if (points.length < 2) return `<p class="chart-empty-note">${tr('当前区间只有一个点，下一日才形成涨跌。','Only one point is available in this interval. A change forms on the next day.')}</p>`;
    const first = points[0], last = points.at(-1), change = first.value ? last.value / first.value - 1 : null;
    return `<div class="price-summary"><div><span>${tr('区间起点','Range start')}</span><strong>${num(first.value, 4)}</strong><small>${dayLabel(first)} · ${unit}</small></div><div><span>${tr('区间终点','Range end')}</span><strong>${num(last.value, 4)}</strong><small>${dayLabel(last)} · ${unit}</small></div><div><span>${tr('区间涨跌','Range change')}</span><strong class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : '—'}</strong></div></div>`;
  }

  function render(root, ctx) {
    const {records, view, tr, esc, num, securityName, sector, meta, actions, bindActions, FactorVisuals} = ctx;
    if (!root || !view) return;
    const quotes = records.filter(record => record.type === 'price' && Array.isArray(record.data?.points))
      .map(record => {
        const id = record.instrumentIds[0];
        return {id, name:securityName(id), points:record.data.points, record};
      });
    const baskets = basketSeries(view, sector);
    if (!baskets.length) scope = 'security';
    const basketMode = scope === 'basket', includeWarmup = !basketMode && showWarmup;
    const series = basketMode ? baskets : quotes;
    if (!series.length) {
      root.innerHTML = `<h2>${tr('价格材料尚不可用','Price material unavailable')}</h2><p>${tr('当前快照未提供证券价格。','This snapshot does not contain security prices.')}</p>`;
      return;
    }
    const primary = series.find(item => item.id === selectedId) || series[0];
    selectedId = primary.id;
    const alternatives = series.filter(item => item.id !== selectedId);
    const secondary = alternatives.find(item => item.id === compareId) || alternatives[0];
    compareId = secondary?.id || '';
    const visible = item => sliceRange(item.points.filter(point => includeWarmup || point.day >= 0));
    const primaryPoints = visible(primary), secondaryPoints = secondary ? visible(secondary) : [];
    const secondaryByDay = new Map(secondaryPoints.map(point => [point.day, point.value]));
    const pairs = primaryPoints.filter(point => secondaryByDay.has(point.day));
    const baseA = pairs[0]?.value, baseB = secondaryByDay.get(pairs[0]?.day);
    const canCompare = compareMode && baseA > 0 && baseB > 0;
    const rows = canCompare ? pairs.map(point => ({day:point.day, primary:100 * (point.value / baseA), comparison:100 * (secondaryByDay.get(point.day) / baseB)}))
      : primaryPoints.map(point => ({day:point.day, primary:point.value}));
    const summaryPoints = canCompare ? rows.map(row => ({day:row.day, value:row.primary})) : primaryPoints;
    const latest = primaryPoints.at(-1);
    const change = primaryPoints.length > 1 ? latest.value / primaryPoints[0].value - 1 : null;
    const warmupVisible = includeWarmup && rows.some(point => point.day < 0);
    const selection = latest ? {from:primaryPoints[0].day, to:latest.day} : {};
    const unit = basketMode ? tr('点','points') : 'USD';
    const heading = basketMode ? tr('模拟行业篮子','Simulated sector baskets') : tr('证券价格与比较','Security prices & comparison');
    const normalized = tr('指数（起点 100）','Index (start 100)');
    const options = (items, selected) => items.map(item => `<option value="${esc(item.id)}" ${item.id === selected ? 'selected' : ''}>${esc(item.name)}</option>`).join('');
    const note = canCompare ? tr('区间第一个共同可见点设为 100，用于比较相对走势。','The first common observation is set to 100 to compare relative paths.')
      : basketMode ? tr('D0 为 100。按本局已发生的篮子收益逐日复利。','D0 starts at 100. The index compounds observed daily basket returns from this campaign.')
      : tr('教学证券报价，单位为美元/股。','Teaching security quotes in USD/share.');
    const provenance = basketMode ? `<details class="material-provenance"><summary>${tr('来源与计算口径','Source & method')}</summary><p>${tr('每日本行业篮子收益为成分证券报价收益按既定篮子权重加权，再逐日复利；不含现金、交易费或用户持仓影响。','Each basket’s daily return is the constituent price returns weighted by the fixed basket weights and then compounded. This excludes cash, fees, and user holdings.')}</p></details>`
      : `${meta(primary.record)}${actions(primary.record, selection)}<details class="evidence-explanation"><summary>${tr('如何解读','Interpretation')}</summary><p>${esc(primary.record.interpretation?.[document.documentElement.lang] || primary.record.interpretation?.en || '')}</p></details>`;

    root.innerHTML = `<div class="panel-head"><h2>${heading}</h2><span class="source-badge">${basketMode ? tr('模拟指数 · 点','Simulated index · points') : tr('模拟价格 · USD/股','Simulated price · USD/share')}</span></div>
      <div class="evidence-toolbar market-toolbar">
        ${baskets.length ? `<label>${tr('数据类型','Data type')} <select id="market-scope"><option value="security" ${basketMode ? '' : 'selected'}>${tr('个股价格','Security prices')}</option><option value="basket" ${basketMode ? 'selected' : ''}>${tr('行业篮子','Sector baskets')}</option></select></label>` : ''}
        <label>${basketMode ? tr('行业','Sector') : tr('证券','Security')} <select id="market-instrument">${options(series, selectedId)}</select></label>
        <label>${tr('区间','Range')} <select id="market-range"><option value="all" ${range === 'all' ? 'selected' : ''}>${includeWarmup ? tr('全部可见','All visible') : tr('开局至今','Since D0')}</option>${[10,30,90,365].map(size => `<option value="${size}" ${String(size) === String(range) ? 'selected' : ''}>${size}${tr(' 个观测',' observations')}</option>`).join('')}</select></label>
        <label class="market-toggle"><input id="market-compare" type="checkbox" ${compareMode ? 'checked' : ''} ${alternatives.length ? '' : 'disabled'}> ${tr('同起点比较','Compare from same start')}</label>
        ${basketMode ? '' : `<label class="market-toggle"><input id="market-warmup" type="checkbox" ${showWarmup ? 'checked' : ''}> ${tr('包含热身段','Include warm-up')}</label>`}
        ${compareMode && secondary ? `<label>${basketMode ? tr('对比行业','Compare sector') : tr('对比证券','Compare security')} <select id="market-compare-instrument">${options(alternatives, compareId)}</select></label>` : ''}
      </div>
      <div class="price-readout"><span>${basketMode ? tr('最近可见指数','Latest visible index') : tr('最近可见报价','Latest visible quote')}</span><strong>${num(latest?.value, 2)} <small>${unit}</small></strong><time>${latest ? esc(latest.time?.slice(0, 10) || '') + ' · ' + dayLabel(latest) : '—'}</time><span class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : tr('下一日形成涨跌','Change forms next day')}</span></div>
      <p class="market-mode-note">${note}</p><button class="text-button price-data-jump" id="open-price-data">${tr('打开数据表','Open data table')}</button>
      ${warmupVisible ? `<p class="market-warmup-note">${tr('热身段 D−30 至 D−1 共用一条教学曲线，只用于熟悉界面；它不进入日频因子样本或组合收益。','Warm-up D−30 to D−1 shares one teaching curve for interface practice. It does not enter daily factor samples or portfolio returns.')}</p>` : ''}
      <div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('当前为基础折线图，完整数据可在下表查看。','Showing the basic chart. Full values are available in the table below.')}</p>
      ${summary(summaryPoints, tr, num, canCompare ? tr('点','points') : unit)}
      <details class="price-data"><summary>${basketMode ? tr('查看指数数据','View index data') : tr('查看价格数据','View price data')} · ${rows.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('模拟日','Simulation day')}</th>${canCompare ? `<th>${esc(primary.name)} ${normalized}</th><th>${esc(secondary.name)} ${normalized}</th>` : `<th>${basketMode ? tr('指数点位','Index level') : tr('价格 USD','Price USD')}</th>`}</tr></thead><tbody>${rows.map(row => `<tr><td>${dayLabel(row)}</td><td>${num(row.primary, canCompare ? 3 : 4)}</td>${canCompare ? `<td>${num(row.comparison, 3)}</td>` : ''}</tr>`).join('')}</tbody></table></div></details>
      ${warmupVisible ? `<details class="warmup-explain"><summary>${tr('热身段是什么？','What is the warm-up?')}</summary><p>${tr('为熟悉界面而编写的 30 个观测，所有证券在热身段共用同一比例路径。','Thirty authored observations for interface practice. All securities share the same proportional path in the warm-up.')}</p></details>` : ''}
      ${provenance}`;

    const plot = [{key:'primary', name:primary.name, color:'#675c48'}];
    if (canCompare) plot.push({key:'comparison', name:secondary.name, color:'#496653', dash:true});
    FactorVisuals.chart(root.querySelector('#evidence-price-chart'), {
      rows, series:plot, label:canCompare ? tr('同起点归一价格比较','Normalized price comparison') : heading,
      format:value => num(value, canCompare ? 3 : 2), xLabel:dayLabel,
      markLine:warmupVisible ? {value:'D0', label:tr('D0 开局','D0 start')} : null
    });
    root.querySelector('#open-price-data').onclick = () => {
      const details = root.querySelector('.price-data');
      details.open = true;
      details.scrollIntoView({block:'start', behavior:'smooth'});
    };
    root.querySelector('#market-scope')?.addEventListener('change', event => {scope = event.target.value; render(root, ctx);});
    root.querySelector('#market-instrument').onchange = event => {
      selectedId = event.target.value;
      if (selectedId === compareId) compareId = primary.id;
      render(root, ctx);
    };
    root.querySelector('#market-range').onchange = event => {range = event.target.value; render(root, ctx);};
    root.querySelector('#market-compare').onchange = event => {compareMode = event.target.checked; render(root, ctx);};
    root.querySelector('#market-warmup')?.addEventListener('change', event => {showWarmup = event.target.checked; render(root, ctx);});
    root.querySelector('#market-compare-instrument')?.addEventListener('change', event => {compareId = event.target.value; render(root, ctx);});
    bindActions(root);
  }

  window.FactorLabMarketView = {render, reset() {selectedId = ''; compareId = ''; range = 'all'; scope = 'security'; showWarmup = false; compareMode = false;}};
})();
