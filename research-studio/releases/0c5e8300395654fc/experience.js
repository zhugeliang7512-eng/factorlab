(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:767px)');
  const animations = new Map(), requests = new Map();
  let workspace, coach, dock, dockDrag, initialized = false, feedbackTimer, serial = 0, badge, badgeEpoch = 0;
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
  function bindDock(button, pet) {
    const viewport=window.visualViewport;
    const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    let position, drag, suppressClick=false;
    const move=(x,y)=>{
      const {width,height}=button.getBoundingClientRect(), margin=8;
      const left=(viewport?.offsetLeft??0)+margin, top=(viewport?.offsetTop??0)+margin;
      const right=(viewport?.width??window.innerWidth)+left-width-2*margin;
      const viewportBottom=(viewport?.height??window.innerHeight)+top-2*margin;
      const railTop=mobile.matches?document.querySelector('.sidebar').getBoundingClientRect().top:Infinity;
      const bottom=Math.min(viewportBottom,railTop-margin)-height;
      position={x:Math.max(left,Math.min(x,right)),y:Math.max(top,Math.min(y,bottom))};
      button.style.left=position.x+'px';
      button.style.top=position.y+'px';
      button.style.right=button.style.bottom='auto';
    };
    const clamp=()=>{if(position&&!button.hidden)move(position.x,position.y);};
    button.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0)return;
      const {left,top}=button.getBoundingClientRect();
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left,top,moved:false};
      suppressClick=false;
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointermove',event=>{
      if(drag?.id!==event.pointerId||button.hidden)return;
      const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)<6)return;
      drag.moved=true;
      button.dataset.dragging='';
      move(drag.left+dx,drag.top+dy);
    });
    const endDrag=event=>{
      if(drag?.id!==event.pointerId)return;
      suppressClick=drag.moved;
      drag=null;
      delete button.dataset.dragging;
    };
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,endDrag);
    button.addEventListener('click',event=>{
      if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();return;}
      pet.emit('welcome');
    });
    button.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||(!Object.hasOwn(offsets,event.key)&&event.key!=='Home'))return;
      event.preventDefault();
      if(event.key==='Home'){
        position=null;
        for(const edge of ['left','right','top','bottom'])button.style.removeProperty(edge);
      }else{
        const {left,top}=button.getBoundingClientRect();
        const offset=offsets[event.key];
        move(left+offset[0]*24,top+offset[1]*24);
      }
    });
    window.addEventListener('resize',clamp);
    viewport?.addEventListener('resize',clamp);
    viewport?.addEventListener('scroll',clamp);
    return {clamp,destroy(){
      window.removeEventListener('resize',clamp);
      viewport?.removeEventListener('resize',clamp);
      viewport?.removeEventListener('scroll',clamp);
    }};
  }
  function visible() {
    if (!initialized) return;
    const drawer=$('coach-drawer'), coachOpen=drawer.open;
    const modal=document.querySelector('dialog[open]');
    workspace.setVisible(!modal && $('mobile-coach').getClientRects().length>0);
    coach.setVisible(coachOpen&&$('coach-mascot').getClientRects().length>0);
    const coachModal=coachOpen&&(mobile.matches||drawer.hasAttribute('data-modal')||
      (window.CSS?.supports?.('selector(:modal)')&&drawer.matches(':modal')));
    const otherDialog=document.querySelector('dialog[open]:not(#coach-drawer)');
    const button=$('pet-dock'), hideDock=!!(focus||otherDialog||coachModal);
    if(button.hidden!==hideDock){
      button.hidden=hideDock;
      if(!hideDock)dockDrag.clamp();
    }
    dock.setVisible(!hideDock);
  }
  function react(state,id,includeDock=true) {
    visible();
    ($('coach-drawer').open?coach:workspace).emit(state,{id});
    if(includeDock)dock.emit(state==='growth'||state==='milestone'?'success':state,{id});
  }
  function labelDock() {
    const button=$('pet-dock'), en=language()==='en';
    button.setAttribute('aria-label',en?'Greet your companion':'问候桌宠');
    button.setAttribute('aria-description',en?'Use the arrow keys to move. Press Home to reset its position.':'方向键移动，Home 恢复位置。');
    dock.setLanguage(language());
  }
  function initialize() {
    if(initialized || !window.FactorLabApp || !window.FactorMascot) return;
    initialized=true;FactorMascot.setEnabled(enabled);
    const choice=$('research-pet');
    const petKey='factorlab-research-pet';
    try{if(localStorage.getItem(petKey)==='kurumi')choice.value='kurumi';}catch{}
    document.documentElement.dataset.researchPet=choice.value;
    $('pet-preview').append(FactorMascot.petPicture(document));
    choice.addEventListener('change',()=>{
      document.documentElement.dataset.researchPet=choice.value;
      try{localStorage.setItem(petKey,choice.value);}catch{}
    });
    workspace=FactorMascot.mount($('mobile-coach'),{context:'workspace',language:language(),pet:true,launcher:true});
    coach=FactorMascot.mount($('coach-mascot'),{context:'coach',language:language(),focusRoot:$('coach-drawer'),pet:true});
    const dockButton=$('pet-dock');
    dock=FactorMascot.mount(dockButton,{context:'workspace',language:language(),pet:true,launcher:true,focusRoot:dockButton});
    dockDrag=bindDock(dockButton,dock);
    labelDock();
    $('character-motion').checked=enabled;
    $('character-motion').addEventListener('change',()=>{
      enabled=$('character-motion').checked;FactorMascot.setEnabled(enabled);workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);if(!enabled){badge?.destroy();badge=null;}
      dock.setEnabled(enabled&&!focus);
      try{localStorage.setItem('factorlab-character-motion',enabled?'on':'off');}catch{}
    });
    for(const id of ['open-coach','mobile-coach'])$(id).addEventListener('click',()=>{visible();coach.emit('welcome');});
    const observer=new MutationObserver(visible);
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    if($('coach-empty'))observer.observe($('coach-empty'),{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('resize',visible);
    window.addEventListener('pagehide',event=>{stopMotion();clearTimeout(feedbackTimer);if(event.persisted)return;observer.disconnect();workspace.destroy();coach.destroy();dock.destroy();dockDrag.destroy();window.removeEventListener('resize',visible);});
    window.addEventListener('pageshow',visible);
    visible();
  }
  document.addEventListener('factorlab:render',()=>{
    initialize();if(!initialized)return;
    workspace.setLanguage(language());coach.setLanguage(language());labelDock();
    const notice=$('companion-feedback');if(!notice.hidden && notice.dataset.message !== 'guidance')notice.textContent=words[language()][notice.dataset.message];
  });
  document.addEventListener('factorlab:feedback',event=>{
    initialize();if(!initialized)return;
    const {kind,stage,id,returnValue,benchmarkReturn}=event.detail;
    if(kind==='backtest'){
      if(!focus){
        researchBadge();
        if(stage==='success'){visible();dock.emit('success');}
      }
      return;
    }
    if(kind==='allocation'||kind==='settlement'){
      if(stage==='success'){
        const belowBenchmark=kind==='settlement'&&Number.isFinite(returnValue)&&Number.isFinite(benchmarkReturn)&&returnValue<benchmarkReturn;
        visible();
        dock.emit(belowBenchmark?'caution':'success',{id:kind+':'+id,replace:true});
      }
      return;
    }
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
    react(state,key);showFeedback(message);
  });
  document.addEventListener('factorlab:guidance',event=>{
    initialize();if(!initialized)return;
    const next=event.detail,notice=$('companion-feedback');focus=next.focus;
    workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);dock.setEnabled(enabled&&!focus);visible();
    if(focus){badge?.destroy();badge=null;}
    if(notice.dataset.message==='guidance'&&!notice.hidden){
      if(next.activeFeedback && (!focus || next.activeFeedback.necessary)) notice.textContent=next.activeFeedback.text;
      else notice.hidden=true;
    }
    const item=next.feedback;if(!item || (focus&&!item.necessary))return;
    if(item.motion)react(item.motion,item.key+':'+Date.now(),item.kind!=='completion');
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
  const motionChanged=()=>{if(reduced.matches)stopMotion();};
  if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',motionChanged);
  else reduced.addListener?.(motionChanged);
  window.FactorExperience={surface,getState:()=>({requests:[...requests.values()],enabled,workspace:workspace?.getState(),coach:coach?.getState()})};
  initialize();
})();
