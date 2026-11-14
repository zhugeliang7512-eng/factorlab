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
  const paintedDefinitions = new WeakMap();
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
  function drawBasicChart(host, definition, resizeOnly) {
    const {rows,series,label,format,xLabel,markLine} = definition;
    const width=Math.max(host.clientWidth||320,180),height=Math.max(host.clientHeight||260,150);
    const viewBox='0 0 '+width+' '+height;
    if (resizeOnly && host.querySelector('.factorlab-line-fallback')?.getAttribute('viewBox')===viewBox) return;
    const values=series.flatMap(item=>rows.map(row=>row[item.key])).filter(Number.isFinite);
    if (!values.length) { host.textContent='';return; }
    const min=Math.min(...values),max=Math.max(...values);
    const padding=(max-min)*.08 || Math.max(Math.abs(min)*.01,.001);
    const lower=min-padding,upper=max+padding;
    const yValues=[min,(min+max)/2,max];
    const left=Math.max(...yValues.map(value=>String(format(value)).length))*6+14;
    const right=width-12,top=16,bottom=height-34-series.length*17;
    if (right<=left || bottom<=top) return;
    const x=index=>rows.length===1?(left+right)/2:left+(right-left)*index/(rows.length-1);
    const y=value=>bottom-(bottom-top)*(value-lower)/(upper-lower);
    const grid=[...new Set(yValues)].map(value=>`<line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" stroke="#d6d0c5"/><text x="${left-6}" y="${y(value)+4}" text-anchor="end">${escape(format(value))}</text>`).join('');
    const ticks=[...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])].map((index,i,all)=>{
      const anchor=all.length===1?'middle':i===0?'start':i===all.length-1?'end':'middle';
      return `<text x="${x(index)}" y="${bottom+17}" text-anchor="${anchor}">${escape(xLabel(rows[index]))}</text>`;
    }).join('');
    const boundary=markLine?rows.findIndex(row=>xLabel(row)===markLine.value):-1;
    const marker=boundary<0?'':`<line x1="${x(boundary)}" x2="${x(boundary)}" y1="${top}" y2="${bottom}" stroke="#9b744d" stroke-dasharray="3 3"><title>${escape(markLine.label)}</title></line>`;
    const traces=series.map(item=>{
      const parts=[];
      let points=[];
      const flush=()=>{
        if (points.length===1) {
          parts.push(`<circle cx="${points[0][0]}" cy="${points[0][1]}" r="3.4" fill="${escape(item.color)}"/>`);
        } else if (points.length>1) {
          parts.push(`<polyline fill="none" stroke="${escape(item.color)}" stroke-width="2" ${item.dash?'stroke-dasharray="5 4"':''} vector-effect="non-scaling-stroke" points="${points.map(point=>point.join(',')).join(' ')}"/>`);
        }
        points=[];
      };
      rows.forEach((row,index)=>{const value=row[item.key];if(Number.isFinite(value))points.push([x(index).toFixed(2),y(value).toFixed(2)]);else flush();});
      flush();
      return parts.join('');
    }).join('');
    const legend=series.map((item,i)=>{
      const position=bottom+36+i*17;
      return `<line x1="10" x2="27" y1="${position-4}" y2="${position-4}" stroke="${escape(item.color)}" stroke-width="2" ${item.dash?'stroke-dasharray="5 4"':''}/><text x="34" y="${position}">${escape(item.name)}</text>`;
    }).join('');
    host.innerHTML=`<svg class="factorlab-line-fallback" viewBox="${viewBox}" width="100%" height="100%" style="display:block" role="img" aria-label="${escape(label)}"><g fill="#62594e" font-size="11" font-family="sans-serif">${grid}${marker}${traces}${ticks}${legend}</g></svg>`;
  }
  function disposeChart(host) {
    try { window.echarts?.getInstanceByDom(host)?.dispose(); } catch {}
  }
  function drawChart(host, definition, resizeOnly=false) {
    if (!host.clientWidth || !host.clientHeight || !host.getClientRects().length) {
      if (!resizeOnly && !host.firstElementChild) {
        drawBasicChart(host,definition,false);
        paintedDefinitions.set(host,definition);
      }
      return;
    }
    const {rows,series,label,format,xLabel} = definition;
    const sameDefinition=paintedDefinitions.get(host)===definition;
    if (window.echarts) {
      try {
        const current=window.echarts.getInstanceByDom(host);
        const layout=chartLayout(host);
        const sizeChanged=current&&(current.getWidth()!==host.clientWidth||current.getHeight()!==host.clientHeight);
        if (sizeChanged) current.resize();
        if (resizeOnly && current && sameDefinition) {
          if (sizeChanged) current.setOption(layout);
          return;
        }
        if (!current) host.textContent='';
        const instance=current||window.echarts.init(host,null,{renderer:'svg'});
        const markLine=definition.markLine?{symbol:'none',silent:true,lineStyle:{color:'#9b744d',width:1,type:'dashed'},label:{formatter:definition.markLine.label||'',fontSize:11,color:'#6d6860'},data:[{xAxis:definition.markLine.value}]}:null;
        instance.setOption({...layout,animation:!reduced(),animationDuration:280,aria:{enabled:true,description:label},tooltip:{...layout.tooltip,trigger:'axis',valueFormatter:format},xAxis:{...layout.xAxis,type:'category',data:rows.map(xLabel)},yAxis:{...layout.yAxis,type:'value',scale:true},series:series.map((s,i)=>({name:s.name,type:'line',smooth:false,showSymbol:rows.length<3,data:rows.map(r=>r[s.key]),lineStyle:{color:s.color,width:2,type:s.dash?'dashed':'solid'},itemStyle:{color:s.color},...(i===0&&markLine?{markLine}:{})}))},true);
        if (!host.querySelector('svg')) throw Error('chartNotRendered');
        paintedDefinitions.set(host,definition);
        return;
      } catch {
        disposeChart(host);
      }
    }
    drawBasicChart(host,definition,resizeOnly&&sameDefinition);
    paintedDefinitions.set(host,definition);
  }
  const resizeCharts=()=>chartHosts.forEach(resizeChart);
  document.addEventListener('factorlab:charts-ready',resizeCharts);
  function releaseChart(host) {
    chartObserver?.unobserve(host);disposeChart(host);chartDefinitions.delete(host);paintedDefinitions.delete(host);chartHosts.delete(host);
  }
  function resizeChart(host) {
    if (!host.isConnected) { releaseChart(host);return; }
    const definition=chartDefinitions.get(host);
    if (definition) drawChart(host,definition,true);
  }
  const chartObserver = typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(entry=>resizeChart(entry.target))):null;
  document.addEventListener('factorlab:view',resizeCharts);
  if (!chartObserver) window.addEventListener('resize',resizeCharts);
  function chart(host, definition) {
    if (!host) return;
    chartHosts.forEach(previous=>{if(!previous.isConnected)releaseChart(previous);});
    host.style.touchAction='pan-y';host.setAttribute('aria-label',definition.label);host.tabIndex=0;
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
