(function(root){
 'use strict';
 const I=root.FACTORLAB_INFORMATION,data=root.FACTORLAB_INFORMATION_DATA,G=root.FACTORLAB_GAME;
 const pct=x=>(x*100).toFixed(2)+'%';
 const label=t=>t<0?`前 ${-t} 月`:t===0?'开局':`R${t} 结束`;
 function observations(view){
  return `<div class="observations" aria-label="AI 教学价格指数历史">${Array.from({length:7},(_,i)=>{
   const time=view.cutoff-6+i,p=view.points.find(p=>p.time===time);
   return `<div><span>${label(time)}</span>${p?`<b data-point data-time="${time}">${p.value.toFixed(2)}</b>`:'<b aria-label="未解锁观测">—</b>'}</div>`;
  }).join('')}</div>`;
 }
 function panel(state,round,locked){
  const bought=state.research.includes(round),view=I.view(data,round,bought),remaining=3-state.research.length;
  return `<section class="information" data-information aria-label="决策前历史信息"><div class="information-heading"><div><div class="eyebrow">OBSERVE / RESEARCH</div><h3>${bought?'Detailed Data · 详细历史':'Basic Data · 基础历史'}</h3></div><p>Research Points <b data-research-points>${remaining}</b> / 3</p></div><p class="fine">AI 教学价格指数 · 截止 ${label(view.cutoff)} · 合成月度数据</p>${observations(view)}<p>同一窗口首尾变化 <b>${pct(view.change)}</b>${bought?` · 历史月度波动 <b>${pct(view.volatility)}</b>`:''}</p><p class="fine">${bought?'7 个观测点；波动为 6 个月收益的样本标准差，未年化。':'3 个稀疏观测点；中间月份未显示，连贯上涨不能据此认定。'} 历史不预测下一轮。</p>${locked?'<p class="fine">本轮信息已锁定，可在反馈中比较基础与详细历史。</p>':`<button data-research ${bought||remaining===0?'disabled':''}>${bought?'本轮已解锁':remaining===0?'研究点已用完':'花 1 点 · 查看 7 个月度观测'}</button><p class="fine">整局 3 点，不补充、不扣 NAV。可跳过；更多观测不保证更好结果。</p>`}</section>`;
 }
 function reason(state,round){
  return `<label class="reason-choice">这次更看重什么？<span class="fine">可选，自述理由；不影响奖励</span><select data-reason aria-label="决策理由"><option value="">暂不记录</option>${Object.entries(G.reasons).map(([key,text])=>`<option value="${key}" ${state.reasons[round]===key?'selected':''}>${text}</option>`).join('')}</select></label>`;
 }
 function review(state,round,compact=false){
  const bought=state.research.includes(round),view=I.view(data,round,true),reason=G.reasons[state.reasons[round]]||'未记录理由';
  return `<section class="information-review"><b data-research-status>${bought?'当时已解锁详细历史':'当时仅有基础历史'}</b><p data-reason-review>你的自述：${reason}</p><details><summary>回看决策时的信息${compact?'':'与遗漏观测'}</summary><p class="fine">信息截止时点 <span data-review-cutoff>${view.cutoff}</span>（${label(view.cutoff)}），未加入本轮刚揭示结果。${bought?'详细历史在执行前已解锁。':'详细历史当时未解锁，以下仅用于事后学习，不补扣研究点。'}</p>${observations(view)}<p class="fine">首尾变化 ${pct(view.change)}；6 个月收益样本波动 ${pct(view.volatility)}，未年化。补充观测显示路径，不能据此证明购买改善了决策或收益。</p></details></section>`;
 }
 root.FACTORLAB_INFORMATION_UI={panel,reason,review};
})(window);
