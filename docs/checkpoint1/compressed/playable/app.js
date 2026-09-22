'use strict';
const D = window.FACTORLAB_DATA;
const P = window.FACTORLAB_PROGRESS;
const collectionKey = 'factorlab-week3-collection-v1';
let explored = [], collectionAvailable = true;
try { explored = P.collect(JSON.parse(localStorage.getItem(collectionKey)), null, D.nodes); }
catch { collectionAvailable = false; }
function collectPath() {
  explored = P.collect(explored, state.node, D.nodes);
  try { localStorage.setItem(collectionKey, JSON.stringify(explored)); }
  catch { collectionAvailable = false; }
}
function collection() {
  return `<section class="collection"><b>Path Collection · <span data-explored>${explored.length}</span> / 27 explored</b><p class="fine">完成一局解锁一个策略 × 决策路径；重复路径只计一次。Replay 保留收藏。${collectionAvailable ? '保存在此浏览器。' : '收藏仅在当前页面保留；浏览器存储不可用。'}</p>${explored.length ? `<details><summary>查看已探索路径</summary><ul>${explored.map(id=>`<li>${D.strategies[D.nodes[id].strategy].name} · ${D.nodes[id].ledger.map(r=>D.decisions[r.decision].en).join(' → ')}</li>`).join('')}</ul></details>` : ''}</section>`;
}
function missionResult(node, record) {
  const before = node.ledger.length > 1 ? node.ledger.at(-2).drift : D.strategies[node.strategy].weights;
  return P.mission(record.round, record.weights, before, D.strategies[node.strategy].cap);
}
function enhance() {
  const node = D.nodes[state.node];
  if (state.phase === 'choose' || state.phase === 'final') app.insertAdjacentHTML('beforeend', collection());
  if (!node) return;
  const s = D.strategies[node.strategy];
  if (state.phase === 'plan' || state.phase === 'result') {
    const round = state.phase === 'result' ? node.ledger.at(-1).round : node.round;
    const mission = P.mission(round, node.weights, node.weights, s.cap);
    app.insertAdjacentHTML('afterbegin', `<section class="run-hud" aria-label="Run HUD"><div><span>NAV</span><b>${money(node.nav)}</b></div><div><span>Risk Pressure</span><b>${P.pressure(node.weights,s.cap)}%</b><small>AI 暴露 ÷ AI 参考上限；非预测风险</small></div><div><span>Cash Buffer</span><b>${pct(node.weights[5])}</b><small>${money(node.nav*node.weights[5])} 虚拟资金</small></div><div><span>Round progress</span><b>${node.ledger.length} / 2 settled</b></div></section><section class="round-mission"><b>Round Mission · ${mission.title}</b><span>${mission.description}</span></section>`);
    const draft = node.options[state.draft];
    if (state.phase === 'plan' && draft) app.querySelector('.preview').insertAdjacentHTML('beforeend', `<p class="tradeoff">${D.decisions[state.draft].reason}。${state.draft === 'boost' ? '更多参与，也承受更大下跌暴露。' : state.draft === 'buffer' ? '更多缓冲，也减少上涨参与。' : '避免主动调仓，但承受现有暴露。'}</p><label class="fine">AI 暴露 <meter min="0" max="1" value="${draft.weights[4]}"></meter></label><label class="fine">Cash 缓冲 <meter min="0" max="1" value="${draft.weights[5]}"></meter></label>`);
  }
  if (state.phase === 'final') app.querySelector('.review').insertAdjacentHTML('beforeend', `<section class="profile-badges"><h2>本局徽章</h2>${P.badges(node.ledger).map(b=>`<span class="tag">${b}</span>`).join('') || '<p>本局没有解锁行为徽章；可回看预算取舍。</p>'}<p>Round Missions · ${node.ledger.filter(r=>missionResult({...node,ledger:node.ledger.slice(0,r.round)},r).passed).length} / 2</p></section>`);
}
const app = document.querySelector('#app');
const resultDialog = document.querySelector('#result');
const learnDialog = document.querySelector('#learning');
const storageKey = 'factorlab-week3-playable-v1';
const pct = (v, signed = false) => v == null ? 'N/A' : `${signed && v > 0 ? '+' : ''}${(v * 100).toFixed(2)}%`;
const money = v => v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const pp = v => `${v > 0 ? '+' : ''}${(v * 100).toFixed(3)} pp`;
let state = {node: null, draft: null, phase: 'choose'};
let storageAvailable = true;
try {
  const saved = JSON.parse(sessionStorage.getItem(storageKey));
  if (saved && D.nodes[saved.node] && ['plan','result','final'].includes(saved.phase)) {
    const node = D.nodes[saved.node];
    if ((saved.phase === 'plan' && node.round < 3) || (saved.phase === 'result' && node.ledger.length) || (saved.phase === 'final' && node.round === 3)) {
      state = {node: saved.node, phase: saved.phase, draft: node.options[saved.draft] ? saved.draft : null};
    }
  }
} catch { storageAvailable = false; }

function save() {
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageAvailable = false; }
}
function icon(type = 'shield') {
  const shapes = {shield:'<path d="M18 3 31 8v10c0 8-13 15-13 15S5 26 5 18V8z"/><path d="m12 18 4 4 9-10"/>',compass:'<circle cx="18" cy="18" r="14"/><path d="m24 10-3 11-11 5 5-12z"/>',arrow:'<path d="M5 27 27 5M14 5h13v13M5 17v10h10"/>',trophy:'<path d="M10 4h16v10c0 8-16 8-16 0zM10 7H4v5c0 5 6 6 6 6M26 7h6v5c0 5-6 6-6 6M18 21v8M10 32h16M13 29h10"/>'};
  return `<svg class="icon" viewBox="0 0 36 36" aria-hidden="true">${shapes[type]}</svg>`;
}
function chart(ledger) {
  const values = [100000, ...ledger.map(r => r.after)];
  const benchmarks = [100000, ...ledger.map(r => r.benchmark_nav)];
  const y = v => 180 - (v - 96000) / 8000 * 155;
  const x = i => 65 + i * 210;
  const line = vs => vs.map((v,i) => `${x(i)},${y(v)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 540 218" role="img" aria-label="月末资产路径，初始 ${money(values[0])}${values.slice(1).map((v,i)=>`，第${i+1}轮 ${money(v)}`).join('')}">
    ${[96000,100000,104000].map(v=>`<path class="grid" d="M65 ${y(v)}H485"/><text x="0" y="${y(v)+4}">${v/1000}k</text>`).join('')}
    <polyline points="${line(benchmarks)}" fill="none" stroke="#a0a9b2" stroke-width="2" stroke-dasharray="5 5"/>
    <polyline points="${line(values)}" fill="none" stroke="var(--accent)" stroke-width="3"/>
    ${values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="var(--accent)"/>`).join('')}
    ${['起点','Round 1','Round 2'].map((v,i)=>`<text x="${x(i)}" y="210" text-anchor="middle">${v}</text>`).join('')}
    ${ledger.length === 0 ? '<text x="165" y="85">执行后揭示真实的本局路径</text>' : ''}</svg>`;
}
function allocation(weights) {
  const names = ['半导体','机器人与自动化','先进材料','清洁能源装备','AI / 数字基建','Cash'];
  return `<div class="allocation">${weights.map((v,i)=>`<div><span>${names[i]}</span><b>${pct(v)}</b></div>`).join('')}</div>`;
}
function choose() {
  app.innerHTML = `<div class="intro"><div><div class="eyebrow">TWO ROUNDS. REAL TRADE-OFFS.</div><h1>选择你的风格。<br>体验决策的后果。</h1><p>两条市场线索，两次关键决策。让 Strategy、Risk 和 Return 在一次短局里变得具体。</p></div><div class="route"><div><b>01</b>选择策略，建立风险预算</div><div><b>02</b>读线索 → 选动作 → 预览 → 执行</div><div><b>03</b>领取反馈，发现你的决策风格</div></div></div>
    <div class="strategy-grid">${Object.entries(D.strategies).map(([key,s])=>`<button class="strategy" data-strategy="${key}" style="--accent:${s.accent}">${icon(s.icon)}<h2>${s.name}</h2><small>${s.style} · ${s.keyword}</small><p>${s.cn}</p><div class="fine">起始 Cash ${pct(s.weights[5])} · AI ${pct(s.weights[4])}<br>每次调整最多 ${(s.shift*100).toFixed(0)} pp · AI 参考上限 ${(s.cap*100).toFixed(0)}%</div><div class="choice-label"><span>选择 ${s.name}</span><span aria-hidden="true">↗</span></div></button>`).join('')}</div>
    <p class="fine intro-note">策略决定起始配置与调仓幅度。没有最高收益排行榜；风险意识与纪律优先于短期输赢。合成教学场景，不作真实投资建议。</p>`;
}
function main() {
  const node = D.nodes[state.node];
  const settled = state.phase === 'result';
  const record = settled ? node.ledger.at(-1) : null;
  const round = settled ? record.round : node.round;
  const s = D.strategies[node.strategy];
  const draft = node.options[state.draft];
  app.innerHTML = `<div class="toolbar"><p>${settled ? '已完成结算 · 查看反馈后继续' : '读线索，做一个决定。执行前可以随时改选。'}</p><span class="tag">${s.style}</span></div><div class="game">
    <aside class="mission"><div class="eyebrow">YOUR MISSION</div><div class="round">0${round}<span> / 02</span></div><div class="progress"><i style="width:${node.ledger.length*50}%"></i></div><h3>${s.name}</h3><p class="mission-detail">${s.cn}</p><span class="tag">${s.keyword}</span><hr><div class="mission-detail"><h3>参与，也管理风险</h3><p>阅读线索；不要只猜哪项会涨。每轮只做一个动作。</p><p>AI 参考上限 ${pct(s.cap)}。这是教学风险预算，不是交易限制。</p><p>下一轮保留真实漂移持仓，不自动重置。</p></div></aside>
    <section class="panel market"><div class="clue-box"><div class="eyebrow">MARKET CLUE · ${D.clues[round-1].tag}</div><h2>${D.clues[round-1].title}</h2><p class="clue">${D.clues[round-1].text}</p></div><div class="chart-head"><span class="fine">Portfolio Value · 虚拟资金</span><b class="nav-value">${money(node.nav)}</b></div>${chart(node.ledger)}<div class="legend"><b>— Your portfolio</b><span>┄ 五板块等权 Benchmark</span></div>${allocation(node.weights)}<p class="fine" style="margin:10px 0 0">${node.ledger.length ? '当前：结算后漂移持仓' : '当前：策略起始配置'} · 显示值四舍五入</p><div class="learn-links"><button class="link-button" data-learning="why">Why This Matters</button><button class="link-button" data-learning="factors">Factor Details</button></div></section>
    <section class="panel decision"><div class="eyebrow">ONE KEY DECISION</div><h2>${settled ? '本轮已锁定' : '你会怎样行动？'}</h2><p class="sub">${settled ? D.decisions[record.decision].name : '选一个动作，先看配置变化。'}</p><div class="options">${Object.entries(D.decisions).map(([key,a])=>`<button class="option" data-decision="${key}" aria-pressed="${state.draft===key || (settled && record.decision===key)}" ${settled?'disabled':''}><strong>${a.name}</strong><span>${a.en}</span></button>`).join('')}</div><div class="preview" aria-live="polite">${draft && !settled ? `<div><span>AI exposure</span><b>${pct(node.weights[4])} → ${pct(draft.weights[4])}</b></div><div><span>Cash</span><b>${pct(node.weights[5])} → ${pct(draft.weights[5])}</b></div><div><span>Portfolio Risk</span><b class="risk">${D.decisions[state.draft].risk}</b></div><p>方向仅按 AI ↔ Cash 暴露变化判断，非预测波动率。</p>` : `<p>${settled ? '配置已结算，结果不会因重复点击改变。' : '选定动作后，这里展示 AI、Cash 和风险方向。尚未执行。'}</p>`}</div><button class="primary execute" ${settled ? 'data-result' : 'data-execute'} ${!settled&&!draft?'disabled':''}>${settled?'查看本轮反馈':'Execute · 执行本轮'}</button><p class="budget">${settled ? '事件与结果仅在执行后揭示。' : `AI 参考上限 ${pct(s.cap)} · ${draft&&draft.weights[4]>s.cap+1e-10?'当前预览超过参考上限。':'调整幅度由策略自动管理。'}`}<br>不需要手工输入百分比。</p></section></div>`;
}
function rewardBlock(r) {
  const good = r.reward.quality === 'recognized';
  return `<div class="reward ${good?'':'reflect'}">${icon(good?'trophy':'compass')}<div><div class="eyebrow">${good?'BADGE UNLOCKED':'LEARNING MOMENT'}</div><h3>${r.reward.badge}</h3><p>${r.reward.reason}</p></div>${good ? Array.from({length:12},(_,i)=>`<i class="spark" style="left:${8+i*8}%;animation-delay:${i%3*.04}s;background:${i%2?'var(--accent)':'var(--amber)'}"></i>`).join('') : ''}</div>`;
}
function showResult() {
  const node=D.nodes[state.node], r=node.ledger.at(-1), s=D.strategies[node.strategy];
  resultDialog.innerHTML=`<div class="dialog-top"><div><div class="eyebrow">ROUND ${r.round} / 2 · SETTLED</div><h2 id="result-title">${r.return_value>=0?'增长有代价，判断有价值。':'市场回撤，学习继续。'}</h2></div><button class="close" data-close-result aria-label="关闭反馈">×</button></div><div class="settlement ${r.return_value<0?'negative':'positive'}" data-return>${pct(r.return_value,true)}</div><span class="fine">Round Return · 本模拟月</span><div class="metric-row"><div class="metric"><label>Portfolio Value</label><b>${money(r.after)}</b></div><div class="metric"><label>本轮资产变化</label><b>${money(r.after-r.before)}</b></div><div class="metric"><label>Maximum Drawdown</label><b>${pct(r.maximum_drawdown)}</b></div></div><p class="reason"><b>Event · ${r.event}</b><br>${D.decisions[r.decision].name}，相对本轮不交易影响 ${pp(r.effect_vs_hold)}。${s.name} 的调整幅度上限为 ${(s.shift*100).toFixed(0)} pp，限制单次动作的影响。</p>${rewardBlock(r)}<p class="coach"><b>Coach · 规则解释</b><br>${r.decision==='buffer'?'减少 AI、增加 Cash 会降低暴露，但不能消除其他板块的损失。':r.decision==='boost'?'增加 AI 暴露会放大该板块的影响；愿意承担风险不等于一定获得回报。':'保持实际持仓是一项决策；纪律不保证每一轮都盈利。'} ${r.reward.result_note}</p><div class="dialog-actions"><span class="fine">奖励基于可见动作和风险预算，不能证明真实推理质量。回撤含初始资产，仅观察月末。</span><button class="primary" data-next>${r.round===1?'Next Round →':'查看 Player Profile →'}</button></div>`;
  const mission = missionResult(node,r);
  resultDialog.querySelector('.reward').insertAdjacentHTML('afterend', `<p class="mission-outcome"><b>Mission ${mission.passed ? 'complete' : 'reflection'} · ${mission.title}</b><br>${mission.description} 任务反馈不增加资金或收益。</p>`);
  if(!resultDialog.open) resultDialog.showModal();
}
function review() {
  const node=D.nodes[state.node], r=node.ledger.at(-1);
  app.innerHTML=`<section class="review"><div class="eyebrow">YOUR PLAYER PROFILE · TWO-ROUND REFLECTION</div><h1 class="profile-heading">${node.profile.title}</h1><p>${node.profile.explanation}</p><div class="review-grid"><div class="panel"><div class="eyebrow">THE PATH YOU CHOSE</div>${chart(node.ledger)}<div class="legend"><b>— Your portfolio</b><span>┄ Benchmark</span></div><div class="metric-row"><div class="metric"><label>Total Return</label><b class="${node.nav<100000?'negative':'positive'}">${pct(node.nav/100000-1,true)}</b></div><div class="metric"><label>Final Value</label><b>${money(node.nav)}</b></div><div class="metric"><label>Max Drawdown</label><b>${pct(r.maximum_drawdown)}</b></div></div><p class="fine">Benchmark ${money(r.benchmark_nav)} · 累计超额 ${pp((node.nav-r.benchmark_nav)/100000)}<br>Volatility ${pct(r.volatility)} · Sharpe ${r.sharpe==null?'N/A':r.sharpe.toFixed(2)}<br>n=2 模拟月，rf=0.1%/月，ddof=1，未年化；短样本不可用于真实投资评价。</p></div><div class="panel"><div class="eyebrow">CHOICE → RISK → RETURN</div><h2>风格来自选择，<br>不是一次输赢。</h2><ol>${node.ledger.map(a=>`<li><b>Round ${a.round} · ${D.decisions[a.decision].name}</b><br>${a.reward.badge} · ${pct(a.return_value,true)}<br>${a.reward.reason}</li>`).join('')}</ol><p class="fine">画像只描述这两次动作，不是心理测评或投资适当性评估。没有实际测量你的思考过程。</p><button class="primary" data-replay>Replay / Try Another Strategy →</button><div class="learn-links"><button class="link-button" data-learning="why">Why This Matters</button><button class="link-button" data-learning="factors">Factor Details</button></div></div></div></section>`;
}
function showLearning(kind) {
  const node=D.nodes[state.node], s=D.strategies[node.strategy], r=node.ledger.at(-1);
  const content = kind==='why' ? `<div class="learning-grid"><div><h3>奖励看什么？</h3><p>首先看可见行为：增加缓冲回应风险；保持持仓体现纪律；增加 AI 时对照策略参考上限。其次才描述盈亏。没有按收益高低发放更高级奖杯。</p><p>你的 ${s.name}：AI 参考上限 ${pct(s.cap)}；超过它仍允许执行，但只给反思反馈。Keep 保持漂移持仓，不偷偷恢复初始权重。</p></div><div><h3>风险是什么？</h3><p>预览 Higher / Lower 仅表示 AI 与 Cash 间的风险暴露方向，不是估计波动率或未来收益。其他四板块保持不动。</p><p>第一轮 n=1，Volatility / Sharpe 为 N/A。第二轮仍是很短的样本。回撤含初始净值，不能看到月内风险。</p></div></div>` : `<div class="learning-grid">${[['Momentum','过去较强，不保证趋势延续。'],['Value','相对便宜，也可能有经营风险。'],['Quality','盈利质量代理，不覆盖全部风险。'],['Low Volatility','过去波动较低，不代表无风险。']].map(([a,b])=>`<div><h3>${a}</h3><p>${b}</p></div>`).join('')}</div><p class="fine">本局使用已验证的合成生成模型；因子分数不等于预期收益。完整历史回测与六轮体验保留在后续范围。</p>${r?`<h3>已结算贡献 · 对初始资本的累计收益贡献</h3><table class="contributions">${D.contribution_labels.map((label,i)=>`<tr><td>${label}</td><td>${pp(r.cumulative_contributions[i])}</td></tr>`).join('')}</table><p class="fine">按每轮期初财富加权，八项合计 ${pct(node.nav/100000-1,true)}。只含已完成轮次；教学归因不等于真实市场因果识别。</p>`:'<p>执行后才会揭示已实现的因子、Market、Event、Residual 与 Cash 贡献。</p>'}`;
  learnDialog.innerHTML=`<div class="dialog-top"><h2 id="learning-title">${kind==='why'?'Why This Matters':'Factor Details'}</h2><button class="close" data-close-learning aria-label="关闭学习面板">×</button></div>${content}<button data-close-learning>返回当前游戏</button>`;
  learnDialog.showModal();
}
function render(openResult=false) {
  const node=D.nodes[state.node];
  document.documentElement.style.setProperty('--accent', node ? D.strategies[node.strategy].accent : '#9ec7b3');
  if(state.phase==='choose') choose(); else if(state.phase==='final') review(); else main();
  enhance();
  if(!storageAvailable) app.insertAdjacentHTML('beforeend','<p class="storage-note">浏览器暂不允许保存本标签页进度；刷新将重新开始。</p>');
  if(openResult && state.phase==='result') showResult();
}
document.addEventListener('click', e => {
  const b=e.target.closest('button'); if(!b || b.disabled)return;
  if(b.dataset.strategy && state.phase==='choose') {state={node:b.dataset.strategy+':',draft:null,phase:'plan'};save();render();}
  else if(b.dataset.decision && state.phase==='plan') {state.draft=b.dataset.decision;save();render();app.querySelector(`[data-decision="${state.draft}"]`).focus();}
  else if(b.hasAttribute('data-execute') && state.phase==='plan' && D.nodes[state.node].options[state.draft]) {state={node:D.nodes[state.node].options[state.draft].next,draft:null,phase:'result'};save();render(true);}
  else if(b.hasAttribute('data-result')) showResult();
  else if(b.hasAttribute('data-next') && state.phase==='result') {resultDialog.close();state.phase=D.nodes[state.node].round===3?'final':'plan';if(state.phase==='final')collectPath();save();render();window.scrollTo(0,0);app.querySelector('h1,h2')?.setAttribute('tabindex','-1');app.querySelector('h1,h2')?.focus();}
  else if(b.hasAttribute('data-replay')) {state={node:null,draft:null,phase:'choose'};save();render();window.scrollTo(0,0);}
  else if(b.dataset.learning) showLearning(b.dataset.learning);
  else if(b.hasAttribute('data-close-learning')) learnDialog.close();
  else if(b.hasAttribute('data-close-result')) resultDialog.close();
});
if(state.phase==='final')collectPath();
render(state.phase==='result');
