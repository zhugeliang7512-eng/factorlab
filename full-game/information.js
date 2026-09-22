(function(root){
 'use strict';
 function view(data,round,detailed){
  if(data.version!=='factorlab-information-v1'||!Number.isInteger(round)||round<1||round>6)throw Error('Invalid information version or round');
  const packet=data.rounds[round-1];
  if(!packet||packet.round!==round||packet.cutoff!==round-1||packet.points.length!==7)throw Error('Invalid information packet');
  const all=packet.points;
  if(all.some((p,i)=>!Number.isInteger(p.time)||p.time!==round-7+i||!Number.isInteger(p.availableAt)||p.availableAt<p.time||p.availableAt>packet.cutoff||!Number.isFinite(p.value)||p.value<=0))throw Error('Unavailable or invalid history');
  const points=(detailed?all:[all[0],all[3],all[6]]).map(p=>({...p}));
  let volatility=null;
  if(detailed){
   const returns=all.slice(1).map((p,i)=>p.value/all[i].value-1),mean=returns.reduce((a,b)=>a+b,0)/returns.length;
   volatility=Math.sqrt(returns.reduce((sum,r)=>sum+(r-mean)**2,0)/(returns.length-1));
  }
  return {round,cutoff:packet.cutoff,points,volatility,change:points.at(-1).value/points[0].value-1,version:data.version};
 }
 const I={view};
 if(typeof module!=='undefined')module.exports=I;else root.FACTORLAB_INFORMATION=I;
})(typeof window==='undefined'?globalThis:window);
