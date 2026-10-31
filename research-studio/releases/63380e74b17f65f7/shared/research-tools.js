(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.FactorLabResearchTools=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const weightsSchema={type:'array',items:{type:'number'},minItems:6,maxItems:6,description:'Five sector weights then cash; fractions sum to 1; each sector <= 0.4.'};
  const definitions=[
    ['get_visible_evidence','Read only currently available versioned evidence.',{}],
    ['get_portfolio_snapshot','Read confirmed cash, securities, and revision.',{}],
    ['get_instrument_details','Read one teaching security and its related evidence.',{instrumentId:{type:'string'}}],
    ['run_backtest','Run the separate 36-month synthetic method exercise; does not change holdings.',{factorWeights:{type:'array',items:{type:'number'},minItems:4,maxItems:4}}],
    ['simulate_allocation','Calculate unconfirmed security amounts, quantities, cash and fees at the fixed current snapshot.',{weights:weightsSchema}],
    ['compare_scenarios','Compare two unconfirmed allocation plans at identical prices.',{weights:weightsSchema,alternative:weightsSchema}],
    ['propose_allocation_draft','Return an unconfirmed allocation draft for explicit learner application; never trades.',{weights:weightsSchema}]
  ].map(([name,description,properties])=>({type:'function',function:{name,description,parameters:{type:'object',properties,required:Object.keys(properties),additionalProperties:false}}}));
  for(const tool of definitions.filter(d=>['simulate_allocation','propose_allocation_draft'].includes(d.function.name))){tool.function.parameters.required=[];tool.function.parameters.properties.sectorId={type:'string',enum:['semiconductor','robotics','materials','energy','digital']};tool.function.parameters.properties.targetWeight={type:'number',minimum:0,maximum:.4};tool.function.parameters.properties.preset={type:'string',enum:['equal-sectors']};tool.function.parameters.properties.cashWeight={type:'number',minimum:0,maximum:1};tool.function.description+=' With no arguments use the learner current editing allocation. Prefer sectorId and targetWeight (fraction, e.g. 0.2) for one-sector changes, moving the difference to/from cash while preserving other edited sector weights. For an explicitly requested equal-sector example use preset equal-sectors and cashWeight. Alternatively supply six weights in order semiconductor, robotics, materials, energy, digital, cash.';}
  const comparisonDefinition=definitions.find(d=>d.function.name==='compare_scenarios').function;
  comparisonDefinition.parameters.required=[];comparisonDefinition.description+=' With no arguments compare actual confirmed holdings (no trade, zero fee) with the learner current editing allocation. Use explicit weights and alternative only when comparing two different proposed plans.';
  function validWeights(weights){return Array.isArray(weights)&&weights.length===6&&weights.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&weights.slice(0,5).every(v=>v<=.4+1e-10)&&Math.abs(weights.reduce((s,v)=>s+v,0)-1)<1e-7;}
  function material(record){
    if(!record.data?.points)return clone(record);
    const points=record.data.points,values=points.map(p=>p.value);
    return {...clone(record),data:{...record.data,points:points.length?[points[0],points.at(-1)]:[],rangeSummary:{samples:points.length,min:Math.min(...values),max:Math.max(...values),first:values[0],last:values.at(-1)},representation:'range endpoints and exact range summary; open the reference for every observation'}};
  }
  function card(result){
    if(result.error)return {error:result.error};
    if(result.instrument&&result.evidence)return {snapshotId:result.snapshotId,instrument:clone(result.instrument),references:result.evidence.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.preview)return {...result,preview:card(result.preview)};
    if(result.first)return {...clone(result),first:card(result.first),alternative:card(result.alternative)};
    if(result.records)return {snapshotId:result.snapshotId,asOf:result.asOf,evidenceCount:result.records.length,references:result.records.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.holdings)return {snapshotId:result.snapshotId,revision:result.revision,nav:result.nav,cash:result.cash,invested:result.invested,totalFees:result.totalFees,currency:result.currency,securityCount:result.holdings.length,sectorOrder:result.sectorOrder,sectorWeights:result.sectorWeights};
    if(result.rows)return Object.fromEntries(['ok','snapshotId','revision','weights','cash','fee','buys','sells','after','concentration','sectorChanges','assumptions'].filter(k=>k in result).map(k=>[k,clone(result[k])]));
    if(result.months)return {dataMode:result.dataMode,label:result.label,sampleCount:result.sampleCount,preferences:result.preferences,strategy:result.strategy,benchmark:result.benchmark,factors:result.factors,executionDifferences:result.executionDifferences};
    return clone(result);
  }
  function compactResult(answer){
    return {...clone(answer),...(answer.tools?{tools:answer.tools.map(t=>({...t,result:card(t.result||{})}))}:{}),...(answer.allocationDraft?{allocationDraft:card(answer.allocationDraft)}:{})};
  }
  function create({engine,evidence,research},body){
    const state=engine.restore(body.save),view=engine.publicView(state),records=evidence.buildEvidence(view);
    const attachments=(body.attachments||[]);
    if(!Array.isArray(attachments)||attachments.length>8)throw Error('attachments');
    const selected=attachments.map(ref=>{const canonical=evidence.resolveReference(view,ref);let hash=2166136261;for(const char of canonical.id+'|'+canonical.snapshotId+'|'+JSON.stringify(canonical.selection))hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return {...canonical,token:'REF'+hash.toString(16).padStart(8,'0')};});
    const snapshotId=view.ledger?.snapshotId||'legacy-D'+view.day,revision=view.ledger?.revision??view.day;
    const editingWeights=body.decisionDraft?.weights===undefined?[...view.weights]:clone(body.decisionDraft.weights);
    function preview(weights){
      if(!validWeights(weights))throw Error('invalid_weights');
      if(!view.ledger)throw Error('legacy_read_only');
      if(view.phase!=='decision')throw Error('allocation_locked');
      const result=engine.preview(state,weights);
      if(result.ok===false)throw Error(result.error||'invalid_allocation');
      const sectorChanges=weights.slice(0,5).map((targetWeight,i)=>({sectorId:['semiconductor','robotics','materials','energy','digital'][i],confirmedWeight:view.weights[i],targetWeight,weightChange:Math.round((targetWeight-view.weights[i])*1e6)/1e6,netTradeAmount:Math.round(result.rows.filter(r=>r.sectorIndex===i).reduce((total,r)=>total+r.delta,0)*1e6)/1e6}));
      return {...clone(result),snapshotId,revision,weights:[...weights],concentration:Math.max(...weights.slice(0,5)),sectorChanges,assumptions:{dataMode:'synthetic',currency:view.ledger.currency,prices:'fixed current teaching snapshot',tradeBaseline:'confirmed holdings, not the previous editing draft',futureReturns:'not estimated',status:'draft'}};
    }
    function requestedWeights(args){
      if(args.weights!==undefined){if(['sectorId','targetWeight','preset','cashWeight'].some(k=>args[k]!==undefined))throw Error('ambiguous_weights');return args.weights;}
      if(args.preset!==undefined){
        if(args.sectorId!==undefined||args.targetWeight!==undefined)throw Error('ambiguous_weights');
        if(args.preset!=='equal-sectors'||!Number.isFinite(args.cashWeight)||args.cashWeight<0||args.cashWeight>1)throw Error('invalid_preset');
        return [...Array(5).fill((1-args.cashWeight)/5),args.cashWeight];
      }
      if(args.cashWeight!==undefined)throw Error('invalid_preset');
      if(!validWeights(editingWeights))throw Error('invalid_weights');
      if(args.sectorId===undefined&&args.targetWeight===undefined)return [...editingWeights];
      const index=['semiconductor','robotics','materials','energy','digital'].indexOf(args.sectorId);
      if(index<0||!Number.isFinite(args.targetWeight))throw Error('Provide sectorId and targetWeight as a fraction, or six fractional weights summing to 1');
      const weights=[...editingWeights];weights[5]+=weights[index]-args.targetWeight;weights[index]=args.targetWeight;return weights;
    }
    function execute(name,args={}){
      const definition=definitions.find(d=>d.function.name===name);
      if(!definition)throw Error('tool_not_allowed');
      if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!Object.hasOwn(definition.function.parameters.properties,k)))throw Error('invalid_arguments');
      if(definition.function.parameters.required.some(k=>!Object.hasOwn(args,k)))throw Error('invalid_arguments');
      if(name==='get_visible_evidence')return {snapshotId,asOf:view.asOf||view.ledger?.asOf,records:records.map(material),selected:selected.map(material)};
      if(name==='get_portfolio_snapshot')return clone(view.ledger?{...view.ledger,history:view.ledger.history.slice(-6),sectorOrder:['semiconductor','robotics','materials','energy','digital','cash'],sectorWeights:view.weights,sectorAmounts:view.weights.map(w=>w*view.nav)}:{status:'legacy_read_only',nav:view.nav,weights:view.weights});
      if(name==='get_instrument_details'){
        if(typeof args.instrumentId!=='string'||args.instrumentId.length>80)throw Error('invalid_instrument');
        const row=view.ledger?.holdings?.find(r=>[r.instrumentId,r.id,r.symbol].includes(args.instrumentId));
        if(!row)throw Error('invalid_instrument');
        return clone({snapshotId,instrument:row,evidence:records.filter(r=>r.instrumentIds.includes(args.instrumentId))});
      }
      if(name==='run_backtest'){
        const f=args.factorWeights;
        if(!Array.isArray(f)||f.length!==4||f.some(v=>!Number.isFinite(v)||v<0||v>100)||!f.some(v=>v>0))throw Error('invalid_factors');
        const result=research.analyze(Object.fromEntries(['Momentum','Value','Quality','LowVol'].map((id,i)=>[id,f[i]])));
        return {dataMode:'synthetic',separateHistoricalExercise:true,executionDifferences:{sectorCap:.5,tradingFee:0},...result};
      }
      if(name==='simulate_allocation')return preview(requestedWeights(args));
      if(name==='compare_scenarios'){
        if(!view.ledger)throw Error('legacy_read_only');
        const first=args.weights===undefined?{ok:true,status:'confirmed',snapshotId,revision,weights:[...view.weights],cash:view.ledger.cash,fee:0,buys:0,sells:0,after:view.nav,concentration:Math.max(...view.weights.slice(0,5))}:preview(args.weights);
        const alternative=preview(args.alternative??requestedWeights({})),rounded=n=>Math.round(n*1e6)/1e6;
        return {snapshotId,first,alternative,changes:alternative.weights.map((w,i)=>rounded(w-first.weights[i])),cashChange:rounded(alternative.cash-first.cash),feeChange:rounded(alternative.fee-first.fee)};
      }
      const weights=requestedWeights(args);return {schema:1,status:'draft',snapshotId,revision,weights:[...weights],preview:preview(weights)};
    }
    return {view,records,selected,snapshotId,revision,editingWeights,execute};
  }
  const evidenceRef=r=>({schema:1,id:r.id,...(r.token?{token:r.token}:{}),snapshotId:r.snapshotId,day:r.day,selection:r.selection});
  function demo(body,deps){
    deps=deps||{engine:root.FactorLabLedger.createEngine(root.FactorLabSimulation),evidence:root.FactorLabEvidence,research:root.InvestigationResearch};
    const runner=create(deps,body),en=body.lang==='en',tools=[];
    const invoke=(name,args={})=>{const result=runner.execute(name,args);tools.push({id:'demo-'+tools.length,name,status:'complete',result:card(result)});return result;};
    const question=body.question||'',sectorPatterns=[/半导体|semicon/i,/机器人|robot/i,/材料|material/i,/能源|energy/i,/\bAI\b|人工智能|算力/i];
    const sector=sectorPatterns.findIndex(p=>p.test(question)),percent=question.match(/(\d+(?:\.\d+)?)\s*[%％]/);
    const sectorNames=en?['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure','Cash']:['半导体','机器人','先进材料','清洁能源','AI 算力','现金'];
    const money=v=>Number.isFinite(v)?v.toFixed(2):'—',pct=v=>(v*100).toFixed(1).replace(/\.0$/,'')+'%';
    const cashTarget=question.match(/(\d+(?:\.\d+)?)\s*[%％]\s*(?:的)?\s*(?:现金|cash)/i)||question.match(/(?:现金|cash)\s*(?:为|at|of|:)?\s*(\d+(?:\.\d+)?)\s*[%％]/i);
    let allocationDraft,summary='',detail='',allocationQuestion=false;
    const editable=!!runner.view.ledger&&runner.view.phase==='decision';
    if(editable&&/等额|等权|equal.sector/i.test(question)&&cashTarget){
      const cashWeight=Number(cashTarget[1])/100;
      allocationDraft=invoke('propose_allocation_draft',{preset:'equal-sectors',cashWeight});allocationQuestion=true;
      const p=allocationDraft.preview;
      summary=en?`An equal-sector example: each sector ${pct(allocationDraft.weights[0])}, cash ${pct(cashWeight)}. Estimated fees USD ${money(p.fee)}; cash after fees USD ${money(p.cash)}.`:`等额示例：五个行业各 ${pct(allocationDraft.weights[0])}，现金 ${pct(cashWeight)}。预计费用 $${money(p.fee)}，扣费后现金 $${money(p.cash)}。`;
      detail=en?'This is a starting example, not a forecast or a personalized recommendation. Apply it to the editor, adjust the percentages, and confirm separately when ready.':'这是供你调整的入门示例。可以先应用，再修改比例，最后由你确认成交。';
    }else if(editable&&sector>=0&&percent){
      const args={sectorId:['semiconductor','robotics','materials','energy','digital'][sector],targetWeight:Number(percent[1])/100};
      const p=invoke('simulate_allocation',args);allocationDraft=invoke('propose_allocation_draft',args);allocationQuestion=true;
      summary=en?`${sectorNames[sector]} becomes ${pct(args.targetWeight)}. Estimated fees USD ${money(p.fee)}; remaining cash USD ${money(p.cash)}.`:`${sectorNames[sector]}调整为 ${pct(args.targetWeight)}。预计费用 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'The other edited sectors stay unchanged; the difference goes to or comes from cash. These are current-price calculations, not future returns.':'其他正在编辑的行业比例保持不变，差额由现金补足或收回。金额按当前价格计算，不预测未来收益。';
    }else if(editable&&/比较|对比|compare/i.test(question)&&/配置|持仓|调整|allocation|portfolio|holding/i.test(question)){
      const comparison=invoke('compare_scenarios');allocationQuestion=true;
      const changes=comparison.changes.map((delta,i)=>Math.abs(delta)<1e-6?'':`${sectorNames[i]} ${delta>0?'+':''}${pct(delta)}`).filter(Boolean).join(en?', ':'、');
      summary=en?`${changes||'Your draft matches the confirmed allocation'}. Estimated fees USD ${money(comparison.alternative.fee)}; cash changes by USD ${money(comparison.cashChange)} to USD ${money(comparison.alternative.cash)}.`:`${changes||'当前草稿与已确认配置相同'}。预计费用 $${money(comparison.alternative.fee)}，现金变化 $${money(comparison.cashChange)}，调整后为 $${money(comparison.alternative.cash)}。`;
      detail=en?'Weight changes are percentage points. This compares keeping the confirmed holdings with executing your draft at the same current prices. No trade has been placed.':'比例变化按百分点计算。比较的是保持现有持仓与按当前价格执行草稿的差别，尚未成交。';
    }else if(editable&&/配置|持仓|费用|allocation|portfolio|holding|fees/i.test(question)){
      const p=invoke('simulate_allocation');allocationQuestion=true;
      const largest=p.weights.slice(0,5).reduce((best,w,i)=>w>p.weights[best]?i:best,0);
      summary=en?`Your largest sector is ${sectorNames[largest]} at ${pct(p.weights[largest])}; target cash is ${pct(p.weights[5])}. Estimated fees USD ${money(p.fee)} leave USD ${money(p.cash)} in cash.`:`当前草稿中${sectorNames[largest]}占比最高，为 ${pct(p.weights[largest])}；目标现金占 ${pct(p.weights[5])}。确认后的预计费用为 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'A sector combines several teaching companies. Cash is the uninvested part of your virtual budget. Changing the percentages changes where the budget goes; it does not predict returns.':'行业比例决定分给这一类公司的资金，现金是暂时没有买入证券的部分。你可以直接调整比例，下方金额会随之变化。';
    }
    if(!tools.length){
      const result=invoke(runner.selected.length?'get_visible_evidence':'get_portfolio_snapshot');
      summary=en?(runner.selected.length?'This material is attached. Ask about its price, option activity or assumptions.':`Your confirmed assets are USD ${money(result.nav)}, including USD ${money(result.cash)} cash.`):(runner.selected.length?'材料已带入对话，可以继续问其中的价格、期权数据或假设。':`已确认资产为 $${money(result.nav)}，其中现金 $${money(result.cash)}。`);
      detail=en?'Offline mode can calculate allocation changes. Try “semiconductors to 15%” or use the allocation shortcuts.':'离线助手可以计算配置变化。试试“半导体调到15%”，或使用配置页的快捷问题。';
    }
    const referenceRecords=allocationQuestion?[]:runner.selected.length?runner.selected:runner.records.slice(0,1);
    return {summary,detail,references:referenceRecords.map(r=>r.token||r.id),referenceSelections:referenceRecords.map(r=>evidenceRef(r)),mode:'example',tools,...(allocationDraft?{allocationDraft:card(allocationDraft)}:{})};
  }

  return {create,demo,definitions,validWeights,card,material,compactResult};
});
