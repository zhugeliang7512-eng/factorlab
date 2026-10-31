(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gray = ['#202020', '#4b4b4b', '#777777', '#9e9e9e', '#bfbfbf', '#d8d8d8'];
  function curve(points) {
    if (!points.length) return '';
    let d = `M ${points[0][0]} ${points[0][1]}`;
    const slopes = points.slice(1).map((p, i) => (p[1] - points[i][1]) / (p[0] - points[i][0] || 1));
    const tangent = points.map((_, i) => i === 0 ? slopes[0] || 0 : i === points.length - 1 ? slopes[i - 1] || 0 : slopes[i - 1] * slopes[i] <= 0 ? 0 : 2 / (1 / slopes[i - 1] + 1 / slopes[i]));
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], step = (b[0] - a[0]) / 3;
      d += ` C ${a[0] + step} ${a[1] + tangent[i - 1] * step},${b[0] - step} ${b[1] - tangent[i] * step},${b[0]} ${b[1]}`;
    }
    return d;
  }
  let serial = 0;
  const chartDefinitions = new WeakMap();
  const chartHosts = new Set();
  function chartLayout(host) {
    const compact = host.clientWidth < 520, touch = matchMedia('(pointer: coarse)').matches;
    return {
      tooltip:{className:'factorlab-chart-tooltip',confine:true,triggerOn:'mousemove|click',textStyle:{fontSize:compact?12:14},extraCssText:'max-width:100%;white-space:normal;overflow-wrap:anywhere'},
      grid:{left:8,right:compact?10:24,top:24,bottom:compact?92:82,containLabel:true},
      xAxis:{axisLabel:{hideOverlap:true,fontSize:compact?11:12,formatter:value=>compact&&/^\d{4}-\d{2}-\d{2}$/.test(String(value))?String(value).slice(5):String(value)}},
      yAxis:{splitNumber:compact?3:5,axisLabel:{fontSize:compact?11:12}},
      legend:{bottom:0,type:'scroll',textStyle:{fontSize:compact?11:12}},
      dataZoom:[{type:'inside',disabled:touch,preventDefaultMouseMove:!touch},{type:'slider',bottom:compact?34:30,height:compact?26:18,handleSize:compact?'140%':'100%',moveHandleSize:compact?12:7,showDetail:!compact}]
    };
  }
  function drawChart(host, definition) {
    if (!host.clientWidth || !host.clientHeight || !host.getClientRects().length || !window.echarts) return;
    const {rows,series,label,format,xLabel} = definition, layout = chartLayout(host);
    const instance = echarts.getInstanceByDom(host) || echarts.init(host, null, {renderer:'svg'});
    instance.resize();
    instance.setOption({...layout,animation:!reduced(),animationDuration:280,aria:{enabled:true,description:label},tooltip:{...layout.tooltip,trigger:'axis',valueFormatter:format},xAxis:{...layout.xAxis,type:'category',data:rows.map(xLabel)},yAxis:{...layout.yAxis,type:'value',scale:true},series:series.map(s=>({name:s.name,type:'line',smooth:false,showSymbol:rows.length<3,data:rows.map(r=>r[s.key]),lineStyle:{color:s.color,width:2,type:s.dash?'dashed':'solid'},itemStyle:{color:s.color}}))},true);
    host.style.touchAction='pan-y';host.setAttribute('aria-label',label);host.tabIndex=0;
  }
  document.addEventListener('factorlab:charts-ready',()=>chartHosts.forEach(resizeChart));
  function releaseChart(host) {
    chartObserver?.unobserve(host);window.echarts?.getInstanceByDom(host)?.dispose();chartDefinitions.delete(host);chartHosts.delete(host);
  }
  function resizeChart(host) {
    if (!host.isConnected) { releaseChart(host);return; }
    const definition=chartDefinitions.get(host);
    if (!definition || !host.clientWidth || !host.clientHeight || !window.echarts) return;
    const instance=echarts.getInstanceByDom(host);
    if (!instance) { drawChart(host,definition);return; }
    if (instance.getWidth()!==host.clientWidth || instance.getHeight()!==host.clientHeight) {
      instance.resize();instance.setOption(chartLayout(host));
    }
  }
  const chartObserver = typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(entry=>resizeChart(entry.target))):null;
  if (!chartObserver) window.addEventListener('resize',()=>chartHosts.forEach(resizeChart));
  function chart(host, definition) {
    if (!host) return;
    chartHosts.forEach(previous=>{if(!previous.isConnected)releaseChart(previous);});
    chartDefinitions.set(host,definition);chartHosts.add(host);chartObserver?.observe(host);drawChart(host,definition);
  }

  function dial(host, weights, names) {
    if (!host) return;
    const center = [300,215], point = (v,r) => [center[0]+r*Math.cos(v*Math.PI*2-Math.PI/2),center[1]+r*Math.sin(v*Math.PI*2-Math.PI/2)];
    const pos = p => p.map(v=>v.toFixed(3)).join(' ');
    let start = 0;
    const sides = [[],[]];
    const paths = weights.map((value,i) => {
      const a=point(start,158),b=point(start+value,158),c=point(start+value,72),d=point(start,72);
      let path='';
      if(value>=1-1e-8)path=`M ${pos(a)} A 158 158 0 1 1 ${pos(point(start+.5,158))} A 158 158 0 1 1 ${pos(a)} L ${pos(d)} A 72 72 0 1 0 ${pos(point(start+.5,72))} A 72 72 0 1 0 ${pos(d)} Z`;
      else if(value>0)path=`M ${pos(a)} A 158 158 0 ${value>.5?1:0} 1 ${pos(b)} L ${pos(c)} A 72 72 0 ${value>.5?1:0} 0 ${pos(d)} Z`;
      const anchor=point(start+value/2,164),outer=point(start+value/2,181);
      if(value>0)sides[outer[0]<300?0:1].push({i,anchor,outer,y:outer[1]});
      start+=value;
      return `<path data-weight="${value}" d="${path}" fill="${gray[i]}" stroke="#eeede8" stroke-width="${value>=1-1e-8?0:Math.min(4,value*120)}" stroke-linejoin="round"><title>${escape(names[i])} ${(value*100).toFixed(1)}%</title></path>`;
    }).join('');
    const labels=sides.map((items,side)=>{
      items.sort((a,b)=>a.y-b.y);
      items.forEach((it,i)=>{it.y=Math.max(38,Math.min(390,it.y));if(i)it.y=Math.max(it.y,items[i-1].y+40);});
      if(items.length&&items.at(-1).y>390){items.at(-1).y=390;for(let i=items.length-2;i>=0;i--)items[i].y=Math.min(items[i].y,items[i+1].y-40);}
      return items.map(it=>`<path d="M ${pos(it.anchor)} L ${it.outer[0]} ${it.y} L ${side?530:70} ${it.y}" fill="none" stroke="#b8b7b2" stroke-width=".8"/><text x="${side?580:20}" y="${it.y-7}" text-anchor="${side?'end':'start'}">${escape(names[it.i])}</text><text class="dial-value" x="${side?580:20}" y="${it.y+12}" text-anchor="${side?'end':'start'}">${(weights[it.i]*100).toFixed(1).replace('.0','')}%</text>`).join('');
    }).join('');
    host.innerHTML=`<svg viewBox="0 0 600 430" role="img" aria-label="${escape(names.map((n,i)=>n+' '+(weights[i]*100).toFixed(1)+'%').join('，'))}">${paths}${labels}</svg>`;
  }
  document.addEventListener('toggle', event => {
    if (!(event.target instanceof HTMLDialogElement) || !event.target.open || reduced()) return;
    event.target.animate([{opacity:0,transform:'translateY(16px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  },true);
  window.FactorVisuals={curve,chart,dial};
})();
