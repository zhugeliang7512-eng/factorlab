(function(){
  'use strict';
  const base=new URL('./',document.currentScript.src),pending=new Map();
  function load(name){
    if(pending.has(name))return pending.get(name);
    const promise=new Promise(resolve=>{const script=document.createElement('script');script.src=new URL('vendor/'+name,base).href;script.async=true;script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.head.append(script);});
    pending.set(name,promise);return promise;
  }
  let started=false;
  function start(){
    if(started||!window.FactorLabApp||document.documentElement.hasAttribute('data-auth-pending'))return;
    started=true;observer.disconnect();
    requestAnimationFrame(()=>requestAnimationFrame(()=>load('echarts.min.js').then(ok=>{if(ok)document.dispatchEvent(new Event('factorlab:charts-ready'));})));
  }
  const observer=new MutationObserver(start);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  document.addEventListener('factorlab:render',start);
  document.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)void load('anime.js');},{once:true});
  window.FactorLabEnhancements={loadBadge:()=>load('lottie.js')};
  start();
})();
