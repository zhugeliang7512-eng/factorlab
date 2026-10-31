(function(root){
  'use strict';
  const VERSION='factorlab-daily-v2.0.0';
  const STUDIO_VERSION='factorlab-daily-v2.1.0';
  const SECTORS=['semiconductor','robotics','materials','energy','digital','cash'];
  const FACTOR_NAMES=['momentum','value','quality','lowVolatility'];
  const INITIAL_WEIGHTS=[.2,.2,.15,.15,.15,.15];
  const EXPOSURES=[[.5,0,.5,-.5],[0,.5,1,0],[-.5,1,0,.5],[-1,-.5,-.5,1],[1,-1,-1,-1]];
  const BETAS=[1.15,1.05,.9,.95,1.2];
  const DEFAULT_CONFIG={rounds:6,daysPerRound:20,dailyNoise:.004,macroNoise:.09,eventStrength:1,buyRate:.0013,sellRate:.0018,slowEvery:5,lagDays:5,cycleConfirmations:2,minCycleDays:10,rateReversion:.07,growthReversion:.045,inflationReversion:.035};
  const TEXTS={
    'zh-CN':{
      'sector.semiconductor':'半导体','sector.robotics':'机器人与工业自动化','sector.materials':'先进材料','sector.energy':'清洁能源装备','sector.digital':'AI 与数字基础设施','sector.cash':'Cash',
      'factor.momentum':'动量','factor.value':'价值','factor.quality':'质量','factor.lowVolatility':'低波动',
      'cycle.expansion':'扩张','cycle.overheating':'过热','cycle.stagflation':'滞胀','cycle.recession':'衰退','cycle.recovery':'复苏',
      'evidence.E1.title':'订单回来了，利润呢？','evidence.E1.body':'合成订单线索改善，但订单转化为收入与利润仍需后续披露。',
      'evidence.E2.title':'好消息可能已在价格里','evidence.E2.body':'需求改善与估值风险可以同时存在。当前价格不是未来收益保证。',
      'evidence.E3.title':'长期支持需要时间','evidence.E3.body':'政策影响先进入融资与需求，再传到盈利。保持长期锚，并说明短期偏移的理由。',
      'event.order.title':'订单传闻浮现','event.order.body':'产业链出现补库存传闻，经营改善尚未核实。市场情绪升温，证据仍有限。',
      'event.disclosure.title':'数据披露：收入与订单不同步','event.disclosure.body':'最新合成披露显示订单的兑现存在时滞。行业内部盈利差异开始扩大。',
      'event.disclosure.strong':'最新合成披露显示较多订单转化为收入；交付时滞仍存在，价格也可能已反映改善。',
      'event.disclosure.weak':'最新合成披露显示订单转化偏弱，部分交付延后。传闻与已确认收入需要重新区分。',
      'event.supply.title':'供应链与融资成本冲击','event.supply.body':'运输与设备交付承压，信用条件收紧。成本变化将持续多个交易日。',
      'event.divergence.title':'行业分化：利润率成为焦点','event.divergence.body':'自动化与材料的现金流表现出现差异。质量因子提供观察角度，但不会永久占优。',
      'event.profit.title':'盈利兑现进入检验期','event.profit.body':'订单开始转化为盈利，估值与资金成本仍影响价格。长期叙事与短期回报并不相同。',
      'event.resolution.title':'订单迷雾：本章证据收束','event.resolution.body':'本章已披露的信息进入最终复盘。检查当时的证据、风险与预测，而不只看盈亏。',
      'badge.reason':'判断有据','badge.evidence':'证据观察者','badge.diversified':'分散配置','badge.risk':'风险守护','badge.forecast':'预测复盘',
      'coach.synthetic':'本回答来自规则式教学提示，市场数据为合成模拟。','coach.risk':'先检查集中度、Cash 缓冲与已发生回撤，再区分需求改善和估值风险。',
      'coach.macro':'利率与信用条件通过融资成本和需求逐步传导；当前宏观指标不提供下一交易日价格。','coach.review':'把本轮结果与同一路径下的不交易组合比较，再检查当时理由是否仍成立。',
      'coach.detail':'因子权重只用于生成行业建议，不会再次投入本金。事件只使用当前已披露信息；未来价格未知。',
      'model.note':'原创、可配置的简化教学模型；未拟合真实市场，不能作为价格预测。',
      'model.benchmark':'五行业各 20%，每日再平衡，免交易成本；不含 Cash。','model.risk':'日收益；252 日年化；Sharpe 扣除各日开盘前已知政策利率百分值/100/252；样本标准差，n<2 时留空；超额收益零方差时仅 Sharpe 留空。'
    },
    en:{
      'sector.semiconductor':'Semiconductors','sector.robotics':'Robotics & automation','sector.materials':'Advanced materials','sector.energy':'Clean energy equipment','sector.digital':'AI & digital infrastructure','sector.cash':'Cash',
      'factor.momentum':'Momentum','factor.value':'Value','factor.quality':'Quality','factor.lowVolatility':'Low volatility',
      'cycle.expansion':'Expansion','cycle.overheating':'Overheating','cycle.stagflation':'Stagflation','cycle.recession':'Recession','cycle.recovery':'Recovery',
      'evidence.E1.title':'Orders are back. Are profits?','evidence.E1.body':'Synthetic order signals improve, but conversion into revenue and profit needs later disclosures.',
      'evidence.E2.title':'Good news may already be priced in','evidence.E2.body':'Improving demand and valuation risk can coexist. The current price cannot guarantee future returns.',
      'evidence.E3.title':'Long-term support takes time','evidence.E3.body':'Policy reaches financing and demand before profits. Retain a long-term anchor and explain tactical deviations.',
      'event.order.title':'An order rumor emerges','event.order.body':'Restocking rumors lift sentiment. Operating improvements remain unverified and evidence is limited.',
      'event.disclosure.title':'Disclosure: orders and revenue diverge','event.disclosure.body':'A synthetic disclosure reveals a lag in order conversion. Profit differences across industries widen.',
      'event.disclosure.strong':'The latest synthetic disclosure confirms stronger order conversion into revenue. Delivery lags remain, and improvement may already be priced in.',
      'event.disclosure.weak':'The latest synthetic disclosure shows weak order conversion and delayed delivery. Distinguish the earlier rumor from confirmed revenue.',
      'event.supply.title':'Supply and financing shock','event.supply.body':'Transport and equipment deliveries face disruption as credit tightens. Cost effects persist across trading days.',
      'event.divergence.title':'Sector divergence: margins in focus','event.divergence.body':'Automation and materials show different cash-flow outcomes. Quality is a useful lens, not a permanent winner.',
      'event.profit.title':'Profit delivery faces its test','event.profit.body':'Orders begin translating into profits while valuation and funding costs still affect prices. A long-term story is not a short-term return.',
      'event.resolution.title':'Order fog: the chapter closes','event.resolution.body':'Available evidence enters the final review. Evaluate the evidence, risk and forecast recorded at the time, as well as returns.',
      'badge.reason':'Reasoned decision','badge.evidence':'Evidence observer','badge.diversified':'Diversified','badge.risk':'Risk awareness','badge.forecast':'Forecast review',
      'coach.synthetic':'This is a rule-based teaching response using synthetic market data.','coach.risk':'Check concentration, the cash buffer and observed drawdown, then separate improving demand from valuation risk.',
      'coach.macro':'Rates and credit conditions transmit gradually through financing costs and demand; current indicators do not reveal the next trading-day price.','coach.review':'Compare this round with the no-trade portfolio on the same market path, then review whether your recorded reason still holds.',
      'coach.detail':'Factor weights only produce a sector suggestion; they do not invest a second budget. Events use disclosed information only; future prices remain unknown.',
      'model.note':'An original, configurable teaching model, not calibrated to actual markets and not a price forecast.',
      'model.benchmark':'Five sectors at 20% each, rebalanced daily without costs; no cash.','model.risk':'Daily returns; 252-day annualization; Sharpe subtracts the pre-day annual policy rate in percent /100/252; sample deviation. Statistics are blank when n<2; only Sharpe is blank for zero excess-return variance.'
    }
  };
  const EVENT_DEFINITIONS=[
    {id:'EVENT-ORDER',key:'order',at:7,duration:12,macro:{sentiment:.65,liquidity:.10},sector:[.0012,.0002,0,0,.0005],factor:[.00025,0,0,-.0001]},
    {id:'EVENT-DISCLOSURE',key:'disclosure',at:25,duration:15,macro:{growth:-.005,sentiment:-.45},sector:[-.0014,.0002,.0003,0,-.0004],factor:[-.0003,.0001,.0002,.0001]},
    {id:'EVENT-SUPPLY',key:'supply',at:46,duration:20,macro:{inflation:.018,credit:.35,liquidity:-.25},sector:[-.0008,-.0005,.0004,-.0006,-.0002],factor:[-.00015,.00005,.00015,.0002]},
    {id:'EVENT-DIVERGENCE',key:'divergence',at:72,duration:14,macro:{growth:.015,credit:-.18},sector:[.0002,.0008,.0005,-.0003,-.0004],factor:[.0001,.00015,.0001,-.0001]},
    {id:'EVENT-PROFIT',key:'profit',at:95,duration:16,macro:{growth:.012,sentiment:.35},sector:[.0007,.0002,-.0002,.0001,.0005],factor:[.0001,-.0001,.00005,-.00005]},
    {id:'EVENT-RESOLUTION',key:'resolution',at:116,duration:4,macro:{sentiment:-.1},sector:[-.0001,.0001,0,.0001,0],factor:[-.0001,.0001,0,0]}
  ];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const sum=x=>x.reduce((a,b)=>a+b,0);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const fail=code=>{throw Error(code);};
  const emptyAttribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  function validWeights(w){if(!Array.isArray(w)||w.length!==6||w.some(x=>!Number.isFinite(x)||x<0)||Math.abs(sum(w)-1)>1e-9)return 'invalidWeights';if(w.slice(0,5).some(x=>x>.4+1e-10))return 'sectorCap';return null;}
  function validFactors(w){return Array.isArray(w)&&w.length===4&&w.every(x=>Number.isFinite(x)&&x>=0)&&Math.abs(sum(w)-1)<=1e-9;}
  function configuration(raw={}){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('invalidConfig');
    const c={...DEFAULT_CONFIG,...raw},ranges={rounds:[1,12],daysPerRound:[5,60],dailyNoise:[.0001,.03],macroNoise:[0,.5],eventStrength:[0,3],buyRate:[0,.02],sellRate:[0,.02],slowEvery:[1,20],lagDays:[1,30],cycleConfirmations:[1,5],minCycleDays:[5,30],rateReversion:[0,.3],growthReversion:[0,.3],inflationReversion:[0,.3]};
    for(const key of Object.keys(raw))if(!Object.hasOwn(ranges,key))fail('invalidConfig');
    for(const [key,[lo,hi]] of Object.entries(ranges))if(!Number.isFinite(c[key])||c[key]<lo||c[key]>hi)fail('invalidConfig');
    if(['rounds','daysPerRound','slowEvery','lagDays','cycleConfirmations','minCycleDays'].some(k=>!Number.isInteger(c[k])))fail('invalidConfig');return c;
  }
  function uniform(s){s.rng=(s.rng+0x6D2B79F5)>>>0;let n=s.rng;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
  function normal(s){return Math.sqrt(-2*Math.log(Math.max(1e-12,uniform(s))))*Math.cos(2*Math.PI*uniform(s));}
  function value(units,prices,cash){return sum(units.map((u,i)=>u*prices[i]))+cash;}
  function updateWeights(s){s.nav=value(s.units,s.prices,s.cash);s.weights=[...s.units.map((u,i)=>u*s.prices[i]/s.nav),s.cash/s.nav];}
  function initial({seed=20261013,scenario='baseline',config={}}={}){
    if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)fail('invalidSeed');
    if(!['baseline','stress','recovery'].includes(scenario))fail('invalidScenario');
    const c=configuration(config),macro={rate:3.2,inflation:2.7,growth:3.2,liquidity:56,credit:22,sentiment:58,cycle:'expansion'};
    if(scenario==='stress')Object.assign(macro,{rate:5.5,inflation:5.2,growth:-1.2,liquidity:32,credit:62,sentiment:32,cycle:'stagflation'});
    if(scenario==='recovery')Object.assign(macro,{rate:2,inflation:1.4,growth:1.2,liquidity:66,credit:34,sentiment:57,cycle:'recovery'});
    const prices=[100,100,100,100,100],units=INITIAL_WEIGHTS.slice(0,5).map(w=>w*100000/100),cash=15000;
    const s={version:VERSION,seed,scenario,config:c,rng:seed,phase:'decision',day:0,round:1,daysPerRound:c.daysPerRound,macro,prices,units,cash,nav:100000,benchmarkNav:100000,anchorNav:100000,anchorUnits:[...units],anchorCash:cash,weights:[...INITIAL_WEIGHTS],factorWeights:[.25,.25,.25,.25],events:[],eventState:{},history:[],results:[],transactions:[],commands:[],seen:[],pendingCost:0,roundState:null,cycleCandidate:macro.cycle,cycleCount:0,cycleChanged:0};
    s.history.push({day:0,nav:100000,benchmarkNav:100000,anchorNav:100000,prices:[...prices],macro:clone(macro),sectorReturns:[0,0,0,0,0],factorReturns:[0,0,0,0],beforeNav:100000,holdingsBefore:units.map((u,i)=>u*prices[i]),cashBefore:cash,cashRate:macro.rate/100/252,attribution:emptyAttribution(),contributionReturns:[]});return s;
  }
  function preview(s,weights=s.weights){
    const error=validWeights(weights);if(error)return {ok:false,error};
    const holdings=s.units.map((u,i)=>u*s.prices[i]);
    const trades=after=>{let buys=0,sells=0;for(let i=0;i<5;i++){const d=weights[i]*after-holdings[i];if(d>=0)buys+=d;else sells-=d;}return {buys,sells,fee:buys*s.config.buyRate+sells*s.config.sellRate};};
    let lo=0,hi=s.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(mid+trades(mid).fee>s.nav)hi=mid;else lo=mid;}
    const after=(lo+hi)/2,t=trades(after);return {ok:true,weights:[...weights],after,fee:t.fee,buys:t.buys,sells:t.sells,turnover:(t.buys+t.sells)/s.nav,cash:after*weights[5]};
  }
  function recommend(s,factorWeights,cashWeight=.15){
    if(!validFactors(factorWeights))fail('invalidFactors');if(!Number.isFinite(cashWeight)||cashWeight<0||cashWeight>1)fail('invalidWeights');
    const scores=EXPOSURES.map(row=>Math.exp(sum(row.map((v,i)=>v*factorWeights[i])))),w=[0,0,0,0,0,cashWeight];let free=[0,1,2,3,4],remaining=1-cashWeight;
    while(free.length){const total=sum(free.map(i=>scores[i])),capped=free.filter(i=>remaining*scores[i]/total>.4);if(!capped.length){for(const i of free)w[i]=remaining*scores[i]/total;break;}for(const i of capped){w[i]=.4;remaining-=.4;}free=free.filter(i=>!capped.includes(i));}return w;
  }
  function macroStep(s,impacts){
    const m=s.macro,lag=s.history[Math.max(0,s.history.length-1-s.config.lagDays)].macro,n=s.config.macroNoise;
    m.liquidity=clamp(m.liquidity+.05*(55-m.liquidity)-.08*(lag.rate-3)-.015*(lag.credit-25)+normal(s)*n*2,0,100);
    m.credit=clamp(m.credit+.025*(24-m.credit)+.045*(lag.rate-3)-.055*(lag.growth-2.5)+normal(s)*n,0,100);
    m.sentiment=clamp(m.sentiment+.055*(52-m.sentiment)+.08*(m.growth-2.5)+.012*(m.liquidity-50)-.018*(m.credit-25)+normal(s)*n*3,0,100);
    if(s.day%s.config.slowEvery===0){
      m.rate=clamp(m.rate+s.config.rateReversion*((2.5+.4*(lag.inflation-2)+.12*(lag.growth-2.5))-m.rate)+normal(s)*n*.12,0,15);
      m.growth=clamp(m.growth+s.config.growthReversion*(3-m.growth)-.035*(lag.rate-lag.inflation-1)-.005*(lag.credit-25)+.002*(lag.liquidity-50)+normal(s)*n,-8,10);
      m.inflation=clamp(m.inflation+s.config.inflationReversion*(2.3-m.inflation)+.02*(lag.growth-2.5)+normal(s)*n*.5,-3,16);
    }
    for(const [key,v] of Object.entries(impacts))m[key]+=v;
    for(const [key,lo,hi] of [['rate',0,15],['inflation',-3,16],['growth',-8,10],['liquidity',0,100],['credit',0,100],['sentiment',0,100]])m[key]=clamp(m[key],lo,hi);
    if(s.day%s.config.slowEvery===0){const candidate=m.growth<.5?(m.inflation>3.5?'stagflation':'recession'):m.growth>3.6&&m.inflation>3.3?'overheating':m.growth<2.2?'recovery':'expansion';s.cycleCount=s.cycleCandidate===candidate?s.cycleCount+1:1;s.cycleCandidate=candidate;if(s.cycleCount>=s.config.cycleConfirmations&&s.day-s.cycleChanged>=s.config.minCycleDays&&m.cycle!==candidate){m.cycle=candidate;s.cycleChanged=s.day;}}
  }
  function trigger(s){
    const total=s.config.rounds*s.daysPerRound;
    const index=EVENT_DEFINITIONS.findIndex((e,i)=>Math.max(1,Math.round(e.at*total/120))<=s.day&&!s.events.some(old=>old.id===e.id)&&(i===0||s.events.some(old=>old.id===EVENT_DEFINITIONS[i-1].id)));
    const definition=EVENT_DEFINITIONS[index];
    if(!definition)return false;
    const orderConversion=index===0?.35+uniform(s)*.5:s.eventState['EVENT-ORDER'].hidden.orderConversion;
    const stress=clamp(1+(s.macro.credit-25)/100,.75,1.6),severity=(.7+uniform(s)*.6)*s.config.eventStrength*(index===2?stress:1);
    const event={id:definition.id,titleKey:`event.${definition.key}.title`,bodyKey:index===1?`event.disclosure.${orderConversion>=.6?'strong':'weak'}`:`event.${definition.key}.body`,predecessorId:index?EVENT_DEFINITIONS[index-1].id:null,startDay:s.day,duration:Math.max(2,Math.round(definition.duration*total/120)),severity,status:'active',trigger:'disclosure-node-and-predecessor',resolution:'duration-elapsed'};
    const sector=[...definition.sector];if(index===1)sector[0]+=(orderConversion-.6)*.009;if(index===4)sector[0]+=(orderConversion-.6)*.005;
    s.eventState[event.id]={macroImpact:clone(definition.macro),sectorImpact:sector,factorImpact:[...definition.factor],hidden:{orderConversion},followUpId:EVENT_DEFINITIONS[index+1]?.id||null};
    s.events.push(event);return true;
  }
  function eventImpacts(s){
    const macro={},sector=[0,0,0,0,0],factors=[0,0,0,0];
    for(const event of s.events){const age=s.day-event.startDay;if(age>=event.duration){event.status='resolved';continue;}const d=s.eventState[event.id],scale=event.severity*Math.exp(-age/event.duration);for(const [k,v] of Object.entries(d.macroImpact))macro[k]=(macro[k]||0)+v*scale;d.sectorImpact.forEach((v,i)=>sector[i]+=v*scale);d.factorImpact.forEach((v,i)=>factors[i]+=v*scale);}
    return {macro,sector,factors};
  }
  function marketStep(s,impact){
    const m=s.macro,prev=s.history.at(-1),noise=s.config.dailyNoise,risk=clamp(1+(m.credit-25)/90+(50-m.liquidity)/150,.65,2.5);
    const market=.00013+(m.growth-2.5)*.00013-(m.rate-3)*.00016-(m.inflation-2.5)*.00007+(m.liquidity-50)*.000006-(m.credit-25)*.000011+(m.sentiment-50)*.000004+normal(s)*noise*risk;
    const momentum=sum(prev.sectorReturns)/5;
    const factorReturns=[.10*momentum+(m.sentiment-50)*.000004+normal(s)*noise*.28,(m.rate-3)*.00007-(m.growth-3)*.00003+normal(s)*noise*.24,(m.credit-25)*.000006+(3-m.growth)*.000025+normal(s)*noise*.22,(m.credit-25)*.000005-(m.sentiment-50)*.000005+normal(s)*noise*.20];
    const contributionReturns=EXPOSURES.map((exposure,i)=>{
      const factors=exposure.map((v,j)=>v===0?0:v*factorReturns[j]),sector=(m.growth-2.5)*[.00007,.00009,.00005,.00006,.00004][i]-(m.inflation-2.5)*[.00004,.00006,-.00003,.00006,.00002][i];
      const event=impact.sector[i]+sum(exposure.map((v,j)=>v*impact.factors[j])),beta=BETAS[i]*market,rawIdio=normal(s)*noise*[.65,.5,.45,.6,.8][i],raw=beta+sum(factors)+sector+event+rawIdio;
      return {market:beta,factors,sector,event,idiosyncratic:rawIdio+clamp(raw,-.12,.12)-raw};
    });
    return {factorReturns,contributionReturns,sectorReturns:contributionReturns.map(c=>c.market+sum(c.factors)+c.sector+c.event+c.idiosyncratic)};
  }
  function daily(s){
    const previous=s.history.at(-1),holdings=s.units.map((u,i)=>u*s.prices[i]),cashBefore=s.cash,cashRate=s.macro.rate/100/252;
    s.day++;const occurred=trigger(s),impact=eventImpacts(s);macroStep(s,impact.macro);const returns=marketStep(s,impact),a=emptyAttribution();
    for(let i=0;i<5;i++){const c=returns.contributionReturns[i],amount=holdings[i];a.market+=amount*c.market;a.sector+=amount*c.sector;a.event+=amount*c.event;a.idiosyncratic+=amount*c.idiosyncratic;c.factors.forEach((r,j)=>a.factors[j]+=amount*r);s.prices[i]*=1+returns.sectorReturns[i];}
    a.cash=cashBefore*cashRate;a.cost=s.pendingCost?-s.pendingCost:0;s.cash+=a.cash;s.pendingCost=0;s.anchorCash*=1+cashRate;s.roundState.counterfactualCash*=1+cashRate;
    updateWeights(s);s.benchmarkNav*=1+sum(returns.sectorReturns)/5;s.anchorNav=value(s.anchorUnits,s.prices,s.anchorCash);
    s.history.push({day:s.day,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,prices:[...s.prices],macro:clone(s.macro),...returns,beforeNav:previous.nav,holdingsBefore:holdings,cashBefore,cashRate,attribution:a});
    if(occurred)s.phase='event';else if(s.day===s.round*s.daysPerRound)settleRound(s);
  }
  function aggregate(rows){const a=emptyAttribution();for(const h of rows){for(const k of ['market','sector','event','idiosyncratic','cash','cost'])a[k]+=h.attribution[k];h.attribution.factors.forEach((v,i)=>a.factors[i]+=v);}return a;}
  function settleRound(s){
    if(s.results.some(r=>r.round===s.round))return;
    const rs=s.roundState,returnValue=s.nav/rs.before-1,benchmarkReturn=s.benchmarkNav/rs.benchmarkBefore-1,rows=s.history.filter(h=>h.day>rs.startDay),counterfactualNav=value(rs.counterfactualUnits,s.prices,rs.counterfactualCash),realized=benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat';
    const badges=[];if(rs.decisionPolicy==='studio'){if(rs.evidenceRefs.length&&rs.falsifierIf.trim())badges.push('badge.recordComplete');}else{if(rs.reason.trim())badges.push('badge.reason');if(s.seen.length)badges.push('badge.evidence');if(sum(rs.weights.map(w=>w*w))<=.26)badges.push('badge.diversified');if(rs.weights[5]>=.1&&metrics(s).maxDrawdown<=.12)badges.push('badge.risk');if(realized===rs.forecast)badges.push('badge.forecast');}
    s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:rs.before,after:s.nav,returnValue,benchmarkReturn,anchorReturn:s.anchorNav/rs.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:aggregate(rows),forecast:rs.forecast,realizedForecast:realized,reason:rs.reason,weights:[...rs.weights],factorWeights:[...rs.factorWeights],reward:{points:badges.length*20,badges},synthetic:true});s.phase=s.round===s.config.rounds?'complete':'review';
    if(s.version===STUDIO_VERSION)Object.assign(s.results.at(-1),{decisionPolicy:rs.decisionPolicy,evidenceRefs:[...rs.evidenceRefs],falsifierIf:rs.falsifierIf});
  }
  function reduce(s,a){
    if(!s||s.version!==VERSION)fail('invalidSave');return applyAction(s,a,'legacy');
  }
  function applyAction(s,a,decisionPolicy){
    if(!s||![VERSION,STUDIO_VERSION].includes(s.version)||!a||typeof a!=='object')fail('invalidSave');if(s.commands.length>=4000)fail('invalidSave');
    const n=clone(s);let command;
    if(a.type==='lock'){
      const gate=decisionPolicy==='studio'?evaluateDecisionGate(s,a):null;if(gate&&!gate.canConfirm)fail(gate.error);
      if(s.phase!=='decision')fail('invalidPhase');const p=preview(s,a.weights);if(!p.ok)fail(p.error);if(!validFactors(a.factorWeights))fail('invalidFactors');if(typeof a.reason!=='string'||!a.reason.trim()||a.reason.length>500)fail('invalidReason');if(!['up','flat','down'].includes(a.forecast))fail('invalidForecast');
      n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualUnits:[...s.units],counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:a.reason.trim(),forecast:a.forecast};
      n.units=a.weights.slice(0,5).map((w,i)=>p.after*w/n.prices[i]);n.cash=p.cash;n.factorWeights=[...a.factorWeights];n.pendingCost=p.fee;n.transactions.push({day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,buyRate:s.config.buyRate,sellRate:s.config.sellRate,weights:[...a.weights]});updateWeights(n);n.phase='simulating';command={type:'lock',weights:[...a.weights],factorWeights:[...a.factorWeights],reason:a.reason.trim(),forecast:a.forecast};
      if(s.version===STUDIO_VERSION){Object.assign(n.roundState,{decisionPolicy,evidenceRefs:gate?[...gate.evidenceRefs]:[],falsifierIf:gate?gate.falsifierIf:''});if(gate)Object.assign(command,{evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf});}
    }else if(a.type==='advance'){
      if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');for(let d=0;d<a.days&&n.phase==='simulating';d++)daily(n);command={type:'advance',days:a.days};
    }else if(a.type==='resume'){
      if(s.phase!=='event')fail('invalidPhase');n.phase='simulating';if(n.day===n.round*n.daysPerRound)settleRound(n);command={type:'resume'};
    }else if(a.type==='next'){
      if(s.phase!=='review'||s.round>=s.config.rounds)fail('invalidPhase');n.round++;n.phase='decision';n.roundState=null;command={type:'next'};
    }else if(a.type==='read'){
      const ids=['E1','E2','E3',...s.events.map(e=>e.id)];if(!ids.includes(a.id))fail('unknownEvidence');if(s.seen.includes(a.id))return s;n.seen.push(a.id);command={type:'read',id:a.id};
    }else fail('invalidAction');n.commands.push(command);return n;
  }
  function serialize(s){return {version:VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
  function restore(raw){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||save.version!==VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let state=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)state=reduce(state,a);return state;
  }
  function metrics(s){
    const rows=s.history.slice(1),dailyReturns=rows.map(h=>h.nav/h.beforeNav-1),excess=dailyReturns.map((r,i)=>r-rows[i].cashRate),n=rows.length,mean=n?sum(dailyReturns)/n:0,excessMean=n?sum(excess)/n:0;
    const variance=n>1?sum(dailyReturns.map(v=>(v-mean)**2))/(n-1):null,excessVariance=n>1?sum(excess.map(v=>(v-excessMean)**2))/(n-1):null;
    let peak=100000,maxDrawDown=0;for(const nav of [...s.history.map(h=>h.nav),s.nav]){peak=Math.max(peak,nav);maxDrawDown=Math.max(maxDrawDown,1-nav/peak);}
    return {returnValue:s.nav/100000-1,volatility:variance===null?null:Math.sqrt(variance*252),sharpe:excessVariance===null||excessVariance<1e-20?null:excessMean/Math.sqrt(excessVariance)*Math.sqrt(252),maxDrawdown:maxDrawDown,diversification:1-sum(s.weights.map(w=>w*w)),excessReturn:(s.nav-s.benchmarkNav)/100000,tacticalAmount:s.nav-s.anchorNav,observations:n,annualization:252,rf:'known-daily-policy-rate',attribution:aggregate(rows)};
  }
  function publicView(s){
    const result={version:s.version,synthetic:true,phase:s.phase,day:s.day,round:s.round,rounds:s.config.rounds,daysPerRound:s.daysPerRound,macro:clone(s.macro),prices:[...s.prices],units:[...s.units],cash:s.cash,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,weights:[...s.weights],factorWeights:[...s.factorWeights],history:clone(s.history),results:clone(s.results),events:clone(s.events),seen:[...s.seen],metrics:metrics(s),evidence:['E1','E2','E3'].map(id=>({id,titleKey:`evidence.${id}.title`,bodyKey:`evidence.${id}.body`}))};return result;
  }
  function coachContext(s,lang='zh-CN'){
    const language=lang==='en'?'en':'zh-CN',t=TEXTS[language],v=publicView(s);
    return {version:VERSION,synthetic:true,language,phase:v.phase,day:v.day,round:v.round,model:t['model.note'],benchmark:t['model.benchmark'],riskDefinition:t['model.risk'],macro:{id:`MACRO-D${s.day}`,...v.macro},portfolio:{id:`PORTFOLIO-D${s.day}`,nav:v.nav,cash:v.cash,weights:v.weights,sectors:SECTORS.map(k=>t[`sector.${k}`]),factorWeights:v.factorWeights,factorNames:FACTOR_NAMES.map(k=>t[`factor.${k}`])},metrics:{id:`METRICS-D${s.day}`,...v.metrics},evidence:v.evidence.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey]})),events:v.events.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey],startDay:e.startDay,status:e.status})),results:v.results.map(r=>({id:r.id,round:r.round,returnValue:r.returnValue,benchmarkReturn:r.benchmarkReturn,tacticalAmount:r.tacticalAmount,forecast:r.forecast,realizedForecast:r.realizedForecast,reason:r.reason})),recentHistory:v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}))};
  }
  function sampleReply(s,question='',lang='zh-CN'){
    const t=TEXTS[lang==='en'?'en':'zh-CN'],review=['review','complete'].includes(s.phase),key=review?'coach.review':/risk|drawdown|cash|风险|回撤|现金/i.test(question)?'coach.risk':'coach.macro';
    const references=[`MACRO-D${s.day}`,`PORTFOLIO-D${s.day}`];if(review&&s.results.length)references.push(s.results.at(-1).id);else if(s.events.length)references.push(s.events.at(-1).id);
    return {mode:'example',summary:t[key],detail:`${t['coach.detail']} ${t['coach.synthetic']}`,references};
  }
  function evaluateDecisionGate(s,draft){
    const result={status:'blocked',canConfirm:false,recordComplete:false,error:null,evidenceRefs:[],falsifierIf:''};
    const blocked=error=>({...result,error});
    if(!s||s.phase!=='decision')return blocked('invalidPhase');
    if(!draft||typeof draft!=='object'||Array.isArray(draft))return blocked('invalidWeights');
    const refs=draft.evidenceRefs===undefined?[]:draft.evidenceRefs,available=['E1','E2','E3',...s.events.map(e=>e.id)];
    const refsValid=Array.isArray(refs)&&refs.length<=9&&Array.from(refs).every(id=>typeof id==='string'&&id.length>0&&id.length<=64&&available.includes(id));
    if(refsValid)result.evidenceRefs=[...new Set(refs)];
    const falsifier=draft.falsifierIf===undefined?'':draft.falsifierIf,falsifierValid=typeof falsifier==='string'&&falsifier.length<=500;
    if(falsifierValid)result.falsifierIf=falsifier.trim();
    const weightError=validWeights(draft.weights);if(weightError)return blocked(weightError);
    if(Array.from(draft.weights).some(w=>!Number.isFinite(w)))return blocked('invalidWeights');
    if(!validFactors(draft.factorWeights)||Array.from(draft.factorWeights).some(w=>!Number.isFinite(w)))return blocked('invalidFactors');
    if(typeof draft.reason!=='string'||!draft.reason.trim()||draft.reason.length>500)return blocked('invalidReason');
    if(!['up','flat','down'].includes(draft.forecast))return blocked('invalidForecast');
    if(!refsValid)return blocked('invalidEvidenceRefs');
    if(!falsifierValid)return blocked('invalidFalsifier');
    if(!result.evidenceRefs.length)return {...result,status:'need_evidence',error:'evidenceRequired'};
    result.recordComplete=!!result.falsifierIf;return {...result,status:result.recordComplete?'ready':'need_falsifier',canConfirm:true};
  }
  function studioInitial(options){return {...initial(options),version:STUDIO_VERSION,policyBoundary:0};}
  function studioReduce(s,a){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return applyAction(s,a,'studio');
  }
  function studioSerialize(s){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return {...serialize(s),version:STUDIO_VERSION,policyBoundary:s.policyBoundary};
  }
  function studioRestore(raw){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||![VERSION,STUDIO_VERSION].includes(save.version)||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');
    const boundary=save.version===VERSION?save.commands.length:save.policyBoundary;
    if(!Number.isInteger(boundary)||boundary<0||boundary>save.commands.length)fail('invalidSave');
    let state=studioInitial({seed:save.seed,scenario:save.scenario,config:save.config});
    for(let i=0;i<save.commands.length;i++){
      const next=applyAction(state,save.commands[i],i<boundary?'legacy':'studio');
      state=next===state?{...state,commands:[...state.commands,{type:'read',id:save.commands[i].id}]}:next;
    }
    state.policyBoundary=boundary;return state;
  }
  function decisionRecord(record){
    if(!record)return null;return {decisionPolicy:record.decisionPolicy,weights:[...record.weights],factorWeights:[...record.factorWeights],reason:record.reason,forecast:record.forecast,evidenceRefs:[...record.evidenceRefs],falsifierIf:record.falsifierIf};
  }
  function studioPublicView(s){return {...publicView(s),roundState:decisionRecord(s.roundState)};}
  function studioCoachContext(s,lang='zh-CN',draft){
    const context=coachContext(s,lang),gate=draft===undefined?null:evaluateDecisionGate(s,draft);
    context.version=STUDIO_VERSION;context.decision=decisionRecord(s.roundState);context.decisionGate=gate;
    if(draft!==undefined)context.decision={decisionPolicy:'studio',weights:Array.isArray(draft?.weights)?[...draft.weights]:[],factorWeights:Array.isArray(draft?.factorWeights)?[...draft.factorWeights]:[],reason:typeof draft?.reason==='string'?draft.reason.slice(0,500):'',forecast:['up','flat','down'].includes(draft?.forecast)?draft.forecast:null,evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf};
    context.results=context.results.map((r,i)=>({...r,decisionPolicy:s.results[i].decisionPolicy,evidenceRefs:[...s.results[i].evidenceRefs],falsifierIf:s.results[i].falsifierIf}));return context;
  }
  function createResearchStudioEngine(){
    const texts=clone(TEXTS);texts['zh-CN']['badge.recordComplete']='决策记录完整';texts.en['badge.recordComplete']='Decision record complete';
    return {...api,VERSION:STUDIO_VERSION,TEXTS:texts,initial:studioInitial,reduce:studioReduce,serialize:studioSerialize,restore:studioRestore,publicView:studioPublicView,coachContext:studioCoachContext,evaluateDecisionGate};
  }
  const api={VERSION,SECTORS,FACTOR_NAMES,INITIAL_WEIGHTS,EXPOSURES,BETAS,DEFAULT_CONFIG,TEXTS,initial,reduce,serialize,restore,publicView,coachContext,sampleReply,recommend,metrics,preview,createResearchStudioEngine};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactorLabSimulation=api;
})(typeof window==='undefined'?globalThis:window);
