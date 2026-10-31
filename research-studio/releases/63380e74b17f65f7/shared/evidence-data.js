(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FactorLabEvidence=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='evidence-1.0', DAY=86400000, BASE=Date.parse('2024-01-02T16:00:00.000Z');
  const SOURCE='https://github.com/zhugeliang7512-eng/factorlab';
  const SOURCES={
    options:'https://www.optionseducation.org/referencelibrary/faq/general-information',
    volatility:'https://www.optionseducation.org/optionsoverview/options-pricing',
    secondary:'https://www.investor.gov/introduction-investing/investing-basics/glossary/secondary-market',
    validation:'https://rpc.cfainstitute.org/research/foundation/2024/investment-model-validation',
    ic:'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html',
    micron:'https://investors.micron.com/news/press-release/2024/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2024-03-20-2024/default.aspx'
  };
  const EXPLANATIONS={
    options:{'zh-CN':'OI 是未平仓合约数量，成交量是期间交易数量；每份合约同时有多空双方，OI 增加或 Call 活跃本身不能证明看涨。Bid/Ask 是报价，未保证成交。',en:'Open interest counts outstanding contracts; volume counts contracts traded during a period. Each contract has two sides: rising OI or active calls alone do not establish a bullish outlook. Bid/ask quotes do not guarantee execution.'},
    volatility:{'zh-CN':'IV 是由期权价格及定价模型反推的年化波动率，描述波动幅度而非方向；这里的 IV 是教学假设，不是市场估计。',en:'IV is an annualized volatility inferred from option prices through a pricing model. It concerns movement size, not direction; these IV figures are teaching assumptions, not market estimates.'},
    prices:{'zh-CN':'证券价格、组合资产金额、累计收益和成交额是不同口径。本图仅为教学证券报价；没有供应商资金流数据，不推断净流入。',en:'Security prices, portfolio value, cumulative return and turnover measure different things. This chart shows teaching security quotes only. No provider fund-flow data is available; no net inflow is inferred.'},
    fundamentals:{'zh-CN':'报告期不等于公布时间；只能使用决策时已经可得的数据。下面是虚构公司的教学财务报表，缺失值保留为空，不能当成真实公司估值。',en:'The reporting period is not the publication date. Use only information available at decision time. These are fictional-company teaching statements; missing values remain missing and are not real-company valuations.'},
    social:{'zh-CN':'发表记录只能证明观点被发表，不证明内容属实。核对作者、时间、原始出处及可验证主张；同源转载不是独立确认。',en:'A publication record establishes that a claim was made, not that it is true. Check author, time, original source and the specific claim; reposts are not independent confirmation.'},
    factors:{'zh-CN':'因子是可计算特征，不保证收益。样本不足时不报告有效性；没有真实基本面时 Value/Quality 未测。合成回测仅检验方法流程。',en:'Factors are measurable characteristics, not return guarantees. Insufficient samples do not establish efficacy. Value/Quality are untested without real fundamentals; synthetic backtests demonstrate a method only.'},
    allocation:{'zh-CN':'这里购买虚构教学证券，资金去向图表示组合敞口。现实二级市场交易发生在买卖双方之间，不能解释为资金直接进入发行公司的经营账户。',en:'You buy fictional teaching securities here; the allocation diagram describes portfolio exposure. Secondary-market transactions exchange existing securities between buyers and sellers, not direct operating funding for the issuer.'},
    backtest:{'zh-CN':'回测应按当时可得信息构建信号，并在信号可得之后执行。反复调参、存活样本及忽略费用可能夸大结果；一次盈利不证明能力。',en:'Build signals from information available at the time and execute only after availability. Repeated tuning, surviving-only samples and omitted costs can inflate results; one profitable outcome does not establish skill.'}
  };
  const copy=x=>JSON.parse(JSON.stringify(x));
  const iso=day=>new Date(BASE+day*DAY).toISOString();
  const round=(x,n=4)=>Number(x.toFixed(n));
  const hash=value=>{let a=2166136261,b=5381;for(const c of JSON.stringify(value)){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');};
  function asOf(view){const day=view?.day;if(!Number.isInteger(day)||day<0||day>10000)throw Error('invalidEvidenceTime');return iso(day);}
  function explain(key,lang='zh-CN'){return EXPLANATIONS[key]?.[lang==='en'?'en':'zh-CN']||'';}
  function record(view,id,type,instrumentIds,title,data,options={}){
    const at=asOf(view),out={schema:1,id,type,instrumentIds,source:'FactorLab authored teaching scenario',sourceUrl:SOURCE,observedAt:at,publishedAt:at,availableAt:at,periodStart:at,periodEnd:at,dataMode:'synthetic',derivation:'authored-scenario',units:{},day:view.day,title,data,...options};
    out.snapshotId=VERSION+':'+hash(out);return out;
  }
  function buildEvidence(view){
    asOf(view);const rows=[],holdings=view.ledger?.holdings||[],history=(view.ledger?.history||[]).filter(x=>Number.isInteger(x.day)&&x.day<=view.day),at=asOf(view);
    holdings.forEach(h=>{
      const points=history.filter(x=>Number.isFinite(x.prices?.[h.id])).map(x=>({day:x.day,time:iso(x.day),value:x.prices[h.id],origin:'ledger observation'}));
      if(!points.length&&Number.isFinite(h.price))points.push({day:view.day,time:at,value:h.price});
      const initial=history.find(x=>x.day===0)?.prices?.[h.id];
      if(Number.isFinite(initial))for(let day=-1;day>=-30;day--)points.unshift({day,time:iso(day),value:round(initial*(1+.025*Math.sin(day*.21)+.012*Math.sin(day*.73)),6),origin:'authored pre-start warmup'});
      rows.push(record(view,'PRICE-'+h.id+'-D'+view.day,'price',[h.id],{'zh-CN':h.symbol+' 教学价格',en:h.symbol+' teaching price'},{points,priceBasis:'unadjusted synthetic quote; no dividends or splits',warmup:{from:-30,to:-1,method:'authored trigonometric path anchored to initial quote; not market history or ledger performance'},volume:null,turnover:null,netFundFlow:null},{periodStart:points[0]?.time||at,units:{value:'USD/share'},derivation:'authored-prestart-warmup-then-ledger-prices',interpretation:{'zh-CN':EXPLANATIONS.prices['zh-CN']+' D−30 至 D−1 是独立编写的课前练习序列，D0 起与账本报价一致。',en:EXPLANATIONS.prices.en+' D−30 to D−1 are authored warmup observations; from D0 onward quotes match the ledger.'}}));
    });
    const underlyings=holdings.filter((h,i)=>holdings.findIndex(x=>x.sectorId===h.sectorId)===i);
    underlyings.forEach(h=>{
      const expiry=iso(view.day+30).slice(0,10),spot=h.price,optionRows=[];
      for(const ratio of [.9,1,1.1])for(const kind of ['Call','Put']){
        const strike=round(spot*ratio,2),intrinsic=Math.max(0,kind==='Call'?spot-strike:strike-spot),timeValue=spot*(ratio===1?.028:.016),mid=intrinsic+timeValue;
        const rowId=h.id+'-'+expiry+'-'+kind+'-'+strike;
        optionRows.push({id:rowId,contractId:rowId,underlying:h.id,expiry,kind,side:kind,strike,bid:round(mid*.96,2),ask:round(mid*1.04,2),volume:Math.round(240+(ratio===1?180:40)+view.day*3),openInterest:Math.round(1800+(ratio===1?900:300)+view.day*11),iv:round(.28+Math.abs(1-ratio)*.5,3),delta:null,observedAt:at,openInterestAsOf:iso(view.day-1),contractMultiplier:100});
      }
      rows.push(record(view,'OPTIONS-'+h.id+'-D'+view.day,'options',[h.id],{'zh-CN':h.symbol+' 期权教学快照',en:h.symbol+' teaching option snapshot'},{rows:optionRows,provider:'authored teaching snapshot',pricingMethod:'illustrative intrinsic value plus authored time value; IV not calibrated',tradable:false},{units:{strike:'USD/share',bid:'USD/share',ask:'USD/share',volume:'contracts/session',openInterest:'outstanding contracts',iv:'annual fraction'},interpretation:EXPLANATIONS.options,conceptSourceUrl:SOURCES.options}));
    });
    const reportDay=Math.floor(view.day/30)*30-4,periodEnd=iso(reportDay-15),periodStart=iso(reportDay-105),publishedAt=iso(reportDay);
    const fundamentals=holdings.map((h,i)=>{
      const revenue=round(90+i*17+Math.floor(view.day/30)*5,2),profit=i===holdings.length-1?null:round(revenue*(.06+(i%4)*.025),2),equity=round(80+i*12,2),eps=profit===null?null:round(profit/10,4);
      return {id:h.id+'-REPORT-'+reportDay,instrumentId:h.id,name:h.name,symbol:h.symbol,revenue,profit,netProfit:profit,equity,sharesMillions:10,eps,pe:eps&&eps>0?round(h.price/eps,2):null,roe:profit===null?null:round(profit/equity,4),periodStart,periodEnd,publishedAt,reportAvailableAt:publishedAt,priceObservedAt:at,availableAt:at,missing:profit===null?['netProfit','eps','pe','roe']:[],roeBasis:'period net income / period-end equity; teaching proxy, not annualized',peBasis:'current teaching price / period EPS; not TTM'};
    });
    rows.push(record(view,'FUNDAMENTALS-D'+view.day,'fundamentals',holdings.map(h=>h.id),{'zh-CN':'公司财务与估值 · 虚构教学报告',en:'Company financials & valuation · fictional reports'},{rows:fundamentals},{periodStart,periodEnd,publishedAt,availableAt:at,derivation:'authored-report-values-and-ratios-calculated-with-current-visible-quote',units:{revenue:'USD million/period',netProfit:'USD million/period',equity:'USD million',eps:'USD/share/period',pe:'x, period EPS basis',roe:'fraction/period'},interpretation:EXPLANATIONS.fundamentals}));
    const first=holdings[0]?.id,related=first?[first]:[],report=fundamentals[0];
    rows.push(record(view,'NEWS-D'+view.day,'news',related,{'zh-CN':'教学资讯：财报数字与解读',en:'Teaching news: statement numbers and interpretation'},{author:{'zh-CN':'FactorLab 教学编辑（虚构）',en:'FactorLab teaching editor (fictional)'},text:{'zh-CN':report?'教学公司本期收入 '+report.revenue+' 百万美元，净利润 '+report.netProfit+' 百万美元。收入是经营规模指标，不能单独判断股票是否便宜。':'当前没有可用公司财务数据。',en:report?'The teaching company reports revenue of USD '+report.revenue+' million and net income of USD '+report.netProfit+' million for this period. Revenue alone cannot establish that a stock is cheap.':'No company statements are available.'},sourceStatus:'authored-teaching-material',verificationStatus:'fictional scenario, not a real publication',originId:'TEACHING-REPORT-'+reportDay,linkedEvidenceId:'FUNDAMENTALS-D'+view.day,sourceUrl:SOURCE},{interpretation:EXPLANATIONS.social}));
    rows.push(record(view,'SOCIAL-D'+view.day,'social',related,{'zh-CN':'教学社媒：待核查的订单说法',en:'Teaching social post: an unverified order claim'},{author:{'zh-CN':'练习账号 A（虚构，不对应真实人物）',en:'Practice account A (fictional, not a real person)'},text:{'zh-CN':'听说供应链订单可能改善。我尚未看到公司公告，需要核对订单是否变成收入，以及目前估值是否已反映乐观预期。',en:'I heard that supply-chain orders may improve. I have not seen a company announcement; check conversion into revenue and whether valuation already reflects optimism.'},sourceStatus:'authored-teaching-material',verificationStatus:'unverified claim within fictional scenario',originId:'TEACHING-RUMOR-'+Math.floor(view.day/30),sourceUrl:SOURCE,repostsAreIndependent:false},{interpretation:EXPLANATIONS.social}));
    const factorRows=holdings.map(h=>{
      const p=history.filter(x=>Number.isFinite(x.prices?.[h.id])).slice(-21),rs=p.slice(1).map((x,i)=>x.prices[h.id]/p[i].prices[h.id]-1),mean=rs.length?rs.reduce((a,b)=>a+b,0)/rs.length:0;
      return {id:h.id,instrumentId:h.id,momentum:p.length>=21?round(p.at(-1).prices[h.id]/p[0].prices[h.id]-1,6):null,lowVol:rs.length>=20?-Math.sqrt(rs.reduce((s,r)=>s+(r-mean)**2,0)/(rs.length-1)):null,value:null,quality:null,samples:rs.length,requiredSamples:20,status:'Value/Quality untested in this daily price-only panel; four-factor synthetic research is a separate dataset'};
    });
    for(const key of ['momentum','lowVol']){const valid=factorRows.filter(r=>Number.isFinite(r[key])).sort((a,b)=>b[key]-a[key]);valid.forEach(r=>{r[key+'Rank']=1+valid.filter(x=>x[key]>r[key]).length;});}
    rows.push(record(view,'FACTORS-D'+view.day,'factors',holdings.map(h=>h.id),{'zh-CN':'当前可见价格因子',en:'Factors from currently visible prices'},{rows:factorRows,window:20,frequency:'synthetic daily steps',valueStatus:'untested',qualityStatus:'untested'},{periodStart:iso(Math.max(0,view.day-20)),units:{momentum:'return fraction / 20 steps',lowVol:'negative daily sample standard deviation'},derivation:'computed-from-visible-prices',interpretation:EXPLANATIONS.factors,conceptSourceUrl:SOURCES.validation}));
    return rows;
  }
  function select(records,id,selection={}){
    const record=records.find(r=>r.id===id);if(!record)throw Error('evidenceUnavailable');
    if(!selection||Array.isArray(selection)||Object.keys(selection).some(k=>!['from','to','rowId'].includes(k)))throw Error('invalidEvidenceSelection');
    const ref={schema:1,id:record.id,snapshotId:record.snapshotId,day:record.day,selection:{},type:record.type,instrumentIds:copy(record.instrumentIds),title:copy(record.title),source:record.source,sourceUrl:record.sourceUrl,observedAt:record.observedAt,publishedAt:record.publishedAt,availableAt:record.availableAt,periodStart:record.periodStart,periodEnd:record.periodEnd,dataMode:record.dataMode,derivation:record.derivation,units:copy(record.units),data:copy(record.data)};
    if(selection.rowId!==undefined){
      if(selection.from!==undefined||selection.to!==undefined||typeof selection.rowId!=='string')throw Error('invalidEvidenceSelection');
      const row=record.data.rows?.find(r=>r.id===selection.rowId);if(!row)throw Error('invalidEvidenceSelection');ref.selection={rowId:row.id};ref.data={rows:[copy(row)]};
    }else if(selection.from!==undefined||selection.to!==undefined){
      const {from,to}=selection,points=record.data.points;
      if(!Number.isInteger(from)||!Number.isInteger(to)||from>to||!points?.some(p=>p.day===from)||!points.some(p=>p.day===to))throw Error('invalidEvidenceSelection');
      ref.selection={from,to};ref.data={points:copy(points.filter(p=>p.day>=from&&p.day<=to)),priceBasis:record.data.priceBasis};ref.periodStart=iso(from);ref.periodEnd=iso(to);
    }
    return ref;
  }
  function resolve(records,ref){
    if(!ref||ref.schema!==1||typeof ref.snapshotId!=='string')throw Error('invalidEvidenceReference');
    const original=records.find(r=>r.id===ref.id);if(!original||original.snapshotId!==ref.snapshotId)throw Error('staleEvidenceReference');
    return select(records,ref.id,ref.selection);
  }
  function viewAt(view,day){
    if(!Number.isInteger(day)||day<0||day>view.day)throw Error('evidenceUnavailable');
    const out={...view,day};if(!view.ledger)return out;
    const history=view.ledger.history.filter(r=>r.day<=day),last=history.at(-1);if(!last||last.day!==day)throw Error('evidenceUnavailable');
    out.ledger={...view.ledger,history,holdings:view.ledger.holdings.map(h=>({...h,price:last.prices[h.id]}))};return out;
  }
  function resolveReference(view,ref){return resolve(buildEvidence(viewAt(view,ref.day)),ref);}
  function validateReference(view,ref){try{if(typeof ref==='string'){const day=Number(ref.match(/-D(\d+)$/)?.[1]);return buildEvidence(viewAt(view,day)).some(r=>r.id===ref);}resolveReference(view,ref);return true;}catch{return false;}}
  function importRecords(records,cutoff){
    if(!Array.isArray(records)||records.length>1000||!Number.isFinite(Date.parse(cutoff)))throw Error('invalidProviderData');
    const checkTimes=value=>{if(!value||typeof value!=='object')return;for(const [key,child] of Object.entries(value)){if(['observedAt','publishedAt','availableAt','openInterestAsOf'].includes(key)&&(!Number.isFinite(Date.parse(child))||Date.parse(child)>Date.parse(cutoff)))throw Error('invalidProviderData');if(child&&typeof child==='object')checkTimes(child);}};
    return records.map(r=>{
      const required=['id','type','instrumentIds','source','sourceUrl','observedAt','publishedAt','availableAt','dataMode','derivation','units','data','snapshotId'];
      if(!r||required.some(k=>!(k in r))||!['historical','delayed','realtime','synthetic'].includes(r.dataMode)||!Array.isArray(r.instrumentIds)||!/^https:\/\//.test(r.sourceUrl)||!['observedAt','publishedAt','availableAt'].every(k=>Number.isFinite(Date.parse(r[k]))&&Date.parse(r[k])<=Date.parse(cutoff))||Date.parse(r.availableAt)<Date.parse(r.publishedAt))throw Error('invalidProviderData');
      checkTimes(r.data);
      if(r.type==='options'&&(!Array.isArray(r.data.rows)||r.data.rows.some(x=>!['id','underlying','expiry','kind','strike','bid','ask','volume','openInterest','iv'].every(k=>k in x)||!['Call','Put'].includes(x.kind)||!['strike','bid','ask','volume','openInterest','iv'].every(k=>Number.isFinite(x[k])&&x[k]>=0)||x.bid>x.ask||x.strike===0)))throw Error('invalidProviderData');
      return copy(r);
    });
  }
  return {VERSION,SOURCES,EXPLANATIONS,asOf,explain,buildEvidence,select,resolve,resolveReference,validateReference,viewAt,importRecords};
});
