(function(root){
  'use strict';
  const VERSION='factorlab-securities-v3.0.0',SCHEMA=1,BASKET_VERSION='teaching-baskets-20261030.1';
  const SECTORS=['semiconductor','robotics','materials','energy','digital'];
  const entries=[
    ['SIM-SEMI-A',0,.4,80,'教学芯片设计 A','Teaching chip design A'],['SIM-SEMI-B',0,.3,60,'教学晶圆设备 B','Teaching wafer equipment B'],['SIM-SEMI-C',0,.3,40,'教学封测 C','Teaching packaging C'],
    ['SIM-ROBO-A',1,.6,50,'教学工业机器人 A','Teaching industrial robotics A'],['SIM-ROBO-B',1,.4,25,'教学自动化控制 B','Teaching automation B'],
    ['SIM-MAT-A',2,.5,30,'教学先进合金 A','Teaching advanced alloys A'],['SIM-MAT-B',2,.5,75,'教学电子材料 B','Teaching electronic materials B'],
    ['SIM-ENERGY-A',3,.55,45,'教学电力装备 A','Teaching power equipment A'],['SIM-ENERGY-B',3,.45,20,'教学储能设备 B','Teaching storage equipment B'],
    ['SIM-AI-A',4,.65,100,'教学算力设备 A','Teaching compute equipment A'],['SIM-AI-B',4,.35,35,'教学数据网络 B','Teaching data networks B']
  ];
  const INSTRUMENTS=entries.map(([id,sectorIndex,weight,initialPrice,zh,en])=>({id,symbol:id,sectorIndex,sectorId:SECTORS[sectorIndex],weight,initialPrice,name:{'zh-CN':zh,en},currency:'USD',type:'teaching-stock',dataMode:'synthetic',source:'FactorLab authored teaching issuer; not a listed security',sourceUrl:null}));
  const BASKETS=SECTORS.map((sectorId,i)=>({id:sectorId,version:BASKET_VERSION,dataMode:'synthetic',components:INSTRUMENTS.filter(x=>x.sectorIndex===i).map(x=>({instrumentId:x.id,weight:x.weight})),isETF:false}));
  const clone=x=>JSON.parse(JSON.stringify(x)),sum=xs=>xs.reduce((a,b)=>a+b,0),money=x=>Math.round(x*1e6)/1e6,shares=x=>Math.floor((x+1e-12)*1e6)/1e6;
  const fail=x=>{throw Error(x);};
  const asOf=day=>new Date(Date.UTC(2024,0,2+day,16)).toISOString();
  const time=(day,minutes)=>new Date(Date.parse(asOf(day))+minutes*60000).toISOString();
  const attribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  const zeroContributions=()=>Object.fromEntries(INSTRUMENTS.map(x=>[x.id,0]));
  function hash(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  function weightError(w){return !Array.isArray(w)||w.length!==6||Array.from(w).some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(sum(w)-1)>1e-9?'invalidWeights':w.slice(0,5).some(v=>v>.4+1e-10)?'sectorCap':null;}
  function refresh(ledger){
    ledger.asOf=asOf(ledger.day);ledger.invested=money(sum(ledger.holdings.map(h=>money(h.quantity*h.price))));ledger.nav=money(ledger.cash+ledger.invested);
    for(const h of ledger.holdings){h.marketValue=money(h.quantity*h.price);h.weight=h.marketValue/ledger.nav;h.priceTime=ledger.asOf;}
    ledger.snapshotId='P-'+hash([ledger.day,ledger.revision,ledger.cash,ledger.holdings.map(h=>[h.id,h.price,h.quantity])]);
    return ledger;
  }
  function snapshotRow(ledger,extra={}){return {day:ledger.day,asOf:ledger.asOf,nav:ledger.nav,cash:ledger.cash,beforeNav:ledger.nav,prices:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.price])),quantities:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.quantity])),contributions:zeroContributions(),cashContribution:0,fee:0,...extra};}
  function createLedger(weights){
    const holdings=INSTRUMENTS.map(x=>({...clone(x),quantity:shares(100000*weights[x.sectorIndex]*x.weight/x.initialPrice),price:x.initialPrice}));
    const ledger=refresh({schema:SCHEMA,engineVersion:VERSION,basketVersion:BASKET_VERSION,currency:'USD',dataMode:'synthetic',day:0,revision:0,cash:money(100000-sum(holdings.map(h=>money(h.quantity*h.price)))),holdings,baskets:clone(BASKETS),transactions:[],history:[],pendingFee:0,totalFees:0,buyRate:.0013,sellRate:.0018,precision:{moneyDecimals:6,shareDecimals:6,priceDecimals:6,displayDecimals:2},priceBasis:'synthetic-raw-no-splits-no-dividends',executionRule:'synthetic fixed quote at 16:02 UTC, after 16:00 signal and 16:01 decision; calendar-day teaching steps, not a real exchange calendar'});
    ledger.history.push(snapshotRow(ledger));return ledger;
  }
  function simulateAllocation(view,weights){
    const ledger=view.ledger||view,error=weightError(weights);if(error)return {ok:false,error};if(!ledger?.holdings)return {ok:false,error:'legacyLedger'};
    const calculate=capital=>{
      const rows=ledger.holdings.map(h=>{const targetWeight=weights[h.sectorIndex]*h.weightInBasket,quantity=targetWeight===0?0:Math.abs(capital*targetWeight-h.marketValue)<=h.price*1.0001e-6?h.quantity:shares(capital*targetWeight/h.price),targetAmount=money(quantity*h.price),deltaQuantity=money(quantity-h.quantity),delta=money(deltaQuantity*h.price),fee=money(Math.abs(delta)*(delta>=0?ledger.buyRate:ledger.sellRate));return {instrumentId:h.id,id:h.id,symbol:h.symbol,name:clone(h.name),sectorId:h.sectorId,sectorIndex:h.sectorIndex,type:h.type,currency:h.currency,targetWeight,requestedAmount:money(ledger.nav*targetWeight),targetAmount,quantity,price:h.price,priceTime:h.priceTime,currentQuantity:h.quantity,currentAmount:h.marketValue,deltaQuantity,delta,fee};});
      const buys=money(sum(rows.map(r=>Math.max(0,r.delta)))),sells=money(sum(rows.map(r=>Math.max(0,-r.delta)))),fee=money(sum(rows.map(r=>r.fee))),cash=money(ledger.cash+sells-buys-fee);return {rows,buys,sells,fee,cash,after:money(cash+sum(rows.map(r=>r.targetAmount)))};
    };
    let lo=0,hi=ledger.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2,p=calculate(mid);if(p.cash<0||mid+p.fee>ledger.nav)hi=mid;else lo=mid;}
    const p=calculate(lo);return {ok:true,...p,weights:[...weights],turnover:(p.buys+p.sells)/ledger.nav,revision:ledger.revision,snapshotId:ledger.snapshotId,basketVersion:BASKET_VERSION,signalTime:ledger.asOf,decisionTime:time(ledger.day,1),executionTime:time(ledger.day,2),assumptions:{currency:'USD',fractionalShares:6,synthetic:true,buyRate:ledger.buyRate,sellRate:ledger.sellRate}};
  }
  function createEngine(base){
    const legacy=base.createResearchStudioEngine();
    function old(s){return s?.version!==VERSION;}
    function oldEngine(s){return s.version===base.VERSION?base:legacy;}
    function initial(options){
      const market=legacy.initial(options),ledger=createLedger(market.weights);ledger.buyRate=market.config.buyRate;ledger.sellRate=market.config.sellRate;
      for(const h of ledger.holdings)h.weightInBasket=INSTRUMENTS.find(x=>x.id===h.id).weight;
      const s={...clone(market),version:VERSION,_market:market,ledger,commands:[],results:[],transactions:[],seen:[],roundState:null,anchorHoldings:ledger.holdings.map(h=>h.quantity),anchorCash:ledger.cash,benchmarkNav:100000,anchorNav:100000};
      s.history=[{...clone(market.history[0]),nav:ledger.nav,cashBefore:ledger.cash,securityContributions:zeroContributions()}];return sync(s);
    }
    function sync(s){
      const l=refresh(s.ledger);s.nav=l.nav;s.cash=l.cash;s.day=s._market.day;s.round=s._market.round;s.phase=s._market.phase;s.macro=clone(s._market.macro);s.events=clone(s._market.events);s.prices=[...s._market.prices];
      const sectors=SECTORS.map((_,i)=>money(sum(l.holdings.filter(h=>h.sectorIndex===i).map(h=>h.marketValue))));s.units=sectors.map((x,i)=>x/s.prices[i]);s.weights=[...sectors.map(x=>x/l.nav),l.cash/l.nav];s.transactions=clone(l.transactions);return s;
    }
    function publicView(s){
      if(old(s))return {...oldEngine(s).publicView(s),legacy:true,ledger:null};
      const v=legacy.publicView({...s,version:legacy.VERSION});v.version=VERSION;v.legacy=false;v.ledger=clone(s.ledger);v.ledger.unpostedFee=v.ledger.pendingFee;delete v.ledger.pendingFee;v.asOf=s.ledger.asOf;v.decisionTime=time(s.day,1);v.snapshotId=s.ledger.snapshotId;v.revision=s.ledger.revision;v.transactions=clone(s.ledger.transactions);v.metrics=metrics(s);return v;
    }
    function evidenceAPI(){return root.FactorLabEvidence||(typeof require==='function'?(()=>{try{return require('./evidence-data.js');}catch{return null;}})():null);}
    function evaluateDecisionGate(s,draft){
      if(old(s))return legacy.evaluateDecisionGate(s,draft);
      const original=draft?.evidenceRefs===undefined?[]:draft.evidenceRefs,reason=draft?.reason===undefined?'':draft.reason,normalized={...draft,reason:typeof reason==='string'&&reason.length<=500&&!reason.trim()?'allocation':reason,evidenceRefs:['E1']};
      let gate=legacy.evaluateDecisionGate(s._market,normalized);
      if(!Array.isArray(original)||original.length>24||original.some(ref=>typeof ref!=='string'||ref.length>120))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      const available=[],api=evidenceAPI(),view=api?publicView(s):null;
      if(original.some(id=>!available.includes(id)&&!api?.validateReference(view,id)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      if(draft?.evidenceSelections!==undefined){if(!Array.isArray(draft.evidenceSelections)||draft.evidenceSelections.length>24||draft.evidenceSelections.some(ref=>!api?.validateReference(view,ref)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};}
      return {...gate,status:gate.canConfirm?'ready':gate.status,recordComplete:gate.canConfirm&&!!original.length&&!!gate.falsifierIf,evidenceRefs:[...new Set(original)]};
    }
    function preview(s,weights=s.weights){return old(s)?oldEngine(s).preview(s,weights):simulateAllocation(s,weights);}
    function settle(s){
      if(s.results.some(r=>r.round===s.round))return;
      const r=s.roundState,l=s.ledger,rows=l.history.filter(h=>h.day>r.startDay),securityContributions=zeroContributions();for(const h of rows)for(const id of Object.keys(securityContributions))securityContributions[id]=money(securityContributions[id]+h.contributions[id]);
      const cashContribution=money(sum(rows.map(h=>h.cashContribution))),fee=money(sum(rows.map(h=>h.fee))),benchmarkReturn=s.benchmarkNav/r.benchmarkBefore-1,recordComplete=!!r.evidenceRefs.length&&!!r.falsifierIf.trim(),counterfactualNav=money(r.counterfactualCash+sum(l.holdings.map((h,i)=>r.counterfactualQuantities[i]*h.price))),a=attribution();a.sector=money(sum(Object.values(securityContributions)));a.cash=cashContribution;a.cost=-fee;
      s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:r.before,after:s.nav,returnValue:s.nav/r.before-1,benchmarkReturn,anchorReturn:s.anchorNav/r.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:a,securityContributions,cashContribution,fee,forecast:r.forecast,realizedForecast:benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat',reason:r.reason,weights:[...r.weights],factorWeights:[...r.factorWeights],reward:{points:recordComplete?20:0,badges:recordComplete?['badge.recordComplete']:[]},decisionPolicy:'securities',evidenceRefs:clone(r.evidenceRefs),evidenceSelections:clone(r.evidenceSelections),falsifierIf:r.falsifierIf,synthetic:true,attributionKind:'accounting-not-causal'});
    }
    function markDay(s){
      const l=s.ledger,m=s._market.history.at(-1),beforeNav=s.history.at(-1).nav,cashBefore=l.cash,priorPrices=l.holdings.map(h=>h.price),contributions=zeroContributions(),fee=l.pendingFee;
      const sectorReturns=SECTORS.map(()=>0);
      l.holdings.forEach((h,i)=>{const individual=.0012*Math.sin((s._market.day+i*11+s.seed%97)*.73)*(i%2?1:-1),change=m.sectorReturns[h.sectorIndex]+individual;h.price=money(Math.max(.01,h.price*(1+change)));contributions[h.id]=money(h.quantity*(h.price-priorPrices[i]));sectorReturns[h.sectorIndex]+=h.weightInBasket*(h.price/priorPrices[i]-1);});
      const cashInterest=money(cashBefore*m.cashRate);l.cash=money(l.cash+cashInterest);l.pendingFee=0;l.day=s._market.day;l.revision++;refresh(l);s.anchorCash=money(s.anchorCash*(1+m.cashRate));s.roundState.counterfactualCash=money(s.roundState.counterfactualCash*(1+m.cashRate));s.anchorNav=money(s.anchorCash+sum(l.holdings.map((h,i)=>h.price*s.anchorHoldings[i])));s.benchmarkNav=money(s.benchmarkNav*(1+sum(sectorReturns)/5));
      const cashContribution=money(l.nav-beforeNav-sum(Object.values(contributions))+fee),a=attribution();a.sector=money(sum(Object.values(contributions)));a.cash=cashContribution;a.cost=-fee;
      l.history.push(snapshotRow(l,{beforeNav,contributions,cashContribution,interest:cashInterest,roundingAdjustment:money(cashContribution-cashInterest),fee}));
      s.history.push({...clone(m),nav:l.nav,beforeNav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,cashBefore,holdingsBefore:SECTORS.map((_,j)=>money(sum(l.holdings.map((h,i)=>h.sectorIndex===j?h.quantity*priorPrices[i]:0)))),attribution:a,securityContributions:clone(contributions),sectorReturns,contributionReturns:[]});sync(s);
      if(['review','complete'].includes(s.phase))settle(s);
    }
    function reduce(s,a){
      if(old(s))return oldEngine(s).reduce(s,a);if(!a||typeof a!=='object'||s.commands.length>=4000)fail('invalidAction');
      const fields={lock:['type','weights','factorWeights','reason','forecast','evidenceRefs','evidenceSelections','falsifierIf','revision','snapshotId','transactionId'],advance:['type','days'],read:['type','id'],resume:['type'],next:['type']}[a.type];
      if(!fields)fail('invalidAction');
      const command=Object.fromEntries(fields.filter(k=>a[k]!==undefined).map(k=>[k,clone(a[k])])),n=clone(s);
      if(a.type==='lock'&&a.transactionId){const tx=s.ledger.transactions.find(t=>t.id===a.transactionId);if(tx){if(tx.requestHash!==hash(command))fail('transactionConflict');return s;}}
      if(a.type==='lock'){
        const gate=evaluateDecisionGate(s,a);if(!gate.canConfirm)fail(gate.error);const p=preview(s,a.weights);if(!p.ok)fail(p.error);
        if(a.revision!==undefined&&a.revision!==p.revision||a.snapshotId!==undefined&&a.snapshotId!==p.snapshotId)fail('staleSnapshot');
        if(a.transactionId!==undefined&&(typeof a.transactionId!=='string'||a.transactionId.length>120||!a.transactionId))fail('invalidTransaction');
        n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualQuantities:s.ledger.holdings.map(h=>h.quantity),counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:typeof a.reason==='string'?a.reason.trim():'',forecast:a.forecast,decisionPolicy:'securities',evidenceRefs:gate.evidenceRefs,evidenceSelections:(a.evidenceSelections||[]).map(ref=>evidenceAPI().resolveReference(publicView(s),ref)),falsifierIf:gate.falsifierIf};
        n._market=legacy.reduce(n._market,{...a,reason:n.roundState.reason||'allocation',evidenceRefs:['E1']});n.factorWeights=[...a.factorWeights];n.ledger.holdings.forEach((h,i)=>h.quantity=p.rows[i].quantity);n.ledger.cash=p.cash;n.ledger.pendingFee=p.fee;n.ledger.totalFees=money(n.ledger.totalFees+p.fee);n.ledger.revision++;
        n.ledger.transactions.push({id:a.transactionId||`TX-R${s.round}`,requestHash:hash(command),day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,cashBefore:s.cash,cashAfter:p.cash,rows:p.rows,weights:[...a.weights],buyRate:n.ledger.buyRate,sellRate:n.ledger.sellRate,snapshotId:p.snapshotId,revision:p.revision,signalTime:p.signalTime,decisionTime:p.decisionTime,executionTime:p.executionTime});sync(n);
      }else if(a.type==='advance'){
        if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');
        for(let i=0;i<a.days&&n.phase==='simulating';i++){n._market=legacy.reduce(n._market,{type:'advance',days:1});markDay(n);}
      }else if(a.type==='resume'){
        n._market=legacy.reduce(n._market,a);sync(n);if(['review','complete'].includes(n.phase))settle(n);
      }else if(a.type==='next'){
        n._market=legacy.reduce(n._market,a);n.roundState=null;sync(n);
      }else if(a.type==='read'){
        const api=evidenceAPI();if(!['E1','E2','E3',...s.events.map(x=>x.id)].includes(a.id)&&!api?.validateReference(publicView(s),a.id))fail('unknownEvidence');if(n.seen.includes(a.id))return s;n.seen.push(a.id);
      }else fail('invalidAction');
      n.commands.push(command);return n;
    }
    function serialize(s){if(old(s))return oldEngine(s).serialize(s);return {version:VERSION,schema:SCHEMA,basketVersion:BASKET_VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
    function restore(raw){let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch{fail('invalidSave');}if(!save||typeof save!=='object')fail('invalidSave');if(save.version!==VERSION){if(![base.VERSION,legacy.VERSION].includes(save.version))fail('invalidSave');return oldEngine(save).restore(save);}if(save.schema!==SCHEMA||save.basketVersion!==BASKET_VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let s=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)s=reduce(s,a);return s;}
    function metrics(s){if(old(s))return oldEngine(s).metrics(s);const result=base.metrics(s);result.attribution.cost=money(result.attribution.cost-s.ledger.pendingFee);return {...result,attributionKind:'accounting-not-causal'};}
    function coachContext(s,lang='zh-CN',draft){
      if(old(s))return oldEngine(s).coachContext(s,lang,draft);const v=publicView(s),en=lang==='en',context=legacy.coachContext({...s,version:legacy.VERSION},lang);context.riskDefinition=en?'Risk uses one synthetic calendar step per return and an illustrative 252-step annualization, not an observed exchange-day statistic. Fees are included; insufficient samples remain undefined.':'每个合成日步计算一次收益，252步年化是教学假设，不是真实交易日统计；计入费用，样本不足留空。';context.version=VERSION;context.asOf=v.asOf;context.decisionTime=v.decisionTime;context.portfolio={...context.portfolio,snapshotId:v.snapshotId,revision:v.revision,currency:'USD',holdings:v.ledger.holdings,totalFees:v.ledger.totalFees};context.model=en?'Synthetic security prices and fractional shares. Teaching issuers are fictional; no split or dividend events.':'合成证券价格与小数股；教学公司为虚构，无拆股或分红事件。';context.benchmark=en?'Five teaching sector baskets at 20% each; daily rebalance without fees.':'五个教学行业篮子各20%，每日再平衡、免费用。';context.decision=draft?clone(draft):clone(s.roundState);if(context.decision){delete context.decision.counterfactualQuantities;delete context.decision.counterfactualCash;}context.decisionGate=draft?evaluateDecisionGate(s,draft):null;context.recentHistory=v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}));return context;
    }
    const texts=clone(legacy.TEXTS);texts['zh-CN']['model.note']='虚构证券、小数股与合成价格的教学账本；不模拟真实交易所撮合、拆股或分红。';texts.en['model.note']='Teaching ledger with fictional securities, fractional shares and synthetic prices; no real exchange matching, splits or dividends.';
    return {...legacy,VERSION,TEXTS:texts,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),initial,reduce,preview,serialize,restore,publicView,coachContext,metrics,evaluateDecisionGate};
  }
  const api={VERSION,SCHEMA,BASKET_VERSION,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),createEngine,simulateAllocation,asOf};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.FactorLabLedger=api;if(root.FactorLabSimulation)root.FactorLabSimulation.createSecuritiesEngine=()=>createEngine(root.FactorLabSimulation);}
})(typeof window==='undefined'?globalThis:window);
