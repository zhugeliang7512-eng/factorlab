(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map(), requests = new Map();
  let workspace, coach, initialized = false, feedbackTimer, serial = 0, badge, badgeEpoch = 0;
  let enabled = true, focus = false;
  try { enabled = localStorage.getItem('factorlab-character-motion') !== 'off'; } catch {}
  const language = () => window.FactorLabApp?.getUI().lang || 'zh-CN';
  const words = {
    'zh-CN': {success:'操作已完成', account:'已登录，继续研究', save:'已保存到此浏览器', caution:'请查看本次提示', fallback:'规则提示已生成'},
    en: {success:'Operation complete', account:'All set. Continue your research.', save:'Progress saved', caution:'Review the notice and check the evidence', fallback:'Reply ready. Rule fallback is in use.'}
  };
  function stopMotion() {
    badgeEpoch++;
    for (const animation of animations.values()) animation.revert?.();
    animations.clear(); badge?.destroy(); badge = null;
  }
  function surface(root) {
    stopMotion();
    if (!root || reduced.matches || document.hidden || !window.anime?.animate) return;
    const targets = [...root.querySelectorAll('.panel, .review-stat, .backtest-summary, .cycle-evidence, .cycle-inference')].filter(el => el.getClientRects().length);
    const nodes = targets.length ? targets.slice(0, 8) : [root];
    const animation = anime.animate(nodes, {opacity:[.5,1], translateY:[8,0], duration:260, delay:anime.stagger(22), ease:'outCubic', onComplete:()=>animations.delete(root)});
    animations.set(root, animation);
  }
  function select(node) {
    if (reduced.matches || document.hidden || !window.anime?.animate) return;
    animations.get(node)?.revert?.();
    animations.set(node, anime.animate(node, {scale:[.98,1], duration:180, ease:'outQuad', onComplete:()=>animations.delete(node)}));
  }
  function showFeedback(key) {
    const node = $('companion-feedback'); if (!node) return;
    clearTimeout(feedbackTimer); node.dataset.message = key;
    node.textContent = words[language()][key] || words[language()].success; node.hidden = false;
    feedbackTimer = setTimeout(() => { node.hidden = true; }, 6500);
  }
  function researchBadge() {
    const epoch=++badgeEpoch;
    badge?.destroy(); badge=null;
    const status=$('backtest-status');
    if (!status || reduced.matches || !enabled || document.hidden) return;
    if (!window.lottie) { window.FactorLabEnhancements?.loadBadge().then(loaded=>{if(loaded&&epoch===badgeEpoch&&status.isConnected&&!focus)researchBadge();});return; }
    const host=document.createElement('span');host.className='research-badge';host.setAttribute('aria-hidden','true');status.prepend(host);
    const k=value=>({a:0,k:value});
    const keyframes=[{t:0,s:[0],e:[100],i:{x:[.67],y:[1]},o:{x:[.33],y:[0]}},{t:24,s:[100]}];
    const animationData={v:'5.13.0',fr:30,ip:0,op:30,w:48,h:48,nm:'Research completed',ddd:0,assets:[],layers:[{ddd:0,ind:1,ty:4,nm:'Evidence seal',sr:1,ks:{o:k(100),r:k(0),p:k([24,24,0]),a:k([0,0,0]),s:k([100,100,100])},ao:0,ip:0,op:30,st:0,bm:0,shapes:[{ty:'gr',it:[{ty:'el',p:k([0,0]),s:k([36,36]),d:1},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(2),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(-90),o:k(100),sk:k(0),sa:k(0)}]},{ty:'gr',it:[{ty:'sh',ks:k({i:[[0,0],[0,0],[0,0]],o:[[0,0],[0,0],[0,0]],v:[[-9,0],[-2,7],[10,-7]],c:false})},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(3),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(0),o:k(100),sk:k(0),sa:k(0)}]}]}]};
    badge=lottie.loadAnimation({container:host,renderer:'svg',loop:false,autoplay:true,animationData});
  }
  function visible() {
    if (!initialized) return;
    const coachOpen=$('coach-drawer').open;
    const modal=document.querySelector('dialog[open]');
    workspace.setVisible(!modal && $('workspace-mascot').getClientRects().length>0);
    coach.setVisible(coachOpen);
  }
  function initialize() {
    if(initialized || !window.FactorLabApp || !window.FactorMascot) return;
    initialized=true;FactorMascot.setEnabled(enabled);
    workspace=FactorMascot.mount($('workspace-mascot'),{context:'workspace',language:language()});
    coach=FactorMascot.mount($('coach-mascot'),{context:'coach',language:language(),focusRoot:$('coach-drawer')});
    $('character-motion').checked=enabled;
    $('character-motion').addEventListener('change',()=>{
      enabled=$('character-motion').checked;FactorMascot.setEnabled(enabled);workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);if(!enabled){badge?.destroy();badge=null;}
      try{localStorage.setItem('factorlab-character-motion',enabled?'on':'off');}catch{}
    });
    $('open-coach').addEventListener('click',()=>{visible();coach.emit('welcome');});
    const observer=new MutationObserver(visible);
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    window.addEventListener('resize',visible);
    window.addEventListener('pagehide',event=>{stopMotion();clearTimeout(feedbackTimer);if(event.persisted)return;observer.disconnect();workspace.destroy();coach.destroy();window.removeEventListener('resize',visible);});
    window.addEventListener('pageshow',visible);
    visible();
  }
  document.addEventListener('factorlab:render',()=>{
    initialize();if(!initialized)return;
    workspace.setLanguage(language());coach.setLanguage(language());
    const notice=$('companion-feedback');if(!notice.hidden && notice.dataset.message !== 'guidance')notice.textContent=words[language()][notice.dataset.message];
  });
  document.addEventListener('factorlab:feedback',event=>{
    initialize();if(!initialized)return;
    const {kind,stage,id}=event.detail;
    if(kind==='backtest'){if(!focus)researchBadge();return;}
    if(kind==='settlement')return;
    const key=kind+':'+(id??++serial);
    if(['coach','check'].includes(kind)){
      if(stage==='start'){
        requests.set(kind,key);workspace.setBusy(key,true);if(kind==='coach')coach.setBusy(key,true);return;
      }
      if(requests.get(kind)!==key)return;
      requests.delete(kind);workspace.setBusy(key,false);if(kind==='coach')coach.setBusy(key,false);
      if(stage==='cancel')return;
    }
    let state=stage==='success'?'success':'caution',message=stage==='success'&&kind==='account'?'account':stage==='success'&&kind==='save'?'save':stage==='fallback'?'fallback':'caution';
    if(stage==='success' && !['account','save'].includes(kind))message='success';
    visible();const target=$('coach-drawer').open?coach:workspace;
    target.emit(state,{id:key});showFeedback(message);
  });
  document.addEventListener('factorlab:guidance',event=>{
    initialize();if(!initialized)return;
    const next=event.detail,notice=$('companion-feedback');focus=next.focus;
    workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);
    if(focus){badge?.destroy();badge=null;}
    if(notice.dataset.message==='guidance'&&!notice.hidden){
      if(next.activeFeedback && (!focus || next.activeFeedback.necessary)) notice.textContent=next.activeFeedback.text;
      else notice.hidden=true;
    }
    const item=next.feedback;if(!item || (focus&&!item.necessary))return;
    if(item.motion){visible();($('coach-drawer').open?coach:workspace).emit(item.motion,{id:item.key+':'+Date.now()});}
    clearTimeout(feedbackTimer);notice.dataset.message='guidance';notice.textContent=item.text;notice.hidden=false;
    feedbackTimer=setTimeout(()=>{notice.hidden=true;},6500);
  });
  function resetFeedback(){
    badgeEpoch++;
    clearTimeout(feedbackTimer);if($('companion-feedback'))$('companion-feedback').hidden=true;
    for(const key of requests.values()){workspace?.setBusy(key,false);coach?.setBusy(key,false);}requests.clear();
    badge?.destroy();badge=null;
  }
  for(const name of ['factorlab:restore','factorlab:profile','factorlab:new'])document.addEventListener(name,resetFeedback);
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-preset], .sector-card, .reason-chip, #confirm, #apply-factors');
    if(target && !target.disabled)select(target);
  });
  document.addEventListener('factorlab:view',()=>{visible();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion();});
  reduced.addEventListener('change',()=>{if(reduced.matches)stopMotion();});
  window.FactorExperience={surface,getState:()=>({requests:[...requests.values()],enabled,workspace:workspace?.getState(),coach:coach?.getState()})};
  initialize();
})();
