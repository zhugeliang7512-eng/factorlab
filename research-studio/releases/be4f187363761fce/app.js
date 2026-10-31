(async function() {
  'use strict';
  const staticHosting=document.querySelector('meta[name="factorlab-hosting"]')?.content==='static';
  const cloudMode=!!window.FactorLabCloudConfig,cloud=window.FactorLabCloud,offlineHosting=staticHosting&&!cloudMode;
  const E=window.FactorLabLedger.createEngine(window.FactorLabSimulation), $=id=>document.getElementById(id);
  const GUEST_SAVE_KEY='factorlab-simulation-ui-v3', LANG_KEY='factorlab-simulation-language-v3';
  const memoryProfiles=new Map();
  let SAVE_KEY=GUEST_SAVE_KEY,profileId=null;
  const PHASES={decision:'phaseDecision',simulating:'phaseSimulating',event:'phaseEvent',review:'phaseReview',complete:'phaseComplete'};
  const COLORS=['#202020','#4b4b4b','#777777','#9e9e9e','#bfbfbf','#d8d8d8'];
  let allocationUndo=null;
  const SECTOR_ICONS=['semiconductor','robotics','materials','energy','infrastructure','cash'];
  const feedback=(kind,stage,extra={})=>document.dispatchEvent(new CustomEvent('factorlab:feedback',{detail:{kind,stage,...extra}}));
  let campaignEpoch=0;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let lang='zh-CN',state=E.initial(),draft=[...state.weights],factorPrefs=[25,25,25,25];
  let reason='',note='',forecast='flat',reflection='',writable=true,brokenRaw=null,noticeKey='';
  let evidenceSelections=[],chatAttachments=[],chatInput='',evidenceRefs=[],falsifierIf='',researchProgress=emptyResearchProgress(),lastGateKey='';
  const studioText={
    'zh-CN':{needEvidence:'请选择至少一条本轮判断依据。',needFalsifier:'可以确认；尚未填写反证条件，决策记录仍不完整。',ready:'可以确认配置。记录完整不代表判断正确。',invalidEvidenceRefs:'引用不可用，请重新选择当前已公开的依据。',invalidFalsifier:'反证条件应为不超过 500 字的文字。',invalidReason:'请选择本轮判断理由。',invalidForecast:'请选择本轮方向预判。',invalidPhase:'本轮配置已锁定。',chooseEvidence:'本轮依据',cite:'引用到本轮判断',uncite:'取消本轮引用',noCitations:'尚未引用依据',remove:'移除',falsifier:'什么情况出现时，你会重新考虑这个判断？',recordComplete:'决策记录完整',legacyReward:'历史记录 · 旧规则积分',processReward:'过程记录',recordHint:'引用与反证条件已记录；不代表论证成立或能力已验证。',recordPending:'未填写反证条件，本轮不授予完整记录徽章。',reviewEvidence:'当时引用的依据',reviewFalsifier:'当时的反证条件',notRecorded:'未记录',nextJudgment:'下一次判断',nextJudgmentText:'对照当时的证据与反证条件，记录下轮保持长期定位或调整短期战术的理由。',courseTasks:'课程研究任务',courseHint:'完成模拟轮次不等于完成全部课程研究。',taskBacktest:'运行当前偏好的因子回测',taskEfficacy:'查看当前回测的因子功效',taskReflection:'记录复盘反思',taskDone:'已记录',taskTodo:'待完成',busyGate:'正在等待回复，请稍后确认。'},
    en:{needEvidence:'Select at least one source for this decision.',needFalsifier:'You can confirm. Add a reconsideration condition to complete the decision record.',ready:'Ready to confirm. A complete record does not validate the judgment.',invalidEvidenceRefs:'A reference is unavailable. Select currently disclosed evidence.',invalidFalsifier:'Use text of at most 500 characters for the reconsideration condition.',invalidReason:'Select a rationale for this decision.',invalidForecast:'Select a directional forecast.',invalidPhase:'This allocation is already locked.',chooseEvidence:'Evidence for this decision',cite:'Cite in this decision',uncite:'Remove this citation',noCitations:'No evidence cited yet',remove:'Remove',falsifier:'What would make you reconsider this judgment?',recordComplete:'Decision record complete',legacyReward:'Historical record · legacy points',processReward:'Process record',recordHint:'Evidence and a reconsideration condition were recorded. This does not validate the argument or demonstrate competence.',recordPending:'No reconsideration condition was recorded; no completeness badge this round.',reviewEvidence:'Evidence cited at the time',reviewFalsifier:'Reconsideration condition recorded then',notRecorded:'Not recorded',nextJudgment:'Your next judgment',nextJudgmentText:'Revisit the evidence and reconsideration condition. Explain whether to keep the long-term position or adjust short-term tactics.',courseTasks:'Course research tasks',courseHint:'Finishing the simulation does not complete every course research task.',taskBacktest:'Run a backtest with the current factor preferences',taskEfficacy:'Inspect factor efficacy for the current backtest',taskReflection:'Record a reflection',taskDone:'Recorded',taskTodo:'Pending',busyGate:'Waiting for a reply. Please confirm afterwards.'}
  };
  const st=key=>studioText[lang][key]||t(key);
  function emptyResearchProgress(){return {hasRun:false,dirty:false,hasEfficacy:false,preferences:[25,25,25,25],resultPreferences:[25,25,25,25]};}
  function normalizeResearchProgress(value){
    if(value===undefined)return emptyResearchProgress();
    const valid=values=>Array.isArray(values)&&values.length===4&&values.every(v=>Number.isFinite(v)&&v>=0&&v<=100);
    if(!value||!['hasRun','dirty','hasEfficacy'].every(k=>typeof value[k]==='boolean')||!valid(value.preferences)||!valid(value.resultPreferences??[25,25,25,25]))throw Error('invalidSave');
    const resultPreferences=value.resultPreferences??[25,25,25,25],resultTotal=resultPreferences.reduce((a,b)=>a+b,0),total=value.preferences.reduce((a,b)=>a+b,0);
    if(!resultTotal||value.hasEfficacy&&(!value.hasRun||value.dirty)||!value.dirty&&!total||value.hasRun&&!value.dirty&&value.preferences.some((v,i)=>Math.abs(v/total-resultPreferences[i]/resultTotal)>1e-9))throw Error('invalidSave');
    return {hasRun:value.hasRun,dirty:value.dirty,hasEfficacy:value.hasEfficacy,preferences:[...value.preferences],resultPreferences:[...(value.resultPreferences??[25,25,25,25])]};
  }
  let timer=null,playing=false,speed=180,busy=false,requestId=0,controller=null,messages=[],evidenceOpen='',evidenceReturn='';
  const rawGet=key=>{try{return localStorage.getItem(key);}catch{writable=false;noticeKey='saveBlocked';return null;}};
  const storedLang=rawGet(LANG_KEY)||rawGet('factorlab-simulation-language');if(['zh-CN','en'].includes(storedLang))lang=storedLang;
  const staticCoach={'zh-CN':{coachRule:'离线学习助手',coachIntro:'公开版未连接在线 AI。这里可解释流程和常用概念；自由对话将在服务器接通后启用。'},en:{coachRule:'Offline learning helper',coachIntro:'This public version has no live AI connection. Explore the workflow and key concepts here; open-ended chat requires the server connection.'}};
  const cloudCoach={'zh-CN':{coachRule:'离线学习助手',coachIntro:'登录后可与 AI 交流研究问题。访客仍可使用离线概念提示；AI 不替你做配置决定。'},en:{coachRule:'Offline learning helper',coachIntro:'Sign in to discuss your research with AI. Visitors can use offline concept hints. Allocation decisions remain yours.'}};
  await i18next.init({lng:lang,fallbackLng:'zh-CN',keySeparator:false,initImmediate:false,interpolation:{escapeValue:false},resources:Object.fromEntries(['zh-CN','en'].map(l=>[l,{translation:{...E.TEXTS[l],...FactorLabStrings[l],...(offlineHosting?staticCoach[l]:cloudMode?cloudCoach[l]:{}),...(l==='en'?{sectorShort0:'Semicon',sectorShort3:'Energy',sectorShort4:'AI infra'}:{})}}]))});
  const t=(key,values={})=>i18next.t(key,values);
  const number=(value,digits=0)=>Number.isFinite(value)?(Math.abs(value)<.5*10**-digits?0:value).toLocaleString(lang,{minimumFractionDigits:digits,maximumFractionDigits:digits}):'—';
  const percent=(v,d=2,sign=false)=>Number.isFinite(v)?(sign&&v>0?'+':'')+number(v*100,d)+'%':'—';
  const money=(v,sign=false)=>(sign&&v>0?'+':'')+number(v,2);
  const normalizedFactors=()=>{const sum=factorPrefs.reduce((a,b)=>a+b,0);return sum>0?factorPrefs.map(v=>v/sum):[0,0,0,0];};
  const totalRounds=()=>state.totalRounds||state.config?.rounds||6;
  const lastResult=()=>state.results?.at(-1);
  const finished=()=>state.day>=totalRounds()*state.daysPerRound;
  function validDraft(values) {return Array.isArray(values)&&values.length===6&&values.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-7&&values.slice(0,5).every(v=>v<=.4+1e-10);}
  function unpack(raw) {
    const item=typeof raw==='string'?JSON.parse(raw):raw;
    if(!['factorlab-ui-v2','factorlab-ui-v3'].includes(item?.version)||!item.game)throw Error('invalidSave');
    const loaded=E.restore(item.game);
    const proposed=validDraft(item.draft)?item.draft:[...loaded.weights];
    const prefs=Array.isArray(item.factorPrefs)&&item.factorPrefs.length===4&&item.factorPrefs.every(v=>Number.isFinite(v)&&v>=0&&v<=100)&&item.factorPrefs.some(v=>v>0)?item.factorPrefs:[25,25,25,25];
    const refs=item.evidenceRefs??[],condition=item.falsifierIf??'';
    const available=new Set([...E.publicView(loaded).evidence,...loaded.events,...(window.FactorLabEvidence?.buildEvidence(E.publicView(loaded))||[])].map(e=>e.id));
    const validRef=id=>available.has(id)||window.FactorLabEvidence?.validateReference(E.publicView(loaded),id);
    if(!Array.isArray(refs)||refs.length>24||refs.some(id=>typeof id!=='string'||!validRef(id))||typeof condition!=='string'||condition.length>500)throw Error('invalidSave');
    const selections=item.evidenceSelections??[];
    if(!Array.isArray(selections)||selections.length>24||selections.some(ref=>!refs.includes(ref?.id)))throw Error('invalidSave');
    const canonicalSelections=selections.map(ref=>window.FactorLabEvidence.resolveReference(E.publicView(loaded),ref));
    return {evidenceSelections:canonicalSelections,chat:item.chat||{},loaded,proposed,prefs,refs:[...new Set(refs)],condition,researchProgress:normalizeResearchProgress(item.researchProgress),reason:['','evidence','risk','anchor','valuation'].includes(item.reason)?item.reason:'',note:typeof item.note==='string'?item.note.slice(0,180):'',forecast:['up','flat','down'].includes(item.forecast)?item.forecast:'flat',reflection:typeof item.reflection==='string'?item.reflection.slice(0,600):''};
  }
  function installSave(raw) {const x=unpack(raw);state=x.loaded;draft=x.proposed;factorPrefs=x.prefs;reason=x.reason;note=x.note;forecast=x.forecast;reflection=x.reflection;evidenceRefs=x.refs;falsifierIf=x.condition;researchProgress=x.researchProgress;evidenceSelections=x.evidenceSelections;messages=Array.isArray(x.chat.messages)?x.chat.messages.slice(-40):[];chatAttachments=Array.isArray(x.chat.attachments)?x.chat.attachments.slice(0,8):[];chatInput=typeof x.chat.input==='string'?x.chat.input.slice(0,600):'';$('question').value=chatInput;lastGateKey='';}
  const ownSave=rawGet(SAVE_KEY),rawSave=ownSave===null?rawGet('factorlab-simulation-ui-v2'):ownSave;
  if(rawSave){try{if(!rawGet(SAVE_KEY+'-pre-securities'))localStorage.setItem(SAVE_KEY+'-pre-securities',rawSave);installSave(rawSave);}catch{brokenRaw=rawSave;writable=false;noticeKey='corruptSave';}}
  function envelope(){return {version:'factorlab-ui-v3',game:E.serialize(state),draft:[...draft],factorPrefs:[...factorPrefs],reason,note,forecast,reflection,evidenceRefs:[...evidenceRefs],falsifierIf,researchProgress:clone(researchProgress),evidenceSelections:clone(evidenceSelections),chat:{schema:1,messages:clone(messages),attachments:clone(chatAttachments),input:$('question').value}};}
  function decisionDraft(){return {weights:[...draft],factorWeights:normalizedFactors(),reason:reason?reason+(note?' · '+note:''):(state.ledger?note.trim():''),forecast,evidenceRefs:[...evidenceRefs],falsifierIf,evidenceSelections:clone(evidenceSelections),...(state.ledger?{snapshotId:state.ledger.snapshotId,revision:state.ledger.revision,transactionId:state.ledger.snapshotId+':confirm'}:{})};}
  function decisionFeedback(kind){document.dispatchEvent(new CustomEvent('factorlab:decision-feedback',{detail:{kind,stage:'success',gate:E.evaluateDecisionGate(state,decisionDraft()),campaignEpoch,round:state.round}}));}
  function setResearchProgress(value){researchProgress=normalizeResearchProgress(value);save();renderCourseChecklist();document.dispatchEvent(new Event('factorlab:research-progress'));}
  function save(){if(writable){try{localStorage.setItem(SAVE_KEY,JSON.stringify(envelope()));}catch{writable=false;noticeKey='saveBlocked';}}$('save-status').textContent=t(writable?'saved':'memoryOnly');showNotice();document.dispatchEvent(new CustomEvent('factorlab:save',{detail:{profileId,day:state.day}}));}
  function showNotice(key){if(key)noticeKey=key;$('notice').hidden=!noticeKey;$('notice').textContent=noticeKey?t(noticeKey):'';}
  function translate(){document.documentElement.lang=lang;document.title='FactorLab · '+t('chapter');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));$('language').value=lang;$('design-link').href=staticHosting?'previous/':'import/'+lang+'.html';document.querySelector('.rail')?.setAttribute('aria-label',t('desk'));$('rounds').setAttribute('aria-label',t('round',{round:state.round,total:totalRounds()}));$('macro').setAttribute('aria-label',t('macroHint'));if(state.ledger)document.querySelectorAll('[data-i18n="riskFrequency"]').forEach(el=>el.textContent=lang==='en'?'Volatility and Sharpe assume 252 teaching steps per year; synthetic dates are calendar steps, not an exchange calendar. Risk-free return uses the then-visible daily policy-rate assumption.':'波动率与 Sharpe 按每年252个教学步长年化；合成日期按日历推进，不是真实交易所日历。无风险收益使用当时可见政策利率的日收益假设。');}
  let chartSize='',chartDirty=false;
  function renderChart(){
    chartDirty=true;
    const host=$('nav-chart');
    if(!host.getClientRects().length||!host.clientWidth||!host.clientHeight)return;
    FactorVisuals.chart(host,{rows:state.history,series:[
      {key:'anchorNav',name:t('anchor'),color:'#999891'},
      {key:'benchmarkNav',name:t('benchmark'),color:'#54534e',dash:true},
      {key:'nav',name:t('yourPortfolio'),color:'#814d68'}
    ],label:t('chartLabel'),format:v=>number(v,0),xLabel:r=>t('eventDay',{day:r?.day||0}),empty:state.day===0?t('chartEmpty'):''});
    chartSize=host.clientWidth+'x'+host.clientHeight;chartDirty=false;
  }
  function renderMarket(){
    $('phase').textContent=t(PHASES[state.phase]||'phaseDecision');$('day-count').textContent=t('day',{day:state.day});$('round-count').textContent=t('round',{round:state.round,total:totalRounds()});
    $('rounds').innerHTML=Array.from({length:totalRounds()},(_,i)=>`<div class="round-item ${i+1===state.round?'active':i+1<state.round?'done':''}"><b>${esc(t('roundShort',{round:i+1}))}</b><span>${esc(t('roundStage'+i))}</span></div>`).join('');
    $('macro').innerHTML=['rate','inflation','growth','liquidity','credit','sentiment'].map((key,i)=>`<div class="macro-metric"><span>${esc(t(key))}</span><strong>${number(state.macro[key],i<3?1:0)}<small>${i<3?'%':'/100'}</small></strong><div class="micro-track"><i data-width="${Math.min(100,Math.max(0,i<3?state.macro[key]*12:state.macro[key]))}"></i></div></div>`).join('');
    const cyc=String(state.macro.cycle||'Recovery');$('cycle').textContent=t('cycle.'+cyc,{defaultValue:t('cycle'+cyc.charAt(0).toUpperCase()+cyc.slice(1))});
    $('nav').textContent=number(state.nav,2);$('benchmark-nav').textContent=number(state.benchmarkNav,2);$('anchor-nav').textContent=number(state.anchorNav,2);
    const r=state.nav/100000-1;$('nav-change').textContent=percent(r,2,true);$('nav-change').className=r>=0?'positive':'negative';
    const initialPrices=state.history?.[0]?.prices||[100,100,100,100,100];
    $('heatmap').innerHTML=state.prices.map((p,i)=>{const change=p/initialPrices[i]-1;return `<div class="sector-tile ${change<0?'down':change>0?'up':''}"><span data-icon="${SECTOR_ICONS[i]}" aria-hidden="true"></span><span title="${esc(t('sector'+i))}">${esc(t('sectorShort'+i))}</span><strong>${percent(change,1,true)}</strong><small>${number(p,2)}</small></div>`;}).join('');
    renderChart();document.querySelectorAll('[data-width]').forEach(el=>el.style.width=el.dataset.width+'%');
  }
  function renderEvents(){
    const focusedEvidence=document.activeElement?.dataset.evidence;
    const backgroundOpen=$('events').querySelector('.event-background')?.open,timelineOpen=$('events').querySelector('.event-timeline')?.open;
    const events=[...(state.events||[])].reverse();
    const evidence=E.publicView(state).evidence;
    const cards=`<div class="evidence-grid">${evidence.map(e=>`<button class="evidence-button ${(state.seen||[]).includes(e.id)?'read':''}" data-evidence="${esc(e.id)}" aria-expanded="${evidenceOpen===e.id}"><small>${esc(e.id)} · ${esc((state.seen||[]).includes(e.id)?t('inspected'):lang==='en'?({'E1':'Inspect orders','E2':'Inspect pricing','E3':'Inspect policy'}[e.id]||t('inspect')):({'E1':'查看订单线索','E2':'查看价格风险','E3':'查看政策影响'}[e.id]||t('inspect')))}</small><strong>${esc(t(e.titleKey))}</strong></button>`).join('')}</div>`;
    const open=evidence.find(e=>e.id===evidenceOpen);
    const eventHTML=ev=>`<article class="event-row"><span class="event-index">${esc(ev.id.replace(/[^0-9]/g,'')||ev.startDay)}</span><div><div class="event-meta"><span>${esc(t('eventDay',{day:ev.startDay}))}</span><b>${esc(t(ev.status==='resolved'||state.day>=ev.startDay+ev.duration?'eventResolved':'eventActive'))}</b></div><h3>${esc(t(ev.titleKey))}</h3><p>${esc(t(ev.bodyKey))}</p><button class="text-button citation-button" data-cite="${esc(ev.id)}" aria-pressed="${evidenceRefs.includes(ev.id)}" ${state.phase!=='decision'||busy?'disabled':''}>${esc(st(evidenceRefs.includes(ev.id)?'uncite':'cite'))}</button></div></article>`;
    const latest=events.length?eventHTML(events[0]):`<details class="event-background" ${backgroundOpen?'open':''}><summary>${esc(t('eventInitialTitle'))}</summary><p>${esc(t('eventInitialBody'))}</p></details>`;
    const earlier=events.length>1?`<details class="event-timeline" ${timelineOpen?'open':''}><summary>${lang==='en'?'Earlier events':'此前事件'} · ${events.length-1}</summary>${events.slice(1).map(eventHTML).join('')}</details>`:'';
    $('events').innerHTML=latest+earlier+`<details class="scenario-interpretation"><summary>${lang==='en'?'Scenario background':'市场背景'}</summary>${cards}</details>`;
    document.querySelectorAll('[data-evidence]').forEach(el=>el.addEventListener('click',()=>openEvidence(el.dataset.evidence)));
    $('events').querySelectorAll('[data-cite]').forEach(el=>el.addEventListener('click',()=>toggleCitation(el.dataset.cite)));
    $('event-control').hidden=state.phase!=='event';$('resume').disabled=busy;
    if(focusedEvidence){const control=[...$('events').querySelectorAll('[data-evidence]')].find(el=>el.dataset.evidence===focusedEvidence);if(control?.getClientRects().length)control.focus({preventScroll:true});}
  }
  function adjustedAllocation(index,value){
    const next=[...draft];
    if(index<5){
      const needed=value-next[index],cashUsed=Math.min(next[5],Math.max(0,needed));
      next[index]=value;next[5]-=cashUsed;
      if(needed<0)next[5]-=needed;
      const shortage=Math.max(0,needed-cashUsed),otherTotal=draft.slice(0,5).reduce((total,w,i)=>total+(i===index?0:w),0);
      if(shortage>0&&otherTotal>0)for(let i=0;i<5;i++)if(i!==index)next[i]=draft[i]*(1-shortage/otherTotal);
    }else{
      next[5]=value;const invested=draft.slice(0,5).reduce((a,b)=>a+b,0);
      for(let i=0;i<5;i++)next[i]=Math.min(.4,invested?draft[i]/invested*(1-value):(1-value)/5);
      for(let pass=0;pass<5;pass++){const remaining=1-value-next.slice(0,5).reduce((a,b)=>a+b,0),eligible=next.slice(0,5).map((w,i)=>w<.4-1e-10?i:-1).filter(i=>i>=0);if(remaining<1e-10||!eligible.length)break;for(const i of eligible)next[i]+=Math.min(.4-next[i],remaining/eligible.length);}
    }
    next[5]=Math.max(0,1-next.slice(0,5).reduce((a,b)=>a+b,0));return next;
  }
  function renderAllocation(){
    const focusedWeight=$('allocation').contains(document.activeElement)?document.activeElement.id:null;
    const locked=state.phase!=='decision'||busy;
    $('allocation').innerHTML=(state.phase==='decision'?draft:state.weights).map((v,i)=>`<div class="allocation-row"><label for="weight-${i}" class="sector-label"><span data-icon="${SECTOR_ICONS[i]}" aria-hidden="true"></span><span>${esc(t('sector'+i))}<small class="allocation-value" id="allocation-value-${i}"></small></span></label><small title="${esc(t('current'))}">${percent(state.weights[i],1)} →</small><div class="allocation-input"><input id="weight-${i}" aria-label="${esc(t('target')+' '+t('sector'+i))}" type="number" min="0" max="${i===5?100:40}" step="1" value="${(v*100).toFixed(2).replace(/\.00$/,'')}" ${locked?'disabled':''}></div>${i<5?`<input class="allocation-slider" id="weight-range-${i}" aria-label="${esc(t('target')+' '+t('sector'+i))}" type="range" min="0" max="40" step="1" value="${Math.round(v*100)}" ${locked?'disabled':''}>`:''}</div>`).join('');
    window.FactorLabIcons?.render();
    draft.forEach((_,i)=>$('weight-'+i).addEventListener('change',()=>{
      const value=Number($('weight-'+i).value)/100;
      if(!Number.isFinite(value)||value<0||value>(i===5?1:.4)){renderAllocation();showNotice('invalidWeights');return;}
      const before=[...draft];
      draft=adjustedAllocation(i,value);
      allocationUndo=before;noticeKey=writable?'':noticeKey;renderAllocation();save();
    }));
    draft.slice(0,5).forEach((_,i)=>{
      const range=$('weight-range-'+i);let gesture=false;
      const begin=()=>{if(!gesture){allocationUndo=[...draft];gesture=true;}};
      range.addEventListener('pointerdown',begin);
      range.addEventListener('input',()=>{
        begin();draft=adjustedAllocation(i,Number(range.value)/100);
        draft.forEach((v,j)=>{$('weight-'+j).value=(v*100).toFixed(2).replace(/\.00$/,'');if(j<5)$('weight-range-'+j).value=v*100;});
        drawAllocation();updateDraftSummary();save();
      });
      range.addEventListener('change',()=>{gesture=false;renderAllocation();});
    });
    drawAllocation();
    const factors=normalizedFactors();$('factors').innerHTML=factorPrefs.map((value,i)=>`<div class="factor-row"><label for="factor-${i}">${esc(t('factor'+i))}</label><input id="factor-${i}" type="range" min="0" max="100" step="5" value="${value}" ${locked?'disabled':''}><output id="factor-value-${i}" for="factor-${i}">${number(factors[i]*100,0)}%</output></div>`).join('');
    factorPrefs.forEach((_,i)=>$('factor-'+i).addEventListener('input',()=>{factorPrefs[i]=Number($('factor-'+i).value);const current=normalizedFactors();current.forEach((v,j)=>$('factor-value-'+j).textContent=number(v*100,0)+'%');updateDraftSummary();save();}));
    document.querySelectorAll('[data-preset]').forEach(el=>el.disabled=locked);$('apply-factors').disabled=locked;
    if($('reason').value!==reason)$('reason').value=reason;if($('note').value!==note)$('note').value=note;if($('forecast').value!==forecast)$('forecast').value=forecast;
    $('note').placeholder=lang==='en'?'Why are you making this adjustment? (optional)':'记下这次调整的想法（可选）';
    $('note').setAttribute('aria-label',lang==='en'?'Additional decision rationale':'补充判断理由');
    if($('falsifier-if').value!==falsifierIf)$('falsifier-if').value=falsifierIf;
    document.querySelector('label[for="falsifier-if"]').textContent=st('falsifier');
    for(const id of ['reason','note','forecast','falsifier-if'])$(id).disabled=locked;
    renderCitations();
    updateDraftSummary();
    if(focusedWeight&&$(focusedWeight)&&!$(focusedWeight).disabled&&$(focusedWeight).getClientRects().length)$(focusedWeight).focus({preventScroll:true});
  }
  function drawAllocation(){
    FactorVisuals.dial($('allocation-dial'),draft,Array.from({length:6},(_,i)=>t('sectorShort'+i,{defaultValue:t('sector'+i)})));
    const preview=E.preview(state,draft),ledger=E.publicView(state).ledger;
    draft.forEach((weight,i)=>{const label=$('allocation-value-'+i);if(label)label.textContent=money(state.phase!=='decision'&&ledger?(i===5?ledger.cash:ledger.holdings.filter(r=>r.sectorIndex===i).reduce((total,r)=>total+r.marketValue,0)):preview.ok&&preview.rows?(i===5?preview.cash:preview.rows.filter(r=>r.sectorIndex===i).reduce((total,r)=>total+r.targetAmount,0)):state.nav*weight)+' USD';});
    $('undo-allocation').disabled=!allocationUndo||state.phase!=='decision'||busy;
  }
  function openEvidence(id){
    const evidence=E.publicView(state).evidence,entry=evidence.find(e=>e.id===id);if(!entry)return;
    if(!$('evidence-dialog').open)evidenceReturn=id;
    evidenceOpen=id;pauseForDialog();
    if(!busy&&state.phase==='decision'&&!(state.seen||[]).includes(id))act({type:'read',id});
    $('evidence-id').textContent=id+' · '+(lang==='en'?'PUBLIC EVIDENCE':'公开证据');
    $('evidence-title').textContent=t(entry.titleKey);$('evidence-body').textContent=t(entry.bodyKey);
    updateCitationButton();
    if(!$('evidence-dialog').open)$('evidence-dialog').showModal();
  }
  function updateCitationButton(){
    const button=$('cite-evidence');button.textContent=st(evidenceRefs.includes(evidenceOpen)?'uncite':'cite');button.setAttribute('aria-pressed',String(evidenceRefs.includes(evidenceOpen)));button.disabled=state.phase!=='decision'||busy||!!state.ledger&&/^E[123]$/.test(evidenceOpen);if(state.ledger&&/^E[123]$/.test(evidenceOpen))button.textContent=lang==='en'?'Interpretation only — cite the underlying material':'仅为解读，请引用原始材料';
  }
  function renderCitations(){
    const entries=evidenceRefs.flatMap(id=>{const selected=evidenceSelections.filter(r=>r.id===id);return selected.length?selected.map(ref=>({id,ref})): [{id}];});
    $('decision-citations').innerHTML=`<span class="eyebrow">${esc(st('chooseEvidence'))} · ${entries.length}</span>`+(entries.length?`<div class="citation-list">${entries.map(({id,ref},i)=>`<button class="citation-chip" data-remove-entry="${i}" ${state.phase!=='decision'||busy?'disabled':''}>${esc(referenceLabel(ref||id))} ×</button>`).join('')}</div>`:`<p class="footnote">${esc(st('noCitations'))}</p>`);
    $('decision-citations').querySelectorAll('[data-remove-entry]').forEach(el=>el.onclick=()=>{const {id,ref}=entries[Number(el.dataset.removeEntry)];if(ref){evidenceSelections=evidenceSelections.filter(x=>x!==ref);if(!evidenceSelections.some(x=>x.id===id))toggleCitation(id);else{save();renderCitations();updateDraftSummary();}}else toggleCitation(id);});
  }
  function toggleCitation(id){
    if(state.phase!=='decision'||busy)return;
    if(![...E.publicView(state).evidence,...state.events,...(window.FactorLabEvidence?.buildEvidence(E.publicView(state))||[])].some(e=>e.id===id))return;
    if(!evidenceRefs.includes(id)&&evidenceRefs.length>=24)return;
    evidenceRefs=evidenceRefs.includes(id)?evidenceRefs.filter(ref=>ref!==id):[...evidenceRefs,id];
    evidenceSelections=evidenceSelections.filter(ref=>evidenceRefs.includes(ref.id));updateCitationButton();renderCitations();renderEvents();updateDraftSummary();save();decisionFeedback('citation');
  }
  function updateDraftSummary(){
    document.dispatchEvent(new Event('factorlab:draft'));
    let p;try{p=E.preview(state,draft);}catch{p={ok:false};}
    $('total').textContent=percent(draft.reduce((a,b)=>a+b,0),0);$('cost-label').textContent=t(state.phase==='decision'?'estimatedCost':'actualCost');$('fee').textContent=state.phase==='decision'?(p.ok?money(p.fee):'—'):money(state.transactions.at(-1)?.fee||0);
    const gate=E.evaluateDecisionGate(state,decisionDraft());
    const gateMessage=busy?st('busyGate'):gate.status==='need_evidence'?st('needEvidence'):gate.status==='need_falsifier'?st('needFalsifier'):gate.status==='ready'?st('ready'):st(gate.error||'invalidReason');
    $('allocation-error').textContent='';
    $('step-feedback-bar').textContent=gate.canConfirm&&!busy?'':gateMessage;$('step-feedback-bar').dataset.state=gate.status;
    $('step-feedback-bar').hidden=state.phase!=='decision'||gate.canConfirm&&!busy;
    $('confirm').disabled=state.phase!=='decision'||busy||!gate.canConfirm;
    const gateKey=campaignEpoch+':'+state.round+':'+gate.status+':'+gate.error;
    if(gateKey!==lastGateKey){lastGateKey=gateKey;decisionFeedback('gate');}
    $('confirm').hidden=state.phase!=='decision';$('simulation-controls').hidden=state.phase!=='simulating';
    const progressed=state.day-(state.round-1)*state.daysPerRound;$('sim-progress').style.width=Math.max(0,Math.min(100,progressed/state.daysPerRound*100))+'%';
    $('simulation-message').textContent=t('simulationProgress',{day:progressed,total:state.daysPerRound});$('pause-play').textContent=t(playing?'pauseAnimation':'playAnimation');$('pause-play').disabled=busy;$('fast-forward').disabled=busy;
  }
  function renderRisk(){
    const m=E.metrics(state);$('risk-metrics').innerHTML=[['volatility',percent(m.volatility)],['sharpe',number(m.sharpe,2)],['maxDrawdown',percent(m.maxDrawdown)],['diversification',percent(m.diversification,0)]].map(([key,value])=>`<div class="risk-metric"><span>${esc(t(key))}</span><strong>${value}</strong></div>`).join('');
    const result=lastResult();
    const exposure=Array.from({length:4},(_,i)=>state.weights.slice(0,5).reduce((sum,w,j)=>sum+w*E.EXPOSURES[j][i],0));
    const returns=state.history.at(-1).factorReturns;
    const factorTable=`<div class="exposure-table"><div><span>${esc(t('factorLabel'))}</span><span>${esc(t('exposure'))}</span><span>${esc(t('factorReturn'))}</span></div>${exposure.map((v,i)=>`<div><span>${esc(t('factor'+i))}</span><b>${number(v,2)}</b><b>${state.day?percent(returns[i],2,true):'—'}</b></div>`).join('')}<p class="footnote">${esc(t('exposureHint'))}</p></div>`;
    if(!result){$('attribution').innerHTML=factorTable;return;}
    const a=result.attribution,entries=[['attributionMarket',a.market],...(a.factors||[]).map((v,i)=>['factor'+i,v]),['attributionSector',a.sector],['attributionEvent',a.event],['attributionIdiosyncratic',a.idiosyncratic],['attributionCash',a.cash],['attributionCost',a.cost]];
    const max=Math.max(1,...entries.map(([,v])=>Math.abs(v)));
    $('attribution').innerHTML=factorTable+`<div class="attribution-breakdown"><h3>${esc(t('attributionTitle',{round:result.round}))}</h3><div class="attribution-rows">`+entries.map(([key,value])=>`<div class="attribution-row"><span>${esc(t(key))}</span><span class="attribution-bar"><i class="${value<0?'loss':''}" data-width="${Math.abs(value)/max*100}"></i></span><strong class="${value<0?'negative':'positive'}">${money(value,true)}</strong></div>`).join('')+'</div></div>';
    $('attribution').querySelectorAll('[data-width]').forEach(el=>el.style.width=el.dataset.width+'%');
  }
  function reasonText(key){const mapping={evidence:'reasonEvidence',risk:'reasonRisk',anchor:'reasonAnchor',valuation:'reasonValuation'},parts=key.split(' · ');return mapping[parts[0]]?[t(mapping[parts[0]]),...parts.slice(1)].join(' · '):key;}
  function renderReview(){
    const result=lastResult(),show=['review','complete'].includes(state.phase);$('review').hidden=!show;
    if(show&&result){$('review-title').textContent=t(finished()?'completeTitle':'reviewTitle');const actual=result.realizedForecast;const predicted=result.forecast;
      const legacy=result.decisionPolicy==='legacy',completeRecord=(result.reward?.badges||[]).includes('badge.recordComplete');
      $('review-content').innerHTML=[['roundReturn',percent(result.returnValue,2,true)],['counterfactual',money(result.tacticalAmount,true)],['anchorDifference',money(state.nav-state.anchorNav,true)]].map(([key,value])=>`<div class="review-stat"><span>${esc(t(key))}</span><strong>${value}</strong></div>`).join('')+`<p>${esc(t('forecastActual',{forecast:t('forecast'+predicted.charAt(0).toUpperCase()+predicted.slice(1)),actual:t('forecast'+String(actual).charAt(0).toUpperCase()+String(actual).slice(1))}))}</p><details class="supporting-detail"><summary>${esc(st(legacy?'legacyReward':'processReward'))} · ${number(result.reward?.points||0)}</summary><div class="badges">${(result.reward?.badges||[]).map(key=>`<span class="badge">${esc(key==='badge.recordComplete'?st('recordComplete'):t(key))}</span>`).join('')}</div><p>${esc(completeRecord?st('recordHint'):lang==='en'?'Process records do not validate a judgment.':'过程记录不代表判断正确。')}</p><p><strong>${esc(st('reviewEvidence'))}</strong> · ${esc((result.evidenceRefs||[]).join(' · ')||st('notRecorded'))}</p><p><strong>${esc(st('reviewFalsifier'))}</strong> · ${esc(result.falsifierIf||st('notRecorded'))}</p><p>${esc(reasonText(result.reason||''))}</p></details>`;
    }
    $('next-round').hidden=finished();$('next-round').disabled=busy;$('replay').hidden=!finished();
    document.querySelector('label[for="reflection"]').textContent=t(finished()?'reflectionPromptComplete':'reflectionPrompt');
    $('history').innerHTML=state.results.length?state.results.map((r,i)=>`<div class="history-row"><span>${esc(t('roundShort',{round:i+1}))}</span><span>${esc(reasonText(r.reason||''))}</span><strong class="${r.returnValue<0?'negative':'positive'}">${percent(r.returnValue,2,true)}</strong></div>`).join(''):`<p class="history-empty">${esc(t('journalEmpty'))}</p>`;
    if($('reflection').value!==reflection)$('reflection').value=reflection;
    renderCourseChecklist();
  }
  function renderCourseChecklist(){
    const host=$('course-checklist');if(!host)return;host.hidden=state.phase!=='complete';
    const currentRun=researchProgress.hasRun&&!researchProgress.dirty;
    host.innerHTML=`<h3>${esc(st('courseTasks'))}</h3><ul>${[['taskBacktest',currentRun],['taskEfficacy',currentRun&&researchProgress.hasEfficacy],['taskReflection',!!reflection.trim()]].map(([key,done])=>`<li><span>${esc(st(key))}</span><strong>${esc(st(done?'taskDone':'taskTodo'))}</strong></li>`).join('')}</ul><p class="footnote">${esc(st('courseHint'))}</p>`;
  }
  function referenceLabel(ref){
    if(typeof ref==='string')ref=evidenceSelections.find(r=>r.id===ref)||chatAttachments.find(r=>r.id===ref)||{id:ref};
    try{if(ref.snapshotId)ref=FactorLabEvidence.resolveReference(E.publicView(state),ref);}catch{}
    let label=window.FactorLabStudio?.referenceLabel(ref)||ref.title?.[lang]||ref.id||'';
    if(ref.selection?.rowId){const row=ref.data?.rows?.[0];label+=' · '+(row?.side?[row.side,row.strike,row.expiry].join(' / '):(lang==='en'?'Selected row':'所选行'));}
    else if(ref.selection?.from!==undefined)label+=' · '+(ref.periodStart?.slice(0,10)||ref.selection.from)+' – '+(ref.periodEnd?.slice(0,10)||ref.selection.to);
    return label;
  }
  function toolLabel(key){return ({get_visible_evidence:['查看材料','Read materials'],get_portfolio_snapshot:['当前配置','Current allocation'],get_instrument_details:['证券详情','Security details'],run_backtest:['回测结果','Backtest results'],simulate_allocation:['配置试算','Allocation estimate'],compare_scenarios:['方案比较','Scenario comparison'],propose_allocation_draft:['配置草稿','Allocation draft']})[key]?.[lang==='en'?1:0]||key;}
  function toolCard(result){
    const en=lang==='en';
    if(result.first&&result.alternative)return `<div class="scenario-result"><b>${en?'Current holdings':'当前持仓'}</b>${toolCard(result.first)}</div><div class="scenario-result"><b>${en?'After adjustment':'调整后'}</b>${toolCard(result.alternative)}</div>${Array.isArray(result.changes)?`<p>${result.changes.map((delta,i)=>Math.abs(delta)<1e-6?'':esc(t('sectorShort'+i,{defaultValue:t('sector'+i)}))+' '+(delta>0?'+':'')+(delta*100).toFixed(1)+(en?' pp':' 个百分点')).filter(Boolean).join(' · ')}</p>`:''}`;
    const p=result.preview||result;
    const entries=[['fee',en?'Fees USD':'费用 USD'],['cash',en?'Remaining cash USD':'剩余现金 USD'],['buys',en?'Buys USD':'买入 USD'],['sells',en?'Sells USD':'卖出 USD'],['nav',en?'Assets USD':'资产 USD']].filter(([key])=>Number.isFinite(p[key]));
    const summary=entries.map(([key,label])=>`<div>${label}: <b>${money(p[key])}</b></div>`).join('');
    if(result.scenarios?.length)return result.scenarios.map((scenario,i)=>`<div class="scenario-result"><b>${esc(scenario.label||scenario.name||(en?'Scenario ':'方案 ')+(i+1))}</b>${toolCard(scenario.preview||scenario)}</div>`).join('');
    return summary||`<details><summary>${en?'View details':'查看详情'}</summary><pre>${esc(JSON.stringify(result,null,2))}</pre></details>`;
  }
  function renderMessages(){
    const en=lang==='en';
    $('messages').innerHTML=messages.filter(m=>m.lang===lang).map(msg=>`<div class="message ${msg.role}"><small>${esc(msg.role==='user'?(en?'You':'你'):msg.mode==='live'?(en?'AI partner':'AI 助手'):(en?'Offline assistant':'离线助手'))}</small><p>${esc(msg.summary)}</p>${msg.detail?`<details><summary>${en?'Assumptions & explanation':'假设与说明'}</summary><p>${esc(msg.detail)}</p></details>`:''}${(msg.references||[]).map(ref=>`<button class="reference-link" data-chat-ref="${encodeURIComponent(JSON.stringify((msg.referenceSelections||[]).find(r=>(r.token||r.id)===(typeof ref==='string'?ref:ref.id))||ref))}">${esc(referenceLabel((msg.referenceSelections||[]).find(r=>(r.token||r.id)===(typeof ref==='string'?ref:ref.id))||ref))}</button>`).join('')}${(msg.tools||[]).map(tool=>`<div class="tool-result"><strong>${esc(toolLabel(tool.name||tool.tool||'Tool'))} · ${en?'Completed':'已完成'}</strong>${toolCard(tool.result??tool)}</div>`).join('')}${msg.allocationDraft?`<div class="tool-result"><b>${en?'Unconfirmed allocation draft':'未确认配置草稿'}</b><p>${esc((msg.allocationDraft.weights||[]).map((v,i)=>t('sectorShort'+i,{defaultValue:t('sector'+i)})+' '+(v*100).toFixed(1)+'%').join(' · '))}</p><button data-apply-chat-draft="${messages.indexOf(msg)}">${en?'Apply to draft only':'应用到草稿'}</button></div>`:''}</div>`).join('')+(busy?`<p role="status">${en?'Researching…':'正在研究…'}</p>`:'');
    if(!messages.some(m=>m.lang===lang))$('messages').innerHTML=`<p class="footnote">${en?'I can explain your allocation, compare changes, or prepare a draft for you to review.':'我可以解释你的配置、算清调整的变化，或帮你起草方案。'}</p>`;
    $('ask').disabled=busy;$('stop-coach').hidden=!busy;$('retry-coach').disabled=busy;
    const lastAnswer=messages.filter(m=>m.lang===lang&&m.role==='assistant').at(-1);
    $('coach-mode').textContent=lastAnswer?.reason==='demo'?(en?'Offline demonstration · deterministic tools':'离线演示 · 确定性研究工具'):lastAnswer?.reason==='quota_exceeded'?(en?'AI quota reached · demonstration remains available':'AI 额度已用尽 · 可继续使用演示教练'):lastAnswer?.mode==='live'?(en?'Online model':'在线模型')+(lastAnswer.model?' · '+lastAnswer.model:''):lastAnswer?.reason?(en?'Connection unavailable · input preserved · retry or use demonstration':'连接不可用 · 已保留输入，可重试或使用演示教练'):(en?'Demonstration available · connect on send':'演示教练可用 · 发送时尝试连接');
    $('chat-attachments').innerHTML=chatAttachments.map((ref,i)=>`<button data-remove-attachment="${i}">${esc(referenceLabel(ref))} ×</button>`).join('');
    $('chat-attachments').querySelectorAll('[data-remove-attachment]').forEach(el=>el.onclick=()=>{chatAttachments.splice(Number(el.dataset.removeAttachment),1);save();renderMessages();});
    $('messages').querySelectorAll('[data-chat-ref]').forEach(el=>el.onclick=()=>window.FactorLabStudio?.openReference(JSON.parse(decodeURIComponent(el.dataset.chatRef))));
    $('messages').querySelectorAll('[data-apply-chat-draft]').forEach(el=>el.onclick=()=>{const proposal=messages[Number(el.dataset.applyChatDraft)]?.allocationDraft;const ok=applyAllocationDraft(proposal);if(!ok){el.textContent=en?'Draft expired — ask again':'草稿已过期，请重新提问';return;}el.textContent=en?'Applied ✓':'已应用 ✓';window.FactorLabWorkspace.go('portfolio');});
  }

  function render(){document.body.dataset.phase=state.phase;translate();renderMarket();renderEvents();renderAllocation();renderRisk();renderReview();renderMessages();showNotice();$('save-status').textContent=t(writable?'saved':'memoryOnly');document.dispatchEvent(new CustomEvent('factorlab:render',{detail:{phase:state.phase,day:state.day,round:state.round,lang}}));}
  function stop(){clearTimeout(timer);timer=null;playing=false;}
  function act(action){try{const previousResults=state.results.length;state=E.reduce(state,action);if(state.phase!=='simulating')stop();if(action.type==='next'){allocationUndo=null;draft=state.weights.map((v,i)=>i<5?Math.min(.4,v):v);draft[5]=1-draft.slice(0,5).reduce((a,b)=>a+b,0);reason='';note='';forecast='flat';evidenceRefs=[];evidenceSelections=[];falsifierIf='';}save();render();if(state.results.length>previousResults){const result=lastResult();feedback('settlement','success',{id:campaignEpoch+':'+state.day,returnValue:result.returnValue,milestone:state.phase==='complete'});decisionFeedback('settlement');}return true;}catch(error){showNotice(FactorLabStrings[lang][error.message]?error.message:'actionError');return false;}}
  function schedule(){if(!playing||state.phase!=='simulating'||busy)return;timer=setTimeout(()=>{if(act({type:'advance',days:1})&&playing)schedule();},speed);}
  function startPlayback(){if(matchMedia('(prefers-reduced-motion: reduce)').matches){act({type:'advance',days:state.daysPerRound});return;}playing=true;updateDraftSummary();schedule();}
  function download(data,name,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function resetRequest(){feedback('coach','cancel',{id:requestId});requestId++;controller?.abort();controller=null;busy=false;}
  async function ask(question){
    if(busy||!question.trim())return;const id=++requestId,atDay=state.day,atLang=lang;stop();busy=true;feedback('coach','start',{id});
    const history=messages.filter(m=>m.lang===lang).slice(-12).map(m=>({role:m.role,content:[m.summary,m.detail].filter(Boolean).join('\n')}));
    messages.push({role:'user',summary:question,day:atDay,lang:atLang});renderMessages();renderAllocation();save();
    const payload={save:E.serialize(state),question,lang:atLang,history,runId:profileId+':'+campaignEpoch+':'+id,stream:true,attachments:clone(chatAttachments),page:window.FactorLabWorkspace?.getView(),...(state.phase==='decision'?{decisionDraft:decisionDraft()}:{})};
    controller=new AbortController();const signal=controller.signal,timeout=setTimeout(()=>controller?.abort(),45000);let answer,failed=false,partial=null;
    const onEvent=(type,data)=>{if(id!==requestId||signal.aborted)return;if(type==='delta'){if(!partial){partial={role:'assistant',mode:'live',summary:'',day:atDay,lang:atLang};messages.push(partial);}partial.summary+=data.text||'';renderMessages();}if(type==='result')answer=data;if(type==='tool'){let status=$('tool-status');if(!status){status=document.createElement('p');status.id='tool-status';status.className='tool-result';$('messages').appendChild(status);}status.textContent=toolLabel(data.name)+' · '+(data.status==='running'?(atLang==='en'?'Running':'运行中'):(atLang==='en'?'Completed':'已完成'));}};
    try{
      if(offlineHosting||location.protocol==='file:')throw Error('demo');
      if(cloudMode){if(!cloud?.coachStream)throw Error('cloud');answer=await cloud.coachStream(payload,signal,onEvent);}
      else{const response=await fetch('/api/coach-v3',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal});if(!response.ok)throw Error('http_'+response.status);if(response.headers.get('content-type')?.includes('text/event-stream'))answer=await FactorLabCoachStream.consume(response,onEvent,signal);else answer=await response.json();}
      if(!answer||typeof answer.summary!=='string')throw Error('schema');
    }catch(error){
      if(id!==requestId)return;failed=true;
      try{answer=window.FactorLabResearchTools?.demo?.(payload);}catch{}
      if(!answer)answer={...FactorLabAssistant.offlineReply(state,question,atLang,history),mode:'example'};
      answer={...answer,mode:'example',detail:(error.message==='demo'?(atLang==='en'?'This offline build uses deterministic teaching tools. ':'此离线构建使用确定性教学工具。 '):(atLang==='en'?'Live model unavailable; the following is a deterministic teaching demonstration. ':'在线模型不可用；以下为确定性教学演示。 '))+(answer.detail||''),reason:error.message};
    }finally{clearTimeout(timeout);}
    if(id!==requestId)return;busy=false;controller=null;if(partial)messages=messages.filter(m=>m!==partial);answer=window.FactorLabResearchTools?.compactResult?.(answer)||answer;messages.push({...answer,role:'assistant',day:atDay,lang:atLang});messages=messages.slice(-40);if(!failed)$('question').value='';save();render();feedback('coach',answer.mode==='live'?'success':'fallback',{id});
  }
  function applyAllocationDraft(proposal){
    const weights=proposal?.weights;if(!validDraft(weights)||state.phase!=='decision'||busy)return false;
    const ledger=E.publicView(state).ledger;if(!ledger||proposal.snapshotId!==ledger.snapshotId||proposal.revision!==ledger.revision)return false;
    allocationUndo=[...draft];draft=[...weights];renderAllocation();save();document.dispatchEvent(new Event('factorlab:draft'));return true;
  }
  document.querySelectorAll('[data-allocation-help]').forEach(button=>button.addEventListener('click',()=>{
    if(busy)return;
    const prompts={explain:['帮我看懂正在编辑的配置：主要投向哪里、保留多少现金、确认后费用是多少？','Explain my draft allocation: where is it invested, how much cash remains, and what are the fees?'],compare:['比较当前持仓和我正在编辑的配置，告诉我行业比例、现金和费用怎么变。','Compare my current holdings with the draft allocation: sector weights, cash and fees.'],draft:['给我一个五行业等额、保留20%现金的入门示例草稿，说明费用，先不要成交。','Prepare an illustrative draft with equal weights in five sectors and 20% cash. Explain the fees without executing a trade.']};
    const question=prompts[button.dataset.allocationHelp]?.[lang==='en'?1:0];if(!question)return;window.FactorLabStudio.openChat();$('question').value=question;ask(question);
  }));
  $('stop-coach').onclick=()=>{resetRequest();save();renderMessages();renderAllocation();};
  $('retry-coach').onclick=()=>ask($('question').value.trim()||messages.filter(m=>m.role==='user'&&m.lang===lang).at(-1)?.summary||'');
  $('question').addEventListener('input',()=>{chatInput=$('question').value;save();});
  const pauseForDialog=()=>{stop();updateDraftSummary();};
  document.addEventListener('factorlab:pause',pauseForDialog);
  $('settings').addEventListener('click',()=>{pauseForDialog();$('settings-dialog').showModal();});$('close-settings').addEventListener('click',()=>$('settings-dialog').close());
  $('language').addEventListener('change',async()=>{const next=$('language').value;if(!['zh-CN','en'].includes(next))return;resetRequest();lang=next;await i18next.changeLanguage(lang);try{localStorage.setItem(LANG_KEY,lang);}catch{}render();});
  $('speed').addEventListener('change',()=>{speed=Number($('speed').value);});
  $('reason').addEventListener('change',()=>{reason=$('reason').value;updateDraftSummary();save();});$('note').addEventListener('input',()=>{note=$('note').value;updateDraftSummary();save();});$('forecast').addEventListener('change',()=>{forecast=$('forecast').value;updateDraftSummary();save();});$('reflection').addEventListener('input',()=>{reflection=$('reflection').value;save();renderCourseChecklist();});
  $('falsifier-if').addEventListener('input',()=>{falsifierIf=$('falsifier-if').value;updateDraftSummary();save();});
  $('cite-evidence').addEventListener('click',()=>toggleCitation(evidenceOpen));
  document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>{if(state.phase!=='decision'||busy)return;allocationUndo=[...draft];draft=el.dataset.preset==='defensive'?[.12,.12,.13,.13,.10,.40]:el.dataset.preset==='growth'?[.30,.18,.10,.10,.27,.05]:[.20,.20,.15,.15,.15,.15];renderAllocation();save();}));
  $('apply-factors').addEventListener('click',()=>{if(!factorPrefs.some(v=>v>0)){showNotice('invalidFactors');return;}try{allocationUndo=[...draft];draft=E.recommend(state,normalizedFactors(),draft[5]);renderAllocation();save();}catch{showNotice('invalidFactors');}});
  $('confirm').addEventListener('click',()=>{
    if(busy||state.phase!=='decision'||!E.evaluateDecisionGate(state,decisionDraft()).canConfirm){updateDraftSummary();return;}
    const preview=E.preview(state,draft);if(!preview.ok)return;
    $('trade-preview').innerHTML=`<div class="trade-weights">${draft.map((v,i)=>`<span>${esc(t('sector'+i))}</span><strong>${percent(v,1)}</strong>`).join('')}</div><div class="review-stat"><span>${esc(t('estimatedCost'))}</span><strong>${money(preview.fee)}</strong></div>${reason||note?`<p>${esc(reasonText(reason))}${note?' · '+esc(note):''}</p>`:''}${evidenceRefs.length?`<p>${esc(st('chooseEvidence'))} · ${esc(evidenceSelections.map(referenceLabel).join(' · '))}</p>`:''}${falsifierIf?`<p>${esc(st('reviewFalsifier'))} · ${esc(falsifierIf)}</p>`:''}`;
    $('trade-confirm').showModal();
  });
  $('cancel-trade').addEventListener('click',()=>$('trade-confirm').close());
  $('execute-trade').addEventListener('click',()=>{if(busy||state.phase!=='decision')return;$('trade-confirm').close();allocationUndo=null;if(act({type:'lock',...decisionDraft()}))startPlayback();});
  $('undo-allocation').addEventListener('click',()=>{if(!allocationUndo||busy||state.phase!=='decision')return;draft=[...allocationUndo];if(allocationUndo.factorPrefs)factorPrefs=[...allocationUndo.factorPrefs];allocationUndo=null;renderAllocation();save();decisionFeedback('draft');});
  for(const id of ['close-evidence','done-evidence'])$(id).addEventListener('click',()=>$('evidence-dialog').close());
  $('next-evidence').addEventListener('click',()=>{const all=E.publicView(state).evidence;openEvidence(all[(all.findIndex(e=>e.id===evidenceOpen)+1)%all.length].id);});
  $('evidence-dialog').addEventListener('close',()=>{
    const returnId=evidenceReturn;evidenceOpen='';evidenceReturn='';renderEvents();
    const control=[...$('events').querySelectorAll('[data-evidence]')].find(el=>el.dataset.evidence===returnId);
    if(control?.getClientRects().length)control.focus({preventScroll:true});
  });
  $('evidence-dialog').addEventListener('keydown',event=>{
    if(event.key!=='Tab'||event.altKey||event.ctrlKey||event.metaKey)return;
    const controls=[...$('evidence-dialog').querySelectorAll('button:not([disabled])')].filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);if(!first)return;
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  $('pause-play').addEventListener('click',()=>{if(playing)stop();else{playing=true;schedule();}updateDraftSummary();});$('fast-forward').addEventListener('click',()=>{stop();act({type:'advance',days:state.daysPerRound});});$('resume').addEventListener('click',()=>{if(!busy&&act({type:'resume'})&&state.phase==='simulating')startPlayback();});$('next-round').addEventListener('click',()=>{if(!busy)act({type:'next'});});
  $('model-info').addEventListener('click',()=>{pauseForDialog();$('method-dialog').showModal();});$('close-method').addEventListener('click',()=>$('method-dialog').close());
  const openNew=()=>{pauseForDialog();$('settings-dialog').close();$('new-dialog').showModal();};$('new-game').addEventListener('click',openNew);$('replay').addEventListener('click',openNew);$('cancel-new').addEventListener('click',()=>$('new-dialog').close());
  $('start-new').addEventListener('click',()=>{let next;try{next=E.initial({seed:Number($('seed').value),scenario:$('scenario').value});}catch{showNotice('actionError');return;}stop();resetRequest();campaignEpoch++;allocationUndo=null;state=next;draft=[...state.weights];factorPrefs=[25,25,25,25];reason='';note='';forecast='flat';reflection='';evidenceRefs=[];evidenceSelections=[];falsifierIf='';researchProgress=emptyResearchProgress();lastGateKey='';messages=[];chatAttachments=[];chatInput='';$('question').value='';brokenRaw=null;writable=true;noticeKey='';$('new-dialog').close();save();render();document.dispatchEvent(new Event('factorlab:restore'));window.scrollTo({top:0});});
  $('save-now').addEventListener('click',()=>{save();feedback('save',writable?'success':'failure');});$('export-save').addEventListener('click',()=>download(brokenRaw||JSON.stringify(envelope(),null,2),'FactorLab-save-day-'+state.day+'.json'));
  $('import-save').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>500000)throw Error('large');const raw=await file.text();const verified=unpack(raw);campaignEpoch++;allocationUndo=null;stop();resetRequest();installSave(raw);brokenRaw=null;writable=true;noticeKey='imported';save();render();document.dispatchEvent(new Event('factorlab:restore'));$('settings-dialog').close();}catch{showNotice('invalidSave');}event.target.value='';});
  $('coach-form').addEventListener('submit',event=>{event.preventDefault();ask($('question').value.trim());});document.querySelectorAll('[data-question]').forEach(el=>el.addEventListener('click',()=>ask(t('question'+el.dataset.question.charAt(0).toUpperCase()+el.dataset.question.slice(1)))));
  window.addEventListener('pagehide',stop);
  document.addEventListener('factorlab:view',renderChart);
  if(typeof ResizeObserver==='function'){
    const chartObserver=new ResizeObserver(()=>{const host=$('nav-chart');if(host.getClientRects().length&&host.clientWidth&&host.clientHeight&&(chartDirty||chartSize!==host.clientWidth+'x'+host.clientHeight))renderChart();});
    chartObserver.observe($('nav-chart'));
  }else window.addEventListener('resize',renderChart);
  function loadEnvelope(value){unpack(value);campaignEpoch++;allocationUndo=null;stop();resetRequest();installSave(value);brokenRaw=null;writable=true;noticeKey='';save();render();document.dispatchEvent(new Event('factorlab:restore'));}
  function setProfile(id){
    if(id!==null&&(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(id)))throw Error('invalidProfile');
    if(id===profileId)return;campaignEpoch++;allocationUndo=null;
    stop();resetRequest();save();
    if(!writable)memoryProfiles.set(SAVE_KEY,{envelope:envelope(),brokenRaw,writable,noticeKey});else memoryProfiles.delete(SAVE_KEY);
    profileId=id;SAVE_KEY=id===null?GUEST_SAVE_KEY:GUEST_SAVE_KEY+'-account-'+id;
    state=E.initial();draft=[...state.weights];factorPrefs=[25,25,25,25];reason='';note='';forecast='flat';reflection='';evidenceRefs=[];evidenceSelections=[];falsifierIf='';researchProgress=emptyResearchProgress();lastGateKey='';messages=[];chatAttachments=[];chatInput='';$('question').value='';brokenRaw=null;writable=true;noticeKey='';
    const memory=memoryProfiles.get(SAVE_KEY);
    if(memory){installSave(memory.envelope);brokenRaw=memory.brokenRaw;writable=memory.writable;noticeKey=memory.noticeKey;}
    else{const raw=rawGet(SAVE_KEY);if(raw){try{installSave(raw);}catch{brokenRaw=raw;writable=false;noticeKey='corruptSave';}}}
    render();if(!brokenRaw)save();document.dispatchEvent(new CustomEvent('factorlab:profile',{detail:{profileId}}));
  }
  function applyResearchDraft(values){
    if(state.phase!=='decision'||busy)return false;
    const next=['momentum','value','quality','lowVol'].map(id=>values?.[id]);
    if(next.some(v=>!Number.isFinite(v)||v<0||v>100)||!next.some(v=>v>0))return false;
    const total=next.reduce((a,b)=>a+b,0),proposed=E.recommend(state,next.map(v=>v/total),draft[5]);
    allocationUndo=[...draft];allocationUndo.factorPrefs=[...factorPrefs];factorPrefs=next;draft=proposed;renderAllocation();save();decisionFeedback('draft');return true;
  }
  window.FactorLabApp={preview:()=>E.preview(state,draft),ask,applyAllocationDraft,attachEvidence:ref=>{if(chatAttachments.length<8&&!chatAttachments.some(r=>r.id===ref.id&&JSON.stringify(r.selection)===JSON.stringify(ref.selection)))chatAttachments.push(clone(ref));save();renderMessages();},citeEvidence:ref=>{if(state.phase!=='decision'||busy||!evidenceRefs.includes(ref.id)&&evidenceRefs.length>=24)return false;try{ref=FactorLabEvidence.resolveReference(E.publicView(state),ref);}catch{return false;}if(!evidenceRefs.includes(ref.id))toggleCitation(ref.id);if(!evidenceRefs.includes(ref.id))return false;const key=JSON.stringify(ref.selection||{});if(!evidenceSelections.some(r=>r.id===ref.id&&r.snapshotId===ref.snapshotId&&JSON.stringify(r.selection||{})===key)){if(evidenceSelections.length>=24)return false;evidenceSelections.push(clone(ref));}save();renderCitations();updateDraftSummary();return true;},getSave:()=>E.serialize(state),getState:()=>E.publicView(state),getEnvelope:envelope,loadEnvelope,setProfile,applyResearchDraft,setResearchProgress,getUI:()=>({lang,busy,writable,playing,profileId,campaignEpoch,factorPrefs:[...factorPrefs],gate:E.evaluateDecisionGate(state,decisionDraft()),decisionDraft:decisionDraft(),researchProgress:clone(researchProgress),evidenceSelections:clone(evidenceSelections),chatAttachments:clone(chatAttachments)})};
  render();if(!brokenRaw)save();
})();
