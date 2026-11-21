(function () {
  'use strict';
  const define = (target, name, value) => {
    if (typeof target[name] !== 'function') Object.defineProperty(target, name, { configurable: true, writable: true, value });
  };

  define(Array.prototype, 'at', function at(index) {
    const length = this.length >>> 0, position = Math.trunc(Number(index)) || 0;
    return this[position < 0 ? length + position : position];
  });
  define(String.prototype, 'at', function at(index) {
    const value = String(this), position = Math.trunc(Number(index)) || 0;
    return value.charAt(position < 0 ? value.length + position : position) || undefined;
  });
  define(Array.prototype, 'findLast', function findLast(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return this[i];
    return undefined;
  });
  define(Array.prototype, 'findLastIndex', function findLastIndex(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return i;
    return -1;
  });
  define(Array.prototype, 'flat', function flat(depth) {
    const limit = depth === undefined ? 1 : Math.max(0, Math.trunc(Number(depth)) || 0), result = [];
    const walk = (items, level) => { for (const item of items) { if (Array.isArray(item) && level < limit) walk(item, level + 1); else result.push(item); } };
    walk(this, 0); return result;
  });
  define(Array.prototype, 'flatMap', function flatMap(callback, thisArg) {
    return this.map(callback, thisArg).flat();
  });
  define(Object, 'hasOwn', function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(Object(object), key);
  });
  define(String.prototype, 'replaceAll', function replaceAll(search, replacement) {
    const value = String(this), pattern = search instanceof RegExp ? search : String(search);
    if (search instanceof RegExp) return value.replace(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'), replacement);
    return value.split(pattern).join(replacement);
  });
  if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = value => JSON.parse(JSON.stringify(value));
  }
  if (typeof CSS !== 'undefined' && typeof CSS.escape !== 'function') {
    CSS.escape = value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character);
  }

  const dialogPrototype = typeof HTMLDialogElement === 'function' ? HTMLDialogElement.prototype : null;
  if (!dialogPrototype || typeof dialogPrototype.showModal !== 'function') {
    const prototype = dialogPrototype || HTMLElement.prototype;
    const setOpen = (element, open) => { if (open) element.setAttribute('open', ''); else element.removeAttribute('open'); };
    define(prototype, 'showModal', function showModal() {
      if (this.hasAttribute('open')) return;
      setOpen(this, true);
      this.setAttribute('data-modal', '');
      document.documentElement.classList.add('compat-modal-open');
    });
    define(prototype, 'show', function show() { setOpen(this, true); });
    define(prototype, 'close', function close(returnValue) {
      if (!this.hasAttribute('open')) return;
      setOpen(this, false);
      this.removeAttribute('data-modal');
      this.returnValue = returnValue === undefined ? '' : String(returnValue);
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('compat-modal-open');
      this.dispatchEvent(new Event('close'));
    });
    if (!('open' in document.createElement('dialog'))) {
      Object.defineProperty(HTMLElement.prototype, 'open', {
        configurable: true,
        get() { return this.hasAttribute('open'); },
        set(value) { setOpen(this, !!value); }
      });
    }
  }
})();

;
window.FactorLabCloudConfig=Object.freeze({url:'https://uhmsxllsgwdjcnssbyxc.supabase.co',key:'sb_publishable_BZcH8Hy05fB96IvtKU1-sw_A6SPmG83',functionName:'swift-service',selfService:true});

;
(function(root){
  'use strict';
  async function withTimeout(task){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{return await task(controller.signal);}finally{clearTimeout(timer);}
  }
  const sdkFetch=(url,init={})=>init.signal?fetch(url,init):withTimeout(signal=>fetch(url,{...init,signal}));
  function normalizeStudioFields(envelope,state){
    const refs=envelope.evidenceRefs===undefined?[]:envelope.evidenceRefs;
    const evidence=root.FactorLabEvidence||(typeof require==='function'?require('../evidence-data.js'):null);
    const ledger=root.FactorLabLedger||(typeof require==='function'?require('../portfolio-ledger.js'):null);
    const simulation=root.FactorLabSimulation||(typeof require==='function'?require('../v2/simulation.js'):null);
    const view=state.ledger?ledger.createEngine(simulation).publicView(state):null;
    const records=view?evidence.buildEvidence(view):[];
    const allowed=new Set(['E1','E2','E3',...state.events.map(event=>event.id),...records.map(r=>r.id)]);
    if(!Array.isArray(refs)||refs.length>24||refs.some(id=>typeof id!=='string'||id.length>160||!allowed.has(id)&&!(view&&evidence.validateReference(view,id))))throw Error('invalid_save');
    const falsifierIf=envelope.falsifierIf===undefined?'':envelope.falsifierIf;
    if(typeof falsifierIf!=='string'||falsifierIf.length>500)throw Error('invalid_save');
    const progress=envelope.researchProgress===undefined?{hasRun:false,dirty:false,hasEfficacy:false,preferences:[25,25,25,25],resultPreferences:[25,25,25,25]}:envelope.researchProgress;
    if(!progress||typeof progress!=='object'||Array.isArray(progress)||['hasRun','dirty','hasEfficacy'].some(key=>typeof progress[key]!=='boolean'))throw Error('invalid_save');
    const resultPreferences=progress.resultPreferences===undefined?[25,25,25,25]:progress.resultPreferences;
    for(const values of [progress.preferences,resultPreferences])if(!Array.isArray(values)||values.length!==4||values.some(value=>!Number.isFinite(value)||value<0||value>100))throw Error('invalid_save');
    const resultTotal=resultPreferences.reduce((a,b)=>a+b,0),preferenceTotal=progress.preferences.reduce((a,b)=>a+b,0);
    if(!resultTotal||progress.hasEfficacy&&(!progress.hasRun||progress.dirty)||!progress.dirty&&!preferenceTotal||progress.hasRun&&!progress.dirty&&progress.preferences.some((value,i)=>Math.abs(value/preferenceTotal-resultPreferences[i]/resultTotal)>1e-9))throw Error('invalid_save');
    const extras={};
    if(envelope.evidenceSelections!==undefined){
      if(!Array.isArray(envelope.evidenceSelections)||envelope.evidenceSelections.length>24)throw Error('invalid_save');
      extras.evidenceSelections=envelope.evidenceSelections.map(ref=>{if(!view)throw Error('invalid_save');return evidence.resolveReference(view,ref);});
    }
    if(envelope.chat!==undefined){
      const chat=envelope.chat;
      if(!chat||chat.schema!==1||!Array.isArray(chat.messages)||chat.messages.length>40||!Array.isArray(chat.attachments)||chat.attachments.length>8||typeof chat.input!=='string'||chat.input.length>600||JSON.stringify(chat).length>300000)throw Error('invalid_save');
      if(chat.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.summary!=='string'||m.summary.length>7000||!['zh-CN','en'].includes(m.lang)))throw Error('invalid_save');
      if(chat.attachments.some(ref=>!ref||typeof ref.id!=='string'||typeof ref.snapshotId!=='string'))throw Error('invalid_save');
      extras.chat=JSON.parse(JSON.stringify(chat));
    }
    return {...extras,evidenceRefs:[...new Set(refs)],falsifierIf,researchProgress:{hasRun:progress.hasRun,dirty:progress.dirty,hasEfficacy:progress.hasEfficacy,preferences:[...progress.preferences],resultPreferences:[...resultPreferences]}};
  }
  function create({client,config,engine,fetchImpl,recoveryClientFactory}){
    let saveEngine;
    function restore(raw){
      if(!saveEngine){
        const source=engine||root.FactorLabSimulation;
        saveEngine=source?.createSecuritiesEngine?source.createSecuritiesEngine():source?.createResearchStudioEngine?source.createResearchStudioEngine():source;
      }
      return saveEngine.restore(raw);
    }
    const error=(status,code)=>Object.assign(new Error(code),{status,code});
    let identity,epoch=0,recovery=null;const listeners=new Set();
    client.auth.onAuthStateChange((_event,session)=>{
      const id=session?.user?.id||null;
      if(identity!==id){identity=id;epoch++;setTimeout(()=>listeners.forEach(fn=>fn()),0);}
    });
    async function session(required=false){
      const {data,error:failure}=await client.auth.getSession();
      if(failure)throw error(401,'login_required');
      const value=data.session;
      if(required&&!value?.user)throw error(401,'login_required');
      if(identity===undefined)identity=value?.user?.id||null;
      return {value,epoch};
    }
    const guard=snapshot=>{if(snapshot.epoch!==epoch||(snapshot.value?.user?.id||null)!==identity)throw error(401,'session_changed');};
    const userView=user=>({enabled:true,user:user?{id:user.id,username:user.email||'Researcher'}:null,csrfToken:''});
    const authResult=result=>{if(result.error)throw error(result.error.status||503,result.error.code||'auth_unavailable');return result.data;};
    async function clearRecovery(){
      const previous=recovery;recovery=null;
      if(previous)try{await previous.client.auth.signOut({scope:'local'});}catch{}
    }
    async function selfService(path,body){
      if(config.selfService!==true)throw error(403,'registration_unavailable');
      if(path==='/api/auth/cancel'){await clearRecovery();return {ok:true};}
      const snapshot=await session();
      if(snapshot.value?.user){await clearRecovery();throw error(401,'session_changed');}
      const email=String(body.email||body.username||'').trim().toLowerCase();
      if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw error(422,'invalid_email');
      if(['/api/register','/api/auth/reset'].includes(path)&&(typeof body.password!=='string'||body.password.length<10||body.password.length>128))throw error(422,'weak_password');
      if(['/api/auth/verify','/api/auth/reset'].includes(path)&&!/^\d{6,10}$/.test(body.token||''))throw error(422,'invalid_otp');
      if(path==='/api/register'){
        const data=authResult(await client.auth.signUp({email,password:body.password}));
        if(data.session){await client.auth.signOut({scope:'local'});throw error(503,'email_confirmation_required');}
        guard(snapshot);return {verificationRequired:true};
      }
      if(path==='/api/auth/resend'){
        authResult(await client.auth.resend({type:'signup',email}));guard(snapshot);return {ok:true};
      }
      if(path==='/api/auth/verify'){
        const data=authResult(await client.auth.verifyOtp({email,token:body.token,type:'email'}));
        if(!data.session||!data.user)throw error(401,'otp_expired');
        return userView(data.user);
      }
      if(path==='/api/auth/recover'){
        await clearRecovery();authResult(await client.auth.resetPasswordForEmail(email));guard(snapshot);return {ok:true};
      }
      if(path==='/api/auth/reset'){
        if(recovery&&(recovery.email!==email||recovery.until<Date.now()))await clearRecovery();
        if(!recovery){
          if(!recoveryClientFactory)throw error(503,'auth_unavailable');
          const temporary=recoveryClientFactory();
          const data=authResult(await temporary.auth.verifyOtp({email,token:body.token,type:'recovery'}));
          if(!data.session||data.user?.email?.toLowerCase()!==email)throw error(401,'otp_expired');
          recovery={client:temporary,email,snapshot,until:Date.now()+300000};
        }
        try{guard(recovery.snapshot);}catch(failure){await clearRecovery();throw failure;}
        authResult(await recovery.client.auth.updateUser({password:body.password}));
        await clearRecovery();return {ok:true};
      }
      throw error(404,'not_found');
    }
    async function query(builder,snapshot){
      const result=await withTimeout(signal=>builder.abortSignal(signal));guard(snapshot);
      if(result.error){const code=result.error.code;throw error(code==='23505'?409:code==='42501'?403:code==='PGRST301'?401:422,code||'save_failed');}
      return result.data;
    }
    function validateEnvelope(envelope){
      try{if(envelope?.version!=='factorlab-ui-v3'||new TextEncoder().encode(JSON.stringify(envelope)).length>480000)throw Error();const state=restore(envelope.game);return {...envelope,...normalizeStudioFields(envelope,state)};}catch{throw error(422,'invalid_save');}
    }
    function metadata(row){
      let day='—',round='—',scenario='baseline';
      try{const s=restore(row.envelope?.game);day=s.day;round=s.round;scenario=s.scenario;}catch{}
      return {id:row.id,name:row.name,revision:row.revision,updatedAt:row.updated_at,day,round,scenario};
    }
    let primedSession;
    async function verifySession(){
      const snapshot=await session();
      guard(snapshot);
      if(!snapshot.value)return {view:userView(null),epoch:snapshot.epoch};
      const {data,error:failure}=await client.auth.getUser();
      guard(snapshot);
      if(failure)throw error(failure.status===401||failure.status===403?401:503,'session_unavailable');
      if(data.user?.id!==snapshot.value.user?.id)throw error(401,'session_changed');
      return {view:userView(data.user),epoch:snapshot.epoch};
    }
    function primeSession(){
      if(!primedSession)primedSession=verifySession().then(result=>({result}),failure=>({failure}));
    }
    async function request(path,options={}){
      const method=options.method||'GET',body=options.body?JSON.parse(options.body):{};
      if(path==='/api/register'||path.startsWith('/api/auth/'))return selfService(path,body);
      if(path==='/api/login'){
        const {data,error:failure}=await client.auth.signInWithPassword({email:body.username,password:body.password});
        if(failure)throw error(failure.status===429?429:401,failure.code||'invalid_credentials');
        return userView(data.user);
      }
      if(path==='/api/logout'){
        const {error:failure}=await client.auth.signOut({scope:'local'});if(failure)throw error(503,'logout_failed');return {ok:true};
      }
      if(path==='/api/session'){
        const prepared=primedSession;
        primedSession=undefined;
        if(prepared){
          const {result,failure}=await prepared;
          if(result?.epoch===epoch)return result.view;
          if(failure&&failure.code!=='session_changed')throw failure;
        }
        return (await verifySession()).view;
      }
      const s=await session(true),uid=s.value.user.id;
      const base=()=>client.from('factorlab_saves');
      if(path==='/api/saves'&&method==='GET'){
        const rows=await query(base().select('id,name,revision,updated_at,envelope,slot').eq('user_id',uid).order('slot').limit(12),s);
        return {saves:rows.map(metadata)};
      }
      if((path==='/api/saves'&&method==='POST')||(path.startsWith('/api/saves/')&&method==='PUT')){
        if(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>60)throw error(422,'invalid_name');
        body.envelope=validateEnvelope(body.envelope);
        if(method==='POST'){
          const rows=await query(base().select('slot').eq('user_id',uid).limit(12),s),used=new Set(rows.map(r=>r.slot));
          const slot=Array.from({length:12},(_,i)=>i+1).find(n=>!used.has(n));
          if(!slot)throw error(409,'save_limit');
          const inserted=await query(base().insert({slot,name:body.name.trim(),envelope:body.envelope}).select('id,name,revision,updated_at,envelope'),s);
          if(inserted.length!==1)throw error(422,'save_failed');return {save:metadata(inserted[0])};
        }
        if(!Number.isInteger(body.revision)||body.revision<1)throw error(422,'invalid_revision');
        const rows=await query(base().update({name:body.name.trim(),envelope:body.envelope}).eq('user_id',uid).eq('id',decodeURIComponent(path.slice(11))).eq('revision',body.revision).select('id,name,revision,updated_at,envelope'),s);
        if(rows.length!==1)throw error(409,'revision_conflict');return {save:metadata(rows[0])};
      }
      if(path.startsWith('/api/saves/')&&method==='GET'){
        const rows=await query(base().select('id,name,revision,updated_at,envelope').eq('user_id',uid).eq('id',decodeURIComponent(path.slice(11))).limit(1),s);
        if(rows.length!==1)throw error(404,'save_not_found');const envelope=validateEnvelope(rows[0].envelope);return {save:{...metadata(rows[0]),envelope}};
      }
      throw error(404,'not_found');
    }
    async function coach(body,signal){
      const s=await session(true);if(!s.value.user.email_confirmed_at)throw error(403,'verified_email_required');
      const response=await fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+s.value.access_token,'Content-Type':'application/json'},body:JSON.stringify(body),signal});
      const value=await response.json();guard(s);if(!response.ok)throw error(response.status,value.error||'connection_failed');return value;
    }
    async function coachStream(body,signal,onEvent){
      const s=await session(true);if(!s.value.user.email_confirmed_at)throw error(403,'verified_email_required');
      const send=()=>{
        if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
        return fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+s.value.access_token,'Content-Type':'application/json'},body:JSON.stringify({...body,stream:true}),signal});
      };
      let response=await send();
      const retryAfter=Number(response.headers.get('retry-after'));
      if(!body.proactive&&response.status===429&&Number.isInteger(retryAfter)&&retryAfter>=1&&retryAfter<=10){
        void response.body?.cancel().catch(()=>{});
        guard(s);
        onEvent?.('cooldown',{seconds:retryAfter});
        await new Promise(resolve=>{
          if(signal?.aborted){resolve();return;}
          function finish(){clearTimeout(timer);signal?.removeEventListener('abort',finish);resolve();}
          const timer=setTimeout(finish,retryAfter*1000+100);
          signal?.addEventListener('abort',finish,{once:true});
        });
        if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
        guard(s);
        onEvent?.('retry',{});
        response=await send();
      }
      const parser=root.FactorLabCoachStream||(typeof require==='function'?require('./coach-stream.js'):null);
      const result=await parser.consume(response,(type,value)=>{guard(s);onEvent?.(type,value);},signal);guard(s);return result;
    }
    let support,checkedAt=0;
    function supportsActivity(){
      if(!support||Date.now()-checkedAt>60000){
        checkedAt=Date.now();
        support=withTimeout(signal=>fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'OPTIONS',signal}))
          .then(response=>response.ok&&response.headers.get('x-factorlab-coach')==='action-context-v1')
          .catch(()=>false);
      }
      return support;
    }
    return {request,coach,coachStream,supportsActivity,primeSession,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={create,normalizeStudioFields};return;}
  if(!root.FactorLabCloudConfig)return;
  const config=root.FactorLabCloudConfig;
  const sessionKey='factorlab-supabase-session-v1';
  function connect(){
    const client=root.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:sessionKey},global:{fetch:sdkFetch}});
    return create({client,config,fetchImpl:fetch,recoveryClientFactory:()=>root.supabase.createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'factorlab-recovery-memory'},global:{fetch:sdkFetch}})});
  }
  if(root.supabase?.createClient)root.FactorLabCloud=connect();
  else {
    const sdkURL=new URL('vendor/supabase-2.118.0.js',document.currentScript.src);
    const listeners=new Set();
    let service,loading;
    function hasSession(){
      try{return !!localStorage.getItem(sessionKey);}catch{return true;}
    }
    function load(){
      if(!loading)loading=new Promise((resolve,reject)=>{
        const tag=document.createElement('script');
        tag.src=sdkURL.href;
        tag.onload=()=>{
          try{service=connect();service.subscribe(()=>listeners.forEach(fn=>fn()));resolve(service);}
          catch(error){loading=null;reject(error);}
        };
        tag.onerror=()=>{tag.remove();loading=null;reject(Object.assign(Error('auth_unavailable'),{status:503}));};
        document.head.append(tag);
      });
      return loading;
    }
    root.FactorLabCloud={
      request(path,options){
        if(path==='/api/session'&&!service&&!loading&&!hasSession())return Promise.resolve({enabled:true,user:null,csrfToken:''});
        return load().then(client=>client.request(path,options));
      },
      coach(...args){return load().then(client=>client.coach(...args));},
      coachStream(...args){return load().then(client=>client.coachStream(...args));},
      supportsActivity(){return hasSession()?load().then(client=>client.supportsActivity()).catch(()=>false):Promise.resolve(false);},
      subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
      primeSession(){if(hasSession())void load().then(client=>client.primeSession()).catch(()=>{});}
    };
    root.addEventListener('storage',event=>{
      if((event.key===sessionKey||event.key===null)&&!service)listeners.forEach(fn=>fn());
    });
  }
  if(root.document.getElementById('auth-loading'))root.FactorLabCloud.primeSession();
})(typeof window==='undefined'?globalThis:window);

;
(function(root){
  'use strict';
  if(typeof module==='object'&&module.exports){module.exports=require('./entry.js');return;}
  const $=id=>document.getElementById(id),cloud=root.FactorLabCloud,cloudMode=!!root.FactorLabCloudConfig;
  const staticHosting=document.querySelector('meta[name="factorlab-hosting"]')?.content==='static'&&!cloudMode;
  const selfService=cloudMode&&root.FactorLabCloudConfig.selfService===true,guestKey='factorlab-v3-guest-session';
  let lang='zh-CN',mode=new URLSearchParams(location.search).get('mode')||'login',busy=true,enabled=false,csrf='',unconfirmed=false,leaving=false;
  let message='',messageError=false,sessionNotice=null,resendTimer;const cooldowns=new Map();
  if(!['login','register','forgot'].includes(mode))mode='login';
  if(staticHosting || mode==='forgot'&&!selfService || mode==='register'&&cloudMode&&!selfService)mode='login';
  try{lang=localStorage.getItem('factorlab-simulation-language-v3')==='en'?'en':'zh-CN';}catch{}
  let hasBrowserProgress=false;
  try{hasBrowserProgress=!!(localStorage.getItem('factorlab-simulation-ui-v3')||localStorage.getItem('factorlab-simulation-ui-v2'));}catch{}
  const tr=(zh,en)=>lang==='en'?en:zh;
  const strings={login:[$('auth-title').dataset.zh,$('auth-title').dataset.en],register:['创建你的账号','Create your account'],forgot:['找回密码','Reset your password'],verify:['查看你的邮箱','Check your email'],reset:['设置新密码','Set a new password']};
  const intros={login:[$('auth-subtitle').dataset.zh,$('auth-subtitle').dataset.en],register:cloudMode?['用邮箱开始，验证后进入 FactorLab。','Start with your email, then verify it to enter FactorLab.']:['设置此本机账号的用户名和密码，保存你的练习。','Choose a username and password to save your practice on this local server.'],forgot:['我们会发送重设密码的验证码。','We’ll send a code to reset your password.'],verify:['输入邮件里的验证码，完成注册。','Enter the code from your email to complete registration.'],reset:['验证邮箱并设置新密码，原账号与存档会保留。','Verify your email and set a new password. Your account and saves stay intact.']};
  const submitLabels={login:['登录','Sign in'],register:['创建账号','Create account'],forgot:['发送验证码','Send code'],verify:['验证并进入','Verify & continue'],reset:['更新密码','Update password']};
  function showStatus(){
    const box=$('auth-status');
    box.textContent=message||(sessionNotice?tr(...sessionNotice.text):'');
    box.classList.toggle('error',message?messageError:!!sessionNotice?.error);
  }
  function status(text,error=false){message=text;messageError=error;showStatus();}
  function updatePasswordToggle(button,input){
    const visible=input.type==='text';
    button.setAttribute('aria-pressed',String(visible));
    button.setAttribute('aria-label',visible?tr('隐藏密码','Hide password'):tr('显示密码','Show password'));
  }
  function cooldownKey(){return(mode==='reset'?'reset:':'verify:')+$('auth-email').value.trim().toLowerCase();}
  function paint(){
    document.documentElement.lang=lang;document.title=strings[mode][lang==='en'?1:0]+' · FactorLab';$('auth-language').value=lang;
    document.querySelectorAll('[data-zh]').forEach(el=>el.textContent=lang==='en'?el.dataset.en:el.dataset.zh);
    $('auth-title').textContent=strings[mode][lang==='en'?1:0];$('auth-subtitle').textContent=intros[mode][lang==='en'?1:0];
    if(mode==='login'&&hasBrowserProgress)$('auth-title').textContent=tr('继续行业配置练习','Resume your sector practice');
    if(hasBrowserProgress)$('guest-label').textContent=tr('继续此浏览器的练习','Continue this browser’s practice');
    $('signin-divider').hidden=mode!=='login';
    $('email-label').textContent=cloudMode?tr('邮箱','Email'):tr('用户名','Username');$('auth-email').type=cloudMode?'email':'text';$('auth-email').placeholder=cloudMode?'you@example.com':tr('你的用户名','Your username');
    $('password-field').hidden=['forgot','verify'].includes(mode);$('confirm-field').hidden=!['register','reset'].includes(mode);$('code-field').hidden=!['verify','reset'].includes(mode)&&!unconfirmed;$('auth-code').hidden=unconfirmed&&mode==='login';$('code-field').querySelector('label').hidden=$('auth-code').hidden;
    $('password-label').textContent=mode==='reset'?tr('新密码','New password'):tr('密码','Password');$('auth-password').autocomplete=['register','reset'].includes(mode)?'new-password':'current-password';
    $('auth-password').required=!$('password-field').hidden;$('auth-confirm-password').required=!$('confirm-field').hidden;$('auth-code').required=!$('code-field').hidden;
    $('auth-forgot').hidden=!selfService||mode!=='login';$('auth-forgot').textContent=tr('忘记密码？','Forgot password?');
    $('auth-switch').hidden=mode!=='login'||cloudMode&&!selfService||!enabled;$('auth-switch-caption').hidden=$('auth-switch').hidden;
    $('auth-back').hidden=mode==='login';$('auth-back').textContent=tr('返回登录','Back to sign in');
    $('auth-submit').textContent=busy?tr('请稍候…','Please wait…'):submitLabels[mode][lang==='en'?1:0];
    $('auth-form').setAttribute('aria-busy',String(busy));$('auth-form').querySelectorAll('input,button').forEach(el=>el.disabled=busy||!enabled);$('auth-switch').disabled=busy;$('auth-back').disabled=busy;$('auth-forgot').disabled=busy||!enabled;$('auth-language').disabled=leaving;
    for(const id of ['auth-password-toggle','auth-confirm-toggle']){const button=$(id);updatePasswordToggle(button,$(button.getAttribute('aria-controls')));}
    showStatus();updateResend();
  }
  function updateResend(){
    clearTimeout(resendTimer);
    const remaining=Math.max(0,Math.ceil(((cooldowns.get(cooldownKey())||0)-Date.now())/1000));
    $('auth-resend').textContent=remaining?tr(remaining+' 秒后可重发','Resend in '+remaining+'s'):tr('重新发送','Resend code');
    $('auth-resend').disabled=busy||!enabled||remaining>0;
    if(remaining>0&&!$('code-field').hidden)resendTimer=setTimeout(updateResend,1000);
  }
  function clearSensitive(){for(const id of ['auth-password','auth-confirm-password','auth-code']){$(id).value='';if(id!=='auth-code')$(id).type='password';}}
  async function request(path,options={}){
    if(cloudMode){if(!cloud)throw Error('cloud_unavailable');return cloud.request(path,options);}
    if(staticHosting)throw Error('offline');const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{const response=await fetch(path,{...options,headers:{Accept:'application/json',...(options.method?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},credentials:'same-origin',cache:'no-store',signal:controller.signal});const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error||'request'),{status:response.status,code:data.error});return data;}finally{clearTimeout(timer);}
  }
  function post(path,body){return request(path,{method:'POST',body:JSON.stringify(body)});}
  function failure(error){
    const key=error.code||error.message;
    const map={invalid_credentials:['邮箱或密码不正确。','Email or password is incorrect.'],email_not_confirmed:['请先验证邮箱。可重新发送验证码。','Verify your email first. You can request another code.'],invalid_otp:['验证码不正确或已失效。','The code is incorrect or expired.'],otp_expired:['验证码不正确或已失效。','The code is incorrect or expired.'],weak_password:['请使用 10–128 个字符的密码。','Use a password with 10–128 characters.'],same_password:['请使用不同的新密码。','Choose a different new password.'],email_confirmation_required:['邮箱验证服务暂不可用，请稍后重试。','Email verification is unavailable. Try again later.'],registration_unavailable:['注册或密码重设暂未开放。','Registration or password reset is not available.'],session_changed:['账号状态已改变，请重新登录。','Your session changed. Sign in again.']};
    status(map[key]?tr(...map[key]):error.status===401?tr('账号或密码不正确。','Account or password is incorrect.'):error.status===409?tr('此账号已存在，请登录。','This account already exists. Sign in instead.'):error.status===429?tr('请求过于频繁，请稍后重试。','Too many requests. Try again later.'):tr('暂时无法连接，请稍后重试。','Unable to connect. Please try again.'),true);
    if(key==='email_not_confirmed'){unconfirmed=true;$('code-field').hidden=false;$('auth-code').hidden=true;}
  }
  function enter(){
    if(leaving||root.FactorLabEntry?.leaving)return;leaving=true;clearSensitive();
    try{sessionStorage.removeItem(guestKey);}catch{}
    try{localStorage.setItem('factorlab-v3-welcome-seen','1');}catch{}
    const requested=new URLSearchParams(location.search).get('return');
    const base=new URL('./',location.href).pathname;
    const next=requested?(root.FactorLabEntry?.safeReturn(requested,location.href)||base+'#/research'):base;
    location.replace(next);
  }
  async function switchMode(next){if(busy)return;if(mode==='reset')await post('/api/auth/cancel',{}).catch(()=>{});mode=next;unconfirmed=false;clearSensitive();$('auth-code').hidden=false;status('');paint();$('auth-email').focus();}
  $('auth-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!enabled)return;const email=$('auth-email').value.trim(),password=$('auth-password').value,token=$('auth-code').value.trim(),action=mode;
    if(!(cloudMode?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email):/^[A-Za-z0-9_-]{3,32}$/.test(email)))return status(cloudMode?tr('请输入有效邮箱。','Enter a valid email.'):tr('用户名需为 3–32 位字母、数字、_ 或 -。','Use 3–32 letters, numbers, _ or -.'),true);
    if(['login','register','reset'].includes(action)&&(password.length<(action==='login'&&cloudMode?1:10)||password.length>128))return status(tr('请输入有效密码；新密码需为 10–128 个字符。','Enter a valid password. New passwords need 10–128 characters.'),true);
    if(['register','reset'].includes(action)&&password!==$('auth-confirm-password').value)return status(tr('两次密码不一致。','Passwords do not match.'),true);
    if(['verify','reset'].includes(action)&&!/^\d{6,10}$/.test(token))return status(tr('请输入邮件中的 6–10 位验证码。','Enter the 6–10 digit code from your email.'),true);
    busy=true;status('');paint();
    try{const endpoint={login:'/api/login',register:'/api/register',forgot:'/api/auth/recover',verify:'/api/auth/verify',reset:'/api/auth/reset'}[action],result=await post(endpoint,{username:email,email,password,token});
      if(action==='login'||action==='verify'||action==='register'&&!cloudMode){if(!result.user?.id)throw Error('session');enter();return;}
      clearSensitive();if(action==='reset'){mode='login';status(tr('密码已更新，请用新密码登录。','Password updated. Sign in with your new password.'));}
      else{mode=action==='register'?'verify':'reset';cooldowns.set(cooldownKey(),Date.now()+60000);status(action==='forgot'?tr('若此邮箱已注册，将收到验证码。请检查收件箱和垃圾邮件。','If this email is registered, a code will arrive. Check your inbox and spam folder.'):tr('验证码已请求，请检查收件箱和垃圾邮件。','Code requested. Check your inbox and spam folder.'));}
    }catch(error){failure(error);}finally{busy=false;paint();if(unconfirmed){$('code-field').hidden=false;$('auth-code').hidden=true;}}
  });
  $('auth-resend').onclick=async()=>{if(busy||!enabled||(cooldowns.get(cooldownKey())||0)>Date.now())return;const email=$('auth-email').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return status(tr('请输入有效邮箱。','Enter a valid email.'),true);busy=true;paint();try{await post(mode==='reset'?'/api/auth/recover':'/api/auth/resend',{email});if(unconfirmed){mode='verify';unconfirmed=false;$('auth-code').hidden=false;}cooldowns.set(cooldownKey(),Date.now()+60000);status(tr('验证码已请求，请查看邮箱。','Code requested. Check your email.'));}catch(error){failure(error);if(error.status===429)cooldowns.set(cooldownKey(),Date.now()+60000);}finally{busy=false;paint();}};
  $('auth-switch').onclick=()=>switchMode('register');$('auth-back').onclick=()=>switchMode('login');$('auth-forgot').onclick=()=>switchMode('forgot');
  $('auth-guest').addEventListener('click',event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    leaving=true;clearSensitive();
    if(selfService&&mode==='reset')void post('/api/auth/cancel',{}).catch(()=>{});
  },true);
  $('auth-language').onchange=()=>{lang=$('auth-language').value;try{localStorage.setItem('factorlab-simulation-language-v3',lang);}catch{}status('');paint();};
  for(const id of ['auth-password-toggle','auth-confirm-toggle']){
    const button=$(id),input=$(button.getAttribute('aria-controls'));
    button.addEventListener('pointerdown',event=>{if(document.activeElement===input)event.preventDefault();});
    button.onclick=()=>{
      const start=input.selectionStart,end=input.selectionEnd,direction=input.selectionDirection;
      input.type=input.type==='password'?'text':'password';
      updatePasswordToggle(button,input);
      input.focus({preventScroll:true});
      if(start!==null&&end!==null)input.setSelectionRange(start,end,direction);
    };
  }
  const video=$('login-animation'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const constrained=navigator.connection?.saveData||/(^|-)2g$/.test(navigator.connection?.effectiveType||'');
  let animationFailed=false,automaticAttempted=false,mediaReady=false,inView=!('IntersectionObserver' in root);
  async function playAnimation(){
    if(animationFailed||leaving)return;
    automaticAttempted=true;
    if(!video.hasAttribute('src'))video.src=video.dataset.src;
    try{await video.play();}catch{}
  }
  function startAnimation(){
    if(mediaReady&&inView&&!constrained&&!automaticAttempted&&!reduced.matches&&!document.hidden)void playAnimation();
  }
  if(!inView){
    const observer=new IntersectionObserver(entries=>{
      inView=entries[0].isIntersecting;
      if(inView)startAnimation();
    });
    observer.observe(video);
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  }
  video.muted=true;video.loop=false;
  video.addEventListener('error',()=>{animationFailed=true;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startAnimation();});
  const motionChanged=()=>{if(reduced.matches)video.pause();else startAnimation();};
  if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',motionChanged);
  else reduced.addListener?.(motionChanged);
  window.addEventListener('pagehide',()=>{clearTimeout(resendTimer);clearSensitive();video.pause();});
  paint();
  (async()=>{
    try{
      if(staticHosting){
        sessionNotice={text:['浏览器练习版，可直接以游客进入。','Browser edition. Continue as a guest.']};
      }else{
        const result=await request('/api/session');
        enabled=result.enabled===true;csrf=result.csrfToken||'';
        if(result.user?.id){enter();return;}
        if(!enabled)sessionNotice={text:['账号服务未连接，可先以游客体验。','Account service is unavailable. Explore as a guest.']};
      }
    }catch{
      sessionNotice={text:['账号服务暂不可用，可先以游客进入练习。','Account service is unavailable. You can enter as a guest.'],error:true};
      enabled=cloudMode;
    }finally{
      busy=false;paint();root.FactorLabAuth={ready:true,getMode:()=>mode};
      const allowMedia=()=>{mediaReady=true;startAnimation();};
      const queueMedia=()=>{
        if('requestIdleCallback' in root)root.requestIdleCallback(allowMedia,{timeout:1500});
        else allowMedia();
      };
      if(matchMedia('(max-width:760px)').matches)setTimeout(queueMedia,600);
      else queueMedia();
    }
  })();
})(typeof window==='undefined'?globalThis:window);
