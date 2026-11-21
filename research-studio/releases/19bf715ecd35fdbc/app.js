(async function() {
  'use strict';
  const staticHosting=document.querySelector('meta[name="factorlab-hosting"]')?.content==='static';
  const cloudMode=!!window.FactorLabCloudConfig,cloud=window.FactorLabCloud,offlineHosting=staticHosting&&!cloudMode;
  const E=window.FactorLabLedger.createEngine(window.FactorLabSimulation), $=id=>document.getElementById(id);
  const GUEST_SAVE_KEY='factorlab-simulation-ui-v3', LANG_KEY='factorlab-simulation-language-v3';
  const COACH_RETRY_SUFFIX='-coach-retry-v2';
  const memoryProfiles=new Map();
  let SAVE_KEY=GUEST_SAVE_KEY,profileId=null;
  const PHASES={decision:'phaseDecision',simulating:'phaseSimulating',event:'phaseEvent',review:'phaseReview',complete:'phaseComplete'};
  const COLORS=['#202020','#4b4b4b','#777777','#9e9e9e','#bfbfbf','#d8d8d8'];
  const allocationPresets={
    balanced:[.20,.20,.15,.15,.15,.15],
    defensive:[.12,.12,.13,.13,.10,.40],
    growth:[.30,.18,.10,.10,.27,.05]
  };
  let allocationUndo=null, previewState, previewWeights, cachedPreview;
  let memoTemplate='evidence';
  const SECTOR_ICONS=['semiconductor','robotics','materials','energy','infrastructure','cash'];
  const feedback=(kind,stage,extra={})=>document.dispatchEvent(new CustomEvent('factorlab:feedback',{detail:{kind,stage,...extra}}));
  let campaignEpoch=0;
  let activities=[], activityTimer, activityController, pendingActivity=null, activityRevision=0, localActivityUses=0, lastCoachRequest=-Infinity;
  let coachStage='', coachIssue='', coachRetryAt=0, replayChat=null;
  const scenarios=['baseline','stress','recovery'];

  const clone=v=>JSON.parse(JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let lang='zh-CN',state=E.initial(),draft=[...state.weights],factorPrefs=[25,25,25,25];
  let reason='',note='',forecast='flat',cycleJudgment='insufficient',counterEvidence='',reflection='',writable=true,brokenRaw=null,noticeKey='';
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
  await i18next.init({lng:lang,fallbackLng:'zh-CN',keySeparator:false,initImmediate:false,interpolation:{escapeValue:false},resources:Object.fromEntries(['zh-CN','en'].map(l=>[l,{translation:{...E.TEXTS[l],...FactorLabStrings[l],...(l==='en'?{sectorShort0:'Semicon',sectorShort3:'Energy',sectorShort4:'AI infra'}:{})}}]))});
  const t=(key,values={})=>i18next.t(key,values);
  const number=(value,digits=0)=>Number.isFinite(value)?(Math.abs(value)<.5*10**-digits?0:value).toLocaleString(lang,{minimumFractionDigits:digits,maximumFractionDigits:digits}):'—';
  const percent=(v,d=2,sign=false)=>Number.isFinite(v)?(sign&&v>0?'+':'')+number(v*100,d)+'%':'—';
  const CYCLE_KEYS=['expansion','overheating','stagflation','recession','recovery','insufficient'];
  const cycleName=value=>value==='insufficient'?(lang==='en'?'Insufficient evidence':'证据不足'):t('cycle.'+value,{defaultValue:value});
  const money=(v,sign=false)=>(sign&&v>0?'+':'')+number(v,2);
  const normalizedFactors=()=>{const sum=factorPrefs.reduce((a,b)=>a+b,0);return sum>0?factorPrefs.map(v=>v/sum):[0,0,0,0];};
  const totalRounds=()=>state.totalRounds||state.config?.rounds||6;
  const localText=(zh,en)=>lang==='en'?en:zh;
  const signedAmount=(value,label)=>Number.isFinite(value)&&value!==0
    ? '<span class="decision-signed" data-direction="'+(value>0?'up':'down')+'"><span aria-hidden="true">'+(value>0?'↑':'↓')+'</span>'+esc(label)+'</span>'
    : esc(label);
  function draftPreview(){
    if(previewState!==state||previewWeights!==draft){
      cachedPreview=E.preview(state,draft);
      previewState=state;previewWeights=draft;
    }
    return cachedPreview;
  }
  const lastResult=()=>state.results?.at(-1);
  const finished=()=>state.day>=totalRounds()*state.daysPerRound;
  function newGameOptions(){
    const values=new URLSearchParams(location.search);
    const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    const seed=local&&/^[1-9][0-9]{0,9}$/.test(values.get('seed')||'')&&Number(values.get('seed'))<=4294967295
      ? Number(values.get('seed')) : (Math.floor(Math.random()*4294967295)+1);
    const forced=local?values.get('scenario'):null;
    if(scenarios.includes(forced))return {seed,scenario:forced};
    let counter=seed%3;
    try{
      const stored=localStorage.getItem('factorlab-blind-scenario-v1');
      if(stored!==null&&/^[0-2]$/.test(stored))counter=Number(stored);
      localStorage.setItem('factorlab-blind-scenario-v1',String((counter+1)%3));
    }catch{}
    return {seed,scenario:scenarios[counter]};
  }
  function restoreGame(game){
    if(!game.replayKey)return E.restore(game);
    const {replayKey,...rest}=game;
    if(typeof replayKey!=='string'||!/^r1_[a-z0-9]{1,7}$/.test(replayKey)||rest.seed!==undefined||rest.scenario!==undefined)throw Error('invalidSave');
    const code=parseInt(replayKey.slice(3),36);
    const seed=Math.floor(code/3);
    if(seed<1||seed>4294967295)throw Error('invalidSave');
    return E.restore({...rest,seed,scenario:scenarios[code%3]});
  }
  function exportEnvelope(){
    const current=envelope(),{seed,scenario,...game}=current.game;
    current.game={...game,replayKey:'r1_'+(seed*3+scenarios.indexOf(scenario)).toString(36)};
    return current;
  }
  function validDraft(values) {return Array.isArray(values)&&values.length===6&&values.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-7&&values.slice(0,5).every(v=>v<=.4+1e-10);}
  function unpack(raw) {
    const item=typeof raw==='string'?JSON.parse(raw):raw;
    if(!['factorlab-ui-v2','factorlab-ui-v3'].includes(item?.version)||!item.game)throw Error('invalidSave');
    const loaded=restoreGame(item.game);
    const proposed=validDraft(item.draft)?item.draft:[...loaded.weights];
    const prefs=Array.isArray(item.factorPrefs)&&item.factorPrefs.length===4&&item.factorPrefs.every(v=>Number.isFinite(v)&&v>=0&&v<=100)&&item.factorPrefs.some(v=>v>0)?item.factorPrefs:[25,25,25,25];
    const refs=item.evidenceRefs??[],condition=item.falsifierIf??'';
    const available=new Set([...E.publicView(loaded).evidence,...loaded.events,...(window.FactorLabEvidence?.buildEvidence(E.publicView(loaded))||[])].map(e=>e.id));
    const validRef=id=>available.has(id)||window.FactorLabEvidence?.validateReference(E.publicView(loaded),id);
    if(!Array.isArray(refs)||refs.length>24||refs.some(id=>typeof id!=='string'||!validRef(id))||typeof condition!=='string'||condition.length>500)throw Error('invalidSave');
    const selections=item.evidenceSelections??[];
    if(!Array.isArray(selections)||selections.length>24||selections.some(ref=>!refs.includes(ref?.id)))throw Error('invalidSave');
    const canonicalSelections=selections.map(ref=>window.FactorLabEvidence.resolveReference(E.publicView(loaded),ref));
    return {evidenceSelections:canonicalSelections,chat:item.chat||{},loaded,proposed,prefs,refs:[...new Set(refs)],condition,researchProgress:normalizeResearchProgress(item.researchProgress),reason:['','evidence','risk','anchor','valuation'].includes(item.reason)?item.reason:'',note:typeof item.note==='string'?item.note.slice(0,180):'',forecast:['up','flat','down'].includes(item.forecast)?item.forecast:'flat',cycleJudgment:CYCLE_KEYS.includes(item.cycleJudgment)?item.cycleJudgment:'insufficient',counterEvidence:typeof item.counterEvidence==='string'?item.counterEvidence.slice(0,500):'',reflection:typeof item.reflection==='string'?item.reflection.slice(0,600):''};
  }
  function installSave(raw) {const x=unpack(raw);state=x.loaded;draft=x.proposed;factorPrefs=x.prefs;reason=x.reason;note=x.note;forecast=x.forecast;cycleJudgment=x.cycleJudgment;counterEvidence=x.counterEvidence;reflection=x.reflection;evidenceRefs=x.refs;falsifierIf=x.condition;researchProgress=x.researchProgress;evidenceSelections=x.evidenceSelections;messages=Array.isArray(x.chat.messages)?x.chat.messages.filter(m=>m&&!m.pending).slice(-40):[];chatAttachments=Array.isArray(x.chat.attachments)?x.chat.attachments.slice(0,8):[];chatInput=typeof x.chat.input==='string'?x.chat.input.slice(0,600):'';$('question').value=chatInput;lastGateKey='';}
  const ownSave=rawGet(SAVE_KEY),rawSave=ownSave===null?rawGet('factorlab-simulation-ui-v2'):ownSave;
  if(rawSave){try{if(!rawGet(SAVE_KEY+'-pre-securities'))localStorage.setItem(SAVE_KEY+'-pre-securities',rawSave);installSave(rawSave);}catch{brokenRaw=rawSave;writable=false;noticeKey='corruptSave';}}
  else{state=E.initial(newGameOptions());draft=[...state.weights];}
  function envelope(){return {version:'factorlab-ui-v3',game:E.serialize(state),draft:[...draft],factorPrefs:[...factorPrefs],reason,note,forecast,cycleJudgment,counterEvidence,reflection,evidenceRefs:[...evidenceRefs],falsifierIf,researchProgress:clone(researchProgress),evidenceSelections:clone(evidenceSelections),chat:{schema:1,messages:clone(messages.filter(m=>!m.pending)),attachments:clone(chatAttachments),input:$('question').value}};}
  function decisionDraft(){return {weights:[...draft],factorWeights:normalizedFactors(),reason:reason?reason+(note?' · '+note:''):note.trim(),forecast,cycleJudgment,counterEvidence,evidenceRefs:[...evidenceRefs],falsifierIf,evidenceSelections:clone(evidenceSelections),...(state.ledger?{snapshotId:state.ledger.snapshotId,revision:state.ledger.revision,transactionId:state.ledger.snapshotId+':confirm'}:{})};}
  function decisionFeedback(kind, materialId){
    document.dispatchEvent(new CustomEvent('factorlab:decision-feedback',{detail:{kind,stage:'success',gate:E.evaluateDecisionGate(state,decisionDraft()),campaignEpoch,round:state.round}}));
    if(['draft','citation','settlement'].includes(kind))recordActivity(kind,materialId);
  }
  function setResearchProgress(value){researchProgress=normalizeResearchProgress(value);save();renderCourseChecklist();document.dispatchEvent(new Event('factorlab:research-progress'));}
  function save(){if(writable){try{localStorage.setItem(SAVE_KEY,JSON.stringify(envelope()));}catch{writable=false;noticeKey='saveBlocked';}}$('save-status').textContent=t(writable?'saved':'memoryOnly');showNotice();document.dispatchEvent(new CustomEvent('factorlab:save',{detail:{profileId,day:state.day}}));}
  function showNotice(key){if(key)noticeKey=key;$('notice').hidden=!noticeKey;$('notice').textContent=noticeKey?t(noticeKey):'';}
  function translate(){
    const scope=$('open-context');
    scope.title=lang==='en'?'Scope & sources':'项目目标与资料来源';
    scope.setAttribute('aria-label',scope.title);
    document.documentElement.lang=lang;document.title='FactorLab · '+t('chapter');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));$('language').value=lang;$('design-link').href=staticHosting?'previous/':'import/'+lang+'.html';document.querySelector('.rail')?.setAttribute('aria-label',t('desk'));$('rounds').setAttribute('aria-label',t('round',{round:state.round,total:totalRounds()}));$('macro').setAttribute('aria-label',t('macroHint'));if(state.ledger)document.querySelectorAll('[data-i18n="riskFrequency"]').forEach(el=>el.textContent=lang==='en'?'Volatility and Sharpe assume 252 teaching steps per year; synthetic dates are calendar steps, not an exchange calendar. Risk-free return uses the then-visible daily policy-rate assumption.':'波动率与 Sharpe 按每年252个教学步长年化；合成日期按日历推进，不是真实交易所日历。无风险收益使用当时可见政策利率的日收益假设。');}
  let plottedHistory, plottedLanguage;
  function renderChart(){
    if(plottedHistory===state.history&&plottedLanguage===lang)return;
    plottedHistory=state.history;plottedLanguage=lang;
    FactorVisuals.chart($('nav-chart'),{rows:state.history,series:[
      {key:'anchorNav',name:t('anchor'),color:'#999891'},
      {key:'benchmarkNav',name:t('benchmark'),color:'#54534e',dash:true},
      {key:'nav',name:t('yourPortfolio'),color:'#814d68'}
    ],label:t('chartLabel'),unit:'USD',format:v=>number(v,0),xLabel:r=>t('eventDay',{day:r?.day||0}),empty:state.day===0?t('chartEmpty'):''});
  }
  function renderMarket(){
    $('phase').textContent=t(PHASES[state.phase]||'phaseDecision');$('day-count').textContent=t('day',{day:state.day});$('round-count').textContent=t('round',{round:state.round,total:totalRounds()});
    const rounds=$('rounds'),settled=state.results.length;
    rounds.setAttribute('role','list');
    rounds.setAttribute('aria-label',localText('轮次进度，已完成 ','Round progress, ')+settled+' / '+totalRounds()+localText(' 轮',' settled'));
    if(rounds.childElementCount!==totalRounds()){
      rounds.innerHTML=Array.from({length:totalRounds()},(_,i)=>`<span class="round-item" role="listitem"><b aria-hidden="true">R${i+1}</b></span>`).join('');
    }
    Array.from(rounds.children).forEach((item,i)=>{
      const done=i<settled,active=!done&&i+1===state.round;
      const status=done?localText('已结算','Settled'):active?localText('进行中','In progress'):localText('未开始','Upcoming');
      const label=t('roundShort',{round:i+1})+' · '+t('roundStage'+i)+' · '+status;
      item.classList.toggle('done',done);item.classList.toggle('active',active);
      if(active)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      item.title=label;item.setAttribute('aria-label',label);
      const days=Math.max(0,state.day-i*state.daysPerRound);
      item.style.setProperty('--round-fill',done?1:active?Math.min(1,.25+.75*days/state.daysPerRound):0);
    });
    $('macro').innerHTML=['rate','inflation','growth','liquidity','credit','sentiment'].map((key,i)=>`<div class="macro-metric"><span>${esc(t(key))}</span><strong>${number(state.macro[key],i<3?1:0)}<small>${i<3?'%':'/100'}</small></strong><div class="micro-track"><i data-width="${Math.min(100,Math.max(0,i<3?state.macro[key]*12:state.macro[key]))}"></i></div></div>`).join('');
    const revealedCycle=['review','complete'].includes(state.phase)?lastResult()?.cycleAtDecision:null;$('cycle').textContent=revealedCycle?cycleName(revealedCycle):(lang==='en'?'Cycle label hidden until review':'周期标签提交后揭示');$('cycle').classList.toggle('is-hidden',!revealedCycle);
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
    const eventHTML=ev=>`<article class="event-row" data-event-id="${esc(ev.id)}"><span class="event-index">${esc(ev.id.replace(/[^0-9]/g,'')||ev.startDay)}</span><div><div class="event-meta"><span>${esc(t('eventDay',{day:ev.startDay}))}</span><b>${esc(t(ev.status==='resolved'||state.day>=ev.startDay+ev.duration?'eventResolved':'eventActive'))}</b></div><h3>${esc(t(ev.titleKey))}</h3><p>${esc(t(ev.bodyKey))}</p><button class="text-button citation-button" data-cite="${esc(ev.id)}" aria-pressed="${evidenceRefs.includes(ev.id)}" ${state.phase!=='decision'||busy?'disabled':''}>${esc(st(evidenceRefs.includes(ev.id)?'uncite':'cite'))}</button></div></article>`;
    const latest=events.length?eventHTML(events[0]):`<details class="event-background" ${backgroundOpen?'open':''}><summary>${esc(t('eventInitialTitle'))}</summary><p>${esc(t('eventInitialBody'))}</p></details>`;
    const earlier=events.length>1?`<details class="event-timeline" ${timelineOpen?'open':''}><summary>${lang==='en'?'Earlier events':'此前事件'} · ${events.length-1}</summary>${events.slice(1).map(eventHTML).join('')}</details>`:'';
    $('events').innerHTML=latest+earlier+`<details class="scenario-interpretation"><summary>${lang==='en'?'Scenario background':'市场背景'}</summary>${cards}</details>`;
    document.querySelectorAll('[data-evidence]').forEach(el=>el.addEventListener('click',()=>openEvidence(el.dataset.evidence)));
    $('events').querySelectorAll('[data-cite]').forEach(el=>el.addEventListener('click',()=>toggleCitation(el.dataset.cite)));
    $('event-control').hidden=state.phase!=='event';$('resume').disabled=busy;
    if(focusedEvidence){const control=[...$('events').querySelectorAll('[data-evidence]')].find(el=>el.dataset.evidence===focusedEvidence);if(control?.getClientRects().length)control.focus({preventScroll:true});}
  }
  function adjustedAllocation(index,value,baseline=draft){
    const next=[...baseline];
    if(index<5){
      const needed=value-next[index],cashUsed=Math.min(next[5],Math.max(0,needed));
      next[index]=value;next[5]-=cashUsed;
      if(needed<0)next[5]-=needed;
      const shortage=Math.max(0,needed-cashUsed),otherTotal=baseline.slice(0,5).reduce((total,w,i)=>total+(i===index?0:w),0);
      if(shortage>0&&otherTotal>0)for(let i=0;i<5;i++)if(i!==index)next[i]=baseline[i]*(1-shortage/otherTotal);
    }else{
      next[5]=value;const invested=baseline.slice(0,5).reduce((a,b)=>a+b,0);
      for(let i=0;i<5;i++)next[i]=Math.min(.4,invested?baseline[i]/invested*(1-value):(1-value)/5);
      for(let pass=0;pass<5;pass++){const remaining=1-value-next.slice(0,5).reduce((a,b)=>a+b,0),eligible=next.slice(0,5).map((w,i)=>w<.4-1e-10?i:-1).filter(i=>i>=0);if(remaining<1e-10||!eligible.length)break;for(const i of eligible)next[i]+=Math.min(.4-next[i],remaining/eligible.length);}
    }
    next[5]=Math.max(0,1-next.slice(0,5).reduce((a,b)=>a+b,0));return next;
  }
  const narrowDecision=matchMedia('(max-width:850px)');
  function placeDecisionAction(){
    const host=$(narrowDecision.matches?'mobile-decision-action':'desktop-decision-action');
    const action=$('decision-execution');
    if(action.parentElement!==host)host.append(action);
  }
  placeDecisionAction();
  if(narrowDecision.addEventListener)narrowDecision.addEventListener('change',placeDecisionAction);
  else narrowDecision.addListener(placeDecisionAction);
  function allocationHint(kind,index){
    const hint=$('allocation-error');
    const messages={
      precision:localText('滑块在 5% 刻度附近吸附，输入数字可精调至 0.01%。','Sliders snap near 5% marks. Type a weight to adjust by 0.01%.'),
      sector:localText('单一行业的目标仓位为 0% 至 40%。','Each sector target must be between 0% and 40%.'),
      cash:localText('现金仓位为 0% 至 100%。','The cash target must be between 0% and 100%.'),
      reserve:localText('已用完可调现金，余量由其他行业按比例腾出。','The increase uses all available cash. Other sectors fund the balance proportionally.')
    };
    const message=kind?messages[kind]:'';
    if(hint.textContent!==message)hint.textContent=message;
    hint.classList.toggle('is-limit',!!kind&&kind!=='precision');
    if(index===undefined||!kind||kind==='precision')return;
    const row=$('weight-'+index)?.closest('.allocation-row');
    if(row&&!row.classList.contains('at-limit')){
      row.classList.add('at-limit');
      setTimeout(()=>row.classList.remove('at-limit'),160);
    }
  }
  function weightNumber(weight){return (weight*100).toFixed(2).replace(/\.00$/,'');}
  function allocationRow(weight,i,locked){
    const name=esc(t('sector'+i)),target=esc(t('target')+' '+t('sector'+i));
    const limit=i===5?100:40,disabled=locked?' disabled':'';
    return `<div class="allocation-row" data-allocation-part="${i}">
      <label for="weight-${i}" class="sector-label"><i class="sector-swatch" aria-hidden="true"></i><span>${name}<small class="allocation-value" id="allocation-value-${i}"></small></span></label>
      <input class="allocation-slider" id="weight-range-${i}" aria-label="${target}" type="range" min="0" max="${limit}" step="1" value="${Math.round(weight*100)}"${disabled}>
      <small class="weight-current" title="${esc(t('current'))}">${percent(state.weights[i],1)}</small>
      <div class="allocation-input"><input id="weight-${i}" aria-label="${target}" type="number" inputmode="decimal" min="0" max="${limit}" step="0.01" value="${weightNumber(weight)}"${disabled}></div>
    </div>`;
  }
  function bindAllocationRow(i){
    const input=$('weight-'+i),range=$('weight-range-'+i);
    const limit=i===5?100:40,limitHint=i===5?'cash':'sector';
    function usesReserve(baseline,value){return i<5&&value>baseline[i]+baseline[5]+1e-9;}
    input.addEventListener('change',()=>{
      const amount=input.valueAsNumber;
      if(!Number.isFinite(amount)||amount<0||amount>limit){
        input.value=weightNumber(draft[i]);allocationHint(limitHint,i);return;
      }
      const before=[...draft],value=amount/100;
      if(Math.abs(value-before[i])<1e-10)return;
      allocationUndo=before;draft=adjustedAllocation(i,value);renderAllocation();
      if(usesReserve(before,value))allocationHint('reserve',i);
      save();decisionFeedback('draft');
    });
    let baseline=null,pointer=false,reserveShown=false,bounds;
    range.addEventListener('pointerdown',()=>{
      baseline=[...draft];bounds=range.getBoundingClientRect();pointer=true;reserveShown=false;
    });
    range.addEventListener('pointermove',e=>{
      if(!pointer||!e.buttons)return;
      if(e.clientX>bounds.right+2||e.clientX<bounds.left-2)allocationHint(limitHint,i);
    });
    range.addEventListener('pointercancel',()=>{pointer=false;});
    range.addEventListener('keydown',e=>{
      pointer=false;
      if((Number(range.value)>=limit&&['ArrowRight','ArrowUp'].includes(e.key))||
        (Number(range.value)===0&&['ArrowLeft','ArrowDown'].includes(e.key)))allocationHint(limitHint,i);
    });
    range.addEventListener('input',()=>{
      if(!baseline)baseline=[...draft];
      allocationUndo=baseline;
      const amount=Number(range.value),nearest=Math.round(amount/5)*5;
      const value=(pointer&&Math.abs(nearest-amount)<=1?nearest:amount)/100;
      draft=adjustedAllocation(i,value,baseline);
      for(let j=0;j<draft.length;j++){
        $('weight-'+j).value=weightNumber(draft[j]);
        $('weight-range-'+j).value=Math.round(draft[j]*100);
      }
      drawAllocation();
      if(usesReserve(baseline,value)){
        if(!reserveShown)allocationHint('reserve',i);
        reserveShown=true;
      }else{reserveShown=false;allocationHint('precision');}
    });
    range.addEventListener('change',()=>{
      baseline=null;pointer=false;
      updateDraftSummary();save();decisionFeedback('draft');
    });
  }
  function renderAllocation(){
    const focusedWeight=$('allocation').contains(document.activeElement)?document.activeElement.id:null;
    const locked=state.phase!=='decision'||busy;
    $('allocation').innerHTML=(state.phase==='decision'?draft:state.weights).map((v,i)=>allocationRow(v,i,locked)).join('');
    draft.forEach((_,i)=>bindAllocationRow(i));
    allocationHint(state.phase==='decision'?'precision':null);
    drawAllocation();
    const factors=normalizedFactors();$('factors').innerHTML=factorPrefs.map((value,i)=>`<div class="factor-row"><label for="factor-${i}">${esc(t('factor'+i))}</label><input id="factor-${i}" type="range" min="0" max="100" step="5" value="${value}" ${locked?'disabled':''}><output id="factor-value-${i}" for="factor-${i}">${number(factors[i]*100,0)}%</output></div>`).join('');
    factorPrefs.forEach((_,i)=>$('factor-'+i).addEventListener('input',()=>{factorPrefs[i]=Number($('factor-'+i).value);const current=normalizedFactors();current.forEach((v,j)=>$('factor-value-'+j).textContent=number(v*100,0)+'%');updateDraftSummary();save();}));
    document.querySelectorAll('[data-preset]').forEach(el=>el.disabled=locked);$('apply-factors').disabled=locked;
    if($('reason').value!==reason)$('reason').value=reason;if($('note').value!==note)$('note').value=note;if($('forecast').value!==forecast)$('forecast').value=forecast;
    if($('cycle-judgment').value!==cycleJudgment)$('cycle-judgment').value=cycleJudgment;if($('counter-evidence').value!==counterEvidence)$('counter-evidence').value=counterEvidence;
    $('note').placeholder=lang==='en'?'Why are you making this adjustment? (optional)':'记下这次调整的想法（可选）';
    $('note').setAttribute('aria-label',lang==='en'?'Additional decision rationale':'补充判断理由');
    $('counter-evidence').placeholder=lang==='en'?'For example: orders do not convert into revenue':'例如：订单没有转化为收入';
    if($('falsifier-if').value!==falsifierIf)$('falsifier-if').value=falsifierIf;
    document.querySelector('label[for="falsifier-if"]').textContent=st('falsifier');
    for(const id of ['reason','note','forecast','cycle-judgment','counter-evidence','falsifier-if'])$(id).disabled=locked;
    renderCitations();
    updateDraftSummary();
    if(focusedWeight&&!locked&&!$('view-portfolio').hidden)$(focusedWeight)?.focus({preventScroll:true});
  }
  function drawAllocation(){
    const editable=state.phase==='decision',weights=editable?draft:state.weights;
    const preview=editable?draftPreview():null,ledger=state.ledger;
    const cash=editable&&preview?.ok?preview.cash:state.cash;
    const summary=[];
    let offset=0;
    weights.forEach((weight,i)=>{
      let amount;
      if(i===5)amount=cash;
      else if(editable&&preview?.rows)amount=preview.rows.filter(row=>row.sectorIndex===i).reduce((sum,row)=>sum+row.targetAmount,0);
      else if(!editable&&ledger)amount=ledger.holdings.filter(row=>row.sectorIndex===i).reduce((sum,row)=>sum+row.marketValue,0);
      else amount=(preview?.after??state.nav)*weight;
      $('allocation-value-'+i).textContent=money(amount)+' USD';
      const label=t('sector'+i)+' '+percent(weight,2),part=$('allocation-dial').children[i];
      part.style.transform='translateX('+offset*100+'%) scaleX('+weight+')';
      offset+=weight;part.title=label;summary.push(label);
      const range=$('weight-range-'+i);
      range.style.setProperty('--range-fill',Math.min(100,Math.max(0,weight*10000/Number(range.max)))+'%');
      range.setAttribute('aria-valuetext',percent(weight,2));
    });
    $('allocation-dial').setAttribute('aria-label',summary.join(' · '));
    const largest=Math.max(...weights.slice(0,5)),leaders=weights.slice(0,5).map((v,i)=>Math.abs(v-largest)<1e-9?t('sector'+i):null).filter(Boolean);
    $('allocation-largest').textContent=largest>0?leaders[0]+(leaders.length>1?localText(' 等',' +'+(leaders.length-1)):'')+' · '+percent(largest,1):'—';
    $('allocation-cash').textContent=money(cash)+' USD';
    $('total').textContent=percent(weights.reduce((a,b)=>a+b,0),0);
    $('cost-label').textContent=t(editable?'estimatedCost':'actualCost');
    $('fee').textContent=(editable?(preview?.ok?money(preview.fee):'—'):money(state.transactions.at(-1)?.fee||0))+' USD';
    const presets=$('portfolio').querySelector('.presets');
    presets.setAttribute('aria-label',localText('配置预设','Allocation presets'));
    const presetButtons=[...presets.querySelectorAll('[data-preset]')];
    const active=editable?presetButtons.findIndex(b=>allocationPresets[b.dataset.preset].every((v,i)=>Math.abs(v-weights[i])<1e-7)):-1;
    presetButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
    presets.classList.toggle('has-selection',active>=0);
    if(active>=0)presets.style.setProperty('--preset-index',active);
    $('undo-allocation').disabled=!allocationUndo||!editable||busy;
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
    recordActivity('evidence',id);
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
    evidenceSelections=evidenceSelections.filter(ref=>evidenceRefs.includes(ref.id));updateCitationButton();renderCitations();renderEvents();updateDraftSummary();save();decisionFeedback('citation',id);
  }
  function updateDraftSummary(){
    document.dispatchEvent(new Event('factorlab:draft'));
    const gate=E.evaluateDecisionGate(state,decisionDraft());
    const gateMessage=busy?st('busyGate'):gate.status==='need_evidence'?st('needEvidence'):gate.status==='need_falsifier'?st('needFalsifier'):gate.status==='ready'?st('ready'):st(gate.error||'invalidReason');
    $('step-feedback-bar').textContent=gate.canConfirm&&!busy?'':gateMessage;$('step-feedback-bar').dataset.state=gate.status;
    $('step-feedback-bar').hidden=state.phase!=='decision'||gate.canConfirm&&!busy;
    $('confirm').disabled=state.phase!=='decision'||busy||!gate.canConfirm;
    const gateKey=campaignEpoch+':'+state.round+':'+gate.status+':'+gate.error;
    if(gateKey!==lastGateKey){
      lastGateKey=gateKey;
      if(state.phase==='decision'&&!gate.canConfirm)decisionFeedback('gate');
    }
    $('confirm').hidden=state.phase!=='decision';$('simulation-controls').hidden=state.phase!=='simulating';
    $('decision-event').hidden=state.phase!=='event';
    $('decision-review').hidden=!['review','complete'].includes(state.phase);
    const progressed=Math.max(0,Math.min(state.daysPerRound,state.day-(state.round-1)*state.daysPerRound));
    $('sim-progress').style.width=progressed/state.daysPerRound*100+'%';
    $('simulation-track').setAttribute('aria-valuenow',progressed);
    $('simulation-track').setAttribute('aria-valuemax',state.daysPerRound);
    $('simulation-track').setAttribute('aria-label',t('round',{round:state.round,total:totalRounds()}));
    $('simulation-message').textContent=t('simulationProgress',{day:progressed,total:state.daysPerRound});$('pause-play').textContent=t(playing?'pauseAnimation':'playAnimation');$('pause-play').disabled=busy;$('fast-forward').disabled=busy;
  }
  function renderRisk(){
    const action=$('risk-next-action');
    const next=state.phase==='event'?['research',localText('查看本轮事件','Review the event')]:
      ['review','complete'].includes(state.phase)?['journal',localText('写本轮复盘','Review this round')]:
      ['portfolio',state.phase==='simulating'?localText('查看本轮进度','View round progress'):localText('制定本轮配置','Plan this allocation')];
    action.dataset.openView=next[0];action.textContent=next[1];
    const m=E.metrics(state);
    $('risk-observations').textContent=localText('自开局累计 · ','Since opening · ')+m.observations+localText(' 个日收益样本',' daily returns');
    const riskMetrics=[
      ['volatility',percent(m.volatility),null],
      ['sharpe',Number.isFinite(m.sharpe)?(m.sharpe>0?'+':'')+number(m.sharpe,2):'—',m.sharpe],
      ['maxDrawdown',percent(-m.maxDrawdown),-m.maxDrawdown],
      ['diversification',percent(m.diversification,0),null]
    ];
    const metricsHost=$('risk-metrics');
    if(!metricsHost.childElementCount)metricsHost.innerHTML=riskMetrics.map(()=>'<div class="risk-metric"><span></span><strong></strong><button type="button" class="metric-explain" data-explain-metric></button></div>').join('');
    riskMetrics.forEach(([key,value,sign],index)=>{
      const [name,amount,button]=metricsHost.children[index].children;
      const label=t(key),marketDay='D'+state.day;
      const question=localText('请结合当前可见的 '+marketDay+' 数据解释'+label+'（'+value+'）及其计算口径。','Explain '+label+' ('+value+') and how it is calculated using the available '+marketDay+' data.');
      name.textContent=label;amount.innerHTML=signedAmount(sign,value);
      button.dataset.explainMetric=question;button.setAttribute('aria-label',question);
      button.textContent=localText('AI 解释','Ask AI');
    });
    const result=lastResult();
    const exposure=Array.from({length:4},(_,i)=>state.weights.slice(0,5).reduce((sum,w,j)=>sum+w*E.EXPOSURES[j][i],0));
    const returns=state.history.at(-1).factorReturns;
    const factorTable=`<div class="exposure-table"><div><span>${esc(t('factorLabel'))}</span><span>${esc(t('exposure'))}</span><span>${esc(t('factorReturn'))}</span></div>${exposure.map((v,i)=>`<div><span>${esc(t('factor'+i))}</span><b>${number(v,2)}</b><b>${state.day?percent(returns[i],2,true):'—'}</b></div>`).join('')}<p class="footnote">${esc(t('exposureHint'))}</p></div>`;
    if(!result||state.ledger){$('attribution').innerHTML=factorTable;return;}
    const a=result.attribution,entries=[['attributionMarket',a.market],...(a.factors||[]).map((v,i)=>['factor'+i,v]),['attributionSector',a.sector],['attributionEvent',a.event],['attributionIdiosyncratic',a.idiosyncratic],['attributionCash',a.cash],['attributionCost',a.cost]];
    const max=Math.max(1,...entries.map(([,v])=>Math.abs(v)));
    $('attribution').innerHTML=factorTable+`<div class="attribution-breakdown"><h3>${esc(t('attributionTitle',{round:result.round}))}</h3><div class="attribution-rows">`+entries.map(([key,value])=>`<div class="attribution-row"><span>${esc(t(key))}</span><span class="attribution-bar"><i class="${value<0?'loss':''}" data-width="${Math.abs(value)/max*100}"></i></span><strong class="${value<0?'negative':'positive'}">${money(value,true)}</strong></div>`).join('')+'</div></div>';
    $('attribution').querySelectorAll('[data-width]').forEach(el=>el.style.width=el.dataset.width+'%');
  }
  function reasonText(key){const mapping={evidence:'reasonEvidence',risk:'reasonRisk',anchor:'reasonAnchor',valuation:'reasonValuation'},parts=key.split(' · ');return mapping[parts[0]]?[t(mapping[parts[0]]),...parts.slice(1)].join(' · '):key;}
  function cycleEvidence(result){
    const day=(result.round-1)*state.daysPerRound;
    const macro=state.history.find(row=>row.day===day)?.macro;
    if(!macro)return '';
    const en=lang==='en',signal=window.FactorLabSimulation.cycleSignal(macro);
    const observed=en
      ? 'On decision day '+day+', growth was '+number(macro.growth,1)+'%, inflation '+number(macro.inflation,1)+'%, and credit pressure '+number(macro.credit,0)+'/100.'
      : '决策日 D'+day+'，增长 '+number(macro.growth,1)+'%，通胀 '+number(macro.inflation,1)+'%，信用压力 '+number(macro.credit,0)+'/100。';
    const interpretation=signal===result.cycleAtDecision
      ? (en?'The growth and inflation readings support the model’s '+cycleName(signal)+' label.':'按模型的增长和通胀条件，这组读数支持「'+cycleName(signal)+'」。')
      : (en?'The current readings point to '+cycleName(signal)+'. The model label can lag because it requires confirmation over multiple observations.':'当前读数指向「'+cycleName(signal)+'」。模型须等多次确认才切换，周期标签可能滞后。');
    const compare=result.cycleJudgment!=='insufficient'&&result.cycleJudgment!==signal
      ? (en?'Recheck whether the growth and inflation readings support your '+cycleName(result.cycleJudgment)+' judgment.':'再对照增长与通胀，看看这两个读数是否支持你记录的「'+cycleName(result.cycleJudgment)+'」。'):'';
    return '<p class="cycle-evidence-at-decision">'+esc([observed,interpretation,compare].filter(Boolean).join(en?' ':''))+'</p>';
  }
  function renderMemoTemplate(){
    const prompts={
      evidence:localText('我当时采信了哪条证据？哪些读数与它相反？下一轮用什么核验？','Which evidence did I trust? What contradicted it? What will I check next round?'),
      position:localText('哪一笔调整偏离了长期仓位？承担了多少费用？下轮保留还是调整？','Which trade moved me away from my long-term position? What did it cost? What will I keep or change?'),
      volatility:localText('哪次波动出乎预料？哪个行业贡献最大？当时可以观察到什么？','Which move surprised me? Which sector contributed most? What could I see at the time?')
    };
    const group=$('journal').querySelector('.memo-templates');
    group.setAttribute('aria-label',localText('复盘写作模板','Reflection prompts'));
    group.querySelectorAll('[data-memo-template]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.memoTemplate===memoTemplate)));
    $('memo-prompts').textContent=prompts[memoTemplate];
  }
  function renderReview(){
    const result=lastResult(),show=['review','complete'].includes(state.phase);$('review').hidden=!show;
    if(show&&result){$('review-title').textContent=t(finished()?'completeTitle':'reviewTitle');const actual=result.realizedForecast;const predicted=result.forecast;
      const legacy=result.decisionPolicy==='legacy',completeRecord=(result.reward?.badges||[]).includes('badge.recordComplete'),cycleKnown=result.cycleJudgment!==undefined,cycleMatch=cycleKnown&&result.cycleJudgment===result.cycleAtDecision,cycleBlock=cycleKnown?`<div class="cycle-reveal"><h3>${lang==='en'?'Cycle judgment review':'周期判断复盘'}</h3><div class="review-stats"><div class="review-stat"><span>${lang==='en'?'Model cycle at decision':'做判断时的模型周期'}</span><strong>${esc(cycleName(result.cycleAtDecision))}</strong></div><div class="review-stat"><span>${lang==='en'?'Your judgment':'你的判断'}</span><strong>${esc(cycleName(result.cycleJudgment))}</strong></div><div class="review-stat"><span>${lang==='en'?'Comparison':'对照'}</span><strong>${result.cycleJudgment==='insufficient'?(lang==='en'?'No call':'未判断'):cycleMatch?(lang==='en'?'Matched':'一致'):(lang==='en'?'Different':'不一致')}</strong></div></div>${cycleEvidence(result)}<p>${lang==='en'?'A matching label is not proof of correct reasoning. Compare the evidence you cited with the revealed cycle.':'标签一致不等于推理正确；请对照当时引用的证据与揭示的周期。'}</p><p><strong>${lang==='en'?'Cited evidence':'当时引用的依据'}</strong> · ${esc((result.evidenceRefs||[]).join(' · ')||st('notRecorded'))}</p><p><strong>${lang==='en'?'Counter-evidence recorded':'记录的反证'}</strong> · ${esc(result.counterEvidence||st('notRecorded'))}</p><p class="footnote">${lang==='en'?'The model cycle is a teaching label, not a real-market forecast.':'模型周期是教学标签，不是真实市场预测。'}</p></div>`:'';
      $('review-content').innerHTML=[['roundReturn',result.returnValue,percent(result.returnValue,2,true)],['counterfactual',result.tacticalAmount,money(result.tacticalAmount,true)],['anchorDifference',state.nav-state.anchorNav,money(state.nav-state.anchorNav,true)]].map(([key,amount,value])=>`<div class="review-stat"><span>${esc(t(key))}</span><strong>${signedAmount(amount,value)}</strong></div>`).join('')+`<p>${esc(t('forecastActual',{forecast:t('forecast'+predicted.charAt(0).toUpperCase()+predicted.slice(1)),actual:t('forecast'+String(actual).charAt(0).toUpperCase()+String(actual).slice(1))}))}</p>${cycleBlock}<details class="supporting-detail"><summary>${esc(st(legacy?'legacyReward':'processReward'))} · ${number(result.reward?.points||0)}</summary><div class="badges">${(result.reward?.badges||[]).map(key=>`<span class="badge">${esc(key==='badge.recordComplete'?st('recordComplete'):t(key))}</span>`).join('')}</div><p>${esc(completeRecord?st('recordHint'):lang==='en'?'Process records do not validate a judgment.':'过程记录不代表判断正确。')}</p><p><strong>${esc(st('reviewEvidence'))}</strong> · ${esc((result.evidenceRefs||[]).join(' · ')||st('notRecorded'))}</p><p><strong>${esc(st('reviewFalsifier'))}</strong> · ${esc(result.falsifierIf||st('notRecorded'))}</p><p>${esc(reasonText(result.reason||''))}</p></details>`;
    }
    $('next-round').hidden=finished();$('next-round').disabled=busy;$('replay').hidden=!finished();
    $('final-report').hidden=!finished();$('write-memo').hidden=show;
    document.querySelector('label[for="reflection"]').textContent=t(finished()?'reflectionPromptComplete':'reflectionPrompt');
    $('history').innerHTML=state.results.length?state.results.map(r=>{
      const observed=state.ledger?.history.find(h=>h.day===r.day)?.asOf?.slice(0,10);
      const day='D'+r.day;
      const date=observed?`<time datetime="${esc(observed)}">${esc(observed)}</time><span> · ${esc(day)}</span>`:esc(day);
      return `<div class="history-row"><span class="round-seal">${esc(t('roundShort',{round:r.round}))}</span><div class="history-record"><span class="history-date">${date}</span>${r.reason?'<p>'+esc(reasonText(r.reason))+'</p>':''}</div><strong>${signedAmount(r.returnValue,percent(r.returnValue,2,true))}</strong></div>`;
    }).join(''):`<p class="history-empty">${localText('首轮结算后，这里会记录本轮的日期和收益。','Each settled round adds its date and return here.')}</p>`;
    renderMemoTemplate();
    $('memo-count').textContent=reflection.length+' / 600';
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
  const chatAvatars=new WeakMap(), expandedMessageInfo=new WeakSet();
  function chatMessage(msg,en){
    const user=msg.role==='user';
    const author=user?(en?'You':'你'):msg.mode==='live'?(en?'AI assistant':'AI 助手'):msg.mode==='guide'?(en?'Study reference':'学习资料'):(en?'Offline assistant':'离线助手');
    const infoLabel=en?'About this reply':'回复详情';
    const references=(msg.references||[]).map(ref=>{
      const selection=(msg.referenceSelections||[]).find(r=>(r.token||r.id)===(typeof ref==='string'?ref:ref.id))||ref;
      return `<button type="button" class="reference-link" data-chat-ref="${encodeURIComponent(JSON.stringify(selection))}">${esc(referenceLabel(selection))}</button>`;
    }).join('');
    const sources=(msg.sources||[]).map(source=>`<a class="reference-link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join('');
    const tools=(msg.tools||[]).map(tool=>{
      const name=tool.name||tool.tool||'Tool';
      const title=msg.allocationDraft&&name==='propose_allocation_draft'?'':`<strong>${esc(toolLabel(name))}</strong>`;
      return `<div class="tool-result">${title}${toolCard(tool.result??tool)}</div>`;
    }).join('');
    const draft=msg.allocationDraft?`<div class="tool-result"><b>${en?'Allocation draft':'配置草稿'}</b><p>${esc((msg.allocationDraft.weights||[]).map((v,i)=>t('sectorShort'+i,{defaultValue:t('sector'+i)})+' '+(v*100).toFixed(1)+'%').join(' · '))}</p><button type="button" data-apply-chat-draft="${messages.indexOf(msg)}">${en?'Apply to draft':'应用到草稿'}</button></div>`:'';
    const info=user||msg.pending?'':`<details class="message-info"${expandedMessageInfo.has(msg)?' open':''}><summary class="info-control" title="${infoLabel}"><span class="info-mark" aria-hidden="true">i</span><span class="sr-only">${infoLabel}</span></summary><div class="message-info-body"><strong>${author}</strong>${msg.detail?`<p>${esc(msg.detail)}</p>`:''}</div></details>`;
    return `<div class="message ${user?'user':'assistant'}" role="group" aria-label="${author}">${user?'':'<span class="message-avatar" aria-hidden="true"></span>'}<div class="message-bubble"><p>${esc(msg.summary)}</p>${msg.replyIssue?`<p class="coach-turn-issue" role="status">${esc(msg.replyIssue)}</p>`:''}${references}${sources}${tools}${draft}${info}</div></div>`;
  }

  function renderMessages(scrollToEnd=false){
    const en=lang==='en', replayContext=window.FactorLabReplayUI?.getContext?.(), log=$('coach-scroll');
    const follow=$('coach-drawer').open&&(scrollToEnd===true||log.scrollHeight-log.scrollTop-log.clientHeight<72);
    const replayKey=replayContext?.active?replayContext.releaseId+':'+replayContext.revealed:'outside';
    const showingReplay=replayChat?.key===replayKey;
    const visibleMessages=showingReplay?replayChat.messages:messages;
    const rows=visibleMessages.filter(m=>m.lang===lang&&['assistant','user'].includes(m.role));
    const thread=$('messages');
    thread.innerHTML=rows.map(msg=>chatMessage(msg,en)).join('')+(busy?`<p class="coach-progress" role="status">${coachStage==='cooldown'?(en?'Waiting briefly before retrying…':'等待冷却后自动续发…'):coachStage==='thinking'?(en?'Thinking…':'正在思考…'):(en?'Researching…':'正在研究…')}</p>`:'');
    thread.querySelectorAll('.message').forEach((node,index)=>{
      const message=rows[index],avatar=node.querySelector('.message-avatar');
      if(!avatar)return;
      let picture=chatAvatars.get(message);
      if(!picture&&window.FactorMascot?.petPicture){
        picture=window.FactorMascot.petPicture(document);
        chatAvatars.set(message,picture);
      }
      if(picture)avatar.append(picture);
      const info=node.querySelector('.message-info');
      info?.addEventListener('toggle',()=>{
        if(info.open)expandedMessageInfo.add(message);
        else expandedMessageInfo.delete(message);
      });
    });
    $('coach-empty').hidden=busy||rows.length>0;
    if(follow)log.scrollTop=1e7;
    $('ask').disabled=busy;$('stop-coach').hidden=!busy;$('retry-coach').disabled=busy;
    const lastAnswer=rows.filter(m=>m.role==='assistant').at(-1);
    const quotaStatus=coachRetryTime()?coachFailureText({code:'quota_exceeded'}):'';
    const issue=coachIssue||quotaStatus,lastTurn=rows.at(-1);
    const alert=lastTurn?.replyIssue===issue?'':issue;
    const retryableFallback=lastAnswer?.reason&&lastAnswer.reason!=='demo';
    const idleStatus=offlineHosting||location.protocol==='file:'?(en?'Offline guide':'离线学习引导')
      :cloudMode&&!profileId?(en?'Sign in to use the online assistant':'登录后可使用在线助手')
      :(en?'Online assistant available':'在线助手可用');
    $('coach-alert').textContent=alert;
    $('coach-alert').hidden=!alert;
    $('retry-coach').hidden=busy||(!issue&&!retryableFallback&&lastTurn?.role!=='user');
    $('coach-mode').textContent=coachIssue||(showingReplay?(en?'Archive explanation':'公告资料讲解'):quotaStatus||(
      lastAnswer?.mode==='guide'?(en?'Study reference':'学习资料'):lastAnswer?.mode==='live'
      ? (lastAnswer.thinking?(en?'Online · Thinking mode':'在线 · 思考模式'):(en?'Online model':'在线模型'))
      : lastAnswer?.reason==='quota_exceeded'?(en?'AI temporarily rate limited · use Retry':'在线助手暂时限流 · 稍后点重试')
      : lastAnswer?.reason==='demo'?(en?'Offline guide':'离线学习引导')
      : lastAnswer?.reason?(en?'Offline guide · use Retry to reconnect':'离线学习引导 · 可点重试连接')
       : idleStatus));
    $('chat-attachments').innerHTML=chatAttachments.map((ref,i)=>`<button data-remove-attachment="${i}">${esc(referenceLabel(ref))} ×</button>`).join('');
    $('chat-attachments').querySelectorAll('[data-remove-attachment]').forEach(el=>el.onclick=()=>{chatAttachments.splice(Number(el.dataset.removeAttachment),1);save();renderMessages();});
    $('messages').querySelectorAll('[data-chat-ref]').forEach(el=>el.onclick=()=>window.FactorLabStudio?.openReference(JSON.parse(decodeURIComponent(el.dataset.chatRef))));
    $('messages').querySelectorAll('[data-apply-chat-draft]').forEach(el=>el.onclick=()=>{const proposal=messages[Number(el.dataset.applyChatDraft)]?.allocationDraft;const ok=applyAllocationDraft(proposal);if(!ok){el.textContent=en?'Draft expired — ask again':'草稿已过期，请重新提问';return;}el.textContent=en?'Applied ✓':'已应用 ✓';window.FactorLabWorkspace.go('portfolio');});
  }

  function render(){document.body.dataset.phase=state.phase;translate();renderMarket();renderEvents();renderAllocation();renderRisk();renderReview();renderMessages();showNotice();$('save-status').textContent=t(writable?'saved':'memoryOnly');document.dispatchEvent(new CustomEvent('factorlab:render',{detail:{phase:state.phase,day:state.day,round:state.round,lang}}));}
  function stop(){clearTimeout(timer);timer=null;playing=false;}
  function act(action){try{const previousResults=state.results.length;state=E.reduce(state,action);if(state.phase!=='simulating')stop();if(action.type==='next'){cancelActivityRequest();if(activityEnabled())activityCard(lang==='en'?'New round. Review any new evidence before adjusting your allocation.':'新一轮开始。看看有哪些新证据，再考虑是否调整配置。');allocationUndo=null;draft=state.weights.map((v,i)=>i<5?Math.min(.4,v):v);draft[5]=1-draft.slice(0,5).reduce((a,b)=>a+b,0);reason='';note='';forecast='flat';cycleJudgment='insufficient';counterEvidence='';evidenceRefs=[];evidenceSelections=[];falsifierIf='';}save();render();if(state.results.length>previousResults){const result=lastResult();feedback('settlement','success',{id:campaignEpoch+':'+state.day,returnValue:result.returnValue,benchmarkReturn:result.benchmarkReturn,milestone:state.phase==='complete'});decisionFeedback('settlement');}return true;}catch(error){showNotice(FactorLabStrings[lang][error.message]?error.message:'actionError');return false;}}
  function schedule(){if(!playing||state.phase!=='simulating'||busy)return;timer=setTimeout(()=>{if(act({type:'advance',days:1})&&playing)schedule();},speed);}
  function startPlayback(){if(matchMedia('(prefers-reduced-motion: reduce)').matches){act({type:'advance',days:state.daysPerRound});return;}playing=true;updateDraftSummary();schedule();}
  function download(data,name,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function activityEnabled(){
    try{return localStorage.getItem('factorlab-activity:'+(profileId||'guest'))!=='off';}catch{return true;}
  }
  function takeActivitySlot(){
    const date=new Date().toISOString().slice(0,10),key='factorlab-activity-budget:'+profileId;
    try{
      const previous=JSON.parse(localStorage.getItem(key)||'null');
      const count=previous?.date===date&&Number.isInteger(previous.count)?previous.count:0;
      if(count>=6)return false;
      localStorage.setItem(key,JSON.stringify({date,count:count+1}));
      return true;
    }catch{
      if(localActivityUses>=6)return false;
      localActivityUses++;
      return true;
    }
  }
  function activityCard(value, mode='rule', status=''){
    const en=lang==='en';
    const task = window.FactorLabGuidance?.getState()?.task;
    const explanation=$('coach-activity-detail');
    const explanationBox=$('coach-activity-explanation');
    if(explanation&&explanationBox){
      explanation.textContent=value;
      explanationBox.hidden=!value;
    }
    if (task) value=task.text;
    $('coach-activity').dataset.mode=mode;
    $('coach-activity-label').textContent=en?'Next step':'当前下一步';
    $('coach-activity-text').textContent=value;
    $('coach-activity-status').textContent=status;
    $('coach-activity-toggle').textContent=activityEnabled()?(en?'Pause':'暂停'):(en?'Enable':'开启');
    $('coach-activity-toggle').setAttribute('aria-pressed',String(!activityEnabled()));
    $('coach-activity-toggle').setAttribute('aria-label',en?'Pause or enable automatic research guidance':'暂停或开启主动研究提示');
  }
  function cancelActivityRequest(){
    clearTimeout(activityTimer);
    pendingActivity=null;
    activityController?.abort();
    activityController=null;
    activityRevision++;
  }
  function resetActivity(){
    cancelActivityRequest();
    activities=[];
    localActivityUses=0;
    replayChat=null;
    const en=lang==='en';
    activityCard(activityEnabled()
      ? (en?'The assistant can follow evidence you open, allocation changes and round reviews.':'助手会根据你查看的证据、配置变动和复盘给出提示。')
      : (en?'Automatic guidance paused.':'已暂停主动提示。'));
  }
  function activityHint(event){
    const en=lang==='en';
    if(event.kind==='draft'){
      const largest=draft.slice(0,5).indexOf(Math.max(...draft.slice(0,5)));
      const industry=t('sector'+largest),weight=percent(draft[largest],1),cash=percent(draft[5],1);
      if(draft[5]===1)return en?'Draft: all cash. Check the sale fees before confirming.':'草案已调为全现金。确认前可查看卖出费用。';
      const fee=E.preview(state,draft).fee;
      return en?`Draft: ${industry} ${weight}, cash ${cash}. Estimated fee USD ${money(fee)}. Check how this changes concentration.`
        :`草案中${industry}占 ${weight}，现金 ${cash}，预计费用 ${money(fee)} 美元。确认前看一眼配置是否过于集中。`;
    }
    if(event.kind==='settlement'&&lastResult()){
      const result=lastResult();
      return en?`Round return ${percent(result.returnValue)}, benchmark ${percent(result.benchmarkReturn)}. Check what contributed most.`
        :`本轮组合收益 ${percent(result.returnValue)}，基准 ${percent(result.benchmarkReturn)}。复盘时找出贡献最大的行业和本轮费用。`;
    }
    if(event.kind==='backtest')return en?'The factor backtest has run. Look at each factor’s IC and sample size.':'因子回测已更新。先核对各因子的 Rank IC 和有效样本数，再考虑调整配置。';
    if(event.kind==='confirmed')return en?'Allocation locked. Compare the outcome with the original evidence when the round settles.':'配置已确认。结算后可以对照基准与当时的证据，检验这次调整。';
    if(event.kind==='judgment')return en?'Cycle judgment recorded. Name one observation that would change your view.':'周期判断已记录。试着写出哪一项新证据会改变你的判断。';
    const material=event.materialId?referenceLabel(event.materialId):'';
    if(event.kind==='citation'&&material){
      if(event.cited)return en?'Added '+material+' to your decision notes. Check how it supports the allocation.':'已将「'+material+'」加入决策笔记。可以写下它对配置的影响。';
      return en?'Removed '+material+' from your decision notes.':'已从决策笔记移除「'+material+'」。';
    }
    return en?(material?'You opened '+material+'. Check its disclosure time before using it.':'Check when this evidence became available.'):(material?'已查看「'+material+'」。引用前先核对它何时公开。':'先核对这份材料何时公开。');
  }
  function coachPayload(question, extra={}){
    const draftContext=state.phase==='decision'?decisionDraft():null;
    if(extra.proactive&&draftContext)Object.assign(draftContext,{reason:'',falsifierIf:'',counterEvidence:''});
    return {save:E.serialize(state),question,lang,thinking:true,activities:activities.slice(-8),stream:true,
      attachments:extra.proactive?[]:clone(chatAttachments),page:window.FactorLabWorkspace?.getView(),
      ...(draftContext?{decisionDraft:draftContext}:{}),...extra};
  }
  async function coachTransport(payload,signal,onEvent){
    if(offlineHosting||location.protocol==='file:'||cloudMode&&!profileId)throw Error('demo');
    if(cloudMode){
      if(!cloud?.coachStream)throw Error('cloud');
      return cloud.coachStream(payload,signal,onEvent);
    }
    const response=await fetch('/api/coach-v3',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal});
    if(!response.ok)throw Error('http_'+response.status);
    return response.headers.get('content-type')?.includes('text/event-stream')?FactorLabCoachStream.consume(response,onEvent,signal):response.json();
  }
  async function requestCoach(payload,signal,onEvent){
    const abortError=()=>signal.reason??new DOMException('Request aborted','AbortError');
    if(signal.aborted)throw abortError();
    let abort;
    const interrupted=new Promise((_,reject)=>{
      abort=()=>reject(abortError());
      signal.addEventListener('abort',abort,{once:true});
    });
    try{
      return await Promise.race([interrupted,coachTransport(payload,signal,onEvent)]);
    }finally{
      signal.removeEventListener('abort',abort);
    }
  }
  function coachRetryTime(){
    if(!cloudMode||!profileId)return 0;
    const now=Date.now();
    let saved=0;
    try{saved=Number(localStorage.getItem(SAVE_KEY+COACH_RETRY_SUFFIX));}catch{}
    const until=Math.max(coachRetryAt,Number.isFinite(saved)&&saved<=now+86400000?saved:0);
    return until>now?until:0;
  }
  function rememberCoachQuota(error){
    if(!cloudMode||!profileId||error.code!=='quota_exceeded'||!error.retryAfter)return;
    coachRetryAt=Math.max(coachRetryTime(),Date.now()+error.retryAfter*1000);
    try{localStorage.setItem(SAVE_KEY+COACH_RETRY_SUFFIX,String(coachRetryAt));}catch{}
  }
  function coachFailureText(error,aborted=false,replyLang=lang){
    const en=replyLang==='en',code=error.code||error.message;
    let message;
    if(code==='quota_exceeded'){
      const until=coachRetryTime();
      if(!until)message=en?'AI temporarily rate limited · retry later':'在线助手暂时限流 · 稍后可重试';
      else{
        const time=new Date(until).toLocaleString(replyLang,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'});
        message=en?'AI rate limited · retry after '+time:'在线助手限流 · '+time+' 后可重试';
      }
    }
    else if(['balance','provider_balance'].includes(code))message=en?'Model service balance is depleted':'模型服务余额不足';
    else if(['authentication','provider_authentication'].includes(code))message=en?'Model service authentication failed':'模型服务认证失败';
    else if(['login_required','session_unavailable','session_changed'].includes(code)||error.status===401)message=en?'Sign in again to continue':'登录会话已失效，请重新登录';
    else if(code==='verified_email_required')message=en?'Verify your email to use the assistant':'验证邮箱后即可使用在线助手';
    else if(['service_not_configured','quota_unavailable'].includes(code))message=en?'The AI service is unavailable':'在线助手服务暂不可用';
    else if(['provider_rate_limited','rate_limited'].includes(code))message=en?'Model service is busy · try again':'模型服务繁忙，请重试';
    else if(['region_restricted','provider_region_restricted'].includes(code))message=en?'Model service is unavailable in this region':'模型服务受地区限制';
    else if(aborted||['timeout','provider_timeout'].includes(code))message=en?'Online reply timed out · try again':'在线回复超时，请重试';
    else if(code==='invalid_request')message=en?'The service could not read this research state':'在线助手无法读取本局状态，请刷新后重试';
    else if(['schema','invalid_response','provider_incomplete','stream_interrupted','stream_size'].includes(code))message=en?'The online reply was incomplete · try again':'在线回复不完整，请重试';
    else if(code==='provider_request_invalid')message=en?'Model service rejected the request':'模型服务拒绝了本次请求';
    else if(code==='provider_unavailable')message=en?'Model service is unavailable · try again':'模型服务暂不可用，请重试';
    else message=en?'Connection to the online assistant failed · try again':'连接在线助手失败，请重试';
    return /^[a-f0-9]{8}$/.test(error.traceId||'')?message+' · '+error.traceId:message;
  }
  function queueActivity(){
    clearTimeout(activityTimer);
    if(!pendingActivity||activityController||busy||document.hidden||!activityEnabled()||document.body.dataset.partnerFocus==='on')return;
    const en=lang==='en',status=$('coach-activity-status');
    if(coachRetryTime()){
      status.textContent=coachFailureText({code:'quota_exceeded'});
      pendingActivity=null;
      return;
    }
    if($('coach-drawer').open){
      status.textContent=en?'Online follow-up resumes after you close the assistant.':'关闭助手后，继续在线跟进。';
      return;
    }
    status.textContent=en?'Waiting for AI follow-up…':'等待 AI 跟进…';
    const item=pendingActivity;
    activityTimer=setTimeout(()=>sendActivity(item),Math.max(900,11000-(Date.now()-lastCoachRequest)));
  }
  async function sendActivity(item){
    if(pendingActivity!==item||busy||document.hidden||!activityEnabled()||document.body.dataset.partnerFocus==='on')return;
    if($('coach-drawer').open||coachRetryTime()){queueActivity();return;}
    pendingActivity=null;
    const {event,revision,epoch,phase}=item;
    const current=()=>revision===activityRevision&&epoch===campaignEpoch&&state.phase===phase&&state.day===event.day&&activityEnabled()&&document.body.dataset.partnerFocus!=='on';
    if(!current())return;
    const en=lang==='en',status=$('coach-activity-status');
    if(!takeActivitySlot()){
      status.textContent=en?'Automatic follow-ups reached today’s limit. Chat is still available.':'今天的自动跟进次数已用完，仍可打开助手提问。';
      return;
    }
    const pending=new AbortController(),timeout=setTimeout(()=>pending.abort(),25000);
    activityController=pending;
    lastCoachRequest=Date.now();
    status.textContent=en?'AI is following up…':'AI 正在跟进…';
    const question=en?'Give a short teaching follow-up on my latest action.':'根据我刚才的操作，给我一条简短的学习反馈。';
    try{
      const answer=await requestCoach(coachPayload(question,{thinking:false,proactive:true,runId:'activity:'+epoch+':'+revision}),pending.signal,()=>{});
      if(current()&&!pending.signal.aborted){
        if(answer?.mode==='live'&&answer.activityContext===true&&typeof answer.summary==='string'&&answer.summary.trim())activityCard(answer.summary,'live');
        else status.textContent=en?'Online follow-up was unavailable.':'在线跟进暂不可用。';
      }
    }catch(error){
      if(current()){
        rememberCoachQuota(error);
        status.textContent=coachFailureText(error,pending.signal.aborted);
      }
    }finally{
      clearTimeout(timeout);
      if(activityController===pending){activityController=null;queueActivity();}
    }
  }
  function recordActivity(kind,materialId){
    if(!activityEnabled()||document.body.dataset.partnerFocus==='on')return;
    const event={kind,day:state.day,round:state.round};
    if(typeof materialId==='string'&&materialId.length<=160)event.materialId=materialId;
    if(kind==='draft')event.weights=[...draft];
    if(kind==='citation')event.cited=evidenceRefs.includes(materialId);
    if(kind==='judgment')event.judgment=cycleJudgment;
    if(kind==='backtest')event.factorWeights=[...researchProgress.resultPreferences];
    if(JSON.stringify(activities.at(-1))===JSON.stringify(event))return;
    activities=[...activities,event].slice(-8);
    const revision=++activityRevision;
    const followUp=profileId&&['evidence','citation','draft','backtest','settlement'].includes(kind);
    pendingActivity=followUp?{event,revision,epoch:campaignEpoch,phase:state.phase}:null;
    activityCard(activityHint(event),'rule',followUp?(lang==='en'?'Waiting for AI follow-up…':'等待 AI 跟进…'):'');
    queueActivity();
  }
  function resetRequest(){
    feedback('coach','cancel',{id:requestId});requestId++;controller?.abort();controller=null;busy=false;coachStage='';coachIssue='';
    messages=messages.filter(m=>!m.pending);
  }
  function interruptCoachTurn(){
    if(!busy)return false;
    resetRequest();
    coachIssue=lang==='en'?'Reply interrupted · retry your question':'上次回复已中断，可重试';
    const turn=messages.at(-1);
    if(turn?.role==='user')turn.replyIssue=coachIssue;
    save();
    return true;
  }
  async function ask(question){
    question=question.trim();
    if(busy||!question)return;
    if(window.FactorLabGuidance?.isNextStepQuestion(question)){
      const task=window.FactorLabGuidance.getState()?.task;
      if(task){
        const answerLang=/[\u3400-\u9fff]/.test(question)?'zh-CN':'en';
        messages.push({role:'user',summary:question,day:state.day,lang});
        messages.push({role:'assistant',summary:answerLang==='en'?task.en:task.zh,mode:'guide',day:state.day,lang});
        messages=messages.slice(-40);save();renderMessages(true);return;
      }
    }
    coachIssue='';
    const atDay=state.day,atLang=lang,field=$('question');
    const replyLang=/[\u3400-\u9fff]/.test(question)?'zh-CN':/[a-z]/i.test(question)?'en':atLang;
    const replayReply=window.FactorLabAssistant?.replayReply?.(question,replyLang);
    const guideReply=!replayReply&&!chatAttachments.length&&window.FactorLabAssistant?.payrollImpactReply?.(question,replyLang);
    if(!replayReply&&!guideReply&&coachRetryTime()){
      replayChat=null;
      save();renderMessages(true);
      return;
    }
    if(field.value.trim()===question){field.value='';chatInput='';}
    const previous=messages.at(-1);
    const sameTurn=!replayReply&&previous?.role==='user'&&previous.lang===atLang&&previous.summary===question?previous:null;
    const userTurn=sameTurn||{role:'user',summary:question,day:atDay,lang:atLang};
    delete userTurn.replyIssue;
    if(replayReply){
      const context=window.FactorLabReplayUI?.getContext?.();
      const key=context?.active?context.releaseId+':'+context.revealed:'outside';
      replayChat={key,messages:[userTurn,{...replayReply,role:'assistant',day:atDay,lang:atLang}]};
      save();renderMessages(true);
      return;
    }
    replayChat=null;
    if(guideReply){
      if(!sameTurn)messages.push(userTurn);
      messages.push({...guideReply,role:'assistant',day:atDay,lang:atLang});
      messages=messages.slice(-40);
      save();renderMessages(true);
      return;
    }
    cancelActivityRequest();
    const id=++requestId;
    stop();busy=true;feedback('coach','start',{id});
    const history=messages.filter(m=>m!==sameTurn&&m.lang===atLang&&!m.replyIssue&&(m.role==='user'||['live','guide'].includes(m.mode))).slice(-12).map(m=>({role:m.role,content:[m.summary,m.detail].filter(Boolean).join('\n')}));
    if(!sameTurn)messages.push(userTurn);
    renderMessages(true);renderAllocation();save();
    const payload=coachPayload(question,{history,lang:replyLang,runId:profileId+':'+campaignEpoch+':'+id});
    const activeController=new AbortController();
    controller=activeController;
    const signal=activeController.signal,timeout=setTimeout(()=>activeController.abort(),48000);
    let answer,partial=null,scheduled=false;
    const onEvent=(type,data)=>{
      if(id!==requestId||signal.aborted)return;
      if(type==='cooldown'||type==='retry'||type==='meta'){
        if(type==='retry')lastCoachRequest=Date.now();
        coachStage=type==='cooldown'?'cooldown':type==='meta'&&data.thinking?'thinking':'';
        renderMessages();
      }
      if(type==='delta'){
        if(!partial){partial={role:'assistant',mode:'live',summary:'',day:atDay,lang:atLang,pending:true};messages.push(partial);}
        partial.summary+=data.text||'';
        if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(id===requestId&&busy)renderMessages();});}
      }
      if(type==='result')answer=data;
    };
    try{
      lastCoachRequest=Date.now();
      answer=await requestCoach(payload,signal,onEvent);
      if(!answer||typeof answer.summary!=='string'||cloudMode&&profileId&&answer.mode!=='live')throw Error('schema');
    }catch(error){
      if(id!==requestId)return;
      if(cloudMode&&profileId){
        rememberCoachQuota(error);
        if(!coachRetryTime())coachIssue=coachFailureText(error,signal.aborted);
        userTurn.replyIssue=coachFailureText(error,signal.aborted,replyLang);
        answer=null;
      }else{
        const allocationIntent=/配置|持仓|费用|现金|调整|等额|等权|比较|对比|allocation|portfolio|holding|fees?|cash|equal|compare/i.test(question);
        try{answer=allocationIntent?window.FactorLabResearchTools?.demo?.(payload):window.FactorLabAssistant?.offlineReply?.(state,question,replyLang,history);}catch{}
        if(!answer)answer=FactorLabAssistant.offlineReply(state,question,replyLang,history);
        answer={...answer,mode:'example',reason:error.code||error.message};
      }
    }finally{clearTimeout(timeout);}
    if(id!==requestId)return;
    busy=false;controller=null;coachStage='';
    if(partial)messages=messages.filter(m=>m!==partial);
    if(answer){
      answer=window.FactorLabResearchTools?.compactResult?.(answer)||answer;
      messages.push({...answer,role:'assistant',day:atDay,lang:atLang});
    }
    messages=messages.slice(-40);
    save();renderMessages();renderAllocation();
    feedback('coach',answer?.mode==='live'?'success':'fallback',{id});
    queueActivity();
  }
  function applyAllocationDraft(proposal){
    const weights=proposal?.weights;if(!validDraft(weights)||state.phase!=='decision'||busy)return false;
    const ledger=E.publicView(state).ledger;if(!ledger||proposal.snapshotId!==ledger.snapshotId||proposal.revision!==ledger.revision)return false;
    allocationUndo=[...draft];draft=[...weights];renderAllocation();save();document.dispatchEvent(new Event('factorlab:draft'));decisionFeedback('draft');return true;
  }
  document.querySelectorAll('[data-allocation-help]').forEach(button=>button.addEventListener('click',()=>{
    if(busy)return;
    const prompts={explain:['帮我看懂正在编辑的配置：主要投向哪里、保留多少现金、确认后费用是多少？','Explain my draft allocation: where is it invested, how much cash remains, and what are the fees?'],compare:['比较当前持仓和我正在编辑的配置，告诉我行业比例、现金和费用怎么变。','Compare my current holdings with the draft allocation: sector weights, cash and fees.'],draft:['给我一个五行业等额、保留20%现金的入门示例草稿，说明费用，先不要成交。','Prepare an illustrative draft with equal weights in five sectors and 20% cash. Explain the fees without executing a trade.']};
    const question=prompts[button.dataset.allocationHelp]?.[lang==='en'?1:0];if(!question)return;window.FactorLabStudio.openChat();$('question').value=question;ask(question);
  }));
  $('stop-coach').onclick=()=>{if(interruptCoachTurn()){renderMessages();renderAllocation();queueActivity();}};
  $('coach-drawer').addEventListener('close',()=>{
    if($('coach-drawer').open)return;
    $('coach-help').open=false;
    if(interruptCoachTurn()){renderMessages();renderAllocation();}
    queueActivity();
  });
  $('retry-coach').onclick=()=>{
    const typed=$('question').value.trim();
    if(typed)return ask(typed);
    const turn=messages.filter(m=>m.role==='user'&&m.lang===lang).at(-1);
    if(turn)ask(turn.summary);
  };
  document.addEventListener('visibilitychange',queueActivity);
  $('coach-help').addEventListener('keydown',event=>{
    if(event.key==='Escape'&&$('coach-help').open){
      event.preventDefault();
      event.stopPropagation();
      $('coach-help').open=false;
      $('coach-help').querySelector('summary').focus();
    }
  });
  $('question').addEventListener('focus',()=>{$('coach-help').open=false;});
  $('question').addEventListener('input',()=>{chatInput=$('question').value;save();});
  $('question').addEventListener('keydown',event=>{
    if(event.key!=='Enter'||event.shiftKey||event.altKey||event.ctrlKey||event.metaKey||event.isComposing||event.keyCode===229)return;
    event.preventDefault();
    ask($('question').value);
  });
  $('open-coach').addEventListener('click',renderMessages);
  $('coach-activity-toggle').addEventListener('click',()=>{
    try{localStorage.setItem('factorlab-activity:'+(profileId||'guest'),activityEnabled()?'off':'on');}catch{}
    resetActivity();
  });
  document.addEventListener('factorlab:material-open',event=>recordActivity('evidence',event.detail.id));
  document.addEventListener('factorlab:feedback',event=>{
    if(event.detail.kind==='backtest'&&event.detail.stage==='success')recordActivity('backtest');
  });
  document.addEventListener('factorlab:macro-reveal',()=>{
    replayChat=null;
    const explanation=window.FactorLabAssistant?.replayReply?.('',lang);
    if(explanation&&activityEnabled())activityCard(explanation.summary);
    renderMessages();
  });
  document.addEventListener('factorlab:view',()=>{if($('coach-drawer').open)renderMessages();});
  for(const event of ['factorlab:restore','factorlab:profile'])document.addEventListener(event,resetActivity);
  const pauseForDialog=()=>{stop();updateDraftSummary();};
  document.addEventListener('factorlab:pause',pauseForDialog);
  $('settings').addEventListener('click',()=>{pauseForDialog();$('settings-dialog').showModal();});$('close-settings').addEventListener('click',()=>$('settings-dialog').close());
  $('language').addEventListener('change',async()=>{const next=$('language').value;if(!['zh-CN','en'].includes(next))return;resetRequest();lang=next;resetActivity();await i18next.changeLanguage(lang);try{localStorage.setItem(LANG_KEY,lang);}catch{}render();});
  $('speed').addEventListener('change',()=>{speed=Number($('speed').value);});
  $('reason').addEventListener('change',()=>{reason=$('reason').value;updateDraftSummary();save();});$('note').addEventListener('input',()=>{note=$('note').value;updateDraftSummary();save();});$('forecast').addEventListener('change',()=>{forecast=$('forecast').value;updateDraftSummary();save();});$('cycle-judgment').addEventListener('change',()=>{cycleJudgment=$('cycle-judgment').value;updateDraftSummary();save();recordActivity('judgment');});$('counter-evidence').addEventListener('input',()=>{counterEvidence=$('counter-evidence').value;updateDraftSummary();save();});$('reflection').addEventListener('input',()=>{reflection=$('reflection').value;$('memo-count').textContent=reflection.length+' / 600';save();renderCourseChecklist();});
  $('write-memo').addEventListener('click',()=>{$('reflection').focus();$('reflection').scrollIntoView({block:'center'});});
  $('final-report').addEventListener('click',()=>$('preview-report')?.click());
  document.querySelectorAll('[data-memo-template]').forEach(button=>button.addEventListener('click',()=>{
    memoTemplate=button.dataset.memoTemplate;
    renderMemoTemplate();$('reflection').focus({preventScroll:true});
  }));
  $('falsifier-if').addEventListener('input',()=>{falsifierIf=$('falsifier-if').value;updateDraftSummary();save();});
  $('cite-evidence').addEventListener('click',()=>toggleCitation(evidenceOpen));
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
    if(state.phase!=='decision'||busy)return;
    allocationUndo=[...draft];draft=[...allocationPresets[button.dataset.preset]];
    renderAllocation();save();decisionFeedback('draft');
  }));
  $('apply-factors').addEventListener('click',()=>{if(!factorPrefs.some(v=>v>0)){showNotice('invalidFactors');return;}try{allocationUndo=[...draft];draft=E.recommend(state,normalizedFactors(),draft[5]);renderAllocation();save();decisionFeedback('draft');}catch{showNotice('invalidFactors');}});
  $('confirm').addEventListener('click',()=>{
    if(busy||state.phase!=='decision'||!E.evaluateDecisionGate(state,decisionDraft()).canConfirm){updateDraftSummary();return;}
    const preview=E.preview(state,draft);if(!preview.ok)return;
    $('trade-preview').innerHTML=`<div class="trade-weights">${draft.map((v,i)=>`<span>${esc(t('sector'+i))}</span><strong>${percent(v,1)}</strong>`).join('')}</div><div class="review-stat"><span>${esc(t('estimatedCost'))}</span><strong>${money(preview.fee)}</strong></div>${reason||note?`<p>${esc(reasonText(reason))}${note?' · '+esc(note):''}</p>`:''}${evidenceRefs.length?`<p>${esc(st('chooseEvidence'))} · ${esc(evidenceSelections.map(referenceLabel).join(' · '))}</p>`:''}${falsifierIf?`<p>${esc(st('reviewFalsifier'))} · ${esc(falsifierIf)}</p>`:''}`;
    $('trade-confirm').showModal();
  });
  $('cancel-trade').addEventListener('click',()=>$('trade-confirm').close());
  $('execute-trade').addEventListener('click',()=>{
    if(busy||state.phase!=='decision')return;
    $('trade-confirm').close();allocationUndo=null;
    if(act({type:'lock',...decisionDraft()})){
      feedback('allocation','success',{id:campaignEpoch+':'+state.round});
      recordActivity('confirmed');startPlayback();
    }
  });
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
  $('start-new').addEventListener('click',()=>{let next;try{next=E.initial(newGameOptions());}catch{showNotice('actionError');return;}stop();resetRequest();campaignEpoch++;allocationUndo=null;state=next;draft=[...state.weights];factorPrefs=[25,25,25,25];reason='';note='';forecast='flat';cycleJudgment='insufficient';counterEvidence='';reflection='';evidenceRefs=[];evidenceSelections=[];falsifierIf='';researchProgress=emptyResearchProgress();lastGateKey='';messages=[];chatAttachments=[];chatInput='';$('question').value='';brokenRaw=null;writable=true;noticeKey='';$('new-dialog').close();save();render();document.dispatchEvent(new Event('factorlab:restore'));window.scrollTo({top:0});});
  $('save-now').addEventListener('click',()=>{save();feedback('save',writable?'success':'failure');});$('export-save').addEventListener('click',()=>download(brokenRaw||JSON.stringify(exportEnvelope(),null,2),'FactorLab-save-day-'+state.day+'.json'));
  $('import-save').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>500000)throw Error('large');const raw=await file.text();const verified=unpack(raw);campaignEpoch++;allocationUndo=null;stop();resetRequest();installSave(raw);brokenRaw=null;writable=true;noticeKey='imported';save();render();document.dispatchEvent(new Event('factorlab:restore'));$('settings-dialog').close();}catch{showNotice('invalidSave');}event.target.value='';});
  $('coach-form').addEventListener('submit',event=>{event.preventDefault();ask($('question').value.trim());});document.querySelectorAll('[data-question]').forEach(el=>el.addEventListener('click',()=>ask(t('question'+el.dataset.question.charAt(0).toUpperCase()+el.dataset.question.slice(1)))));
  window.addEventListener('pagehide',()=>{stop();cancelActivityRequest();interruptCoachTurn();});
  window.addEventListener('pageshow',event=>{if(event.persisted){renderMessages();renderAllocation();}});
  function loadEnvelope(value){unpack(value);campaignEpoch++;allocationUndo=null;stop();resetRequest();installSave(value);brokenRaw=null;writable=true;noticeKey='';save();render();document.dispatchEvent(new Event('factorlab:restore'));}
  function setProfile(id){
    if(id!==null&&(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(id)))throw Error('invalidProfile');
    if(id===profileId)return;campaignEpoch++;allocationUndo=null;
    stop();resetRequest();save();
    if(!writable)memoryProfiles.set(SAVE_KEY,{envelope:envelope(),brokenRaw,writable,noticeKey});else memoryProfiles.delete(SAVE_KEY);
    profileId=id;coachRetryAt=0;SAVE_KEY=id===null?GUEST_SAVE_KEY:GUEST_SAVE_KEY+'-account-'+id;
    state=E.initial(rawGet(SAVE_KEY)||memoryProfiles.has(SAVE_KEY)?{seed:20261013}:newGameOptions());draft=[...state.weights];factorPrefs=[25,25,25,25];reason='';note='';forecast='flat';cycleJudgment='insufficient';counterEvidence='';reflection='';evidenceRefs=[];evidenceSelections=[];falsifierIf='';researchProgress=emptyResearchProgress();lastGateKey='';messages=[];chatAttachments=[];chatInput='';$('question').value='';brokenRaw=null;writable=true;noticeKey='';
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
  window.FactorLabApp={openEvidence,preview:()=>clone(draftPreview()),ask,applyAllocationDraft,attachEvidence:ref=>{if(chatAttachments.length<8&&!chatAttachments.some(r=>r.id===ref.id&&JSON.stringify(r.selection)===JSON.stringify(ref.selection)))chatAttachments.push(clone(ref));save();renderMessages();},citeEvidence:ref=>{if(state.phase!=='decision'||busy||!evidenceRefs.includes(ref.id)&&evidenceRefs.length>=24)return false;try{ref=FactorLabEvidence.resolveReference(E.publicView(state),ref);}catch{return false;}if(!evidenceRefs.includes(ref.id))toggleCitation(ref.id);if(!evidenceRefs.includes(ref.id))return false;const key=JSON.stringify(ref.selection||{});if(!evidenceSelections.some(r=>r.id===ref.id&&r.snapshotId===ref.snapshotId&&JSON.stringify(r.selection||{})===key)){if(evidenceSelections.length>=24)return false;evidenceSelections.push(clone(ref));}save();renderCitations();updateDraftSummary();return true;},getSave:()=>E.serialize(state),getState:()=>E.publicView(state),getEnvelope:envelope,exportEnvelope,loadEnvelope,setProfile,applyResearchDraft,setResearchProgress,getUI:()=>({lang,busy,writable,playing,profileId,campaignEpoch,factorPrefs:[...factorPrefs],gate:E.evaluateDecisionGate(state,decisionDraft()),decisionDraft:decisionDraft(),cycleJudgment,counterEvidence,researchProgress:clone(researchProgress),evidenceSelections:clone(evidenceSelections),chatAttachments:clone(chatAttachments)})};
  resetActivity();render();if(!brokenRaw)save();
})();
