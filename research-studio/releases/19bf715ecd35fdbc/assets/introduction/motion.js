(() => {
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width:761px) and (min-height:690px)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,t)=>{let x=clamp((t-a)/(b-a));return x*x*x*(x*(x*6-15)+10);};
  let paused=reduced.matches,lenis=null,frame=0;
  const hero=$('.hero-story'),journey=$('.journey'),manifesto=$('.manifesto'),closing=$('.closing');
  const title=$('.word-reveal');
  // Preserve line breaks while revealing words progressively.
  title.innerHTML=title.innerHTML.split(/(<br\s*\/?>)/i).map(part=>/^<br/i.test(part)?part:part.split(/\s+/).filter(Boolean).map(word=>'<span class="word">'+word+'</span>').join(' ')).join('');
  const words=$$('.word-reveal .word');
  function setupScrolling(){
    if(lenis){lenis.destroy();lenis=null;}
    if(!paused&&fine.matches&&window.Lenis)lenis=new Lenis({autoRaf:true,lerp:.085,smoothWheel:true,syncTouch:false,anchors:false,allowNestedScroll:true});
  }
  function configure(){
    document.body.classList.toggle('has-motion',wide.matches&&!reduced.matches);
    document.body.classList.toggle('motion-enabled',!paused);
    document.body.classList.toggle('motion-paused',paused);
    if(paused)$$('.reveal').forEach(e=>e.classList.add('in-view'));
    window.FactorLabScene?.setPaused(paused);
    setupScrolling();schedule();
  }
  function progress(el){const r=el.getBoundingClientRect();return clamp(-r.top/Math.max(1,el.offsetHeight-innerHeight));}
  function update(){
    frame=0;const y=scrollY,vh=innerHeight;
    document.documentElement.style.setProperty('--page',clamp(y/(document.documentElement.scrollHeight-vh||1)).toFixed(4));
    const active=wide.matches&&!reduced.matches;
    const h=active?progress(hero):0;
    hero.style.setProperty('--hero',h.toFixed(5));
    hero.style.setProperty('--hero-fade',smooth(.04,.3,h).toFixed(5));
    hero.style.setProperty('--hero-second',smooth(.5,.78,h).toFixed(5));
    hero.style.setProperty('--hero-exit',smooth(.8,1,h).toFixed(5));
    const past=h>.31;hero.classList.toggle('scene-past',past);
    $('.hero-copy').inert=past;$('.hero-bottom').inert=past;
    window.FactorLabScene?.setProgress(h);
    const j=active?progress(journey):0;
    journey.style.setProperty('--journey',j.toFixed(5));
    journey.style.setProperty('--review',active?smooth(.65,.95,j):'1');
    $('.journey-counter').textContent=String(Math.min(3,Math.floor(j*2.99)+1)).padStart(2,'0')+' — 03';
    const rect=title.getBoundingClientRect(),fill=paused?1:clamp((vh*.88-rect.top)/(vh*.6));
    words.forEach((w,i)=>w.classList.toggle('lit',fill>(i+.2)/words.length));
    closing.style.setProperty('--close',clamp((vh-closing.getBoundingClientRect().top)/(vh+closing.offsetHeight)).toFixed(4));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  // A single anchor handler avoids native hash scrolling competing with inertia.
  document.addEventListener('pointerdown',event=>{
    if(lenis&&event.target.closest('a,button,label,input'))lenis.scrollTo(scrollY,{immediate:true});
  },{passive:true});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const target=document.getElementById(link.hash.slice(1));
    if(!target)return;
    event.preventDefault();
    const y=link.hash==='#top'?0:target.getBoundingClientRect().top+scrollY-95;

    if(lenis)lenis.scrollTo(y,{duration:1.15,lerp:0});
    else window.scrollTo({top:y,behavior:paused?'instant':'smooth'});
    if(link.classList.contains('skip-link')){target.tabIndex=-1;target.focus({preventScroll:true});}
    history.replaceState(null,'',link.hash);
  });
  for(const q of [wide,fine])q.addEventListener('change',configure);
  reduced.addEventListener('change',()=>{paused=reduced.matches;setButton();configure();});
  const toggle=$('.motion-toggle');toggle.hidden=false;
  function setButton(){toggle.setAttribute('aria-pressed',String(paused));toggle.innerHTML=paused?'<span aria-hidden="true">▶</span> Resume motion':'<span aria-hidden="true">Ⅱ</span> Pause motion';}
  toggle.addEventListener('click',()=>{paused=!paused;setButton();configure();});setButton();
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
    $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%3)*.07+'s';observer.observe(el);});
    const counters=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,n=+el.dataset.count,start=performance.now();counters.unobserve(el);const tick=now=>{const t=paused?1:clamp((now-start)/1600);el.textContent=Math.round(n*(1-Math.pow(1-t,4))).toLocaleString('en-US');if(t<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}),{threshold:.65});
    $$('[data-count]').forEach(el=>counters.observe(el));
  } else {
    $$('.reveal').forEach(el=>el.classList.add('in-view'));
  }
  const sectors=[
    ['SEMICONDUCTORS','Behind every\ndigital possibility.','Explore the tension between chip demand, production capacity and delivery constraints.'],
    ['ROBOTICS & INDUSTRIAL AUTOMATION','When intelligence\nbecomes movement.','Consider how automation demand, industrial investment and execution shape an industry view.'],
    ['ADVANCED MATERIALS','Small changes.\nNew possibilities.','Look at the materials behind new technologies, and the evidence that could change your outlook.'],
    ['CLEAN-ENERGY EQUIPMENT','The next chapter\nof energy.','Weigh equipment demand and capacity signals as you build your view of the energy transition.'],
    ['AI & DIGITAL INFRASTRUCTURE','The infrastructure\nbehind intelligence.','Explore the systems supporting digital growth, then decide how much conviction to put behind them.']
  ];
  $$('.sector-node').forEach(button=>button.addEventListener('click',()=>{
    const index=+button.dataset.sector,data=sectors[index];
    $$('.sector-node').forEach(b=>{const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
    $('#sector-number').textContent=String(index+1).padStart(2,'0')+' / '+data[0];
    $('#sector-heading').replaceChildren(...data[1].split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
    $('#sector-description').textContent=data[2];
    const detail=$('.sector-detail');detail.classList.remove('changing');void detail.offsetWidth;detail.classList.add('changing');
  }));
  // Keyboard movement across the two product-view radios stays native.
  $$('.view-options input').forEach(radio=>radio.addEventListener('change',()=>{schedule();lenis?.resize();}));
  configure();
})();


