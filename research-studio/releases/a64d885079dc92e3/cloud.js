(function(root){
  'use strict';
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
    engine=engine?.createSecuritiesEngine?engine.createSecuritiesEngine():engine?.createResearchStudioEngine?engine.createResearchStudioEngine():engine;
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
      const result=await builder.abortSignal(AbortSignal.timeout(15000));guard(snapshot);
      if(result.error){const code=result.error.code;throw error(code==='23505'?409:code==='42501'?403:code==='PGRST301'?401:422,code||'save_failed');}
      return result.data;
    }
    function validateEnvelope(envelope){
      try{if(envelope?.version!=='factorlab-ui-v3'||new TextEncoder().encode(JSON.stringify(envelope)).length>480000)throw Error();const state=engine.restore(envelope.game);return {...envelope,...normalizeStudioFields(envelope,state)};}catch{throw error(422,'invalid_save');}
    }
    function metadata(row){
      let day='—',round='—',scenario='baseline';
      try{const s=engine.restore(row.envelope?.game);day=s.day;round=s.round;scenario=s.scenario;}catch{}
      return {id:row.id,name:row.name,revision:row.revision,updatedAt:row.updated_at,day,round,scenario};
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
        const s=await session();if(!s.value)return userView(null);
        const {data,error:failure}=await client.auth.getUser();guard(s);
        if(failure)throw error(failure.status===401||failure.status===403?401:503,'session_unavailable');
        return userView(data.user);
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
      const response=await fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+s.value.access_token,'Content-Type':'application/json'},body:JSON.stringify({...body,stream:true}),signal});
      const parser=root.FactorLabCoachStream||(typeof require==='function'?require('./coach-stream.js'):null);
      const result=await parser.consume(response,(type,value)=>{guard(s);onEvent?.(type,value);},signal);guard(s);return result;
    }
    return {request,coach,coachStream,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={create,normalizeStudioFields};return;}
  if(!root.FactorLabCloudConfig||!root.supabase?.createClient)return;
  const config=root.FactorLabCloudConfig;
  const client=root.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'factorlab-supabase-session-v1'},global:{fetch:(url,init={})=>fetch(url,{...init,signal:init.signal||AbortSignal.timeout(15000)})}});
  root.FactorLabCloud=create({client,config,engine:root.FactorLabSimulation,fetchImpl:fetch,recoveryClientFactory:()=>root.supabase.createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'factorlab-recovery-memory'},global:{fetch:(url,init={})=>fetch(url,{...init,signal:init.signal||AbortSignal.timeout(15000)})}})});
})(typeof window==='undefined'?globalThis:window);
