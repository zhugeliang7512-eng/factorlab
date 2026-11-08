(function(){
  'use strict';
  const script=document.currentScript||document.querySelector('script[src$="enhancements.js"]');
  const base=new URL('./',script?.src||location.href),pending=new Map();
  function request(name,retry){
    return new Promise(resolve=>{
      const element=document.createElement('script');
      element.src=new URL('vendor/'+name+(retry?'?retry='+Date.now():''),base).href;
      element.async=true;
      element.onload=()=>resolve(true);
      element.onerror=()=>{element.remove();resolve(retry?false:request(name,true));};
      document.head.appendChild(element);
    });
  }
  function load(name){
    if(pending.has(name))return pending.get(name);
    const promise=Promise.race([request(name,false),new Promise(resolve=>setTimeout(()=>resolve(false),15000))]);
    pending.set(name,promise);
    return promise;
  }
  let started=false;
  function start(){
    if(started||!window.FactorLabApp||document.documentElement.hasAttribute('data-auth-pending'))return;
    started=true;observer.disconnect();
    requestAnimationFrame(()=>requestAnimationFrame(()=>load('echarts.min.js').then(ok=>{
      document.dispatchEvent(new Event(ok&&window.echarts?'factorlab:charts-ready':'factorlab:charts-failed'));
      if(!ok||!window.echarts){const timer=setInterval(()=>{if(window.echarts){clearInterval(timer);document.dispatchEvent(new Event('factorlab:charts-ready'));}},1200);setTimeout(()=>clearInterval(timer),30000);}
    })));
  }
  const observer=new MutationObserver(start);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  document.addEventListener('factorlab:render',start);
  document.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)void load('anime.js');},{once:true});
  window.FactorLabEnhancements={loadBadge:()=>load('lottie.js'),loadCharts:()=>load('echarts.min.js')};
  start();
})();
