(function(root){
  'use strict';
  function safeReturn(value,href){
    const here=new URL(href),base=new URL('./',here),fallback=base.pathname+'#/portfolio';
    try{const next=new URL(value||fallback,here);if(next.origin!==here.origin||![base.pathname,base.pathname+'index.html'].includes(next.pathname))return fallback;const hash=/^#\/(research|portfolio|backtest|risk|journal|evidence|allocation|review)$/.test(next.hash)?next.hash:'#/portfolio';return next.pathname+hash;}catch{return fallback;}
  }
  if(typeof module==='object'&&module.exports){module.exports={safeReturn};return;}
  const $=id=>document.getElementById(id),cloud=root.FactorLabCloud,cloudMode=!!root.FactorLabCloudConfig;
  const staticHosting=document.querySelector('meta[name="factorlab-hosting"]')?.content==='static'&&!cloudMode;
  const selfService=cloudMode&&root.FactorLabCloudConfig.selfService===true,guestKey='factorlab-v3-guest-session';
  let lang='zh-CN',mode=new URLSearchParams(location.search).get('mode')||'login',busy=true,enabled=false,csrf='',unconfirmed=false,leaving=false;
  let message='',messageError=false;const cooldowns=new Map();
  if(!['login','register','forgot'].includes(mode))mode='login';
  try{lang=localStorage.getItem('factorlab-simulation-language-v3')==='en'?'en':'zh-CN';}catch{}
  const tr=(zh,en)=>lang==='en'?en:zh;
  const strings={login:['欢迎回来','Welcome back'],register:['创建你的账号','Create your account'],forgot:['找回密码','Reset your password'],verify:['查看你的邮箱','Check your email'],reset:['设置新密码','Set a new password']};
  const intros={login:['继续你的投资练习。','Continue your investment practice.'],register:['用邮箱开始，验证后进入 FactorLab。','Start with your email, then verify it to enter FactorLab.'],forgot:['我们会发送重设密码的验证码。','We’ll send a code to reset your password.'],verify:['输入邮件里的验证码，完成注册。','Enter the code from your email to complete registration.'],reset:['验证邮箱并设置新密码，原账号与存档会保留。','Verify your email and set a new password. Your account and saves stay intact.']};
  const submitLabels={login:['登录','Sign in'],register:['创建账号','Create account'],forgot:['发送验证码','Send code'],verify:['验证并进入','Verify & continue'],reset:['更新密码','Update password']};
  function status(text,error=false){message=text;messageError=error;$('auth-status').textContent=text;$('auth-status').classList.toggle('error',error);}
  function cooldownKey(){return(mode==='reset'?'reset:':'verify:')+$('auth-email').value.trim().toLowerCase();}
  function paint(){
    document.documentElement.lang=lang;document.title=strings[mode][lang==='en'?1:0]+' · FactorLab';$('auth-language').value=lang;
    document.querySelectorAll('[data-zh]').forEach(el=>el.textContent=lang==='en'?el.dataset.en:el.dataset.zh);
    $('auth-title').textContent=strings[mode][lang==='en'?1:0];$('auth-subtitle').textContent=intros[mode][lang==='en'?1:0];
    $('email-label').textContent=cloudMode?tr('邮箱','Email'):tr('用户名','Username');$('auth-email').type=cloudMode?'email':'text';$('auth-email').placeholder=cloudMode?'you@example.com':tr('你的用户名','Your username');
    $('password-field').hidden=['forgot','verify'].includes(mode);$('confirm-field').hidden=!['register','reset'].includes(mode);$('code-field').hidden=!['verify','reset'].includes(mode)&&!unconfirmed;$('auth-code').hidden=unconfirmed&&mode==='login';$('code-field').querySelector('label').hidden=$('auth-code').hidden;
    $('password-label').textContent=mode==='reset'?tr('新密码','New password'):tr('密码','Password');$('auth-password').autocomplete=['register','reset'].includes(mode)?'new-password':'current-password';
    $('auth-password').required=!$('password-field').hidden;$('auth-confirm-password').required=!$('confirm-field').hidden;$('auth-code').required=!$('code-field').hidden;
    $('auth-forgot').hidden=!selfService||mode!=='login';$('auth-forgot').textContent=tr('忘记密码？','Forgot password?');
    $('auth-switch').hidden=mode!=='login'||cloudMode&&!selfService||!enabled;$('auth-switch-caption').hidden=$('auth-switch').hidden;$('auth-switch-caption').textContent=tr('还没有账号？','New to FactorLab?');$('auth-switch').textContent=tr('创建账号','Create account');
    $('auth-back').hidden=mode==='login';$('auth-back').textContent=tr('返回登录','Back to sign in');
    $('auth-submit').textContent=busy?tr('请稍候…','Please wait…'):submitLabels[mode][lang==='en'?1:0];
    $('auth-form').setAttribute('aria-busy',String(busy));$('auth-form').querySelectorAll('input,button').forEach(el=>el.disabled=busy||!enabled);$('auth-switch').disabled=busy;$('auth-back').disabled=busy;$('auth-guest').disabled=busy;$('auth-language').disabled=busy;
    for(const [button,input] of [['auth-password-toggle','auth-password'],['auth-confirm-toggle','auth-confirm-password']]){$(button).setAttribute('aria-pressed',String($(input).type==='text'));$(button).textContent=$(input).type==='password'?tr('显示','Show'):tr('隐藏','Hide');$(button).setAttribute('aria-label',$(input).type==='password'?tr('显示密码','Show password'):tr('隐藏密码','Hide password'));}
    $('auth-status').textContent=message;$('auth-status').classList.toggle('error',messageError);updateResend();paintMotion();
  }
  function updateResend(){const remaining=Math.max(0,Math.ceil(((cooldowns.get(cooldownKey())||0)-Date.now())/1000));$('auth-resend').textContent=remaining?tr(remaining+' 秒后可重发','Resend in '+remaining+'s'):tr('重新发送','Resend code');$('auth-resend').disabled=busy||!enabled||remaining>0;}
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
  function enter(guest=false){
    if(leaving)return;leaving=true;clearSensitive();
    try{if(guest)sessionStorage.setItem(guestKey,'1');else sessionStorage.removeItem(guestKey);localStorage.setItem('factorlab-v3-welcome-seen','1');}catch{}
    let next=safeReturn(new URLSearchParams(location.search).get('return'),location.href);
    if(guest){const url=new URL(next,location.href);url.searchParams.set('guest','1');next=url.pathname+url.search+url.hash;}
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
  $('auth-switch').onclick=()=>switchMode('register');$('auth-back').onclick=()=>switchMode('login');$('auth-forgot').onclick=()=>switchMode('forgot');$('auth-guest').onclick=()=>{void post('/api/auth/cancel',{}).catch(()=>{});enter(true);};
  $('auth-language').onchange=()=>{lang=$('auth-language').value;try{localStorage.setItem('factorlab-simulation-language-v3',lang);}catch{}status('');paint();};
  for(const id of ['auth-password-toggle','auth-confirm-toggle'])$(id).onclick=()=>{const input=$($(id).getAttribute('aria-controls'));input.type=input.type==='password'?'text':'password';$(id).setAttribute('aria-pressed',String(input.type==='text'));paint();};
  const video=$('login-animation'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let animationFailed=false,automaticAttempted=false;
  function paintMotion(){$('animation-toggle').textContent=video.ended?tr('重播动画','Replay animation'):video.paused?tr('播放动画','Play animation'):tr('暂停动画','Pause animation');$('animation-toggle').hidden=animationFailed;}
  async function playAnimation(){if(animationFailed)return;try{if(video.ended)video.currentTime=0;await video.play();}catch{}paintMotion();}
  function startAnimation(){if(!automaticAttempted&&!reduced.matches&&!document.hidden){automaticAttempted=true;void playAnimation();}}
  video.muted=true;video.loop=false;video.addEventListener('loadeddata',startAnimation);if(video.readyState>=2)startAnimation();
  for(const event of ['play','pause','ended'])video.addEventListener(event,paintMotion);
  video.addEventListener('error',()=>{animationFailed=true;paintMotion();});
  $('animation-toggle').onclick=()=>{if(video.paused||video.ended)void playAnimation();else video.pause();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});window.addEventListener('pagehide',()=>{clearSensitive();video.pause();});
  setInterval(updateResend,1000);paint();
  (async()=>{try{if(staticHosting){enabled=false;status(tr('浏览器练习版，可直接以访客进入。','Browser edition. Continue as a guest.'));}else{const result=await request('/api/session');enabled=result.enabled===true;csrf=result.csrfToken||'';if(result.user?.id){enter();return;}if(!enabled)status(tr('账号服务未连接，可先以访客体验。','Account service is unavailable. Explore as a guest.'));}}catch{status(tr('账号服务暂不可用，可重试登录或先以访客体验。','Account service is unavailable. Retry or explore as a guest.'),true);enabled=cloudMode;}finally{busy=false;if(cloudMode&&!selfService&&mode!=='login')mode='login';paint();root.FactorLabAuth={ready:true,getMode:()=>mode};}})();
})(typeof window==='undefined'?globalThis:window);
