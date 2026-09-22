'use strict';
const D=window.FACTORLAB_CAMPAIGN,G=window.FACTORLAB_GAME,Info=window.FACTORLAB_INFORMATION_UI;
const app=document.querySelector('#app'),result=document.querySelector('#result'),learning=document.querySelector('#learning');
const saveKey='factorlab-campaign-save-v2',metaKey='factorlab-campaign-meta-v1';
const pct=(x,signed=false)=>x==null?'N/A':`${signed&&x>0?'+':''}${(x*100).toFixed(2)}%`;
const money=x=>x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pp=x=>`${x>0?'+':''}${(x*100).toFixed(3)} pp`;
let state=G.initial(),meta={paths:[],history:[]},runId=newId(),saveAllowed=true,metaAllowed=true,notice='';
function newId(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;}
try{
 const raw=localStorage.getItem(saveKey);
 if(!raw&&localStorage.getItem('factorlab-campaign-save-v1'))notice='旧版六轮存档已保留。信息玩法使用独立新存档，从新局开始；原收藏继续保留。';
 if(raw){const restored=G.restore(raw,D);if(restored){state=restored;const saved=JSON.parse(raw);if(typeof saved.runId==='string'&&saved.runId.length<100)runId=saved.runId;}
 else{saveAllowed=false;notice='旧存档格式无效或版本不兼容，原记录保持不动。本次可玩，但进度只在当前页面保留。';}}
}catch{saveAllowed=false;notice='浏览器存储不可用；本次可玩，但刷新会丢失当前局。';}
try{meta=G.sanitizeMeta(JSON.parse(localStorage.getItem(metaKey)),D);}catch{metaAllowed=false;}
function persist(){
 if(saveAllowed)try{localStorage.setItem(saveKey,JSON.stringify({...JSON.parse(G.serialize(state,D)),runId}));}catch{saveAllowed=false;notice='无法保存进度；本次可继续，刷新可能丢失当前局。';}
 if(state.phase==='final'){
  meta=G.complete(meta,state,runId,D);
  if(metaAllowed)try{localStorage.setItem(metaKey,JSON.stringify(meta));}catch{metaAllowed=false;}
 }
}
function collection(){
 const allBadges=[...new Set(meta.paths.flatMap(id=>G.debrief(D,id).badges))];
 return `<section class="collection"><div class="eyebrow">COLLECTION / RUN HISTORY</div><b>Path Collection · <span data-explored>${meta.paths.length}</span> / 2187 explored</b><p class="fine">Replay 保留已完成路径与最近 20 局记录；相同路径只计一次。${metaAllowed?'保存在此浏览器。':'存储不可用；收藏仅在本页面保留。'}</p><div>${allBadges.map(b=>`<span class="tag">${b}</span>`).join('')}</div><details><summary>最近完成的局 · <span data-history-count>${meta.history.length}</span></summary>${meta.history.slice().reverse().map(h=>{const n=D.nodes[h.path],d=G.debrief(D,h.path);return `<div class="history-row">${D.strategies[n.strategy].name} · ${pct(n.nav/100000-1,true)} · 预算 ${d.budget}/6 · ${G.ledger(D,h.path).map(r=>D.decisions[r.decision].en).join(' → ')}</div>`;}).join('')||'<p>完成第一局后，记录会出现在这里。</p>'}</details></section>`;
}
function choose(){
 return `<section class="campaign-intro"><div class="eyebrow">SIX ROUNDS. ONE STRATEGY. YOUR DECISIONS.</div><h1>机会不断变化。<br>你的风险预算还在吗？</h1><p>带着 100,000 虚拟资金走过六轮。每轮查看有限历史，决定是否用研究点补充观测，再权衡 AI 与 Cash、锁定选择。整局 3 个研究点，与投资资金独立。持仓漂移与每次取舍都会留到下一轮。</p><div class="run-goal"><b>Run Challenge · 预算守护者</b><span>至少 5 / 6 轮执行时守住 AI 参考上限。收益高低不影响这个目标。</span></div><p class="fine">每轮还有独立教学 Mission；它可能与收益目标冲突。你可以放弃任务，结果会如实记录。固定事件序列，不预测现实市场。</p></section><div class="strategy-grid">${Object.entries(D.strategies).map(([key,s])=>`<button class="strategy" data-strategy="${key}" style="--accent:${s.accent}"><div class="eyebrow">${s.style}</div><h2>${s.name}</h2><p>${s.cn}</p><div class="fine">起始 Cash ${pct(s.weights[5])} · AI ${pct(s.weights[4])}<br>AI 参考上限 ${pct(s.cap)} · 每次调整最多 ${(s.shift*100).toFixed(0)} pp</div><div class="choice-label">开始六轮 run →</div></button>`).join('')}</div>${collection()}`;
}
function timeline(node){
 const list=G.ledger(D,node.id),active=state.phase==='result'?node.record.round:node.round;
 return `<ol class="timeline" aria-label="Round timeline">${D.events.map((event,i)=>`<li class="${i<list.length?'done':i+1===active?'current':''}" ${i+1===active?'aria-current="step"':''}><b>0${i+1}</b>${i<list.length?`${pct(list[i].return_value,true)} · 已结算`:i+1===active?'当前决策':'尚未揭示'}</li>`).join('')}</ol>`;
}
function hud(node){
 const s=D.strategies[node.strategy];
 return `<section class="run-hud" aria-label="Run HUD"><div><span>NAV</span><b>${money(node.nav)}</b></div><div><span>Risk Pressure</span><b>${Math.round(node.weights[4]/s.cap*100)}%</b><small>AI 暴露 ÷ 策略上限；非预测风险</small></div><div><span>Cash Buffer</span><b>${pct(node.weights[5])}</b><small>${money(node.nav*node.weights[5])} 虚拟资金</small></div><div><span>${s.name} · Round progress</span><b>${node.round-1} / 6 settled</b></div></section>`;
}
function chart(records){
 const values=[100000,...records.map(r=>r.after)],bench=[100000,...records.map(r=>r.benchmark_nav)];
 const low=Math.floor((Math.min(...values,...bench)-1000)/1000)*1000,high=Math.ceil((Math.max(...values,...bench)+1000)/1000)*1000;
 const x=i=>60+i*82,y=v=>170-(v-low)/(high-low)*140;
 const points=a=>a.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
 return `<svg class="chart" viewBox="0 0 590 210" role="img" aria-label="仅含已结算净值；纵轴按已观察值缩放">${[low,(low+high)/2,high].map(v=>`<line x1="55" x2="560" y1="${y(v)}" y2="${y(v)}" stroke="#394649" stroke-dasharray="3 5"/><text x="2" y="${y(v)+4}">${(v/1000).toFixed(1)}k</text>`).join('')}<polyline points="${points(bench)}" fill="none" stroke="#adbbb6" stroke-dasharray="5 5" stroke-width="2"/><polyline points="${points(values)}" fill="none" stroke="var(--accent)" stroke-width="3"/>${values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="var(--accent)"/>`).join('')}${Array.from({length:7},(_,i)=>`<text x="${x(i)-8}" y="200">${i===0?'起点':'R'+i}</text>`).join('')}</svg><p class="fine">实线：你的组合 · 虚线：五板块等权 Benchmark。仅月末点，纵轴随已观察值缩放。</p>`;
}
function allocation(weights){return `<div class="allocation">${['半导体','机器人与自动化','先进材料','清洁能源装备','AI / 数字基建','Cash'].map((name,i)=>`<div><span>${name}</span><b>${pct(weights[i])}</b></div>`).join('')}</div>`;}
function main(){
 const n=D.nodes[state.node],s=D.strategies[n.strategy],settled=state.phase==='result',round=settled?n.record.round:n.round,event=D.events[round-1],draft=n.options[state.draft];
 return `${hud(n)}${timeline(n)}<section class="round-mission"><b>Round Mission · ${event.mission_title}</b><span>${event.mission_text}</span></section><div class="campaign-game"><section class="panel event-card"><div class="event-status"><span class="eyebrow">SCENARIO CARD · ${event.tag}</span><span class="phase-note">${settled?'已揭示':'PRE-EVENT CLUE'}</span></div><h2>${event.title}</h2><p class="clue">${event.clue}</p>${settled?`<p class="reason"><b>已揭示事件</b><br>${n.record.event}</p>`:'<p class="fine">先决定，再揭示本轮事件与收益。未来回合尚未揭示。</p>'}${Info.panel(state,round,settled)}<details class="portfolio-history"><summary>已结算组合走势 / Benchmark</summary>${chart(G.ledger(D,n.id))}</details>${allocation(n.weights)}<p class="fine">${n.record?'结算后的真实漂移持仓':'策略起始持仓'} · 不自动恢复初始权重</p><button class="link-button" data-learning>因子与已结算归因</button></section><section class="panel decision"><div class="eyebrow">ONE DECISION / ROUND ${round}</div><h2>${settled?'决定已锁定':'你愿意承担什么？'}</h2><p class="fine">每次最多 ${(s.shift*100).toFixed(0)} pp，受来源持仓限制；其他四板块不变。</p><div class="options">${Object.entries(D.decisions).map(([key,a])=>`<button class="option" data-decision="${key}" aria-pressed="${settled?n.record.decision===key:state.draft===key}" ${settled?'disabled':''}><strong>${a.name}</strong><span>${a.en}</span></button>`).join('')}</div><div class="preview" aria-live="polite">${draft&&!settled?`<div><span>AI exposure</span><b>${pct(n.weights[4])} → ${pct(draft.weights[4])}</b></div><div><span>Cash Buffer</span><b>${pct(n.weights[5])} → ${pct(draft.weights[5])}</b></div><div><span>Risk direction</span><b>${D.decisions[state.draft].risk}</b></div><label class="fine">AI <meter min="0" max="1" value="${draft.weights[4]}"></meter></label><label class="fine">Cash <meter min="0" max="1" value="${draft.weights[5]}"></meter></label><p class="tradeoff">${state.draft==='boost'?'增加增长参与，同时减少缓冲、放大 AI 下跌暴露。':state.draft==='buffer'?'增加缓冲，同时减少 AI 上涨时的参与。':'不主动交易，保留漂移，也保留已有风险。'}</p><p>AI 参考上限 ${pct(s.cap)} · ${draft.weights[4]>s.cap+1e-10?'当前预览超出预算':'当前预览在预算内'}。风险方向不是未来收益预测。</p>`:`<p>${settled?'可以查看反馈，再继续下一阶段。重复点击不会再次结算。':'选择动作查看配置变化。这里不展示未来收益。'}</p>`}</div>${!settled?Info.reason(state,round):''}<button class="primary" ${settled?'data-result':'data-execute'} ${!settled&&!draft?'disabled':''}>${settled?'查看本轮反馈':'Execute · 锁定并揭示'}</button><p class="fine">任务与徽章不给资金加成；可以不完成任务继续游戏。</p></section></div>`;
}
function showResult(){
 const n=D.nodes[state.node],r=n.record,m=G.mission(D,n),event=D.events[r.round-1];
 result.innerHTML=`<div class="dialog-top"><div><div class="eyebrow">ROUND ${r.round} / 6 · SETTLED</div><h2 id="result-title">${r.event}</h2></div><button class="close" data-close-result aria-label="关闭反馈">×</button></div><div class="settlement ${r.return_value<0?'negative':'positive'}" data-return>${pct(r.return_value,true)}</div><p>本模拟月收益 · NAV ${money(r.after)}</p><div class="metric-row"><div class="metric"><label>Maximum Drawdown</label><b>${pct(r.maximum_drawdown)}</b></div><div class="metric"><label>Cash after settlement</label><b>${money(r.cash_after)}</b></div><div class="metric"><label>动作相对不交易的影响</label><b>${pp(r.effect_vs_hold)}</b></div></div><section class="reward ${r.reward.quality==='recognized'?'':'reflect'}"><div><div class="eyebrow">${r.reward.quality==='recognized'?'BEHAVIOR BADGE':'REFLECTION'}</div><h3>${r.reward.badge}</h3><p>${r.reward.reason}</p></div></section><p class="mission-outcome"><b>Mission ${m.passed?'complete':'reflection'} · ${m.title}</b><br>${m.text}</p><p class="coach"><b>Coach · 规则反思</b><br>${event.reflection}<br>${r.reward.result_note}</p>${Info.review(state,r.round)}<div class="dialog-actions"><span class="fine">这是教学行为反馈，不是对真实推理质量的测量。回撤含初始净值。</span><button class="primary" data-next>${r.round===6?'Final Debrief →':'下一轮 →'}</button></div>`;
 if(!result.open)result.showModal();
}
function final(){
 const n=D.nodes[state.node],list=G.ledger(D,n.id),r=list.at(-1),d=G.debrief(D,n.id),mastery=d.budget>=5;
 return `<div class="eyebrow">RUN COMPLETE / FINAL DEBRIEF</div><h1 class="run-title">${mastery?'预算守护者':'完成六轮，带走下一次判断。'}</h1><p>${D.strategies[n.strategy].name} · 六轮经历已记录。完成不是收益排名；称号只按至少 5 / 6 轮预算合规判定。</p>${timeline(n)}<p class="research-summary">Research used · <b data-research-used>${state.research.length}</b> / 3 · 研究不会增加或扣减资金；使用次数不代表决策质量。</p><div class="debrief-grid"><div class="panel"><label>Total Return</label><b>${pct(n.nav/100000-1,true)}</b></div><div class="panel"><label>Maximum Drawdown</label><b>${pct(r.maximum_drawdown)}</b></div><div class="panel"><label>风险预算纪律</label><b>${d.budget} / 6</b></div><div class="panel"><label>Round Missions</label><b>${d.missions} / 6</b></div></div><div class="debrief-body"><section class="panel"><h2>结果与选择，分开读。</h2>${chart(list)}<p>NAV ${money(n.nav)} · Benchmark ${money(r.benchmark_nav)}<br>累计超额 ${pp((n.nav-r.benchmark_nav)/100000)}</p><p class="fine">Volatility ${pct(r.volatility)} · Sharpe ${r.sharpe==null?'N/A':r.sharpe.toFixed(2)}<br>n=6 模拟月，rf=0.1%/月，ddof=1，未年化。短样本与合成场景不能证明策略有效。</p><h3>关键回合 · Round ${d.turning.round}</h3><p>本局最低单轮收益 ${pct(d.turning.return_value,true)}，选择 ${D.decisions[d.turning.decision].name}。${d.turning.reward.reason}</p><h3>行为记录</h3><p>同一动作最多出现 ${d.consistency} / 6 次；相邻轮次切换动作 ${d.adaptations} 次。它们描述一致性与调整，不直接证明适应能力。</p><div>${d.badges.map(b=>`<span class="tag">${b}</span>`).join(' ')}</div><p class="fine">画像不是人格测试、投资适当性诊断或投资建议。</p></section><section class="panel"><h2>每一次选择都留下痕迹。</h2><ol class="decision-log">${list.map(a=>`<li><b>Round ${a.round} · ${D.decisions[a.decision].name}</b><br>${a.event}<br>${pct(a.return_value,true)} · Cash ${pct(a.drift[5])} · ${a.reward.badge}<br>Mission ${G.mission(D,D.nodes[a.next]).passed?'complete':'reflection'}${Info.review(state,a.round,true)}</li>`).join('')}</ol><p class="coach">下一局只改变一个选择，比较取舍。不要把知道剧本后的收益提升误认为预测能力。</p></section></div><div class="review-actions"><button class="primary" data-replay>Replay · 开始新 run</button><button data-learning>查看累计归因与因子说明</button></div>${collection()}`;
}
function showLearning(){
 const list=G.ledger(D,state.node),r=list.at(-1);
 learning.innerHTML=`<div class="dialog-top"><h2 id="learning-title">因子与已结算事实</h2><button class="close" data-close-learning aria-label="关闭学习面板">×</button></div><p>Momentum：过去较强不保证延续。Value：便宜也可能有风险。Quality：质量代理不能覆盖全部风险。Low Volatility：过去波动低不代表无风险。</p><p>本增量沿用经验证的合成生成模型；动作只调整 AI 与 Cash。因子配置、完整历史回测和有效性分析仍在 roadmap，不能把六轮未来收益当作事前历史。</p>${r?`<table class="contributions">${D.contribution_labels.map((name,i)=>`<tr><td>${name}</td><td>${pp(r.cumulative_contributions[i])}</td></tr>`).join('')}</table><p class="fine">对初始资金的财富加权贡献，合计 ${pct(D.nodes[state.node].nav/100000-1,true)}；仅已完成 ${list.length} 轮。教学归因不代表现实市场因果关系。</p>`:'<p>尚未结算，未来贡献不在这里显示。</p>'}<button data-close-learning>返回当前状态</button>`;
 learning.showModal();
}
function render(openResult=false){
 const n=D.nodes[state.node];document.documentElement.style.setProperty('--accent',n?D.strategies[n.strategy].accent:'#9ec7b3');
 app.innerHTML=state.phase==='choose'?choose():state.phase==='final'?final():main();
 if(notice)app.insertAdjacentHTML('afterbegin',`<p class="storage-note" role="status">${notice}</p>`);
 if(openResult&&state.phase==='result')showResult();
}

document.addEventListener('change',e=>{
 if(!e.target.matches('[data-reason]'))return;
 state=G.reduce(state,{type:'reason',key:e.target.value||null},D);persist();
});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-learning')){showLearning();return;}
 if(b.hasAttribute('data-close-learning')){learning.close();return;}
 if(b.hasAttribute('data-close-result')){result.close();return;}
 if(b.hasAttribute('data-result')&&state.phase==='result'){showResult();return;}
 let action;
 if(b.dataset.strategy)action={type:'strategy',key:b.dataset.strategy};
 else if(b.dataset.decision)action={type:'decision',key:b.dataset.decision};
 else if(b.hasAttribute('data-research'))action={type:'research'};
 else if(b.hasAttribute('data-execute'))action={type:'execute'};
 else if(b.hasAttribute('data-next'))action={type:'next'};
 else if(b.hasAttribute('data-replay'))action={type:'replay'};
 if(!action)return;
 const next=G.reduce(state,action,D);if(next===state)return;
 if(action.type==='next'){result.close();result.replaceChildren();}
 if(action.type==='replay')runId=newId();
 state=next;persist();render(action.type==='execute');
 if(action.type==='decision')app.querySelector(`[data-decision="${state.draft}"]`).focus();
 else if(action.type==='research'){const panel=app.querySelector('[data-information]');panel.setAttribute('tabindex','-1');panel.focus({preventScroll:true});}
 else if(action.type!=='execute'){window.scrollTo(0,0);const h=app.querySelector('h1,h2');h?.setAttribute('tabindex','-1');h?.focus();}
});
if(state.phase==='final')persist();
render(state.phase==='result');
