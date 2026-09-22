(function(root){
 'use strict';
 const reasons={trend:'关注历史走势',buffer:'优先保留缓冲',uncertain:'信息不足，控制暴露',maintain:'维持原有计划'};
 const initial=()=>({node:null,phase:'choose',draft:null,research:[],reasons:{}});
 function reduce(state,action,D){
  const node=D.nodes[state.node];
  if(action.type==='strategy'&&state.phase==='choose'&&Object.hasOwn(D.strategies,action.key))return {...initial(),node:action.key+':',phase:'plan'};
  if(action.type==='research'&&state.phase==='plan'&&state.research.length<3&&!state.research.includes(node.round))return {...state,research:[...state.research,node.round]};
  if(action.type==='reason'&&state.phase==='plan'&&(action.key===null||Object.hasOwn(reasons,action.key))){
   const next={...state.reasons};if(action.key===null)delete next[node.round];else next[node.round]=action.key;
   return {...state,reasons:next};
  }
  if(action.type==='decision'&&state.phase==='plan'&&Object.hasOwn(node.options,action.key))return {...state,draft:action.key};
  if(action.type==='execute'&&state.phase==='plan'&&Object.hasOwn(node.options,state.draft))return {...state,node:node.options[state.draft].next,phase:'result',draft:null};
  if(action.type==='next'&&state.phase==='result')return {...state,phase:node.round>D.rounds?'final':'plan'};
  if(action.type==='replay'&&state.phase==='final')return initial();
  return state;
 }
 function ledger(D,id){
  const records=[];
  for(let n=D.nodes[id];n?.record;n=D.nodes[n.parent])records.unshift(n.record);
  return records;
 }
 function mission(D,node){
  const r=node.record,event=D.events[r.round-1],before=D.nodes[node.parent].weights,cap=D.strategies[node.strategy].cap;
  const passed=event.mission==='cap'?r.weights[4]<=cap+1e-10:event.mission==='cash'?r.weights[5]>=before[5]-1e-10:r.decision==='hold';
  return {passed,title:event.mission_title,text:event.mission_text};
 }
 function debrief(D,id){
  const list=ledger(D,id),node=D.nodes[id],cap=D.strategies[node.strategy].cap;
  const counts=Object.values(list.reduce((a,r)=>(a[r.decision]=(a[r.decision]||0)+1,a),{}));
  return {rounds:list.length,budget:list.filter(r=>r.weights[4]<=cap+1e-10).length,
   missions:list.filter(r=>mission(D,D.nodes[r.next]).passed).length,
   consistency:Math.max(0,...counts),adaptations:list.slice(1).filter((r,i)=>r.decision!==list[i].decision).length,
   turning:list.reduce((a,r)=>!a||r.return_value<a.return_value?r:a,null),
   badges:[...new Set(list.filter(r=>r.reward.quality==='recognized').map(r=>r.reward.badge))]};
 }
 function serialize(s,D){return JSON.stringify({...s,version:D.version,saveSchema:2,informationVersion:'factorlab-information-v1'});}
 function restore(raw,D){
  try{
   const s=JSON.parse(raw);if(!s||s.version!==D.version||s.saveSchema!==2||s.informationVersion!=='factorlab-information-v1')return null;
   if(!Array.isArray(s.research)||s.research.length>3||!s.reasons||typeof s.reasons!=='object'||Array.isArray(s.reasons))return null;
   if(s.phase==='choose'&&s.node===null)return s.draft===null&&s.research.length===0&&Object.keys(s.reasons).length===0?initial():null;
   const n=D.nodes[s.node];if(!n)return null;
   if(!((s.phase==='plan'&&n.round<=D.rounds)||(s.phase==='result'&&n.record)||(s.phase==='final'&&n.round===D.rounds+1)))return null;
   if(s.draft!==null&&!(s.phase==='plan'&&Object.hasOwn(n.options,s.draft)))return null;
   const latest=s.phase==='plan'?n.round:n.round-1;
   if(s.research.some((r,i)=>!Number.isInteger(r)||r<1||r>latest||(i>0&&r<=s.research[i-1])))return null;
   if(Object.entries(s.reasons).some(([r,key])=>!Number.isInteger(Number(r))||String(Number(r))!==r||Number(r)<1||Number(r)>latest||typeof key!=='string'||!Object.hasOwn(reasons,key)))return null;
   return {node:s.node,phase:s.phase,draft:s.draft,research:s.research,reasons:s.reasons};
  }catch{return null;}
 }
 function sanitizeMeta(meta,D){
  const terminal=id=>D.nodes[id]?.round===D.rounds+1;
  return {paths:[...new Set(Array.isArray(meta?.paths)?meta.paths:[])].filter(terminal),
   history:(Array.isArray(meta?.history)?meta.history:[]).filter(r=>r&&typeof r.id==='string'&&terminal(r.path)).slice(-20).map(r=>({id:r.id,path:r.path}))};
 }
 function complete(meta,s,runId,D){
  const clean=sanitizeMeta(meta,D);
  if(s.phase!=='final'||D.nodes[s.node]?.round!==D.rounds+1)return clean;
  return {paths:[...new Set([...clean.paths,s.node])],history:clean.history.some(r=>r.id===runId)?clean.history:[...clean.history,{id:runId,path:s.node}].slice(-20)};
 }
 const G={initial,reduce,ledger,mission,debrief,serialize,restore,sanitizeMeta,complete,reasons};
 if(typeof module!=='undefined')module.exports=G;else root.FACTORLAB_GAME=G;
})(typeof window==='undefined'?globalThis:window);
