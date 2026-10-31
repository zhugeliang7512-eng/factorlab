(function () {
  'use strict';
  const staticHosting = document.querySelector('meta[name="factorlab-hosting"]')?.content === 'static';
  const $ = id => document.getElementById(id);
  const words = {
    'zh-CN': {button:'核对我的理由', intro:'根据已公开信息核对理由，由你决定如何配置。', pending:'正在核对…', stale:'理由或进度已改变，请重新核对。', rule:'规则检查', live:'AI 理由核对 · Jev', fallback:'AI 不可用 · 改用规则检查', boundary:'AI 判断可能有误；分类概率不代表盈利概率或已验证的准确率。', evidence_fit:'与证据是否一致', horizon:'理由针对的时间', allocation:'配置限制', rationale:'理由记录', supported:'当前证据支持这段理由', contradicted:'理由与当前证据有冲突', insufficient:'证据不足，请补充依据', long_term:'长期定位', tactical:'短期战术', mixed:'同时涉及长期与短期', unclear:'时间范围不清楚', valid:'配置符合限制', invalid:'请检查合计与行业上限', present:'已填写补充理由', missing:'请填写补充理由后再核对', review:'待复核', noModel:'这里只检查输入与配置限制，不能判断理由是否成立。', distribution:'查看模型分类详情', reference:'所用资料', none:'尚无语义核对结果'},
    en: {button:'Check my rationale', intro:'Compare your rationale with visible evidence. The allocation decision stays yours.', pending:'Checking…', stale:'Your rationale or research state changed. Run the check again.', rule:'Rule check · Jev not used', live:'Jev semantic check', fallback:'Service unavailable · Rules only', boundary:'Semantic judgments can be wrong. Model probabilities are neither return probabilities nor validated accuracy.', evidence_fit:'Evidence support', horizon:'Decision horizon', allocation:'Allocation limits', rationale:'Rationale recorded', supported:'Supported by visible evidence', contradicted:'Conflicts with visible evidence', insufficient:'Insufficient evidence', long_term:'Long-term positioning', tactical:'Short-term tactics', mixed:'Both horizons', unclear:'Unclear horizon', valid:'Within allocation limits', invalid:'Review weights and sector limits', present:'Rationale provided', missing:'Write a specific rationale first', review:'Review needed', noModel:'Jev is not connected. Rules check inputs and allocation limits, not the meaning of your rationale.', distribution:'Model option probabilities', reference:'Evidence available to review', none:'No semantic result yet'}
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let language='zh-CN',controller=null,version=0,lastSignature='',reply=null,stale=false;
  const text = () => words[language];
  const feedback=(stage,id)=>document.dispatchEvent(new CustomEvent('factorlab:feedback',{detail:{kind:'check',stage,id}}));
  const signature = () => JSON.stringify([FactorLabApp.getEnvelope(),FactorLabApp.getUI().profileId]);
  function rules() {
    const current=FactorLabApp.getEnvelope(), values=current.draft;
    const valid=Array.isArray(values)&&values.length===6&&values.every((v,i)=>Number.isFinite(v)&&v>=0&&v<=(i===5?1:.4)+1e-8)&&Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-7;
    return {mode:'rule',checks:[{id:'allocation',value:valid?'valid':'invalid'},{id:'rationale',value:current.note.trim()?'present':'missing'}],references:[]};
  }
  function paint() {
    if(!$('run-quick-check'))return;
    language=FactorLabApp.getUI().lang;
    const t=text();
    $('run-quick-check').textContent=controller?t.pending:t.button;
    $('run-quick-check').disabled=Boolean(controller)||FactorLabApp.getState().phase!=='decision';
    $('quick-check-intro').textContent=t.intro;
    const target=$('quick-check-result');
    if(stale){target.textContent=t.stale;return;}
    if(!reply){target.textContent='';return;}
    const causes={provider_restricted:language==='en'?'Jev returned an access restriction (HTTP 451). Only rule checks are available.':'AI 访问受限，已改用规则检查。',provider_auth:language==='en'?'Jev did not accept the server credentials. Only rule checks are available.':'AI 服务认证失败，已改用规则检查。',rate_limited:language==='en'?'Jev is rate limited. Retry later; rule checks remain available.':'AI 请求受限，已改用规则检查；稍后可重试。'};
    const rows=reply.checks.filter(c=>t[c.id]&&t[c.value]).map(c=>`<div class="judgment-row"><span>${esc(t[c.id])}</span><strong>${esc(t[c.value])}${c.needsReview?` <small>${esc(t.review)}</small>`:''}</strong></div>`).join('');
    const distributions=reply.checks.filter(c=>c.probabilities&&typeof c.probabilities==='object').map(c=>`<p>${esc(t[c.id]||c.id)}: ${Object.entries(c.probabilities).filter(([k,v])=>t[k]&&Number.isFinite(v)&&v>=0&&v<=1).map(([k,v])=>esc(t[k])+': '+Math.round(v*100)+'%').join(' · ')}</p>`).join('');
    const accessDetail=reply.reason==='provider_restricted'?`<details><summary>${language==='en'?'Access details':'查看访问限制'}</summary><p>${language==='en'?'Jev returned HTTP 451 (access restriction).':'Jev 返回 HTTP 451（访问限制）。'}</p></details>`:'';
    const mode=staticHosting?(language==='en'?'Public version · Rule check':'规则检查 · 此版本未连接 AI'):t[reply.mode];
    target.innerHTML=`<p class="judgment-mode">${esc(mode)}</p>${rows}${reply.mode!=='live'?`<p>${esc(causes[reply.reason]||t.noModel)}</p>${accessDetail}`:''}${distributions?`<details><summary>${esc(t.distribution)}</summary>${distributions}</details>`:''}${reply.references?.length?`<p>${esc(t.reference)}: ${reply.references.map(esc).join(' · ')}</p>`:''}${reply.mode==='live'?`<p class="judgment-boundary">${esc(t.boundary)}</p>`:''}`;
  }
  function invalidate() {
    if(!window.FactorLabApp)return;
    if((controller||reply)&&lastSignature!==signature()){
      feedback('cancel',version);version++;controller?.abort();controller=null;reply=null;stale=true;
    }
    paint();
  }
  async function run() {
    if(controller||FactorLabApp.getState().phase!=='decision')return;
    document.dispatchEvent(new Event('factorlab:pause'));
    if(staticHosting){version++;lastSignature=signature();stale=false;reply=rules();paint();return;}
    const envelope=FactorLabApp.getEnvelope(),lang=FactorLabApp.getUI().lang;
    const id=++version;lastSignature=signature();stale=false;reply=null;controller=new AbortController();paint();feedback('start',id);
    const requestController=controller,timer=setTimeout(()=>requestController.abort(),6500);
    let result;
    try{
      if(!/^https?:$/.test(location.protocol))throw Error('offline');
      const response=await fetch('/api/quick-check',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({save:envelope.game,lang,note:envelope.note,reason:envelope.reason,forecast:envelope.forecast,draft:envelope.draft}),signal:requestController.signal});
      if(!response.ok)throw Error('unavailable');
      result=await response.json();
      if(!['live','rule','fallback'].includes(result.mode)||!Array.isArray(result.checks)||result.checks.length>8)throw Error('schema');
    }catch{result={...rules(),mode:'fallback'};}finally{clearTimeout(timer);}
    if(id!==version||lastSignature!==signature())return;
    controller=null;reply=result;paint();feedback(result.mode!=='live'||result.checks.some(c=>c.needsReview||['missing','invalid','insufficient','contradicted','unclear'].includes(c.value))?'caution':'success',id);
  }
  function initialize() {
    if(!window.FactorLabApp||$('run-quick-check'))return;
    const container=document.createElement('div');container.className='quick-judgment';
    container.innerHTML='<p id="quick-check-intro" class="sr-only"></p><button id="run-quick-check" class="secondary wide" type="button" aria-describedby="quick-check-intro"></button><div id="quick-check-result" role="status" aria-live="polite"></div>';
    ($('decision-notes')||document.querySelector('.decision-panel')).append(container);
    $('run-quick-check').addEventListener('click',run);
    paint();
  }
  document.addEventListener('factorlab:render',()=>{initialize();invalidate();});
  for(const event of ['factorlab:save','factorlab:profile','factorlab:restore'])document.addEventListener(event,invalidate);
  initialize();
})();
