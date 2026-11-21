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
  const chartDefinitions = new WeakMap();
  const paintedDefinitions = new WeakMap();
  const chartSizes = new WeakMap();
  const initializing = new WeakMap();
  const chartHosts = new Set();
  const themeName = 'factorlab-editorial';
  let registeredLibrary, colors;

  function palette() {
    if (colors) return colors;
    const style = getComputedStyle(document.documentElement);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    colors = {
      plum:token('--brand-plum', '#6d285e'), ink:token('--brand-obsidian', '#161719'),
      text:token('--ink-secondary', '#3a3d42'), muted:token('--ink-muted', '#5a5f66'),
      paper:token('--bg-surface', '#fff'), subtle:token('--bg-subtle', '#efece5'),
      hair:token('--border-hair', 'rgba(18,19,20,.08)'), positive:token('--sem-positive', '#0f766e'),
      sans:token('--font-sans', 'system-ui, sans-serif'), mono:token('--font-mono', 'ui-monospace, monospace')
    };
    return colors;
  }

  function seriesColor(key, index) {
    const p = palette();
    if (key === 'benchmarkNav' || key === 'comparison') return p.ink;
    if (key === 'anchorNav') return p.muted;
    if (['nav','primary','value'].includes(key)) return p.plum;
    return [p.plum, p.ink, p.positive, p.muted][index % 4];
  }

  function initChart(host, size) {
    const library = window.echarts;
    const p = palette();
    if (registeredLibrary !== library) {
      const pointer = {color:p.muted, type:'dashed', width:1};
      library.registerTheme(themeName, {
        color:[p.plum,p.ink,p.positive,'#8a552b','#526066','#998493'],
        textStyle:{fontFamily:p.sans,color:p.text},
        categoryAxis:{axisLine:{lineStyle:{color:p.hair}},axisTick:{show:false},axisLabel:{color:p.muted,fontFamily:p.mono}},
        valueAxis:{axisLabel:{color:p.muted,fontFamily:p.mono},splitLine:{lineStyle:{color:p.hair}}},
        axisPointer:{lineStyle:pointer,crossStyle:pointer,label:{show:false,backgroundColor:p.ink}},
        dataZoom:{
          backgroundColor:p.subtle,borderColor:p.hair,borderRadius:2,
          fillerColor:'rgba(109,40,94,.12)',handleIcon:'circle',
          handleStyle:{color:p.paper,borderColor:p.plum,borderWidth:1.6},
          moveHandleStyle:{color:p.ink,opacity:.65},textStyle:{color:p.text,fontFamily:p.mono},
          dataBackground:{lineStyle:{color:p.muted,opacity:.35},areaStyle:{color:p.ink,opacity:.04}},
          selectedDataBackground:{lineStyle:{color:p.plum,opacity:.7},areaStyle:{color:p.plum,opacity:.09}},
          brushStyle:{color:'rgba(109,40,94,.18)',borderColor:p.plum,borderWidth:1},
          emphasis:{handleStyle:{color:p.paper,borderColor:p.plum,borderWidth:2.5},moveHandleStyle:{color:p.plum,opacity:1}}
        },
        legend:{textStyle:{color:p.text},pageIconColor:p.plum,pageIconInactiveColor:p.muted,pageTextStyle:{color:p.text}},
        tooltip:{backgroundColor:'rgba(255,255,255,.92)',borderColor:p.hair,borderWidth:1,textStyle:{color:p.text},
          className:'factorlab-chart-tooltip',confine:true,transitionDuration:0}
      });
      registeredLibrary = library;
    }
    return library.getInstanceByDom(host) || library.init(host, themeName, {renderer:'svg', ...size});
  }

  function chartLayout(width, definition) {
    const compact = width < 520, touch = matchMedia('(pointer: coarse)').matches;
    const p = palette(), shortDate = value => compact && /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? value.slice(5) : value;
    return {
      grid:{left:compact ? 6 : 16,right:24,top:20,bottom:compact ? 90 : 74,containLabel:true},
      xAxis:{boundaryGap:false,axisLabel:{hideOverlap:true,showMinLabel:true,showMaxLabel:true,
        alignMinLabel:'left',alignMaxLabel:'right',margin:10,fontSize:compact?11:12,formatter:shortDate}},
      yAxis:{splitNumber:compact?3:4,axisLabel:{margin:8,fontSize:compact?11:12}},
      tooltip:{className:'factorlab-chart-tooltip',trigger:'axis',axisPointer:{type:'cross',label:{show:false}},
        confine:true,triggerOn:'mousemove|click',textStyle:{fontSize:compact?12:13},
        formatter:items => {
          const entries = Array.isArray(items) ? items : [items];
          return '<b>'+escape(entries[0]?.axisValueLabel ?? '')+'</b>'+entries.map(item =>
            '<div class="chart-tooltip-row"><span><i style="background:'+escape(item.color)+'"></i>'+escape(item.seriesName)+'</span><strong>'+escape(definition.format(item.value))+(definition.unit ? ' '+escape(definition.unit) : '')+'</strong></div>').join('');
        }},
      legend:{left:4,right:8,bottom:1,type:'scroll',icon:'roundRect',itemWidth:14,itemHeight:3,
        inactiveColor:p.muted,textStyle:{fontSize:compact?11:12}},
      dataZoom:[
        {type:'inside',disabled:touch,preventDefaultMouseMove:!touch},
        {type:'slider',left:24,right:24,bottom:compact?34:29,height:compact?22:16,handleSize:compact?24:16,
          moveHandleSize:compact?9:6,showDetail:false}
      ]
    };
  }

  function drawBasicChart(host, definition, resizeOnly, size) {
    const {rows,series,label,format,xLabel,markLine} = definition;
    const width=Math.max(size?.width||320,180),height=Math.max(size?.height||260,150);
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
    const grid=[...new Set(yValues)].map(value=>`<line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" stroke="rgba(18,19,20,.10)"/><text x="${left-6}" y="${y(value)+4}" text-anchor="end">${escape(format(value))}</text>`).join('');
    const ticks=[...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])].map((index,i,all)=>{
      const anchor=all.length===1?'middle':i===0?'start':i===all.length-1?'end':'middle';
      return `<text x="${x(index)}" y="${bottom+17}" text-anchor="${anchor}">${escape(xLabel(rows[index]))}</text>`;
    }).join('');
    const boundary=markLine?rows.findIndex(row=>xLabel(row)===markLine.value):-1;
    const marker=boundary<0?'':`<line x1="${x(boundary)}" x2="${x(boundary)}" y1="${top}" y2="${bottom}" stroke="#5a5f66" stroke-dasharray="3 3"><title>${escape(markLine.label)}</title></line>`;
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
    host.innerHTML=`<svg class="factorlab-line-fallback" viewBox="${viewBox}" width="100%" height="100%" style="display:block" role="img" aria-label="${escape(label)}"><g class="fallback-labels" fill="#5a5f66" font-size="11" font-family="monospace">${grid}${marker}${traces}${ticks}${legend}</g></svg>`;
  }
  function disposeChart(host) {
    try { window.echarts?.getInstanceByDom(host)?.dispose(); } catch {}
  }
  function drawChart(host, definition, resizeOnly=false) {
    const {rows,series,label,xLabel} = definition;
    const sameDefinition = paintedDefinitions.get(host) === definition;
    const size = chartSizes.get(host);
    if (window.echarts && size?.width && size.height) {
      try {
        if (initializing.has(host)) return;
        const current = window.echarts.getInstanceByDom(host);
        const sizeChanged = current && (current.getWidth() !== size.width || current.getHeight() !== size.height);
        if (sizeChanged) current.resize(size);
        if (resizeOnly && current && sameDefinition && host.dataset.chartState==='ready') {
          if (sizeChanged && !definition.configure) current.setOption(chartLayout(size.width, definition));
          return;
        }
        if (!current) host.textContent = '';
        const instance = initChart(host, size);
        if (!current && viewportObserver && host.firstElementChild) {
          // ECharts' HTML tooltip measures the SVG viewport when it is first created.
          const viewport=host.firstElementChild;
          initializing.set(host,viewport);
          viewportObserver.observe(viewport);
          return;
        }
        if (definition.configure) {
          definition.configure(instance);
          paintedDefinitions.set(host,definition);
          host.dataset.chartState='ready';
          return;
        }
        const layout = chartLayout(size.width, definition);
        const markLine = definition.markLine && {symbol:'none',silent:true,lineStyle:{color:palette().muted,width:1,type:'dashed'},
          label:{formatter:definition.markLine.label||'',position:'insideEndTop',color:palette().muted,fontSize:11},data:[{xAxis:definition.markLine.value}]};
        instance.setOption({...layout,animation:false,aria:{enabled:true,description:label},
          xAxis:{...layout.xAxis,type:'category',data:rows.map(xLabel)},yAxis:{...layout.yAxis,type:'value',scale:true},
          series:series.map((s,i) => ({id:s.key,name:s.name,type:'line',showSymbol:rows.length<3,symbol:'circle',symbolSize:7,
            data:rows.map(r=>r[s.key]),lineStyle:{color:s.color,width:s.dash?1.6:2.4,type:s.dash?'dashed':'solid'},itemStyle:{color:s.color},
            ...(i===0 && markLine ? {markLine} : {})}))}, {replaceMerge:['series']});
        if (!host.querySelector('svg')) throw Error('chartNotRendered');
        host.dataset.chartState = 'ready';
        paintedDefinitions.set(host,definition);
        return;
      } catch {
        disposeChart(host);
      }
    }
    if (host.dataset.chartState==='ready' && (!size?.width || !size.height)) return;
    if (!definition.configure) drawBasicChart(host,definition,resizeOnly && sameDefinition,size);
    host.dataset.chartState = document.documentElement.dataset.charts === 'failed' || (window.echarts && size?.width && size.height) ? 'basic' : 'loading';
    paintedDefinitions.set(host,definition);
  }

  function updateRows(host, rows) {
    const definition = chartDefinitions.get(host);
    if (!definition) return;
    definition.rows = rows;
    const instance = window.echarts?.getInstanceByDom(host);
    if (instance && host.dataset.chartState === 'ready') {
      instance.setOption({series:definition.series.map(s => ({id:s.key, data:rows.map(row=>row[s.key])}))});
    } else drawChart(host, definition);
  }

  const resizeCharts=()=>chartHosts.forEach(resizeChart);
  document.addEventListener('factorlab:charts-ready', resizeCharts);
  document.addEventListener('factorlab:charts-failed', () => {
    chartHosts.forEach(host => { if (host.dataset.chartState === 'loading') host.dataset.chartState = 'basic'; });
  });
  function releaseChart(host) {
    const viewport=initializing.get(host);
    if (viewport) { viewportObserver?.unobserve(viewport); initializing.delete(host); }
    chartObserver?.unobserve(host);disposeChart(host);chartDefinitions.delete(host);paintedDefinitions.delete(host);chartSizes.delete(host);chartHosts.delete(host);
  }
  function resizeChart(host) {
    if (!host.isConnected) { releaseChart(host);return; }
    const definition=chartDefinitions.get(host);
    if (definition) drawChart(host,definition,true);
  }
  function measured(host, width, height) {
    chartSizes.set(host,{width:Math.round(width),height:Math.round(height)});
    resizeChart(host);
  }
  const viewportObserver = typeof ResizeObserver==='function' ? new ResizeObserver(entries=>{
    entries.forEach(({target})=>{
      viewportObserver.unobserve(target);
      const host=target.parentElement;
      if (host && initializing.get(host)===target) {
        initializing.delete(host);
        resizeChart(host);
      }
    });
  }) : null;
  const chartObserver = typeof ResizeObserver==='function' ? new ResizeObserver(entries => {
    entries.forEach(({target,contentRect}) => measured(target,contentRect.width,contentRect.height));
  }) : null;
  let measureFrame=0;
  function scheduleMeasurements() {
    if (measureFrame) return;
    measureFrame=requestAnimationFrame(()=>{
      measureFrame=0;
      const sizes=Array.from(chartHosts,host=>[host,host.clientWidth,host.clientHeight]);
      sizes.forEach(([host,width,height])=>measured(host,width,height));
    });
  }
  if (!chartObserver) {
    document.addEventListener('factorlab:view',scheduleMeasurements);
    window.addEventListener('resize',scheduleMeasurements);
    document.addEventListener('toggle',scheduleMeasurements,true);
  }
  function chart(host, definition) {
    if (!host) return;
    chartHosts.forEach(previous=>{if(!previous.isConnected)releaseChart(previous);});
    host.style.touchAction='pan-y';host.setAttribute('aria-label',definition.label);host.tabIndex=0;
    const next = definition.configure ? definition : {...definition, series:definition.series.map((item, i) => ({...item, color:seriesColor(item.key, i)}))};
    chartDefinitions.set(host,next);chartHosts.add(host);chartObserver?.observe(host);drawChart(host,next);
    if (!chartObserver) scheduleMeasurements();
    if (!window.echarts) window.FactorLabEnhancements?.observeChart(host);
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
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open || dialog.id === 'coach-drawer' || reduced() || !dialog.animate) return;
    dialog.animate([{opacity:0,transform:'translateY(6px) scale(.96)'},{opacity:1,transform:'none'}],{duration:200,easing:'cubic-bezier(.16,1,.3,1)'});
  },true);
  window.FactorVisuals={curve,chart,dial,initChart,updateRows,releaseChart};
})();
