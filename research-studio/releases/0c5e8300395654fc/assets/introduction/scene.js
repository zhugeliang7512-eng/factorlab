/* Original FactorLab mark, modelled in code. No remote assets or tracking. */
(() => {
  const host = document.getElementById('brand-scene');
  if (!host || !window.THREE) return;
  const T = window.THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'}); }
  catch (_) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(33,1,.1,100);
  camera.position.set(0,0,12);
  const env = new T.Scene();
  env.add(new T.Mesh(new T.BoxGeometry(24,18,24),new T.MeshBasicMaterial({color:0x192333,side:T.BackSide})));
  function softbox(w,h,x,y,z,ry,color,strength){
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(strength),side:T.DoubleSide}));
    m.position.set(x,y,z);m.rotation.y=ry;env.add(m);
  }
  softbox(3,14,-7,2,1,Math.PI/2,0xe8f1ff,5);
  softbox(2,12,8,0,2,-Math.PI/2,0x9ab9ec,3);
  softbox(10,2,0,7,4,0,0xffffff,5);
  softbox(6,6,1,1,-9,0,0x658bc7,1.2);
  const pmrem=new T.PMREMGenerator(renderer);
  const envTarget=pmrem.fromScene(env,.04);scene.environment=envTarget.texture;pmrem.dispose();
  scene.add(new T.AmbientLight(0xaec5e8,.6));
  const key=new T.DirectionalLight(0xffffff,3);key.position.set(-3,6,5);scene.add(key);
  const rim=new T.DirectionalLight(0x789fef,2.2);rim.position.set(4,-1,-2);scene.add(rim);
  const silver=new T.MeshPhysicalMaterial({color:0xb7c5d9,metalness:1,roughness:.2,clearcoat:1,clearcoatRoughness:.15});
  const navy=new T.MeshPhysicalMaterial({color:0x17263e,metalness:.85,roughness:.24,clearcoat:1});
  const group=new T.Group();scene.add(group);
  const parts=[];
  function rounded(w,h,d,r){
    const s=new T.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:10});
    g.translate(0,0,-d/2);return g;
  }
  const heights=[.93,1.5,2.2];
  heights.forEach((h,i)=>{
    const bar=new T.Group();
    bar.add(new T.Mesh(rounded(.6,h,.43,.045),silver));
    const face=new T.Mesh(rounded(.45,h-.16,.018,.023),navy);face.position.z=.24;bar.add(face);
    bar.position.set(-1.02+i*.91,-1.38+h/2,0);
    group.add(bar);parts.push({object:bar,base:bar.position.clone(),offset:new T.Vector3((i-1)*.6,(i-1)*.55,.35*i)});
  });
  const base=new T.Mesh(rounded(3.1,.15,.5,.07),silver);base.position.set(-.1,-1.53,0);group.add(base);
  parts.push({object:base,base:base.position.clone(),offset:new T.Vector3(0,-.6,0)});
  const trend=new T.Group();
  const points=[new T.Vector3(-1.43,-.22,.08),new T.Vector3(-.93,-.22,.08),new T.Vector3(.91,1.74,.08)];
  const path=new T.CurvePath();
  for(let i=1;i<points.length;i++)path.add(new T.LineCurve3(points[i-1],points[i]));
  trend.add(new T.Mesh(new T.TubeGeometry(path,48,.077,12,false),silver));
  for(const p of points.slice(0,2)){const m=new T.Mesh(new T.SphereGeometry(.078,16,12),silver);m.position.copy(p);trend.add(m);}
  const ring=new T.Mesh(new T.TorusGeometry(.215,.075,20,64),silver);ring.position.set(1.08,1.92,.08);trend.add(ring);
  group.add(trend);parts.push({object:trend,base:new T.Vector3(),offset:new T.Vector3(.1,.9,.35)});
  const stage=new T.Group();scene.add(stage);
  const orbitMaterial=new T.MeshBasicMaterial({color:0x5e83be,transparent:true,opacity:.22});
  for(let i=0;i<3;i++){
    const orbit=new T.Mesh(new T.TorusGeometry(3.5+i*.65,.006,6,160),orbitMaterial);
    orbit.rotation.set(1.22,.18,-.3);orbit.position.set(-2.3,-1.5-i*.15,-1.8-i*.3);stage.add(orbit);
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,visible=true,paused=reduced.matches,progress=0,tx=0,ty=0,px=0,py=0,raf=0,start=performance.now(),last=0;
  const ease=x=>{x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3);};
  function resize(){
    width=host.clientWidth;height=host.clientHeight;
    renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();
    draw(performance.now());
  }
  function draw(now){
    const mobile=width<761;
    const move=ease((progress-.08)/.65),intro=paused?1:ease((now-start)/1900);
    const spread=(1-intro)*1.7+(mobile?0:Math.sin(move*Math.PI)*.62);
    px+=(tx-px)*.04;py+=(ty-py)*.04;
    group.position.set(mobile?0:-2.65+5.25*move,mobile?-1.65:-.05,0);
    group.scale.setScalar(mobile?(width<370?.65:.78):1.32-.15*move);
    group.rotation.set(-.1+py*.04,-.42+move*.95+px*.06,-.17+.25*move);
    if(!paused)group.position.y+=Math.sin(now*.00065)*.025;
    for(const p of parts)p.object.position.copy(p.base).addScaledVector(p.offset,spread);
    stage.visible=!mobile;stage.rotation.z=paused?0:Math.sin(now*.00013)*.035;
    renderer.render(scene,camera);
    host.classList.add('webgl-ready');
  }
  function tick(now){raf=0;if(!visible||document.hidden||paused)return;const interval=width<761?32:15;if(now-last>interval){draw(now);last=now;}raf=requestAnimationFrame(tick);}
  function resume(){if(visible&&!document.hidden&&!paused&&!raf)raf=requestAnimationFrame(tick);}
  window.FactorLabScene={setProgress(p){progress=p;if(paused)draw(performance.now());},setPaused(v){paused=v;cancelAnimationFrame(raf);raf=0;draw(performance.now());resume();}};
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(raf);raf=0;}else resume();},{rootMargin:'100px'}).observe(host);
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{if(width>760){tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;}},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else resume();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('webgl-ready');cancelAnimationFrame(raf);raf=0;});
  resize();resume();
})();

