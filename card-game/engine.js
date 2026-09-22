(function(root) {
  'use strict';
  const VERSION = 'card-loop-v2';
  const ACCEPTED_VERSIONS = ['card-loop-v1', 'card-loop-v2'];
  const SECTOR_CAP = 0.40;
  const COST_RATES = {commission:.0003, slippage:.001, stamp:.0005};
  const costRate = side => COST_RATES.commission + COST_RATES.slippage + (side==='sell' ? COST_RATES.stamp : 0);
  const cards = {
    buy: {name:'试探建仓', cost:1, amount:.03, mode:'buy', hint:'Cash → 所选板块'},
    sell: {name:'留出缓冲', cost:1, amount:.04, mode:'sell', hint:'所选板块 → Cash'},
    rotate: {name:'板块轮动', cost:2, amount:.04, mode:'rotate', hint:'选择转出，再选择转入'},
    scout: {name:'深入研究', cost:1, mode:'scout', hint:'展开 AI 历史 · 消耗 1 研究点'},
    focus: {name:'集中布局', cost:2, amount:.06, mode:'buy', hint:'Cash → 所选板块'},
    spread: {name:'分散布局', cost:2, amount:.01, mode:'spread', hint:'Cash → 五个板块各 1pp'},
    reserve: {name:'收回筹码', cost:1, amount:.03, mode:'reserve', hint:'最大持仓板块 → Cash'}
  };
  const upgrades = {
    energy: {name:'行动余量', text:'以后每轮 4 点行动力', symbol:'bolt'},
    lens: {name:'研究效率', text:'研究卡不再消耗行动力，仍消耗研究点', symbol:'scan'},
    precision: {name:'调仓强化', text:'试探建仓与留出缓冲的额度各 +1pp', symbol:'sliders'}
  };
  const reasons = {trend:'走势',buffer:'缓冲',uncertain:'不确定性',maintain:'原有计划'};
  const comboNames = {informed:'研究 + 布局',rotation:'轮动 + 缓冲',diverse:'多点布局'};
  const sum = a => a.reduce((n,v)=>n+v,0);
  const validWeights = w => Array.isArray(w)&&w.length===6&&w.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&Math.abs(sum(w)-1)<1e-10;
  function settle(weights, nav, ledger, r) {
    if(!validWeights(weights)||!Number.isFinite(nav)||nav<=0||!Array.isArray(ledger))throw Error('Invalid portfolio');
    if(!r||r.sector_returns?.length!==6||r.sector_returns.some(v=>!Number.isFinite(v)||v<=-1))throw Error('Invalid market');
    const ret=sum(weights.map((w,i)=>w*r.sector_returns[i]));
    const after=nav*(1+ret), drift=weights.map((w,i)=>w*(1+r.sector_returns[i])/(1+ret));
    const contributions=[0,1,2,3].map(k=>sum(weights.slice(0,5).map((w,j)=>w*r.exposures[j][k]*r.factor_returns[k])));
    contributions.push(sum(weights.slice(0,5))*r.market_return,sum(weights.slice(0,5).map((w,j)=>w*r.event_returns[j])),sum(weights.slice(0,5).map((w,j)=>w*r.residual_returns[j])),weights[5]*r.sector_returns[5]);
    if(contributions.some(v=>!Number.isFinite(v))||Math.abs(sum(contributions)-ret)>1e-10)throw Error('Attribution mismatch');
    const cumulative=contributions.map((v,i)=>(ledger.at(-1)?.cumulative_contributions[i]||0)+nav/100000*v);
    const returns=[...ledger.map(x=>x.return_value),ret], mean=sum(returns)/returns.length;
    const vol=returns.length>1?Math.sqrt(sum(returns.map(v=>(v-mean)**2))/(returns.length-1)):null;
    let peak=100000, dd=0;
    for(const v of [100000,...ledger.map(x=>x.after),after]){peak=Math.max(peak,v);dd=Math.max(dd,1-v/peak);}
    return {round:ledger.length+1,weights:[...weights],before:nav,after,return_value:ret,drift,
      benchmark_nav:(ledger.at(-1)?.benchmark_nav||100000)*(1+r.benchmark_return),
      contributions,cumulative_contributions:cumulative,maximum_drawdown:dd,volatility:vol,
      sharpe:vol!==null&&vol>1e-12?(mean-.001)/vol:null,event:r.event,
      sector_contributions:weights.map((w,i)=>w*r.sector_returns[i])};
  }
  function initial(seed=1) {
    return {seed:Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff?seed:1,phase:'choose',round:1,strategy:null,
      mode:'teaching',weights:[],draft:[],nav:100000,ledger:[],played:[],energy:3,researchLeft:3,upgrades:[],reason:null,
      anchorWeights:null,anchorNav:100000,commands:[]};
  }
  const maxEnergy = s => s.upgrades.includes('energy')?4:3;
  const hand = s => ['buy','sell','rotate','scout',['focus','spread','reserve'][(s.seed+s.round-1)%3]];
  const cost = (s,id) => id==='scout'&&s.upgrades.includes('lens')?0:cards[id]?.cost;
  const amount = (s,id) => (cards[id]?.amount||0)+((id==='buy'||id==='sell')&&s.upgrades.includes('precision')?.01:0);
  function combos(s) {
    const ids=s.played.map(x=>x.card), list=[];
    if(ids.includes('scout')&&ids.some(id=>['buy','focus','spread'].includes(id)))list.push('informed');
    if(ids.includes('rotate')&&ids.some(id=>['sell','reserve'].includes(id)))list.push('rotation');
    if(ids.includes('spread')||new Set(s.played.filter(p=>['buy','focus','rotate'].includes(p.card)).map(p=>p.target)).size>1)list.push('diverse');
    return list;
  }
  function projectDraft(s,a) {
    const id=a.card;
    if(!hand(s).includes(id)||s.played.some(p=>p.card===id)||s.energy<cost(s,id))return null;
    const w=[...s.draft], card=cards[id], moved=[];
    const sector = v => Number.isInteger(v)&&v>=0&&v<5;
    const transfer=(from,to,value)=>{const n=Math.min(value,w[from]);if(n>1e-12){w[from]-=n;w[to]+=n;moved.push({from,to,amount:n});}};
    if(card.mode==='scout'){
      if(s.researchLeft<=0)return null;
      return {scoutOnly:true, moved:[]};
    }
    if(card.mode==='buy'||card.mode==='sell'){
      if(!sector(a.target))return null;
      transfer(card.mode==='buy'?5:a.target,card.mode==='buy'?a.target:5,amount(s,id));
    }else if(card.mode==='rotate'){
      if(!sector(a.from)||!sector(a.target)||a.from===a.target)return null;
      transfer(a.from,a.target,amount(s,id));
    }else if(card.mode==='spread'){
      const each=Math.min(card.amount,w[5]/5);
      for(let j=0;j<5;j++)transfer(5,j,each);
    }else if(card.mode==='reserve'){
      const largest=w.slice(0,5).indexOf(Math.max(...w.slice(0,5)));
      transfer(largest,5,card.amount);
    }
    if(moved.length===0||!validWeights(w))return null;
    return {draft:w,moved};
  }
  const capBlocked = (s,a) => {
    if(s.mode!=='realistic')return false;
    const p=projectDraft(s,a);
    return !!p&&!p.scoutOnly&&Math.max(...p.draft.slice(0,5))>SECTOR_CAP+1e-9;
  };
  function applyCard(s,a) {
    const p=projectDraft(s,a);
    if(!p)return null;
    const c=cost(s,a.card);
    if(p.scoutOnly){
      return {...s,energy:s.energy-c,researchLeft:s.researchLeft-1,played:[...s.played,{card:a.card,cost:c,moved:[]}]};
    }
    if(s.mode==='realistic'&&Math.max(...p.draft.slice(0,5))>SECTOR_CAP+1e-9)return null;
    return {...s,draft:p.draft,energy:s.energy-c,played:[...s.played,{card:a.card,cost:c,target:a.target??null,from:a.from??null,moved:p.moved}]};
  }
  function roundCosts(s) {
    if(s.mode!=='realistic')return 0;
    let total=0;
    for(const p of s.played)for(const m of p.moved||[]){
      const buy=m.from===5, sell=m.to===5;
      let rate=0;
      if(buy||!sell)rate+=costRate('buy');
      if(sell||!buy)rate+=costRate('sell');
      total+=m.amount*s.nav*rate;
    }
    return total;
  }
  function cycleSeries(s,i,D) {
    const pre=i===4?D.pregame.slice(1).map((v,k)=>v/D.pregame[k]-1):[];
    return pre.concat(s.ledger.map(r=>r.sector_returns_snapshot[i]));
  }
  function cyclesOf(s,D) {
    const label=c=>c>0.06?['扩张','boom']:c>0?['复苏','recover']:c>=-0.06?['放缓','slow']:['收缩','contract'];
    return [0,1,2,3,4].map(i=>{
      const series=cycleSeries(s,i,D), tail=series.slice(-3);
      if(tail.length<3)return {sector:i,cum3:null,phase:null,phaseKey:null,observations:series.length};
      const cum3=tail.reduce((n,v)=>n*(1+v),1)-1;
      const [phase,phaseKey]=label(cum3);
      return {sector:i,cum3,phase,phaseKey,observations:series.length};
    });
  }
  function reduce(s,a,D) {
    if(!a||typeof a!=='object')return s;
    let n=null, command=null;
    if(a.type==='start'&&s.phase==='choose'&&Object.hasOwn(D.strategies,a.key)){
      const w=D.strategies[a.key].weights;
      const mode=a.mode==='realistic'?'realistic':'teaching';
      n={...s,phase:'plan',strategy:a.key,mode,weights:[...w],draft:[...w],anchorWeights:[...w],anchorNav:100000};
      command={type:'start',key:a.key};
      if(mode==='realistic')command.mode='realistic';
    }else if(a.type==='play'&&s.phase==='plan'){
      n=applyCard(s,a);command={type:'play',card:a.card};
      if(n&&Number.isInteger(a.target))command.target=a.target;
      if(n&&Number.isInteger(a.from))command.from=a.from;
    }else if(a.type==='reset'&&s.phase==='plan'&&s.played.some(p=>p.card!=='scout')){
      const research=s.played.filter(p=>p.card==='scout');
      n={...s,draft:[...s.weights],played:research,energy:maxEnergy(s)-sum(research.map(p=>p.cost))};command={type:'reset'};
    }else if(a.type==='reason'&&s.phase==='plan'&&(a.key===null||Object.hasOwn(reasons,a.key))&&a.key!==s.reason){
      n={...s,reason:a.key};command={type:'reason',key:a.key};
    }else if(a.type==='lock'&&s.phase==='plan'){
      const market=D.rounds[s.round-1], r=settle(s.draft,s.nav,s.ledger,market);
      r.cards=s.played.map(p=>({...p}));r.combos=combos(s);r.reason=s.reason;
      r.effect_vs_hold=r.return_value-sum(s.weights.map((w,i)=>w*market.sector_returns[i]));
      r.researched=s.played.some(p=>p.card==='scout');
      r.sector_returns_snapshot=[...market.sector_returns];
      const aw=s.anchorWeights||[...s.weights];
      const anchorRet=sum(aw.map((w,i)=>w*market.sector_returns[i]));
      r.anchor_weights=[...aw];r.anchor_return=anchorRet;
      r.anchor_nav=s.anchorNav*(1+anchorRet);
      r.tactical_pp=r.return_value-anchorRet;
      r.costs_paid=roundCosts(s);
      if(r.costs_paid>0){
        r.after=r.after-r.costs_paid;
        let peak=100000, dd=0;
        for(const v of [100000,...s.ledger.map(x=>x.after),r.after]){peak=Math.max(peak,v);dd=Math.max(dd,1-v/peak);}
        r.maximum_drawdown=dd;
      }
      const anchorDrift=aw.map((w,i)=>w*(1+market.sector_returns[i])/(1+anchorRet));
      n={...s,phase:'result',nav:r.after,weights:r.drift,ledger:[...s.ledger,r],
        anchorWeights:anchorDrift,anchorNav:r.anchor_nav};command={type:'lock'};
    }else if(a.type==='next'&&s.phase==='result'){
      n=s.round===6?{...s,phase:'final'}:{...s,phase:s.round===2||s.round===4?'upgrade':'plan',round:s.round+1,draft:[...s.weights],energy:maxEnergy(s),played:[],reason:null};command={type:'next'};
    }else if(a.type==='upgrade'&&s.phase==='upgrade'&&Object.hasOwn(upgrades,a.key)&&!s.upgrades.includes(a.key)){
      n={...s,phase:'plan',upgrades:[...s.upgrades,a.key]};n.energy=maxEnergy(n);command={type:'upgrade',key:a.key};
    }
    return n?{...n,commands:[...s.commands,command]}:s;
  }
  function view(s,D) {
    const prices=[...D.pregame];
    for(let i=0;i<s.round-1;i++)prices.push(prices.at(-1)*(1+D.rounds[i].sector_returns[4]));
    const full=prices.slice(-7), detailed=s.played.some(p=>p.card==='scout')||s.phase==='result'||s.phase==='final';
    return {round:s.round,clue:D.events[s.round-1],cutoff:s.round-1,detailed,
      history:full.map((v,i)=>detailed||i===0||i===3||i===6?v:null),
      historyChange:full.at(-1)/full[0]-1,previousReturns:s.round>1?[...D.rounds[s.round-2].sector_returns]:null,
      cycles:cyclesOf(s,D)};
  }
  const serialize = s => JSON.stringify({version:VERSION,seed:s.seed,commands:s.commands});
  function restore(raw,D) {
    try{
      const x=JSON.parse(raw);
      if(!ACCEPTED_VERSIONS.includes(x?.version)||!Number.isInteger(x.seed)||x.seed<0||x.seed>0xffffffff||!Array.isArray(x.commands)||x.commands.length>500)return null;
      let s=initial(x.seed);
      for(const a of x.commands){const n=reduce(s,a,D);if(n===s)return null;s=n;}
      return s;
    }catch{return null;}
  }
  const E={VERSION,ACCEPTED_VERSIONS,SECTOR_CAP,COST_RATES,cards,upgrades,reasons,comboNames,initial,hand,cost,amount,maxEnergy,combos,settle,projectDraft,capBlocked,roundCosts,cyclesOf,reduce,view,serialize,restore};
  if(typeof module!=='undefined')module.exports=E;else root.FACTORLAB_CARDS=E;
})(typeof window==='undefined'?globalThis:window);
