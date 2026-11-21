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
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).i18next=t()}(this,function(){"use strict";const e=e=>"string"==typeof e,t=()=>{let e,t;const s=new Promise((s,i)=>{e=s,t=i});return s.resolve=e,s.reject=t,s},s=e=>null==e?"":String(e),i=/###/g,o=e=>e&&e.includes("###")?e.replace(i,"."):e,n=t=>!t||e(t),r=(t,s,i)=>{const r=e(s)?s.split("."):s;let a=0;for(;a<r.length-1;){if(n(t))return{};const e=o(r[a]);!t[e]&&i&&(t[e]=new i),t=Object.prototype.hasOwnProperty.call(t,e)?t[e]:{},++a}return n(t)?{}:{obj:t,k:o(r[a])}},a=(e,t,s)=>{const{obj:i,k:o}=r(e,t,Object);if(void 0!==i||1===t.length)return void(i[o]=s);let n=t[t.length-1],a=t.slice(0,t.length-1),l=r(e,a,Object);for(;void 0===l.obj&&a.length;)n=`${a[a.length-1]}.${n}`,a=a.slice(0,a.length-1),l=r(e,a,Object),l?.obj&&void 0!==l.obj[`${l.k}.${n}`]&&(l.obj=void 0);l.obj[`${l.k}.${n}`]=s},l=(e,t)=>{const{obj:s,k:i}=r(e,t);if(s&&Object.prototype.hasOwnProperty.call(s,i))return s[i]},c=(t,s,i)=>{for(const o in s)"__proto__"!==o&&"constructor"!==o&&(o in t?e(t[o])||t[o]instanceof String||e(s[o])||s[o]instanceof String?i&&(t[o]=s[o]):c(t[o],s[o],i):t[o]=s[o]);return t},h=e=>e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"),u={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"},p=t=>e(t)?t.replace(/[&<>"'\/]/g,e=>u[e]):t;const g=[" ",",","?","!",";"],d=new class{constructor(e){this.capacity=e,this.regExpMap=new Map,this.regExpQueue=[]}getRegExp(e){const t=this.regExpMap.get(e);if(void 0!==t)return t;const s=new RegExp(e);return this.regExpQueue.length===this.capacity&&this.regExpMap.delete(this.regExpQueue.shift()),this.regExpMap.set(e,s),this.regExpQueue.push(e),s}}(20),f=(e,t,s=".")=>{if(!e)return;if(e[t]){if(!Object.prototype.hasOwnProperty.call(e,t))return;return e[t]}const i=t.split(s);let o=e;for(let e=0;e<i.length;){if(!o||"object"!=typeof o)return;let t,n="";for(let r=e;r<i.length;++r)if(r!==e&&(n+=s),n+=i[r],t=o[n],void 0!==t){if(["string","number","boolean"].includes(typeof t)&&r<i.length-1)continue;e+=r-e+1;break}o=t}return o},m=e=>e?.replace(/_/g,"-"),y={type:"logger",log(e){this.output("log",e)},warn(e){this.output("warn",e)},error(e){this.output("error",e)},output(e,t){console?.[e]?.apply?.(console,t)}};class v{constructor(e,t={}){this.init(e,t)}init(e,t={}){this.prefix=t.prefix||"i18next:",this.logger=e||y,this.options=t,this.debug=t.debug}log(...e){return this.forward(e,"log","",!0)}warn(...e){return this.forward(e,"warn","",!0)}error(...e){return this.forward(e,"error","")}deprecate(...e){return this.forward(e,"warn","WARNING DEPRECATED: ",!0)}forward(t,s,i,o){return o&&!this.debug?null:(e(t[0])&&(t[0]=`${i}${this.prefix} ${t[0]}`),this.logger[s](t))}create(e){return new v(this.logger,{prefix:`${this.prefix}:${e}:`,...this.options})}clone(e){return(e=e||this.options).prefix=e.prefix||this.prefix,new v(this.logger,e)}}var b=new v;class x{constructor(){this.observers={}}on(e,t){return e.split(" ").forEach(e=>{this.observers[e]||(this.observers[e]=new Map);const s=this.observers[e].get(t)||0;this.observers[e].set(t,s+1)}),this}off(e,t){this.observers[e]&&(t?this.observers[e].delete(t):delete this.observers[e])}once(e,t){const s=(...i)=>{t(...i),this.off(e,s)};return this.on(e,s),this}emit(e,...t){if(this.observers[e]){Array.from(this.observers[e].entries()).forEach(([e,s])=>{for(let i=0;i<s;i++)e(...t)})}if(this.observers["*"]){Array.from(this.observers["*"].entries()).forEach(([s,i])=>{for(let o=0;o<i;o++)s(e,...t)})}}}class k extends x{constructor(e,t={ns:["translation"],defaultNS:"translation"}){super(),this.data=e||{},this.options=t,void 0===this.options.keySeparator&&(this.options.keySeparator="."),void 0===this.options.ignoreJSONStructure&&(this.options.ignoreJSONStructure=!0)}addNamespaces(e){this.options.ns.includes(e)||this.options.ns.push(e)}removeNamespaces(e){const t=this.options.ns.indexOf(e);t>-1&&this.options.ns.splice(t,1)}getResource(t,s,i,o={}){const n=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator,r=void 0!==o.ignoreJSONStructure?o.ignoreJSONStructure:this.options.ignoreJSONStructure;let a;t.includes(".")?a=t.split("."):(a=[t,s],i&&(Array.isArray(i)?a.push(...i):e(i)&&n?a.push(...i.split(n)):a.push(i)));const c=l(this.data,a);return c||s||i||!t.includes(".")||(t=a[0],s=a[1],i=a.slice(2).join(".")),!c&&r&&e(i)?f(this.data?.[t]?.[s],i,n):c}addResource(e,t,s,i,o={silent:!1}){const n=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator;let r=[e,t];s&&(r=r.concat(n?s.split(n):s)),e.includes(".")&&(r=e.split("."),i=t,t=r[1]),this.addNamespaces(t),a(this.data,r,i),o.silent||this.emit("added",e,t,s,i)}addResources(t,s,i,o={silent:!1}){for(const o in i)(e(i[o])||Array.isArray(i[o]))&&this.addResource(t,s,o,i[o],{silent:!0});o.silent||this.emit("added",t,s,i)}addResourceBundle(e,t,s,i,o,n={silent:!1,skipCopy:!1}){let r=[e,t];e.includes(".")&&(r=e.split("."),i=s,s=t,t=r[1]),this.addNamespaces(t);let h=l(this.data,r)||{};n.skipCopy||(s=JSON.parse(JSON.stringify(s))),i?c(h,s,o):h={...h,...s},a(this.data,r,h),n.silent||this.emit("added",e,t,s)}removeResourceBundle(e,t){this.hasResourceBundle(e,t)&&delete this.data[e][t],this.removeNamespaces(t),this.emit("removed",e,t)}hasResourceBundle(e,t){return void 0!==this.getResource(e,t)}getResourceBundle(e,t){return t||(t=this.options.defaultNS),this.getResource(e,t)}getDataByLanguage(e){return this.data[e]}hasLanguageSomeTranslations(e){const t=this.getDataByLanguage(e);return!!(t&&Object.keys(t)||[]).find(e=>t[e]&&Object.keys(t[e]).length>0)}toJSON(){return this.data}}var S={processors:{},addPostProcessor(e){this.processors[e.name]=e},handle(e,t,s,i,o){return e.forEach(e=>{t=this.processors[e]?.process(t,s,i,o)??t}),t}};const L=Symbol("i18next/PATH_KEY");function w(e,t){const{[L]:s}=e(function(){const e=[],t=Object.create(null);let s;return t.get=(i,o)=>(s?.revoke?.(),o===L?e:(e.push(o),s=Proxy.revocable(i,t),s.proxy)),Proxy.revocable(Object.create(null),t).proxy}()),i=t?.keySeparator??".",o=t?.nsSeparator??":";if(s.length>1&&o){const e=t?.ns,n=Array.isArray(e)?e:null;if(n&&n.length>1&&n.slice(1).includes(s[0]))return`${s[0]}${o}${s.slice(1).join(i)}`}return s.join(i)}const $=t=>!e(t)&&"boolean"!=typeof t&&"number"!=typeof t;class O extends x{constructor(e,t={}){var s,i;super(),s=e,i=this,["resourceStore","languageUtils","pluralResolver","interpolator","backendConnector","i18nFormat","utils"].forEach(e=>{s[e]&&(i[e]=s[e])}),this.options=t,void 0===this.options.keySeparator&&(this.options.keySeparator="."),this.logger=b.create("translator"),this.checkedLoadedFor={}}changeLanguage(e){e&&(this.language=e)}exists(e,t={interpolation:{}}){const s={...t};if(null==e)return!1;const i=this.resolve(e,s);if(void 0===i?.res)return!1;const o=$(i.res);return!1!==s.returnObjects||!o}extractFromKey(t,s){let i=void 0!==s.nsSeparator?s.nsSeparator:this.options.nsSeparator;void 0===i&&(i=":");const o=void 0!==s.keySeparator?s.keySeparator:this.options.keySeparator;let n=s.ns||this.options.defaultNS||[];const r=i&&t.includes(i),a=!(this.options.userDefinedKeySeparator||s.keySeparator||this.options.userDefinedNsSeparator||s.nsSeparator||((e,t,s)=>{t=t||"",s=s||"";const i=g.filter(e=>!t.includes(e)&&!s.includes(e));if(0===i.length)return!0;const o=d.getRegExp(`(${i.map(e=>"?"===e?"\\?":e).join("|")})`);let n=!o.test(e);if(!n){const t=e.indexOf(s);t>0&&!o.test(e.substring(0,t))&&(n=!0)}return n})(t,i,o));if(r&&!a){const s=t.match(this.interpolator.nestingRegexp);if(s&&s.length>0)return{key:t,namespaces:e(n)?[n]:n};const r=t.split(i);(i!==o||i===o&&this.options.ns.includes(r[0]))&&(n=r.shift()),t=r.join(o)}return{key:t,namespaces:e(n)?[n]:n}}translate(t,s,i){let o="object"==typeof s?{...s}:s;if("object"!=typeof o&&this.options.overloadTranslationOptionHandler&&(o=this.options.overloadTranslationOptionHandler(arguments)),"object"==typeof o&&(o={...o}),o||(o={}),null==t)return"";"function"==typeof t&&(t=w(t,{...this.options,...o})),Array.isArray(t)||(t=[String(t)]),t=t.map(e=>"function"==typeof e?w(e,{...this.options,...o}):String(e));const n=void 0!==o.returnDetails?o.returnDetails:this.options.returnDetails,r=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator,{key:a,namespaces:l}=this.extractFromKey(t[t.length-1],o),c=l[l.length-1];let h=void 0!==o.nsSeparator?o.nsSeparator:this.options.nsSeparator;void 0===h&&(h=":");const u=o.lng||this.language,p=o.appendNamespaceToCIMode||this.options.appendNamespaceToCIMode;if("cimode"===u?.toLowerCase())return p?n?{res:`${c}${h}${a}`,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:c,usedParams:this.getUsedParamsDetails(o)}:`${c}${h}${a}`:n?{res:a,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:c,usedParams:this.getUsedParamsDetails(o)}:a;const g=this.resolve(t,o);let d=g?.res;const f=g?.usedKey||a,m=g?.exactUsedKey||a,y=void 0!==o.joinArrays?o.joinArrays:this.options.joinArrays,v=!this.i18nFormat||this.i18nFormat.handleAsObject,b=void 0!==o.count&&!e(o.count),x=O.hasDefaultValue(o),k=b?this.pluralResolver.getSuffix(u,o.count,o):"",S=o.ordinal&&b?this.pluralResolver.getSuffix(u,o.count,{ordinal:!1}):"",L=b&&!o.ordinal&&0===o.count,R=L&&o[`defaultValue${this.options.pluralSeparator}zero`]||o[`defaultValue${k}`]||o[`defaultValue${S}`]||o.defaultValue;let C=d;v&&!d&&x&&(C=R);const P=$(C),j=Object.prototype.toString.apply(C);if(!(v&&C&&P)||["[object Number]","[object Function]","[object RegExp]"].includes(j)||e(y)&&Array.isArray(C))if(v&&e(y)&&Array.isArray(d))d=d.join(y),d&&(d=this.extendTranslation(d,t,o,i));else{let e=!1,s=!1;!this.isValidLookup(d)&&x&&(e=!0,d=R),this.isValidLookup(d)||(s=!0,d=a);const n=(o.missingKeyNoValueFallbackToKey||this.options.missingKeyNoValueFallbackToKey)&&s?void 0:d,l=x&&R!==d&&this.options.updateMissing;if(s||e||l){if(this.logger.log(l?"updateKey":"missingKey",u,c,a,l?R:d),r){const e=this.resolve(a,{...o,keySeparator:!1});e&&e.res&&this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")}let e=[];const t=this.languageUtils.getFallbackCodes(this.options.fallbackLng,o.lng||this.language);if("fallback"===this.options.saveMissingTo&&t&&t[0])for(let s=0;s<t.length;s++)e.push(t[s]);else"all"===this.options.saveMissingTo?e=this.languageUtils.toResolveHierarchy(o.lng||this.language):e.push(o.lng||this.language);const s=(e,t,s)=>{const i=x&&s!==d?s:n;this.options.missingKeyHandler?this.options.missingKeyHandler(e,c,t,i,l,o):this.backendConnector?.saveMissing&&this.backendConnector.saveMissing(e,c,t,i,l,o),this.emit("missingKey",e,c,t,d)};this.options.saveMissing&&(this.options.saveMissingPlurals&&b?e.forEach(e=>{const t=this.pluralResolver.getSuffixes(e,o);L&&o[`defaultValue${this.options.pluralSeparator}zero`]&&!t.includes(`${this.options.pluralSeparator}zero`)&&t.push(`${this.options.pluralSeparator}zero`),t.forEach(t=>{s([e],a+t,o[`defaultValue${t}`]||R)})}):s(e,a,R))}d=this.extendTranslation(d,t,o,g,i),s&&d===a&&this.options.appendNamespaceToMissingKey&&(d=`${c}${h}${a}`),(s||e)&&this.options.parseMissingKeyHandler&&(d=this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey?`${c}${h}${a}`:a,e?d:void 0,o))}else{if(!o.returnObjects&&!this.options.returnObjects){this.options.returnedObjectHandler||this.logger.warn("accessing an object - but returnObjects options is not enabled!");const e=this.options.returnedObjectHandler?this.options.returnedObjectHandler(f,C,{...o,ns:l}):`key '${a} (${this.language})' returned an object instead of string.`;return n?(g.res=e,g.usedParams=this.getUsedParamsDetails(o),g):e}if(r){const e=Array.isArray(C),t=e?[]:{},s=e?m:f;for(const e in C)if(Object.prototype.hasOwnProperty.call(C,e)){const i=`${s}${r}${e}`;t[e]=x&&!d?this.translate(i,{...o,defaultValue:$(R)?R[e]:void 0,joinArrays:!1,ns:l}):this.translate(i,{...o,joinArrays:!1,ns:l}),t[e]===i&&(t[e]=C[e])}d=t}}return n?(g.res=d,g.usedParams=this.getUsedParamsDetails(o),g):d}extendTranslation(t,s,i,o,n){if(this.i18nFormat?.parse)t=this.i18nFormat.parse(t,{...this.options.interpolation.defaultVariables,...i},i.lng||this.language||o.usedLng,o.usedNS,o.usedKey,{resolved:o});else if(!i.skipInterpolation){i.interpolation&&this.interpolator.init({...i,interpolation:{...this.options.interpolation,...i.interpolation}});const r=e(t)&&(void 0!==i?.interpolation?.skipOnVariables?i.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables);let a;if(r){const e=t.match(this.interpolator.nestingRegexp);a=e&&e.length}let l=i.replace&&!e(i.replace)?i.replace:i;if(this.options.interpolation.defaultVariables&&(l={...this.options.interpolation.defaultVariables,...l}),t=this.interpolator.interpolate(t,l,i.lng||this.language||o.usedLng,i),r){const e=t.match(this.interpolator.nestingRegexp);a<(e&&e.length)&&(i.nest=!1)}!i.lng&&o&&o.res&&(i.lng=this.language||o.usedLng),!1!==i.nest&&(t=this.interpolator.nest(t,(...e)=>n?.[0]!==e[0]||i.context?this.translate(...e,s):(this.logger.warn(`It seems you are nesting recursively key: ${e[0]} in key: ${s[0]}`),null),i)),i.interpolation&&this.interpolator.reset()}const r=i.postProcess||this.options.postProcess,a=e(r)?[r]:r;return null!=t&&a?.length&&!1!==i.applyPostProcessor&&(t=S.handle(a,t,s,this.options&&this.options.postProcessPassResolved?{i18nResolved:{...o,usedParams:this.getUsedParamsDetails(i)},...i}:i,this)),t}resolve(t,s={}){let i,o,n,r,a;return e(t)&&(t=[t]),Array.isArray(t)&&(t=t.map(e=>"function"==typeof e?w(e,{...this.options,...s}):e)),t.forEach(t=>{if(this.isValidLookup(i))return;const l=this.extractFromKey(t,s),c=l.key;o=c;let h=l.namespaces;this.options.fallbackNS&&(h=h.concat(this.options.fallbackNS));const u=void 0!==s.count&&!e(s.count),p=u&&!s.ordinal&&0===s.count,g=void 0!==s.context&&(e(s.context)||"number"==typeof s.context)&&""!==s.context,d=s.lngs?s.lngs:this.languageUtils.toResolveHierarchy(s.lng||this.language,s.fallbackLng);h.forEach(e=>{this.isValidLookup(i)||(a=e,this.checkedLoadedFor[`${d[0]}-${e}`]||!this.utils?.hasLoadedNamespace||this.utils?.hasLoadedNamespace(a)||(this.checkedLoadedFor[`${d[0]}-${e}`]=!0,this.logger.warn(`key "${o}" for languages "${d.join(", ")}" won't get resolved as namespace "${a}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),d.forEach(t=>{if(this.isValidLookup(i))return;r=t;const o=[c];if(this.i18nFormat?.addLookupKeys)this.i18nFormat.addLookupKeys(o,c,t,e,s);else{let e;u&&(e=this.pluralResolver.getSuffix(t,s.count,s));const i=`${this.options.pluralSeparator}zero`,n=`${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;if(u&&(s.ordinal&&e.startsWith(n)&&o.push(c+e.replace(n,this.options.pluralSeparator)),o.push(c+e),p&&o.push(c+i)),g){const t=`${c}${this.options.contextSeparator||"_"}${s.context}`;o.push(t),u&&(s.ordinal&&e.startsWith(n)&&o.push(t+e.replace(n,this.options.pluralSeparator)),o.push(t+e),p&&o.push(t+i))}}let a;for(;a=o.pop();)this.isValidLookup(i)||(n=a,i=this.getResource(t,e,a,s))}))})}),{res:i,usedKey:o,exactUsedKey:n,usedLng:r,usedNS:a}}isValidLookup(e){return!(void 0===e||!this.options.returnNull&&null===e||!this.options.returnEmptyString&&""===e)}getResource(e,t,s,i={}){return this.i18nFormat?.getResource?this.i18nFormat.getResource(e,t,s,i):this.resourceStore.getResource(e,t,s,i)}getUsedParamsDetails(t={}){const s=["defaultValue","ordinal","context","replace","lng","lngs","fallbackLng","ns","keySeparator","nsSeparator","returnObjects","returnDetails","joinArrays","postProcess","interpolation"],i=t.replace&&!e(t.replace);let o=i?t.replace:t;if(i&&void 0!==t.count&&(o.count=t.count),this.options.interpolation.defaultVariables&&(o={...this.options.interpolation.defaultVariables,...o}),!i){o={...o};for(const e of s)delete o[e]}return o}static hasDefaultValue(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&t.startsWith("defaultValue")&&void 0!==e[t])return!0;return!1}}class R{constructor(e){this.options=e,this.supportedLngs=this.options.supportedLngs||!1,this.logger=b.create("languageUtils")}getScriptPartFromCode(e){if(!(e=m(e))||!e.includes("-"))return null;const t=e.split("-");return 2===t.length?null:(t.pop(),"x"===t[t.length-1].toLowerCase()?null:this.formatLanguageCode(t.join("-")))}getLanguagePartFromCode(e){if(!(e=m(e))||!e.includes("-"))return e;const t=e.split("-");return this.formatLanguageCode(t[0])}formatLanguageCode(t){if(e(t)&&t.includes("-")){let e;try{e=Intl.getCanonicalLocales(t)[0]}catch(e){}return e&&this.options.lowerCaseLng&&(e=e.toLowerCase()),e||(this.options.lowerCaseLng?t.toLowerCase():t)}return this.options.cleanCode||this.options.lowerCaseLng?t.toLowerCase():t}isSupportedCode(e){return("languageOnly"===this.options.load||this.options.nonExplicitSupportedLngs)&&(e=this.getLanguagePartFromCode(e)),!this.supportedLngs||!this.supportedLngs.length||this.supportedLngs.includes(e)}getBestMatchFromCodes(e){if(!e)return null;let t;return e.forEach(e=>{if(t)return;const s=this.formatLanguageCode(e);this.options.supportedLngs&&!this.isSupportedCode(s)||(t=s)}),!t&&this.options.supportedLngs&&e.forEach(e=>{if(t)return;const s=this.getScriptPartFromCode(e);if(this.isSupportedCode(s))return t=s;const i=this.getLanguagePartFromCode(e);if(this.isSupportedCode(i))return t=i;t=this.options.supportedLngs.find(e=>e===i||!(!e.includes("-")&&!i.includes("-"))&&(!(!e.includes("-")||i.includes("-")||e.slice(0,e.indexOf("-"))!==i)||!!(e.startsWith(i)&&i.length>1)))}),t||(t=this.getFallbackCodes(this.options.fallbackLng)[0]),t}getFallbackCodes(t,s){if(!t)return[];if("function"==typeof t&&(t=t(s)),e(t)&&(t=[t]),Array.isArray(t))return t;if(!s)return t.default||[];let i=t[s];return i||(i=t[this.getScriptPartFromCode(s)]),i||(i=t[this.formatLanguageCode(s)]),i||(i=t[this.getLanguagePartFromCode(s)]),i||(i=t.default),i||[]}toResolveHierarchy(t,s){const i=this.getFallbackCodes((!1===s?[]:s)||this.options.fallbackLng||[],t),o=[],n=e=>{e&&(this.isSupportedCode(e)?o.push(e):this.logger.warn(`rejecting language code not found in supportedLngs: ${e}`))};return e(t)&&(t.includes("-")||t.includes("_"))?("languageOnly"!==this.options.load&&n(this.formatLanguageCode(t)),"languageOnly"!==this.options.load&&"currentOnly"!==this.options.load&&n(this.getScriptPartFromCode(t)),"currentOnly"!==this.options.load&&n(this.getLanguagePartFromCode(t))):e(t)&&n(this.formatLanguageCode(t)),i.forEach(e=>{o.includes(e)||n(this.formatLanguageCode(e))}),o}}const C={zero:0,one:1,two:2,few:3,many:4,other:5},P={select:e=>1===e?"one":"other",resolvedOptions:()=>({pluralCategories:["one","other"]})};class j{constructor(e,t={}){this.languageUtils=e,this.options=t,this.logger=b.create("pluralResolver"),this.pluralRulesCache={}}clearCache(){this.pluralRulesCache={}}getRule(e,t={}){const s=m("dev"===e?"en":e),i=t.ordinal?"ordinal":"cardinal",o=JSON.stringify({cleanedCode:s,type:i});if(o in this.pluralRulesCache)return this.pluralRulesCache[o];let n;try{n=new Intl.PluralRules(s,{type:i})}catch(s){if("undefined"==typeof Intl)return this.logger.error("No Intl support, please use an Intl polyfill!"),P;if(!e.match(/-|_/))return P;const i=this.languageUtils.getLanguagePartFromCode(e);n=this.getRule(i,t)}return this.pluralRulesCache[o]=n,n}needsPlural(e,t={}){let s=this.getRule(e,t);return s||(s=this.getRule("dev",t)),s?.resolvedOptions().pluralCategories.length>1}getPluralFormsOfKey(e,t,s={}){return this.getSuffixes(e,s).map(e=>`${t}${e}`)}getSuffixes(e,t={}){let s=this.getRule(e,t);return s||(s=this.getRule("dev",t)),s?s.resolvedOptions().pluralCategories.sort((e,t)=>C[e]-C[t]).map(e=>`${this.options.prepend}${t.ordinal?`ordinal${this.options.prepend}`:""}${e}`):[]}getSuffix(e,t,s={}){const i=this.getRule(e,s);return i?`${this.options.prepend}${s.ordinal?`ordinal${this.options.prepend}`:""}${i.select(t)}`:(this.logger.warn(`no plural rule found for: ${e}`),this.getSuffix("dev",t,s))}}const N=(t,s,i,o=".",n=!0)=>{let r=((e,t,s)=>{const i=l(e,s);return void 0!==i?i:l(t,s)})(t,s,i);return!r&&n&&e(i)&&(r=f(t,i,o),void 0===r&&(r=f(s,i,o))),r},E=e=>e.replace(/\$/g,"$$$$");class F{constructor(e={}){this.logger=b.create("interpolator"),this.options=e,this.format=e?.interpolation?.format||(e=>e),this.init(e)}init(e={}){e.interpolation||(e.interpolation={escapeValue:!0});const{escape:t,escapeValue:s,useRawValueToEscape:i,prefix:o,prefixEscaped:n,suffix:r,suffixEscaped:a,formatSeparator:l,unescapeSuffix:c,unescapePrefix:u,nestingPrefix:g,nestingPrefixEscaped:d,nestingSuffix:f,nestingSuffixEscaped:m,nestingOptionsSeparator:y,maxReplaces:v,alwaysFormat:b}=e.interpolation;this.escape=void 0!==t?t:p,this.escapeValue=void 0===s||s,this.useRawValueToEscape=void 0!==i&&i,this.prefix=o?h(o):n||"{{",this.suffix=r?h(r):a||"}}",this.formatSeparator=l||",",this.unescapePrefix=c?"":u||"-",this.unescapeSuffix=this.unescapePrefix?"":c||"",this.nestingPrefix=g?h(g):d||h("$t("),this.nestingSuffix=f?h(f):m||h(")"),this.nestingOptionsSeparator=y||",",this.maxReplaces=v||1e3,this.alwaysFormat=void 0!==b&&b,this.resetRegExp()}reset(){this.options&&this.init(this.options)}resetRegExp(){const e=(e,t)=>e?.source===t?(e.lastIndex=0,e):new RegExp(t,"g");this.regexp=e(this.regexp,`${this.prefix}(.+?)${this.suffix}`),this.regexpUnescape=e(this.regexpUnescape,`${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`),this.nestingRegexp=e(this.nestingRegexp,`${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`)}interpolate(t,i,o,n){let r,a,l;const c=this.options&&this.options.interpolation&&this.options.interpolation.defaultVariables||{},h=e=>{if(!e.includes(this.formatSeparator)){const t=N(i,c,e,this.options.keySeparator,this.options.ignoreJSONStructure);return this.alwaysFormat?this.format(t,void 0,o,{...n,...i,interpolationkey:e}):t}const t=e.split(this.formatSeparator),s=t.shift().trim(),r=t.join(this.formatSeparator).trim();return this.format(N(i,c,s,this.options.keySeparator,this.options.ignoreJSONStructure),r,o,{...n,...i,interpolationkey:s})};this.resetRegExp();const u=n?.missingInterpolationHandler||this.options.missingInterpolationHandler,p=void 0!==n?.interpolation?.skipOnVariables?n.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables;return[{regex:this.regexpUnescape,safeValue:e=>E(e)},{regex:this.regexp,safeValue:e=>this.escapeValue?E(this.escape(e)):E(e)}].forEach(i=>{for(l=0;r=i.regex.exec(t);){const o=r[1].trim();if(a=h(o),void 0===a)if("function"==typeof u){const s=u(t,r,n);a=e(s)?s:""}else if(n&&Object.prototype.hasOwnProperty.call(n,o))a="";else{if(p){a=r[0];continue}this.logger.warn(`missed to pass in variable ${o} for interpolating ${t}`),a=""}else e(a)||this.useRawValueToEscape||(a=s(a));const c=i.safeValue(a);if(t=t.replace(r[0],c),p?(i.regex.lastIndex+=a.length,i.regex.lastIndex-=r[0].length):i.regex.lastIndex=0,l++,l>=this.maxReplaces)break}}),t}nest(t,i,o={}){let n,r,a;const l=(e,t)=>{const s=this.nestingOptionsSeparator;if(!e.includes(s))return e;const i=e.split(new RegExp(`${h(s)}[ ]*{`));let o=`{${i[1]}`;e=i[0],o=this.interpolate(o,a);const n=o.match(/'/g),r=o.match(/"/g);((n?.length??0)%2==0&&!r||(r?.length??0)%2!=0)&&(o=o.replace(/'/g,'"'));try{a=JSON.parse(o),t&&(a={...t,...a})}catch(t){return this.logger.warn(`failed parsing options string in nesting for key ${e}`,t),`${e}${s}${o}`}return a.defaultValue&&a.defaultValue.includes(this.prefix)&&delete a.defaultValue,e};for(;n=this.nestingRegexp.exec(t);){let c=[];a={...o},a=a.replace&&!e(a.replace)?a.replace:a,a.applyPostProcessor=!1,delete a.defaultValue;const h=/{.*}/.test(n[1])?n[1].lastIndexOf("}")+1:n[1].indexOf(this.formatSeparator);if(-1!==h&&(c=n[1].slice(h).split(this.formatSeparator).map(e=>e.trim()).filter(Boolean),n[1]=n[1].slice(0,h)),r=i(l.call(this,n[1].trim(),a),a),r&&n[0]===t&&!e(r))return r;e(r)||(r=s(r)),r||(this.logger.warn(`missed to resolve ${n[1]} for nesting ${t}`),r=""),c.length&&(r=c.reduce((e,t)=>this.format(e,t,o.lng,{...o,interpolationkey:n[1].trim()}),r.trim())),t=t.replace(n[0],r),this.regexp.lastIndex=0}return t}}const T=e=>{const t={};return(s,i,o)=>{let n=o;o&&o.interpolationkey&&o.formatParams&&o.formatParams[o.interpolationkey]&&o[o.interpolationkey]&&(n={...n,[o.interpolationkey]:void 0});const r=i+JSON.stringify(n);let a=t[r];return a||(a=e(m(i),o),t[r]=a),a(s)}},V=e=>(t,s,i)=>e(m(s),i)(t);class I{constructor(e={}){this.logger=b.create("formatter"),this.options=e,this.init(e)}init(e,t={interpolation:{}}){this.formatSeparator=t.interpolation.formatSeparator||",";const s=t.cacheInBuiltFormats?T:V;this.formats={number:s((e,t)=>{const s=new Intl.NumberFormat(e,{...t});return e=>s.format(e)}),currency:s((e,t)=>{const s=new Intl.NumberFormat(e,{...t,style:"currency"});return e=>s.format(e)}),datetime:s((e,t)=>{const s=new Intl.DateTimeFormat(e,{...t});return e=>s.format(e)}),relativetime:s((e,t)=>{const s=new Intl.RelativeTimeFormat(e,{...t});return e=>s.format(e,t.range||"day")}),list:s((e,t)=>{const s=new Intl.ListFormat(e,{...t});return e=>s.format(e)})}}add(e,t){this.formats[e.toLowerCase().trim()]=t}addCached(e,t){this.formats[e.toLowerCase().trim()]=T(t)}format(e,t,s,i={}){const o=t.split(this.formatSeparator);if(o.length>1&&o[0].indexOf("(")>1&&!o[0].includes(")")&&o.find(e=>e.includes(")"))){const e=o.findIndex(e=>e.includes(")"));o[0]=[o[0],...o.splice(1,e)].join(this.formatSeparator)}return o.reduce((e,t)=>{const{formatName:o,formatOptions:n}=(e=>{let t=e.toLowerCase().trim();const s={};if(e.includes("(")){const i=e.split("(");t=i[0].toLowerCase().trim();const o=i[1].slice(0,-1);"currency"!==t||o.includes(":")?"relativetime"!==t||o.includes(":")?o.split(";").forEach(e=>{if(e){const[t,...i]=e.split(":"),o=i.join(":").trim().replace(/^'+|'+$/g,""),n=t.trim();s[n]||(s[n]=o),"false"===o&&(s[n]=!1),"true"===o&&(s[n]=!0),isNaN(o)||(s[n]=parseInt(o,10))}}):s.range||(s.range=o.trim()):s.currency||(s.currency=o.trim())}return{formatName:t,formatOptions:s}})(t);if(this.formats[o]){let t=e;try{const r=i?.formatParams?.[i.interpolationkey]||{},a=r.locale||r.lng||i.locale||i.lng||s;t=this.formats[o](e,a,{...n,...i,...r})}catch(e){this.logger.warn(e)}return t}return this.logger.warn(`there was no format function for ${o}`),e},e)}}class D extends x{constructor(e,t,s,i={}){super(),this.backend=e,this.store=t,this.services=s,this.languageUtils=s.languageUtils,this.options=i,this.logger=b.create("backendConnector"),this.waitingReads=[],this.maxParallelReads=i.maxParallelReads||10,this.readingCalls=0,this.maxRetries=i.maxRetries>=0?i.maxRetries:5,this.retryTimeout=i.retryTimeout>=1?i.retryTimeout:350,this.state={},this.queue=[],this.backend?.init?.(s,i.backend,i)}queueLoad(e,t,s,i){const o={},n={},r={},a={};return e.forEach(e=>{let i=!0;t.forEach(t=>{const r=`${e}|${t}`;!s.reload&&this.store.hasResourceBundle(e,t)?this.state[r]=2:this.state[r]<0||(1===this.state[r]?void 0===n[r]&&(n[r]=!0):(this.state[r]=1,i=!1,void 0===n[r]&&(n[r]=!0),void 0===o[r]&&(o[r]=!0),void 0===a[t]&&(a[t]=!0)))}),i||(r[e]=!0)}),(Object.keys(o).length||Object.keys(n).length)&&this.queue.push({pending:n,pendingCount:Object.keys(n).length,loaded:{},errors:[],callback:i}),{toLoad:Object.keys(o),pending:Object.keys(n),toLoadLanguages:Object.keys(r),toLoadNamespaces:Object.keys(a)}}loaded(e,t,s){const i=e.split("|"),o=i[0],n=i[1];t&&this.emit("failedLoading",o,n,t),!t&&s&&this.store.addResourceBundle(o,n,s,void 0,void 0,{skipCopy:!0}),this.state[e]=t?-1:2,t&&s&&(this.state[e]=0);const a={};this.queue.forEach(s=>{((e,t,s)=>{const{obj:i,k:o}=r(e,t,Object);i[o]=i[o]||[],i[o].push(s)})(s.loaded,[o],n),((e,t)=>{void 0!==e.pending[t]&&(delete e.pending[t],e.pendingCount--)})(s,e),t&&s.errors.push(t),0!==s.pendingCount||s.done||(Object.keys(s.loaded).forEach(e=>{a[e]||(a[e]={});const t=s.loaded[e];t.length&&t.forEach(t=>{void 0===a[e][t]&&(a[e][t]=!0)})}),s.done=!0,s.errors.length?s.callback(s.errors):s.callback())}),this.emit("loaded",a),this.queue=this.queue.filter(e=>!e.done)}read(e,t,s,i=0,o=this.retryTimeout,n){if(!e.length)return n(null,{});if(this.readingCalls>=this.maxParallelReads)return void this.waitingReads.push({lng:e,ns:t,fcName:s,tried:i,wait:o,callback:n});this.readingCalls++;const r=(r,a)=>{if(this.readingCalls--,this.waitingReads.length>0){const e=this.waitingReads.shift();this.read(e.lng,e.ns,e.fcName,e.tried,e.wait,e.callback)}r&&a&&i<this.maxRetries?setTimeout(()=>{this.read(e,t,s,i+1,2*o,n)},o):n(r,a)},a=this.backend[s].bind(this.backend);if(2!==a.length)return a(e,t,r);try{const s=a(e,t);s&&"function"==typeof s.then?s.then(e=>r(null,e)).catch(r):r(null,s)}catch(e){r(e)}}prepareLoading(t,s,i={},o){if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),o&&o();e(t)&&(t=this.languageUtils.toResolveHierarchy(t)),e(s)&&(s=[s]);const n=this.queueLoad(t,s,i,o);if(!n.toLoad.length)return n.pending.length||o(),null;n.toLoad.forEach(e=>{this.loadOne(e)})}load(e,t,s){this.prepareLoading(e,t,{},s)}reload(e,t,s){this.prepareLoading(e,t,{reload:!0},s)}loadOne(e,t=""){const s=e.split("|"),i=s[0],o=s[1];this.read(i,o,"read",void 0,void 0,(s,n)=>{s&&this.logger.warn(`${t}loading namespace ${o} for language ${i} failed`,s),!s&&n&&this.logger.log(`${t}loaded namespace ${o} for language ${i}`,n),this.loaded(e,s,n)})}saveMissing(e,t,s,i,o,n={},r=()=>{}){if(!this.services?.utils?.hasLoadedNamespace||this.services?.utils?.hasLoadedNamespace(t)){if(null!=s&&""!==s){if(this.backend?.create){const a={...n,isUpdate:o},l=this.backend.create.bind(this.backend);if(l.length<6)try{let o;o=5===l.length?l(e,t,s,i,a):l(e,t,s,i),o&&"function"==typeof o.then?o.then(e=>r(null,e)).catch(r):r(null,o)}catch(e){r(e)}else l(e,t,s,i,r,a)}e&&e[0]&&this.store.addResource(e[0],t,s,i)}}else this.logger.warn(`did not save key "${s}" as the namespace "${t}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")}}const A=()=>({debug:!1,initAsync:!0,ns:["translation"],defaultNS:["translation"],fallbackLng:["dev"],fallbackNS:!1,supportedLngs:!1,nonExplicitSupportedLngs:!1,load:"all",preload:!1,keySeparator:".",nsSeparator:":",pluralSeparator:"_",contextSeparator:"_",partialBundledLanguages:!1,saveMissing:!1,updateMissing:!1,saveMissingTo:"fallback",saveMissingPlurals:!0,missingKeyHandler:!1,missingInterpolationHandler:!1,postProcess:!1,postProcessPassResolved:!1,returnNull:!1,returnEmptyString:!0,returnObjects:!1,joinArrays:!1,returnedObjectHandler:!1,parseMissingKeyHandler:!1,appendNamespaceToMissingKey:!1,appendNamespaceToCIMode:!1,overloadTranslationOptionHandler:t=>{let s={};if("object"==typeof t[1]&&(s=t[1]),e(t[1])&&(s.defaultValue=t[1]),e(t[2])&&(s.tDescription=t[2]),"object"==typeof t[2]||"object"==typeof t[3]){const e=t[3]||t[2];Object.keys(e).forEach(t=>{s[t]=e[t]})}return s},interpolation:{escapeValue:!0,prefix:"{{",suffix:"}}",formatSeparator:",",unescapePrefix:"-",nestingPrefix:"$t(",nestingSuffix:")",nestingOptionsSeparator:",",maxReplaces:1e3,skipOnVariables:!0},cacheInBuiltFormats:!0}),K=t=>(e(t.ns)&&(t.ns=[t.ns]),e(t.fallbackLng)&&(t.fallbackLng=[t.fallbackLng]),e(t.fallbackNS)&&(t.fallbackNS=[t.fallbackNS]),t.supportedLngs&&!t.supportedLngs.includes("cimode")&&(t.supportedLngs=t.supportedLngs.concat(["cimode"])),t),U=()=>{};class M extends x{constructor(e={},t){var s;if(super(),this.options=K(e),this.services={},this.logger=b,this.modules={external:[]},s=this,Object.getOwnPropertyNames(Object.getPrototypeOf(s)).forEach(e=>{"function"==typeof s[e]&&(s[e]=s[e].bind(s))}),t&&!this.isInitialized&&!e.isClone){if(!this.options.initAsync)return this.init(e,t),this;setTimeout(()=>{this.init(e,t)},0)}}init(s={},i){this.isInitializing=!0,"function"==typeof s&&(i=s,s={}),null==s.defaultNS&&s.ns&&(e(s.ns)?s.defaultNS=s.ns:s.ns.includes("translation")||(s.defaultNS=s.ns[0]));const o=A();this.options={...o,...this.options,...K(s)},this.options.interpolation={...o.interpolation,...this.options.interpolation},void 0!==s.keySeparator&&(this.options.userDefinedKeySeparator=s.keySeparator),void 0!==s.nsSeparator&&(this.options.userDefinedNsSeparator=s.nsSeparator),"function"!=typeof this.options.overloadTranslationOptionHandler&&(this.options.overloadTranslationOptionHandler=o.overloadTranslationOptionHandler);const n=e=>e?"function"==typeof e?new e:e:null;if(!this.options.isClone){let e;this.modules.logger?b.init(n(this.modules.logger),this.options):b.init(null,this.options),e=this.modules.formatter?this.modules.formatter:I;const t=new R(this.options);this.store=new k(this.options.resources,this.options);const s=this.services;s.logger=b,s.resourceStore=this.store,s.languageUtils=t,s.pluralResolver=new j(t,{prepend:this.options.pluralSeparator}),e&&(s.formatter=n(e),s.formatter.init&&s.formatter.init(s,this.options),this.options.interpolation.format=s.formatter.format.bind(s.formatter)),s.interpolator=new F(this.options),s.utils={hasLoadedNamespace:this.hasLoadedNamespace.bind(this)},s.backendConnector=new D(n(this.modules.backend),s.resourceStore,s,this.options),s.backendConnector.on("*",(e,...t)=>{this.emit(e,...t)}),this.modules.languageDetector&&(s.languageDetector=n(this.modules.languageDetector),s.languageDetector.init&&s.languageDetector.init(s,this.options.detection,this.options)),this.modules.i18nFormat&&(s.i18nFormat=n(this.modules.i18nFormat),s.i18nFormat.init&&s.i18nFormat.init(this)),this.translator=new O(this.services,this.options),this.translator.on("*",(e,...t)=>{this.emit(e,...t)}),this.modules.external.forEach(e=>{e.init&&e.init(this)})}if(this.format=this.options.interpolation.format,i||(i=U),this.options.fallbackLng&&!this.services.languageDetector&&!this.options.lng){const e=this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);e.length>0&&"dev"!==e[0]&&(this.options.lng=e[0])}this.services.languageDetector||this.options.lng||this.logger.warn("init: no languageDetector is used and no lng is defined");["getResource","hasResourceBundle","getResourceBundle","getDataByLanguage"].forEach(e=>{this[e]=(...t)=>this.store[e](...t)});["addResource","addResources","addResourceBundle","removeResourceBundle"].forEach(e=>{this[e]=(...t)=>(this.store[e](...t),this)});const r=t(),a=()=>{const e=(e,t)=>{this.isInitializing=!1,this.isInitialized&&!this.initializedStoreOnce&&this.logger.warn("init: i18next is already initialized. You should call init just once!"),this.isInitialized=!0,this.options.isClone||this.logger.log("initialized",this.options),this.emit("initialized",this.options),r.resolve(t),i(e,t)};if(this.languages&&!this.isInitialized)return e(null,this.t.bind(this));this.changeLanguage(this.options.lng,e)};return this.options.resources||!this.options.initAsync?a():setTimeout(a,0),r}loadResources(t,s=U){let i=s;const o=e(t)?t:this.language;if("function"==typeof t&&(i=t),!this.options.resources||this.options.partialBundledLanguages){if("cimode"===o?.toLowerCase()&&(!this.options.preload||0===this.options.preload.length))return i();const e=[],t=t=>{if(!t)return;if("cimode"===t)return;this.services.languageUtils.toResolveHierarchy(t).forEach(t=>{"cimode"!==t&&(e.includes(t)||e.push(t))})};if(o)t(o);else{this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach(e=>t(e))}this.options.preload?.forEach?.(e=>t(e)),this.services.backendConnector.load(e,this.options.ns,e=>{e||this.resolvedLanguage||!this.language||this.setResolvedLanguage(this.language),i(e)})}else i(null)}reloadResources(e,s,i){const o=t();return"function"==typeof e&&(i=e,e=void 0),"function"==typeof s&&(i=s,s=void 0),e||(e=this.languages),s||(s=this.options.ns),i||(i=U),this.services.backendConnector.reload(e,s,e=>{o.resolve(),i(e)}),o}use(e){if(!e)throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");if(!e.type)throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");return"backend"===e.type&&(this.modules.backend=e),("logger"===e.type||e.log&&e.warn&&e.error)&&(this.modules.logger=e),"languageDetector"===e.type&&(this.modules.languageDetector=e),"i18nFormat"===e.type&&(this.modules.i18nFormat=e),"postProcessor"===e.type&&S.addPostProcessor(e),"formatter"===e.type&&(this.modules.formatter=e),"3rdParty"===e.type&&this.modules.external.push(e),this}setResolvedLanguage(e){if(e&&this.languages&&!["cimode","dev"].includes(e)){for(let e=0;e<this.languages.length;e++){const t=this.languages[e];if(!["cimode","dev"].includes(t)&&this.store.hasLanguageSomeTranslations(t)){this.resolvedLanguage=t;break}}this.resolvedLanguage||this.languages.includes(e)||!this.store.hasLanguageSomeTranslations(e)||(this.resolvedLanguage=e,this.languages.unshift(e))}}changeLanguage(s,i){this.isLanguageChangingTo=s;const o=t();this.emit("languageChanging",s);const n=e=>{this.language=e,this.languages=this.services.languageUtils.toResolveHierarchy(e),this.resolvedLanguage=void 0,this.setResolvedLanguage(e)},r=(e,t)=>{t?this.isLanguageChangingTo===s&&(n(t),this.translator.changeLanguage(t),this.isLanguageChangingTo=void 0,this.emit("languageChanged",t),this.logger.log("languageChanged",t)):this.isLanguageChangingTo=void 0,o.resolve((...e)=>this.t(...e)),i&&i(e,(...e)=>this.t(...e))},a=t=>{s||t||!this.services.languageDetector||(t=[]);const i=e(t)?t:t&&t[0],o=this.store.hasLanguageSomeTranslations(i)?i:this.services.languageUtils.getBestMatchFromCodes(e(t)?[t]:t);o&&(this.language||n(o),this.translator.language||this.translator.changeLanguage(o),this.services.languageDetector?.cacheUserLanguage?.(o)),this.loadResources(o,e=>{r(e,o)})};return s||!this.services.languageDetector||this.services.languageDetector.async?!s&&this.services.languageDetector&&this.services.languageDetector.async?0===this.services.languageDetector.detect.length?this.services.languageDetector.detect().then(a):this.services.languageDetector.detect(a):a(s):a(this.services.languageDetector.detect()),o}getFixedT(t,s,i){const o=(e,t,...s)=>{let n;n="object"!=typeof t?this.options.overloadTranslationOptionHandler([e,t].concat(s)):{...t},n.lng=n.lng||o.lng,n.lngs=n.lngs||o.lngs,n.ns=n.ns||o.ns,""!==n.keyPrefix&&(n.keyPrefix=n.keyPrefix||i||o.keyPrefix);const r={...this.options,...n};"function"==typeof n.keyPrefix&&(n.keyPrefix=w(n.keyPrefix,r));const a=this.options.keySeparator||".";let l;return n.keyPrefix&&Array.isArray(e)?l=e.map(e=>("function"==typeof e&&(e=w(e,r)),`${n.keyPrefix}${a}${e}`)):("function"==typeof e&&(e=w(e,r)),l=n.keyPrefix?`${n.keyPrefix}${a}${e}`:e),this.t(l,n)};return e(t)?o.lng=t:o.lngs=t,o.ns=s,o.keyPrefix=i,o}t(...e){return this.translator?.translate(...e)}exists(...e){return this.translator?.exists(...e)}setDefaultNamespace(e){this.options.defaultNS=e}hasLoadedNamespace(e,t={}){if(!this.isInitialized)return this.logger.warn("hasLoadedNamespace: i18next was not initialized",this.languages),!1;if(!this.languages||!this.languages.length)return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty",this.languages),!1;const s=t.lng||this.resolvedLanguage||this.languages[0],i=!!this.options&&this.options.fallbackLng,o=this.languages[this.languages.length-1];if("cimode"===s.toLowerCase())return!0;const n=(e,t)=>{const s=this.services.backendConnector.state[`${e}|${t}`];return-1===s||0===s||2===s};if(t.precheck){const e=t.precheck(this,n);if(void 0!==e)return e}return!!this.hasResourceBundle(s,e)||(!(this.services.backendConnector.backend&&(!this.options.resources||this.options.partialBundledLanguages))||!(!n(s,e)||i&&!n(o,e)))}loadNamespaces(s,i){const o=t();return this.options.ns?(e(s)&&(s=[s]),s.forEach(e=>{this.options.ns.includes(e)||this.options.ns.push(e)}),this.loadResources(e=>{o.resolve(),i&&i(e)}),o):(i&&i(),Promise.resolve())}loadLanguages(s,i){const o=t();e(s)&&(s=[s]);const n=this.options.preload||[],r=s.filter(e=>!n.includes(e)&&this.services.languageUtils.isSupportedCode(e));return r.length?(this.options.preload=n.concat(r),this.loadResources(e=>{o.resolve(),i&&i(e)}),o):(i&&i(),Promise.resolve())}dir(e){if(e||(e=this.resolvedLanguage||(this.languages?.length>0?this.languages[0]:this.language)),!e)return"rtl";try{const t=new Intl.Locale(e);if(t&&t.getTextInfo){const e=t.getTextInfo();if(e&&e.direction)return e.direction}}catch(e){}const t=this.services?.languageUtils||new R(A());return e.toLowerCase().indexOf("-latn")>1?"ltr":["ar","shu","sqr","ssh","xaa","yhd","yud","aao","abh","abv","acm","acq","acw","acx","acy","adf","ads","aeb","aec","afb","ajp","apc","apd","arb","arq","ars","ary","arz","auz","avl","ayh","ayl","ayn","ayp","bbz","pga","he","iw","ps","pbt","pbu","pst","prp","prd","ug","ur","ydd","yds","yih","ji","yi","hbo","men","xmn","fa","jpr","peo","pes","prs","dv","sam","ckb"].includes(t.getLanguagePartFromCode(e))||e.toLowerCase().indexOf("-arab")>1?"rtl":"ltr"}static createInstance(e={},t){const s=new M(e,t);return s.createInstance=M.createInstance,s}cloneInstance(e={},t=U){const s=e.forkResourceStore;s&&delete e.forkResourceStore;const i={...this.options,...e,isClone:!0},o=new M(i);void 0===e.debug&&void 0===e.prefix||(o.logger=o.logger.clone(e));if(["store","services","language"].forEach(e=>{o[e]=this[e]}),o.services={...this.services},o.services.utils={hasLoadedNamespace:o.hasLoadedNamespace.bind(o)},s){const e=Object.keys(this.store.data).reduce((e,t)=>(e[t]={...this.store.data[t]},e[t]=Object.keys(e[t]).reduce((s,i)=>(s[i]={...e[t][i]},s),e[t]),e),{});o.store=new k(e,i),o.services.resourceStore=o.store}if(e.interpolation){const t={...A().interpolation,...this.options.interpolation,...e.interpolation},s={...i,interpolation:t};o.services.interpolator=new F(s)}return o.translator=new O(o.services,i),o.translator.on("*",(e,...t)=>{o.emit(e,...t)}),o.init(i,t),o.translator.options=i,o.translator.backendConnector.services.utils={hasLoadedNamespace:o.hasLoadedNamespace.bind(o)},o}toJSON(){return{options:this.options,store:this.store,language:this.language,languages:this.languages,resolvedLanguage:this.resolvedLanguage}}}const H=M.createInstance();return H.keyFromSelector=w,H});

;
(function(root){
  'use strict';
  const VERSION='factorlab-daily-v2.0.0';
  const STUDIO_VERSION='factorlab-daily-v2.1.0';
  const SECTORS=['semiconductor','robotics','materials','energy','digital','cash'];
  const FACTOR_NAMES=['momentum','value','quality','lowVolatility'];
  const INITIAL_WEIGHTS=[.2,.2,.15,.15,.15,.15];
  const EXPOSURES=[[.5,0,.5,-.5],[0,.5,1,0],[-.5,1,0,.5],[-1,-.5,-.5,1],[1,-1,-1,-1]];
  const BETAS=[1.15,1.05,.9,.95,1.2];
  const DEFAULT_CONFIG={rounds:6,daysPerRound:20,dailyNoise:.004,macroNoise:.09,eventStrength:1,buyRate:.0013,sellRate:.0018,slowEvery:5,lagDays:5,cycleConfirmations:2,minCycleDays:10,rateReversion:.07,growthReversion:.045,inflationReversion:.035};
  const TEXTS={
    'zh-CN':{
      'sector.semiconductor':'半导体','sector.robotics':'机器人与工业自动化','sector.materials':'先进材料','sector.energy':'清洁能源装备','sector.digital':'AI 与数字基础设施','sector.cash':'Cash',
      'factor.momentum':'动量','factor.value':'价值','factor.quality':'质量','factor.lowVolatility':'低波动',
      'cycle.expansion':'扩张','cycle.overheating':'过热','cycle.stagflation':'滞胀','cycle.recession':'衰退','cycle.recovery':'复苏',
      'evidence.E1.title':'订单回来了，利润呢？','evidence.E1.body':'合成订单线索改善，但订单转化为收入与利润仍需后续披露。',
      'evidence.E2.title':'好消息可能已在价格里','evidence.E2.body':'需求改善与估值风险可以同时存在。当前价格不是未来收益保证。',
      'evidence.E3.title':'长期支持需要时间','evidence.E3.body':'政策影响先进入融资与需求，再传到盈利。保持长期锚，并说明短期偏移的理由。',
      'event.order.title':'订单传闻浮现','event.order.body':'产业链出现补库存传闻，经营改善尚未核实。市场情绪升温，证据仍有限。',
      'event.disclosure.title':'数据披露：收入与订单不同步','event.disclosure.body':'最新合成披露显示订单的兑现存在时滞。行业内部盈利差异开始扩大。',
      'event.disclosure.strong':'最新合成披露显示较多订单转化为收入；交付时滞仍存在，价格也可能已反映改善。',
      'event.disclosure.weak':'最新合成披露显示订单转化偏弱，部分交付延后。传闻与已确认收入需要重新区分。',
      'event.supply.title':'供应链与融资成本冲击','event.supply.body':'运输与设备交付承压，信用条件收紧。成本变化将持续多个交易日。',
      'event.divergence.title':'行业分化：利润率成为焦点','event.divergence.body':'自动化与材料的现金流表现出现差异。质量因子提供观察角度，但不会永久占优。',
      'event.profit.title':'盈利兑现进入检验期','event.profit.body':'订单开始转化为盈利，估值与资金成本仍影响价格。长期叙事与短期回报并不相同。',
      'event.resolution.title':'订单迷雾：本章证据收束','event.resolution.body':'本章已披露的信息进入最终复盘。检查当时的证据、风险与预测，而不只看盈亏。',
      'badge.reason':'判断有据','badge.evidence':'证据观察者','badge.diversified':'分散配置','badge.risk':'风险守护','badge.forecast':'预测复盘',
      'coach.synthetic':'本回答来自规则式教学提示，市场数据为合成模拟。','coach.risk':'先检查集中度、Cash 缓冲与已发生回撤，再区分需求改善和估值风险。',
      'coach.macro':'利率与信用条件通过融资成本和需求逐步传导；当前宏观指标不提供下一交易日价格。','coach.review':'把本轮结果与同一路径下的不交易组合比较，再检查当时理由是否仍成立。',
      'coach.detail':'因子权重只用于生成行业建议，不会再次投入本金。事件只使用当前已披露信息；未来价格未知。',
      'model.note':'原创、可配置的简化教学模型；未拟合真实市场，不能作为价格预测。',
      'model.benchmark':'五行业各 20%，每日再平衡，免交易成本；不含 Cash。','model.risk':'日收益；252 日年化；Sharpe 扣除各日开盘前已知政策利率百分值/100/252；样本标准差，n<2 时留空；超额收益零方差时仅 Sharpe 留空。'
    },
    en:{
      'sector.semiconductor':'Semiconductors','sector.robotics':'Robotics & automation','sector.materials':'Advanced materials','sector.energy':'Clean energy equipment','sector.digital':'AI & digital infrastructure','sector.cash':'Cash',
      'factor.momentum':'Momentum','factor.value':'Value','factor.quality':'Quality','factor.lowVolatility':'Low volatility',
      'cycle.expansion':'Expansion','cycle.overheating':'Overheating','cycle.stagflation':'Stagflation','cycle.recession':'Recession','cycle.recovery':'Recovery',
      'evidence.E1.title':'Orders are back. Are profits?','evidence.E1.body':'Synthetic order signals improve, but conversion into revenue and profit needs later disclosures.',
      'evidence.E2.title':'Good news may already be priced in','evidence.E2.body':'Improving demand and valuation risk can coexist. The current price cannot guarantee future returns.',
      'evidence.E3.title':'Long-term support takes time','evidence.E3.body':'Policy reaches financing and demand before profits. Retain a long-term anchor and explain tactical deviations.',
      'event.order.title':'An order rumor emerges','event.order.body':'Restocking rumors lift sentiment. Operating improvements remain unverified and evidence is limited.',
      'event.disclosure.title':'Disclosure: orders and revenue diverge','event.disclosure.body':'A synthetic disclosure reveals a lag in order conversion. Profit differences across industries widen.',
      'event.disclosure.strong':'The latest synthetic disclosure confirms stronger order conversion into revenue. Delivery lags remain, and improvement may already be priced in.',
      'event.disclosure.weak':'The latest synthetic disclosure shows weak order conversion and delayed delivery. Distinguish the earlier rumor from confirmed revenue.',
      'event.supply.title':'Supply and financing shock','event.supply.body':'Transport and equipment deliveries face disruption as credit tightens. Cost effects persist across trading days.',
      'event.divergence.title':'Sector divergence: margins in focus','event.divergence.body':'Automation and materials show different cash-flow outcomes. Quality is a useful lens, not a permanent winner.',
      'event.profit.title':'Profit delivery faces its test','event.profit.body':'Orders begin translating into profits while valuation and funding costs still affect prices. A long-term story is not a short-term return.',
      'event.resolution.title':'Order fog: the chapter closes','event.resolution.body':'Available evidence enters the final review. Evaluate the evidence, risk and forecast recorded at the time, as well as returns.',
      'badge.reason':'Reasoned decision','badge.evidence':'Evidence observer','badge.diversified':'Diversified','badge.risk':'Risk awareness','badge.forecast':'Forecast review',
      'coach.synthetic':'This is a rule-based teaching response using synthetic market data.','coach.risk':'Check concentration, the cash buffer and observed drawdown, then separate improving demand from valuation risk.',
      'coach.macro':'Rates and credit conditions transmit gradually through financing costs and demand; current indicators do not reveal the next trading-day price.','coach.review':'Compare this round with the no-trade portfolio on the same market path, then review whether your recorded reason still holds.',
      'coach.detail':'Factor weights only produce a sector suggestion; they do not invest a second budget. Events use disclosed information only; future prices remain unknown.',
      'model.note':'An original, configurable teaching model, not calibrated to actual markets and not a price forecast.',
      'model.benchmark':'Five sectors at 20% each, rebalanced daily without costs; no cash.','model.risk':'Daily returns; 252-day annualization; Sharpe subtracts the pre-day annual policy rate in percent /100/252; sample deviation. Statistics are blank when n<2; only Sharpe is blank for zero excess-return variance.'
    }
  };
  const EVENT_DEFINITIONS=[
    {id:'EVENT-ORDER',key:'order',at:7,duration:12,macro:{sentiment:.65,liquidity:.10},sector:[.0012,.0002,0,0,.0005],factor:[.00025,0,0,-.0001]},
    {id:'EVENT-DISCLOSURE',key:'disclosure',at:25,duration:15,macro:{growth:-.005,sentiment:-.45},sector:[-.0014,.0002,.0003,0,-.0004],factor:[-.0003,.0001,.0002,.0001]},
    {id:'EVENT-SUPPLY',key:'supply',at:46,duration:20,macro:{inflation:.018,credit:.35,liquidity:-.25},sector:[-.0008,-.0005,.0004,-.0006,-.0002],factor:[-.00015,.00005,.00015,.0002]},
    {id:'EVENT-DIVERGENCE',key:'divergence',at:72,duration:14,macro:{growth:.015,credit:-.18},sector:[.0002,.0008,.0005,-.0003,-.0004],factor:[.0001,.00015,.0001,-.0001]},
    {id:'EVENT-PROFIT',key:'profit',at:95,duration:16,macro:{growth:.012,sentiment:.35},sector:[.0007,.0002,-.0002,.0001,.0005],factor:[.0001,-.0001,.00005,-.00005]},
    {id:'EVENT-RESOLUTION',key:'resolution',at:116,duration:4,macro:{sentiment:-.1},sector:[-.0001,.0001,0,.0001,0],factor:[-.0001,.0001,0,0]}
  ];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const sum=x=>x.reduce((a,b)=>a+b,0);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const fail=code=>{throw Error(code);};
  const emptyAttribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  function validWeights(w){if(!Array.isArray(w)||w.length!==6||w.some(x=>!Number.isFinite(x)||x<0)||Math.abs(sum(w)-1)>1e-9)return 'invalidWeights';if(w.slice(0,5).some(x=>x>.4+1e-10))return 'sectorCap';return null;}
  function validFactors(w){return Array.isArray(w)&&w.length===4&&w.every(x=>Number.isFinite(x)&&x>=0)&&Math.abs(sum(w)-1)<=1e-9;}
  function configuration(raw={}){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('invalidConfig');
    const c={...DEFAULT_CONFIG,...raw},ranges={rounds:[1,12],daysPerRound:[5,60],dailyNoise:[.0001,.03],macroNoise:[0,.5],eventStrength:[0,3],buyRate:[0,.02],sellRate:[0,.02],slowEvery:[1,20],lagDays:[1,30],cycleConfirmations:[1,5],minCycleDays:[5,30],rateReversion:[0,.3],growthReversion:[0,.3],inflationReversion:[0,.3]};
    for(const key of Object.keys(raw))if(!Object.hasOwn(ranges,key))fail('invalidConfig');
    for(const [key,[lo,hi]] of Object.entries(ranges))if(!Number.isFinite(c[key])||c[key]<lo||c[key]>hi)fail('invalidConfig');
    if(['rounds','daysPerRound','slowEvery','lagDays','cycleConfirmations','minCycleDays'].some(k=>!Number.isInteger(c[k])))fail('invalidConfig');return c;
  }
  function uniform(s){s.rng=(s.rng+0x6D2B79F5)>>>0;let n=s.rng;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
  function normal(s){return Math.sqrt(-2*Math.log(Math.max(1e-12,uniform(s))))*Math.cos(2*Math.PI*uniform(s));}
  function value(units,prices,cash){return sum(units.map((u,i)=>u*prices[i]))+cash;}
  function updateWeights(s){s.nav=value(s.units,s.prices,s.cash);s.weights=[...s.units.map((u,i)=>u*s.prices[i]/s.nav),s.cash/s.nav];}
  function initial({seed=20261013,scenario='baseline',config={}}={}){
    if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)fail('invalidSeed');
    if(!['baseline','stress','recovery'].includes(scenario))fail('invalidScenario');
    const c=configuration(config),macro={rate:3.2,inflation:2.7,growth:3.2,liquidity:56,credit:22,sentiment:58,cycle:'expansion'};
    if(scenario==='stress')Object.assign(macro,{rate:5.5,inflation:5.2,growth:-1.2,liquidity:32,credit:62,sentiment:32,cycle:'stagflation'});
    if(scenario==='recovery')Object.assign(macro,{rate:2,inflation:1.4,growth:1.2,liquidity:66,credit:34,sentiment:57,cycle:'recovery'});
    const prices=[100,100,100,100,100],units=INITIAL_WEIGHTS.slice(0,5).map(w=>w*100000/100),cash=15000;
    const s={version:VERSION,seed,scenario,config:c,rng:seed,phase:'decision',day:0,round:1,daysPerRound:c.daysPerRound,macro,prices,units,cash,nav:100000,benchmarkNav:100000,anchorNav:100000,anchorUnits:[...units],anchorCash:cash,weights:[...INITIAL_WEIGHTS],factorWeights:[.25,.25,.25,.25],events:[],eventState:{},history:[],results:[],transactions:[],commands:[],seen:[],pendingCost:0,roundState:null,cycleCandidate:macro.cycle,cycleCount:0,cycleChanged:0};
    s.history.push({day:0,nav:100000,benchmarkNav:100000,anchorNav:100000,prices:[...prices],macro:clone(macro),sectorReturns:[0,0,0,0,0],factorReturns:[0,0,0,0],beforeNav:100000,holdingsBefore:units.map((u,i)=>u*prices[i]),cashBefore:cash,cashRate:macro.rate/100/252,attribution:emptyAttribution(),contributionReturns:[]});return s;
  }
  function preview(s,weights=s.weights){
    const error=validWeights(weights);if(error)return {ok:false,error};
    const holdings=s.units.map((u,i)=>u*s.prices[i]);
    const trades=after=>{let buys=0,sells=0;for(let i=0;i<5;i++){const d=weights[i]*after-holdings[i];if(d>=0)buys+=d;else sells-=d;}return {buys,sells,fee:buys*s.config.buyRate+sells*s.config.sellRate};};
    let lo=0,hi=s.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(mid+trades(mid).fee>s.nav)hi=mid;else lo=mid;}
    const after=(lo+hi)/2,t=trades(after);return {ok:true,weights:[...weights],after,fee:t.fee,buys:t.buys,sells:t.sells,turnover:(t.buys+t.sells)/s.nav,cash:after*weights[5]};
  }
  function recommend(s,factorWeights,cashWeight=.15){
    if(!validFactors(factorWeights))fail('invalidFactors');if(!Number.isFinite(cashWeight)||cashWeight<0||cashWeight>1)fail('invalidWeights');
    const scores=EXPOSURES.map(row=>Math.exp(sum(row.map((v,i)=>v*factorWeights[i])))),w=[0,0,0,0,0,cashWeight];let free=[0,1,2,3,4],remaining=1-cashWeight;
    while(free.length){const total=sum(free.map(i=>scores[i])),capped=free.filter(i=>remaining*scores[i]/total>.4);if(!capped.length){for(const i of free)w[i]=remaining*scores[i]/total;break;}for(const i of capped){w[i]=.4;remaining-=.4;}free=free.filter(i=>!capped.includes(i));}return w;
  }
  function macroStep(s,impacts){
    const m=s.macro,lag=s.history[Math.max(0,s.history.length-1-s.config.lagDays)].macro,n=s.config.macroNoise;
    m.liquidity=clamp(m.liquidity+.05*(55-m.liquidity)-.08*(lag.rate-3)-.015*(lag.credit-25)+normal(s)*n*2,0,100);
    m.credit=clamp(m.credit+.025*(24-m.credit)+.045*(lag.rate-3)-.055*(lag.growth-2.5)+normal(s)*n,0,100);
    m.sentiment=clamp(m.sentiment+.055*(52-m.sentiment)+.08*(m.growth-2.5)+.012*(m.liquidity-50)-.018*(m.credit-25)+normal(s)*n*3,0,100);
    if(s.day%s.config.slowEvery===0){
      m.rate=clamp(m.rate+s.config.rateReversion*((2.5+.4*(lag.inflation-2)+.12*(lag.growth-2.5))-m.rate)+normal(s)*n*.12,0,15);
      m.growth=clamp(m.growth+s.config.growthReversion*(3-m.growth)-.035*(lag.rate-lag.inflation-1)-.005*(lag.credit-25)+.002*(lag.liquidity-50)+normal(s)*n,-8,10);
      m.inflation=clamp(m.inflation+s.config.inflationReversion*(2.3-m.inflation)+.02*(lag.growth-2.5)+normal(s)*n*.5,-3,16);
    }
    for(const [key,v] of Object.entries(impacts))m[key]+=v;
    for(const [key,lo,hi] of [['rate',0,15],['inflation',-3,16],['growth',-8,10],['liquidity',0,100],['credit',0,100],['sentiment',0,100]])m[key]=clamp(m[key],lo,hi);
    if(s.day%s.config.slowEvery===0){const candidate=cycleSignal(m);s.cycleCount=s.cycleCandidate===candidate?s.cycleCount+1:1;s.cycleCandidate=candidate;if(s.cycleCount>=s.config.cycleConfirmations&&s.day-s.cycleChanged>=s.config.minCycleDays&&m.cycle!==candidate){m.cycle=candidate;s.cycleChanged=s.day;}}
  }
  function trigger(s){
    const total=s.config.rounds*s.daysPerRound;
    const index=EVENT_DEFINITIONS.findIndex((e,i)=>Math.max(1,Math.round(e.at*total/120))<=s.day&&!s.events.some(old=>old.id===e.id)&&(i===0||s.events.some(old=>old.id===EVENT_DEFINITIONS[i-1].id)));
    const definition=EVENT_DEFINITIONS[index];
    if(!definition)return false;
    const orderConversion=index===0?.35+uniform(s)*.5:s.eventState['EVENT-ORDER'].hidden.orderConversion;
    const stress=clamp(1+(s.macro.credit-25)/100,.75,1.6),severity=(.7+uniform(s)*.6)*s.config.eventStrength*(index===2?stress:1);
    const event={id:definition.id,titleKey:`event.${definition.key}.title`,bodyKey:index===1?`event.disclosure.${orderConversion>=.6?'strong':'weak'}`:`event.${definition.key}.body`,predecessorId:index?EVENT_DEFINITIONS[index-1].id:null,startDay:s.day,duration:Math.max(2,Math.round(definition.duration*total/120)),severity,status:'active',trigger:'disclosure-node-and-predecessor',resolution:'duration-elapsed'};
    const sector=[...definition.sector];if(index===1)sector[0]+=(orderConversion-.6)*.009;if(index===4)sector[0]+=(orderConversion-.6)*.005;
    s.eventState[event.id]={macroImpact:clone(definition.macro),sectorImpact:sector,factorImpact:[...definition.factor],hidden:{orderConversion},followUpId:EVENT_DEFINITIONS[index+1]?.id||null};
    s.events.push(event);return true;
  }
  function eventImpacts(s){
    const macro={},sector=[0,0,0,0,0],factors=[0,0,0,0];
    for(const event of s.events){const age=s.day-event.startDay;if(age>=event.duration){event.status='resolved';continue;}const d=s.eventState[event.id],scale=event.severity*Math.exp(-age/event.duration);for(const [k,v] of Object.entries(d.macroImpact))macro[k]=(macro[k]||0)+v*scale;d.sectorImpact.forEach((v,i)=>sector[i]+=v*scale);d.factorImpact.forEach((v,i)=>factors[i]+=v*scale);}
    return {macro,sector,factors};
  }
  function marketStep(s,impact){
    const m=s.macro,prev=s.history.at(-1),noise=s.config.dailyNoise,risk=clamp(1+(m.credit-25)/90+(50-m.liquidity)/150,.65,2.5);
    const market=.00013+(m.growth-2.5)*.00013-(m.rate-3)*.00016-(m.inflation-2.5)*.00007+(m.liquidity-50)*.000006-(m.credit-25)*.000011+(m.sentiment-50)*.000004+normal(s)*noise*risk;
    const momentum=sum(prev.sectorReturns)/5;
    const factorReturns=[.10*momentum+(m.sentiment-50)*.000004+normal(s)*noise*.28,(m.rate-3)*.00007-(m.growth-3)*.00003+normal(s)*noise*.24,(m.credit-25)*.000006+(3-m.growth)*.000025+normal(s)*noise*.22,(m.credit-25)*.000005-(m.sentiment-50)*.000005+normal(s)*noise*.20];
    const contributionReturns=EXPOSURES.map((exposure,i)=>{
      const factors=exposure.map((v,j)=>v===0?0:v*factorReturns[j]),sector=(m.growth-2.5)*[.00007,.00009,.00005,.00006,.00004][i]-(m.inflation-2.5)*[.00004,.00006,-.00003,.00006,.00002][i];
      const event=impact.sector[i]+sum(exposure.map((v,j)=>v*impact.factors[j])),beta=BETAS[i]*market,rawIdio=normal(s)*noise*[.65,.5,.45,.6,.8][i],raw=beta+sum(factors)+sector+event+rawIdio;
      return {market:beta,factors,sector,event,idiosyncratic:rawIdio+clamp(raw,-.12,.12)-raw};
    });
    return {factorReturns,contributionReturns,sectorReturns:contributionReturns.map(c=>c.market+sum(c.factors)+c.sector+c.event+c.idiosyncratic)};
  }
  function daily(s){
    const previous=s.history.at(-1),holdings=s.units.map((u,i)=>u*s.prices[i]),cashBefore=s.cash,cashRate=s.macro.rate/100/252;
    s.day++;const occurred=trigger(s),impact=eventImpacts(s);macroStep(s,impact.macro);const returns=marketStep(s,impact),a=emptyAttribution();
    for(let i=0;i<5;i++){const c=returns.contributionReturns[i],amount=holdings[i];a.market+=amount*c.market;a.sector+=amount*c.sector;a.event+=amount*c.event;a.idiosyncratic+=amount*c.idiosyncratic;c.factors.forEach((r,j)=>a.factors[j]+=amount*r);s.prices[i]*=1+returns.sectorReturns[i];}
    a.cash=cashBefore*cashRate;a.cost=s.pendingCost?-s.pendingCost:0;s.cash+=a.cash;s.pendingCost=0;s.anchorCash*=1+cashRate;s.roundState.counterfactualCash*=1+cashRate;
    updateWeights(s);s.benchmarkNav*=1+sum(returns.sectorReturns)/5;s.anchorNav=value(s.anchorUnits,s.prices,s.anchorCash);
    s.history.push({day:s.day,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,prices:[...s.prices],macro:clone(s.macro),...returns,beforeNav:previous.nav,holdingsBefore:holdings,cashBefore,cashRate,attribution:a});
    if(occurred)s.phase='event';else if(s.day===s.round*s.daysPerRound)settleRound(s);
  }
  function aggregate(rows){const a=emptyAttribution();for(const h of rows){for(const k of ['market','sector','event','idiosyncratic','cash','cost'])a[k]+=h.attribution[k];h.attribution.factors.forEach((v,i)=>a.factors[i]+=v);}return a;}
  function settleRound(s){
    if(s.results.some(r=>r.round===s.round))return;
    const rs=s.roundState,returnValue=s.nav/rs.before-1,benchmarkReturn=s.benchmarkNav/rs.benchmarkBefore-1,rows=s.history.filter(h=>h.day>rs.startDay),counterfactualNav=value(rs.counterfactualUnits,s.prices,rs.counterfactualCash),realized=benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat';
    const badges=[];if(rs.decisionPolicy==='studio'){if(rs.evidenceRefs.length&&rs.falsifierIf.trim())badges.push('badge.recordComplete');}else{if(rs.reason.trim())badges.push('badge.reason');if(s.seen.length)badges.push('badge.evidence');if(sum(rs.weights.map(w=>w*w))<=.26)badges.push('badge.diversified');if(rs.weights[5]>=.1&&metrics(s).maxDrawdown<=.12)badges.push('badge.risk');if(realized===rs.forecast)badges.push('badge.forecast');}
    s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:rs.before,after:s.nav,returnValue,benchmarkReturn,anchorReturn:s.anchorNav/rs.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:aggregate(rows),forecast:rs.forecast,realizedForecast:realized,reason:rs.reason,weights:[...rs.weights],factorWeights:[...rs.factorWeights],reward:{points:badges.length*20,badges},synthetic:true});s.phase=s.round===s.config.rounds?'complete':'review';
    if(rs.cycleJudgment!==undefined)Object.assign(s.results.at(-1),{cycleAtDecision:rs.cycleAtDecision,cycleJudgment:rs.cycleJudgment,counterEvidence:rs.counterEvidence||''});
    if(s.version===STUDIO_VERSION)Object.assign(s.results.at(-1),{decisionPolicy:rs.decisionPolicy,evidenceRefs:[...rs.evidenceRefs],falsifierIf:rs.falsifierIf});
  }
  function reduce(s,a,options){
    if(!s||s.version!==VERSION)fail('invalidSave');return applyAction(s,a,'legacy',options?.optionalNotes===true);
  }
  function applyAction(s,a,decisionPolicy,optionalNotes=false){
    if(!s||![VERSION,STUDIO_VERSION].includes(s.version)||!a||typeof a!=='object')fail('invalidSave');if(s.commands.length>=4000)fail('invalidSave');
    const n=clone(s);let command;
    if(a.type==='lock'){
      const gate=decisionPolicy==='studio'?evaluateDecisionGate(s,a,optionalNotes):null;if(gate&&!gate.canConfirm)fail(gate.error);
      if(s.phase!=='decision')fail('invalidPhase');const p=preview(s,a.weights);if(!p.ok)fail(p.error);if(!validFactors(a.factorWeights))fail('invalidFactors');const reason=optionalNotes&&a.reason===undefined?'':a.reason;if(typeof reason!=='string'||reason.length>500||!optionalNotes&&!reason.trim())fail('invalidReason');if(!['up','flat','down'].includes(a.forecast))fail('invalidForecast');
      if(a.cycleJudgment!==undefined&&!['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(a.cycleJudgment))fail('invalidCycleJudgment');
      if(a.counterEvidence!==undefined&&(typeof a.counterEvidence!=='string'||a.counterEvidence.length>500))fail('invalidCounterEvidence');
      n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualUnits:[...s.units],counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:reason.trim(),forecast:a.forecast,cycleAtDecision:s.macro.cycle,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
      n.units=a.weights.slice(0,5).map((w,i)=>p.after*w/n.prices[i]);n.cash=p.cash;n.factorWeights=[...a.factorWeights];n.pendingCost=p.fee;n.transactions.push({day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,buyRate:s.config.buyRate,sellRate:s.config.sellRate,weights:[...a.weights]});updateWeights(n);n.phase='simulating';command={type:'lock',weights:[...a.weights],factorWeights:[...a.factorWeights],reason:reason.trim(),forecast:a.forecast,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
      if(s.version===STUDIO_VERSION){Object.assign(n.roundState,{decisionPolicy,evidenceRefs:gate?[...gate.evidenceRefs]:[],falsifierIf:gate?gate.falsifierIf:''});if(gate)Object.assign(command,{evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf});}
    }else if(a.type==='advance'){
      if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');for(let d=0;d<a.days&&n.phase==='simulating';d++)daily(n);command={type:'advance',days:a.days};
    }else if(a.type==='resume'){
      if(s.phase!=='event')fail('invalidPhase');n.phase='simulating';if(n.day===n.round*n.daysPerRound)settleRound(n);command={type:'resume'};
    }else if(a.type==='next'){
      if(s.phase!=='review'||s.round>=s.config.rounds)fail('invalidPhase');n.round++;n.phase='decision';n.roundState=null;command={type:'next'};
    }else if(a.type==='read'){
      const ids=['E1','E2','E3',...s.events.map(e=>e.id)];if(!ids.includes(a.id))fail('unknownEvidence');if(s.seen.includes(a.id))return s;n.seen.push(a.id);command={type:'read',id:a.id};
    }else fail('invalidAction');n.commands.push(command);return n;
  }
  function serialize(s){return {version:VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
  function restore(raw,options){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||save.version!==VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let state=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)state=reduce(state,a,options);return state;
  }
  function metrics(s){
    const rows=s.history.slice(1),dailyReturns=rows.map(h=>h.nav/h.beforeNav-1),excess=dailyReturns.map((r,i)=>r-rows[i].cashRate),n=rows.length,mean=n?sum(dailyReturns)/n:0,excessMean=n?sum(excess)/n:0;
    const variance=n>1?sum(dailyReturns.map(v=>(v-mean)**2))/(n-1):null,excessVariance=n>1?sum(excess.map(v=>(v-excessMean)**2))/(n-1):null;
    let peak=100000,maxDrawDown=0;for(const nav of [...s.history.map(h=>h.nav),s.nav]){peak=Math.max(peak,nav);maxDrawDown=Math.max(maxDrawDown,1-nav/peak);}
    return {returnValue:s.nav/100000-1,volatility:variance===null?null:Math.sqrt(variance*252),sharpe:excessVariance===null||excessVariance<1e-20?null:excessMean/Math.sqrt(excessVariance)*Math.sqrt(252),maxDrawdown:maxDrawDown,diversification:1-sum(s.weights.map(w=>w*w)),excessReturn:(s.nav-s.benchmarkNav)/100000,tacticalAmount:s.nav-s.anchorNav,observations:n,annualization:252,rf:'known-daily-policy-rate',attribution:aggregate(rows)};
  }
  const visibleMacro=macro=>{const out=clone(macro||{});delete out.cycle;return out;};
  const visibleHistory=rows=>clone(rows).map(row=>({...row,macro:visibleMacro(row?.macro)}));
  function publicView(s){
    const result={version:s.version,synthetic:true,phase:s.phase,day:s.day,round:s.round,rounds:s.config.rounds,daysPerRound:s.daysPerRound,macro:visibleMacro(s.macro),prices:[...s.prices],units:[...s.units],cash:s.cash,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,weights:[...s.weights],factorWeights:[...s.factorWeights],history:visibleHistory(s.history),results:clone(s.results),events:clone(s.events),seen:[...s.seen],metrics:metrics(s),evidence:['E1','E2','E3'].map(id=>({id,titleKey:`evidence.${id}.title`,bodyKey:`evidence.${id}.body`}))};return result;
  }
  function coachContext(s,lang='zh-CN'){
    const language=lang==='en'?'en':'zh-CN',t=TEXTS[language],v=publicView(s);
    return {version:VERSION,synthetic:true,language,phase:v.phase,day:v.day,round:v.round,model:t['model.note'],benchmark:t['model.benchmark'],riskDefinition:t['model.risk'],macro:{id:`MACRO-D${s.day}`,...v.macro},portfolio:{id:`PORTFOLIO-D${s.day}`,nav:v.nav,cash:v.cash,weights:v.weights,sectors:SECTORS.map(k=>t[`sector.${k}`]),factorWeights:v.factorWeights,factorNames:FACTOR_NAMES.map(k=>t[`factor.${k}`])},metrics:{id:`METRICS-D${s.day}`,...v.metrics},evidence:v.evidence.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey]})),events:v.events.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey],startDay:e.startDay,status:e.status})),results:v.results.map(r=>({id:r.id,round:r.round,returnValue:r.returnValue,benchmarkReturn:r.benchmarkReturn,tacticalAmount:r.tacticalAmount,forecast:r.forecast,realizedForecast:r.realizedForecast,reason:r.reason})),recentHistory:v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}))};
  }
  function sampleReply(s,question='',lang='zh-CN'){
    const t=TEXTS[lang==='en'?'en':'zh-CN'],review=['review','complete'].includes(s.phase),key=review?'coach.review':/risk|drawdown|cash|风险|回撤|现金/i.test(question)?'coach.risk':'coach.macro';
    const references=[`MACRO-D${s.day}`,`PORTFOLIO-D${s.day}`];if(review&&s.results.length)references.push(s.results.at(-1).id);else if(s.events.length)references.push(s.events.at(-1).id);
    return {mode:'example',summary:t[key],detail:`${t['coach.detail']} ${t['coach.synthetic']}`,references};
  }
  function evaluateDecisionGate(s,draft,optionalNotes=false){
    const result={status:'blocked',canConfirm:false,recordComplete:false,error:null,evidenceRefs:[],falsifierIf:''};
    const blocked=error=>({...result,error});
    if(!s||s.phase!=='decision')return blocked('invalidPhase');
    if(!draft||typeof draft!=='object'||Array.isArray(draft))return blocked('invalidWeights');
    const refs=draft.evidenceRefs===undefined?[]:draft.evidenceRefs,available=['E1','E2','E3',...s.events.map(e=>e.id)];
    const refsValid=Array.isArray(refs)&&refs.length<=9&&Array.from(refs).every(id=>typeof id==='string'&&id.length>0&&id.length<=64&&available.includes(id));
    if(refsValid)result.evidenceRefs=[...new Set(refs)];
    const falsifier=draft.falsifierIf===undefined?'':draft.falsifierIf,falsifierValid=typeof falsifier==='string'&&falsifier.length<=500;
    if(falsifierValid)result.falsifierIf=falsifier.trim();
    const cycleJudgment=draft.cycleJudgment===undefined?null:draft.cycleJudgment,cycleValid=cycleJudgment===null||['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(cycleJudgment);
    if(!cycleValid)return blocked('invalidCycleJudgment');
    const counterEvidence=draft.counterEvidence===undefined?'':draft.counterEvidence;
    if(typeof counterEvidence!=='string'||counterEvidence.length>500)return blocked('invalidCounterEvidence');
    if(draft.cycleJudgment!==undefined)result.cycleJudgment=cycleJudgment;if(draft.counterEvidence!==undefined)result.counterEvidence=counterEvidence.trim();
    const weightError=validWeights(draft.weights);if(weightError)return blocked(weightError);
    if(Array.from(draft.weights).some(w=>!Number.isFinite(w)))return blocked('invalidWeights');
    if(!validFactors(draft.factorWeights)||Array.from(draft.factorWeights).some(w=>!Number.isFinite(w)))return blocked('invalidFactors');
    const reason=optionalNotes&&draft.reason===undefined?'':draft.reason;
    if(typeof reason!=='string'||reason.length>500||!optionalNotes&&!reason.trim())return blocked('invalidReason');
    if(!['up','flat','down'].includes(draft.forecast))return blocked('invalidForecast');
    if(!refsValid)return blocked('invalidEvidenceRefs');
    if(!falsifierValid)return blocked('invalidFalsifier');
    if(!optionalNotes&&!result.evidenceRefs.length)return {...result,status:'need_evidence',error:'evidenceRequired'};
    result.recordComplete=!!result.evidenceRefs.length&&!!result.falsifierIf;
    return {...result,status:optionalNotes||result.recordComplete?'ready':'need_falsifier',canConfirm:true};
  }
  function studioInitial(options){return {...initial(options),version:STUDIO_VERSION,policyBoundary:0};}
  function studioReduce(s,a,optionalNotes){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return applyAction(s,a,'studio',optionalNotes);
  }
  function studioSerialize(s){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return {...serialize(s),version:STUDIO_VERSION,policyBoundary:s.policyBoundary};
  }
  function studioRestore(raw,optionalNotes){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||![VERSION,STUDIO_VERSION].includes(save.version)||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');
    const boundary=save.version===VERSION?save.commands.length:save.policyBoundary;
    if(!Number.isInteger(boundary)||boundary<0||boundary>save.commands.length)fail('invalidSave');
    let state=studioInitial({seed:save.seed,scenario:save.scenario,config:save.config});
    for(let i=0;i<save.commands.length;i++){
      const next=applyAction(state,save.commands[i],i<boundary?'legacy':'studio',optionalNotes);
      state=next===state?{...state,commands:[...state.commands,{type:'read',id:save.commands[i].id}]}:next;
    }
    state.policyBoundary=boundary;return state;
  }
  function decisionRecord(record){
    if(!record)return null;return {decisionPolicy:record.decisionPolicy,weights:[...record.weights],factorWeights:[...record.factorWeights],reason:record.reason,forecast:record.forecast,evidenceRefs:[...record.evidenceRefs],falsifierIf:record.falsifierIf,...(record.cycleJudgment!==undefined?{cycleAtDecision:record.cycleAtDecision,cycleJudgment:record.cycleJudgment,counterEvidence:record.counterEvidence||''}:{})};
  }
  function studioPublicView(s){return {...publicView(s),roundState:decisionRecord(s.roundState)};}
  function studioCoachContext(s,lang='zh-CN',draft,optionalNotes){
    const context=coachContext(s,lang),gate=draft===undefined?null:evaluateDecisionGate(s,draft,optionalNotes);
    context.version=STUDIO_VERSION;context.decision=decisionRecord(s.roundState);context.decisionGate=gate;
    if(draft!==undefined)context.decision={decisionPolicy:'studio',weights:Array.isArray(draft?.weights)?[...draft.weights]:[],factorWeights:Array.isArray(draft?.factorWeights)?[...draft.factorWeights]:[],reason:typeof draft?.reason==='string'?draft.reason.slice(0,500):'',forecast:['up','flat','down'].includes(draft?.forecast)?draft.forecast:null,evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf,cycleJudgment:['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(draft?.cycleJudgment)?draft.cycleJudgment:null,counterEvidence:typeof draft?.counterEvidence==='string'?draft.counterEvidence.slice(0,500):''};
    if(context.decision&&!['review','complete'].includes(s.phase)){delete context.decision.cycleAtDecision;delete context.decision.cycleJudgment;delete context.decision.counterEvidence;}
    context.results=context.results.map((r,i)=>({...r,decisionPolicy:s.results[i].decisionPolicy,evidenceRefs:[...s.results[i].evidenceRefs],falsifierIf:s.results[i].falsifierIf,cycleAtDecision:s.results[i].cycleAtDecision,cycleJudgment:s.results[i].cycleJudgment,counterEvidence:s.results[i].counterEvidence}));return context;
  }
  function createResearchStudioEngine({optionalNotes=false}={}){
    const texts=clone(TEXTS);texts['zh-CN']['badge.recordComplete']='决策记录完整';texts.en['badge.recordComplete']='Decision record complete';
    return {...api,VERSION:STUDIO_VERSION,TEXTS:texts,initial:studioInitial,reduce:(s,a)=>studioReduce(s,a,optionalNotes),serialize:studioSerialize,restore:raw=>studioRestore(raw,optionalNotes),publicView:studioPublicView,coachContext:(s,lang,draft)=>studioCoachContext(s,lang,draft,optionalNotes),evaluateDecisionGate:(s,draft)=>evaluateDecisionGate(s,draft,optionalNotes)};
  }
  const cycleSignal=m=>m.growth<.5?(m.inflation>3.5?'stagflation':'recession'):m.growth>3.6&&m.inflation>3.3?'overheating':m.growth<2.2?'recovery':'expansion';
  const api={cycleSignal,VERSION,SECTORS,FACTOR_NAMES,INITIAL_WEIGHTS,EXPOSURES,BETAS,DEFAULT_CONFIG,TEXTS,initial,reduce,serialize,restore,publicView,coachContext,sampleReply,recommend,metrics,preview,createResearchStudioEngine};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactorLabSimulation=api;
})(typeof window==='undefined'?globalThis:window);

;
(function(root){
  'use strict';
  const VERSION='factorlab-securities-v3.0.0',SCHEMA=1,BASKET_VERSION='teaching-baskets-20261030.1';
  const SECTORS=['semiconductor','robotics','materials','energy','digital'];
  const entries=[
    ['SIM-SEMI-A',0,.4,80,'教学芯片设计 A','Teaching chip design A'],['SIM-SEMI-B',0,.3,60,'教学晶圆设备 B','Teaching wafer equipment B'],['SIM-SEMI-C',0,.3,40,'教学封测 C','Teaching packaging C'],
    ['SIM-ROBO-A',1,.6,50,'教学工业机器人 A','Teaching industrial robotics A'],['SIM-ROBO-B',1,.4,25,'教学自动化控制 B','Teaching automation B'],
    ['SIM-MAT-A',2,.5,30,'教学先进合金 A','Teaching advanced alloys A'],['SIM-MAT-B',2,.5,75,'教学电子材料 B','Teaching electronic materials B'],
    ['SIM-ENERGY-A',3,.55,45,'教学电力装备 A','Teaching power equipment A'],['SIM-ENERGY-B',3,.45,20,'教学储能设备 B','Teaching storage equipment B'],
    ['SIM-AI-A',4,.65,100,'教学算力设备 A','Teaching compute equipment A'],['SIM-AI-B',4,.35,35,'教学数据网络 B','Teaching data networks B']
  ];
  const INSTRUMENTS=entries.map(([id,sectorIndex,weight,initialPrice,zh,en])=>({id,symbol:id,sectorIndex,sectorId:SECTORS[sectorIndex],weight,initialPrice,name:{'zh-CN':zh,en},currency:'USD',type:'teaching-stock',dataMode:'synthetic',source:'FactorLab authored teaching issuer; not a listed security',sourceUrl:null}));
  const BASKETS=SECTORS.map((sectorId,i)=>({id:sectorId,version:BASKET_VERSION,dataMode:'synthetic',components:INSTRUMENTS.filter(x=>x.sectorIndex===i).map(x=>({instrumentId:x.id,weight:x.weight})),isETF:false}));
  const clone=x=>JSON.parse(JSON.stringify(x)),sum=xs=>xs.reduce((a,b)=>a+b,0),money=x=>Math.round(x*1e6)/1e6,shares=x=>Math.floor((x+1e-12)*1e6)/1e6;
  const fail=x=>{throw Error(x);};
  const asOf=day=>new Date(Date.UTC(2024,0,2+day,16)).toISOString();
  const time=(day,minutes)=>new Date(Date.parse(asOf(day))+minutes*60000).toISOString();
  const attribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  const zeroContributions=()=>Object.fromEntries(INSTRUMENTS.map(x=>[x.id,0]));
  function hash(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  function weightError(w){return !Array.isArray(w)||w.length!==6||Array.from(w).some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(sum(w)-1)>1e-9?'invalidWeights':w.slice(0,5).some(v=>v>.4+1e-10)?'sectorCap':null;}
  function refresh(ledger){
    ledger.asOf=asOf(ledger.day);ledger.invested=money(sum(ledger.holdings.map(h=>money(h.quantity*h.price))));ledger.nav=money(ledger.cash+ledger.invested);
    for(const h of ledger.holdings){h.marketValue=money(h.quantity*h.price);h.weight=h.marketValue/ledger.nav;h.priceTime=ledger.asOf;}
    ledger.snapshotId='P-'+hash([ledger.day,ledger.revision,ledger.cash,ledger.holdings.map(h=>[h.id,h.price,h.quantity])]);
    return ledger;
  }
  function snapshotRow(ledger,extra={}){return {day:ledger.day,asOf:ledger.asOf,nav:ledger.nav,cash:ledger.cash,beforeNav:ledger.nav,prices:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.price])),quantities:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.quantity])),contributions:zeroContributions(),cashContribution:0,fee:0,...extra};}
  function createLedger(weights){
    const holdings=INSTRUMENTS.map(x=>({...clone(x),quantity:shares(100000*weights[x.sectorIndex]*x.weight/x.initialPrice),price:x.initialPrice}));
    const ledger=refresh({schema:SCHEMA,engineVersion:VERSION,basketVersion:BASKET_VERSION,currency:'USD',dataMode:'synthetic',day:0,revision:0,cash:money(100000-sum(holdings.map(h=>money(h.quantity*h.price)))),holdings,baskets:clone(BASKETS),transactions:[],history:[],pendingFee:0,totalFees:0,buyRate:.0013,sellRate:.0018,precision:{moneyDecimals:6,shareDecimals:6,priceDecimals:6,displayDecimals:2},priceBasis:'synthetic-raw-no-splits-no-dividends',executionRule:'synthetic fixed quote at 16:02 UTC, after 16:00 signal and 16:01 decision; calendar-day teaching steps, not a real exchange calendar'});
    ledger.history.push(snapshotRow(ledger));return ledger;
  }
  function simulateAllocation(view,weights){
    const ledger=view.ledger||view,error=weightError(weights);if(error)return {ok:false,error};if(!ledger?.holdings)return {ok:false,error:'legacyLedger'};
    const calculate=capital=>{
      const rows=ledger.holdings.map(h=>{const targetWeight=weights[h.sectorIndex]*h.weightInBasket,quantity=targetWeight===0?0:Math.abs(capital*targetWeight-h.marketValue)<=h.price*1.0001e-6?h.quantity:shares(capital*targetWeight/h.price),targetAmount=money(quantity*h.price),deltaQuantity=money(quantity-h.quantity),delta=money(deltaQuantity*h.price),fee=money(Math.abs(delta)*(delta>=0?ledger.buyRate:ledger.sellRate));return {instrumentId:h.id,id:h.id,symbol:h.symbol,name:clone(h.name),sectorId:h.sectorId,sectorIndex:h.sectorIndex,type:h.type,currency:h.currency,targetWeight,requestedAmount:money(ledger.nav*targetWeight),targetAmount,quantity,price:h.price,priceTime:h.priceTime,currentQuantity:h.quantity,currentAmount:h.marketValue,deltaQuantity,delta,fee};});
      const buys=money(sum(rows.map(r=>Math.max(0,r.delta)))),sells=money(sum(rows.map(r=>Math.max(0,-r.delta)))),fee=money(sum(rows.map(r=>r.fee))),cash=money(ledger.cash+sells-buys-fee);return {rows,buys,sells,fee,cash,after:money(cash+sum(rows.map(r=>r.targetAmount)))};
    };
    let lo=0,hi=ledger.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2,p=calculate(mid);if(p.cash<0||mid+p.fee>ledger.nav)hi=mid;else lo=mid;}
    const p=calculate(lo);return {ok:true,...p,weights:[...weights],turnover:(p.buys+p.sells)/ledger.nav,revision:ledger.revision,snapshotId:ledger.snapshotId,basketVersion:BASKET_VERSION,signalTime:ledger.asOf,decisionTime:time(ledger.day,1),executionTime:time(ledger.day,2),assumptions:{currency:'USD',fractionalShares:6,synthetic:true,buyRate:ledger.buyRate,sellRate:ledger.sellRate}};
  }
  function createEngine(base){
    const legacy=base.createResearchStudioEngine({optionalNotes:true});
    function old(s){return s?.version!==VERSION;}
    function oldEngine(s){return s.version===base.VERSION?base:legacy;}
    function initial(options){
      const market=legacy.initial(options),ledger=createLedger(market.weights);ledger.buyRate=market.config.buyRate;ledger.sellRate=market.config.sellRate;
      for(const h of ledger.holdings)h.weightInBasket=INSTRUMENTS.find(x=>x.id===h.id).weight;
      const s={...clone(market),version:VERSION,_market:market,ledger,commands:[],results:[],transactions:[],seen:[],roundState:null,anchorHoldings:ledger.holdings.map(h=>h.quantity),anchorCash:ledger.cash,benchmarkNav:100000,anchorNav:100000};
      s.history=[{...clone(market.history[0]),nav:ledger.nav,cashBefore:ledger.cash,securityContributions:zeroContributions()}];return sync(s);
    }
    function sync(s){
      const l=refresh(s.ledger);s.nav=l.nav;s.cash=l.cash;s.day=s._market.day;s.round=s._market.round;s.phase=s._market.phase;s.macro=clone(s._market.macro);s.events=clone(s._market.events);s.prices=[...s._market.prices];
      const sectors=SECTORS.map((_,i)=>money(sum(l.holdings.filter(h=>h.sectorIndex===i).map(h=>h.marketValue))));s.units=sectors.map((x,i)=>x/s.prices[i]);s.weights=[...sectors.map(x=>x/l.nav),l.cash/l.nav];s.transactions=clone(l.transactions);return s;
    }
    function publicView(s){
      if(old(s))return {...oldEngine(s).publicView(s),legacy:true,ledger:null};
      const v=legacy.publicView({...s,version:legacy.VERSION});v.version=VERSION;v.legacy=false;v.ledger=clone(s.ledger);v.ledger.unpostedFee=v.ledger.pendingFee;delete v.ledger.pendingFee;v.asOf=s.ledger.asOf;v.decisionTime=time(s.day,1);v.snapshotId=s.ledger.snapshotId;v.revision=s.ledger.revision;v.transactions=clone(s.ledger.transactions);v.metrics=metrics(s);return v;
    }
    function evidenceAPI(){return root.FactorLabEvidence||(typeof require==='function'?(()=>{try{return require('./evidence-data.js');}catch{return null;}})():null);}
    function evaluateDecisionGate(s,draft){
      if(old(s))return legacy.evaluateDecisionGate(s,draft);
      const original=draft?.evidenceRefs===undefined?[]:draft.evidenceRefs;
      const gate=legacy.evaluateDecisionGate(s._market,{...draft,evidenceRefs:[]});
      if(!Array.isArray(original)||original.length>24||original.some(ref=>typeof ref!=='string'||ref.length>120))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      const available=[],api=evidenceAPI(),view=api?publicView(s):null;
      if(original.some(id=>!available.includes(id)&&!api?.validateReference(view,id)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      if(draft?.evidenceSelections!==undefined){if(!Array.isArray(draft.evidenceSelections)||draft.evidenceSelections.length>24||draft.evidenceSelections.some(ref=>!api?.validateReference(view,ref)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};}
      return {...gate,status:gate.canConfirm?'ready':gate.status,recordComplete:gate.canConfirm&&!!original.length&&!!gate.falsifierIf,evidenceRefs:[...new Set(original)]};
    }
    function preview(s,weights=s.weights){return old(s)?oldEngine(s).preview(s,weights):simulateAllocation(s,weights);}
    function settle(s){
      if(s.results.some(r=>r.round===s.round))return;
      const r=s.roundState,l=s.ledger,rows=l.history.filter(h=>h.day>r.startDay),securityContributions=zeroContributions();for(const h of rows)for(const id of Object.keys(securityContributions))securityContributions[id]=money(securityContributions[id]+h.contributions[id]);
      const cashContribution=money(sum(rows.map(h=>h.cashContribution))),fee=money(sum(rows.map(h=>h.fee))),benchmarkReturn=s.benchmarkNav/r.benchmarkBefore-1,recordComplete=!!r.evidenceRefs.length&&!!r.falsifierIf.trim(),counterfactualNav=money(r.counterfactualCash+sum(l.holdings.map((h,i)=>r.counterfactualQuantities[i]*h.price))),a=attribution();a.sector=money(sum(Object.values(securityContributions)));a.cash=cashContribution;a.cost=-fee;
      s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:r.before,after:s.nav,returnValue:s.nav/r.before-1,benchmarkReturn,anchorReturn:s.anchorNav/r.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:a,securityContributions,cashContribution,fee,forecast:r.forecast,realizedForecast:benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat',reason:r.reason,weights:[...r.weights],factorWeights:[...r.factorWeights],reward:{points:recordComplete?20:0,badges:recordComplete?['badge.recordComplete']:[]},decisionPolicy:'securities',evidenceRefs:clone(r.evidenceRefs),evidenceSelections:clone(r.evidenceSelections),falsifierIf:r.falsifierIf,...(r.cycleJudgment!==undefined?{cycleAtDecision:r.cycleAtDecision,cycleJudgment:r.cycleJudgment,counterEvidence:r.counterEvidence||''}:{}),synthetic:true,attributionKind:'accounting-not-causal'});
    }
    function markDay(s){
      const l=s.ledger,m=s._market.history.at(-1),beforeNav=s.history.at(-1).nav,cashBefore=l.cash,priorPrices=l.holdings.map(h=>h.price),contributions=zeroContributions(),fee=l.pendingFee;
      const sectorReturns=SECTORS.map(()=>0);
      l.holdings.forEach((h,i)=>{const individual=.0012*Math.sin((s._market.day+i*11+s.seed%97)*.73)*(i%2?1:-1),change=m.sectorReturns[h.sectorIndex]+individual;h.price=money(Math.max(.01,h.price*(1+change)));contributions[h.id]=money(h.quantity*(h.price-priorPrices[i]));sectorReturns[h.sectorIndex]+=h.weightInBasket*(h.price/priorPrices[i]-1);});
      const cashInterest=money(cashBefore*m.cashRate);l.cash=money(l.cash+cashInterest);l.pendingFee=0;l.day=s._market.day;l.revision++;refresh(l);s.anchorCash=money(s.anchorCash*(1+m.cashRate));s.roundState.counterfactualCash=money(s.roundState.counterfactualCash*(1+m.cashRate));s.anchorNav=money(s.anchorCash+sum(l.holdings.map((h,i)=>h.price*s.anchorHoldings[i])));s.benchmarkNav=money(s.benchmarkNav*(1+sum(sectorReturns)/5));
      const cashContribution=money(l.nav-beforeNav-sum(Object.values(contributions))+fee),a=attribution();a.sector=money(sum(Object.values(contributions)));a.cash=cashContribution;a.cost=-fee;
      l.history.push(snapshotRow(l,{beforeNav,contributions,cashContribution,interest:cashInterest,roundingAdjustment:money(cashContribution-cashInterest),fee}));
      s.history.push({...clone(m),nav:l.nav,beforeNav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,cashBefore,holdingsBefore:SECTORS.map((_,j)=>money(sum(l.holdings.map((h,i)=>h.sectorIndex===j?h.quantity*priorPrices[i]:0)))),attribution:a,securityContributions:clone(contributions),sectorReturns,contributionReturns:[]});sync(s);
      if(['review','complete'].includes(s.phase))settle(s);
    }
    function reduce(s,a){
      if(old(s))return oldEngine(s).reduce(s,a,{optionalNotes:true});if(!a||typeof a!=='object'||s.commands.length>=4000)fail('invalidAction');
      const fields={lock:['type','weights','factorWeights','reason','forecast','evidenceRefs','evidenceSelections','falsifierIf','cycleJudgment','counterEvidence','revision','snapshotId','transactionId'],advance:['type','days'],read:['type','id'],resume:['type'],next:['type']}[a.type];
      if(!fields)fail('invalidAction');
      const command=Object.fromEntries(fields.filter(k=>a[k]!==undefined).map(k=>[k,clone(a[k])])),n=clone(s);
      if(a.type==='lock'&&a.transactionId){const tx=s.ledger.transactions.find(t=>t.id===a.transactionId);if(tx){if(tx.requestHash!==hash(command))fail('transactionConflict');return s;}}
      if(a.type==='lock'){
        const gate=evaluateDecisionGate(s,a);if(!gate.canConfirm)fail(gate.error);const p=preview(s,a.weights);if(!p.ok)fail(p.error);
        if(a.revision!==undefined&&a.revision!==p.revision||a.snapshotId!==undefined&&a.snapshotId!==p.snapshotId)fail('staleSnapshot');
        if(a.transactionId!==undefined&&(typeof a.transactionId!=='string'||a.transactionId.length>120||!a.transactionId))fail('invalidTransaction');
        n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualQuantities:s.ledger.holdings.map(h=>h.quantity),counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:typeof a.reason==='string'?a.reason.trim():'',forecast:a.forecast,decisionPolicy:'securities',evidenceRefs:gate.evidenceRefs,evidenceSelections:(a.evidenceSelections||[]).map(ref=>evidenceAPI().resolveReference(publicView(s),ref)),falsifierIf:gate.falsifierIf,cycleAtDecision:s.macro.cycle,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
        n._market=legacy.reduce(n._market,{...a,reason:n.roundState.reason||'allocation',evidenceRefs:['E1']});n.factorWeights=[...a.factorWeights];n.ledger.holdings.forEach((h,i)=>h.quantity=p.rows[i].quantity);n.ledger.cash=p.cash;n.ledger.pendingFee=p.fee;n.ledger.totalFees=money(n.ledger.totalFees+p.fee);n.ledger.revision++;
        n.ledger.transactions.push({id:a.transactionId||`TX-R${s.round}`,requestHash:hash(command),day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,cashBefore:s.cash,cashAfter:p.cash,rows:p.rows,weights:[...a.weights],buyRate:n.ledger.buyRate,sellRate:n.ledger.sellRate,snapshotId:p.snapshotId,revision:p.revision,signalTime:p.signalTime,decisionTime:p.decisionTime,executionTime:p.executionTime});sync(n);
      }else if(a.type==='advance'){
        if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');
        for(let i=0;i<a.days&&n.phase==='simulating';i++){n._market=legacy.reduce(n._market,{type:'advance',days:1});markDay(n);}
      }else if(a.type==='resume'){
        n._market=legacy.reduce(n._market,a);sync(n);if(['review','complete'].includes(n.phase))settle(n);
      }else if(a.type==='next'){
        n._market=legacy.reduce(n._market,a);n.roundState=null;sync(n);
      }else if(a.type==='read'){
        const api=evidenceAPI();if(!['E1','E2','E3',...s.events.map(x=>x.id)].includes(a.id)&&!api?.validateReference(publicView(s),a.id))fail('unknownEvidence');if(n.seen.includes(a.id))return s;n.seen.push(a.id);
      }else fail('invalidAction');
      n.commands.push(command);return n;
    }
    function serialize(s){if(old(s))return oldEngine(s).serialize(s);return {version:VERSION,schema:SCHEMA,basketVersion:BASKET_VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
    function restore(raw){let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch{fail('invalidSave');}if(!save||typeof save!=='object')fail('invalidSave');if(save.version!==VERSION){if(![base.VERSION,legacy.VERSION].includes(save.version))fail('invalidSave');return oldEngine(save).restore(save,{optionalNotes:true});}if(save.schema!==SCHEMA||save.basketVersion!==BASKET_VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let s=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)s=reduce(s,a);return s;}
    function metrics(s){if(old(s))return oldEngine(s).metrics(s);const result=base.metrics(s);result.attribution.cost=money(result.attribution.cost-s.ledger.pendingFee);return {...result,attributionKind:'accounting-not-causal'};}
    function coachContext(s,lang='zh-CN',draft){
      if(old(s))return oldEngine(s).coachContext(s,lang,draft);const v=publicView(s),en=lang==='en',context=legacy.coachContext({...s,version:legacy.VERSION},lang);context.riskDefinition=en?'Risk uses one synthetic calendar step per return and an illustrative 252-step annualization, not an observed exchange-day statistic. Fees are included; insufficient samples remain undefined.':'每个合成日步计算一次收益，252步年化是教学假设，不是真实交易日统计；计入费用，样本不足留空。';context.version=VERSION;context.asOf=v.asOf;context.decisionTime=v.decisionTime;context.portfolio={...context.portfolio,snapshotId:v.snapshotId,revision:v.revision,currency:'USD',holdings:v.ledger.holdings,totalFees:v.ledger.totalFees};context.model=en?'Synthetic security prices and fractional shares. Teaching issuers are fictional; no split or dividend events.':'合成证券价格与小数股；教学公司为虚构，无拆股或分红事件。';context.benchmark=en?'Five teaching sector baskets at 20% each; daily rebalance without fees.':'五个教学行业篮子各20%，每日再平衡、免费用。';context.decision=draft?clone(draft):clone(s.roundState);if(context.decision){delete context.decision.counterfactualQuantities;delete context.decision.counterfactualCash;if(!['review','complete'].includes(s.phase)){delete context.decision.cycleAtDecision;delete context.decision.cycleJudgment;delete context.decision.counterEvidence;}}context.decisionGate=draft?evaluateDecisionGate(s,draft):null;context.recentHistory=v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}));return context;
    }
    const texts=clone(legacy.TEXTS);texts['zh-CN']['model.note']='虚构证券、小数股与合成价格的教学账本；不模拟真实交易所撮合、拆股或分红。';texts.en['model.note']='Teaching ledger with fictional securities, fractional shares and synthetic prices; no real exchange matching, splits or dividends.';
    return {...legacy,VERSION,TEXTS:texts,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),initial,reduce,preview,serialize,restore,publicView,coachContext,metrics,evaluateDecisionGate};
  }
  const api={VERSION,SCHEMA,BASKET_VERSION,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),createEngine,simulateAllocation,asOf};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.FactorLabLedger=api;if(root.FactorLabSimulation)root.FactorLabSimulation.createSecuritiesEngine=()=>createEngine(root.FactorLabSimulation);}
})(typeof window==='undefined'?globalThis:window);

;
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
  const priceEarnings=(price,eps)=>Number.isFinite(price)&&Number.isFinite(eps)&&eps>0?round(price/eps,2):null;
  const hash=value=>{let a=2166136261,b=5381;for(const c of JSON.stringify(value)){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');};
  function asOf(view){const day=view?.day;if(!Number.isInteger(day)||day<0||day>10000)throw Error('invalidEvidenceTime');return iso(day);}
  function explain(key,lang='zh-CN'){return EXPLANATIONS[key]?.[lang==='en'?'en':'zh-CN']||'';}
  function record(view,id,type,instrumentIds,title,data,options={}){
    const at=asOf(view),out={schema:1,id,type,instrumentIds,source:'FactorLab authored teaching scenario',sourceUrl:SOURCE,observedAt:at,publishedAt:at,availableAt:at,periodStart:at,periodEnd:at,dataMode:'synthetic',derivation:'authored-scenario',units:{},day:view.day,title,data,...options};
    out.snapshotId=VERSION+':'+hash(out);return out;
  }
  function buildEvidence(view,options={}){
    asOf(view);const legacyFundamentals=options?.legacyFundamentals===true,rows=[],holdings=view.ledger?.holdings||[],history=(view.ledger?.history||[]).filter(x=>Number.isInteger(x.day)&&x.day<=view.day),at=asOf(view);
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
    const reportDay=Math.floor(view.day/30)*30-4,periodEnd=iso(reportDay-15),periodStart=iso(reportDay-105),publishedAt=iso(reportDay),firstAvailableAt=iso(Math.max(0,reportDay+4));
    const fundamentals=holdings.map((h,i)=>{
      const revenue=round(90+i*17+Math.floor(view.day/30)*5,2),profit=i===holdings.length-1?null:round(revenue*(.06+(i%4)*.025),2),equity=round(80+i*12,2),eps=profit===null?null:round(profit/10,4);
      if(legacyFundamentals)return {id:h.id+'-REPORT-'+reportDay,instrumentId:h.id,name:h.name,symbol:h.symbol,revenue,profit,netProfit:profit,equity,sharesMillions:10,eps,pe:priceEarnings(h.price,eps),roe:profit===null?null:round(profit/equity,4),periodStart,periodEnd,publishedAt,reportAvailableAt:publishedAt,priceObservedAt:at,availableAt:at,missing:profit===null?['netProfit','eps','pe','roe']:[],roeBasis:'period net income / period-end equity; teaching proxy, not annualized',peBasis:'current teaching price / period EPS; not TTM'};
      return {id:h.id+'-REPORT-'+reportDay,instrumentId:h.id,name:h.name,symbol:h.symbol,revenue,profit,netProfit:profit,equity,sharesMillions:10,eps,pe:priceEarnings(h.price,eps),roe:profit===null?null:round(profit/equity,4),periodStart,periodEnd,publishedAt,firstAvailableAt,reportAvailableAt:firstAvailableAt,priceObservedAt:at,availableAt:firstAvailableAt,missing:profit===null?['netProfit','eps','pe','roe']:[],roeBasis:'period net income / period-end equity; teaching proxy, not annualized',peBasis:'current teaching price / period EPS; not TTM'};
    });
    rows.push(record(view,'FUNDAMENTALS-D'+view.day,'fundamentals',holdings.map(h=>h.id),{'zh-CN':'公司财务与估值 · 虚构教学报告',en:'Company financials & valuation · fictional reports'},{rows:fundamentals},legacyFundamentals?{periodStart,periodEnd,publishedAt,availableAt:at,derivation:'authored-report-values-and-ratios-calculated-with-current-visible-quote',units:{revenue:'USD million/period',netProfit:'USD million/period',equity:'USD million',eps:'USD/share/period',pe:'x, period EPS basis',roe:'fraction/period'},interpretation:EXPLANATIONS.fundamentals}:{periodStart,periodEnd,publishedAt,firstAvailableAt,derivation:'authored-report-values-and-ratios-calculated-with-current-visible-quote',units:{revenue:'USD million/period',netProfit:'USD million/period',equity:'USD million',eps:'USD/share/period',pe:'x, period EPS basis',roe:'fraction/period'},interpretation:EXPLANATIONS.fundamentals}));
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
  function resolveReference(view,ref){
    const at=viewAt(view,ref.day);
    try{return resolve(buildEvidence(at),ref);}catch(error){if(String(ref?.id||'').startsWith('FUNDAMENTALS-'))return resolve(buildEvidence(at,{legacyFundamentals:true}),ref);throw error;}
  }
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
  return {VERSION,SOURCES,EXPLANATIONS,asOf,explain,buildEvidence,select,resolve,resolveReference,validateReference,viewAt,importRecords,priceEarnings};
});

;
(function(root) {
  const zh={
  "actualCost": "已扣交易费",
  "forecastHint": "按本轮行业基准判断：超过 +1% 为上行，低于 −1% 为下行，其余为横盘。",
  "inspect": "查看证据",
  "inspected": "已查看",
  "factorLabel": "因子",
  "exposure": "组合对该因子的敏感程度",
  "factorReturn": "最近一日因子收益",
  "exposureHint": "因子暴露 = 当前行业权重 × 模型行业暴露；现金暴露为 0。",
  "skip": "跳至研究桌面",
  "edition": "高端制造与尖端科技行业配置",
  "settings": "设置",
  "desk": "行业研究",
  "portfolio": "本轮配置",
  "risk": "风险与来源",
  "journal": "决策复盘",
  "chapter": "行业配置练习",
  "chapterLabel": "长期定位与短期调整",
  "subtitle": "订单在改善。价格，是否已经走在前面？",
  "syntheticShort": "合成教学数据",
  "synthetic": "合成教学数据 · 不代表真实市场表现",
  "phaseDecision": "等待配置",
  "phaseSimulating": "模拟进行中",
  "phaseEvent": "新信息 · 已暂停",
  "phaseReview": "本轮复盘",
  "phaseComplete": "练习完成",
  "day": "第 {{day}} 个交易日",
  "round": "第 {{round}} / {{total}} 轮",
  "roundShort": "第 {{round}} 轮",
  "roundStage0": "传闻与事实",
  "roundStage1": "订单能否变成收入",
  "roundStage2": "成本与延迟",
  "roundStage3": "行业差异",
  "roundStage4": "盈利与价格",
  "roundStage5": "复核整段判断",
  "rate": "政策利率",
  "inflation": "通胀",
  "growth": "经济增长",
  "liquidity": "市场流动性",
  "credit": "信用压力",
  "sentiment": "市场情绪",
  "macroHint": "当前合成状态",
  "marketTitle": "资产与比较",
  "nav": "当前资产（虚拟）",
  "benchmark": "行业基准",
  "anchor": "长期持有参照",
  "benchmarkHint": "五行业各 20%，每日调回等权；免交易费。",
  "anchorHint": "开局配置一直持有，不交易。",
  "yourPortfolio": "你的组合",
  "chartHint": "共同市场路径 · 初始净值 100,000",
  "chartLabel": "组合、行业基准和长期持有参照的资产变化",
  "chartEmpty": "确认本轮配置后，开始模拟。",
  "sectorHeatmap": "行业温度",
  "sinceStart": "自开局累计涨跌",
  "sector0": "半导体",
  "sector1": "机器人与工业自动化",
  "sector2": "先进材料",
  "sector3": "清洁能源装备",
  "sector4": "AI 与数字基础设施",
  "sector5": "现金（Cash）",
  "sectorShort0": "半导体",
  "sectorShort1": "机器人",
  "sectorShort2": "先进材料",
  "sectorShort3": "清洁能源",
  "sectorShort4": "AI 基础设施",
  "cycleExpansion": "扩张",
  "cycleOverheating": "过热",
  "cycleStagflation": "滞胀",
  "cycleRecession": "衰退",
  "cycleRecovery": "复苏",
  "eventTitle": "当前证据",
  "publicOnly": "截至当前交易日",
  "eventInitialTitle": "订单改善，盈利仍待确认",
  "eventInitialBody": "订单增加不等于利润增长。先区分已披露的事实和市场预期。",
  "eventInitialKind": "开局简报 · 合成情境",
  "eventPauseHint": "先看新证据，再继续本轮；本轮持仓暂不能调整。",
  "resume": "继续本轮",
  "eventDay": "第 {{day}} 日",
  "eventActive": "影响仍在传导",
  "eventResolved": "该事件影响已结束",
  "riskTitle": "风险与收益来源",
  "method": "模型口径",
  "volatility": "年化波动率",
  "sharpe": "Sharpe",
  "maxDrawdown": "最大回撤",
  "diversification": "分散度",
  "riskFrequency": "基于已实现日收益；252 日年化，Sharpe 使用同期模拟 Cash 日利率。少于 2 个观测时留空；超额收益零方差时 Sharpe 留空。回撤包含初始净值。",
  "attributionTitle": "第 {{round}} 轮收益来源 · 虚拟金额",
  "attributionMarket": "市场整体影响（Beta）",
  "attributionSector": "行业自身影响",
  "attributionEvent": "已发生事件影响",
  "attributionIdiosyncratic": "其他模拟冲击",
  "attributionCash": "现金利息",
  "attributionCost": "交易费用",
  "factor0": "动量",
  "factor1": "价值",
  "factor2": "质量",
  "factor3": "低波动",
  "portfolioTitle": "本轮配置",
  "cap": "合计 100%；每行业最多 40%；不能为负。",
  "balanced": "均衡",
  "defensive": "防御",
  "growthStyle": "成长",
  "total": "合计",
  "estimatedCost": "预计费用",
  "current": "当前持仓",
  "target": "本轮目标",
  "factorsTitle": "从因子生成配置",
  "factorsHint": "因子用于选行业。应用后会改写配置草稿，确认前可再调整。",
  "applyFactors": "按因子生成配置草稿",
  "forecastTitle": "本轮市场会怎样？",
  "forecastUp": "上行",
  "forecastFlat": "横盘",
  "forecastDown": "下行",
  "reasonTitle": "这次配置最主要的理由是什么？",
  "reasonChoose": "选择一个主要理由",
  "reasonEvidence": "需求与公开证据",
  "reasonRisk": "控制风险、保留现金",
  "reasonAnchor": "维持长期配置",
  "reasonValuation": "价格与盈利预期",
  "notePlaceholder": "选填：哪条证据会让你改变判断？",
  "confirm": "确认配置，开始本轮",
  "decisionHint": "确认后执行一次调仓并扣费，随后推进本轮；轮内不能调仓。",
  "pauseAnimation": "暂停播放",
  "playAnimation": "继续播放",
  "fastForward": "快进到下一事件或结算",
  "simulationProgress": "本轮进度 {{day}} / {{total}} 个交易日",
  "reviewLabel": "本轮结果",
  "reviewTitle": "本轮结果",
  "completeTitle": "六轮练习完成",
  "roundReturn": "本轮收益",
  "counterfactual": "本轮调仓相对不调仓（虚拟金额）",
  "anchorDifference": "自开局相对长期持有（虚拟金额）",
  "reward": "学习积分",
  "rewardHint": "积分记录纪律与风险观察，不计入金融净值。",
  "forecastResult": "判断与结果",
  "forecastActual": "你的预判：{{forecast}}；本轮基准实际：{{actual}}",
  "nextRound": "进入下一轮研究",
  "replay": "选择新情境",
  "journalTitle": "决策复盘",
  "journalEmpty": "尚无已结算记录。完成一轮后，可在这里对照理由和结果。",
  "exportSave": "导出进度文件",
  "reflectionPrompt": "下一轮，你要核对哪条新证据？",
  "reflectionPromptComplete": "下次，你要检验哪条新证据？",
  "reflectionPlaceholder": "例如：后续收入是否支持订单改善的判断？",
  "coachTitle": "研究助手",
  "coachIntro": "解释证据，核对风险。",
  "questionMacro": "利率怎样影响这些行业？",
  "questionRisk": "我的配置有哪些风险？",
  "questionReview": "我该如何解释这次结果？",
  "questionLabel": "向研究助手提问",
  "questionPlaceholder": "问一条证据，或一个风险问题…",
  "coachBoundary": "只看已确认持仓与已公开信息，不替你调仓。",
  "send": "发送",
  "coachRule": "规则提示 · 可离线",
  "coachLive": "在线 AI · 只读",
  "coachFallback": "AI 暂不可用 · 规则提示",
  "coachThinking": "正在整理当前证据…",
  "messageYou": "你",
  "messageCoach": "研究助手",
  "messageLanguage": "此条回复保留生成时的语言。",
  "references": "查看依据",
  "footer": "高端制造 × 尖端科技 · 合成教学模拟 · 非投资建议",
  "designExport": "Figma 导入版",
  "close": "关闭",
  "language": "语言 / Language",
  "languageHint": "切换语言不会改变进度或计算结果。",
  "speed": "播放速度",
  "speedNormal": "标准",
  "speedFast": "快速",
  "saveNow": "保存到此浏览器",
  "importSave": "从文件导入进度",
  "newGame": "开始新情境",
  "originalEntry": "打开保留的原版调查章节",
  "newGameHint": "新情境会替换当前工作进度。需要保留时，请先导出进度。",
  "seed": "随机种子",
  "scenario": "经济起点",
  "scenarioBaseline": "基准情境",
  "scenarioStress": "信用承压",
  "scenarioRecovery": "需求复苏",
  "cancel": "取消",
  "startNew": "确认开始",
  "saved": "已保存到此浏览器",
  "memoryOnly": "尚未保存，关闭页面会丢失本次更改",
  "saveBlocked": "浏览器保存不可用。可继续练习，请导出进度备份。",
  "corruptSave": "浏览器存档无法读取，已停止自动覆盖。请先导出原存档备份。",
  "invalidSave": "导入失败：文件格式或重放校验未通过。当前进度未改变。",
  "invalidWeights": "请把合计调为 100%；每行业最多 40%，权重不能为负。",
  "invalidFactors": "请将至少一个因子偏好设为大于 0。",
  "missingReason": "请选择本次配置的主要理由。",
  "actionError": "本次未执行。请核对当前阶段和配置。",
  "imported": "进度已恢复",
  "pendingCoach": "研究助手正在回复，请稍候。",
  "methodTitle": "模拟如何运行",
  "modelDescription": "共 6 轮，每轮 20 个交易日。数据由教学模型生成，未用真实市场校准，不能用于预测。",
  "transmission": "利率通过滞后的融资成本和需求影响增长与估值；通胀、流动性、信用压力与情绪共同影响风险。周期使用持续确认规则，减少频繁切换。",
  "feesDescription": "每次确认配置时调仓并扣费，不重复扣款；结算后持仓比例会随价格变化。",
  "factorDescription": "模型把收益分为市场、四因子、行业、事件和其他冲击；现金单独计息，各项金额与资产变动对账。因子偏好不重复投入本金。",
  "forecastDescription": "上行、横盘、下行是你的预判，结算后再与模拟基准比较。",
  "benchmarkDescription": "行业基准：五行业等权、每日再平衡、免交易费。长期持有参照：开局配置不交易。本轮不交易参照：沿同一市场路径持有本轮原仓位。",
  "sector.cash": "现金（Cash）",
  "evidence.E1.title": "订单改善，盈利待确认",
  "evidence.E1.body": "合成订单线索改善；收入和利润是否跟上，仍需后续披露。",
  "evidence.E2.title": "好消息可能已反映在价格中",
  "evidence.E2.body": "需求改善，也可能买贵。当前价格不保证未来收益。",
  "evidence.E3.title": "政策支持需要时间",
  "evidence.E3.body": "政策先影响融资与需求，盈利可能更晚变化。调整配置前，说明本轮理由。",
  "event.order.title": "出现补库存传闻",
  "event.order.body": "产业链传出补库存消息，但经营改善尚未证实。市场情绪已升温。",
  "event.disclosure.title": "收入披露更新",
  "event.disclosure.body": "合成披露显示订单转为收入存在时滞，行业内部盈利出现差异。",
  "event.disclosure.strong": "合成披露：较多订单已转为收入，但仍有交付时滞；价格可能已反映改善。",
  "event.disclosure.weak": "合成披露：订单转为收入偏弱，部分交付延后。此前传闻尚未充分兑现。",
  "event.supply.title": "交付承压，融资收紧",
  "event.supply.body": "运输与设备交付承压，融资条件收紧；成本影响会持续多个交易日。",
  "event.divergence.title": "行业现金流出现差异",
  "event.divergence.body": "自动化与材料行业的现金流出现差异。质量因子可供观察，但不会一直占优。",
  "event.profit.title": "盈利开始兑现",
  "event.profit.body": "订单开始转为盈利，但估值和融资成本仍会影响价格。",
  "event.resolution.title": "进入最终复盘",
  "event.resolution.body": "回看每轮当时可见的证据，区分判断依据、承担的风险和最终盈亏。",
  "roundQuestion0": "后续披露能否证实需求改善？",
  "roundQuestion1": "新数据支持还是削弱了你原先的理由？",
  "roundQuestion2": "影响先出现在成本、收入，还是利润？",
  "roundQuestion3": "哪些经营差异值得在下一轮核对？",
  "roundQuestion4": "盈利改善，是否就意味着本轮价格一定上涨？",
  "roundQuestion5": "下次你会用哪条新证据检验自己的方法？"
};
  const en={
  "actualCost": "Charged trading cost",
  "forecastHint": "Round benchmark return: above +1% is up; below −1% is down; otherwise sideways.",
  "inspect": "Inspect evidence",
  "inspected": "Inspected",
  "factorLabel": "Factor",
  "exposure": "Portfolio sensitivity to the factor",
  "factorReturn": "Latest daily factor return",
  "exposureHint": "Exposure = current sector weights × synthetic sector exposures; Cash has zero exposure.",
  "skip": "Skip to research desk",
  "edition": "Advanced manufacturing and frontier technology allocation",
  "settings": "Settings",
  "desk": "Sector research",
  "portfolio": "Round allocation",
  "risk": "Risk & sources",
  "journal": "Decision review",
  "chapter": "Sector allocation practice",
  "chapterLabel": "Long-term positioning and short-term changes",
  "subtitle": "Orders are improving. Has the price already moved ahead?",
  "syntheticShort": "Synthetic teaching data",
  "synthetic": "Synthetic teaching data · Not actual market performance",
  "phaseDecision": "Awaiting allocation",
  "phaseSimulating": "Simulation in progress",
  "phaseEvent": "New information · Paused",
  "phaseReview": "Round review",
  "phaseComplete": "Practice complete",
  "day": "Trading day {{day}}",
  "round": "Round {{round}} / {{total}}",
  "roundShort": "Round {{round}}",
  "roundStage0": "Rumors and facts",
  "roundStage1": "Orders into revenue",
  "roundStage2": "Costs and delays",
  "roundStage3": "Sector differences",
  "roundStage4": "Earnings and price",
  "roundStage5": "Review your reasoning",
  "rate": "Policy rate",
  "inflation": "Inflation",
  "growth": "Economic growth",
  "liquidity": "Liquidity",
  "credit": "Credit stress",
  "sentiment": "Sentiment",
  "macroHint": "Current synthetic state",
  "marketTitle": "Assets & comparisons",
  "nav": "Current assets (virtual)",
  "benchmark": "Sector benchmark",
  "anchor": "Long-term holding reference",
  "benchmarkHint": "Five sectors at 20%; rebalanced daily without fees.",
  "anchorHint": "Initial allocation held without trading.",
  "yourPortfolio": "Your portfolio",
  "chartHint": "Same market path · Initial NAV 100,000",
  "chartLabel": "NAV paths for portfolio, benchmark and long-term anchor",
  "chartEmpty": "Confirm your allocation to start the market.",
  "sectorHeatmap": "Sector temperature",
  "sinceStart": "Cumulative change since start",
  "sector0": "Semiconductors",
  "sector1": "Robotics & industrial automation",
  "sector2": "Advanced materials",
  "sector3": "Clean-energy equipment",
  "sector4": "AI & digital infrastructure",
  "sector5": "Cash",
  "sectorShort0": "Semiconductors",
  "sectorShort1": "Robotics",
  "sectorShort2": "Materials",
  "sectorShort3": "Clean energy",
  "sectorShort4": "AI infrastructure",
  "cycleExpansion": "Expansion",
  "cycleOverheating": "Overheating",
  "cycleStagflation": "Stagflation",
  "cycleRecession": "Recession",
  "cycleRecovery": "Recovery",
  "eventTitle": "Current evidence",
  "publicOnly": "Disclosed by the current day",
  "eventInitialTitle": "Orders improve; profits remain unconfirmed",
  "eventInitialBody": "More orders do not guarantee higher profit. Separate disclosed facts from market expectations.",
  "eventInitialKind": "Opening brief · Synthetic scenario",
  "eventPauseHint": "New information is public. Positions remain locked. Observe the impact before continuing.",
  "resume": "Continue this round",
  "eventDay": "Day {{day}}",
  "eventActive": "Impact still transmitting",
  "eventResolved": "Event impact ended",
  "riskTitle": "Risk & return sources",
  "method": "Model notes",
  "volatility": "Annualized volatility",
  "sharpe": "Sharpe ratio",
  "maxDrawdown": "Maximum drawdown",
  "diversification": "Diversification",
  "riskFrequency": "Realized daily returns; 252-day annualization. Sharpe uses contemporaneous simulated Cash daily rates. Fewer than 2 observations: —. Sharpe is blank for zero excess-return variance. Drawdown includes initial NAV.",
  "attributionTitle": "Settled round {{round}} attribution · Virtual currency",
  "attributionMarket": "Market beta",
  "attributionSector": "Sector component",
  "attributionEvent": "Event shocks",
  "attributionIdiosyncratic": "Idiosyncratic shocks",
  "attributionCash": "Cash interest",
  "attributionCost": "Trading costs",
  "factor0": "Momentum",
  "factor1": "Value",
  "factor2": "Quality",
  "factor3": "Low volatility",
  "portfolioTitle": "This round’s allocation",
  "cap": "Total 100%; each sector at most 40%; no negative weights.",
  "balanced": "Balanced",
  "defensive": "Defensive",
  "growthStyle": "Growth",
  "total": "Total",
  "estimatedCost": "Est. cost",
  "current": "Current holding",
  "target": "Round target",
  "factorsTitle": "Generate an allocation from factors",
  "factorsHint": "Factors rank sectors. Applying them replaces the allocation draft, which you can edit before confirmation.",
  "applyFactors": "Generate allocation draft",
  "forecastTitle": "What will the market do this round?",
  "forecastUp": "Up",
  "forecastFlat": "Sideways",
  "forecastDown": "Down",
  "reasonTitle": "What supports this decision?",
  "reasonChoose": "Choose a reason",
  "reasonEvidence": "Demand and public evidence",
  "reasonRisk": "Risk control and Cash buffer",
  "reasonAnchor": "Long-term positioning",
  "reasonValuation": "Valuation and expectations",
  "notePlaceholder": "What evidence would change your view? (optional)",
  "confirm": "Confirm allocation & start round",
  "decisionHint": "Confirmation trades once and deducts fees, then starts the round. Positions cannot be changed during the round.",
  "pauseAnimation": "Pause playback",
  "playAnimation": "Resume playback",
  "fastForward": "Advance to next event or settlement",
  "simulationProgress": "{{day}} / {{total}} days this round",
  "reviewLabel": "Round result",
  "reviewTitle": "Round settled",
  "completeTitle": "Six-round practice complete",
  "roundReturn": "Round return",
  "counterfactual": "Round trade vs. no trade (virtual amount)",
  "anchorDifference": "Since start vs. long-term holding (virtual amount)",
  "reward": "Learning points",
  "rewardHint": "Points reflect discipline and risk awareness. They never change financial NAV.",
  "forecastResult": "Outlook & outcome",
  "forecastActual": "Your forecast: {{forecast}}; actual round benchmark: {{actual}}",
  "nextRound": "Research the next round",
  "replay": "Try another scenario",
  "journalTitle": "Decision review",
  "journalEmpty": "No settled records yet. Finish one round to compare your reasons and results.",
  "exportSave": "Export progress file",
  "reflectionPrompt": "What new evidence will you check next round?",
  "reflectionPromptComplete": "What new evidence will you test next time?",
  "reflectionPlaceholder": "For example: do later revenues support the improving-order thesis?",
  "coachTitle": "Research assistant",
  "coachIntro": "Explain evidence and check risks.",
  "questionMacro": "How do rates affect these sectors?",
  "questionRisk": "What is the main risk in my portfolio?",
  "questionReview": "How should I explain this outcome?",
  "questionLabel": "Ask your research partner",
  "questionPlaceholder": "Ask about one piece of evidence or a risk…",
  "coachBoundary": "Confirmed holdings and disclosed information only; no trading on your behalf.",
  "send": "Send",
  "coachRule": "Rule-based feedback · Offline ready",
  "coachLive": "Live AI · Read only",
  "coachFallback": "Rule-based fallback · AI unavailable",
  "coachThinking": "Analyzing the current evidence…",
  "messageYou": "You",
  "messageCoach": "Research assistant",
  "messageLanguage": "This reply keeps its original language",
  "references": "See the reasoning",
  "footer": "Advanced manufacturing × frontier technology · Synthetic learning simulation · Not investment advice",
  "designExport": "Figma import edition",
  "close": "Close",
  "language": "Language / 语言",
  "languageHint": "Changing language preserves progress, positions, seed and calculated outcomes.",
  "speed": "Playback speed",
  "speedNormal": "Standard",
  "speedFast": "Fast",
  "saveNow": "Save to this browser",
  "importSave": "Import progress from file",
  "newGame": "Start a new scenario",
  "originalEntry": "Open the preserved original chapter",
  "newGameHint": "A new scenario replaces your working progress. Export progress first if you need to keep it.",
  "seed": "Random seed",
  "scenario": "Economic starting point",
  "scenarioBaseline": "Baseline",
  "scenarioStress": "Credit stress",
  "scenarioRecovery": "Demand recovery",
  "cancel": "Cancel",
  "startNew": "Start scenario",
  "saved": "Saved to this browser",
  "memoryOnly": "Unsaved changes will be lost when this page closes",
  "saveBlocked": "Browser storage is unavailable. You can keep playing; export your save to preserve progress.",
  "corruptSave": "The save could not be read. Its original contents are preserved and automatic overwrite is disabled. Export it before starting a new scenario in Settings.",
  "invalidSave": "Import failed: invalid format or replay validation. Your current progress is unchanged.",
  "invalidWeights": "Weights must total 100%, stay non-negative and respect the 40% sector cap.",
  "invalidFactors": "At least one factor preference must be greater than zero.",
  "missingReason": "Record a reason before confirming.",
  "actionError": "Action unavailable. Check the current phase and allocation.",
  "imported": "Save restored.",
  "pendingCoach": "Your research partner is responding. Please wait.",
  "methodTitle": "How the simulation works",
  "modelDescription": "An original, reproducible, simplified learning model: 20 trading days per round, 6 rounds. Slow variables update periodically; fast variables move daily. Not calibrated to real market data and not a forecasting model.",
  "transmission": "Rates affect financing, demand and valuations with a lag. Inflation, liquidity, credit stress and sentiment shape risk. Cycles use sustained confirmation to avoid rapid switching.",
  "feesDescription": "Configured simulated buy and sell costs are charged on confirmation. Holdings then drift with prices. The preview and executed trade use the same calculation, with no duplicate charge.",
  "factorDescription": "Sector returns separate market beta, four factors, sector components, events and idiosyncratic shocks. Cash accrues interest separately. Monetary attribution reconciles with NAV. Factor preferences select sectors without allocating capital twice.",
  "forecastDescription": "Up, sideways and down record the player’s view. They are compared with the realized synthetic market direction at settlement, not presented as AI predictions.",
  "benchmarkDescription": "The teaching benchmark holds five equal-weight sectors, rebalanced daily without costs. The long-term anchor holds the initial allocation without trading. The round’s no-trade counterfactual shares the same market path.",
  "evidence.E1.title": "Orders improve; profits need confirmation",
  "evidence.E1.body": "Synthetic order signals improve. Later disclosures must show whether revenue and profit follow.",
  "evidence.E2.title": "Good news may already be in the price",
  "evidence.E2.body": "Demand can improve while the price is too high. The current price does not guarantee future returns.",
  "evidence.E3.title": "Policy support takes time",
  "evidence.E3.body": "Policy reaches financing and demand before profits. Explain this round’s reason before changing the allocation.",
  "event.order.title": "Restocking rumors emerge",
  "event.order.body": "Restocking rumors are spreading, but operating improvements remain unconfirmed. Sentiment is already rising.",
  "event.disclosure.title": "Revenue disclosure update",
  "event.disclosure.body": "Synthetic disclosures show delays in converting orders into revenue and differences in sector profits.",
  "event.disclosure.strong": "Synthetic disclosure: more orders have converted into revenue, but delivery lags remain. Prices may already reflect the improvement.",
  "event.disclosure.weak": "Synthetic disclosure: order conversion is weak and some deliveries are delayed. Earlier rumors have not fully materialized.",
  "event.supply.title": "Delivery pressure and tighter financing",
  "event.supply.body": "Transport and equipment deliveries face pressure while financing tightens. Cost effects last several trading days.",
  "event.divergence.title": "Sector cash flows diverge",
  "event.divergence.body": "Automation and materials show different cash flows. Quality helps frame the comparison but will not always outperform.",
  "event.profit.title": "Profits begin to materialize",
  "event.profit.body": "Orders begin turning into profits, while valuations and financing costs still influence prices.",
  "event.resolution.title": "Begin the final review",
  "event.resolution.body": "Review the evidence available in each round. Separate your reasons, risks and eventual profit or loss.",
  "roundQuestion0": "Can later disclosures confirm the demand improvement?",
  "roundQuestion1": "Does the new evidence support or weaken your original reason?",
  "roundQuestion2": "Will the impact appear first in costs, revenue or profit?",
  "roundQuestion3": "Which operating differences should you check next round?",
  "roundQuestion4": "Do improving profits guarantee a price rise this round?",
  "roundQuestion5": "What new evidence will you use to test your method next time?"
};
  root.FactorLabStrings={ 'zh-CN':zh,en };
  if(typeof module!=='undefined')module.exports=root.FactorLabStrings;
})(typeof window==='undefined'?globalThis:window);

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.InvestigationResearch = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FACTORS = [
    { id: 'Momentum', name: '动量', description: '过去六个模拟月累计收益；趋势可能反转。' },
    { id: 'Value', name: '价值', description: '虚拟篮子 E/P；便宜可能伴随经营风险。' },
    { id: 'Quality', name: '质量', description: '虚拟篮子 ROE；单一指标不能覆盖完整盈利质量。' },
    { id: 'LowVol', name: '低波动', description: '过去六个月样本波动率的负值；低波动不等于无风险。' }
  ];
  const SECTORS = [
    { id: 'semiconductors', name: '半导体' }, { id: 'robotics', name: '机器人' },
    { id: 'materials', name: '先进材料' }, { id: 'cleanenergy', name: '清洁能源' },
    { id: 'AI', name: 'AI 基础设施' }
  ];
  const REAL_CASE = {
    title: '现实档案 · 2024 年半导体供给与存储周期',
    facts: [
      { date: '2024-02-19', category: '政策', source: '美国商务部 / NIST',
        text: '美国商务部与 GlobalFoundries 公布无约束力的初步条款，拟提供约 15 亿美元直接资助，支持美国成熟制程产能。当日属于拟议支持，不是已拨款。',
        url: 'https://www.nist.gov/news-events/news/2024/02/biden-harris-administration-announces-preliminary-terms-globalfoundries' },
      { date: '2024-03-20', category: '企业经营', source: 'Micron FY2024 Q2 财报',
        text: 'Micron 披露截至 2024-02-29 的季度收入为 58.2 亿美元，上季为 47.3 亿美元，上年同期为 36.9 亿美元。这是单家公司披露，不能代替全行业表现。',
        url: 'https://investors.micron.com/news/press-release/2024/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2024-03-20-2024/default.aspx' },
      { date: '2024-03-20', category: '产品价格', source: 'Micron FY2024 Q2 投资者简报，第 11、18 页',
        text: 'Micron 披露该季度 DRAM 平均售价环比增长百分之十几的高段（high teens），NAND 平均售价环比增长超过 30%。这是存储产品售价，不是股票涨幅。',
        url: 'https://micron.gcs-web.com/static-files/c531bd08-22cd-4d6b-9540-f8aa72459716' }
    ],
    note: '真实历史只用于比较政策、经营和产品价格证据；不是模拟情景输入，不提供证券价格回测，也不能证明模型收益或现实因子有效。'
  };
  const METHODS = [
    { name: 'Spearman Rank IC：Reference；未安装或复制 SciPy 代码', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html' },
    { name: '平均秩处理并列：Reference', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html' }
  ];
  const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  function stdev(values) {
    if (values.length < 2) return null;
    const m = mean(values);
    return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
  }
  function ranks(values) {
    const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
    const result = [];
    for (let i = 0; i < ordered.length;) {
      let end = i + 1;
      while (end < ordered.length && ordered[end].value === ordered[i].value) end++;
      for (let j = i; j < end; j++) result[ordered[j].index] = (i + 1 + end) / 2;
      i = end;
    }
    return result;
  }
  function rankIC(scores, returns) {
    if (!Array.isArray(scores) || !Array.isArray(returns) || scores.length !== returns.length) throw new Error('IC 配对长度不一致');
    const pairs = scores.map((s, i) => [s, returns[i]]).filter(p => p.every(Number.isFinite));
    if (pairs.length < 3) return null;
    const x = ranks(pairs.map(p => p[0]));
    const y = ranks(pairs.map(p => p[1]));
    const mx = mean(x), my = mean(y);
    let numerator = 0, dx = 0, dy = 0;
    x.forEach((v, i) => { numerator += (v - mx) * (y[i] - my); dx += (v - mx) ** 2; dy += (y[i] - my) ** 2; });
    return dx === 0 || dy === 0 ? null : numerator / Math.sqrt(dx * dy);
  }
  function performance(returns) {
    const nav = [1];
    let peak = 1, maxDrawdown = 0;
    returns.forEach(r => {
      if (!Number.isFinite(r) || r <= -1) throw new Error('收益必须有限且大于 -100%');
      const next = nav[nav.length - 1] * (1 + r);
      nav.push(next); peak = Math.max(peak, next); maxDrawdown = Math.max(maxDrawdown, 1 - next / peak);
    });
    return { totalReturn: returns.length ? nav[nav.length - 1] - 1 : null, maxDrawdown: returns.length ? maxDrawdown : null, nav };
  }
  function normalizePreferences(input) {
    const defaults = Object.fromEntries(FACTORS.map(f => [f.id, 0.25]));
    if (input === undefined) return defaults;
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !Object.hasOwn(defaults, k))) throw new Error('未知因子偏好');
    const values = FACTORS.map(f => Object.hasOwn(input, f.id) ? input[f.id] : 0);
    const total = values.reduce((a, b) => a + b, 0);
    if (values.some(v => !Number.isFinite(v) || v < 0) || !Number.isFinite(total) || total <= 0) throw new Error('因子偏好须非负，且至少一个大于零');
    return Object.fromEntries(FACTORS.map((f, i) => [f.id, values[i] / total]));
  }
  function createHistory() {
    return Array.from({ length: 42 }, (_, t) => {
      const returns = { Cash: 0.001 }, fundamentals = {};
      SECTORS.forEach((s, i) => {
        returns[s.id] = 0.006 + 0.035 * Math.sin(t * 0.67 + i * 1.3) + 0.025 * Math.cos(t * 1.17 - i * 0.9) + 0.009 * Math.sin(t * (i + 2));
        fundamentals[s.id] = { ep: 0.035 + i * 0.005 + 0.017 * Math.cos(t * 0.31 + i), roe: 0.11 + 0.018 * i + 0.055 * Math.sin(t * 0.23 + i * 1.5), observedAt: t + 1, availableAt: t + 1 };
      });
      return { month: t + 1, returns, fundamentals };
    });
  }
  function signals(history, monthIndex, input) {
    if (!Array.isArray(history) || !Number.isInteger(monthIndex) || monthIndex < 6 || monthIndex > history.length) throw new Error('需要六个月事前历史');
    const preferences = normalizePreferences(input);
    const rows = SECTORS.map(sector => {
      const prior = history.slice(monthIndex - 6, monthIndex).map(row => row.returns[sector.id]);
      if (prior.some(r => !Number.isFinite(r) || r <= -1)) throw new Error('事前收益不完整');
      let latest = null;
      for (let t = 0; t < monthIndex; t++) {
        const f = history[t].fundamentals[sector.id];
        if (f && Number.isFinite(f.observedAt) && Number.isFinite(f.availableAt) && f.observedAt <= f.availableAt && f.availableAt <= monthIndex && (!latest || f.observedAt > latest.observedAt)) latest = f;
      }
      return { id: sector.id, name: sector.name, availableAt: monthIndex, raw: {
        Momentum: prior.reduce((wealth, r) => wealth * (1 + r), 1) - 1,
        Value: latest && Number.isFinite(latest.ep) ? latest.ep : null,
        Quality: latest && Number.isFinite(latest.roe) ? latest.roe : null,
        LowVol: -stdev(prior)
      }, scores: {} };
    });
    FACTORS.forEach(f => {
      const valid = rows.filter(row => Number.isFinite(row.raw[f.id]));
      const ranked = ranks(valid.map(row => row.raw[f.id]));
      rows.forEach(row => { row.scores[f.id] = null; });
      valid.forEach((row, i) => { row.scores[f.id] = valid.length > 1 ? 100 * (ranked[i] - 1) / (valid.length - 1) : null; });
    });
    rows.forEach(row => { row.score = FACTORS.some(f => preferences[f.id] > 0 && row.scores[f.id] === null) ? null : FACTORS.reduce((sum, f) => sum + preferences[f.id] * (row.scores[f.id] || 0), 0); });
    return rows.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
  function analyze(input, history = createHistory()) {
    const preferences = normalizePreferences(input);
    if (!Array.isArray(history) || history.length !== 42) throw new Error('历史必须为六个月预热与三十六个月回测；不得追加游戏未来');
    history.forEach((row, i) => {
      if (!row || row.month !== i + 1 || !row.returns || !row.fundamentals || SECTORS.some(s => !row.fundamentals[s.id] || !Number.isFinite(row.returns[s.id]) || row.returns[s.id] <= -1)) throw new Error('历史时序或数据无效');
    });
    const months = [];
    for (let t = 6; t < 42; t++) {
      const rankings = signals(history, t, preferences);
      if (rankings.some(row => row.score === null)) throw new Error('综合信号缺失，不能生成完整回测');
      const top = rankings.slice(0, 2).map(row => row.id), bottom = rankings.slice(-2).map(row => row.id);
      const forward = history[t].returns;
      const strategyReturn = mean(top.map(id => forward[id]));
      const ic = Object.fromEntries(FACTORS.map(f => [f.id, rankIC(rankings.map(row => row.scores[f.id]), rankings.map(row => forward[row.id]))]));
      months.push({ month: t - 5, decisionTime: t, rankings, top, bottom, forward: Object.fromEntries(SECTORS.map(s => [s.id, forward[s.id]])), tied: rankings.some((row, i) => i > 0 && row.score === rankings[i - 1].score), strategyReturn, benchmarkReturn: mean(SECTORS.map(s => forward[s.id])), spread: strategyReturn - mean(bottom.map(id => forward[id])), ic });
    }
    const strategy = performance(months.map(m => m.strategyReturn));
    const benchmark = performance(months.map(m => m.benchmarkReturn));
    return {
      label: '36 个月合成历史 · 方法练习', dataVersion: 'investigation-synthetic-v1', sampleCount: months.length, lookback: 6,
      preferences, strategy, benchmark, excessReturn: strategy.totalReturn - benchmark.totalReturn, meanSpread: mean(months.map(m => m.spread)), months,
      factors: FACTORS.map(f => { const valid = months.map(m => m.ic[f.id]).filter(Number.isFinite); return { id: f.id, name: f.name, meanIC: mean(valid), validMonths: valid.length, missingMonths: months.length - valid.length }; }),
      note: '六个月预热后逐月以事前综合分数选前二，各持有 50%；后两名仅用于 Top–Bottom 比较。基准为五板块每月等权，Cash 不参与排序。并列以 sectorId 排序，IC 用平均秩；交易成本为零。全部历史由固定公式合成，样本内反复调参有选择偏差，不报告显著性，也不证明现实有效。',
      methods: METHODS
    };
  }
  return { FACTORS, SECTORS, REAL_CASE, METHODS, createHistory, signals, analyze, normalizePreferences, rankIC, performance };
});

;
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.FactorLabResearchTools=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const weightsSchema={type:'array',items:{type:'number'},minItems:6,maxItems:6,description:'Five sector weights then cash; fractions sum to 1; each sector <= 0.4.'};
  const definitions=[
    ['get_visible_evidence','Read only currently available versioned evidence.',{}],
    ['get_portfolio_snapshot','Read confirmed cash, securities, and revision.',{}],
    ['get_instrument_details','Read one teaching security and its related evidence.',{instrumentId:{type:'string'}}],
    ['run_backtest','Run the separate 36-month synthetic method exercise; does not change holdings.',{factorWeights:{type:'array',items:{type:'number'},minItems:4,maxItems:4}}],
    ['simulate_allocation','Calculate unconfirmed security amounts, quantities, cash and fees at the fixed current snapshot.',{weights:weightsSchema}],
    ['compare_scenarios','Compare two unconfirmed allocation plans at identical prices.',{weights:weightsSchema,alternative:weightsSchema}],
    ['propose_allocation_draft','Return an unconfirmed allocation draft for explicit learner application; never trades.',{weights:weightsSchema}]
  ].map(([name,description,properties])=>({type:'function',function:{name,description,parameters:{type:'object',properties,required:Object.keys(properties),additionalProperties:false}}}));
  for(const tool of definitions.filter(d=>['simulate_allocation','propose_allocation_draft'].includes(d.function.name))){tool.function.parameters.required=[];tool.function.parameters.properties.sectorId={type:'string',enum:['semiconductor','robotics','materials','energy','digital']};tool.function.parameters.properties.targetWeight={type:'number',minimum:0,maximum:.4};tool.function.parameters.properties.preset={type:'string',enum:['equal-sectors']};tool.function.parameters.properties.cashWeight={type:'number',minimum:0,maximum:1};tool.function.description+=' With no arguments use the learner current editing allocation. Prefer sectorId and targetWeight (fraction, e.g. 0.2) for one-sector changes, moving the difference to/from cash while preserving other edited sector weights. For an explicitly requested equal-sector example use preset equal-sectors and cashWeight. Alternatively supply six weights in order semiconductor, robotics, materials, energy, digital, cash.';}
  const comparisonDefinition=definitions.find(d=>d.function.name==='compare_scenarios').function;
  comparisonDefinition.parameters.required=[];comparisonDefinition.description+=' With no arguments compare actual confirmed holdings (no trade, zero fee) with the learner current editing allocation. Use explicit weights and alternative only when comparing two different proposed plans.';
  function validWeights(weights){return Array.isArray(weights)&&weights.length===6&&weights.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&weights.slice(0,5).every(v=>v<=.4+1e-10)&&Math.abs(weights.reduce((s,v)=>s+v,0)-1)<1e-7;}
  function material(record){
    if(!record.data?.points)return clone(record);
    const points=record.data.points,values=points.map(p=>p.value);
    return {...clone(record),data:{...record.data,points:points.length?[points[0],points.at(-1)]:[],rangeSummary:{samples:points.length,min:Math.min(...values),max:Math.max(...values),first:values[0],last:values.at(-1)},representation:'range endpoints and exact range summary; open the reference for every observation'}};
  }
  function card(result){
    if(result.error)return {error:result.error};
    if(result.instrument&&result.evidence)return {snapshotId:result.snapshotId,instrument:clone(result.instrument),references:result.evidence.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.preview)return {...result,preview:card(result.preview)};
    if(result.first)return {...clone(result),first:card(result.first),alternative:card(result.alternative)};
    if(result.records)return {snapshotId:result.snapshotId,asOf:result.asOf,evidenceCount:result.records.length,references:result.records.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.holdings)return {snapshotId:result.snapshotId,revision:result.revision,nav:result.nav,cash:result.cash,invested:result.invested,totalFees:result.totalFees,currency:result.currency,securityCount:result.holdings.length,sectorOrder:result.sectorOrder,sectorWeights:result.sectorWeights};
    if(result.rows)return Object.fromEntries(['ok','snapshotId','revision','weights','cash','fee','buys','sells','after','concentration','sectorChanges','assumptions'].filter(k=>k in result).map(k=>[k,clone(result[k])]));
    if(result.months)return {dataMode:result.dataMode,label:result.label,sampleCount:result.sampleCount,preferences:result.preferences,strategy:result.strategy,benchmark:result.benchmark,factors:result.factors,executionDifferences:result.executionDifferences};
    return clone(result);
  }
  function compactResult(answer){
    return {...clone(answer),...(answer.tools?{tools:answer.tools.map(t=>({...t,result:card(t.result||{})}))}:{}),...(answer.allocationDraft?{allocationDraft:card(answer.allocationDraft)}:{})};
  }
  function create({engine,evidence,research},body){
    const state=engine.restore(body.save),view=engine.publicView(state),records=evidence.buildEvidence(view);
    const attachments=(body.attachments||[]);
    if(!Array.isArray(attachments)||attachments.length>8)throw Error('attachments');
    const selected=attachments.map(ref=>{const canonical=evidence.resolveReference(view,ref);let hash=2166136261;for(const char of canonical.id+'|'+canonical.snapshotId+'|'+JSON.stringify(canonical.selection))hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return {...canonical,token:'REF'+hash.toString(16).padStart(8,'0')};});
    const snapshotId=view.ledger?.snapshotId||'legacy-D'+view.day,revision=view.ledger?.revision??view.day;
    const editingWeights=body.decisionDraft?.weights===undefined?[...view.weights]:clone(body.decisionDraft.weights);
    const sectorIds=['semiconductor','robotics','materials','energy','digital'];
    function preview(weights){
      if(!validWeights(weights))throw Error('invalid_weights');
      if(view.phase!=='decision')throw Error('allocation_locked');
      const result=engine.preview(state,weights);
      if(result.ok===false)throw Error(result.error||'invalid_allocation');
      const sectorChanges=weights.slice(0,5).map((targetWeight,i)=>{
        const amount=result.rows?result.rows.filter(r=>r.sectorIndex===i).reduce((total,r)=>total+r.delta,0):targetWeight*result.after-view.units[i]*view.prices[i];
        return {sectorId:sectorIds[i],confirmedWeight:view.weights[i],targetWeight,weightChange:Math.round((targetWeight-view.weights[i])*1e6)/1e6,netTradeAmount:Math.round(amount*1e6)/1e6};
      });
      return {...clone(result),snapshotId,revision,weights:[...weights],concentration:Math.max(...weights.slice(0,5)),sectorChanges,assumptions:{dataMode:'synthetic',currency:view.ledger?.currency||'USD',prices:'fixed current teaching snapshot',tradeBaseline:'confirmed holdings, not the previous editing draft',futureReturns:'not estimated',status:'draft'}};
    }
    function requestedWeights(args){
      if(args.weights!==undefined){if(['sectorId','targetWeight','preset','cashWeight'].some(k=>args[k]!==undefined))throw Error('ambiguous_weights');return args.weights;}
      if(args.preset!==undefined){
        if(args.sectorId!==undefined||args.targetWeight!==undefined)throw Error('ambiguous_weights');
        if(args.preset!=='equal-sectors'||!Number.isFinite(args.cashWeight)||args.cashWeight<0||args.cashWeight>1)throw Error('invalid_preset');
        return [...Array(5).fill((1-args.cashWeight)/5),args.cashWeight];
      }
      if(args.cashWeight!==undefined)throw Error('invalid_preset');
      if(!validWeights(editingWeights))throw Error('invalid_weights');
      if(args.sectorId===undefined&&args.targetWeight===undefined)return [...editingWeights];
      const index=sectorIds.indexOf(args.sectorId);
      if(index<0||!Number.isFinite(args.targetWeight))throw Error('Provide sectorId and targetWeight as a fraction, or six fractional weights summing to 1');
      const weights=[...editingWeights];weights[5]+=weights[index]-args.targetWeight;weights[index]=args.targetWeight;return weights;
    }
    function execute(name,args={}){
      const definition=definitions.find(d=>d.function.name===name);
      if(!definition)throw Error('tool_not_allowed');
      if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!Object.hasOwn(definition.function.parameters.properties,k)))throw Error('invalid_arguments');
      if(definition.function.parameters.required.some(k=>!Object.hasOwn(args,k)))throw Error('invalid_arguments');
      if(name==='get_visible_evidence')return {snapshotId,asOf:view.asOf||view.ledger?.asOf,records:records.map(material),selected:selected.map(material)};
      if(name==='get_portfolio_snapshot')return clone(view.ledger?{...view.ledger,history:view.ledger.history.slice(-6),sectorOrder:[...sectorIds,'cash'],sectorWeights:view.weights,sectorAmounts:view.weights.map(w=>w*view.nav)}:{status:'legacy_read_only',nav:view.nav,cash:view.cash,weights:view.weights,sectorOrder:[...sectorIds,'cash']});
      if(name==='get_instrument_details'){
        if(typeof args.instrumentId!=='string'||args.instrumentId.length>80)throw Error('invalid_instrument');
        const row=view.ledger?.holdings?.find(r=>[r.instrumentId,r.id,r.symbol].includes(args.instrumentId));
        if(!row)throw Error('invalid_instrument');
        return clone({snapshotId,instrument:row,evidence:records.filter(r=>r.instrumentIds.includes(args.instrumentId))});
      }
      if(name==='run_backtest'){
        const f=args.factorWeights;
        if(!Array.isArray(f)||f.length!==4||f.some(v=>!Number.isFinite(v)||v<0||v>100)||!f.some(v=>v>0))throw Error('invalid_factors');
        const result=research.analyze(Object.fromEntries(['Momentum','Value','Quality','LowVol'].map((id,i)=>[id,f[i]])));
        return {dataMode:'synthetic',separateHistoricalExercise:true,executionDifferences:{sectorCap:.5,tradingFee:0},...result};
      }
      if(name==='simulate_allocation')return preview(requestedWeights(args));
      if(name==='compare_scenarios'){
        const first=args.weights===undefined?{ok:true,status:'confirmed',snapshotId,revision,weights:[...view.weights],cash:view.cash,fee:0,buys:0,sells:0,after:view.nav,concentration:Math.max(...view.weights.slice(0,5))}:preview(args.weights);
        const alternative=preview(args.alternative??requestedWeights({})),rounded=n=>Math.round(n*1e6)/1e6;
        return {snapshotId,first,alternative,changes:alternative.weights.map((w,i)=>rounded(w-first.weights[i])),cashChange:rounded(alternative.cash-first.cash),feeChange:rounded(alternative.fee-first.fee)};
      }
      if(!view.ledger)throw Error('legacy_read_only');
      const weights=requestedWeights(args);return {schema:1,status:'draft',snapshotId,revision,weights:[...weights],preview:preview(weights)};
    }
    return {view,records,selected,snapshotId,revision,editingWeights,transactions:state.transactions,execute};
  }
  const evidenceRef=r=>({schema:1,id:r.id,...(r.token?{token:r.token}:{}),snapshotId:r.snapshotId,day:r.day,selection:r.selection});
  function demo(body,deps){
    deps=deps||{engine:root.FactorLabLedger.createEngine(root.FactorLabSimulation),evidence:root.FactorLabEvidence,research:root.InvestigationResearch};
    const runner=create(deps,body),en=body.lang==='en',tools=[];
    const invoke=(name,args={})=>{const result=runner.execute(name,args);tools.push({id:'demo-'+tools.length,name,status:'complete',result:card(result)});return result;};
    const question=body.question||'',sectorPatterns=[/半导体|semicon/i,/机器人|robot/i,/材料|material/i,/能源|energy/i,/\bAI\b|人工智能|算力/i];
    const sector=sectorPatterns.findIndex(p=>p.test(question)),percent=question.match(/(\d+(?:\.\d+)?)\s*[%％]/);
    const sectorNames=en?['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure','Cash']:['半导体','机器人','先进材料','清洁能源','AI 算力','现金'];
    const money=v=>Number.isFinite(v)?v.toFixed(2):'—',pct=v=>(v*100).toFixed(1).replace(/\.0$/,'')+'%';
    const cashTarget=question.match(/(\d+(?:\.\d+)?)\s*[%％]\s*(?:的)?\s*(?:现金|cash)/i)||question.match(/(?:现金|cash)\s*(?:为|at|of|:)?\s*(\d+(?:\.\d+)?)\s*[%％]/i);
    let allocationDraft,summary='',detail='',allocationQuestion=false;
    const editable=!!runner.view.ledger&&runner.view.phase==='decision';
    if(editable&&/等额|等权|equal.sector/i.test(question)&&cashTarget){
      const cashWeight=Number(cashTarget[1])/100;
      allocationDraft=invoke('propose_allocation_draft',{preset:'equal-sectors',cashWeight});allocationQuestion=true;
      const p=allocationDraft.preview;
      summary=en?`An equal-sector example: each sector ${pct(allocationDraft.weights[0])}, cash ${pct(cashWeight)}. Estimated fees USD ${money(p.fee)}; cash after fees USD ${money(p.cash)}.`:`等额示例：五个行业各 ${pct(allocationDraft.weights[0])}，现金 ${pct(cashWeight)}。预计费用 $${money(p.fee)}，扣费后现金 $${money(p.cash)}。`;
      detail=en?'This is a starting example, not a forecast or a personalized recommendation. Apply it to the editor, adjust the percentages, and confirm separately when ready.':'这是供你调整的入门示例。可以先应用，再修改比例，最后由你确认成交。';
    }else if(editable&&sector>=0&&percent){
      const args={sectorId:['semiconductor','robotics','materials','energy','digital'][sector],targetWeight:Number(percent[1])/100};
      const p=invoke('simulate_allocation',args);allocationDraft=invoke('propose_allocation_draft',args);allocationQuestion=true;
      summary=en?`${sectorNames[sector]} becomes ${pct(args.targetWeight)}. Estimated fees USD ${money(p.fee)}; remaining cash USD ${money(p.cash)}.`:`${sectorNames[sector]}调整为 ${pct(args.targetWeight)}。预计费用 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'The other edited sectors stay unchanged; the difference goes to or comes from cash. These are current-price calculations, not future returns.':'其他正在编辑的行业比例保持不变，差额由现金补足或收回。金额按当前价格计算，不预测未来收益。';
    }else if(editable&&/比较|对比|compare/i.test(question)&&/配置|持仓|调整|allocation|portfolio|holding/i.test(question)){
      const comparison=invoke('compare_scenarios');allocationQuestion=true;
      const changes=comparison.changes.map((delta,i)=>Math.abs(delta)<1e-6?'':`${sectorNames[i]} ${delta>0?'+':''}${pct(delta)}`).filter(Boolean).join(en?', ':'、');
      summary=en?`${changes||'Your draft matches the confirmed allocation'}. Estimated fees USD ${money(comparison.alternative.fee)}; cash changes by USD ${money(comparison.cashChange)} to USD ${money(comparison.alternative.cash)}.`:`${changes||'当前草稿与已确认配置相同'}。预计费用 $${money(comparison.alternative.fee)}，现金变化 $${money(comparison.cashChange)}，调整后为 $${money(comparison.alternative.cash)}。`;
      detail=en?'Weight changes are percentage points. This compares keeping the confirmed holdings with executing your draft at the same current prices. No trade has been placed.':'比例变化按百分点计算。比较的是保持现有持仓与按当前价格执行草稿的差别，尚未成交。';
    }else if(editable&&/配置|持仓|费用|allocation|portfolio|holding|fees/i.test(question)){
      const p=invoke('simulate_allocation');allocationQuestion=true;
      const largest=p.weights.slice(0,5).reduce((best,w,i)=>w>p.weights[best]?i:best,0);
      summary=en?`Your largest sector is ${sectorNames[largest]} at ${pct(p.weights[largest])}; target cash is ${pct(p.weights[5])}. Estimated fees USD ${money(p.fee)} leave USD ${money(p.cash)} in cash.`:`当前草稿中${sectorNames[largest]}占比最高，为 ${pct(p.weights[largest])}；目标现金占 ${pct(p.weights[5])}。确认后的预计费用为 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'A sector combines several teaching companies. Cash is the uninvested part of your virtual budget. Changing the percentages changes where the budget goes; it does not predict returns.':'行业比例决定分给这一类公司的资金，现金是暂时没有买入证券的部分。你可以直接调整比例，下方金额会随之变化。';
    }
    if(!tools.length){
      const result=invoke(runner.selected.length?'get_visible_evidence':'get_portfolio_snapshot');
      summary=en?(runner.selected.length?'This material is attached. Ask about its price, option activity or assumptions.':`Your confirmed assets are USD ${money(result.nav)}, including USD ${money(result.cash)} cash.`):(runner.selected.length?'材料已带入对话，可以继续问其中的价格、期权数据或假设。':`已确认资产为 $${money(result.nav)}，其中现金 $${money(result.cash)}。`);
      detail=en?'Offline mode can calculate allocation changes. Try “semiconductors to 15%” or use the allocation shortcuts.':'离线助手可以计算配置变化。试试“半导体调到15%”，或使用配置页的快捷问题。';
    }
    const referenceRecords=allocationQuestion?[]:runner.selected.length?runner.selected:runner.records.slice(0,1);
    return {summary,detail,references:referenceRecords.map(r=>r.token||r.id),referenceSelections:referenceRecords.map(r=>evidenceRef(r)),mode:'example',tools,...(allocationDraft?{allocationDraft:card(allocationDraft)}:{})};
  }

  return {create,demo,definitions,validWeights,card,material,compactResult};
});

;
(function(root){
  'use strict';
  async function consume(response,onEvent=()=>{},signal){
    if(!response.ok){
      let value;
      try{value=await response.json();}catch{}
      const retryAfter=Number(response.headers.get('retry-after'));
      throw Object.assign(Error(value?.error||'connection_failed'),{
        code:value?.error,status:response.status,
        retryAfter:response.status===429&&Number.isInteger(retryAfter)&&retryAfter>=1&&retryAfter<=86400?retryAfter:undefined
      });
    }
    if(!(response.headers.get('content-type')||'').includes('text/event-stream')){const result=await response.json();onEvent('result',result);return result;}
    const limit=500000;
    let buffer='',result,finished=false,size=0;
    function checkAbort(){
      if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
    }
    function readFrames(text){
      buffer=(buffer+text).replace(/\r\n/g,'\n');
      let boundary;
      while(!finished&&(boundary=buffer.indexOf('\n\n'))>=0){
        const frame=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
        const event=frame.match(/^event:\s*(.+)$/m)?.[1]||'message',data=frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
        if(!data)continue;
        checkAbort();
        const payload=JSON.parse(data);
        if(event==='error')throw Object.assign(Error(payload.error),{code:payload.error,traceId:payload.traceId});
        if(event==='result')result=payload;
        if(event==='done')finished=true;
        onEvent(event,payload);
      }
    }
    checkAbort();
    if(typeof TextDecoder!=='function'||typeof response.body?.getReader!=='function'){
      const text=await response.text();
      if(text.length>limit)throw Error('stream_size');
      readFrames(text);
    }else{
      const reader=response.body.getReader(),decoder=new TextDecoder();
      try{
        while(!finished){
          checkAbort();
          const {done,value}=await reader.read();
          if(done)break;
          size+=value.byteLength;if(size>limit)throw Error('stream_size');
          readFrames(decoder.decode(value,{stream:true}));
        }
      }finally{void reader.cancel().catch(()=>{});reader.releaseLock();}
    }
    if(!result||!finished)throw Error('stream_interrupted');
    return result;
  }
  const api={consume};if(typeof module==='object'&&module.exports)module.exports=api;else root.FactorLabCoachStream=api;
})(typeof globalThis!=='undefined'?globalThis:this);

;
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactorMascot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const actions = Object.freeze({ idle: 1, welcome: 2, thinking: 3, success: 4, growth: 4, milestone: 5, caution: 6 });
  const validId = id => (typeof id === 'string' && id.length > 0 && id.length <= 160) || (typeof id === 'number' && Number.isSafeInteger(id));

  function createController(options = {}) {
    const now = options.now || Date.now, later = options.setTimeout || setTimeout, cancel = options.clearTimeout || clearTimeout;
    const random = options.random || Math.random, onChange = options.onChange || (() => {});
    const context = options.context || 'login', seen = new Map(), requests = new Map();
    let active = null, token = 0, timer = null, latestRequest = null, busy = false, welcomeAt = -Infinity;
    let visible = options.visible !== false, enabled = options.enabled !== false, reduced = !!options.reducedMotion;
    let editing = false, failed = false, destroyed = false;
    const blocked = () => destroyed || !visible || !enabled || reduced || editing || failed;
    const snapshot = () => Object.freeze({ state: active?.state || 'static', token, video: active && active.state !== 'caution' ? active.state + '.mp4' : null, busyRequestId: busy ? latestRequest : null, blocked: blocked(), editing, visible, enabled, reducedMotion: reduced, failed, destroyed });
    function publish() { try { onChange(snapshot()); } catch {} }
    function clearTimer() { if (timer !== null) cancel(timer); timer = null; }
    function remember(map, key, value) {
      map.set(key, value);
      if (map.size > 256) map.delete(map.keys().next().value);
    }
    function schedule(delay, fn) { clearTimer(); timer = later(() => { timer = null; if (!destroyed) fn(); }, delay); }
    function rest() {
      clearTimer();
      if (active) { active = null; token++; }
      publish();
      if (blocked()) return;
      if (busy) schedule(700, () => { if (!blocked() && busy) start('thinking', latestRequest); });
      else if (context === 'login') schedule(12000 + Math.round(Math.max(0, Math.min(1, random())) * 8000), () => { if (!blocked() && !busy) start('idle'); });
    }
    function start(state, requestId) {
      clearTimer(); active = { state, requestId }; token++;
      const current = token;
      publish();
      if (active && token === current && !blocked()) schedule(state === 'caution' ? 1200 : 5000, () => state === 'caution' ? finish(current) : fail(current));
    }
    function finish(current) {
      if (destroyed || !active || current !== token) return false;
      rest(); return true;
    }
    function fail(current) {
      if (destroyed || !active || current !== token) return false;
      failed = true; rest(); return true;
    }
    function emit(state, event = {}) {
      if (destroyed || !Object.hasOwn(actions, state) || state === 'thinking') return false;
      if (event.requestId !== undefined && event.requestId !== latestRequest) return false;
      if (event.id !== undefined) {
        if (!validId(event.id) || (seen.get(event.id) || 0) >= actions[state]) return false;
        remember(seen, event.id, actions[state]);
      }
      if (blocked() || (active && actions[active.state] >= actions[state] && event.replace !== true)) return false;
      if (state === 'welcome' && now() - welcomeAt < 5000) return false;
      if (state === 'welcome') welcomeAt = now();
      start(state, event.requestId); return true;
    }
    function setBusy(id, value) {
      if (destroyed || !validId(id)) return false;
      if (value) {
        if (requests.has(id)) return false;
        remember(requests, id, true); latestRequest = id; busy = true;
        if (active?.state === 'thinking' || (active?.requestId !== undefined && active.requestId !== id)) { clearTimer(); active = null; token++; }
        if (!blocked() && (!active || actions[active.state] < actions.thinking)) start('thinking', id);
        else publish();
      } else {
        if (!busy || id !== latestRequest) return false;
        busy = false;
        if (!active || active.state === 'thinking') rest(); else publish();
      }
      return true;
    }
    function setRestriction(key, value) {
      if (destroyed) return;
      const current = key === 'editing' ? editing : key === 'visible' ? visible : key === 'enabled' ? enabled : reduced;
      value = !!value; if (current === value) return;
      if (key === 'editing') editing = value;
      else if (key === 'visible') visible = value;
      else if (key === 'enabled') enabled = value;
      else reduced = value;
      rest();
    }
    const api = {
      emit, setBusy, finish, fail, getState: snapshot,
      setEditing: value => setRestriction('editing', value),
      setVisible: value => setRestriction('visible', value),
      setEnabled: value => setRestriction('enabled', value),
      setReducedMotion: value => setRestriction('reduced', value),
      destroy() { if (!destroyed) { destroyed = true; busy = false; rest(); seen.clear(); requests.clear(); } }
    };
    rest();
    return api;
  }

  const words = {
    'zh-CN': { greet: '向研究伙伴打招呼', static: '研究助手', idle: '慢慢来，先看证据', welcome: '欢迎回来', thinking: '正在核对信息', success: '操作已完成', growth: '本轮资产增长', milestone: '研究里程碑已完成', caution: '请核对风险与证据', failed: '研究伙伴 · 静态显示' },
    en: { greet: 'Greet your research companion', static: 'Research companion', idle: 'Take your time. Check the evidence.', welcome: 'Welcome back', thinking: 'Checking information', success: 'Action completed', growth: 'Portfolio grew this round', milestone: 'Research milestone completed', caution: 'Review the risks and evidence', failed: 'Research companion · Still image' }
  };
  const mounted = new WeakMap(), instances = new Set();
  let motionEnabled = true;

  function petPicture(doc) {
    const picture = doc.createElement('picture');
    const source = doc.createElement('source'), image = doc.createElement('img');
    const base = new URL('releases/19bf715ecd35fdbc/assets/pets/', doc.baseURI);
    picture.className = 'pet-picture';
    source.type = 'image/webp'; source.srcset = new URL('companions.webp', base).href;
    image.alt = ''; image.decoding = 'async'; image.draggable = false;
    image.src = new URL('companions.png', base).href;
    picture.append(source, image);
    const ready = () => {
      const reveal = () => {picture.dataset.ready='true';};
      if (image.decode) image.decode().then(reveal).catch(()=>{});
      else reveal();
    };
    image.addEventListener('load',ready,{once:true});
    if (image.complete && image.naturalWidth) ready();
    return picture;
  }

  function mount(host, options = {}) {
    if (!host?.ownerDocument) throw TypeError('A mascot host element is required');
    const existing = mounted.get(host);
    if (existing) { if (options.language) existing.setLanguage(options.language); return existing; }
    const doc = host.ownerDocument, view = doc.defaultView;
    const scope = options.focusRoot || host.closest('dialog') || host.parentElement;
    const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
    const removers = [];
    let language = options.language === 'en' ? 'en' : 'zh-CN', controller, latest, renderedToken = -1;
    let visible = options.visible !== false, pageVisible = true, manuallyEditing = false, composing = false, destroyed = false;
    let stopMedia = () => {}, cautionAnimation = null;
    const base = new URL(options.assetBase || 'releases/19bf715ecd35fdbc/assets/mascot/', doc.baseURI).href.replace(/\/?$/, '/');
    const launcher = !!options.launcher, pet = options.pet ? petPicture(doc) : null;
    const button = launcher ? host : doc.createElement('button'), stage = doc.createElement('span');
    const poster = doc.createElement('img'), video = doc.createElement('video'), marker = doc.createElement('span'), caption = doc.createElement('p');
    host.classList.add('factor-mascot'); host.dataset.context = options.context || 'login';
    if (!launcher) button.className = 'mascot-greet';
    button.type = 'button'; stage.className = 'mascot-stage';
    poster.className = 'mascot-poster'; poster.alt = ''; poster.decoding = 'async';
    if (!pet) poster.src = base + 'poster.png';
    video.className = 'mascot-video'; video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.loop = false; video.preload = 'none'; video.hidden = true;
    if (!pet) video.poster = poster.src;
    video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1'); video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    marker.className = 'mascot-caution'; marker.textContent = '!'; marker.hidden = true; marker.setAttribute('aria-hidden', 'true');
    caption.className = 'mascot-caption'; caption.setAttribute('aria-live', 'off');
    if (pet) stage.append(pet);
    else stage.append(poster, video, marker);
    if (launcher) host.replaceChildren(stage);
    else { button.append(stage); host.replaceChildren(button, caption); }
    function listen(target, name, listener) {
      if (!target?.addEventListener) return;
      target.addEventListener(name, listener); removers.push(() => target.removeEventListener(name, listener));
    }
    function label() {
      const text = words[language];
      if (!launcher) button.setAttribute('aria-label', text.greet);
      caption.textContent = text[latest?.failed ? 'failed' : latest?.state === 'static' && latest.busyRequestId !== null ? 'thinking' : latest?.state || 'static'];
      host.lang = language;
    }
    function stop() {
      stopMedia(); stopMedia = () => {};
      if (pet) { delete pet.dataset.pose; return; }
      cautionAnimation?.cancel(); cautionAnimation = null;
      for (const animation of host.getAnimations?.({ subtree: true }) || []) animation.cancel();
      video.pause(); video.hidden = true; poster.hidden = false; marker.hidden = true;
      if (video.getAttribute('src') || video.src) { video.removeAttribute('src'); try { video.load(); } catch {} }
    }
    function render(state) {
      latest = state; host.dataset.state = state.state; host.dataset.blocked = String(state.blocked);
      host.dataset.editing = String(state.editing); label();
      if (state.token === renderedToken) { if (state.blocked) stop(); return; }
      renderedToken = state.token; stop();
      if (state.destroyed || state.blocked || state.state === 'static') return;
      const current = state.token;
      const active = () => !destroyed && controller?.getState().token === current;
      if (pet) {
        const pose = state.state;
        pet.dataset.pose = pose;
        const nextPose = pose === 'welcome' ? 'welcome-b' : pose === 'caution' ? 'failure' : '';
        const frame = nextPose ? view.setTimeout(() => {
          if (active()) pet.dataset.pose = nextPose;
        }, 280) : null;
        const end = pose === 'caution' ? null : view.setTimeout(() => {
          if (active()) controller.finish(current);
        }, pose === 'thinking' ? 1800 : 1100);
        stopMedia = () => { view.clearTimeout(frame); view.clearTimeout(end); };
        return;
      }
      if (state.state === 'caution') {
        marker.hidden = false;
          cautionAnimation = marker.animate?.([{opacity:.4,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}], {duration:160,iterations:1});
        return;
      }
      const playing = () => { if (active()) { video.hidden = false; poster.hidden = true; } };
      const ended = () => { if (active()) controller.finish(current); };
      const error = () => { if (active()) controller.fail(current); };
      video.addEventListener('playing', playing); video.addEventListener('ended', ended); video.addEventListener('error', error);
      stopMedia = () => { video.removeEventListener('playing', playing); video.removeEventListener('ended', ended); video.removeEventListener('error', error); };
      video.src = base + state.video;
      try { Promise.resolve(video.play()).catch(error); } catch { error(); }
    }
    controller = createController({
      context: options.context, visible: visible && !doc.hidden, enabled: motionEnabled && options.enabled !== false,
      reducedMotion: !!media?.matches, now: () => view.performance?.now() ?? Date.now(),
      setTimeout: view.setTimeout.bind(view), clearTimeout: view.clearTimeout.bind(view), onChange: render
    });
    const editable = node => !!node?.matches?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]');
    function updateEditing() {
      if (destroyed) return;
      controller.setEditing(manuallyEditing || composing || (editable(doc.activeElement) && !!scope?.contains(doc.activeElement)));
    }
    function updateVisibility() { if (!destroyed) controller.setVisible(visible && pageVisible && !doc.hidden); }
    if (!launcher) listen(button, 'click', () => controller.emit('welcome'));
    listen(scope, 'focusin', updateEditing);
    listen(scope, 'focusout', () => queueMicrotask(updateEditing));
    listen(scope, 'compositionstart', event => { if (editable(event.target)) { composing = true; updateEditing(); } });
    listen(scope, 'compositionend', () => { composing = false; updateEditing(); });
    listen(scope, 'input', updateEditing);
    listen(doc, 'visibilitychange', updateVisibility);
    listen(view, 'pagehide', () => { pageVisible = false; updateVisibility(); });
    listen(view, 'pageshow', () => { pageVisible = true; updateVisibility(); });
    if (media?.addEventListener) listen(media, 'change', () => controller.setReducedMotion(media.matches));
    else if (media?.addListener) { const changed = () => controller.setReducedMotion(media.matches); media.addListener(changed); removers.push(() => media.removeListener(changed)); }
    const api = {
      emit: controller.emit, setBusy: controller.setBusy, getState: controller.getState,
      setLanguage(value) { if (!destroyed) { language = value === 'en' ? 'en' : 'zh-CN'; label(); } },
      setEditing(value) { manuallyEditing = !!value; updateEditing(); },
      setVisible(value) { visible = !!value; updateVisibility(); },
      setEnabled(value) { controller.setEnabled(value); },
      destroy() {
        if (destroyed) return;
        destroyed = true; controller.destroy(); stop();
        for (const remove of removers.splice(0)) remove();
        host.replaceChildren(); mounted.delete(host); instances.delete(api);
      }
    };
    mounted.set(host, api); instances.add(api); updateEditing();
    return api;
  }

  return { createController, mount, petPicture, getEnabled: () => motionEnabled, setEnabled(value) { motionEnabled = !!value; for (const instance of instances) instance.setEnabled(motionEnabled); } };
});

;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map(), requests = new Map();
  let workspace, coach, initialized = false, feedbackTimer, serial = 0, badge, badgeEpoch = 0;
  let enabled = true, focus = false;
  try { enabled = localStorage.getItem('factorlab-character-motion') !== 'off'; } catch {}
  const language = () => window.FactorLabApp?.getUI().lang || 'zh-CN';
  const words = {
    'zh-CN': {success:'操作已完成', account:'已登录，继续研究', save:'已保存到此浏览器', caution:'请查看本次提示', fallback:'规则提示已生成'},
    en: {success:'Operation complete', account:'All set. Continue your research.', save:'Progress saved', caution:'Review the notice and check the evidence', fallback:'Reply ready. Rule fallback is in use.'}
  };
  function stopMotion() {
    badgeEpoch++;
    for (const animation of animations.values()) animation.revert?.();
    animations.clear(); badge?.destroy(); badge = null;
  }
  function surface() {
    stopMotion();
  }
  function select(node) {
    if (reduced.matches || document.hidden || !window.anime?.animate) return;
    animations.get(node)?.revert?.();
    animations.set(node, anime.animate(node, {scale:[.98,1], duration:180, ease:'outQuad', onComplete:()=>animations.delete(node)}));
  }
  function showFeedback(key) {
    const node = $('companion-feedback'); if (!node) return;
    clearTimeout(feedbackTimer); node.dataset.message = key;
    node.textContent = words[language()][key] || words[language()].success; node.hidden = false;
    feedbackTimer = setTimeout(() => { node.hidden = true; }, 6500);
  }
  function researchBadge() {
    const epoch=++badgeEpoch;
    badge?.destroy(); badge=null;
    const status=$('backtest-status');
    if (!status || reduced.matches || !enabled || document.hidden) return;
    if (!window.lottie) { window.FactorLabEnhancements?.loadBadge().then(loaded=>{if(loaded&&epoch===badgeEpoch&&status.isConnected&&!focus)researchBadge();});return; }
    const host=document.createElement('span');host.className='research-badge';host.setAttribute('aria-hidden','true');status.prepend(host);
    const k=value=>({a:0,k:value});
    const keyframes=[{t:0,s:[0],e:[100],i:{x:[.67],y:[1]},o:{x:[.33],y:[0]}},{t:24,s:[100]}];
    const animationData={v:'5.13.0',fr:30,ip:0,op:30,w:48,h:48,nm:'Research completed',ddd:0,assets:[],layers:[{ddd:0,ind:1,ty:4,nm:'Evidence seal',sr:1,ks:{o:k(100),r:k(0),p:k([24,24,0]),a:k([0,0,0]),s:k([100,100,100])},ao:0,ip:0,op:30,st:0,bm:0,shapes:[{ty:'gr',it:[{ty:'el',p:k([0,0]),s:k([36,36]),d:1},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(2),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(-90),o:k(100),sk:k(0),sa:k(0)}]},{ty:'gr',it:[{ty:'sh',ks:k({i:[[0,0],[0,0],[0,0]],o:[[0,0],[0,0],[0,0]],v:[[-9,0],[-2,7],[10,-7]],c:false})},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(3),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(0),o:k(100),sk:k(0),sa:k(0)}]}]}]};
    badge=lottie.loadAnimation({container:host,renderer:'svg',loop:false,autoplay:true,animationData});
  }
  function visible() {
    if (!initialized) return;
    const open = $('coach-drawer').open;
    workspace.setVisible(!open && !document.querySelector('dialog[open]'));
    coach.setVisible(open && !$('coach-empty').hidden);
    $('open-coach').setAttribute('aria-expanded', String(open));
  }
  function react(state,id) {
    visible();
    ($('coach-drawer').open ? coach : workspace).emit(state,{id});
  }
  function initialize() {
    if(initialized || !window.FactorLabApp || !window.FactorMascot) return;
    initialized=true;FactorMascot.setEnabled(enabled);
    const choice=$('research-pet');
    const petKey='factorlab-research-pet';
    try{if(localStorage.getItem(petKey)==='kurumi')choice.value='kurumi';}catch{}
    document.documentElement.dataset.researchPet=choice.value;
    $('pet-preview').append(FactorMascot.petPicture(document));
    choice.addEventListener('change',()=>{
      document.documentElement.dataset.researchPet=choice.value;
      try{localStorage.setItem(petKey,choice.value);}catch{}
    });
    workspace=FactorMascot.mount($('companion-emblem'),{context:'workspace',language:language(),pet:true,launcher:true});
    coach=FactorMascot.mount($('coach-mascot'),{context:'coach',language:language(),focusRoot:$('coach-drawer'),pet:true});
    $('character-motion').checked=enabled;
    $('character-motion').addEventListener('change',()=>{
      enabled=$('character-motion').checked;FactorMascot.setEnabled(enabled);workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);if(!enabled){badge?.destroy();badge=null;}
      try{localStorage.setItem('factorlab-character-motion',enabled?'on':'off');}catch{}
    });
    $('open-coach').addEventListener('click',()=>{visible();coach.emit('welcome');});
    const observer=new MutationObserver(visible);
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    if($('coach-empty'))observer.observe($('coach-empty'),{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('resize',visible);
    window.addEventListener('pagehide',event=>{stopMotion();clearTimeout(feedbackTimer);if(event.persisted)return;observer.disconnect();workspace.destroy();coach.destroy();window.removeEventListener('resize',visible);});
    window.addEventListener('pageshow',visible);
    visible();
  }
  document.addEventListener('factorlab:render',()=>{
    initialize();if(!initialized)return;
    workspace.setLanguage(language());coach.setLanguage(language());
    $('open-coach').setAttribute('aria-label',language()==='en'?'Open the research partner':'打开研究伴侣');
    const notice=$('companion-feedback');if(!notice.hidden && notice.dataset.message !== 'guidance')notice.textContent=words[language()][notice.dataset.message];
  });
  document.addEventListener('factorlab:feedback',event=>{
    initialize();if(!initialized)return;
    const {kind,stage,id,returnValue,benchmarkReturn}=event.detail;
    if(kind==='backtest'){
      if(!focus){
        researchBadge();
        if(stage==='success'){react('success');}
      }
      return;
    }
    if(kind==='allocation'||kind==='settlement'){
      if(stage==='success'){
        const belowBenchmark=kind==='settlement'&&Number.isFinite(returnValue)&&Number.isFinite(benchmarkReturn)&&returnValue<benchmarkReturn;
        visible();
        workspace.emit(belowBenchmark?'caution':'success',{id:kind+':'+id,replace:true});
      }
      return;
    }
    const key=kind+':'+(id??++serial);
    if(['coach','check'].includes(kind)){
      if(stage==='start'){
        requests.set(kind,key);workspace.setBusy(key,true);if(kind==='coach')coach.setBusy(key,true);return;
      }
      if(requests.get(kind)!==key)return;
      requests.delete(kind);workspace.setBusy(key,false);if(kind==='coach')coach.setBusy(key,false);
      if(stage==='cancel')return;
    }
    let state=stage==='success'?'success':'caution',message=stage==='success'&&kind==='account'?'account':stage==='success'&&kind==='save'?'save':stage==='fallback'?'fallback':'caution';
    if(stage==='success' && !['account','save'].includes(kind))message='success';
    react(state,key);showFeedback(message);
  });
  document.addEventListener('factorlab:guidance',event=>{
    initialize();if(!initialized)return;
    const next=event.detail,notice=$('companion-feedback');focus=next.focus;
    workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);visible();
    if(focus){badge?.destroy();badge=null;}
    if(notice.dataset.message==='guidance'&&!notice.hidden){
      if(next.activeFeedback && (!focus || next.activeFeedback.necessary)) notice.textContent=next.activeFeedback.text;
      else notice.hidden=true;
    }
    const item=next.feedback;if(!item || (focus&&!item.necessary))return;
    if(item.motion)react(item.motion,item.key+':'+Date.now());
    clearTimeout(feedbackTimer);notice.dataset.message='guidance';notice.textContent=item.text;notice.hidden=false;
    feedbackTimer=setTimeout(()=>{notice.hidden=true;},6500);
  });
  function resetFeedback(){
    badgeEpoch++;
    clearTimeout(feedbackTimer);if($('companion-feedback'))$('companion-feedback').hidden=true;
    for(const key of requests.values()){workspace?.setBusy(key,false);coach?.setBusy(key,false);}requests.clear();
    badge?.destroy();badge=null;
  }
  for(const name of ['factorlab:restore','factorlab:profile','factorlab:new'])document.addEventListener(name,resetFeedback);
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-preset], .sector-card, .reason-chip, #confirm, #apply-factors');
    if(target && !target.disabled)select(target);
  });
  document.addEventListener('factorlab:view',()=>{visible();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion();});
  const motionChanged=()=>{if(reduced.matches)stopMotion();};
  if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',motionChanged);
  else reduced.addListener?.(motionChanged);
  window.FactorExperience={surface,getState:()=>({requests:[...requests.values()],enabled,workspace:workspace?.getState(),coach:coach?.getState()})};
  initialize();
})();

;
(function(){"use strict";const icons={"chart-line-up":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z\"/></svg>","squares-four":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z\"/></svg>","flask":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z\"/></svg>","sliders-horizontal":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z\"/></svg>","shield-check":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112l0-56,160,0ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z\"/></svg>","notebook":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M184,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h64A8,8,0,0,1,184,112Zm-8,24H112a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm48-88V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H72V48H48Zm160,0V48H88V208H208Z\"/></svg>","circles-three":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M172,76a44,44,0,1,0-44,44A44.05,44.05,0,0,0,172,76Zm-44,28a28,28,0,1,1,28-28A28,28,0,0,1,128,104Zm60,24a44,44,0,1,0,44,44A44.05,44.05,0,0,0,188,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,188,200ZM68,128a44,44,0,1,0,44,44A44.05,44.05,0,0,0,68,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,68,200Z\"/></svg>","book-open":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z\"/></svg>","sparkle":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z\"/></svg>","gear-six":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z\"/></svg>","scan":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,40V80a8,8,0,0,1-16,0V48H176a8,8,0,0,1,0-16h40A8,8,0,0,1,224,40ZM80,208H48V176a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H80a8,8,0,0,0,0-16Zm136-40a8,8,0,0,0-8,8v32H176a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V176A8,8,0,0,0,216,168ZM40,88a8,8,0,0,0,8-8V48H80a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V80A8,8,0,0,0,40,88ZM80,72h96a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V80A8,8,0,0,1,80,72Zm8,96h80V88H88Z\"/></svg>","arrow-up-right":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z\"/></svg>","arrow-right":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z\"/></svg>","lock-key":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,112a28,28,0,0,0-8,54.83V184a8,8,0,0,0,16,0V166.83A28,28,0,0,0,128,112Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,128,152Zm80-72H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z\"/></svg>","arrow-left":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z\"/></svg>","info":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z\"/></svg>","flag-checkered":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M227.32,48.75A8,8,0,0,0,218.76,50c-28,24.22-51.72,12.48-79.21-1.13C111.07,34.76,78.78,18.79,42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,28.49,14.09,60.77,30.06,96.79-1.13a8,8,0,0,0,2.76-6V56A8,8,0,0,0,227.32,48.75ZM216,71.6v40.65c-14,11.06-27,13.22-40,10.88V79.34A60.05,60.05,0,0,0,216,71.6Zm-56,3.76v43c-6.66-2.67-13.43-6-20.45-9.48-8.82-4.37-18-8.91-27.55-12.18v-43c6.66,2.66,13.43,6,20.45,9.48C141.27,67.55,150.46,72.09,160,75.36ZM96,48.91V92.69a60.06,60.06,0,0,0-40,7.75V59.78C70,48.72,83,46.57,96,48.91ZM86.58,152A60.06,60.06,0,0,0,56,160.43V119.78c14-11.06,27-13.22,40-10.88v43.8A65.61,65.61,0,0,0,86.58,152ZM112,156.67v-43c6.66,2.66,13.43,6,20.45,9.48,8.82,4.37,18,8.9,27.55,12.17v43c-6.66-2.67-13.43-6-20.45-9.48C130.73,164.47,121.54,159.94,112,156.67Zm64,26.45v-43.8a65.61,65.61,0,0,0,9.42.72A60.11,60.11,0,0,0,216,131.57v40.68C202,183.31,189,185.46,176,183.12Z\"/></svg>","download-simple":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z\"/></svg>","x":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/></svg>","arrow-up":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z\"/></svg>"};const atlasIcons = new Set(['research','factors','cycle','backtest','allocation','risk','journal','coach','evidence','account','save','settings','semiconductor','robotics','materials','energy','infrastructure','cash']);
const aliases = {
  'chart-line-up':'research', 'squares-four':'research', 'flask':'backtest',
  'sliders-horizontal':'allocation', 'shield-check':'risk', 'notebook':'journal',
  'circles-three':'cycle', 'book-open':'evidence', 'sparkle':'coach',
  'gear-six':'settings', 'scan':'cycle', 'flag-checkered':'journal'
};
const render = () => document.querySelectorAll('[data-icon]').forEach(el => {
  const name = el.dataset.icon, atlas = aliases[name] || (atlasIcons.has(name) ? name : null);
  if (atlas) {
    if (el.querySelector('.woodcut-icon')?.dataset.atlas !== atlas) el.innerHTML = '<span class="woodcut-icon" data-atlas="' + atlas + '" aria-hidden="true"></span>';
  } else {
    const svg = icons[name];
    if (svg && !el.querySelector('svg')) el.innerHTML = svg;
  }
});
window.FactorLabIcons={render};render();const atlasImage = new Image();
atlasImage.onload = () => {
  const ready = () => document.documentElement.setAttribute('data-icon-atlas-ready','');
  if (atlasImage.decode) atlasImage.decode().then(ready).catch(() => {});
  else ready();
};
atlasImage.src = new URL('assets/icons/woodcut-ui.png',document.currentScript.src).href;
})();

;
(function(root) {
  'use strict';
  const topics = [
    ['backtest', /回测|backtest/i,
      '回测就是把一套选择规则放进历史数据，看看它当时会怎样表现。',
      '先选因子，再运行回测，最后把收益、最大回撤和基准一起看。这里使用合成教学数据，结果不能证明真实市场有效。',
      'Backtesting applies a selection rule to historical data to see how it would have behaved.',
      'Choose factors, run the backtest, then compare returns, maximum drawdown and the benchmark. This exercise uses synthetic data; it does not establish real-market effectiveness.'],
    ['factor', /因子|factor|动量|momentum|低波动|volatility|质量|quality|价值|value/i,
      '因子就是选行业时采用的观察角度。这里可以调整动量、价值、质量和低波动的重视程度。',
      '因子权重决定“怎么选”，行业配置决定“钱放在哪”。先选你能解释的角度，再用回测检查它是否稳定。',
      'A factor is a lens for comparing sectors. Here you can weight momentum, value, quality and low volatility.',
      'Factor weights describe how you rank sectors; allocation weights describe where the portfolio is invested. Start with a lens you can explain, then check its consistency in the backtest.'],
    ['ic', /(^|\W)ic(\W|$)|因子功效|相关系数|rank/i,
      'IC 用来检查：因子当时给出的高低排序，和之后实际收益的排序是否一致。',
      '不能只看某一次 IC。还要看样本数、不同时段是否稳定，以及回测中的收益和风险。这里的功效指标只针对合成样本。',
      'IC checks whether factor rankings agree with the returns observed afterwards.',
      'Do not judge a factor from one IC reading. Check the sample size, consistency over time, returns and risk. These results describe synthetic samples only.'],
    ['cycle', /周期|cycle|复苏|扩张|衰退|过热|滞胀/i,
      '行业周期描述经营环境正在改善还是转弱。订单、利润和融资条件可能不会同时转向。',
      '先确认当前已披露的线索，再想它会怎样传到收入、成本和盈利。游戏里的周期是简化教学判断，不是真实经济预测。',
      'A sector cycle describes improving or weakening business conditions. Orders, profits and financing can turn at different times.',
      'Check disclosed evidence first, then trace how it may affect revenue, costs and profits. The cycle labels here are simplified teaching signals, not economic forecasts.'],
    ['benchmark', /基准|benchmark|等权/i,
      '基准是一条对照线：用它检查你的配置是否比简单持有行业组合更好。',
      '本模拟的基准是五个行业各占 20%、每日再平衡、不计交易成本、不持有现金。比较时要留意这些假设与你的组合不同。',
      'A benchmark is a reference portfolio for comparing your allocation with a simple sector mix.',
      'This simulation uses five sectors at 20% each, daily rebalancing, no transaction costs and no cash. Those assumptions differ from your portfolio.'],
    ['risk', /风险|回撤|现金|risk|drawdown|cash|sharpe|夏普/i,
      '先看最集中的行业、现金缓冲，以及组合已经经历的最大回撤。',
      '最大回撤记录从此前高点跌落的幅度。少亏一些和赚得更多是不同目标；不要只盯收益，也不要把历史回撤当成未来上限。',
      'Start with the largest sector weight, the cash buffer and the drawdown already experienced.',
      'Maximum drawdown measures the fall from an earlier peak. Limiting losses and increasing returns are different aims; past drawdown is not a future loss limit.'],
    ['positioning', /长期|短期|战术|配置|allocation|tactical|long.term|position/i,
      '长期定位回答“为什么持续关注这个行业”，短期战术回答“这次新证据是否值得调整比例”。',
      '先写一个长期理由，再写清当前证据带来了什么变化。调整前检查总比例、单行业上限和现金；决定仍由你确认。',
      'Long-term positioning explains why a sector matters over time; tactical allocation responds to new evidence.',
      'Write the long-term reason first, then explain what changed. Check the total, sector limit and cash before you confirm a decision.'],
    ['orders', /订单|利润|盈利|order|profit|earning/i,
      '订单增加只是线索，还要看它能否变成收入和利润。',
      '可以顺着“订单 → 交付 → 收入 → 成本 → 利润”检查。需求改善与估值偏贵可能同时存在；只用当前已披露的材料判断。',
      'More orders are a clue; you still need to see whether they become revenue and profit.',
      'Follow orders, delivery, revenue, costs and profit. Improving demand and expensive valuations can coexist. Use only the evidence already disclosed.'],
    ['saving', /存档|保存|save|saving|sync|同步/i,
      '页面中的草稿保存在当前浏览器；账号存档需要进入账号窗口，明确保存为一条存档。',
      'GitHub Pages 版支持浏览器本地保存与导入导出。云端存档只有在服务器账号服务可用时才成立，保存成功后请检查存档列表。',
      'Browser drafts stay in this browser. An account save requires explicitly saving a named record in the account window.',
      'GitHub Pages supports browser-local data and import/export. Server saves require a working account service; check the save list after saving.'],
    ['chart', /走势|走线|图表|曲线|chart|line|curve/i,
      '先看图例，再看同一时间点的数值；一条线上升不代表所有行业都变好了。',
      '把曲线与事件时间对应起来，再区分已经观察到的变化和你对未来的猜测。图表中的市场路径是合成模拟。',
      'Start with the legend and compare values at the same date. One rising line does not mean every sector improved.',
      'Match the curve to disclosed events, then separate observations from expectations. The market path is synthetic.']
  ];
  const matchTopic = text => topics.find(topic => topic[1].test(text));
  const payrollTerm = /非农|\b(?:payrolls?|nfp)\b/i;

  function replayReply(question, lang = 'zh-CN', context = root.FactorLabReplayUI?.getContext()) {
    const en = lang === 'en';
    const tr = (zh, english) => en ? english : zh;
    const q = String(question || '').trim().slice(0, 1000);
    const archiveQuestion = /宏观回放|发布回放|2024[-\/]0?(?:6[-\/]0?7|7[-\/](?:0?5|11))|6\s*月\s*7\s*日|7\s*月\s*(?:5|11)\s*日|macro.{0,10}replay/i.test(q);
    const releaseSeries = payrollTerm.test(q) || /就业报告|失业率|\b(?:CPI|BLS|unemployment|employment (?:situation|report))\b/i.test(q);
    const releaseFigures = /实际值|公布值|数值|修订|是多少|多少人|headline number|actual (?:figure|reading|number)|revisions?/i.test(q);
    const refersToOpenRelease = context?.active && (
      !q || releaseSeries && releaseFigures || /^(?:修订|revisions?)[呢吗？?\s]*$|(?:这份|这条|本期).{0,6}(?:公告|报告|数据|数值|修订)|这次公布|发布前|公布前|本次修订|this (?:release|report)|before (?:the )?release/i.test(q)
    );
    if (!archiveQuestion && !refersToOpenRelease) return null;

    const replay = root.FactorLabReplay || (typeof module !== 'undefined' && module.exports ? require('./replay-data.js') : null);
    const release = replay?.releaseSnapshot(context?.releaseId, context?.revealed, lang);
    const answer = { mode: 'example', detail: '', references: [], sources: [] };
    if (!release) return { ...answer, summary: tr('打开宏观回放，先选择要核对的公告。', 'Open macro replay and select the release you want to check.') };
    if (!release.rows) return {
      ...answer,
      summary: tr('先区分发布前已知的信息与即将公布的数据。', 'Separate what was known beforehand from the upcoming release.'),
      detail: release.knownBefore.join(' ') + tr(' 点击“公布本期数据”后，再核对本期数值与修订。', ' Reveal this release to check the current figures and revisions.')
    };
    const asksAboutMarket = /超预期|涨跌|股市|利率|surprise|stock market|rates/i.test(q);
    return {
      ...answer,
      summary: asksAboutMarket ? release.caveat : release.guidance,
      detail: [release.releaseLocal, ...release.rows.map(([label, value]) => label + ' ' + value)].join(' · '),
      sources: [release.source]
    };
  }

  function payrollImpactReply(question, lang = 'zh-CN') {
    const q = String(question || '').trim().slice(0, 1000);
    const strongPrint = /过高|太高|偏高|偏强|强劲|高于.{0,4}预期|超.{0,3}预期|\b(?:strong(?:er)?|hot(?:ter)?|above expectations|higher than expected|beat expectations)\b/i.test(q);
    const specificOrMixed = /(?:我[的们]?|本局|本轮|这轮|当前).{0,10}(?:配置|组合|持仓|仓位|权重)|本月|最新|刚公布|今天|上个月|低于|弱于|偏弱|\b(?:my|our|current) (?:draft |simulated )?(?:portfolio|allocation|holdings)\b|\b(?:latest|today|this month|last month|weaker|below expectations)\b/i.test(q);
    if (!payrollTerm.test(q) || !strongPrint || specificOrMixed) return null;
    const en = lang === 'en';
    return {
      mode: 'guide', references: [],
      summary: en
        ? 'When nonfarm payroll gains beat market expectations, the labor market looks stronger than expected. If wage growth also surprises to the upside, investors may price in fewer near-term Fed rate cuts. Treasury yields can rise and richly valued growth stocks may come under pressure. Strong employment can also support consumer demand and corporate earnings, so stock prices depend on which effect dominates.'
        : '非农新增就业高于市场预期，通常说明劳动力市场比预想更强。如果平均时薪增速也超预期，市场可能减少对近期降息的押注，美债收益率可能上行，高估值成长股可能承压。另一方面，就业强劲也可能支撑消费和企业盈利，所以股市怎么走取决于哪种影响占主导。',
      detail: en
        ? 'Compare the release with the pre-release consensus, then check average hourly earnings, unemployment and revisions to the prior two months. Payrolls and unemployment come from different surveys. A high headline number by itself gives little guidance about the market reaction.'
        : '先对比公布值和发布前的市场预期，再一起看平均时薪、失业率和前两个月的修订。就业岗位数与失业率来自不同调查。要判断市场反应，还要看这些变化是否已经被价格反映。',
      sources: [
        { label: en ? 'BLS employment report technical note' : '美国劳工统计局就业报告技术说明', url: 'https://www.bls.gov/news.release/empsit.tn.htm' },
        { label: en ? 'Federal Reserve research on rates and asset prices' : '美联储关于利率与资产价格的研究', url: 'https://www.federalreserve.gov/econres/notes/feds-notes/are-rising-u-s-interest-rates-destabilizing-for-emerging-market-economies-20210623.html' }
      ]
    };
  }

  function offlineReply(state, question, lang = 'zh-CN', history = [], context) {
    const scoped = replayReply(question, lang, context) || payrollImpactReply(question, lang);
    if (scoped) return scoped;
    const en = lang === 'en', q = String(question || '').trim().slice(0, 1000);
    const answer = (summary, detail = '', references = [], sources = []) => ({ summary, detail, references, sources, mode: 'example' });
    if (/^(你好|您好|嗨|哈[喽啰]|早上好|晚上好|hello|hi|hey)[！!。.\s]*$/i.test(q)) return answer(en ? 'Hello! Would you like help getting started, or is there a term you want to unpack?' : '你好！想先了解怎么玩，还是有哪个词想让我讲明白？');
    if (/^(谢谢|多谢|感谢|thanks|thank you)[！!。.\s]*$/i.test(q)) return answer(en ? 'You are welcome. We can take the next step when you are ready.' : '不客气。准备好了，我们接着看下一步。');
    if (/你是谁|什么模型|连接|在线|who are you|which model|online|connected/i.test(q)) return answer(en ? 'I am the offline learning helper here. These replies are prepared guidance, not a live DeepSeek conversation.' : '现在是离线学习助手，回答来自预设教学提示；当前这条回复没有调用 DeepSeek。', en ? 'A live conversation needs the server-side AI connection. You can still ask about the workflow, backtests, factors or risk.' : '在线自由对话需要服务器接通 AI。这里仍可以解释流程、回测、因子和风险。');
    if (/开始|下一步|怎么玩|怎么做|怎么操作|从哪|what.*next|how.*start|getting started|walkthrough/i.test(q)) {
      const steps = {
        decision: ['到配置页调整比例，核对现金与费用后就能确认。引用证据、写理由和可推翻条件可留作复盘笔记。最终课程练习仍需完成回测与因子功效查看。', 'Adjust the weights, check cash and costs, then confirm. You can keep evidence, rationale and an invalidation condition in your review notes. The final course exercise still requires a backtest and efficacy review.'],
        simulating: ['你已经确认配置。继续推进模拟，遇到新事件时先读信息，再判断原来的理由是否还成立。', 'Your allocation is confirmed. Advance the simulation and review new events against your original reasoning.'],
        event: ['先读完本次事件，分清已确认事实和推测，再继续模拟。', 'Read the current event, separate confirmed facts from assumptions, then continue.'],
        review: ['先比较本轮结果和基准，再回看当时的理由。写下一条反思后进入下一轮。', 'Compare this round with the benchmark, revisit your original reason, and record one reflection before the next round.'],
        complete: ['六轮已结束。检查每轮理由与结果，整理长期定位、短期调整和你会改变的一点。', 'The six rounds are complete. Review reasons and results, then summarize positioning, tactical changes and one improvement.']
      };
      const step = steps[state?.phase] || steps.decision;
      return answer(step[en ? 1 : 0]);
    }
    if (/预测|必涨|稳赚|未来价格|下一.*涨|帮我买|帮我卖|guarantee|predict|future price|buy for me|sell for me/i.test(q)) return answer(en ? 'I cannot see future prices or place trades. We can examine the evidence available now and what would weaken your view.' : '我看不到未来价格，也不能替你交易。我们可以检查眼前的证据，以及什么新信息会推翻你的判断。');
    let topic = matchTopic(q);
    const followUp = /简单|举例|再讲|没懂|不懂|为什么|说清楚|什么意思|simpler|simply|simplify|plain language|example|explain again|why|what.*mean/i.test(q);
    if (!topic && followUp) {
      for (const item of (Array.isArray(history) ? history : []).slice(-12).reverse()) {
        if (item?.role === 'user' && typeof item.content === 'string' && (topic = matchTopic(item.content))) break;
      }
    }
    if (topic) {
      if (followUp && topic[0] === 'backtest') return answer(en ? 'Think of a rehearsal using the past: “If I had followed this rule then, what would have happened?”' : '把它想成用过去的数据彩排：“如果我当时按这个规则选，会发生什么？”', en ? 'A rehearsal helps test the rule; it cannot promise the same outcome next time.' : '彩排能帮助检查规则，但不能保证下一次也会一样。');
      if (followUp) return answer(topic[en ? 5 : 3], topic[en ? 4 : 2]);
      return answer(topic[en ? 4 : 2], topic[en ? 5 : 3]);
    }
    return answer(en ? 'The offline helper does not have a reliable answer to that yet. Is your question about evidence, backtesting, allocation or reviewing a result?' : '离线助手暂时无法可靠回答这个问题。你是在问证据、回测、配置，还是结果复盘？', en ? 'This is prepared local guidance. Open-ended conversation becomes available when the server AI service is connected.' : '这里是本地预设提示；服务器接通 AI 后才支持开放式多轮交流。');
  }
  const api = { offlineReply, replayReply, payrollImpactReply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FactorLabAssistant = api;
})(typeof window === 'undefined' ? globalThis : window);

;
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

;
(function () {
  'use strict';
  let selectedId = '', compareId = '', range = 'all', scope = 'security', showWarmup = false, compareMode = false;

  function sliceRange(points) {
    const size = Number(range);
    return Number.isFinite(size) && size > 0 ? points.slice(-size) : points;
  }

  function dayLabel(point) {
    return point.day < 0 ? 'D−' + Math.abs(point.day) : 'D' + point.day;
  }

  function basketSeries(view, sector) {
    const ledger = view.ledger;
    const dates = new Map((ledger?.history || []).map(row => [row.day, row.asOf]));
    return (ledger?.baskets || []).map((basket, index) => {
      let level = 100;
      const points = [];
      for (const row of view.history) {
        if (row.day > view.day) break;
        if (row.day !== 0) {
          const dailyReturn = row.sectorReturns?.[index];
          if (!Number.isFinite(dailyReturn)) break;
          level *= 1 + dailyReturn;
        }
        points.push({day:row.day, time:dates.get(row.day), value:level});
      }
      return {id:'sector-' + index, name:sector ? sector(index) : basket.id, points};
    }).filter(item => item.points.length);
  }

  function movement(change, num) {
    if (!Number.isFinite(change)) return {signClass:'',text:'—'};
    const percent = Math.abs(change*100) < .005 ? 0 : change*100;
    return {signClass:percent < 0 ? 'negative' : percent > 0 ? 'positive' : '', text:(percent > 0 ? '+' : '') + num(percent,2) + '%'};
  }

  function summary(points, tr, num, unit) {
    if (points.length < 2) return `<p class="chart-empty-note">${tr('当前区间只有一个点，下一日才形成涨跌。','Only one point is available in this interval. A change forms on the next day.')}</p>`;
    const first = points[0], last = points.at(-1), change = first.value ? last.value / first.value - 1 : null;
    const delta = movement(change,num);
    return `<div class="price-summary"><div><span>${tr('区间起点','Range start')}</span><strong>${num(first.value, 4)}</strong><small>${dayLabel(first)} · ${unit}</small></div><div><span>${tr('区间终点','Range end')}</span><strong>${num(last.value, 4)}</strong><small>${dayLabel(last)} · ${unit}</small></div><div><span>${tr('区间涨跌','Range change')}</span><strong class="${delta.signClass}">${delta.text}</strong></div></div>`;
  }

  function render(root, ctx) {
    const {records, view, tr, esc, num, securityName, sector, meta, actions, bindActions, FactorVisuals} = ctx;
    if (!root || !view) return;
    const previousFocus = root.contains(document.activeElement) ? document.activeElement.id : '';
    const quotes = records.filter(record => record.type === 'price' && Array.isArray(record.data?.points))
      .map(record => {
        const id = record.instrumentIds[0];
        return {id, name:securityName(id), points:record.data.points, record};
      });
    const baskets = basketSeries(view, sector);
    if (!baskets.length) scope = 'security';
    const basketMode = scope === 'basket', includeWarmup = !basketMode && showWarmup;
    const series = basketMode ? baskets : quotes;
    if (!series.length) {
      root.innerHTML = `<h2>${tr('价格材料尚不可用','Price material unavailable')}</h2><p>${tr('当前快照未提供证券价格。','This snapshot does not contain security prices.')}</p>`;
      return;
    }
    const primary = series.find(item => item.id === selectedId) || series[0];
    selectedId = primary.id;
    const alternatives = series.filter(item => item.id !== selectedId);
    const secondary = alternatives.find(item => item.id === compareId) || alternatives[0];
    compareId = secondary?.id || '';
    const visible = item => sliceRange(item.points.filter(point => includeWarmup || point.day >= 0));
    const primaryPoints = visible(primary), secondaryPoints = secondary ? visible(secondary) : [];
    const secondaryByDay = new Map(secondaryPoints.map(point => [point.day, point.value]));
    const pairs = primaryPoints.filter(point => secondaryByDay.has(point.day));
    const baseA = pairs[0]?.value, baseB = secondaryByDay.get(pairs[0]?.day);
    const canCompare = compareMode && baseA > 0 && baseB > 0;
    const rows = canCompare ? pairs.map(point => ({day:point.day, primary:100 * (point.value / baseA), comparison:100 * (secondaryByDay.get(point.day) / baseB)}))
      : primaryPoints.map(point => ({day:point.day, primary:point.value}));
    const summaryPoints = canCompare ? rows.map(row => ({day:row.day, value:row.primary})) : primaryPoints;
    const latest = primaryPoints.at(-1);
    const change = primaryPoints.length > 1 ? latest.value / primaryPoints[0].value - 1 : null;
    const delta = movement(change,num);
    const warmupVisible = includeWarmup && rows.some(point => point.day < 0);
    const selection = latest ? {from:primaryPoints[0].day, to:latest.day} : {};
    const unit = basketMode ? tr('点','points') : 'USD';
    const heading = basketMode ? tr('模拟行业篮子','Simulated sector baskets') : tr('证券价格与比较','Security prices & comparison');
    const normalized = tr('指数（起点 100）','Index (start 100)');
    const options = (items, selected) => items.map(item => `<option value="${esc(item.id)}" ${item.id === selected ? 'selected' : ''}>${esc(item.name)}</option>`).join('');
    const note = canCompare ? tr('区间第一个共同可见点设为 100，用于比较相对走势。','The first common observation is set to 100 to compare relative paths.')
      : basketMode ? tr('D0 为 100。按本局已发生的篮子收益逐日复利。','D0 starts at 100. The index compounds observed daily basket returns from this campaign.')
      : tr('教学证券报价，单位为美元/股。','Teaching security quotes in USD/share.');
    const provenance = basketMode ? `<details class="material-provenance"><summary>${tr('来源与计算口径','Source & method')}</summary><p>${tr('每日本行业篮子收益为成分证券报价收益按既定篮子权重加权，再逐日复利；不含现金、交易费或用户持仓影响。','Each basket’s daily return is the constituent price returns weighted by the fixed basket weights and then compounded. This excludes cash, fees, and user holdings.')}</p></details>`
      : `${meta(primary.record)}${actions(primary.record, selection)}<details class="evidence-explanation"><summary>${tr('如何解读','Interpretation')}</summary><p>${esc(primary.record.interpretation?.[document.documentElement.lang] || primary.record.interpretation?.en || '')}</p></details>`;

    root.innerHTML = `<div class="panel-head"><h2>${heading}</h2><span class="source-badge">${basketMode ? tr('模拟指数 · 点','Simulated index · points') : tr('模拟价格 · USD/股','Simulated price · USD/share')}</span></div>
      <div class="evidence-toolbar market-toolbar">
        ${baskets.length ? `<label>${tr('数据类型','Data type')} <select id="market-scope"><option value="security" ${basketMode ? '' : 'selected'}>${tr('个股价格','Security prices')}</option><option value="basket" ${basketMode ? 'selected' : ''}>${tr('行业篮子','Sector baskets')}</option></select></label>` : ''}
        <label>${basketMode ? tr('行业','Sector') : tr('证券','Security')} <select id="market-instrument">${options(series, selectedId)}</select></label>
        <label>${tr('区间','Range')} <select id="market-range"><option value="all" ${range === 'all' ? 'selected' : ''}>${includeWarmup ? tr('全部可见','All visible') : tr('开局至今','Since D0')}</option>${[10,30,90,365].map(size => `<option value="${size}" ${String(size) === String(range) ? 'selected' : ''}>${size}${tr(' 个观测',' observations')}</option>`).join('')}</select></label>
        <label class="market-toggle"><input id="market-compare" type="checkbox" ${compareMode ? 'checked' : ''} ${alternatives.length ? '' : 'disabled'}> ${tr('同起点比较','Compare from same start')}</label>
        ${basketMode ? '' : `<label class="market-toggle"><input id="market-warmup" type="checkbox" ${showWarmup ? 'checked' : ''}> ${tr('包含热身段','Include warm-up')}</label>`}
        ${compareMode && secondary ? `<label>${basketMode ? tr('对比行业','Compare sector') : tr('对比证券','Compare security')} <select id="market-compare-instrument">${options(alternatives, compareId)}</select></label>` : ''}
      </div>
      <div class="price-readout"><span>${basketMode ? tr('最近可见指数','Latest visible index') : tr('最近可见报价','Latest visible quote')}</span><strong>${num(latest?.value, 2)} <small>${unit}</small></strong><time>${latest ? esc(latest.time?.slice(0, 10) || '') + ' · ' + dayLabel(latest) : '—'}</time><span class="${delta.signClass}">${Number.isFinite(change) ? delta.text : tr('下一日形成涨跌','Change forms next day')}</span></div>
      <p class="market-mode-note">${note}</p><button class="text-button price-data-jump" id="open-price-data">${tr('打开数据表','Open data table')}</button>
      ${warmupVisible ? `<p class="market-warmup-note">${tr('热身段 D−30 至 D−1 共用一条教学曲线，只用于熟悉界面；它不进入日频因子样本或组合收益。','Warm-up D−30 to D−1 shares one teaching curve for interface practice. It does not enter daily factor samples or portfolio returns.')}</p>` : ''}
      <div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('当前为基础折线图，完整数据可在下表查看。','Showing the basic chart. Full values are available in the table below.')}</p>
      ${summary(summaryPoints, tr, num, canCompare ? tr('点','points') : unit)}
      <details class="price-data"><summary>${basketMode ? tr('查看指数数据','View index data') : tr('查看价格数据','View price data')} · ${rows.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('模拟日','Simulation day')}</th>${canCompare ? `<th>${esc(primary.name)} ${normalized}</th><th>${esc(secondary.name)} ${normalized}</th>` : `<th>${basketMode ? tr('指数点位','Index level') : tr('价格 USD','Price USD')}</th>`}</tr></thead><tbody>${rows.map(row => `<tr><td>${dayLabel(row)}</td><td>${num(row.primary, canCompare ? 3 : 4)}</td>${canCompare ? `<td>${num(row.comparison, 3)}</td>` : ''}</tr>`).join('')}</tbody></table></div></details>
      ${warmupVisible ? `<details class="warmup-explain"><summary>${tr('热身段是什么？','What is the warm-up?')}</summary><p>${tr('为熟悉界面而编写的 30 个观测，所有证券在热身段共用同一比例路径。','Thirty authored observations for interface practice. All securities share the same proportional path in the warm-up.')}</p></details>` : ''}
      ${provenance}`;

    const plot = [{key:'primary', name:primary.name}];
    if (canCompare) plot.push({key:'comparison', name:secondary.name, dash:true});
    FactorVisuals.chart(root.querySelector('#evidence-price-chart'), {
      rows, series:plot, label:canCompare ? tr('同起点归一价格比较','Normalized price comparison') : heading,
      unit:canCompare || basketMode ? tr('点','points') : 'USD', format:value => num(value, canCompare ? 3 : 2), xLabel:dayLabel,
      markLine:warmupVisible ? {value:'D0', label:tr('D0 开局','D0 start')} : null
    });
    root.querySelector('#open-price-data').onclick = () => {
      const details = root.querySelector('.price-data');
      details.open = true;
      details.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    root.querySelector('#market-scope')?.addEventListener('change', event => {scope = event.target.value; render(root, ctx);});
    root.querySelector('#market-instrument').onchange = event => {
      selectedId = event.target.value;
      if (selectedId === compareId) compareId = primary.id;
      render(root, ctx);
    };
    root.querySelector('#market-range').onchange = event => {range = event.target.value; render(root, ctx);};
    root.querySelector('#market-compare').onchange = event => {compareMode = event.target.checked; render(root, ctx);};
    root.querySelector('#market-warmup')?.addEventListener('change', event => {showWarmup = event.target.checked; render(root, ctx);});
    root.querySelector('#market-compare-instrument')?.addEventListener('change', event => {compareId = event.target.value; render(root, ctx);});
    bindActions(root);
    if (previousFocus) document.getElementById(previousFocus)?.focus({preventScroll:true});
  }

  window.FactorLabMarketView = {render, reset() {selectedId = ''; compareId = ''; range = 'all'; scope = 'security'; showWarmup = false; compareMode = false;}};
})();

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FactorLabReplay = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RELEASES = [
    {
      id: 'BLS-EMP-20240607',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'May 2024',
      releaseAt: '2024-06-07T12:30:00.000Z',
      releaseLocal: '2024-06-07 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      previousPublished: { nonfarmPayrolls: 175, unemploymentRate: 3.9 },
      revision: { nonfarmPayrolls: 165 },
      earlierRevision: { month: { 'zh-CN': '3 月', en: 'March' }, before: 315, after: 310 },
      version: 'first print with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_06072024.htm',
      sourceLabel: 'BLS Employment Situation, June 7, 2024 archive',
      knownBefore: {
        'zh-CN': ['5 月 3 日公布的 4 月初报为新增非农就业 17.5 万、失业率 3.9%。', '非农岗位数来自机构调查，失业率来自住户调查。'],
        en: ['The May 3 release initially reported 175k added payrolls and 3.9% unemployment for April.', 'Payrolls come from the establishment survey. Unemployment comes from the household survey.']
      },
      practice: {
        question: { 'zh-CN': '哪些是 5 月本期初报？哪些是对 4 月和 3 月的修订？', en: 'Which figures are initial estimates for May, and which revise April and March?' },
        answer: { 'zh-CN': '新增非农就业和失业率是 5 月初报。4 月和 3 月新增非农就业是对之前月份的修订。引用时同时记录统计月份、公告日期和版本。', en: 'The current payroll change and unemployment rate are initial May estimates. The April and March changes revise earlier months. Cite the observation month, release date and data vintage together.' }
      },
      caveat: { 'zh-CN': '用这些数值解读就业。判断市场是否意外还需要可核验的发布前一致预期。', en: 'Use these figures to interpret employment. Identifying a market surprise requires a verifiable pre-release consensus.' }
    },
    {
      id: 'BLS-EMP-20240705',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'June 2024',
      releaseAt: '2024-07-05T12:30:00.000Z',
      releaseLocal: '2024-07-05 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 206, unemploymentRate: 4.1 },
      previousPublished: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      revision: { nonfarmPayrolls: 218 },
      earlierRevision: { month: { 'zh-CN': '4 月', en: 'April' }, before: 165, after: 108 },
      version: 'current release with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_07052024.htm',
      sourceLabel: 'BLS Employment Situation, July 5, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 7 日已公布 5 月新增非农就业初报 27.2 万、失业率 4.0%。', '这次公告将发布 6 月数值，并可能调整先前月份的估计。'],
        en: ['The June 7 release initially reported 272k added payrolls and 4.0% unemployment for May.', 'This release will report June and may update estimates for earlier months.']
      },
      practice: {
        question: { 'zh-CN': '分别找出 6 月本期值、5 月上次公布值和 5 月本次修订值。', en: 'Find the June figure, the May first print and the revised May figure.' },
        answer: { 'zh-CN': '先区分统计月份。5 月的首次公布值和本次修订值是同一月份的两个版本。比较 5 月与 6 月时，请说明你用的是哪个版本。', en: 'Separate the observation months first. The first print and revised May value are two vintages of the same month. State which vintage you use when comparing May and June.' }
      },
      caveat: { 'zh-CN': '判断市场是否意外还需要可核验的发布前一致预期。判断股市表现需要对应日期的价格证据。', en: 'Identifying a surprise requires a verifiable pre-release consensus. Assessing the equity market requires price evidence from the relevant date.' }
    },
    {
      id: 'BLS-CPI-20240711',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Consumer Price Index for All Urban Consumers (CPI-U)',
      period: 'June 2024',
      releaseAt: '2024-07-11T12:30:00.000Z',
      releaseLocal: '2024-07-11 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { cpiMonthOverMonth: 'percent, seasonally adjusted', cpiYearOverYear: 'percent, not seasonally adjusted' },
      seasonalAdjustment: { 'zh-CN': '环比采用季调，同比采用未经季调的数值。', en: 'Month-over-month is seasonally adjusted. Year-over-year is unadjusted.' },
      current: { cpiMonthOverMonth: -0.1, cpiYearOverYear: 3.0 },
      version: 'first print',
      sourceUrl: 'https://www.bls.gov/news.release/archives/cpi_07112024.htm',
      sourceLabel: 'BLS CPI, July 11, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 12 日公布的 5 月 CPI-U 季调环比持平，未季调同比上涨 3.3%。', '环比和同比各自对应不同的比较窗口。'],
        en: ['The June 12 release reported flat May CPI-U month-over-month after seasonal adjustment and 3.3% unadjusted year-over-year growth.', 'Month-over-month and year-over-year compare different time windows.']
      },
      practice: {
        question: { 'zh-CN': '为何本期环比可以下降，而同比仍然上涨？', en: 'How can prices decline month-over-month and still be higher year-over-year?' },
        answer: { 'zh-CN': '环比和同比采用不同基期。先区分一个月与十二个月的窗口，再核对季调口径。', en: 'The two measures use different reference periods. Distinguish one month from twelve months, then check the adjustment basis.' }
      },
      caveat: { 'zh-CN': '这份回放可用来理解物价变化。推断利率或股票表现还需要当时的预期与价格证据。', en: 'This release describes changes in consumer prices. Inferences about rates or equities require contemporaneous expectations and price evidence.' }
    }
  ];

  function releaseSnapshot(id, revealed, lang = 'zh-CN') {
    const release = byId(id);
    if (!release) return null;
    const locale = lang === 'en' ? 'en' : 'zh-CN';
    const visible = {
      id: release.id,
      institution: release.institution,
      indicator: release.indicator,
      period: release.period,
      releaseLocal: release.releaseLocal,
      knownBefore: release.knownBefore[locale],
      caveat: release.caveat[locale]
    };
    if (revealed !== true) return visible;
    const en = locale === 'en';
    const tr = (zh, english) => en ? english : zh;
    const payroll = value => en ? value + 'k' : (value / 10).toFixed(1) + ' 万';
    const percent = value => value.toFixed(1) + '%';
    const { current, previousPublished, revision, earlierRevision } = release;
    const rows = current.nonfarmPayrolls !== undefined ? [
      [tr('本期非农就业变动','Current payroll change'), payroll(current.nonfarmPayrolls)],
      [tr('本期失业率','Current unemployment rate'), percent(current.unemploymentRate)],
      [tr('上期首次公布（非农）','Prior first print (payrolls)'), payroll(previousPublished.nonfarmPayrolls)],
      [tr('上期本次修订（非农）','Prior payrolls revised in this release'), payroll(revision.nonfarmPayrolls)],
      [tr('再前一期修订（非农）','Earlier payroll revision'), earlierRevision.month[locale] + ' · ' + payroll(earlierRevision.before) + ' → ' + payroll(earlierRevision.after)]
    ] : [
      [tr('CPI 环比（季调）','CPI month over month (SA)'), percent(current.cpiMonthOverMonth)],
      [tr('CPI 同比（未季调）','CPI year over year (NSA)'), percent(current.cpiYearOverYear)],
      [tr('季调口径','Seasonal adjustment'), release.seasonalAdjustment[locale]]
    ];
    return {
      ...visible, rows,
      question: release.practice.question[locale],
      guidance: release.practice.answer[locale],
      source: { label: release.sourceLabel, url: release.sourceUrl }
    };
  }

  const OPTION_CASES = [
    {
      id: 'LUV-2022-FUEL-HEDGE',
      company: 'Southwest Airlines',
      year: 2022,
      title: { 'zh-CN': '航空公司为什么支付权利金做燃油套保？', en: 'Why would an airline pay premiums for fuel hedges?' },
      facts: [
        { 'zh-CN': '2022 年年报披露，燃油套保组合的现金结算收益约为每加仑 0.49 美元，权利金费用约为每加仑 0.04 美元。', en: 'The 2022 annual report disclosed a cash settlement gain from fuel hedges of about USD 0.49 per gallon and premium costs of about USD 0.04 per gallon.' },
        { 'zh-CN': '套保组合包含多种衍生工具，不能把全部收益归给一笔 Call。', en: 'The portfolio included multiple derivatives; the total gain cannot be attributed to a single call option.' }
      ],
      question: { 'zh-CN': '油价上涨时，航空公司为什么仍要考虑套保成本？', en: 'If fuel prices rise, why should the airline still consider hedging costs?' },
      answer: { 'zh-CN': '套保可以减少燃油成本上升的冲击，但权利金本身是成本；而且原油与航油价格存在基差，套保并非完全消除风险。', en: 'Hedging can reduce the impact of higher fuel costs, but premiums are a cost and jet-fuel basis risk remains; hedging does not eliminate risk.' },
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/92380/000009238023000010/luv-20221231.htm',
      sourceLabel: 'Southwest Airlines 2022 Form 10-K, Item 7 and Note 11'
    },
    {
      id: 'GME-2021-OPTIONS',
      company: 'GameStop',
      year: 2021,
      title: { 'zh-CN': '期权成交暴增是否足以证明做市商推高股价？', en: 'Does an options-volume surge prove market makers pushed the stock up?' },
      facts: [
        { 'zh-CN': 'SEC 工作人员报告记载，个人客户期权成交金额从 2021-01-21 的约 5,850 万美元增至 2021-01-27 的约 24 亿美元，增量主要来自买入 Put。', en: 'The SEC staff report recorded retail customer options trading value rising from about USD 58.5 million on 2021-01-21 to about USD 2.4 billion on 2021-01-27, with the increase mainly in purchased puts.' },
        { 'zh-CN': '工作人员在可得数据中未找到当月发生 gamma squeeze 的证据。', en: 'Staff did not find evidence in the available data of a gamma squeeze that month.' }
      ],
      question: { 'zh-CN': '看见期权成交暴增，还需要确认哪一方买入了什么合约？', en: 'After seeing an options-volume surge, what still needs to be established about who bought which contracts?' },
      answer: { 'zh-CN': '成交量只说明合约换手增加。要讨论方向性压力，必须区分买方/卖方、Call/Put、是否开仓，以及做市商对冲与后续价格反应。', en: 'Volume only shows more contracts traded. Directional pressure requires distinguishing buyer and seller, calls and puts, whether positions opened, and dealer hedging and subsequent price response.' },
      sourceUrl: 'https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf',
      sourceLabel: 'SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021, section 3.4'
    }
  ];

  const INDUSTRY_CASES = [
    {
      id: 'semiconductor',
      name: { 'zh-CN': '半导体', en: 'Semiconductors' },
      longTerm: { 'zh-CN': '跟踪晶圆出货量、先进制程占比与资本开支；这些反映产能与产品结构。', en: 'Track wafer shipments, leading-edge process mix and capital spending; these show capacity and product mix.' },
      shortTerm: { 'zh-CN': '下一季订单、库存天数、产品售价与交付周期是否同步改善。', en: 'Check whether next-quarter orders, inventory days, product pricing and lead times improve together.' },
      counterExample: { 'zh-CN': '台积电 2024 年十二英寸等效晶圆出货量从上年约 1,200 万片增至 1,290 万片，7nm 及以下制程占晶圆收入比例从 58% 升至 69%。但同一轮需求变化，对代工、存储、设备的兑现时间可以不同。', en: 'TSMC increased 12-inch equivalent wafer shipments from about 12.0 million to 12.9 million in 2024, and the share of wafer revenue from 7nm and below rose from 58% to 69%. Yet the same demand change can reach foundry, memory and equipment earnings at different times.' },
      appliesTo: { 'zh-CN': '适用于代工与先进制程环节；不能直接套用到所有半导体公司。', en: 'Applies to foundry and leading-edge processes; not directly to every semiconductor company.' },
      sourceUrl: 'https://investor.tsmc.com/static/annualReports/2024/english/index.html',
      sourceLabel: 'TSMC 2024 Annual Report'
    },
    {
      id: 'robotics',
      name: { 'zh-CN': '机器人', en: 'Robotics' },
      longTerm: { 'zh-CN': '跟踪工业机器人年安装量、区域分布与自动化投资周期。', en: 'Track annual industrial-robot installations, regional mix and the automation investment cycle.' },
      shortTerm: { 'zh-CN': '订单、交付、市场份额与客户资本开支是否支持某家供应商下季收入。', en: 'Check orders, deliveries, market share and customer capex that would support a supplier’s next-quarter revenue.' },
      counterExample: { 'zh-CN': 'IFR 统计 2024 年全球工厂新装约 54.2 万台工业机器人，其中亚洲占 74%。安装量反映已落地的设备需求；推断某家供应商下季收入还需订单、市场份额与交付证据。', en: 'IFR recorded about 542,000 industrial robots installed in factories globally in 2024, with Asia at 74%. Installations reflect realized equipment demand; inferring a supplier’s next-quarter revenue still requires orders, share and delivery evidence.' },
      appliesTo: { 'zh-CN': '适用于工业自动化设备与集成环节。', en: 'Applies to industrial automation equipment and integration.' },
      sourceUrl: 'https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years',
      sourceLabel: 'IFR press release on 2024 robot installations'
    },
    {
      id: 'materials',
      name: { 'zh-CN': '先进材料', en: 'Advanced materials' },
      longTerm: { 'zh-CN': '跟踪终端需求、产能扩张、库存与材料价格；需求增长不等于售价上涨。', en: 'Track end demand, capacity additions, inventories and material prices; demand growth does not imply rising prices.' },
      shortTerm: { 'zh-CN': '现货价格、库存拐点、长协价格与客户补库是否改变利润。', en: 'Check spot prices, inventory inflection, contract prices and restocking that change margins.' },
      counterExample: { 'zh-CN': 'IEA 记录 2024 年锂需求增长近 30%，同时锂价自 2023 年以来跌逾 80%。需求增长与售价下跌可以同时发生；该案例适用于电池材料环节，不能直接套用到教学篮子中的先进合金。', en: 'The IEA recorded lithium demand growth of nearly 30% in 2024 while lithium prices fell more than 80% from 2023. Demand growth and falling prices can coexist; this applies to battery materials, not directly to the teaching basket’s advanced alloys.' },
      appliesTo: { 'zh-CN': '仅适用于电池材料等特定环节。', en: 'Only specific segments such as battery materials.' },
      sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025/executive-summary',
      sourceLabel: 'IEA Global Critical Minerals Outlook 2025, executive summary'
    },
    {
      id: 'energy',
      name: { 'zh-CN': '清洁能源装备', en: 'Clean energy equipment' },
      longTerm: { 'zh-CN': '跟踪装机、产能利用率、组件价格与成本曲线。', en: 'Track installations, utilization, module prices and the cost curve.' },
      shortTerm: { 'zh-CN': '产能、售价、订单与原材料成本是否同向变化；装机扩张可能伴随设备企业利润承压。', en: 'Check whether capacity, prices, orders and input costs move together; installation growth can coincide with equipment-maker margin pressure.' },
      counterExample: { 'zh-CN': 'IEA 记录全球光伏组件价格自 2023 年初以来跌逾一半。装机扩张与设备企业利润可能背离，应同时观察产能、售价和成本；光伏案例不能代替储能或电网设备数据。', en: 'The IEA recorded global solar PV module prices falling by more than half since early 2023. Installation growth and equipment-maker profits can diverge; watch capacity, prices and costs. The solar case does not replace storage or grid-equipment data.' },
      appliesTo: { 'zh-CN': '仅适用于光伏组件等环节。', en: 'Only segments such as solar modules.' },
      sourceUrl: 'https://www.iea.org/reports/renewables-2024/executive-summary',
      sourceLabel: 'IEA Renewables 2024, executive summary'
    },
    {
      id: 'digital',
      name: { 'zh-CN': 'AI 基础设施', en: 'AI infrastructure' },
      longTerm: { 'zh-CN': '跟踪算力需求、云业务收入与毛利率、资本开支。', en: 'Track compute demand, cloud revenue and gross margin, and capital spending.' },
      shortTerm: { 'zh-CN': '算力投入支持设备需求，但会先增加云服务商成本；先确定分析的是设备商还是运营方。', en: 'Compute investment supports equipment demand but first raises cloud operators’ costs; decide whether you are analyzing equipment makers or operators.' },
      counterExample: { 'zh-CN': '微软 FY2025 云业务毛利率降至 69%，公司将下降部分归因于 AI 基础设施扩张。算力投入可支持设备需求，也会先增加云服务商成本。', en: 'Microsoft’s FY2025 cloud gross margin fell to 69%, with the company attributing part of the decline to AI infrastructure expansion. Compute investment can support equipment demand while first raising cloud operators’ costs.' },
      appliesTo: { 'zh-CN': '适用于区分设备商与云运营方的分析。', en: 'Applies when separating equipment makers from cloud operators.' },
      sourceUrl: 'https://www.microsoft.com/investor/reports/ar25/',
      sourceLabel: 'Microsoft FY2025 Annual Report'
    }
  ];

  const CONSUMER_CONFIDENCE = {
    title: { 'zh-CN': '消费者信心：两个不同指数', en: 'Consumer confidence: two different indices' },
    body: {
      'zh-CN': '密歇根大学消费者情绪指数（University of Michigan Surveys of Consumers）与 The Conference Board 消费者信心指数（Consumer Confidence Index）由不同机构编制，问题、样本和发布节奏不同。首版只提供概念和原始来源，待选定系列并核实转载条款后再加入数值回放。',
      en: 'The University of Michigan Surveys of Consumers and The Conference Board Consumer Confidence Index are produced by different organizations with different questions, samples and release schedules. This first version provides concepts and primary sources only; numeric replay awaits a selected series and verified redistribution terms.'
    },
    sources: [
      { label: 'University of Michigan data FAQ', url: 'https://data.sca.isr.umich.edu/faq.php' },
      { label: 'The Conference Board consumer confidence', url: 'https://www.conference-board.org/topics/consumer-confidence' }
    ]
  };

  const SOURCE_CHECK = {
    title: { 'zh-CN': '传闻该用哪份原始文件核对？', en: 'Which primary document should verify the rumor?' },
    claim: {
      'zh-CN': '社交媒体说：“供应链订单明显改善，公司下季收入一定会超预期。”',
      en: 'A social post says: “Supply-chain orders improved sharply, so next-quarter revenue will definitely beat expectations.”'
    },
    options: [
      { id: 'company', label: { 'zh-CN': '公司公告、财报与订单披露', en: 'Company filings and order disclosures' } },
      { id: 'bls', label: { 'zh-CN': '美国劳工统计局就业报告', en: 'BLS Employment Situation' } },
      { id: 'repost', label: { 'zh-CN': '同一说法的其他转载', en: 'Other reposts of the same claim' } }
    ],
    answer: 'company',
    feedback: {
      'zh-CN': '优先核对公司公告、财报和可验证的订单披露。BLS 就业报告不覆盖这家公司的订单；同源转载不是独立确认。即使订单改善，也还要看交付、收入和估值。',
      en: 'Check company filings and verifiable order disclosures first. The BLS employment report does not cover this company’s orders, and reposts are not independent confirmation. Even improving orders still require delivery, revenue and valuation evidence.'
    }
  };

  const RELEASE_NOTE = {
    'zh-CN': '真实宏观回放与合成教学账本分开。实际公告日期与游戏模拟日各自显示；这些数值不进入合成收益计算。',
    en: 'Real macro replay is separate from the synthetic teaching ledger. Actual release dates and simulation days are shown separately; these values do not enter synthetic returns.'
  };

  const byId = id => RELEASES.find(item => item.id === id) || null;
  return { RELEASES, OPTION_CASES, INDUSTRY_CASES, CONSUMER_CONFIDENCE, SOURCE_CHECK, RELEASE_NOTE, byId, releaseSnapshot };
});

;
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const en = () => document.documentElement.lang === 'en';
  const tr = (zh, english) => en() ? english : zh;
  const data = () => window.FactorLabReplay;
  let releaseId = '', sourceChoice = '';
  const revealed = new Set();

  function getContext() {
    return {
      releaseId: releaseId || null,
      revealed: revealed.has(releaseId),
      active: !!document.getElementById('news-replay')?.getClientRects().length
    };
  }

  function reset() {
    releaseId = '';
    sourceChoice = '';
    revealed.clear();
    const host = document.getElementById('news-replay');
    if (host) renderNews(host, { day: window.FactorLabApp?.getState()?.day });
  }

  function renderNews(host, context) {
    const api = data();
    if (!host || !api) return;
    if (!releaseId || !api.byId(releaseId)) releaseId = api.RELEASES[0].id;
    const release = api.releaseSnapshot(releaseId, revealed.has(releaseId), en() ? 'en' : 'zh-CN');
    const isRevealed = !!release.rows;
    host.innerHTML = `<div class="panel-head"><h2>${tr('真实宏观发布回放','Real macro release replay')}</h2><span class="source-badge">${tr('真实历史 · 不进入合成收益','Real history · not in synthetic returns')}</span></div>
      <p class="replay-intro">${tr('三份历史公告、两类发布、三个核心指标。先看发布前已知，再点击公布本期数据；真实发布日期与游戏模拟日分开显示。','Three historical releases, two release types and three core indicators. Read what was known first, then reveal the release; actual dates and simulation days are shown separately.')}</p>
      <div class="release-tabs" role="tablist">${api.RELEASES.map(item => `<button data-release-id="${esc(item.id)}" aria-pressed="${item.id === release.id}">${esc(item.period)}<small>${esc(item.indicator.includes('CPI') ? 'CPI' : tr('就业报告','Employment'))}</small></button>`).join('')}</div>
      <article class="release-card">
        <div class="release-meta"><span>${esc(release.institution)}</span><span>${esc(release.period)}</span></div>
        <h3>${esc(release.indicator)}</h3>
        <div class="release-clock"><span>${tr('真实发布','Actual release')}: ${esc(release.releaseLocal)}</span><span>${tr('模拟日','Simulation day')}: D${Number(context?.day || 0)} ${tr('（与真实日期无映射）','(no mapping to real dates)')}</span></div>
        <div class="known-before"><strong>${tr('发布前已知','Known before release')}</strong><ul>${release.knownBefore.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
        ${isRevealed ? `<table class="release-values"><tbody>${release.rows.map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table><div class="release-practice"><strong>${tr('核对练习','Check your reading')}</strong><p>${esc(release.question)}</p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(release.guidance)}</p></details></div>` : `<button id="reveal-release" class="primary">${tr('公布本期数据','Reveal this release')}</button><p class="footnote">${tr('点击后可查看本期数值、同一次公告的修订和原始来源。','Reveal the release to see its current values, revisions and primary source.')}</p>`}
        <div class="expectation-note"><strong>${tr('市场预期','Market expectation')}:</strong> ${tr('暂无可核验数据。没有具备来源、发布时间和使用许可的一致预期，不判断“超预期”。','No verifiable data. Without sourced, timestamped and licensed consensus estimates, this page does not judge a “surprise”.')}</div>
        <p class="release-caveat">${esc(release.caveat)}</p>
        ${release.source ? `<a href="${esc(release.source.url)}" target="_blank" rel="noopener noreferrer">${esc(release.source.label)}</a>` : ''}
      </article>
      <details class="consumer-confidence"><summary>${esc(api.CONSUMER_CONFIDENCE.title[en() ? 'en' : 'zh-CN'])}</summary><p>${esc(api.CONSUMER_CONFIDENCE.body[en() ? 'en' : 'zh-CN'])}</p><p>${api.CONSUMER_CONFIDENCE.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join(' · ')}</p></details>
      <article class="source-check"><h3>${esc(api.SOURCE_CHECK.title[en() ? 'en' : 'zh-CN'])}</h3><p class="source-claim">${esc(api.SOURCE_CHECK.claim[en() ? 'en' : 'zh-CN'])}</p><div class="source-options">${api.SOURCE_CHECK.options.map(option => `<label><input type="radio" name="source-check" value="${esc(option.id)}" ${sourceChoice === option.id ? 'checked' : ''}> ${esc(option.label[en() ? 'en' : 'zh-CN'])}</label>`).join('')}</div><button id="check-source" class="secondary">${tr('核对这份说法','Check this claim')}</button><p id="source-feedback" class="source-feedback" role="status"></p></article>
      <p class="replay-boundary">${esc(api.RELEASE_NOTE[en() ? 'en' : 'zh-CN'])}</p>`;
    const revealButton=host.querySelector('#reveal-release');
    if(revealButton)host.querySelector('.release-tabs').after(revealButton);
    host.querySelectorAll('[data-release-id]').forEach(button => button.onclick = () => { releaseId = button.dataset.releaseId; renderNews(host, context); });
    host.querySelector('#reveal-release')?.addEventListener('click', () => {
      if (revealed.has(release.id)) return;
      revealed.add(release.id);
      renderNews(host, context);
      document.dispatchEvent(new CustomEvent('factorlab:macro-reveal', { detail: { releaseId: release.id } }));
    });
    host.querySelectorAll('input[name="source-check"]').forEach(input => input.onchange = () => { sourceChoice = input.value; });
    host.querySelector('#check-source')?.addEventListener('click', () => {
      const feedback = host.querySelector('#source-feedback');
      if (!sourceChoice) { feedback.textContent = tr('先选择一个核对来源。','Choose a source first.'); return; }
      const correct = sourceChoice === api.SOURCE_CHECK.answer;
      feedback.dataset.result = correct ? 'correct' : 'retry';
      feedback.textContent = correct ? api.SOURCE_CHECK.feedback[en() ? 'en' : 'zh-CN'] : tr('这份材料不能直接核对公司订单。请选择公司公告、财报或可验证的订单披露。','That document cannot verify the company’s orders. Choose company filings or verifiable order disclosures.');
    });
  }

  function optionsIntro(quote) {
    const api = data();
    if (!api) return '';
    const cases = api.OPTION_CASES.map(item => `<article class="case-card"><span class="source-badge">${tr('真实案例','Real case')}</span><h3>${esc(item.title[en() ? 'en' : 'zh-CN'])}</h3>${item.facts.map(fact => `<p>${esc(fact[en() ? 'en' : 'zh-CN'])}</p>`).join('')}<p><strong>${esc(item.question[en() ? 'en' : 'zh-CN'])}</strong></p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(item.answer[en() ? 'en' : 'zh-CN'])}</p></details><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('');
    const quoteHTML = quote ? `<section class="option-quote-card" aria-label="${tr('期权教学报价','Teaching option quote')}">
      <h3>${esc(quote.kind)} <span>· ${tr('行权价','Strike')} ${esc(quote.strike)} USD · ${tr('到期','Expires')} ${esc(quote.expiry)}</span></h3>
      <dl><div><dt>Bid <small>USD</small></dt><dd>${esc(quote.bid)}</dd></div><div><dt>Ask <small>USD</small></dt><dd>${esc(quote.ask)}</dd></div><div><dt>${tr('成交量','Volume')}</dt><dd>${esc(quote.volume)}</dd></div><div><dt>${tr('未平仓量 OI','Open interest')}</dt><dd>${esc(quote.openInterest)}</dd></div></dl>
      <form id="option-spread-form"><label for="option-spread">${tr('买卖价差','Bid–ask spread')} <span>Ask − Bid =</span></label><div class="spread-input"><input id="option-spread" aria-describedby="spread-units" inputmode="decimal" autocomplete="off"><span id="spread-units">${tr('美元/股','USD/share')}</span></div>
        <button type="submit" id="check-option-spread" class="primary">${tr('核对价差','Check spread')}</button>
        <button class="metric-explain" type="button" data-explain-metric="${tr('这份期权报价的买卖价差怎样反映交易成本？','How does the bid–ask spread on this option quote relate to trading costs?')}">${tr('解释','Explain')}</button>
      </form><p id="option-spread-feedback" class="source-feedback" role="status"></p></section>` : '';
    return `${quoteHTML}<section class="concept-card"><h3>${tr('期权买方的权利','The option buyer’s right')}</h3><p>${tr('买方支付权利金，取得按约定条件买入（Call）或卖出（Put）相关资产的权利，可以选择是否行权。权利金是取得这项权利的成本。','The buyer pays a premium for the right to buy (call) or sell (put) an underlying asset on agreed terms and may choose whether to exercise that right.')}</p><p>${tr('Bid 是买方愿意支付的价格，Ask 是卖方愿意接受的价格。未平仓量 OI 统计尚未平仓的合约，每份合约同时有买方与卖方。成交活跃、Call 数量增加或 OI 上升，都不能单独确定涨跌。','Bid is the price a buyer offers. Ask is the price a seller accepts. Open interest counts outstanding contracts, each with a buyer and a seller. Trading activity, rising call volume or open interest alone cannot establish a price direction.')}</p></section><h3 class="replay-subhead">${tr('两个真实事件','Two real events')}</h3><div class="case-grid">${cases}</div>`;
  }

  function bindOptions(host, quote) {
    if (!host || !quote) return;
    const form = host.querySelector('#option-spread-form'), input = host.querySelector('#option-spread');
    const feedback = host.querySelector('#option-spread-feedback');
    if (!form || !input || !feedback) return;
    input.addEventListener('input', () => {
      feedback.textContent = '';
      delete feedback.dataset.result;
      input.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answer = Math.round(Number(quote.ask) * 100) - Math.round(Number(quote.bid) * 100);
      const typed = input.value.trim();
      const valid = /^(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/.test(typed);
      const correct = valid && Math.round(Number(typed.replace(',', '.')) * 100) === answer;
      feedback.dataset.result = correct ? 'correct' : 'retry';
      input.setAttribute('aria-invalid', String(!correct));
      if (correct) {
        const equation = `${Number(quote.ask).toFixed(2)} − ${Number(quote.bid).toFixed(2)} = ${(answer / 100).toFixed(2)}`;
        feedback.textContent = tr(`正确。${equation} 美元/股。若按卖价买入并立即按买价卖出，每股会损失这段价差。`,`Correct. ${equation} USD/share. Buying at the ask and immediately selling at the bid would cost this spread per share.`);
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches && feedback.animate) {
          feedback.animate([{opacity:.35,transform:'translateY(2px)'},{opacity:1,transform:'translateY(0)'}],{duration:160,easing:'cubic-bezier(.16,1,.3,1)'});
        }
      } else {
        feedback.textContent = valid ? tr('用 Ask 减去 Bid，精确到分。','Subtract bid from ask to the nearest cent.') : tr('请输入美元金额，最多两位小数。','Enter a dollar amount with up to two decimal places.');
      }
    });
  }

  function industryCards() {
    const api = data();
    if (!api) return '';
    return `<section class="industry-judgment"><div class="panel-head"><h2>${tr('五个行业：一个判断与一个反例','Five industries: one judgment and one counter-example')}</h2><span class="source-badge">${tr('真实案例 · 与虚构证券分栏','Real cases · separate from fictional securities')}</span></div><p class="replay-intro">${tr('先写下长期跟踪什么，再写什么新证据会改变短期配置；每个行业都配一个可能推翻简单推断的反例。','State what to track long term, then what new evidence would change the tactical allocation; each industry includes a counter-example that can overturn a simple inference.')}</p><div class="industry-grid">${api.INDUSTRY_CASES.map(item => `<article class="industry-card"><h3>${esc(item.name[en() ? 'en' : 'zh-CN'])}</h3><p><strong>${tr('长期跟踪','Long-term')}:</strong> ${esc(item.longTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('短期证据','Tactical evidence')}:</strong> ${esc(item.shortTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('反例','Counter-example')}:</strong> ${esc(item.counterExample[en() ? 'en' : 'zh-CN'])}</p><p class="footnote">${esc(item.appliesTo[en() ? 'en' : 'zh-CN'])}</p><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('')}</div></section>`;
  }

  function fundamentalsTimeNote() {
    return `<div class="time-basis-note"><h3>${tr('四个时间不要混用','Do not mix four different dates')}</h3><ul><li><strong>${tr('报告期结束','Period end')}</strong>: ${tr('财务数字覆盖的期末。','The end of the period the numbers cover.')}</li><li><strong>${tr('对外公布','Published')}</strong>: ${tr('公告对外发布的日期。','The date the release was published.')}</li><li><strong>${tr('平台首次可见','First visible here')}</strong>: ${tr('本教学平台第一次能引用该报告的日期。','The first date this teaching platform can cite the report.')}</li><li><strong>${tr('估值报价','Price observed')}</strong>: ${tr('P/E 使用的当前教学股价日期。','The date of the teaching price used in P/E.')}</li></ul><p class="footnote">${tr('本页 P/E = 当前教学股价 ÷ 单期每股收益；ROE = 期间净利润 ÷ 期末权益。两者都不是 TTM 口径，缺失值保留为空。','P/E here = current teaching price ÷ period EPS; ROE = period net income ÷ ending equity. Neither is TTM; missing values stay empty.')}</p></div>`;
  }

  document.addEventListener('factorlab:restore', reset);
  document.addEventListener('factorlab:profile', reset);
  window.FactorLabReplayUI = { getContext, renderNews, optionsIntro, bindOptions, industryCards, fundamentalsTimeNote };
})();

;
(function (root) {
  'use strict';

  const languages = {
    'zh-CN': {
      title: '研究小结', intro: '汇总已发生的练习与当前反思，作为课程报告的素材。',
      download: '导出研究小结', reflect: '继续写反思', details: '查看小结与课程交付',
      preview: '打印预览', print: '打印 / PDF', textFile: '下载文本', close: '关闭预览', publication: 'FactorLab · 投研备忘录',
      downloaded: '已发起下载，请在浏览器下载列表查看。', failed: '下载未完成，请重试。',
      boundary: '合成数据教学练习；不证明真实市场有效性或学习效果，也不代表课程交付已完成。',
      sections: ['长期定位', '短期调整', '方法证据', '周期证据', '结果与反思', '课程交付'],
      sectors: ['半导体', '机器人', '先进材料', '清洁能源', 'AI 基础设施', '现金'],
      factors: ['动量', '价值', '质量', '低波动'],
      reasons: { evidence: '证据变化', risk: '风险控制', anchor: '长期定位', valuation: '估值判断' },
      noReflection: '尚未记录反思。请在上方写下你的判断和下一次要验证的问题。',
      noRounds: '尚无已结算轮次。', noBacktest: '本次会话尚未运行回测，或已恢复进度但没有保留运行记录。',
      dirtyBacktest: '因子偏好已修改，尚未重新运行回测；旧结果不计入本小结。',
      method: '独立的 36 个月合成历史实验，使用 6 个月预热；只用当时可得信息排序，前二行业各 50%，每月再平衡，零交易成本。五行业等权作为基准。它与配置练习的 40% 单行业上限和费用规则不同。',
      methodLimit: 'Rank IC 衡量因子排序与随后收益排序的关系。小样本、合成数据与反复调参不能证明现实有效性。',
      longPrompt: '待你补充：我持续看好哪些行业？哪些经营、竞争和周期证据支持长期定位？',
      shortPrompt: '待你补充：本轮为什么偏离长期定位？新证据、费用和集中度怎样影响取舍？',
      cyclePrompt: '待你补充：订单是否转为收入和利润？哪些信息仍是预期，下一轮要核对什么？',
      resultPrompt: '待你补充：结果来自市场、因子、行业还是事件？短期盈利不能直接证明判断正确。',
      ai: 'AI / 自动化：应用可自动回测与核算；在线 AI 是否连接以对话框状态为准。AI 输出仍需对照可见证据核验。',
      weekly: '每周过程：研究问题 → 证据与方法 → 交互实验 → 对照结果 → 反思与下周问题。请保留日期、版本、方法变化和实际反馈。',
      milestones: '课程计划：Week 7（10 月 26–30 日）集成功能；Week 8（11 月 2–6 日）冻结架构；Week 9（11 月 9–13 日）留存测试证据；Week 10（11 月 16–20 日）演示；Week 11（11 月 23–27 日）最终打包。以课程最新通知为准。',
      deliverables: '待人工核对：研究报告、方法与因子功效、周期证据与引用、演示记录、每周过程、个人反思、测试证据和最终版本。导出此文件不会自动提交作业。',
      partner: '伙伴背景：围绕证券研究、资产管理和风险管理说明可解释性、成本及仓位约束。课程原文的 CITIC Securities 与中文“中信建投证券股份有限公司”存在名称冲突，需向课程方核实；不据此声称真实合作或背书。',
      course: '子项目 B：高端制造与尖端科技行业配置，比较长期定位和短期战术。五行业 + 现金、四因子、六轮默认练习。',
      modelCycle: '周期为教学模型标签，不是现实市场判断。', noEvents: '尚无已披露事件。', noEvidence: '尚未打开证据卡。',
      units: '虚拟金额', missing: '—'
    },
    en: {
      title: 'Research summary', intro: 'Collect completed practice and your current reflection as material for the course report.',
      download: 'Export research summary', reflect: 'Continue reflection', details: 'Summary and course deliverables',
      preview: 'Print preview', print: 'Print / PDF', textFile: 'Download text', close: 'Close preview', publication: 'FactorLab · Research memo',
      downloaded: 'Download started. Check your browser downloads.', failed: 'Download did not complete. Please retry.',
      boundary: 'Synthetic teaching exercise. It does not establish market validity, learning outcomes or completion of course deliverables.',
      sections: ['Long-term positioning', 'Tactical adjustment', 'Method evidence', 'Cycle evidence', 'Results and reflection', 'Course deliverables'],
      sectors: ['Semiconductors', 'Robotics', 'Advanced materials', 'Clean energy', 'AI infrastructure', 'Cash'],
      factors: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      reasons: { evidence: 'Changed evidence', risk: 'Risk control', anchor: 'Long-term positioning', valuation: 'Valuation' },
      noReflection: 'No reflection recorded. Use the field above to record your judgment and the next question to test.',
      noRounds: 'No settled rounds yet.', noBacktest: 'No explicit backtest run in this session, or restored progress has no retained run record.',
      dirtyBacktest: 'Factor preferences changed. Rerun the backtest; the previous result is excluded from this summary.',
      method: 'An independent 36-month synthetic-history exercise with six warm-up months. Rank only information available at each decision time. Hold the top two sectors at 50% each, rebalance monthly and assume zero costs. Compare with the equal-sector benchmark. These rules differ from the allocation exercise’s 40% sector cap and trading costs.',
      methodLimit: 'Rank IC compares factor rankings with subsequent return rankings. Synthetic small samples and repeated tuning do not establish real-world validity.',
      longPrompt: 'To write: Which sectors do I favour for the long term, and which operating, competitive and cycle evidence supports that position?',
      shortPrompt: 'To write: Why did I deviate from the long-term position? How did new evidence, costs and concentration affect the trade-off?',
      cyclePrompt: 'To write: Have orders turned into revenue and earnings? Which claims remain expectations, and what should I check next?',
      resultPrompt: 'To write: Did market, factor, sector or event effects explain the outcome? A short-term gain does not prove a sound judgment.',
      ai: 'AI / automation: The app computes backtests and accounting automatically. Check the conversation status for online AI availability. Verify AI claims against visible evidence.',
      weekly: 'Weekly process: question → evidence and method → interactive experiment → compare outcomes → reflection and next question. Retain dates, versions, method changes and actual feedback.',
      milestones: 'Course plan: Week 7 (Oct 26–30) integration; Week 8 (Nov 2–6) architecture freeze; Week 9 (Nov 9–13) test evidence; Week 10 (Nov 16–20) demo; Week 11 (Nov 23–27) final packaging. Confirm against the latest course notice.',
      deliverables: 'Check manually: research report, methods and factor validity, cycle evidence and citations, demo record, weekly process, personal reflection, test evidence and final version. Exporting this file does not submit coursework.',
      partner: 'Partner context: Explain interpretability, costs and position limits through securities research, asset management and risk management. The brief names CITIC Securities alongside the conflicting Chinese name 中信建投证券股份有限公司. Confirm the institution with the course team; no actual partnership or endorsement is asserted.',
      course: 'Subproject B: advanced manufacturing and frontier technology allocation, comparing long-term positioning with tactical choices. Five sectors plus cash, four factors and six default rounds.',
      modelCycle: 'The cycle is a teaching-model label, not a real-market assessment.', noEvents: 'No disclosed events yet.', noEvidence: 'No evidence cards opened yet.',
      units: 'virtual amount', missing: '—'
    }
  };

  function buildReport({ state = {}, envelope = {}, research = null, researchStatus = {}, lang = 'zh-CN', translate = key => key } = {}) {
    lang = lang === 'en' ? 'en' : 'zh-CN';
    const t = languages[lang], en = lang === 'en';
    const choose = (zh, english) => en ? english : zh;
    const number = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString(lang, {minimumFractionDigits: digits, maximumFractionDigits: digits}) : t.missing;
    const percent = value => Number.isFinite(value) ? number(value * 100) + '%' : t.missing;
    const weights = values => Array.isArray(values) ? t.sectors.map((name, index) => name + ' ' + percent(values[index])).join(' / ') : t.missing;
    const reason = value => {
      const parts = String(value || '').split(' · ');
      if (t.reasons[parts[0]]) parts[0] = t.reasons[parts[0]];
      return parts.join(' · ') || choose('尚未记录', 'Not recorded');
    };
    const rows = Array.isArray(state.results) ? state.results : [];
    const progress = choose(`已完成 ${rows.length} / ${state.rounds ?? 6} 轮 · 第 ${state.day ?? 0} 日`, `${rows.length} / ${state.rounds ?? 6} rounds settled · Day ${state.day ?? 0}`);
    const metrics = state.metrics || {};
    const first = state.history?.[0];
    const initial = first && Number.isFinite(first.nav) && first.nav > 0 ? [...first.holdingsBefore.map(value => value / first.nav), first.cashBefore / first.nav] : null;
    const long = [
      t.longPrompt,
      choose('开局长期持有参照：', 'Opening buy-and-hold reference: ') + weights(initial),
      choose('截至当前，相对长期持有参照的差额：', 'Current difference versus opening buy-and-hold: ') + number(state.nav - state.anchorNav) + ' (' + t.units + ')'
    ];
    const short = [
      t.shortPrompt,
      choose('当前实际仓位：', 'Current actual weights: ') + weights(state.weights)
    ];
    if (state.phase === 'decision') short.push(choose('未确认的配置草稿：', 'Unconfirmed allocation draft: ') + weights(envelope.draft));
    short.push(choose('当前记录的理由：', 'Current recorded reason: ') + reason(envelope.reason));
    if (envelope.note) short.push(choose('你的证据说明：', 'Your evidence note: ') + String(envelope.note));
    if(state.phase==='decision'){
      short.push(choose('草案引用：','Draft citations: ')+(envelope.evidenceRefs||[]).join(' / '));
      short.push(choose('草案反证条件：','Draft reconsideration condition: ')+(envelope.falsifierIf||choose('未记录','Not recorded')));
    }
    const method = [t.method, t.methodLimit];
    const ran = researchStatus.hasRun === true && researchStatus.dirty !== true && research;
    if (ran) {
      method.unshift(choose(`本次会话已运行回测：${research.sampleCount} 个月合成样本。`, `Backtest run in this session: ${research.sampleCount} synthetic months.`));
      method.push(choose('研究因子偏好：', 'Research factor preferences: ') + (research.factors || []).map((factor, index) => `${t.factors[index] || factor.id} ${percent(research.preferences?.[factor.id])}`).join(' / '));
      method.push(choose('合成策略收益：', 'Synthetic strategy return: ') + percent(research.strategy?.totalReturn) + choose('；基准收益：', '; benchmark return: ') + percent(research.benchmark?.totalReturn) + choose('；策略最大回撤：', '; strategy max drawdown: ') + percent(research.strategy?.maxDrawdown));
      for (const [index, factor] of (research.factors || []).entries()) method.push(`${t.factors[index] || factor.id} · Rank IC ${number(factor.meanIC, 3)} · ${factor.validMonths} / ${research.sampleCount} ${choose('有效月份', 'valid months')}`);
    } else method.unshift(researchStatus.dirty ? t.dirtyBacktest : t.noBacktest);
    const evidence = (state.evidence || []).filter(item => (state.seen || []).includes(item.id));
    const events = (state.events || []).filter(event => event.startDay <= (state.day ?? 0));
    const cycle = [t.cyclePrompt, t.modelCycle];
    cycle.push(evidence.length ? choose('已打开证据：', 'Opened evidence: ') + evidence.map(item => `${item.id} ${translate(item.titleKey)}`).join(' / ') : t.noEvidence);
    cycle.push(...(events.length ? events.map(event => choose(`第 ${event.startDay} 日：`, `Day ${event.startDay}: `) + translate(event.titleKey) + ' — ' + translate(event.bodyKey)) : [t.noEvents]));
    const results = [
      t.resultPrompt,
      choose('累计组合收益：', 'Cumulative portfolio return: ') + percent(metrics.returnValue),
      choose('累计最大回撤：', 'Cumulative max drawdown: ') + percent(metrics.maxDrawdown),
      choose('年化 Sharpe：', 'Annualized Sharpe: ') + number(metrics.sharpe) + choose('（日频，年化 252，rf 为当日模型政策利率；样本不足或零方差显示 —）', ' (daily observations, annualization 252, rf = daily model policy rate; insufficient or zero-variance samples show —)')
    ];
    if (!rows.length) results.push(t.noRounds);
    for (const row of rows) {
      results.push(choose(`第 ${row.round} 轮`, `Round ${row.round}`) + ' | ' + reason(row.reason) + ' | ' + choose('收益 ', 'return ') + percent(row.returnValue) + ' | ' + choose('相对本轮不调仓 ', 'vs no trade this round ') + number(row.tacticalAmount) + ' | ' + choose('该轮费用 ', 'round costs ') + number(Number.isFinite(row.attribution?.cost) ? -row.attribution.cost : null) + ' (' + t.units + ')');
      if(row.decisionPolicy==='studio'||row.decisionPolicy==='securities'){
        const observedDate=state.ledger?.history?.find(item=>item.day===row.day)?.asOf?.slice(0,10);
        results.push(choose('结算日 ','Settlement ')+(observedDate?observedDate+' · ':'')+'D'+row.day);
        results.push(choose('本轮引用：','Evidence cited this round: ')+(row.evidenceRefs||[]).join(' / '));
        results.push(choose('反证条件：','Reconsideration condition: ')+(row.falsifierIf||choose('未记录','Not recorded')));
        results.push((row.reward?.badges?.includes('badge.recordComplete')?choose('决策记录完整','Decision record complete'):choose('决策记录未完整','Decision record incomplete'))+choose('；过程记录不代表判断正确。','; recording the process does not validate the judgment.'));
      }else if(row.decisionPolicy==='legacy')results.push(choose('历史记录保留旧规则积分。','Historical record retains legacy points.'));
    }
    results.push(choose('你的反思：', 'Your reflection: ') + (String(envelope.reflection || '').trim() || t.noReflection));
    const course = [t.course, t.ai, t.weekly, t.milestones, t.deliverables, t.partner];
    const sections = [long, short, method, cycle, results, course].map((lines, index) => ({title: t.sections[index], lines}));
    return {
      title: t.title, progress, boundary: t.boundary, sections, hasRunBacktest: !!ran,
      text: [t.title, progress, t.boundary, ...sections.flatMap(section => ['', section.title, ...section.lines])].join('\n')
    };
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {buildReport};
    return;
  }
  if (!root.document) return;
  let lastContent = '', scheduled = false;
  const $ = id => document.getElementById(id);
  const language = () => root.FactorLabApp?.getUI().lang === 'en' ? 'en' : 'zh-CN';
  function capture() {
    const lang = language(), source = root.FactorLabSimulation?.TEXTS?.[lang] || {};
    return buildReport({
      state: root.FactorLabApp.getState(),
      envelope: root.FactorLabApp.getEnvelope(),
      research: root.FactorLabWorkspace?.getResearch(),
      researchStatus: root.FactorLabWorkspace?.getResearchStatus?.() || {},
      lang, translate: key => source[key] || key
    });
  }
  function sectionNodes(report){
    const fragment=document.createDocumentFragment();
    for(const section of report.sections){
      const article=document.createElement('section'),heading=document.createElement('h3');
      heading.textContent=section.title;article.append(heading);
      for(const line of section.lines){
        const p=document.createElement('p');p.textContent=line;article.append(p);
      }
      fragment.append(article);
    }
    return fragment;
  }
  function fillPreview(report,t){
    const header=document.createElement('header'),publication=document.createElement('small');
    const title=document.createElement('h2'),progress=document.createElement('p'),boundary=document.createElement('p');
    publication.textContent=t.publication;title.textContent=report.title;
    progress.textContent=report.progress;boundary.textContent=report.boundary;
    header.append(publication,title,progress,boundary);
    $('report-paper').replaceChildren(header,sectionNodes(report));
    $('report-preview').setAttribute('aria-label',t.preview+' · '+report.title);
    $('report-preview-label').textContent=t.preview;
    $('report-print').textContent=t.print;
    $('close-report-preview').textContent=t.close;
  }
  function preparePrint(){
    if(!$('report-preview')?.open)return;
    $('print-report')?.remove();
    const copy=$('report-paper').cloneNode(true);copy.id='print-report';
    document.body.append(copy);document.body.classList.add('printing-report');
  }
  function finishPrint(){
    document.body.classList.remove('printing-report');$('print-report')?.remove();
  }
  function create(){
    const host=$('view-journal');
    if(!host||$('research-report'))return;
    const section=document.createElement('section');
    section.id='research-report';section.className='panel research-report';
    section.setAttribute('aria-labelledby','report-title');
    section.innerHTML='<div class="panel-head"><h2 id="report-title"></h2><span id="report-progress" class="decision-meta"></span></div><p id="report-intro"></p><div class="report-actions"><button id="preview-report" class="secondary"></button><button id="export-report" class="text-button"></button><button id="report-reflect" class="text-button"></button></div><p id="report-feedback" class="footnote" role="status"></p><details id="report-details"><summary id="report-details-label"></summary><p id="report-boundary" class="footnote"></p><div class="report-sections" id="report-sections"></div></details>';
    host.append(section);
    const dialog=document.createElement('dialog');
    dialog.id='report-preview';
    dialog.innerHTML='<div class="preview-toolbar"><strong id="report-preview-label"></strong><div class="preview-actions"><button type="button" id="report-print" class="primary"></button><button type="button" id="close-report-preview"></button></div></div><article id="report-paper" class="report-paper"></article>';
    document.body.append(dialog);
    let previewOpener;
    $('preview-report').addEventListener('click',()=>{
      previewOpener=document.activeElement;
      fillPreview(capture(),languages[language()]);dialog.showModal();dialog.scrollTop=0;
    });
    $('close-report-preview').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{finishPrint();if(!host.hidden)(previewOpener?.isConnected?previewOpener:$('preview-report')).focus({preventScroll:true});});
    $('report-print').addEventListener('click',()=>{preparePrint();window.print();});
    window.addEventListener('beforeprint',preparePrint);
    window.addEventListener('afterprint',finishPrint);
    $('report-reflect').addEventListener('click',()=>{
      $('reflection').focus();$('reflection').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
    $('export-report').addEventListener('click',()=>{
      const t=languages[language()];let url;
      try{
        url=URL.createObjectURL(new Blob(['\uFEFF'+capture().text],{type:'text/plain;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;
        link.download='FactorLab-research-summary-'+new Date().toISOString().slice(0,10)+'.txt';
        document.body.append(link);link.click();link.remove();
        $('report-feedback').textContent=t.downloaded;
      }catch{$('report-feedback').textContent=t.failed;}
      finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}
    });
  }
  function render(){
    scheduled=false;
    if(!root.FactorLabApp||$('view-journal')?.hidden)return;
    create();
    if(!$('research-report'))return;
    const report=capture(),t=languages[language()];
    if(lastContent===report.text)return;
    lastContent=report.text;
    for(const [id,text] of Object.entries({
      'report-title':t.title,'report-intro':t.intro,'report-progress':report.progress,
      'preview-report':t.download,'export-report':t.textFile,'report-reflect':t.reflect,'report-details-label':t.details,
      'report-boundary':report.boundary,'report-feedback':''
    }))$(id).textContent=text;
    $('report-sections').replaceChildren(sectionNodes(report));
    if($('report-preview').open)fillPreview(report,t);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; queueMicrotask(render); }
  }
  for (const type of ['factorlab:render', 'factorlab:save', 'factorlab:profile', 'factorlab:restore', 'factorlab:view', 'factorlab:feedback']) document.addEventListener(type, schedule);
  document.addEventListener('input', event => { if (event.target.matches?.('[data-research-factor]')) schedule(); });
  document.addEventListener('click', event => { if (event.target.closest?.('#reset-backtest')) schedule(); });
  root.FactorLabReport = {build: capture, refresh: schedule};
  schedule();
})(typeof window === 'undefined' ? globalThis : window);

;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const palette = $('command-palette'), query = $('command-query'), results = $('command-results');
  const en = () => document.documentElement.lang === 'en';
  const routes = [
    ['research','行情与证据','Market & evidence'], ['backtest','因子与回测','Factors & backtest'],
    ['portfolio','配置决策','Allocation'], ['risk','风险与归因','Risk & attribution'], ['journal','决策复盘','Decision review']
  ];
  let opener;
  function ask(question) {
    const studio = window.FactorLabStudio;
    if (!studio || !question) return;
    studio.openChat();
    const input = $('question');
    input.value = question;
    input.dispatchEvent(new Event('input', {bubbles:true}));
    if (!$('ask').disabled) $('coach-form').requestSubmit();
    else input.focus({preventScroll:true});
  }
  function addResult(label, action) {
    const row = document.createElement('button');
    row.type = 'button';
    row.textContent = label;
    row.addEventListener('click', () => { palette.close(); action(); });
    results.append(row);
  }
  function filter() {
    const term = query.value.trim(), search = term.toLowerCase();
    results.replaceChildren();
    for (const route of routes.filter(r => r.some(s => s.toLowerCase().includes(search)))) {
      addResult(route[en() ? 2 : 1], () => {
        if (route[0] === 'research') window.FactorLabWorkspace.setEvidenceTab('market');
        void window.FactorLabWorkspace.go(route[0], {focus:true});
      });
    }
    if (term) addResult((en() ? 'Ask the research partner · ' : '问研究伴侣 · ') + term, () => ask(term));
  }
  function open() {
    if (document.documentElement.hasAttribute('data-auth-pending')) return;
    if (palette.open) { palette.close(); return; }
    if (document.querySelector('dialog[open]:not(#coach-drawer)')) return;
    opener = document.activeElement;
    if ($('coach-drawer').open) { $('coach-drawer').close(); opener = $('open-coach'); }
    query.value = '';
    query.placeholder = en() ? 'Find a page or ask a question' : '查找页面，或输入问题';
    filter(); palette.showModal(); query.focus();
  }
  $('open-commands').onclick = open;
  $('open-commands').querySelector('kbd').textContent = /Mac|iPad|iPhone/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  $('command-close').onclick = () => palette.close();
  palette.addEventListener('close', () => {
    if ((!document.activeElement || document.activeElement === document.body) && opener?.isConnected) opener.focus({preventScroll:true});
  });
  query.addEventListener('input', filter);
  palette.addEventListener('keydown', e => {
    if (e.isComposing) return;
    if (e.key === 'Enter' && e.target === query) { e.preventDefault(); results.firstElementChild?.click(); return; }
    if (!['ArrowDown','ArrowUp'].includes(e.key)) return;
    const options = [...results.children];
    if (!options.length) return;
    const current = options.indexOf(document.activeElement);
    const next = current < 0 ? (e.key === 'ArrowDown' ? 0 : options.length-1) : (current + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    e.preventDefault(); options[next].focus();
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing && e.key.toLowerCase() === 'k') {
      e.preventDefault(); if (!e.repeat) open();
    }
  });
  document.addEventListener('click', e => {
    const trigger = e.target.closest('button[data-explain-metric]');
    if (trigger) ask(trigger.dataset.explainMetric);
  });
  const values = new WeakMap();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function number(node, value, format) {
    const last = values.get(node);
    if (last?.target === value && last.lang === document.documentElement.lang) return;
    if (last?.frame) cancelAnimationFrame(last.frame);
    const next = {target:value, current:value, lang:document.documentElement.lang, frame:0};
    values.set(node,next);
    if (!last || !Number.isFinite(value) || !Number.isFinite(last.current) || reduced.matches || document.hidden) {
      node.textContent = format(value); return;
    }
    const start = performance.now(), from = last.current;
    function step(now) {
      const p = reduced.matches ? 1 : Math.min(1, (now-start)/180);
      next.current = p === 1 ? value : value + (from-value)*(1-p)**3;
      node.textContent = format(next.current);
      if (p<1 && node.isConnected) next.frame = requestAnimationFrame(step);
    }
    next.frame = requestAnimationFrame(step);
  }
  window.FactorLabEditorial = {number};
})();

;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const views = ['research', 'portfolio', 'backtest', 'risk', 'journal'];
  const hashView = () => ({evidence:'research',allocation:'portfolio',review:'journal'}[location.hash.replace(/^#\/?/, '')] || location.hash.replace(/^#\/?/, ''));
  const labels = {
    'zh-CN': {
      research: ['行情与资料', ''],
      portfolio: ['配置决策', ''],
      backtest: ['因子与回测', ''],
      risk: ['风险与归因', ''],
      journal: ['决策复盘', ''],
      factorNames: ['动量', '价值', '质量', '低波动'],
      factorHelp: ['动量：过去六个月的涨跌表现', '价值：盈利相对价格的水平（E/P）', '质量：股东投入资本的盈利水平（ROE）', '低波动：过去六个月波动较小'],
      weights: '因子权重', run: '运行回测', reset: '四因子恢复等权', pending: '已预览新偏好。运行回测可记录本次结果。', applied: '36 个月回测完成', invalid: '请将至少一个因子权重设为大于 0。',
      researchNote: '这里只做研究，调整偏好不会改变持仓。', strategy: '策略收益', benchmark: '五行业等权收益', drawdown: '最大回撤', spread: '前二与后二行业的月均收益差', sampleBadge: '合成教学回测 · 36 个月', specTitle: '实验口径（与日频快照分开）', specSample: '5 个行业；6 个月预热后逐月评估 36 个月', specFactors: '四个因子：动量、价值、质量、低波动', specRules: '前二行业各 50%，五行业等权基准；零交易费、不加杠杆', specNote: '证券日频快照只回答“当前可见价格能算哪些信号”；这里回答“四因子排序在这组合成历史中表现如何”。两者不能合并成一个结论。', monthPick: '选择一个样本月，亲自核对一次', monthDetail: '当时的因子排名 → 下一期收益 → 当月 IC', monthLabel: '样本月', sector: '行业', score: '综合分数', nextReturn: '下一期收益', icLabel: '当月 Rank IC', monthHint: '分数越高，事前排序越靠前；IC 衡量分数与随后收益的排序相关性，接近 0 表示关系弱。',
      preview: '等权示例已计算；运行回测后记录本次检验。', factorIntro: '因子是给行业打分的线索；权重越高，排序越重视它。',
      drawdownHelp: '最大回撤：资产从此前最高点下跌最多的幅度。',
      icHelp: '排序相关性越接近 1，打分高的行业随后越倾向涨得好；接近 0 表示关系弱，负值表示相反。',
      validityDetails: '查看差值与样本限制', sampleHelp: '可计算月份只表示数据足以计算，不能当作获利月份或胜率。', tuningHelp: '样本小、反复调参可能产生偶然结果。',
      macroDetails: '查看利率、需求与风险指标', noConclusion: '未披露的信息，暂不下结论。', positioning: '长期定位：你持续看好的行业；短期战术：因本轮新证据做的调整。',
      strategyCurve:'策略净值', benchmarkCurve:'等权基准净值', recordedDetails:'下列因子功效与逐月结果来自上次手动回测。', exampleDetails:'下列因子功效与逐月结果来自初始等权示例。', chartTitle: '36 个月合成历史', chartLabel: '事前因子策略与五行业等权基准净值', firstNav: '初始净值 1', months: '36 个月', factorValidity: '因子打分与随后收益的关系', factor: '因子', ic: '排序相关性（平均 Rank IC）', samples: '可计算月份',
      method: '查看回测规则和逐月结果', methodText: '先用 6 个月形成线索，再逐月用当时已知信息排序。前二行业各 50%，基准五行业各 20%；均每月调仓，免交易费、不加杠杆。',
      limitation: '合成回测，不证明真实市场有效。此实验每行业可达 50%、免交易费，与本轮配置规则不同。',
      month: '样本月', selected: '事前选择', monthlyStrategy: '策略收益', monthlyBenchmark: '基准收益', synthetic: '合成观测', inference: '根据证据判断',
      cycle: '周期观察', rate: '政策利率', growth: '经济增长', credit: '信用压力',
      cycleNote: '周期标签来自教学模型。',
      inferenceText: '看订单、库存和利润是否互相印证。只看价格上涨，不能确认行业复苏。',
      percent: '百分比', source: '来源与课程范围'
    },
    en: {
      research: ['Market & research', ''],
      portfolio: ['Allocation', ''],
      backtest: ['Factors & backtest', ''],
      risk: ['Risk & attribution', ''],
      journal: ['Decision review', ''],
      factorNames: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      factorHelp: ['Prior six-month cumulative return', 'Synthetic E/P known at that time', 'Synthetic ROE known at that time', 'Negative prior six-month volatility'],
      weights: 'Research factor preferences', run: 'Run backtest', reset: 'Equal weights', pending: 'Preferences changed. Run the backtest to record this preview.', applied: '36-month replay complete', invalid: 'At least one factor weight must be positive',
      researchNote: 'This is a method exercise. These preferences do not change holdings.', strategy: 'Strategy return', benchmark: 'Equal-sector return', drawdown: 'Maximum drawdown', spread: 'Top two minus bottom two monthly mean', sampleBadge: 'Synthetic teaching backtest · 36 months', specTitle: 'Experiment specification (separate from the daily snapshot)', specSample: 'Five sectors; 6 warm-up months, then 36 monthly evaluations', specFactors: 'Four factors: momentum, value, quality, low volatility', specRules: 'Top two sectors 50% each; equal-sector benchmark; zero trading costs, no leverage', specNote: 'The daily security snapshot only answers “which signals can current visible prices produce?” This experiment asks “how did the four-factor ranking behave in this synthetic history?” Do not merge them into one conclusion.', monthPick: 'Pick one sample month and check it yourself', monthDetail: 'Factor ranking then → next-period return → that month’s IC', monthLabel: 'Month', sector: 'Sector', score: 'Composite score', nextReturn: 'Next-period return', icLabel: 'Monthly Rank IC', monthHint: 'A higher score ranks earlier before the return. IC measures rank correlation between scores and subsequent returns; near zero means a weak relationship.',
      preview: 'Equal-weight example calculated; run a backtest to record your test.', factorIntro: 'Factors are clues used to score sectors. A higher weight gives a clue more influence.',
      drawdownHelp: 'Maximum drawdown is the largest decline from an earlier asset peak.',
      icHelp: 'Closer to 1 means higher-scored sectors tended to have higher subsequent returns; near 0 means a weak relationship, and a negative value means the reverse.',
      validityDetails: 'View spread and sample limits', sampleHelp: 'Calculable months are months with sufficient data. They are not winning months or a win rate.', tuningHelp: 'Small samples and repeated tuning can produce chance results.',
      macroDetails: 'View rates, demand and risk indicators', noConclusion: 'Do not conclude from information that has not been disclosed.', positioning: 'Long-term positioning is the sector case you maintain; short-term tactics are changes based on new evidence this round.',
      strategyCurve:'Strategy NAV', benchmarkCurve:'Equal-sector NAV', recordedDetails:'Factor efficacy and the monthly records below use your last recorded backtest.', exampleDetails:'Factor efficacy and the monthly records below use the initial equal-weight example.', chartTitle: '36 months of synthetic history', chartLabel: 'Prior-information factor strategy versus equal-sector benchmark NAV', firstNav: 'Initial NAV 1', months: '36 months', factorValidity: 'Factor validity', factor: 'Factor', ic: 'Mean Rank IC', samples: 'Valid months',
      method: 'Method and monthly records', methodText: 'After six warm-up months, rank only information known at each decision time. The top two sectors receive 50% each. The benchmark holds 20% in each sector. Both rebalance monthly with zero costs and no leverage.',
      limitation: 'All history is synthetic. Small samples and repeated tuning cannot establish real-world validity. This method exercise differs from the simulation’s 40% sector cap and trading costs.',
      month: 'Month', selected: 'Prior selection', monthlyStrategy: 'Strategy return', monthlyBenchmark: 'Benchmark return', synthetic: 'Synthetic observation', inference: 'Interpretation',
      cycle: 'Macro conditions and sector judgment', rate: 'Policy rate', growth: 'Economic growth', credit: 'Credit pressure',
      cycleNote: 'The cycle label is produced by a teaching model. It is not a real-market assessment.',
      inferenceText: 'Check orders, inventories and earnings. Rising prices alone do not establish recovery.',
      percent: 'percent', source: 'Sources and course scope'
    }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selectedEvidenceTab = 'market';
  let current = 'research', phase = null, lang = 'zh-CN', initialized = false;
  let entryAnimation = null, settled = Promise.resolve(), preferences = [25, 25, 25, 25], researchResult = null, researchLanguage = null, researchDirty = false, researchRun = false, selectedMonth = 0;
  let resultPreferences = [25, 25, 25, 25], researchEfficacy = false, researchIdentity = null;
  const researchIds = ['Momentum', 'Value', 'Quality', 'LowVol'];
  const executionIds = {Momentum:'momentum', Value:'value', Quality:'quality', LowVol:'lowVol'};
  let previewKey = null, previewResult = null, previewFrame = 0, unsavedPreferences = false;
  const text = () => labels[lang];

  const formats = new Map();
  function numeric(value, digits = 2) {
    if (!Number.isFinite(value)) return '—';
    const key = lang + digits;
    if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(lang, {minimumFractionDigits:digits,maximumFractionDigits:digits}));
    return formats.get(key).format(Math.abs(value) < .5 * 10 ** -digits ? 0 : value);
  }
  const pct = value => Number.isFinite(value) ? numeric(value * 100) + '%' : '—';
  function tone(value, digits=2) {
    if (!Number.isFinite(value) || Math.abs(value) < .5 * 10 ** -digits) return '';
    return value < 0 ? 'negative' : 'positive';
  }
  function signed(value, digits=2, unit='') {
    return Number.isFinite(value) ? (tone(value,digits) === 'positive' ? '+' : '') + numeric(value,digits) + unit : '—';
  }
  function returnText(fraction) {
    return Number.isFinite(fraction) ? signed(fraction * 100, 2, '%') : '—';
  }
  function returnCell(fraction) {
    return `<td class="${tone(fraction * 100)}">${returnText(fraction)}</td>`;
  }
  function explain(question) {
    return `<button type="button" class="metric-explain" data-explain-metric="${esc(question)}" aria-label="${esc(question)}">${lang === 'en' ? 'Explain' : '解释'}</button>`;
  }
  const analyze = weights => window.InvestigationResearch.analyze(Object.fromEntries(researchIds.map((id,i) => [id,weights[i]])));
  function flushPreferences() {
    if (!unsavedPreferences) return;
    unsavedPreferences = false;
    saveResearchProgress();
  }

  function getResearchProgress() {
    return {hasRun:researchRun,dirty:researchDirty,hasEfficacy:researchEfficacy,preferences:[...preferences],resultPreferences:[...resultPreferences]};
  }
  function getResearch() {
    if (!researchResult && researchRun && window.InvestigationResearch) {
      researchResult = analyze(resultPreferences);
    }
    return researchResult;
  }
  function saveResearchProgress() {
    window.FactorLabApp?.setResearchProgress?.(getResearchProgress());
    renderHandoff();
  }
  function restoreResearchProgress() {
    const progress = window.FactorLabApp?.getUI().researchProgress || {};
    const valid = value => Array.isArray(value) && value.length === 4 && value.every(v=>Number.isFinite(v) && v >= 0 && v <= 100);
    preferences = valid(progress.preferences) ? [...progress.preferences] : [25,25,25,25];
    resultPreferences = valid(progress.resultPreferences) && progress.resultPreferences.some(v=>v>0) ? [...progress.resultPreferences] : [25,25,25,25];
    researchRun = progress.hasRun === true;
    researchDirty = progress.dirty === true || preferences.some((value,i)=>value !== resultPreferences[i]);
    researchEfficacy = progress.hasEfficacy === true && researchRun && !researchDirty;
    if (previewFrame) cancelAnimationFrame(previewFrame);
    previewFrame = 0; previewKey = null; previewResult = null; unsavedPreferences = false;
    researchResult = null; researchLanguage = null;
    renderHandoff();
    if (current === 'backtest') renderResearch(true);
  }
  function renderHandoff() {
    const app = window.FactorLabApp, host = $('view-portfolio'); if (!host || !app) return;
    let root = $('allocation-handoff');
    if (!root) { root = document.createElement('details'); root.id = 'allocation-handoff'; root.className = 'allocation-handoff panel'; host.appendChild(root); }
    const en = lang === 'en', t = text(), ui = app.getUI();
    const status = !researchRun ? (en ? 'Not yet tested with your own backtest.' : '尚未运行自己的回测。') : researchDirty ? (en ? 'Preferences changed. The new preview has not been recorded.' : '偏好已更改，新的预览尚未记录。') : (en ? 'Current preferences have a recorded synthetic backtest.' : '当前偏好已完成合成回测。');
    const summary = preferences.map((value,i)=>t.factorNames[i] + ' ' + value).join(en ? ' / ' : ' · ');
    const disabled = app.getState().phase !== 'decision' || ui.busy || !preferences.some(v=>v>0);
    const html = `<summary>${en ? 'Use factor preferences' : '按因子偏好配置'}</summary><a href="#/backtest" data-open-view="backtest">${en ? 'Edit factors' : '调整因子'}</a><p class="handoff-factors">${esc(summary)}</p><p id="handoff-status" role="status">${esc(status)}</p><p class="footnote">${en ? 'Research uses monthly top-two sectors at 50% each with no fees. Execution keeps your cash, caps each sector at 40% and charges trading costs. A draft remains editable until you confirm.' : '研究回测每月选前二行业、各占 50%、免交易费；本轮配置保留现金、单行业上限 40%，并计交易费。生成后仍是草案，须由你确认。'}</p><button id="apply-research-draft" class="secondary" ${disabled ? 'disabled' : ''}>${en ? 'Generate allocation draft from these factors' : '按这些因子生成配置草案'}</button>`;
    if (root.innerHTML === html) return;
    root.innerHTML = html;
    $('apply-research-draft').addEventListener('click',()=>{
      const factors = Object.fromEntries(researchIds.map((id,i)=>[executionIds[id],preferences[i]]));
      app.applyResearchDraft(factors);
    });
  }


  function updateEvidenceNavigation() {
    document.body.dataset.activeEvidenceTab = selectedEvidenceTab;
    const tabs = $('evidence-tabs');
    if (!tabs) return;
    let index = 0;
    tabs.querySelectorAll('button').forEach((button,i) => {
      const active = current === 'backtest' ? button.dataset.openView === 'backtest' : current === 'research' && button.dataset.evidenceTab === selectedEvidenceTab;
      button.classList.toggle('active', active);
      if (active) {
        index = i;
        button.setAttribute('aria-current','page');
      } else button.removeAttribute('aria-current');
    });
    tabs.style.setProperty('--selected-index', index);
  }

  function setEvidenceTab(tab) {
    if (!['market', 'options', 'fundamentals', 'news'].includes(tab) || selectedEvidenceTab === tab) return;
    selectedEvidenceTab = tab;
    updateEvidenceNavigation();
    document.dispatchEvent(new CustomEvent('factorlab:evidence-tab', {detail:{tab}}));
  }

  function updateLabels() {
    const t = text();
    if ($('view-title') && $('view-title').textContent!==t[current][0]) $('view-title').textContent = t[current][0];
    if ($('view-description')) { $('view-description').textContent = t[current][1]; $('view-description').hidden = !t[current][1]; }
    updateEvidenceNavigation();
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === (current==='backtest'?'research':current);
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      const label = button.querySelector('[data-nav-label]');
      if (label && t[button.dataset.view] && label.textContent!==t[button.dataset.view][0]) label.textContent = t[button.dataset.view][0];
    });
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { const copy = lang === 'en' ? el.dataset.en : el.dataset.zh; if (el.textContent !== copy) el.textContent = copy; });
  }

  let resetScroll=false;
  window.addEventListener('scroll',()=>{resetScroll=true;},{passive:true});
  function applyView(view, focus, historyMode = 'replace', animate = false) {
    const started = animate ? window.performance?.now() : null;
    if (resetScroll) {
      window.scrollTo({top:0,left:0,behavior:'instant'});
      resetScroll=false;
    }
    const source=document.activeElement;
    current = view;
    document.body.dataset.currentView = current;
    document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== current; });
    const panel=$('view-'+view);
    if (animate && !reduced() && panel?.animate) {
      entryAnimation = panel.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:140,easing:'cubic-bezier(.16,1,.3,1)'});
      if (Number.isFinite(started)) entryAnimation.startTime=started;
      settled=entryAnimation.finished.catch(()=>{});
    }
    const market = $('shared-market');
    const host = $(current === 'risk' ? 'market-host-risk' : 'market-host-research');
    if (market && host && market.parentElement !== host) host.appendChild(market);
    if ($('evidence-tabs')) $('evidence-tabs').hidden = !['research','backtest'].includes(current);
    updateLabels();
    if (current === 'backtest') renderResearch();
    try { if (historyMode !== 'none' && location.hash !== '#/' + current) history[historyMode === 'push' ? 'pushState' : 'replaceState'](null, '', '#/' + current); } catch {}
    document.dispatchEvent(new CustomEvent('factorlab:view', { detail: { view: current } }));
    const title=$('view-title');
    if (focus && title && source!==title) {
      title.tabIndex=-1;
      const focused=new Promise(done=>requestAnimationFrame(()=>setTimeout(()=>{
        if (current===view && (document.activeElement===source || document.activeElement===document.body)) title.focus({preventScroll:true});
        done();
      },0)));
      settled=Promise.all([settled,focused]).then(()=>{});
    }
  }


  function go(view, options = {}) {
    if (!views.includes(view)) return settled;
    if (current === view && location.hash === '#/' + view) {
      updateEvidenceNavigation();
      return settled;
    }
    flushPreferences();
    entryAnimation?.cancel();
    entryAnimation = null;
    settled = Promise.resolve();
    applyView(view, options.focus === true, options.history || 'push', options.animate !== false);
    return settled;
  }


  function sectorName(id) {
    const sectors = window.InvestigationResearch.SECTORS;
    const index = sectors.findIndex(sector => sector.id === id);
    return lang === 'en' ? ['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure'][index] || id : sectors[index]?.name || id;
  }

  function preview() {
    const key = preferences.join(',');
    if (previewKey !== key) {
      previewKey = key;
      previewResult = preferences.some(value => value > 0)
        ? key === resultPreferences.join(',') ? researchResult : analyze(preferences)
        : null;
    }
    return previewResult;
  }

  function paintPreview() {
    previewFrame = 0;
    if (current !== 'backtest') return;
    const root = $('backtest-content'), host = root?.querySelector('.backtest-chart');
    if (!host) return;
    const a = preview(), t = text();
    const values = a ? [a.strategy.totalReturn, a.benchmark.totalReturn, -a.strategy.maxDrawdown] : [null,null,null];
    root.querySelectorAll('[data-backtest-kpi]').forEach((el,i) => {
      const value = values[i];
      el.className = tone(value * 100);
      if (window.FactorLabEditorial?.number) window.FactorLabEditorial.number(el,value,returnText);
      else el.textContent = returnText(value);
    });
    $('backtest-status').textContent = !a ? t.invalid : researchDirty ? t.pending : researchRun ? t.applied : t.preview;
    const notice = root.querySelector('.backtest-stale');
    notice.hidden = !researchDirty;
    notice.textContent = researchRun ? t.recordedDetails : t.exampleDetails;
    if (!a) {
      FactorVisuals.releaseChart(host);
      host.dataset.chartState = 'empty';
      host.textContent = t.invalid;
      return;
    }
    const rows = a.strategy.nav.map((nav,month) => ({nav,month,benchmarkNav:a.benchmark.nav[month]}));
    if (host.dataset.chartState && host.dataset.chartState !== 'empty') {
      FactorVisuals.updateRows(host, rows);
    } else {
      FactorVisuals.chart(host, {
        rows, series:[{key:'nav',name:t.strategyCurve}, {key:'benchmarkNav',name:t.benchmarkCurve,dash:true}],
        label:t.chartLabel, unit:lang === 'en' ? 'NAV' : '净值', format:v=>numeric(v),
        xLabel:row => (lang === 'en' ? 'Month ' : '样本月 ') + row.month
      });
    }
  }

  function preferencesChanged() {
    unsavedPreferences = true;
    researchDirty = true;
    researchEfficacy = false;
    if (!previewFrame) previewFrame = requestAnimationFrame(paintPreview);
  }

  function fillMonth(a) {
    const host = $('month-detail');
    if (!host || !a.months.length) return;
    selectedMonth = Math.max(0,Math.min(a.months.length - 1,Number(selectedMonth) || 0));
    const t = text(), month = a.months[selectedMonth];
    host.innerHTML = `<div class="month-summary"><span>${esc(t.monthLabel)} ${selectedMonth+1}</span><span>${esc(t.strategy)} <b class="${tone(month.strategyReturn*100)}">${returnText(month.strategyReturn)}</b></span><span>${esc(t.benchmark)} <b class="${tone(month.benchmarkReturn*100)}">${returnText(month.benchmarkReturn)}</b></span></div>
      <div class="table-scroll" tabindex="0" role="region" aria-label="${esc(t.monthDetail)}"><table><thead><tr><th>${esc(t.sector)}</th><th>${esc(t.score)}</th>${t.factorNames.map(n=>`<th>${esc(n)}</th>`).join('')}<th>${esc(t.nextReturn)}</th></tr></thead>
      <tbody>${month.rankings.map(row => `<tr><td>${esc(sectorName(row.id))}</td><td>${numeric(row.score,1)}</td>${researchIds.map(id=>id==='Momentum'?returnCell(row.raw[id]):`<td>${pct(row.raw[id])}</td>`).join('')}${returnCell(month.forward[row.id])}</tr>`).join('')}</tbody></table></div>
      <div class="month-ic"><strong>${esc(t.icLabel)}</strong>${researchIds.map((id,i)=>`<span>${esc(t.factorNames[i])} ${signed(month.ic[id],3)}</span>`).join('')}</div><p class="footnote">${esc(t.monthHint)}</p>`;
  }

  function renderResearch(force = false) {
    const root = $('backtest-content');
    if (!root || !window.InvestigationResearch) return;
    if (researchLanguage === lang && root.querySelector('.backtest-chart') && !force) {
      if (previewKey !== preferences.join(',')) paintPreview();
      return;
    }
    const focusId = root.contains(document.activeElement) ? document.activeElement.id : '';
    const oldChart = root.querySelector('.backtest-chart');
    if (oldChart) FactorVisuals.releaseChart(oldChart);
    if (!researchResult) researchResult = analyze(resultPreferences);
    const a = researchResult, t = text(), en = lang === 'en';
    researchLanguage = lang;
    const questions = en ? ['How is the 36-month strategy return calculated?','What does the equal-sector return compare with?','How large was the strategy’s largest loss from its previous peak?'] :
      ['36 个月的策略累计收益怎样计算？','五行业等权基准收益与策略收益有什么区别？','策略从前期高点到低点的最大跌幅怎样计算？'];
    const inputs = preferences.map((v,i) => `<div class="backtest-factor"><label for="research-weight-${i}">${esc(t.factorNames[i])}</label><output id="research-output-${i}" for="research-weight-${i}">${v}</output><input id="research-weight-${i}" data-research-factor="${i}" type="range" min="0" max="100" step="5" value="${v}" aria-describedby="research-help-${i}"><small id="research-help-${i}">${esc(t.factorHelp[i])}</small></div>`).join('');
    const metrics = [t.strategy,t.benchmark,t.drawdown].map((label,i) => `<div><button class="backtest-metric-label" type="button" data-explain-metric="${esc(questions[i])}" aria-label="${esc(questions[i])}"><span>${esc(label)}</span><span class="metric-info" aria-hidden="true">?</span></button><strong data-backtest-kpi="${i}">—</strong></div>`).join('');
    const monthOptions = a.months.map((m,i)=>`<option value="${i}" ${i===selectedMonth?'selected':''}>${i+1} · ${esc(m.top.map(sectorName).join(en?' / ':'、'))}</option>`).join('');
    root.innerHTML = `<div class="backtest-results">
      <div class="backtest-heading"><div><h2>${esc(t.chartTitle)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><button id="run-backtest" class="primary">${esc(t.run)}</button></div>
      <section class="backtest-summary" aria-label="${esc(t.chartLabel)}">${metrics}</section>
      <div class="backtest-layout">
        <section class="backtest-controls"><h3>${esc(t.weights)}</h3><p class="footnote">${esc(t.factorIntro)}</p>${inputs}
          <div class="backtest-actions"><button id="reset-backtest">${esc(t.reset)}</button></div>
          <p id="backtest-status" class="backtest-status" role="status"></p><p class="footnote">${esc(t.researchNote)}</p></section>
        <section class="backtest-plot"><div class="panel-head"><h3>${esc(t.chartLabel)}</h3><span>${esc(t.firstNav)}</span></div><div class="backtest-chart"></div><p class="footnote">${esc(t.drawdownHelp)}</p></section>
      </div>
      <section class="factor-validity"><h2>${esc(t.factorValidity)}</h2><p class="backtest-stale footnote" hidden></p><p class="footnote">${esc(t.icHelp)}</p>
        <div class="table-scroll"><table><thead><tr><th>${esc(t.factor)}</th><th>${esc(t.ic)}</th><th>${esc(t.samples)}</th></tr></thead><tbody>${a.factors.map((f,i) => `<tr><td>${esc(t.factorNames[i])}</td><td>${signed(f.meanIC,3)}</td><td>${f.validMonths} / ${a.sampleCount}</td></tr>`).join('')}</tbody></table></div>
        ${explain(en ? 'How should I interpret mean Rank IC and the number of valid months in this backtest?' : '在这次合成回测中，如何解读平均 Rank IC 和可计算月份？')}
        <p class="footnote">${esc(t.limitation)}</p>
        <details class="factor-sample-details"><summary>${esc(t.validityDetails)}</summary><p>${esc(t.spread)} <strong class="${tone(a.meanSpread*100,3)}">${signed(a.meanSpread*100,3)} ${en?'percentage points':'个百分点'}</strong></p><p>${esc(t.sampleHelp)}</p><p>${esc(t.tuningHelp)}</p></details></section>
      <section class="month-inspector"><div class="panel-head"><h2>${esc(t.monthPick)}</h2><span class="source-tag">${esc(t.synthetic)}</span></div><p class="footnote">${esc(t.monthDetail)}</p>
        <label for="research-month">${esc(t.monthLabel)} <select id="research-month">${monthOptions}</select></label><div id="month-detail"></div></section>
      <details class="research-spec"><summary>${esc(t.specTitle)}</summary><dl><div><dt>${esc(t.samples)}</dt><dd>${esc(t.specSample)}</dd></div><div><dt>${esc(t.factor)}</dt><dd>${esc(t.specFactors)}</dd></div><div><dt>${esc(t.selected)}</dt><dd>${esc(t.specRules)}</dd></div></dl><p class="footnote">${esc(t.specNote)}</p></details>
      <details class="backtest-method"><summary>${esc(t.method)}</summary><p>${esc(t.methodText)}</p><div class="backtest-months"><table><thead><tr><th>${esc(t.month)}</th><th>${esc(t.selected)}</th><th>${esc(t.monthlyStrategy)}</th><th>${esc(t.monthlyBenchmark)}</th></tr></thead><tbody>${a.months.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.top.map(sectorName).join(en?' / ':'、'))}</td>${returnCell(m.strategyReturn)}${returnCell(m.benchmarkReturn)}</tr>`).join('')}</tbody></table></div></details>
      </div>`;
    fillMonth(a);
    paintPreview();
    $('research-month').addEventListener('change', e => { selectedMonth = Number(e.target.value); fillMonth(a); });
    root.querySelectorAll('[data-research-factor]').forEach(input => {
      input.addEventListener('input', () => {
        const i = Number(input.dataset.researchFactor);
        if (preferences[i] === Number(input.value)) return;
        preferences[i] = Number(input.value);
        $('research-output-'+i).textContent = input.value;
        preferencesChanged();
      });
      input.addEventListener('change', flushPreferences);
    });
    $('run-backtest').addEventListener('click', () => {
      const currentPreview = preview();
      if (!currentPreview) { $('backtest-status').textContent = t.invalid; return; }
      researchResult = currentPreview;
      resultPreferences = [...preferences];
      researchRun = true;
      researchDirty = false;
      researchEfficacy = false;
      unsavedPreferences = false;
      saveResearchProgress();
      renderResearch(true);
      document.dispatchEvent(new CustomEvent('factorlab:feedback', {detail:{kind:'backtest',stage:'success'}}));
    });
    $('reset-backtest').addEventListener('click', () => {
      preferences = [25,25,25,25];
      preferences.forEach((value,i) => { $('research-weight-'+i).value=value; $('research-output-'+i).textContent=value; });
      preferencesChanged();
      flushPreferences();
    });
    root.querySelector('.factor-sample-details').addEventListener('toggle', e => {
      if (e.target.open && researchRun && !researchDirty && !researchEfficacy) { researchEfficacy = true; saveResearchProgress(); }
    });
    if (focusId) $(focusId)?.focus({preventScroll:true});
  }

  function renderCycle(state) {
    const root = $('cycle-notes'); if (!root) return;
    const t = text(), macro = state.macro, wasOpen = root.querySelector('details')?.open;
    root.innerHTML = `<details class="cycle-evidence" ${wasOpen ? 'open' : ''}><summary>${esc(t.macroDetails)}</summary><span class="source-tag" title="${esc(t.cycleNote)}">${esc(t.synthetic)}</span><div class="cycle-row"><span>${esc(t.rate)} <strong>${numeric(macro.rate, 1)}%</strong></span><span>${esc(t.growth)} <strong>${numeric(macro.growth, 1)}%</strong></span><span>${esc(t.credit)} <strong>${numeric(macro.credit, 0)} / 100</strong></span></div><p class="footnote">${esc(t.positioning)}</p><p>${esc(t.inferenceText)}</p></details>`;
  }

  function sync() {
    const app = window.FactorLabApp; if (!app) return;
    const ui = app.getUI(), state = app.getState(), nextLang = ui.lang;
    const changedLanguage = nextLang !== lang;
    lang = nextLang;
    const identity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (researchIdentity !== identity) { researchIdentity = identity; restoreResearchProgress(); }
    updateLabels(); renderCycle(state);
    renderHandoff();
    if (changedLanguage && current === 'backtest') renderResearch(true);
    if (!initialized) {
      initialized = true; phase = state.phase;
      const requested = hashView();
      const initial = views.includes(requested) ? requested : ['review', 'complete'].includes(phase) ? 'journal' : phase === 'event' || state.day === 0 ? 'research' : 'portfolio';
      applyView(initial, false);
      return;
    }
    if (state.phase !== phase) {
      const previous = phase; phase = state.phase;
      if (['review', 'complete'].includes(phase)) go('journal', { focus: true });
      else if (phase === 'event') go('research', { focus: true });
      else if (phase === 'simulating') go('portfolio', { focus: true });
      else if (phase === 'decision' && previous !== null) go('portfolio', { focus: true });
    }
  }

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => go(button.dataset.view, { focus: true })));
  $('evidence-tabs')?.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll('button')], index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].click();
    buttons[next].focus({preventScroll:true});
  });
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-open-view]');
    if (action) { event.preventDefault(); go(action.dataset.openView, { focus: true }); }
  });
  window.addEventListener('hashchange', () => { const requested = hashView(); if (views.includes(requested)) go(requested, {history:'none'}); });
  for (const [openId, closeId, dialogId] of [['open-coach', 'close-coach', 'coach-drawer'], ['open-context', 'close-context', 'course-context']]) {
    $(openId)?.addEventListener('click', () => { document.dispatchEvent(new Event('factorlab:pause')); const dialog = $(dialogId); if(dialogId==='coach-drawer'){window.FactorLabStudio?.openChat();}else dialog.showModal(); });
    $(closeId)?.addEventListener('click', () => $(dialogId).close());
  }
  document.addEventListener('factorlab:render', sync);
  document.addEventListener('factorlab:profile', restoreResearchProgress);
  document.addEventListener('factorlab:restore', restoreResearchProgress);
  document.addEventListener('factorlab:new', restoreResearchProgress);
  window.addEventListener('pagehide', flushPreferences);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushPreferences(); });
  window.FactorLabWorkspace = { go, setEvidenceTab, getView: () => current, get settled() { return settled; }, getResearch, getResearchStatus: getResearchProgress, getResearchProgress };
  sync();
})();

;
(function (root) {
  'use strict';
  const cues = {
    intro: {
      en: ['Welcome to FactorLab.', 'Practice allocating across advanced manufacturing and technology.', 'Start with one piece of evidence, then decide whether to keep or change your teaching allocation.'],
      zh: ['欢迎来到 FactorLab。', '在这里练习高端制造与尖端科技的行业配置。', '先看一条证据，再决定保留还是调整教学配置。']
    },
    evidence: {
      en: ['Start with one piece of evidence.', 'Separate what is confirmed from what still needs checking.'],
      zh: ['先看一条本轮证据。', '区分已经确认的事实，以及仍需核查的说法。']
    },
    confirm: {
      en: ['Check weights, cash and costs, then confirm.', 'Keeping the teaching allocation is also a choice.'],
      zh: ['核对比例、现金和费用后即可确认。', '保留教学配置也是一种选择。']
    },
    allocation: {
      en: ['Review the allocation and sector limits.', 'You can record evidence and reasoning in your decision notes.'],
      zh: ['检查配置比例与行业上限。', '可以在决策笔记中记录证据和判断。']
    },
    event: {
      en: ['A new market update has paused the simulation.', 'Check whether it changes your original reasoning, then continue. Holdings are locked for this round.'],
      zh: ['市场出现新消息，模拟已暂停。', '看看它是否改变了原来的判断，再继续本轮。本轮持仓已锁定。']
    },
    simulation: {
      en: ['Your allocation is confirmed.', 'The simulation will pause when a new update arrives.'],
      zh: ['本轮配置已确认。', '遇到新消息时，模拟会暂停。']
    },
    review: {
      en: ['Compare the result with the benchmark and costs.', 'Revisit your original evidence before starting the next round.'],
      zh: ['对照基准与费用查看本轮结果。', '回看当时的证据，再开始下一轮。']
    },
    course: {
      en: ['The six rounds are complete.', 'Finish a factor backtest and inspect efficacy, then complete your reflection.'],
      zh: ['六轮模拟已经结束。', '完成因子回测与功效查看，再整理最终反思。']
    },
    complete: {
      en: ['Review your course checklist.', 'Summarize long-term positioning, tactical changes and one improvement.'],
      zh: ['核对课程研究清单。', '总结长期定位、战术调整，以及下次想改进的一点。']
    }
  };
  const characters = ['knight','kurumi'];
  const clipFile = (key,character,language) => key+'-'+character+'-'+language+'.mp3';
  const audioFiles = Object.keys(cues).flatMap(key=>characters.flatMap(character=>['en','zh'].map(language=>clipFile(key,character,language))));
  const api = {cues,characters,clipFile,audioFiles};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactorLabGuideContent = api;
})(typeof globalThis === 'undefined' ? this : globalThis);

;
(function (root) {
  'use strict';
  const content = typeof module === 'object' && module.exports ? require('./guide-content.js') : root.FactorLabGuideContent;
  function isNextStepQuestion(question) {
    const text=String(question).trim();
    if(text.length>100)return false;
    return /^(?:我(?:现在|接下来)?(?:该|应该)?(?:先)?(?:做|干)什么|(?:我该)?(?:从哪|怎么|如何)开始|(?:接下来|下一步)(?:该|应该|要)?(?:做什么|怎么做)?|怎么玩)[？?。!！\s]*$/.test(text)
      || /^(?:(?:what|where|how|which)\b.*(?:first|next|start|begin|step)|(?:getting started|next step|how to play|walk me through))[?.!\s]*$/i.test(text);
  }
  function derive(state = {}, ui = {}, progress = {}, lang = 'zh-CN') {
    const en = lang === 'en', round = state.round || 1;
    const make = (kind, zh, english, view, necessary = true) => ({kind, key:kind + ':' + round, text:en ? english : zh, view, necessary});
    let task;
    if (state.phase === 'event') task = make('event','市场有新消息，可以查看后继续。','A market update is available. Read it, then continue.','research');
    else if (state.phase === 'simulating') task = make('simulation','正在模拟本轮表现。','Simulating this round’s performance.','portfolio');
    else if (state.phase === 'review') task = make('review','本轮已结束，查看结果或开始下一轮。','Round complete. View the results or start the next round.','journal');
    else if (state.phase === 'complete') task = !progress.hasRun || progress.dirty || !progress.hasEfficacy
      ? make('course','六轮已结束。补齐课程要求的因子回测与功效查看，再整理最终反思。','Six rounds are complete. Finish the required course backtest and efficacy review, then complete your reflection.','backtest')
      : make('complete','六轮已结束。核对课程清单，整理长期定位、战术调整和最终反思。','Six rounds are complete. Check the course checklist and summarize positioning, tactical changes and your final reflection.','journal');
    else if (ui.gate?.canConfirm) task = make('confirm','核对比例、现金和费用后即可确认。','Check weights, cash and costs, then confirm.','portfolio');
    else task = make('allocation','在配置页检查比例与行业上限。证据和判断可记录在决策笔记中。','Check the allocation and sector limits. Evidence and rationale can go in your decision notes.','portfolio');
    const reminders = [task];
    if (progress.dirty) reminders.push(make('research-dirty','因子偏好已变化；当前图表仍是上次结果，重新回测后才能用于本次检验。','Factor preferences changed. The chart still shows the previous result; rerun the backtest for the current preferences.','backtest',false));
    if ((!progress.hasRun || !progress.hasEfficacy) && state.phase !== 'complete') reminders.push(make('course','本轮回测可选；最终课程练习仍需完成一次因子回测并查看功效。','Backtesting is optional each round. The final course exercise still requires a backtest and an efficacy review.','backtest',false));
    if (state.phase === 'decision' && ui.guide && !ui.guide.viewed && !ui.guide.skipped) {
      task = make('evidence', '', '', 'research');
      task.target = {evidenceId:state.evidence?.[0]?.id || 'E1'};
      reminders[0] = task;
    }
    if (state.phase === 'event') {
      task.target = {eventId:state.events?.at(-1)?.id};
      task.key += ':' + (task.target.eventId || state.day);
    }
    const copy = content?.cues[task.kind];
    if (copy) {
      task.en = copy.en.join(' ');
      task.zh = copy.zh.join('');
      task.text = en ? task.en : task.zh;
      task.clip = task.kind;
    }
    task.target ||= {};
    return {task,reminders};
  }

  function feedback(state, event, lang = 'zh-CN', progress) {
    if (event.round !== undefined && event.round !== state.round) return null;
    if (event.kind === 'backtest' && progress && (!progress.hasRun || progress.dirty || progress.hasEfficacy)) return null;
    const en = lang === 'en', kind = event.kind;
    let text, motion = null;
    if (kind === 'settlement') {
      const complete = state.phase === 'complete';
      text = complete ? (en ? 'Six rounds settled. Review the course checklist and final reflection.' : '六轮结算完成，请核对课程清单并整理最终反思。') : (en ? 'Round settled. Compare the result with the benchmark, costs and original evidence.' : '本轮已结算，请对照基准、费用与原来的证据复盘。');
      motion = complete ? 'milestone' : null;
    } else if (kind === 'citation') text = en ? 'Evidence references updated. Check whether they support your judgment.' : '证据引用已更新，请核对它是否支持你的判断。';
    else if (kind === 'draft') text = en ? 'Allocation draft updated. Review cash, sector limits and costs before confirming.' : '配置草案已更新，确认前请核对现金、行业上限与费用。';
    else if (kind === 'gate') { text = en ? 'Check the current task for the remaining decision requirements.' : '请按当前任务补齐决策记录。'; motion = 'caution'; }
    else if (kind === 'backtest') text = en ? 'Backtest updated. Review efficacy and sample limits before drawing a conclusion.' : '回测已更新，请查看因子功效和样本限制后再下结论。';
    else return null;
    const feedbackKind = kind === 'settlement' && state.phase === 'complete' ? 'completion' : kind;
    return {kind:feedbackKind,key:feedbackKind + ':' + state.round,text,motion,necessary:kind === 'gate',phase:state.phase,round:state.round};
  }

  function createSession() {
    let reminders = [];
    const shown = new Map();
    return {
      update(plan, now = Date.now(), focus = false) {
        const active = new Map(plan.reminders.map(item => [item.key,item]));
        reminders = reminders.filter(item => active.has(item.key)).map(item => ({...active.get(item.key),at:item.at}));
        for (const item of plan.reminders) {
          if (focus && !item.necessary) continue;
          if (reminders.some(old => old.key === item.key)) continue;
          if (now - (shown.get(item.kind) ?? -Infinity) < 60000) continue;
          shown.set(item.kind,now);
          reminders.push({...item,at:now});
        }
        reminders = reminders.slice(-5);
        return {task:plan.task,reminders:reminders.filter(item => !focus || item.necessary).map(item => ({...item})),focus};
      },
      dismiss(key) { reminders = reminders.filter(item => item.key !== key); },
      reset() { reminders = []; shown.clear(); }
    };
  }

  const api = {derive,feedback,createSession,isNextStepQuestion};
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  root.FactorLabGuidance = api;
  const $ = id => document.getElementById(id), session = createSession();
  let identity = null, focus = false, lastFeedback = null, lastFeedbackAt = 0, lastFeedbackEvent = null, snapshot = null;
  const feedbackShown = new Map();
  let guideViewed = false, guideSkipped = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const preferenceKey = () => 'factorlab-guidance-focus:' + (root.FactorLabApp?.getUI().profileId ?? 'guest');
  function reset() {
    session.reset(); feedbackShown.clear(); lastFeedback = null; lastFeedbackEvent = null;
    guideViewed = false; guideSkipped = false;
    try { focus = localStorage.getItem(preferenceKey()) === 'on'; } catch { focus = false; }
  }
  function sync(event) {
    const app = root.FactorLabApp; if (!app) return;
    const state = app.getState(), ui = app.getUI(), lang = ui.lang, en = lang === 'en';
    if (event && ((event.campaignEpoch !== undefined && event.campaignEpoch !== ui.campaignEpoch) || (event.round !== undefined && event.round !== state.round))) return;
    const nextIdentity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (identity !== nextIdentity) { identity = nextIdentity; reset(); }
    const progress = root.FactorLabWorkspace?.getResearchProgress?.() || ui.researchProgress || {};
    const guide = {viewed:guideViewed || !!state.seen?.length || state.day > 0,skipped:guideSkipped};
    const plan = derive(state,{...ui,guide},progress,lang), now = Date.now();
    let announced = null;
    const candidate = event ? feedback(state,event,lang,progress) : null;
    if (candidate && now - (feedbackShown.get(candidate.kind) ?? -Infinity) >= 60000) {
      lastFeedbackEvent = event; lastFeedback = candidate; lastFeedbackAt = now;
      feedbackShown.set(candidate.kind,now); announced = lastFeedback;
    }
    if (lastFeedback && (lastFeedback.phase !== state.phase || lastFeedback.round !== state.round || now - lastFeedbackAt >= 60000)) { lastFeedback = null; lastFeedbackEvent = null; }
    if (lastFeedback) {
      lastFeedback = feedback(state,lastFeedbackEvent,lang,progress);
      if (lastFeedback && (lastFeedback.kind !== 'gate' || ui.gate?.status !== 'ready')) plan.reminders.push(lastFeedback);
      else { lastFeedback = null; lastFeedbackEvent = null; }
    }
    snapshot = session.update(plan,now,focus);
    document.body.dataset.partnerFocus = focus ? 'on' : 'off';
    if ($('partner-focus')) $('partner-focus').checked = focus;
    const activityBox=$('coach-activity');
    if(activityBox&&activityBox.dataset.task!==snapshot.task.key){
      activityBox.dataset.task=snapshot.task.key;
      if($('coach-activity-explanation'))$('coach-activity-explanation').hidden=true;
    }
    const pin = $('coach-current-guide');
    if (pin && pin.dataset.task !== snapshot.task.key + lang) {
      pin.dataset.task=snapshot.task.key+lang;
      pin.innerHTML = `<p>${esc(snapshot.task.text)}</p><button class="text-button" data-guide-action>${actionLabel(snapshot.task,lang)}</button>`;
    }
    let firstStep = $('research-first-step');
    if (!firstStep) {
      firstStep = document.createElement('section');
      firstStep.id = 'research-first-step';
      firstStep.className = 'research-start';
      $('view-research')?.prepend(firstStep);
    }
    firstStep.hidden = state.day > 0 || state.phase !== 'decision' || snapshot.task.kind !== 'evidence';
    const firstEvidence = state.evidence?.[0];
    const heading = en ? 'Begin with the evidence you have' : '先看眼前这条证据';
    const title = firstEvidence ? root.FactorLabStrings?.[lang]?.[firstEvidence.titleKey] || root.FactorLabSimulation?.TEXTS?.[lang]?.[firstEvidence.titleKey] : '';
    const detail = en ? 'Read one observation, check its timing and decide what it supports. You can keep the initial weights or adjust them.' : '读一条观测，核对它在何时可见，再判断它支持什么。可以保留初始比例，也可以调整。';
    const firstStepHTML = `<h2>${heading}</h2>${title?`<p><strong>${esc(title)}</strong></p>`:''}<p>${detail}</p><div class="partner-actions"><button class="primary" data-guide-first-evidence>${en?'Read the evidence':'查看本轮证据'}</button><button class="text-button" data-guide-skip-evidence>${en?'Go straight to allocation':'直接配置'}</button></div>`;
    if(firstStep.innerHTML!==firstStepHTML)firstStep.innerHTML=firstStepHTML;
    const list = $('partner-reminders');
    if (list) {
      const html = snapshot.reminders.map(item=>`<li data-guidance-kind="${esc(item.kind)}"><p>${esc(item.text)}</p><button class="text-button" data-dismiss-guidance="${esc(item.key)}" aria-label="${en ? 'Dismiss reminder' : '收起这条提示'}">${en ? 'Dismiss' : '收起'}</button></li>`).join('');
      if (list.innerHTML !== html) list.innerHTML = html;
      list.hidden = !snapshot.reminders.length;
    }
    document.dispatchEvent(new CustomEvent('factorlab:guidance',{detail:{...snapshot,feedback:announced,activeFeedback:lastFeedback}}));
  }
  document.addEventListener('click',event=>{
    if (event.target.closest('[data-guide-first-evidence]')) root.FactorLabApp.openEvidence(root.FactorLabApp.getState().evidence?.[0]?.id || 'E1');
    if (event.target.closest('[data-guide-skip-evidence]')) {guideSkipped=true;sync();void root.FactorLabWorkspace.go('portfolio',{focus:true});}
    if (event.target.closest('[data-guide-action]')) void activate();
    if (event.target.closest('[data-open-partner]')) $('open-coach')?.click();
    const dismiss = event.target.closest('[data-dismiss-guidance]');
    if (dismiss) { session.dismiss(dismiss.dataset.dismissGuidance); sync(); }
  });
  function actionLabel(task,lang) {
    const en = lang === 'en';
    if (task.kind === 'evidence') return en ? 'Read one piece of evidence' : '查看本轮证据';
    if (task.kind === 'event') return en ? 'Open the new update' : '查看新证据';
    if (task.view === 'portfolio') return en ? 'Review allocation' : '制定本轮配置';
    if (task.view === 'backtest') return en ? 'Open factor backtest' : '查看因子回测';
    return en ? 'Go to task' : '前往当前任务';
  }
  async function activate() {
    if (!snapshot) return;
    root.FactorLabCompanionGuide?.dismiss();
    const task = snapshot.task;
    const epoch = root.FactorLabApp.getUI().campaignEpoch;
    if ($('coach-drawer')?.open) $('coach-drawer').close();
    await root.FactorLabWorkspace.go(task.view,{focus:true});
    if (epoch !== root.FactorLabApp.getUI().campaignEpoch || snapshot.task.key !== task.key) return;
    if (task.target.eventId) {
      const card = [...document.querySelectorAll('#events [data-event-id]')].find(el=>el.dataset.eventId===task.target.eventId);
      if (card) {
        card.tabIndex = -1;
        card.scrollIntoView({block:'center',behavior:'instant'});
        card.focus({preventScroll:true});
        card.classList.add('guide-target');
        setTimeout(()=>card.classList.remove('guide-target'),1800);
      }
    } else if (task.target.evidenceId) root.FactorLabApp.openEvidence(task.target.evidenceId);
  }
  document.addEventListener('factorlab:material-open',()=>{guideViewed=true;sync();});
  $('partner-focus')?.addEventListener('change',()=>{
    focus = $('partner-focus').checked;
    try { localStorage.setItem(preferenceKey(),focus ? 'on' : 'off'); } catch {}
    sync();
  });
  for (const name of ['factorlab:render','factorlab:research-progress','factorlab:view']) document.addEventListener(name,()=>sync());
  for (const name of ['factorlab:restore','factorlab:profile','factorlab:new']) document.addEventListener(name,()=>{reset();sync();});
  document.addEventListener('factorlab:decision-feedback',event=>sync(event.detail));
  document.addEventListener('factorlab:feedback',event=>{if(event.detail.kind === 'backtest') sync(event.detail);});
  api.getState = () => snapshot;
  api.activate = activate;
  api.actionLabel = actionLabel;
  api.skip = () => {guideSkipped=true;sync();};
  api.refresh = () => sync();
  sync();
})(typeof globalThis !== 'undefined' ? globalThis : this);

;
(function () {
  'use strict';
  const scriptBase = new URL('.', document.currentScript.src);
  const mediaBase = new URL('assets/guide/', scriptBase);
  const guideContent = window.FactorLabGuideContent;
  const content = guideContent.cues;
  const $ = id => document.getElementById(id);
  const selectedCharacter = () => $('research-pet')?.value === 'kurumi' ? 'kurumi' : 'knight';
  const soundKey = 'factorlab-companion-sound-v1';
  const voiceKey = 'factorlab-companion-voice-v1';
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key,value); } catch {} };
  const audio = new Audio();
  audio.preload = 'none';
  let voice = read(voiceKey,'en');
  if (!['en','zh'].includes(voice)) voice = 'en';
  let sound = read(soundKey,'on') !== 'off', sessionMuted = false;
  const panel = $('companion-guide'), drawer = $('coach-drawer');
  let task, activeKey = '', subtitleIndex = -1, revision = 0;
  let opening = false, destroyed = false;
  let metadata, identity;
  let playbackCleanup = () => {};
  let metadataReady;
  function loadMetadata() {
    metadataReady ||= fetch(new URL('timings.json',mediaBase)).then(r=>r.ok?r.json():null).then(value=>metadata=value).catch(()=>null);
    return metadataReady;
  }

  function stopAudio() {
    revision++;
    playbackCleanup();
    playbackCleanup = () => {};
    audio.pause();
    activeKey = '';
    if (panel) panel.dataset.speaking = 'false';
  }
  function copy() { return content[opening ? 'intro' : task?.clip] || content.evidence; }
  function subtitle(index) {
    const lines = copy();
    const next = Math.max(0,Math.min(index,lines.en.length-1));
    if (subtitleIndex === next) return;
    subtitleIndex = next;
    $('guide-caption-en').textContent = lines.en[next];
    $('guide-caption-zh').textContent = lines.zh[next];
  }
  function showTaskText() {
    subtitleIndex = -1;
    if (opening) subtitle(0);
    else {
      $('guide-caption-en').textContent = task?.en || content.evidence.en.join(' ');
      $('guide-caption-zh').textContent = task?.zh || content.evidence.zh.join('');
    }
  }
  function labels() {
    const en = document.documentElement.lang === 'en';
    $('guide-title').textContent = en ? 'Voice guidance' : '语音引导';
    $('guide-mute').textContent = sound && !sessionMuted ? (en?'Mute':'静音') : (en?'Sound on':'开启声音');
    $('guide-mute').setAttribute('aria-pressed',String(!sound || sessionMuted));
    $('guide-read').textContent = en ? 'Play guidance' : '听引导';
    $('guide-voice').value = voice;
    $('guide-audio-enabled').checked = sound;
  }
  function finishOpening() {
    opening = false;
    showTaskText();
  }
  async function speak() {
    stopAudio();
    if (!sound || document.hidden || !panel.open || !drawer.open || destroyed) return;
    const token = revision;
    void loadMetadata();
    const key = opening ? 'intro' : task.clip;
    const character = selectedCharacter();
    activeKey = key;
    subtitleIndex = -1;
    subtitle(0);
    $('guide-status').textContent = '';
    $('guide-read').hidden = false;
    const valid = () => token === revision && panel.open && drawer.open && !document.hidden && !destroyed;
    const onTime = () => {
      if (!valid()) return;
      const clip = metadata?.clips[key]?.[character]?.[voice];
      if (clip) subtitle(Math.max(0,clip.segments.findLastIndex(s=>audio.currentTime>=s.start)));
    };
    const onPlaying = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'true';
      $('guide-status').textContent = voice === 'en' ? (character === 'knight' ? 'US English · male voice · bilingual captions' : 'US English · cute female voice · bilingual captions') : (character === 'knight' ? '中文语音 · 男声 · 双语字幕' : '中文语音 · 女声 · 双语字幕');
      $('guide-read').hidden = true;
      document.dispatchEvent(new CustomEvent('factorlab:guide-speaking',{detail:{key,voice,character,at:performance.now()}}));
    };
    const onError = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'false';
      $('guide-read').hidden = false;
      $('guide-status').textContent = document.documentElement.lang==='en'?'Audio unavailable. You can continue with the captions.':'语音暂不可用，可按字幕继续。';
      showTaskText();
    };
    const onEnded = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'false';
      $('guide-read').hidden = false;
      if (opening) finishOpening(); else showTaskText();
    };
    for (const [name,fn] of [['timeupdate',onTime],['playing',onPlaying],['error',onError],['ended',onEnded]]) audio.addEventListener(name,fn);
    playbackCleanup = () => {
      for (const [name,fn] of [['timeupdate',onTime],['playing',onPlaying],['error',onError],['ended',onEnded]]) audio.removeEventListener(name,fn);
    };
    audio.src = new URL(guideContent.clipFile(key,character,voice),mediaBase);
    audio.currentTime = 0;
    const loading = setTimeout(()=>{
      if (valid() && audio.paused) $('guide-status').textContent = document.documentElement.lang==='en'?'Tap Play guidance to hear the introduction.':'点击“听引导”即可播放。';
    },1200);
    const clean = playbackCleanup;
    playbackCleanup = () => {clearTimeout(loading);clean();};
    try { await audio.play(); }
    catch (error) {
      if (!valid()) return;
      $('guide-read').hidden = false;
      $('guide-status').textContent = error.name==='NotAllowedError'
        ? (document.documentElement.lang==='en'?'Tap Play guidance to enable sound.':'点击“听引导”开启声音。')
        : (document.documentElement.lang==='en'?'Audio is unavailable. Captions remain available.':'语音暂不可用，字幕仍可使用。');
      showTaskText();
    }
  }
  function close() {
    stopAudio();
    opening = false;
    panel.open = false;
    $('guide-read').hidden = false;
  }
  function replay() {
    if (!task || destroyed) return;
    window.FactorLabStudio.openChat();
    opening = true;
    sessionMuted = false;
    panel.open = true;
    labels(); showTaskText();
    if (sound) void speak();
  }
  function sync(snapshot) {
    if (!snapshot?.task || destroyed) return;
    const ui = window.FactorLabApp.getUI();
    const nextIdentity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (identity && identity !== nextIdentity) close();
    identity = nextIdentity;
    if (task?.key !== snapshot.task.key && !opening) stopAudio();
    task = snapshot.task;
    labels();
    if (!activeKey) showTaskText();
  }
  $('guide-read').onclick = () => {sound=true;sessionMuted=false;write(soundKey,'on');labels();void speak();};
  $('guide-mute').onclick = () => {sound=!sound;write(soundKey,sound?'on':'off');labels();if(sound)void speak();else {stopAudio();$('guide-read').hidden=false;showTaskText();}};
  $('guide-voice').onchange = () => {voice=$('guide-voice').value;write(voiceKey,voice);if(sound)void speak();};
  $('research-pet').addEventListener('change',()=>{if(activeKey)void speak();});
  $('replay-opening').onclick = () => {$('settings-dialog').close();replay();};
  $('guide-audio-enabled').onchange = event => {sound=event.target.checked;write(soundKey,sound?'on':'off');if(!sound)stopAudio();labels();};
  panel.addEventListener('toggle',()=>{if(!panel.open){stopAudio();finishOpening();}else if(!activeKey)showTaskText();});
  drawer.addEventListener('close',close);
  document.addEventListener('factorlab:guidance',event=>sync(event.detail));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();});
  window.addEventListener('pagehide',event=>{close();if(!event.persisted)destroyed=true;});
  window.FactorLabCompanionGuide = {replay,close,dismiss:close,getState:()=>({opening,voice,character:selectedCharacter(),sound,sessionMuted,activeKey,visible:drawer.open&&panel.open,audioSource:audio.currentSrc||audio.src,audioTime:audio.currentTime,audioDuration:audio.duration,audioPaused:audio.paused})};
  sync(window.FactorLabGuidance.getState());
})();
