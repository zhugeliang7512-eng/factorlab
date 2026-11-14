(function () {
  'use strict';
  const staticHosting = document.querySelector('meta[name="factorlab-hosting"]')?.content === 'static';
  const $ = id => document.getElementById(id);
  const words = {
    'zh-CN': {button:'核对我的理由', intro:'根据已公开信息核对理由，由你决定如何配置。', pending:'正在核对…', stale:'理由或进度已改变，请重新核对。', rule:'规则检查', live:'AI 理由核对 · Jev', fallback:'AI 不可用 · 改用规则检查', boundary:'AI 判断可能有误；分类概率不代表盈利概率或已验证的准确率。', evidence_fit:'与证据是否一致', horizon:'理由针对的时间', allocation:'配置限制', rationale:'理由记录', supported:'当前证据支持这段理由', contradicted:'理由与当前证据有冲突', insufficient:'证据不足，请补充依据', long_term:'长期定位', tactical:'短期战术', mixed:'同时涉及长期与短期', unclear:'时间范围不清楚', valid:'配置符合限制', invalid:'请检查合计与行业上限', present:'已填写补充理由', missing:'请填写补充理由后再核对', review:'待复核', noModel:'这里只检查输入与配置限制，不能判断理由是否成立。', distribution:'查看模型分类详情', reference:'所用资料', none:'尚无语义核对结果'},
    en: {button:'Check my rationale', intro:'Compare your rationale with visible evidence. The allocation decision stays yours.', pending:'Checking…', stale:'Your rationale or research state changed. Run the check again.', rule:'Rule check · Jev not used', live:'Jev semantic check', fallback:'Service unavailable · Rules only', boundary:'Semantic judgments can be wrong. Model probabilities are neither return probabilities nor validated accuracy.', evidence_fit:'Evidence support', horizon:'Decision horizon', allocation:'Allocation limits', rationale:'Rationale recorded', supported:'Supported by visible evidence', contradicted:'Conflicts with visible evidence', insufficient:'Insufficient evidence', long_term:'Long-term positioning', tactical:'Short-term tactics', mixed:'Both horizons', unclear:'Unclear horizon', valid:'Within allocation limits', invalid:'Review weights and sector limits', present:'Rationale provided', missing:'Write a specific rationale first', review:'Review needed', noModel:'Jev is not connected. Rules check inputs and allocation limits, not the meaning of your rationale.', distribution:'Model option probabilities', reference:'Evidence available to review', none:'No semantic result yet'}
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let language='zh-CN',controller=null,version=0,lastSignature='',reply=null,stale=false;
  const text = () => words[language];
  const feedback=(stage,id)=>document.dispatchEvent(new CustomEvent('factorlab:feedback',{detail:{kind:'check',stage,id}}));
  const signature = () => JSON.stringify([FactorLabApp.getEnvelope(),FactorLabApp.getUI().profileId]);
  function rules() {
    const current=FactorLabApp.getEnvelope(), values=current.draft;
    const valid=Array.isArray(values)&&values.length===6&&values.every((v,i)=>Number.isFinite(v)&&v>=0&&v<=(i===5?1:.4)+1e-8)&&Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-7;
    return {mode:'rule',checks:[{id:'allocation',value:valid?'valid':'invalid'},{id:'rationale',value:current.note.trim()?'present':'missing'}],references:[]};
  }
  function paint() {
    if(!$('run-quick-check'))return;
    language=FactorLabApp.getUI().lang;
    const t=text();
    $('run-quick-check').textContent=controller?t.pending:t.button;
    $('run-quick-check').disabled=Boolean(controller)||FactorLabApp.getState().phase!=='decision';
    $('quick-check-intro').textContent=t.intro;
    const target=$('quick-check-result');
    if(stale){target.textContent=t.stale;return;}
    if(!reply){target.textContent='';return;}
    const causes={provider_restricted:language==='en'?'Jev returned an access restriction (HTTP 451). Only rule checks are available.':'AI 访问受限，已改用规则检查。',provider_auth:language==='en'?'Jev did not accept the server credentials. Only rule checks are available.':'AI 服务认证失败，已改用规则检查。',rate_limited:language==='en'?'Jev is rate limited. Retry later; rule checks remain available.':'AI 请求受限，已改用规则检查；稍后可重试。'};
    const rows=reply.checks.filter(c=>t[c.id]&&t[c.value]).map(c=>`<div class="judgment-row"><span>${esc(t[c.id])}</span><strong>${esc(t[c.value])}${c.needsReview?` <small>${esc(t.review)}</small>`:''}</strong></div>`).join('');
    const distributions=reply.checks.filter(c=>c.probabilities&&typeof c.probabilities==='object').map(c=>`<p>${esc(t[c.id]||c.id)}: ${Object.entries(c.probabilities).filter(([k,v])=>t[k]&&Number.isFinite(v)&&v>=0&&v<=1).map(([k,v])=>esc(t[k])+': '+Math.round(v*100)+'%').join(' · ')}</p>`).join('');
    const accessDetail=reply.reason==='provider_restricted'?`<details><summary>${language==='en'?'Access details':'查看访问限制'}</summary><p>${language==='en'?'Jev returned HTTP 451 (access restriction).':'Jev 返回 HTTP 451（访问限制）。'}</p></details>`:'';
    const mode=staticHosting?(language==='en'?'Public version · Rule check':'规则检查 · 此版本未连接 AI'):t[reply.mode];
    target.innerHTML=`<p class="judgment-mode">${esc(mode)}</p>${rows}${reply.mode!=='live'?`<p>${esc(causes[reply.reason]||t.noModel)}</p>${accessDetail}`:''}${distributions?`<details><summary>${esc(t.distribution)}</summary>${distributions}</details>`:''}${reply.references?.length?`<p>${esc(t.reference)}: ${reply.references.map(esc).join(' · ')}</p>`:''}${reply.mode==='live'?`<p class="judgment-boundary">${esc(t.boundary)}</p>`:''}`;
  }
  function invalidate() {
    if(!window.FactorLabApp)return;
    if((controller||reply)&&lastSignature!==signature()){
      feedback('cancel',version);version++;controller?.abort();controller=null;reply=null;stale=true;
    }
    paint();
  }
  async function run() {
    if(controller||FactorLabApp.getState().phase!=='decision')return;
    document.dispatchEvent(new Event('factorlab:pause'));
    if(staticHosting){version++;lastSignature=signature();stale=false;reply=rules();paint();return;}
    const envelope=FactorLabApp.getEnvelope(),lang=FactorLabApp.getUI().lang;
    const id=++version;lastSignature=signature();stale=false;reply=null;controller=new AbortController();paint();feedback('start',id);
    const requestController=controller,timer=setTimeout(()=>requestController.abort(),6500);
    let result;
    try{
      if(!/^https?:$/.test(location.protocol))throw Error('offline');
      const response=await fetch('/api/quick-check',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({save:envelope.game,lang,note:envelope.note,reason:envelope.reason,forecast:envelope.forecast,draft:envelope.draft}),signal:requestController.signal});
      if(!response.ok)throw Error('unavailable');
      result=await response.json();
      if(!['live','rule','fallback'].includes(result.mode)||!Array.isArray(result.checks)||result.checks.length>8)throw Error('schema');
    }catch{result={...rules(),mode:'fallback'};}finally{clearTimeout(timer);}
    if(id!==version||lastSignature!==signature())return;
    controller=null;reply=result;paint();feedback(result.mode!=='live'||result.checks.some(c=>c.needsReview||['missing','invalid','insufficient','contradicted','unclear'].includes(c.value))?'caution':'success',id);
  }
  function initialize() {
    if(!window.FactorLabApp||$('run-quick-check'))return;
    const container=document.createElement('div');container.className='quick-judgment';
    container.innerHTML='<p id="quick-check-intro" class="sr-only"></p><button id="run-quick-check" class="secondary wide" type="button" aria-describedby="quick-check-intro"></button><div id="quick-check-result" role="status" aria-live="polite"></div>';
    ($('decision-notes')||document.querySelector('.decision-panel')).append(container);
    $('run-quick-check').addEventListener('click',run);
    paint();
  }
  document.addEventListener('factorlab:render',()=>{initialize();invalidate();});
  for(const event of ['factorlab:save','factorlab:profile','factorlab:restore'])document.addEventListener(event,invalidate);
  initialize();
})();

;
(function () {
  'use strict';
  const cloudMode = !!window.FactorLabCloudConfig, cloud = window.FactorLabCloud;
  const studioEngine = window.FactorLabSimulation.createSecuritiesEngine ? window.FactorLabSimulation.createSecuritiesEngine() : window.FactorLabSimulation.createResearchStudioEngine();
  const selfService = cloudMode && window.FactorLabCloudConfig.selfService === true;
  const staticHosting = document.querySelector('meta[name="factorlab-hosting"]')?.content === 'static' && !cloudMode;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const copy = {
    'zh-CN': {
      title: '账号存档', kicker: 'FactorLab · 行业配置练习', welcome: '用证据做一次行业配置',
      intro: '研究高端制造与尖端科技，比较长期持有和本轮调整的结果。',
      guest: '继续访客进度', login: '登录', register: '注册', close: '关闭',
      signInTitle: '登录 FactorLab', registerTitle: '创建账号', authIntro: '登录后可手动保存研究存档。', enter: '登录并进入', createAndEnter: '注册并进入', returnToWorkspace: '返回研究台',
      show: '显示密码', hide: '隐藏密码', showPassword: '显示密码', hidePassword: '隐藏密码', showConfirmation: '显示确认密码', hideConfirmation: '隐藏确认密码',
      boundary: '账号存档保存在当前账号服务；浏览器草稿不会自动上传。', libraryBoundary: '浏览器草稿自动保存；账号存档需手动保存或更新。', teaching: '合成数据教学练习，共 6 轮，每轮 20 个交易日。',
      isolation: '访客进度保存在当前浏览器；登录后可手动保存账号存档。',
      offline: '账号服务未连接，可先使用访客模式。',
      staticTitle: '浏览器存档', staticIntro: '进度保存在当前浏览器', staticNotice: '此版本不提供账号存档和在线 AI。可导出文件备份进度。',
      staticBoundary: '不会跨设备同步；清除网站数据可能丢失进度。',
      checking: '正在检查账号服务…', username: '用户名', password: '密码', confirmPassword: '确认密码',
      usernameHint: '3–32 位，可用英文字母、数字、_ 或 -', passwordHint: '10–128 个字符，请使用专用密码',
      passwordMismatch: '两次密码不同，请重新确认。', invalidUsername: '用户名需为 3–32 位，只能用英文字母、数字、_ 或 -。',
      invalidPassword: '密码需为 10–128 个字符。', working: '正在登录…', registering: '正在创建账号…', logout: '退出登录',
      slots: '账号存档', empty: '还没有账号存档。给当前进度起个名字，再保存。',
      saveName: '存档名称', savePlaceholder: '例如：复苏情境 · 保留现金', createSave: '保存到账号（新存档）',
      nameHint: '最多 12 个存档。保存新版本或更新已有存档，由你选择。', invalidName: '请输入 1–60 个字符的存档名称。',
      load: '载入', overwrite: '更新此账号存档', refresh: '刷新列表', export: '导出当前进度',
      restore: '恢复载入前草稿', loadWarning: '载入会替换当前进度；当前草稿会先备份，之后可恢复。',
      overwriteWarning: '用当前进度覆盖这个账号存档？',
      confirmLoad: '备份草稿并载入', confirmUpdate: '确认覆盖', cancel: '取消', loaded: '账号存档已载入',
      saved: '已保存到账号存档', restored: '已恢复载入前的草稿', loggedIn: '已登录，继续研究',
      browserSaved: '已自动保存到此浏览器', browserBlocked: '浏览器保存失败，请导出进度。',
      serviceUnsaved: '尚未手动保存到账号', serviceSaved: '上次账号保存',
      serviceDirty: '之后的更改仍在浏览器草稿中。', quota: '已有 12 个存档，可更新其中一个。',
      conflict: '此存档已在别处更新，本次未覆盖。草稿已保留，请刷新列表后核对版本或另存新档。',
      network: '账号服务暂不可用。浏览器进度已保留，请稍后重试。',
      unauthorized: '登录已失效，浏览器草稿已保留。请重新登录。', forbidden: '请重新登录。浏览器中的账号草稿已保留。',
      duplicate: '此用户名已被使用，请换一个。', credentials: '用户名或密码不正确。', rate: '尝试过多，请稍后再试。',
      rejected: '数据校验未通过，草稿和已有存档均未改变。', backupFailed: '当前草稿备份失败，已停止载入。请先导出当前进度。',
      day: '第 {day} 个交易日 · 第 {round} 轮', version: '版本 {revision}', baseline: '基准情景', stress: '压力情景', recovery: '复苏情景',
      account: '账号', guestLabel: '访客', serverLabel: '账号存档', sessionUnknown: '账号服务状态未知', progress: '看证据 → 测方法 → 做配置 → 看结果'
    },
    en: {
      title: 'Account saves', kicker: 'FactorLab · Sector allocation practice', welcome: 'Make an allocation based on evidence',
      intro: 'Test allocation across advanced manufacturing and frontier technology, from long-term positioning to tactical choices.',
      guest: 'Continue as visitor', login: 'Sign in', register: 'Register', close: 'Close',
      signInTitle: 'Sign in to FactorLab', registerTitle: 'Create your account', authIntro: 'Sign in to save named research records manually.', enter: 'Sign in & continue', createAndEnter: 'Create account & continue', returnToWorkspace: 'Back to workspace',
      show: 'Show', hide: 'Hide', showPassword: 'Show password', hidePassword: 'Hide password', showConfirmation: 'Show confirmation password', hideConfirmation: 'Hide confirmation password',
      boundary: 'Account saves are stored by the connected account service. Browser drafts are not uploaded automatically.', libraryBoundary: 'Browser drafts save automatically. Save or update account records manually.', teaching: 'Synthetic teaching practice: 6 rounds of 20 trading days.',
      isolation: 'Signing in opens a separate research workspace. Visitor progress stays in this browser and is never uploaded automatically.',
      offline: 'Account service is not connected. Continue as a visitor.',
      staticTitle: 'Browser saves', staticIntro: 'Public version · Continue research in this browser', staticNotice: 'The public version has no connected account or online AI service. Progress stays in this browser and can be exported as a JSON backup.',
      staticBoundary: 'Browser saves do not sync across devices. Clearing site data may remove progress. Export backups regularly.',
      checking: 'Checking the account service…', username: 'Username', password: 'Password', confirmPassword: 'Confirm password',
      usernameHint: '3–32 letters, numbers, underscores or hyphens', passwordHint: '10–128 characters; use a password dedicated to this project',
      passwordMismatch: 'The two passwords do not match.', invalidUsername: 'Use 3–32 ASCII letters, numbers, underscores or hyphens.',
      invalidPassword: 'Use a password of 10–128 characters.', working: 'Signing in…', registering: 'Creating account…', logout: 'Sign out',
      slots: 'My research saves', empty: 'No account saves yet. Name your current research progress to save the first version.',
      saveName: 'Save name', savePlaceholder: 'For example: Recovery · Defensive allocation', createSave: 'Save as new',
      nameHint: 'Up to 12 independent saves. You choose when to save.', invalidName: 'Enter a save name of 1–60 characters.',
      load: 'Load', overwrite: 'Update with current progress', refresh: 'Refresh list', export: 'Export current progress',
      restore: 'Recover the draft kept before loading', loadWarning: 'Loading replaces your current working progress. A recoverable copy of that progress will be kept first.',
      overwriteWarning: 'Update this account save with your current progress? Other saves remain independent.',
      confirmLoad: 'Keep draft & load', confirmUpdate: 'Confirm update', cancel: 'Cancel', loaded: 'Research save loaded.',
      saved: 'Saved to your account.', restored: 'Your earlier draft has been recovered.', loggedIn: 'Your account workspace is ready.',
      browserSaved: 'Browser draft saves automatically', browserBlocked: 'Browser cannot save drafts; export a backup',
      serviceUnsaved: 'Not yet manually saved to your account', serviceSaved: 'Last account save',
      serviceDirty: 'Your draft has later changes', quota: 'All 12 save slots are in use. You can update an existing save.',
      conflict: 'This save changed elsewhere. Nothing was overwritten and your current draft is preserved. Refresh the list, then save a new copy or review the new version.',
      network: 'The account service is unavailable. Browser progress is preserved; retry later.',
      unauthorized: 'Your session expired. The account draft is preserved. Please sign in again.', forbidden: 'Your session changed or verification failed. The account draft is preserved. Please sign in again.',
      duplicate: 'That username is already in use. Choose another.', credentials: 'The username or password is incorrect.', rate: 'Too many attempts. Please try again later.',
      rejected: 'Validation failed. Your current draft and existing saves were not replaced.', backupFailed: 'Could not keep a recovery draft, so loading was stopped. Export your current progress first.',
      day: 'Day {day} · Round {round}', version: 'Revision {revision}', baseline: 'Baseline', stress: 'Stress', recovery: 'Recovery',
      account: 'Account', guestLabel: 'Visitor', serverLabel: 'Account saves', sessionUnknown: 'Account service status unknown', progress: 'Research → Factor tests → Allocation → Risk attribution → Reflection'
    }
  };
  if(cloudMode){
    Object.assign(copy['zh-CN'],{username:'邮箱',credentials:'邮箱或密码不正确。',invalidUsername:'请输入有效邮箱地址。',authIntro:'用已开通的邮箱账号登录。自助注册暂未开放。',boundary:'账号存档保存在云端；浏览器草稿不会自动上传。',isolation:'登录后可跨设备载入手动保存的云存档。',libraryBoundary:'云存档需手动保存或更新；浏览器草稿仍自动保存在本机。',title:'云存档',slots:'我的云存档',serverLabel:'云存档',invalidPassword:'请输入账号密码。',forbidden:'请确认邮箱已验证，然后重新登录。'});
    Object.assign(copy.en,{username:'Email',credentials:'Email or password is incorrect.',invalidUsername:'Enter a valid email address.',authIntro:'Sign in with your provisioned email account. Self-service registration is not open yet.',boundary:'Named saves are stored in the cloud. Browser drafts are not uploaded automatically.',isolation:'Sign in to load your manually saved research on another device.',libraryBoundary:'Save or update cloud records manually. Browser drafts remain on this device.',title:'Cloud saves',slots:'My cloud saves',serverLabel:'Cloud saves',invalidPassword:'Enter your account password.',forbidden:'Confirm your email is verified, then sign in again.'});
  }
  if(selfService){
    Object.assign(copy['zh-CN'],{authIntro:'登录后继续研究，跨设备载入云存档。',registerIntro:'用常用邮箱注册，验证后即可进入研究台。',verifyTitle:'验证你的邮箱',verifyIntro:'输入邮件里的验证码，完成注册。',forgotTitle:'找回密码',forgotIntro:'输入账号邮箱，获取重设密码的验证码。',resetTitle:'设置新密码',resetIntro:'填写邮件验证码和新密码，原账号与存档会保留。',forgotPassword:'忘记密码？',backLogin:'返回登录',sendCode:'发送验证码',sendingCode:'正在发送…',verifyEnter:'验证并进入',verifying:'正在验证…',setPassword:'更新密码',updatingPassword:'正在更新…',registerSend:'注册并获取验证码',code:'邮箱验证码',codeHint:'输入邮件中的 6–10 位数字',codeSent:'如需验证，我们会向该邮箱发送验证码。请检查收件箱和垃圾邮件。',recoverCodeSent:'若该邮箱已注册，将收到重设密码的验证码。请检查收件箱和垃圾邮件。',resend:'重新发送',resendWait:'{seconds} 秒后可重发',invalidCode:'验证码不正确或已失效，请重试或重新发送。',resetDone:'密码已更新，请用新密码登录。',newPassword:'新密码',newPasswordHint:'10–128 个字符，请使用专用密码',weakPassword:'密码强度不足，请使用更长且包含不同类型字符的密码。',samePassword:'请使用与原密码不同的新密码。如果刚才网络中断，可返回登录尝试刚设置的密码。',emailUnconfirmed:'邮箱尚未验证，请先获取验证码。',verifyEmail:'获取邮箱验证码',mailUnavailable:'暂时无法发送邮件，请稍后重试。',selfServiceUnavailable:'注册与密码重设尚未开放，请稍后再试。',confirmationRequired:'邮箱验证服务配置尚未就绪，请稍后再试。'});
    Object.assign(copy.en,{authIntro:'Continue your research and load cloud saves across devices.',registerIntro:'Register with your email, then verify it to enter your workspace.',verifyTitle:'Verify your email',verifyIntro:'Enter the email code to finish registration.',forgotTitle:'Reset your password',forgotIntro:'Enter your account email to request a reset code.',resetTitle:'Set a new password',resetIntro:'Enter your email code and new password. Your account and saves stay intact.',forgotPassword:'Forgot password?',backLogin:'Back to sign in',sendCode:'Send code',sendingCode:'Sending…',verifyEnter:'Verify & continue',verifying:'Verifying…',setPassword:'Update password',updatingPassword:'Updating…',registerSend:'Register & send code',code:'Email verification code',codeHint:'Enter the 6–10 digits from your email',codeSent:'If verification is needed, a code will arrive. Check your inbox and spam folder.',recoverCodeSent:'If this email is registered, a reset code will arrive. Check your inbox and spam folder.',resend:'Resend code',resendWait:'Resend in {seconds}s',invalidCode:'The code is incorrect or expired. Retry or request a new one.',resetDone:'Password updated. Sign in with your new password.',newPassword:'New password',newPasswordHint:'10–128 characters; use a dedicated password',weakPassword:'Use a stronger password with more characters and a mix of character types.',samePassword:'Choose a different password. If your last attempt lost connection, try signing in with the password you just set.',emailUnconfirmed:'Verify your email before signing in.',verifyEmail:'Send verification code',mailUnavailable:'Email could not be sent. Try again later.',selfServiceUnavailable:'Registration and password reset are not open yet.',confirmationRequired:'Email verification is not configured yet. Please try later.'});
  }
  let initialized = false, ready = false, lang = 'zh-CN', enabled = false, session = { user: null, csrfToken: null };
  let mode = 'login', busy = false, message = '', messageError = false, saves = [], pending = null, lastSaved = null;
  let mailEmail = '', unconfirmed = false, resendTimer;
  const mailCooldown = new Map();
  let dialog, banner, trigger, mascotHost, mascot, libraryHost, libraryMascot, savedFeedback;
  const feedback=(stage,id)=>document.dispatchEvent(new CustomEvent('factorlab:feedback',{detail:{kind:'account',stage,id}}));
  const app = () => window.FactorLabApp;
  const t = (key, values = {}) => Object.entries(values).reduce((str, [name, value]) => str.replaceAll('{' + name + '}', String(value)), copy[lang][key] || key);
  const recoveryKey = () => 'factorlab-v3-before-load-' + (session.user?.id || 'guest');
  function hasRecovery() { try { return !!localStorage.getItem(recoveryKey()); } catch { return false; } }
  function redirectLogin(nextMode='login') {
    const url=new URL('login.html',location.href);url.searchParams.set('return',location.pathname+location.hash);if(nextMode!=='login')url.searchParams.set('mode',nextMode);document.dispatchEvent(new Event('factorlab:pause'));location.assign(url.href);
  }
  function guestAllowed() {
    if(new URLSearchParams(location.search).get('guest')==='1'){try{sessionStorage.setItem('factorlab-v3-guest-session','1');}catch{}return true;}
    try{return sessionStorage.getItem('factorlab-v3-guest-session')==='1'||localStorage.getItem('factorlab-v3-welcome-seen')==='1';}catch{return false;}
  }
  function dismissed() { try { return localStorage.getItem('factorlab-v3-welcome-seen') === '1'; } catch { return false; } }
  function date(value) { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleString(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }
  function notify(key, error = false) { message = key; messageError = error; updateMessage(); }
  function updateMessage() {
    const node = $('account-message');
    if (node) { node.textContent = message ? t(message) : ''; node.classList.toggle('is-error', messageError); }
  }
  function syncStatus() {
    const ui = app().getUI();
    let receipt = $('browser-save-receipt');
    if (!receipt) {
      receipt = document.createElement('div');
      receipt.id = 'browser-save-receipt';
      receipt.setAttribute('role','status');
      $('workspace').insertBefore(receipt,$('workspace').firstChild);
    }
    const en = lang === 'en';
    const localLabel = ui.writable ? (en?'Saved in this browser':'已保存到此浏览器') : (en?'This session only':'仅保留在本次会话');
    let accountLabel = '';
    if (session.user) {
      accountLabel = lastSaved && lastSaved.envelope === JSON.stringify(app().getEnvelope())
        ? (en?'Account save is up to date':'账号存档已更新')
        : lastSaved ? (en?'Account save has pending changes':'账号存档有待更新内容') : (en?'Not saved to your account yet':'尚未保存到账号');
    }
    const receiptText = localLabel + (accountLabel?' · '+accountLabel:'');
    if(receipt.dataset.status!==receiptText){
      receipt.dataset.status=receiptText;
      receipt.replaceChildren(document.createTextNode(receiptText));
    }
    if (!receipt.querySelector('button') && session.user && accountLabel && (!lastSaved || lastSaved.envelope !== JSON.stringify(app().getEnvelope()))) {
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.textContent = en?'Save to account':'保存到账号';
      saveButton.onclick = () => open();
      receipt.append(saveButton);
    }
    const node = $('account-browser-state');
    if (node) node.textContent = t(ui.writable ? 'browserSaved' : 'browserBlocked');
    const serverState = $('account-server-state');
    if (serverState) {
      const changed = lastSaved && lastSaved.envelope !== JSON.stringify(app().getEnvelope());
      serverState.textContent = lastSaved ? t('serviceSaved') + ' ' + date(lastSaved.at) + (changed ? ' · ' + t('serviceDirty') : '') : t('serviceUnsaved');
    }
  }
  function renderChrome() {
    const title = t(staticHosting ? 'staticTitle' : session.user ? 'title' : 'login');
    trigger.title = title;
    trigger.setAttribute('aria-label', title);
    trigger.disabled = !ready;
    trigger.innerHTML = '<span class="account-avatar" aria-hidden="true">' + esc(session.user ? session.user.username.slice(0, 2).toUpperCase() : 'FL') + '</span><span class="account-trigger-label">' + esc(session.user ? session.user.username : title) + '</span>';
    banner.hidden = true;
    banner.innerHTML = `<div><span class="eyebrow">${t('kicker')}</span><h2>${t('welcome')}</h2><p>${t('intro')}</p><small>${t('progress')}</small><p class="footnote">${t('teaching')}</p></div><div class="account-welcome-actions"><button class="primary" data-account-action="guest">${t('guest')}</button>${staticHosting ? `<button data-account-action="export">${t('export')}</button>` : `<div><button data-account-action="login-tab" ${!ready || !enabled ? 'disabled' : ''}>${t('login')}</button><button data-account-action="register-tab" ${!ready || !enabled ? 'disabled' : ''}>${t('register')}</button></div>`}<p>${t(staticHosting ? 'staticNotice' : !ready ? 'checking' : enabled ? 'isolation' : 'offline')}</p></div>`;
    if(cloudMode&&!selfService)banner.querySelector('[data-account-action=register-tab]')?.remove();
  }
  function renderDialog(preserve = false) {
    if(!session.user){if(dialog.open)dialog.close();redirectLogin();return;}
    const focusId=preserve&&dialog.contains(document.activeElement)?document.activeElement.id:null;
    const selection=focusId&&document.activeElement.selectionStart!=null?[document.activeElement.selectionStart,document.activeElement.selectionEnd]:null;
    const formValues = preserve ? [...dialog.querySelectorAll('input')].map(node => [node.id, node.value]) : [];
    const user = session.user;
    dialog.classList.toggle('account-auth-dialog', !user);
    const titleKey={register:'registerTitle',verify:'verifyTitle',forgot:'forgotTitle',reset:'resetTitle'}[mode]||'signInTitle';
    const introKey=selfService?({register:'registerIntro',verify:'verifyIntro',forgot:'forgotIntro',reset:'resetIntro'}[mode]||'authIntro'):'authIntro';
    dialog.innerHTML = `<div class="account-dialog-heading"><div><span class="eyebrow">${user ? t('kicker') : 'FACTORLAB'}</span><h2 id="account-title">${t(staticHosting ? 'staticTitle' : user ? 'title' : titleKey)}</h2></div><button id="close-accounts" class="icon-button" aria-label="${t('close')}">×</button></div>${user ? `<p class="account-boundary">${t('libraryBoundary')}</p>` : `<p class="account-auth-intro">${t(staticHosting ? 'staticIntro' : introKey)}</p>`}<div id="account-message" role="status" aria-live="polite" class="account-message"></div>${user ? saveMarkup() : authMarkup()}<div class="account-bottom">${user ? `<span id="account-browser-state"></span><div class="account-exit-actions"><button data-account-action="logout">${t('logout')}</button><button class="primary" data-account-action="workspace">${t('returnToWorkspace')}</button></div>` : `<button data-account-action="guest">${t('guest')}</button><p class="account-local-note">${t(staticHosting ? 'staticBoundary' : 'boundary')}</p>`}</div>`;
    for (const [id, value] of formValues) if ($(id)) $(id).value = value;
    if (!user) {
      const layout=document.createElement('div');layout.className='auth-layout';
      const panel=document.createElement('div');panel.className='auth-panel';
      while(dialog.firstChild)panel.append(dialog.firstChild);
      const companion=document.createElement('aside');companion.className='auth-companion';
      companion.innerHTML='<span class="eyebrow">FACTORLAB</span>';
      if(!mascotHost){mascotHost=document.createElement('div');mascotHost.className='mascot-host';mascotHost.id='login-mascot';}
      companion.append(mascotHost);layout.append(companion,panel);dialog.append(layout);
      if(!mascot)mascot=window.FactorMascot?.mount(mascotHost,{context:'login',language:lang,focusRoot:dialog});
      mascot?.setLanguage(lang);mascot?.setVisible(dialog.open);
    } else {
      mascot?.setVisible(false);
      if(!libraryHost){libraryHost=document.createElement('div');libraryHost.className='mascot-host account-library-companion';libraryHost.id='library-mascot';}
      dialog.querySelector('.account-library-heading')?.append(libraryHost);
      if(!libraryMascot)libraryMascot=window.FactorMascot?.mount(libraryHost,{context:'workspace',language:lang,focusRoot:dialog});
      libraryMascot?.setLanguage(lang);libraryMascot?.setVisible(dialog.open);
      if(savedFeedback&&!busy){libraryMascot?.emit('success',{id:savedFeedback});savedFeedback=null;}
    }
    if(!user)libraryMascot?.setVisible(false);
    if(focusId&&$(focusId)){ $(focusId).focus({preventScroll:true});if(selection)$(focusId).setSelectionRange(...selection); }
    $('close-accounts').addEventListener('click', () => { if(!busy) dialog.close(); });
    $('account-auth-form')?.addEventListener('submit', authenticate);
    $('account-new-save-form')?.addEventListener('submit', createSave);
    updateMessage(); syncStatus();
    dialog.querySelectorAll('button,input').forEach(node => { if (busy) node.disabled = true; });
    if (busy) dialog.setAttribute('aria-busy', 'true'); else dialog.removeAttribute('aria-busy');
    updateResend();
  }
  function passwordMarkup(id, confirmation = false) {
    const disabled = !enabled || !ready || busy ? 'disabled' : '';
    const newPassword=mode==='register'||mode==='reset';
    return `<div class="account-password-field"><input id="${id}" name="${confirmation ? 'password-confirm' : 'password'}" type="password" autocomplete="${newPassword ? 'new-password' : 'current-password'}" minlength="${cloudMode&&!newPassword?1:10}" maxlength="128" required ${disabled}><button type="button" data-account-action="toggle-password" aria-controls="${id}" aria-pressed="false" aria-label="${t(confirmation ? 'showConfirmation' : 'showPassword')}" ${disabled}>${t('show')}</button></div>`;
  }
  function authSubmitKey(){
    if(selfService)return {login:busy?'working':'enter',register:busy?'registering':'registerSend',verify:busy?'verifying':'verifyEnter',forgot:busy?'sendingCode':'sendCode',reset:busy?'updatingPassword':'setPassword'}[mode];
    return busy ? mode === 'register' ? 'registering' : 'working' : mode === 'register' ? 'createAndEnter' : 'enter';
  }
  function cloudAuthMarkup(disabled){
    const codeStep=mode==='verify'||mode==='reset',newPassword=mode==='register'||mode==='reset';
    const emailInput=codeStep?`<p class="account-email-target">${esc(mailEmail)}</p>`:`<label for="account-username">${t('username')}</label><input id="account-username" name="username" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="254" value="${esc(mailEmail)}" required ${disabled}>`;
    const codeInput=codeStep?`<label for="account-code">${t('code')}</label><input id="account-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" minlength="6" maxlength="10" aria-describedby="account-code-hint" required ${disabled}><small id="account-code-hint">${t('codeHint')}</small>`:'';
    const passwordInput=mode==='forgot'||mode==='verify'?'':`<label for="account-password">${t(mode==='reset'?'newPassword':'password')}</label>${passwordMarkup('account-password')}${newPassword?`<small>${t('newPasswordHint')}</small><label for="account-password-confirm">${t('confirmPassword')}</label>${passwordMarkup('account-password-confirm',true)}`:''}`;
    const actions=mode==='login'?`<button type="button" data-account-action="register-tab">${t('register')}</button><button type="button" data-account-action="forgot-password">${t('forgotPassword')}</button>${unconfirmed?`<button type="button" data-account-action="verify-email">${t('verifyEmail')}</button>`:''}`:`<button type="button" data-account-action="login-tab">${t('backLogin')}</button>${codeStep?`<button type="button" data-account-action="resend-code">${t('resend')}</button>`:''}`;
    return `<div class="account-auth-grid"><form id="account-auth-form">${emailInput}${codeInput}${passwordInput}<button type="submit" id="account-submit" class="primary wide" ${disabled}>${t(authSubmitKey())}</button></form><div class="account-auth-links">${actions}</div></div>`;
  }
  function cooldownKey(){return (mode==='reset'?'recover:':'signup:')+mailEmail.toLowerCase();}
  function updateResend(){
    clearTimeout(resendTimer);
    const button=dialog?.querySelector('[data-account-action="resend-code"]');if(!button)return;
    const seconds=Math.max(0,Math.ceil(((mailCooldown.get(cooldownKey())||0)-Date.now())/1000));
    button.disabled=busy||seconds>0;button.textContent=seconds?t('resendWait',{seconds}):t('resend');
    if(seconds)resendTimer=setTimeout(updateResend,1000);
  }
  function authMarkup() {
    if (staticHosting) return `<div class="account-auth-grid"><p class="account-service-note">${t('staticNotice')}</p><p id="account-browser-state"></p><button data-account-action="export">${t('export')}</button></div>`;
    const disabled = !enabled || !ready || busy ? 'disabled' : '';
    if(selfService)return cloudAuthMarkup(disabled);
    if(cloudMode)return `<div class="account-auth-grid">${!ready||!enabled?`<p class="account-service-note">${t(!ready?'checking':'offline')}</p>`:''}<form id="account-auth-form"><label for="account-username">${t('username')}</label><input id="account-username" name="username" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="254" required ${disabled}><label for="account-password">${t('password')}</label>${passwordMarkup('account-password')}<button type="submit" id="account-submit" class="primary wide" ${disabled}>${t(busy?'working':'enter')}</button></form></div>`;
    return `<div class="account-auth-grid"><div class="account-tabs"><button type="button" data-account-action="login-tab" aria-pressed="${mode === 'login'}">${t('login')}</button><button type="button" data-account-action="register-tab" aria-pressed="${mode === 'register'}">${t('register')}</button></div>${!ready || !enabled ? `<p class="account-service-note">${t(!ready ? 'checking' : 'offline')}</p>` : ''}<form id="account-auth-form"><label for="account-username">${t('username')}</label><input id="account-username" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" minlength="3" maxlength="32" pattern="[A-Za-z0-9_-]{3,32}" required ${disabled}>${mode === 'register' ? `<small>${t('usernameHint')}</small>` : ''}<label for="account-password">${t('password')}</label>${passwordMarkup('account-password')}${mode === 'register' ? `<small>${t('passwordHint')}</small><label for="account-password-confirm">${t('confirmPassword')}</label>${passwordMarkup('account-password-confirm', true)}` : ''}<button type="submit" id="account-submit" class="primary wide" ${disabled}>${t(busy ? mode === 'register' ? 'registering' : 'working' : mode === 'register' ? 'createAndEnter' : 'enter')}</button></form></div>`;
  }
  function saveMarkup() {
    return `<div class="account-library-heading"><div><span class="source-tag">${t('account')} · ${esc(session.user.username)}</span><h3>${t('slots')} <span class="account-count">${saves.length} / 12</span></h3></div><button data-account-action="refresh">${t('refresh')}</button></div><p id="account-server-state" class="account-service-note"></p><form id="account-new-save-form" class="account-new-save"><label for="account-save-name">${t('saveName')}</label><div><input id="account-save-name" maxlength="60" required placeholder="${t('savePlaceholder')}" ${saves.length >= 12 ? 'disabled' : ''}><button type="submit" id="account-create-save" class="primary" ${saves.length >= 12 ? 'disabled' : ''}>${t('createSave')}</button></div><small>${t(saves.length >= 12 ? 'quota' : 'nameHint')}</small></form><div id="account-slot-list" class="account-slot-list">${saves.length ? saves.map(save => `<article><div><h4>${esc(save.name)}</h4><p>${esc(t('day', { day: save.day, round: save.round }))}</p><small>${esc(date(save.updatedAt))} · ${esc(t('version', { revision: save.revision }))}</small></div><div class="account-slot-actions"><button data-account-action="load" data-save-id="${esc(save.id)}">${t('load')}</button><button data-account-action="overwrite" data-save-id="${esc(save.id)}">${t('overwrite')}</button></div></article>`).join('') : `<p class="account-empty">${t('empty')}</p>`}</div>${pending ? `<section class="account-confirm" aria-label="${t('confirmLoad')}"><strong>${esc(pending.name || '')}</strong><p>${t(pending.type === 'overwrite' ? 'overwriteWarning' : 'loadWarning')}</p><div><button id="account-confirm-action" class="primary" data-account-action="confirm">${t(pending.type === 'overwrite' ? 'confirmUpdate' : 'confirmLoad')}</button><button data-account-action="cancel">${t('cancel')}</button></div></section>` : ''}<div class="account-transfer"><button data-account-action="export">${t('export')}</button>${hasRecovery() ? `<button data-account-action="recover">${t('restore')}</button>` : ''}</div>`;
  }
  async function request(url, options = {}) {
    if(cloudMode){if(!cloud)throw Error('cloud_unavailable');return cloud.request(url,options);}
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 6000);
    const headers = { Accept: 'application/json', ...(options.method ? { 'Content-Type': 'application/json' } : {}), ...(session.csrfToken ? { 'X-CSRF-Token': session.csrfToken } : {}) };
    try {
      const response = await fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw Object.assign(new Error('request'), { status: response.status });
      if (!data || typeof data !== 'object') throw Error('response');
      return data;
    } finally { clearTimeout(timeout); }
  }
  function failure(error, auth = false) {
    const status = error.status;
    if(selfService&&auth){
      const key={email_not_confirmed:'emailUnconfirmed',otp_expired:'invalidCode',invalid_otp:'invalidCode',weak_password:'weakPassword',same_password:'samePassword',invalid_email:'invalidUsername',email_address_invalid:'invalidUsername',email_address_not_authorized:'mailUnavailable',email_confirmation_required:'confirmationRequired',registration_unavailable:'selfServiceUnavailable',session_changed:'unauthorized',over_email_send_rate_limit:'rate',over_request_rate_limit:'rate',unexpected_failure:'mailUnavailable'}[error.code];
      if(key){if(error.code==='email_not_confirmed')unconfirmed=true;notify(key,true);return;}
    }
    if ([401, 403].includes(status) && !auth) { session = { user: null, csrfToken: null }; mode = 'login'; saves = []; lastSaved = null; pending = null; app().setProfile(null); renderChrome(); }
    notify(error.code==='save_limit'?'quota':status === 409 ? (auth ? 'duplicate' : 'conflict') : status === 401 ? (auth ? 'credentials' : 'unauthorized') : status === 403 ? 'forbidden' : status === 429 ? 'rate' : status === 400 || status === 413 || status === 422 ? 'rejected' : 'network', true);
  }
  function installSession(value) {
    if (value.enabled !== true || !value.user || typeof value.user.id !== 'string' || typeof value.user.username !== 'string' || typeof value.csrfToken !== 'string') throw Error('session');
    session = { user: value.user, csrfToken: value.csrfToken }; enabled = true; saves = []; lastSaved = null; pending = null;
    app().setProfile(session.user.id); renderChrome();
  }
  async function fetchSaves() {
    const data = await request('/api/saves');
    if (!Array.isArray(data.saves)) throw Error('schema');
    saves = data.saves.slice(0, 12);
  }
  async function authenticate(event) {
    event.preventDefault(); if (busy || !enabled) return;
    if(selfService&&mode!=='login')return authenticateCloud();
    const username = $('account-username').value.trim(), password = $('account-password').value;
    if (!(cloudMode?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username):/^[A-Za-z0-9_-]{3,32}$/.test(username))) return notify('invalidUsername', true);
    if (password.length < (cloudMode?1:10) || password.length > 128) return notify('invalidPassword', true);
    if (mode === 'register' && password !== $('account-password-confirm').value) return notify('passwordMismatch', true);
    busy = true; message = ''; const action = mode; updateMessage(); setAuthBusy();
    let signedIn = false;
    try { installSession(await request('/api/' + (action === 'register' ? 'register' : 'login'), { method: 'POST', body: JSON.stringify({ username, password }) })); signedIn = true; }
    catch (error) { failure(error, true); if(selfService&&unconfirmed)renderDialog(true); }
    finally {
      busy = false;
      if (signedIn) { enterWorkspace(); feedback('success'); }
      else { setAuthBusy(); $('account-password')?.focus(); }
    }
  }
  async function authenticateCloud(){
    const action=mode,email=($('account-username')?.value||mailEmail).trim().toLowerCase(),password=$('account-password')?.value,token=$('account-code')?.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return notify('invalidUsername',true);
    if(action==='register'||action==='reset'){
      if(!password||password.length<10||password.length>128)return notify('weakPassword',true);
      if(password!==$('account-password-confirm').value)return notify('passwordMismatch',true);
    }
    if((action==='verify'||action==='reset')&&!/^\d{6,10}$/.test(token||''))return notify('invalidCode',true);
    mailEmail=email;busy=true;message='';updateMessage();setAuthBusy();
    let signedIn=false,success=false;
    try{
      const endpoint={register:'/api/register',forgot:'/api/auth/recover',verify:'/api/auth/verify',reset:'/api/auth/reset'}[action];
      const result=await request(endpoint,{method:'POST',body:JSON.stringify({username:email,email,password,token})});
      if(action==='verify'){installSession(result);signedIn=true;}
      else if(action==='reset'){mode='login';unconfirmed=false;notify('resetDone');}
      else{mode=action==='register'?'verify':'reset';mailCooldown.set(cooldownKey(),Date.now()+60000);notify(mode==='reset'?'recoverCodeSent':'codeSent');}
      success=true;
    }catch(error){failure(error,true);}
    finally{
      busy=false;
      if(signedIn){enterWorkspace();feedback('success');}
      else{renderDialog(!success);($('account-code')||$('account-password')||$('account-username'))?.focus();}
    }
  }
  async function resendCode(fromLogin=false){
    const email=($('account-username')?.value||mailEmail).trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return notify('invalidUsername',true);
    mailEmail=email;
    if((mailCooldown.get(cooldownKey())||0)>Date.now()){
      if(fromLogin){mode='verify';message='codeSent';renderDialog();}return;
    }
    busy=true;message='';setAuthBusy();updateMessage();
    try{
      await request(mode==='reset'?'/api/auth/recover':'/api/auth/resend',{method:'POST',body:JSON.stringify({email})});
      if(fromLogin)mode='verify';
      mailCooldown.set(cooldownKey(),Date.now()+60000);notify(mode==='reset'?'recoverCodeSent':'codeSent');
    }catch(error){failure(error,true);if(error.status===429)mailCooldown.set(cooldownKey(),Date.now()+60000);}
    finally{busy=false;renderDialog(true);if($('account-code')){$('account-code').value='';$('account-code').focus();}}
  }
  function setAuthBusy() {
    dialog.querySelectorAll('button,input').forEach(node => { node.disabled = busy || (!enabled && node.closest('#account-auth-form')); });
    dialog.toggleAttribute('aria-busy', busy);
    if (busy) dialog.setAttribute('aria-busy', 'true');
    if ($('account-submit')) $('account-submit').textContent = t(authSubmitKey());
    updateResend();
  }
  function clearWelcome() {
    const url = new URL(location.href);
    if (url.searchParams.has('welcome')) { url.searchParams.delete('welcome'); history.replaceState(history.state, '', url.href); }
  }
  function enterWorkspace() {
    clearWelcome();
    try { localStorage.setItem('factorlab-v3-welcome-seen', '1'); } catch {}
    banner.hidden = true; dialog.close();
    window.FactorLabWorkspace?.go('research', { animate: false, focus: true });
    $('workspace')?.focus({ preventScroll: true });
  }
  function rememberSaved(save, envelope) {
    if (!save || typeof save.id !== 'string' || !Number.isInteger(save.revision)) throw Error('save');
    lastSaved = { at: save.updatedAt, envelope: JSON.stringify(envelope) }; notify('saved');savedFeedback=save.id+':'+save.revision;
  }
  async function createSave(event) {
    event.preventDefault(); if (busy || !session.user) return;
    const name = $('account-save-name').value.trim();
    if (!name || name.length > 60) return notify('invalidName', true);
    if (saves.length >= 12) return notify('quota', true);
    const envelope = app().getEnvelope(); busy = true; message = ''; renderDialog(true);
    try { const data = await request('/api/saves', { method: 'POST', body: JSON.stringify({ name, envelope }) }); rememberSaved(data.save, envelope); await fetchSaves(); }
    catch (error) { failure(error); }
    finally { busy = false; renderDialog(); }
  }
  function preserveDraft() {
    try { const raw = JSON.stringify(app().getEnvelope()); localStorage.setItem(recoveryKey(), raw); if (localStorage.getItem(recoveryKey()) !== raw) throw Error('write'); }
    catch { throw Object.assign(new Error('backup'), { backup: true }); }
  }
  async function confirmAction() {
    if (!pending || busy) return;
    const action = pending, envelope = app().getEnvelope(); busy = true; message = ''; renderDialog(true);
    try {
      if (action.type === 'overwrite') {
        const data = await request('/api/saves/' + encodeURIComponent(action.id), { method: 'PUT', body: JSON.stringify({ name: action.name, envelope, revision: action.revision }) });
        rememberSaved(data.save, envelope); await fetchSaves();
      } else {
        let loadedSave;
        const next = action.type === 'recover' ? JSON.parse(localStorage.getItem(recoveryKey())) : (loadedSave=(await request('/api/saves/' + encodeURIComponent(action.id))).save)?.envelope;
        if (!next) throw Object.assign(new Error('save'), { status: 422 });
        try { if (!['factorlab-ui-v2', 'factorlab-ui-v3'].includes(next.version)) throw Error('version'); studioEngine.restore(next.game); }
        catch { throw Object.assign(new Error('save'), { status: 422 }); }
        preserveDraft(); app().loadEnvelope(next); lastSaved = loadedSave ? {at:loadedSave.updatedAt,envelope:JSON.stringify(app().getEnvelope())} : null; notify(action.type === 'recover' ? 'restored' : 'loaded');
      }
      pending = null;
    } catch (error) { if (error.backup) notify('backupFailed', true); else failure(error); }
    finally { busy = false; renderDialog(); }
  }
  function exportProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(app().exportEnvelope(), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'FactorLab-current-progress.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function refresh() {
    if (busy || !session.user) return; busy = true; message = ''; pending = null; renderDialog(true);
    try { await fetchSaves(); } catch (error) { failure(error); }
    finally { busy = false; renderDialog(); }
  }
  async function logout() {
    if (busy) return; busy = true; message = ''; renderDialog();
    try {
      await request('/api/logout', { method: 'POST', body: '{}' });
      session = { user: null, csrfToken: null }; saves = []; pending = null; lastSaved = null; mode = 'login';
      app().setProfile(null); renderChrome();
      try{sessionStorage.removeItem('factorlab-v3-guest-session');localStorage.removeItem('factorlab-v3-welcome-seen');}catch{}
      dialog.close();redirectLogin();
    } catch (error) { failure(error); }
    finally { busy = false; if(dialog.open)renderDialog(); }
  }
  function open(nextMode) {
    if (busy) return;
    if(!session.user){redirectLogin(nextMode||'login');return;}
    if(cloudMode&&!selfService&&nextMode==='register')nextMode='login';
    const username = nextMode ? ($('account-username')?.value||mailEmail) : '';
    if (nextMode === mode && dialog.open) return;
    if(selfService&&nextMode){mailEmail=username;unconfirmed=false;if(mode==='reset')void request('/api/auth/cancel',{method:'POST'}).catch(()=>{});}
    if (nextMode) mode = nextMode; message = ''; pending = null;
    document.dispatchEvent(new Event('factorlab:pause')); renderDialog();
    if (!dialog.open) dialog.showModal();
    mascot?.setVisible(!session.user);libraryMascot?.setVisible(!!session.user);
    if (session.user) refresh(); else { if (username&&$('account-username')) $('account-username').value = username; ($('account-code')||$('account-username'))?.focus();mascot?.emit('welcome'); }
  }
  function action(event) {
    const button = event.target.closest('[data-account-action]'); if (!button || busy) return;
    const name = button.dataset.accountAction;
    if (name === 'guest' || name === 'workspace') enterWorkspace();
    else if (name === 'toggle-password') {
      const input = $(button.getAttribute('aria-controls'));
      const visible = input.type === 'password', confirmation = input.id === 'account-password-confirm';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', t(confirmation ? visible ? 'hideConfirmation' : 'showConfirmation' : visible ? 'hidePassword' : 'showPassword'));
      button.textContent = t(visible ? 'hide' : 'show');
    }
    else if (name === 'login-tab' || name === 'register-tab') open(name === 'login-tab' ? 'login' : 'register');
    else if (selfService&&name === 'forgot-password') open('forgot');
    else if (selfService&&name === 'verify-email') resendCode(true);
    else if (selfService&&name === 'resend-code') resendCode();
    else if (name === 'refresh') refresh();
    else if (name === 'logout') logout();
    else if (name === 'export') exportProgress();
    else if (name === 'confirm') confirmAction();
    else if (name === 'cancel') { pending = null; renderDialog(true); }
    else if (name === 'recover') { pending = { type: 'recover', name: t('restore') }; renderDialog(true); $('account-confirm-action').focus(); }
    else if (name === 'load' || name === 'overwrite') {
      const save = saves.find(item => item.id === button.dataset.saveId); if (!save) return;
      pending = { type: name, id: save.id, name: save.name, revision: save.revision }; message = ''; renderDialog(true); $('account-confirm-action').focus();
    }
  }
  async function checkSession() {
    const explicitGuest = new URLSearchParams(location.search).get('guest') === '1';
    if (explicitGuest && !session.user) {
      ready = true;
      enabled = cloudMode || enabled;
      renderChrome();
      requestAnimationFrame(()=>document.documentElement.removeAttribute('data-auth-pending'));
      return;
    }
    const hadUser=!!session.user;
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && ['http:', 'https:'].includes(location.protocol);
    if (cloudMode || (local && !staticHosting)) {
      try { const data = await request('/api/session'); enabled = data.enabled === true; if (enabled && data.user && data.user.id!==session.user?.id) installSession(data); else if(!data.user&&session.user){session={user:null,csrfToken:null};saves=[];lastSaved=null;pending=null;app().setProfile(null);} }
      catch(error) { enabled = false; if(cloudMode&&error.status===401){session={user:null,csrfToken:null};saves=[];lastSaved=null;pending=null;app().setProfile(null);} }
    }
    ready = true; renderChrome(); if (dialog.open) renderDialog();
    const forceLogin=new URLSearchParams(location.search).get('welcome')==='1';
    if(session.user){clearWelcome();document.documentElement.removeAttribute('data-auth-pending');}
    else if(hadUser||forceLogin||!guestAllowed()){redirectLogin();}
    else document.documentElement.removeAttribute('data-auth-pending');
  }
  function initialize() {
    if (initialized || !app()) return; initialized = true; lang = app().getUI().lang === 'en' ? 'en' : 'zh-CN';
    trigger = document.createElement('button'); trigger.id = 'open-accounts'; trigger.className = 'account-trigger'; trigger.setAttribute('aria-haspopup', 'dialog');
    document.querySelector('.top-actions').insertBefore(trigger, $('settings'));
    banner = document.createElement('section'); banner.id = 'account-welcome'; banner.className = 'account-welcome'; $('workspace').insertBefore(banner, $('workspace').querySelector('footer'));
    dialog = document.createElement('dialog'); dialog.id = 'account-dialog'; dialog.className = 'account-dialog'; dialog.setAttribute('aria-labelledby', 'account-title'); document.body.append(dialog);
    trigger.addEventListener('click', () => open()); banner.addEventListener('click', action); dialog.addEventListener('click', action);
    dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    dialog.addEventListener('close', () => { mascot?.setVisible(false);libraryMascot?.setVisible(false);savedFeedback=null;clearTimeout(resendTimer);if(selfService)void request('/api/auth/cancel',{method:'POST'}).catch(()=>{}); dialog.querySelectorAll('input[name=password],input[name=password-confirm],input[name=code]').forEach(node => { node.value = ''; if(node.name!=='code')node.type = 'password'; }); pending = null; clearWelcome(); });
    renderChrome(); checkSession();
    cloud?.subscribe(function syncCloud(){if(busy){setTimeout(syncCloud,80);return;}checkSession();});
    window.FactorLabAccounts = { get ready() { return ready; }, open, refresh, getStatus: () => ({ enabled, signedIn: !!session.user, busy }) };
  }
  document.addEventListener('factorlab:render', () => {
    initialize(); if (!initialized) return;
    const next = app().getUI().lang === 'en' ? 'en' : 'zh-CN';
    if (next !== lang) { lang = next; renderChrome(); if (dialog.open) renderDialog(true); }
    syncStatus();
  });
  document.addEventListener('factorlab:save', () => { if (initialized) syncStatus(); });
  initialize();
})();

;
(function(){
'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tab='market',instrument='',range=30,optionSide='all',optionSnapshotOpen=false,currentRef=null,lastKey='',scheduled=false,chatReturn=null,chartsFailed=false;
const app=()=>window.FactorLabApp,ui=()=>app()?.getUI(),view=()=>app()?.getState(),en=()=>document.documentElement.lang==='en',tr=(zh,english)=>en()?english:zh;
const num=(v,d=2)=>Number.isFinite(v)?v.toLocaleString(en()?'en-US':'zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d}):'—',money=v=>num(v)+' USD',name=x=>typeof x==='object'?(x?.[document.documentElement.lang]||x?.en||'—'):x;
const records=()=>window.FactorLabEvidence?.buildEvidence(view())||[];
const kind=r=>String(r.type).toLowerCase();
const securityName=id=>{const h=view()?.ledger?.holdings.find(h=>h.id===id);return h?name(h.name).replace(/^教学|^Teaching /,'').replace(/ [ABC]$/,''):id;};
const title=r=>String(name(r.title)||r.id).replace(/SIM-[A-Z]+-[A-Z]/g,securityName).replace(/教学价格|teaching price/g,tr('价格','price')).replace(/期权教学快照|teaching option snapshot/g,tr('期权','options'));
const mode=r=>r.dataMode==='historical'||r.dataMode==='historical-real'?tr('历史真实','Historical real'):['live','realtime'].includes(r.dataMode)?tr('实时','Live'):r.dataMode==='delayed'?tr('延迟','Delayed'):tr('教学合成','Teaching synthetic');
const meta=r=>`<details class="material-provenance"><summary>${tr('来源与计算口径','Source & method')}</summary><div class="material-meta">${esc(mode(r))} · ${esc(r.availableAt?.slice(0,10))}<p>${tr('此练习使用虚构证券和模拟数据。','This exercise uses fictional securities and simulated data.')}</p>${r.sourceUrl?`<a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">${tr('查看来源','Open source')}</a>`:''}<details><summary>${tr('技术记录','Technical record')}</summary><p>${esc(r.id)} · ${esc(r.snapshotId)}</p><p>${esc(r.availableAt)} · ${esc(typeof r.units==='object'?JSON.stringify(r.units):r.units)}</p></details></div></details>`;
function chosen(r,selection={}){return FactorLabEvidence.select(records(),r.id,selection);}
function actions(r,selection={}){const key=encodeURIComponent(JSON.stringify({id:r.id,selection}));return `<div class="material-actions"><button data-material-cite="${key}" ${document.body.dataset.phase!=='decision'?'disabled':''}>${tr('收藏','Save reference')}</button><button data-material-ask="${key}">${tr('问 AI','Ask AI')}</button><button data-material-open="${key}">${tr('查看详情','View details')}</button></div>`;}
function bindActions(root){root.querySelectorAll('[data-material-cite],[data-material-ask],[data-material-open]').forEach(button=>button.onclick=()=>{try{const raw=button.dataset.materialCite||button.dataset.materialAsk||button.dataset.materialOpen;const choice=JSON.parse(decodeURIComponent(raw)),record=records().find(r=>r.id===choice.id),ref=chosen(record,choice.selection);if(button.dataset.materialCite){const accepted=app().citeEvidence(ref);button.textContent=accepted?tr('已加入 ✓','Added ✓'):tr('本轮已锁定或正在回复','Round locked or reply pending');}else if(button.dataset.materialAsk){app().attachEvidence(ref);openChat();$('question').focus();}else showMaterial(ref);}catch(error){button.textContent=tr('此版本不可用，请刷新材料','Version unavailable; refresh evidence');}});}
function renderNewsTab(root,all){const news=all.filter(r=>/news|social|tweet/.test(kind(r)));root.innerHTML=`<div class="panel-head"><h2>${tr('宏观回放与来源核查','Macro replay & source checks')}</h2><span class="source-badge">${tr('真实宏观回放优先','Real macro replay first')}</span></div><div id="news-replay"></div><details class="synthetic-news"><summary>${tr('模拟资讯与社媒卡（原有练习）','Simulated news & social cards (existing exercise)')} · ${news.length}</summary><p class="footnote">${tr('以下是虚构教学材料，不是真实新闻。它们保留用于练习“传闻要用哪份原始文件核对”，不能当作宏观事实。','The material below is fictional teaching content, not real news. It remains for the “which primary document verifies a rumor” exercise and is not macro fact.')}</p><div class="material-cards">${news.map(r=>`<article class="material-card"><h3>${esc(title(r))}</h3><div class="material-meta">${tr('作者','Author')}: ${esc(name(r.data?.author))} · ${esc(r.publishedAt?.slice(0,10))}</div><p>${esc(name(r.data?.text||r.data?.body||r.data?.excerpt)||'')}</p>${meta(r)}${actions(r)}<details><summary>${tr('解读与限制','Interpretation & limits')}</summary><p>${esc(name(r.interpretation))}</p></details></article>`).join('')}</div></details><details class="evidence-explanation"><summary>${tr('金融概念与核验来源','Financial concepts & verified sources')}</summary>${['options','volatility','allocation','backtest','factors'].map(k=>`<p>${esc(FactorLabEvidence.explain(k,document.documentElement.lang))}</p>`).join('')}<p>${Object.entries(FactorLabEvidence.SOURCES).map(([k,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(k)}</a>`).join(' · ')}</p></details>`;window.FactorLabReplayUI?.renderNews($('news-replay'),{day:view().day});bindActions(root);}
function renderEvidence(){
const root=$('evidence-workbench');if(!root||!app())return;if(tab==='options')optionSnapshotOpen=!!root.querySelector('.option-snapshot')?.open;if($('evidence-price-chart'))window.echarts?.getInstanceByDom($('evidence-price-chart'))?.dispose();if(view().legacy&&['market','options','fundamentals'].includes(tab))return renderLegacyEvidence(root,view());if(tab==='market'&&window.FactorLabMarketView)return window.FactorLabMarketView.render(root,{records:records(),view:view(),tr,esc,num,title,securityName,sector,meta,actions,bindActions,FactorVisuals});const all=records();
if(tab==='news')return renderNewsTab(root,all);
const prices=all.filter(r=>/price|market/.test(kind(r))&&Array.isArray(r.data?.points));
let candidates=tab==='market'?prices:tab==='options'?all.filter(r=>/option/.test(kind(r))):tab==='fundamentals'?all.filter(r=>/fundamental|company|sector/.test(kind(r))):all.filter(r=>/news|social|tweet/.test(kind(r)));
if(!candidates.length){root.innerHTML=`<h2>${tr('材料尚不可用','Material unavailable')}</h2><p>${tr('当前快照未提供该类数据。','This snapshot does not contain this data type.')}</p>`;return;}
if(tab==='market'){
 if(!candidates.some(r=>r.instrumentIds?.includes(instrument)))instrument=candidates[0].instrumentIds?.[0];const r=candidates.find(r=>r.instrumentIds?.includes(instrument))||candidates[0];const points=r.data.points;const from=Math.max(0,points.length-range),visible=points.slice(from);const selection={from:visible[0]?.day??0,to:visible.at(-1)?.day??view().day};
 root.innerHTML=`<div class="panel-head"><h2>${tr('证券价格','Security price')}</h2><span class="source-badge">${tr('模拟价格 · USD','Simulated price · USD')}</span></div><div class="evidence-toolbar"><label>${tr('证券','Security')} <select id="market-instrument">${candidates.map(p=>`<option value="${esc(p.instrumentIds?.[0])}" ${p===r?'selected':''}>${esc(title(p))}</option>`).join('')}</select></label><label>${tr('区间','Range')} <select id="market-range">${[10,30,90,365].map(n=>`<option value="${n}" ${n===range?'selected':''}>${n===365?tr('全部','All'):n+tr(' 个观测',' observations')}</option>`).join('')}</select></label></div><div class="price-readout"><span>${tr('最近可见报价','Latest visible quote')}</span><strong>${num(points.at(-1)?.value,2)} <small>USD</small></strong><time>${esc(points.at(-1)?.time?.slice(0,10)||'')}</time></div><div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('图表脚本未加载，价格数据仍可查看。','Chart script did not load. Price data remain available.')}</p><details class="price-data"><summary>${tr('查看价格数据','View price data')} · ${visible.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('日期','Date')}</th><th>${tr('价格 USD','Price USD')}</th></tr></thead><tbody>${visible.map(point=>`<tr><td>${esc(point.time?.slice(0,10)||String(point.day))}</td><td>${num(point.value,4)}</td></tr>`).join('')}</tbody></table></div></details>${meta(r)}${actions(r,selection)}<details class="evidence-explanation"><summary>${tr('如何解读','Interpretation')}</summary><p>${esc(name(r.interpretation)||tr('图中是证券的教学报价。价格上涨不能证明供应商定义的资金净流入；这里没有净流入数据。','These are teaching security quotes. A price rise does not establish provider-defined net inflows; no net-flow data are supplied.'))}</p></details>`;
 FactorVisuals.chart($('evidence-price-chart'),{rows:visible,series:[{key:'value',name:tr('价格 USD','Price USD'),color:'#675c48'}],label:title(r),format:v=>num(v),xLabel:p=>p.time?.slice(0,10)||String(p.day)});
 $('market-instrument').onchange=e=>{instrument=e.target.value;renderEvidence();};$('market-range').onchange=e=>{range=Number(e.target.value);renderEvidence();};
}else if(tab==='options'){
 const quote=candidates[0]?.data?.rows?.[0]||null,totalRows=candidates.reduce((n,r)=>n+(r.data?.rows?.length||0),0);
 root.innerHTML=`<div class="panel-head"><h2>${tr('期权：先读权利，再读报价','Options: read the right, then the quote')}</h2><span class="source-badge">${tr('教学快照 · 不可交易','Teaching snapshot · not tradable')}</span></div>${window.FactorLabReplayUI?.optionsIntro(quote)||''}<details class="option-snapshot" ${optionSnapshotOpen?'open':''}><summary>${tr('完整合约快照','Full contract snapshot')} · ${candidates.length} ${tr('个标的','underlyings')} · ${totalRows} ${tr('行','rows')}</summary><p class="footnote">${tr('快照每天重建合约：5 个标的、每个 6 行；到期日每天重设为 D+30。相邻两天看到的是两组合约，不是同一条合约链。','The snapshot rebuilds contracts each day: five underlyings, six rows each; expiry resets to D+30 daily. Two adjacent days show two different contract sets, not one contract chain.')}</p><label>${tr('合约方向','Contract side')} <select id="option-side"><option value="all">Call + Put</option><option>Call</option><option>Put</option></select></label><div id="evidence-tables">${candidates.map(r=>tableMaterial(r)).join('')}</div></details><p class="footnote">${tr('IV 是教学假设，不是上涨概率；OI 与成交量不能单独确定方向。','IV is a teaching assumption, not an upside probability; OI and volume alone do not determine direction.')}</p>`;
 if($('option-side')){$('option-side').value=optionSide;$('option-side').onchange=e=>{optionSide=e.target.value;renderEvidence();};}
 window.FactorLabReplayUI?.bindOptions(root,quote);bindActions(root);
}else if(tab==='fundamentals'){
 const totalRows=candidates.reduce((n,r)=>n+(r.data?.rows?.length||0),0);
 root.innerHTML=`<div class="panel-head"><h2>${tr('公司与行业：先定时间口径，再做判断','Companies & industries: fix the time basis first')}</h2><span class="source-badge">${tr('虚构教学财报','Fictional teaching statements')}</span></div>${window.FactorLabReplayUI?.fundamentalsTimeNote()||''}${window.FactorLabReplayUI?.industryCards()||''}<details class="fundamental-snapshot"><summary>${tr('完整公司与估值快照','Full company & valuation snapshot')} · ${totalRows} ${tr('行','rows')}</summary><div id="evidence-tables">${candidates.map(r=>tableMaterial(r)).join('')}</div></details><p class="footnote">${tr('缺失的利润、EPS、P/E、ROE 保留为空，不按零计算。历史引用按旧版本解析。','Missing profit, EPS, P/E and ROE stay empty, not zero. Historical references resolve against their original version.')}</p>`;
 bindActions(root);
}
 root.insertAdjacentHTML('beforeend',`<details class="evidence-explanation"><summary>${tr('金融概念与核验来源','Financial concepts & verified sources')}</summary>${['options','volatility','allocation','backtest','factors'].map(k=>`<p>${esc(FactorLabEvidence.explain(k,document.documentElement.lang))}</p>`).join('')}<p>${Object.entries(FactorLabEvidence.SOURCES).map(([k,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(k)}</a>`).join(' · ')}</p></details>`);bindActions(root);
}
function renderLegacyEvidence(root,s){
 const history=s.history.filter(row=>Number.isInteger(row.day)&&row.day<=s.day),dayLabel=day=>tr('第 '+day+' 天','Day '+day);
 if(tab==='options'){
  root.innerHTML=`<h2>${tr('期权权利与真实案例','Option rights and real cases')}</h2><p>${tr('此存档未记录单只证券的期权合约。行业走势、配置和因子回测仍可继续使用。','This save has no individual-security option contracts. Sector trends, allocation and factor backtests remain available.')}</p><button id="legacy-show-market">${tr('查看行业走势','View sector trends')}</button>${window.FactorLabReplayUI?.optionsIntro(null)||''}`;
  $('legacy-show-market').onclick=()=>document.querySelector('[data-evidence-tab="market"]').click();return;
 }
 if(tab==='fundamentals'){
  root.innerHTML=`<div class="panel-head"><h2>${tr('行业数据','Sector data')}</h2><span class="source-badge">${tr('模拟指数 · 起始 100','Simulated index · starts at 100')}</span></div><p class="footnote">${tr('此存档记录行业指数，未记录个股财报。','This save records sector indices, without individual-company financial statements.')}</p><div class="table-scroll" tabindex="0" role="region" aria-label="${tr('行业数据，可左右滑动','Sector data, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr><th>${tr('行业','Sector')}</th><th>${tr('当前指数','Current index')}</th><th>${tr('本局累计涨跌','Change since start')}</th><th>${tr('已确认占比','Confirmed weight')}</th></tr></thead><tbody>${s.prices.map((value,i)=>`<tr><td>${sector(i)}</td><td>${num(value,4)}</td><td>${num((value/history[0].prices[i]-1)*100)}%</td><td>${num(s.weights[i]*100)}%</td></tr>`).join('')}</tbody></table></div>${window.FactorLabReplayUI?.industryCards()||''}`;return;
 }
 if(!/^sector-[0-4]$/.test(instrument))instrument='sector-0';
 const index=Number(instrument.slice(-1)),points=history.filter(row=>Number.isFinite(row.prices?.[index])).map(row=>({day:row.day,value:row.prices[index]})),visible=points.slice(-range),last=points.at(-1);
 root.innerHTML=`<div class="panel-head"><h2>${tr('行业走势','Sector trends')}</h2><span class="source-badge">${tr('模拟指数 · 起始 100','Simulated index · starts at 100')}</span></div><div class="evidence-toolbar"><label>${tr('行业','Sector')} <select id="market-instrument">${s.prices.map((_,i)=>`<option value="sector-${i}" ${i===index?'selected':''}>${sector(i)}</option>`).join('')}</select></label><label>${tr('区间','Range')} <select id="market-range">${[10,30,90,365].map(n=>`<option value="${n}" ${n===range?'selected':''}>${n===365?tr('全部','All'):n+tr(' 个观测',' observations')}</option>`).join('')}</select></label></div><div class="price-readout"><span>${tr('最近可见指数','Latest visible index')}</span><strong>${num(last?.value)} <small>${tr('点','points')}</small></strong><span>${dayLabel(last?.day)}</span></div><div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('图表脚本未加载，价格数据仍可查看。','Chart script did not load. Price data remain available.')}</p><details class="price-data"><summary>${tr('查看指数数据','View index data')} · ${visible.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('模拟日','Simulation day')}</th><th>${tr('指数点位','Index level')}</th></tr></thead><tbody>${visible.map(point=>`<tr><td>${dayLabel(point.day)}</td><td>${num(point.value,4)}</td></tr>`).join('')}</tbody></table></div></details><details class="material-provenance"><summary>${tr('来源与计算口径','Source & method')}</summary><p>${tr('来自本局已经推进的行业模拟记录，起始值为 100。指数点位表示行业表现，不是单只股票的美元价格；原有进度与收益记录保持不变。','From this campaign’s completed sector simulation steps, starting at 100. Index points represent sector performance, not an individual stock’s dollar price. Progress and return records are preserved.')}</p></details>`;
 FactorVisuals.chart($('evidence-price-chart'),{rows:visible,series:[{key:'value',name:tr('指数点位','Index level'),color:'#675c48'}],label:sector(index),format:v=>num(v),xLabel:p=>dayLabel(p.day)});
 $('market-instrument').onchange=e=>{instrument=e.target.value;renderEvidence();};$('market-range').onchange=e=>{range=Number(e.target.value);renderEvidence();};
}
function tableMaterial(r){
let rows=r.data?.rows||[];if(tab==='options'&&optionSide!=='all')rows=rows.filter(row=>String(row.side||row.optionType||row.type).toLowerCase()===optionSide.toLowerCase());
const keys=tab==='options'?['underlying','expiry','side','strike','bid','ask','volume','openInterest','iv']:['instrumentId','periodEnd','publishedAt','firstAvailableAt','priceObservedAt','revenue','profit','pe','roe'];
const labels={underlying:tr('标的','Underlying'),expiry:tr('到期日','Expiry'),side:'Call/Put',strike:tr('行权价','Strike'),bid:'Bid',ask:'Ask',volume:tr('成交量','Volume'),openInterest:'OI',iv:'IV %',instrumentId:tr('证券','Security'),periodEnd:tr('报告期结束','Period end'),publishedAt:tr('对外公布','Published'),firstAvailableAt:tr('平台首次可见','First visible here'),priceObservedAt:tr('估值报价日','Price observed'),revenue:tr('收入','Revenue'),profit:tr('利润','Profit'),pe:'P/E',roe:'ROE'};
const dateKeys=['periodEnd','publishedAt','firstAvailableAt','priceObservedAt'];
const cell=(k,row)=>{const value=row[k];if(value===null||value===undefined)return '—';if(dateKeys.includes(k))return esc(String(value).slice(0,10));if(['iv','roe'].includes(k)&&Number.isFinite(value))return num(value*100)+'%';if(['underlying','instrumentId'].includes(k))return esc(securityName(value));return esc(name(value??(k==='side'?row.optionType:undefined)))||'—';};
return `<article><h3>${esc(title(r))}</h3>${meta(r)}<div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr>${keys.map(k=>`<th>${labels[k]}</th>`).join('')}<th>${tr('引用行','Cite row')}</th></tr></thead><tbody>${rows.map(row=>`<tr>${keys.map(k=>`<td>${cell(k,row)}</td>`).join('')}<td>${actions(r,{rowId:row.id||row.rowId||row.contractId})}</td></tr>`).join('')}</tbody></table></div><details><summary>${tr('解读与缺失值','Interpretation & missing data')}</summary><p>${esc(name(r.interpretation))}</p>${tab==='fundamentals'?`<p>${tr('P/E 使用该报告期每股收益，不是滚动十二个月口径；ROE 为期间净利润 / 期末权益的教学近似值，不能直接作跨公司估值结论。','P/E uses period EPS, not trailing twelve months. ROE is a teaching proxy using period net income / ending equity; these are not directly comparable valuation conclusions.')}</p>`:''}<p>${tr('— 表示缺失，不按零计算。OI 和 Call 活跃度不能单独确定涨跌；IV 是隐含波动率，不是上涨概率。','— means missing, not zero. OI and Call activity alone do not determine price direction. IV is implied volatility, not an upside probability.')}</p></details></article>`;
}
function showMaterial(ref){
 ref=FactorLabEvidence.resolveReference(view(),ref);currentRef=ref;const r=records().find(x=>x.id===ref.id&&x.snapshotId===ref.snapshotId)||ref,data=ref.data??r.data;
 const labels={time:tr('日期','Date'),value:tr('价格 USD','Price USD'),underlying:tr('标的','Underlying'),expiry:tr('到期日','Expiry'),side:tr('类型','Type'),strike:tr('行权价','Strike'),bid:tr('买方报价','Bid'),ask:tr('卖方报价','Ask'),volume:tr('成交量','Volume'),openInterest:tr('未平仓合约','Open interest'),iv:tr('隐含波动率','Implied volatility'),instrumentId:tr('证券','Security'),revenue:tr('收入（百万美元）','Revenue USD m'),netProfit:tr('净利润（百万美元）','Net profit USD m'),pe:tr('市盈率','P/E'),roe:tr('权益回报率','ROE'),momentum:tr('动量','Momentum'),samples:tr('观测数','Observations')};
 const rows=data.points||data.rows||[],keys=Object.keys(labels).filter(k=>rows.some(row=>k in row));
 const format=(k,v)=>v===null||v===undefined?'—':['underlying','instrumentId'].includes(k)?securityName(v):['iv','roe','momentum'].includes(k)?num(v*100)+'%':typeof v==='number'?num(v,k==='value'?4:2):String(v).replace('T16:00:00.000Z','');
 const table=rows.length?`<div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr>${keys.map(k=>`<th>${labels[k]}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${keys.map(k=>`<td>${esc(format(k,row[k]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<p>${esc(name(data.text||data.body)||'')}</p>`;
 $('material-title').textContent=title(r);$('material-body').innerHTML=`<span class="source-badge">${esc(mode(r))}</span>${ref.selection.from!==undefined?`<p>${esc(ref.periodStart?.slice(0,10))} — ${esc(ref.periodEnd?.slice(0,10))}</p>`:''}${table}${actions(r,ref.selection||{})}${meta(r)}<details><summary>${tr('完整数据记录','Full data record')}</summary><pre class="material-json">${esc(JSON.stringify({selection:ref.selection,data},null,2))}</pre></details>`;
 bindActions($('material-body'));$('material-body').querySelector('[data-material-open]')?.remove();$('material-detail').showModal();
 document.dispatchEvent(new CustomEvent('factorlab:material-open',{detail:{id:ref.id}}));
}
function openReference(id){if(typeof id==='object')return showMaterial(id);const ref=[...(ui().chatAttachments||[]),...(ui().evidenceSelections||[]),...(view().results||[]).flatMap(r=>r.evidenceSelections||[])].find(r=>r.id===id);if(ref)return showMaterial(ref);const r=records().find(r=>r.id===id);if(r)return showMaterial(chosen(r));window.FactorLabWorkspace.go('research');const old=document.querySelector(`[data-evidence="${CSS.escape(id)}"]`);old?.click();}
function renderAllocation(){
 if(!app())return;const expanded=[...$('securities-allocation').querySelectorAll('details[open][data-detail-key]')].map(el=>el.dataset.detailKey);const root=$('securities-allocation'),s=view(),pending=s.phase==='decision',l=s.ledger,transaction=l?.transactions.findLast(t=>t.day===(s.round-1)*s.daysPerRound),p=pending?app().preview():{ok:true,rows:(l?.holdings||[]).map(h=>({...h,targetAmount:h.marketValue,targetWeight:h.marketValue/s.nav})),cash:l?.cash,fee:transaction?.fee||0,buys:s.nav-(l?.cash||0)};if($('money-flow'))window.echarts?.getInstanceByDom($('money-flow'))?.dispose();if(!s.ledger){root.innerHTML=`<div class="panel-head"><h2>${tr('行业配置','Sector allocation')}</h2><span class="source-badge">${pending?tr('配置预览','Allocation preview'):tr('当前持仓','Current holdings')}</span></div><div class="ledger-summary"><div><span>${tr('已确认总资产','Confirmed assets')}</span><strong>${money(s.nav)}</strong></div>${pending?`<div><span>${tr('预计费用','Estimated fees')}</span><strong>${money(p.fee)}</strong></div>`:''}</div>${legacyHoldings(s,pending?p:null)}<p class="footnote">${tr('本局按行业持有模拟资产，金额来自原有存档。','This campaign holds simulated sector assets. Amounts come from the existing save.')}</p>`;return;}
 const rows=p.rows||[];root.innerHTML=`<div class="panel-head"><h2>${tr('资金具体买了什么','Where the virtual funds go')}</h2><span class="source-badge draft-label">${pending?tr('配置预览','Allocation preview'):tr('当前持仓','Current holdings')}</span></div><p class="footnote">${tr('每个行业分散持有下列模拟证券。点击名称可了解它做什么。','Each sector holds the simulated securities below. Select a name to learn more.')}</p><div class="ledger-summary"><div><span>${tr('已确认总资产','Confirmed assets')}</span><strong>${money(s.nav)}</strong></div><div><span>${pending?tr('预计买入','Estimated buys'):tr('已投资','Invested')}</span><strong>${money(p.buys)}</strong></div><div><span>${pending?tr('预计费用','Estimated fees'):tr('本轮已付费用','Fees paid this round')}</span><strong>${money(p.fee)}</strong></div><div><span>${pending?tr('成交后现金','Cash after trade'):tr('当前现金','Current cash')}</span><strong>${money(p.cash)}</strong></div></div><div id="money-flow" class="flow-chart"></div><div class="sector-breakdown">${[0,1,2,3,4].map(i=>{const holdings=rows.filter(r=>r.sectorIndex===i),amount=holdings.reduce((sum,r)=>sum+r.targetAmount,0),share=s.nav?amount/s.nav*100:0;return `<details data-detail-key="sector-${i}"><summary><span class="sector-flow-name">${sector(i)}</span><strong>${money(amount)}</strong><span class="sector-flow-share">${num(share,1)}%</span><span class="sector-flow-bar" aria-hidden="true"><i data-share="${Math.max(0,Math.min(100,share))}"></i></span></summary><ul>${holdings.map(r=>`<li><button class="text-button" data-security="${esc(r.id||r.instrumentId)}">${esc(securityName(r.id||r.instrumentId||r.symbol))}</button><strong>${money(r.targetAmount)}</strong></li>`).join('')}</ul></details>`;}).join('')}<div class="flow-balance"><span>${tr('现金','Cash')}</span><strong>${money(p.cash)}</strong></div><div class="flow-balance"><span>${pending?tr('预计费用','Estimated fees'):tr('本轮已付费用','Fees paid this round')}</span><strong>${money(p.fee)}</strong></div></div><details class="trade-table-details" data-detail-key="trades"><summary>${pending?tr('查看交易明细：数量、价格与费用','Trade details: quantities, prices & fees'):tr('查看持仓明细','Holding details')}</summary>${securityTable(rows,pending)}</details><details class="material-provenance" data-detail-key="fees"><summary>${tr('费用与成交说明','Fees & execution')}</summary><p>${tr('交易以模拟报价执行，支持小数份额，费用从现金扣除；表中金额已预留费用。','Trades use simulated quotes and fractional shares. Fees are deducted from cash and reserved in the displayed amounts.')}</p></details>`;
 if(window.echarts&&$('money-flow').clientWidth){const chart=echarts.init($('money-flow'),null,{renderer:'svg'}),nodes=[{name:tr('虚拟组合','Virtual portfolio')},...Array.from({length:5},(_,i)=>({name:sector(i)})),...rows.map(r=>({name:securityName(r.id||r.instrumentId)})),{name:tr('现金','Cash')},{name:tr('费用','Fees')}],source=nodes[0].name,links=[];for(let i=0;i<5;i++){links.push({source,target:sector(i),value:rows.filter(r=>r.sectorIndex===i).reduce((a,r)=>a+r.targetAmount,0)});rows.filter(r=>r.sectorIndex===i).forEach(r=>links.push({source:sector(i),target:securityName(r.id||r.instrumentId),value:r.targetAmount}));}links.push({source,target:tr('现金','Cash'),value:p.cash||0},{source,target:tr('费用','Fees'),value:pending?p.fee||0:0});chart.setOption({animation:false,tooltip:{trigger:'item',valueFormatter:v=>money(v)},series:[{type:'sankey',data:nodes,links:links.filter(l=>l.value>0),emphasis:{focus:'adjacency'},lineStyle:{color:'source',opacity:.3},label:{color:'#36332e'},left:10,right:150,nodeWidth:14,nodeGap:14}]});chart.on('click',e=>{const r=rows.find(r=>securityName(r.id||r.instrumentId)===e.name);if(r)instrumentDetail(r.id||r.instrumentId);});}
 root.querySelectorAll('.sector-flow-bar i').forEach(el=>{el.style.width=el.dataset.share+'%';});
 root.querySelectorAll('[data-detail-key]').forEach(el=>{el.open=expanded.includes(el.dataset.detailKey);});
 root.querySelectorAll('[data-security]').forEach(b=>b.onclick=()=>instrumentDetail(b.dataset.security));
}
function legacyHoldings(s,preview){
 const projected=preview?.ok,amounts=projected?preview.weights.slice(0,5).map(w=>w*preview.after):s.units.map((units,i)=>units*s.prices[i]),cash=projected?preview.cash:s.cash,total=projected?preview.after:s.nav;
 return `<div class="legacy-holdings">${[...amounts,cash].map((amount,i)=>`<div class="flow-balance" data-sector-index="${i}"><span>${i===5?tr('现金','Cash'):sector(i)}<small>${num(amount/total*100)}%</small></span><strong>${money(amount)}</strong></div>`).join('')}</div>`;
}
function sector(i){return (en()?['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure']:['半导体','机器人','先进材料','清洁能源','AI 基础设施'])[i];}
function securityTable(rows,draft){return `<div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr>${(draft?[tr('证券 / 类型','Security / type'),tr('行业','Sector'),tr('目标比例','Target weight'),tr('费用前预算','Gross budget'),tr('目标金额','Target value'),tr('数量','Quantity'),tr('价格 USD','Price USD'),tr('金额变化','Value change'),tr('费用','Fee')]:[tr('证券','Security'),tr('行业','Sector'),tr('数量','Quantity'),tr('价格 USD','Price USD'),tr('市值 USD','Value USD')]).map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><button data-security="${esc(r.id||r.instrumentId)}">${esc(securityName(r.id||r.instrumentId||r.symbol))}</button></td><td>${sector(r.sectorIndex)}</td>${draft?`<td>${num(r.targetWeight*100)}%</td><td>${num(r.requestedAmount)}</td><td>${num(r.targetAmount)}</td><td>${num(r.quantity,6)}</td><td>${num(r.price,4)}</td><td>${num(r.delta)}</td><td>${num(r.fee)}</td>`:`<td>${num(r.quantity,6)}</td><td>${num(r.price,4)}</td><td>${num(r.marketValue)}</td>`}</tr>`).join('')}</tbody></table></div>`;}
function instrumentDetail(id){const h=view().ledger?.holdings.find(r=>r.id===id)||app().preview().rows?.find(r=>(r.id||r.instrumentId)===id);if(!h)return;const related=records().filter(r=>r.instrumentIds?.includes(id));$('material-title').textContent=securityName(h.id);$('material-body').innerHTML=`<p>${sector(h.sectorIndex)} · ${tr('模拟股票','Simulated stock')}</p><p>${tr('它代表这个行业中从事“','It represents a business focused on ')}${esc(securityName(h.id))}${tr('”业务的一类企业。调整行业比例时，系统按固定篮子比例分配到这些股票。',' within this sector. Sector weights are divided among these stocks using fixed basket weights.')}</p><details class="material-provenance"><summary>${tr('证券编号与练习规则','Identifier & exercise rules')}</summary><p>${esc(h.symbol)} · ${tr('SIM 表示模拟；这些编号不是交易所股票代码。使用美元计价，允许小数份额。','SIM means simulated. These are not exchange tickers. Prices use USD and fractional shares are allowed.')}</p></details><p>${tr('当前报价','Current quote')} ${money(h.price)} · ${esc(h.priceTime)}</p>${related.map(r=>`<h3>${esc(title(r))}</h3>${meta(r)}${actions(r)}`).join('')}`;bindActions($('material-body'));$('material-detail').showModal();}
function chartRows(s){const rows=[...s.history];if(Math.abs((rows.at(-1)?.nav||0)-s.nav)>1e-6)rows.push({...rows.at(-1),day:String(s.day)+tr(' · 成交后',' · post-trade'),nav:s.nav});return rows;}
function renderAssets(){if(!app())return;const s=view(),l=s.ledger;$('asset-total').textContent=money(s.nav);const roundStart=s.history.find(h=>h.day===(s.round-1)*s.daysPerRound)?.nav||100000;const change={returnValue:s.nav/roundStart-1};$('asset-summary').innerHTML=`<div class="asset-summary"><div><span>${tr('总资产','Total assets')}</span><strong>${money(s.nav)}</strong></div><div><span>${tr('现金','Cash')}</span><strong>${money(l?l.cash:s.cash)}</strong></div><div><span>${tr('已投资','Invested')}</span><strong>${money(s.nav-(l?l.cash:s.cash))}</strong></div><div><span>${tr('当轮收益率','Round return')}</span><strong>${num((change?.returnValue??0)*100)}%</strong></div></div>`;
 if(!$('asset-sheet').open)return;if(l){$('asset-holdings').innerHTML=securityTable(l.holdings,false);$('asset-holdings').querySelectorAll('[data-security]').forEach(b=>b.onclick=()=>instrumentDetail(b.dataset.security));$('asset-transactions').innerHTML=`<h3>${tr('交易记录','Transactions')}</h3><div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr><th>${tr('时间','Time')}</th><th>${tr('交易 / 费用','Trade / fees')}</th></tr></thead><tbody>${l.transactions.flatMap(t=>(t.rows||[]).filter(r=>Math.abs(r.deltaQuantity)>0).map(r=>`<tr><td>${esc(t.executionTime)}</td><td>${esc(securityName(r.id||r.instrumentId||r.symbol))} · ${r.deltaQuantity>0?tr('买入','Buy'):tr('卖出','Sell')} ${num(Math.abs(r.deltaQuantity),6)} × ${num(r.price,4)} USD · ${tr('费用','Fee')} ${money(r.fee)}</td></tr>`)).join('')}</tbody></table></div>`;}
 if(!l){$('asset-holdings').innerHTML=legacyHoldings(s);$('asset-transactions').innerHTML=`<p class="footnote">${tr('此存档按行业记录持仓，未记录单只证券成交。','This save records sector holdings without individual-security trades.')}</p>`;}
 if($('asset-sheet').dataset.size==='large')FactorVisuals.chart($('asset-chart'),{rows:chartRows(s),series:[{key:'nav',name:tr('资产金额 USD','Asset value USD'),color:'#665a44'}],label:tr('虚拟资产金额','Virtual asset value'),format:num,xLabel:r=>String(r.day)});
}
function renderReview(){const s=view(),l=s.ledger,root=$('ledger-review');if($('review-asset-chart'))window.echarts?.getInstanceByDom($('review-asset-chart'))?.dispose();if(!l){root.innerHTML='';return;}const result=s.results?.at(-1);const history=l.history||[],startDay=Math.max(0,(s.round-1)*s.daysPerRound),period=history.filter(r=>r.day>startDay),contributions={};let fees=l.unpostedFee||0,cashReturn=0;for(const row of period){Object.entries(row.contributions||{}).forEach(([id,value])=>contributions[id]=(contributions[id]||0)+value);fees+=row.fee||0;cashReturn+=row.cashContribution||0;}const total=Object.values(contributions).reduce((a,b)=>a+b,0)+cashReturn-fees;root.innerHTML=`<h2>${tr('收益来自哪里','Where returns come from')}</h2><p>${tr('证券盈亏与现金收益，扣除费用后组成资产变化。','Security gains and cash returns, less fees, make up your asset change.')}</p><div class="ledger-summary"><div><span>${tr('证券贡献','Security P&L')}</span><strong>${money(Object.values(contributions).reduce((a,b)=>a+b,0))}</strong></div><div><span>${tr('现金收益','Cash return')}</span><strong>${money(cashReturn)}</strong></div><div><span>${tr('费用','Fees')}</span><strong>${money(fees)}</strong></div><div><span>${tr('合计变化','Total change')}</span><strong>${money(total)}</strong></div></div><div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr><th>${tr('证券','Security')}</th><th>${tr('收益贡献 USD','P&L contribution USD')}</th></tr></thead><tbody>${Object.entries(contributions).map(([id,v])=>`<tr><td>${esc(securityName(id))}</td><td>${num(v)}</td></tr>`).join('')}</tbody></table></div><div id="review-asset-chart" class="standard-chart"></div>`;if(root.getClientRects().length)FactorVisuals.chart($('review-asset-chart'),{rows:chartRows(s),series:[{key:'nav',name:tr('组合资产 USD','Portfolio USD'),color:'#665a44'},{key:'benchmarkNav',name:tr('行业基准 USD','Sector benchmark USD'),color:'#969085',dash:true}],label:tr('资产与基准金额','Assets and benchmark value'),format:num,xLabel:r=>String(r.day)});}
function renderFactors(){
 if(!app()||window.FactorLabWorkspace?.getView()!=='backtest')return;const r=records().find(r=>r.type==='factors');if(!r)return;let host=$('factor-observations');if(!host){host=document.createElement('section');host.id='factor-observations';host.className='panel';$('backtest-content').prepend(host);}
 const rows=r.data.rows||[],ranked=rows.filter(x=>Number.isFinite(x.momentum)).sort((a,b)=>b.momentum-a.momentum);
 host.innerHTML=`<div class="factor-compare"><h2>${tr('两个实验回答不同问题','Two experiments answer different questions')}</h2><div class="compare-grid"><div><h3>${tr('当前证券日频快照','Current daily security snapshot')}</h3><p>${tr('21 个账本价格点形成 20 个日收益；热身段排除。当前可算动量与低波，价值与质量未测。配置遵守单行业 40% 上限并计费用。','21 ledger prices form 20 daily returns; warm-up excluded. Momentum and low volatility are computable; value and quality are untested. Allocation keeps the 40% sector cap and fees.')}</p></div><div><h3>${tr('独立月频策略实验','Separate monthly strategy experiment')}</h3><p>${tr('5 个行业，6 个月预热后逐月评估 36 个月；四因子 Spearman Rank IC、有效月份与缺失月份。前二各 50%，五行业等权基准，零交易费。','Five sectors, six warm-up months then 36 monthly evaluations; four-factor Spearman Rank IC with valid and missing months. Top two at 50% each, equal-sector benchmark, zero costs.')}</p></div></div><p class="footnote">${tr('下方月频结果要持续标为“合成教学回测”；一次排名或一次盈利不能证明真实市场有效。','The monthly result must stay labelled “synthetic teaching backtest”; one ranking or one profit does not establish real-market efficacy.')}</p></div><h2>${tr('当前证券因子快照','Current security factor snapshot')}</h2>${meta(r)}<p>${tr('以下来自本局已发生价格；下方36个月四因子回测是独立教学练习。Value / Quality 在当前价格研究中未测。','These values use observed prices in this campaign. The 36-month four-factor backtest below is a separate teaching exercise. Value / Quality are untested in this price study.')}</p><div class="table-scroll" tabindex="0" role="region" aria-label="${tr('数据表，可左右滑动','Data table, scroll horizontally')}" data-scroll-label="${tr('左右滑动，查看更多列','Swipe to see more columns')}"><table><thead><tr><th>${tr('证券','Security')}</th><th>Momentum</th><th>${tr('动量排名','Momentum rank')}</th><th>LowVol</th><th>Value</th><th>Quality</th><th>n / 20</th><th>${tr('引用','Reference')}</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${esc(securityName(row.instrumentId))}</td><td>${num(row.momentum===null?null:row.momentum*100)}%</td><td>${ranked.includes(row)?ranked.indexOf(row)+1:'—'}</td><td>${num(row.lowVol,6)}</td><td>${tr('未测','Untested')}</td><td>${tr('未测','Untested')}</td><td>${row.samples} / 20</td><td>${actions(r,{rowId:row.id})}</td></tr>`).join('')}</tbody></table></div>`;bindActions(host);
}
const coachDrawer=$('coach-drawer'),mobileCoach=matchMedia('(max-width:767px)'),coachViewport=window.visualViewport;
function fitCoachDrawer(){
 if(!coachDrawer.open)return;
 const fitted=!!(mobileCoach.matches&&coachViewport?.scale===1&&coachViewport.height>0);
 coachDrawer.toggleAttribute('data-visual-viewport',fitted);
 coachDrawer.toggleAttribute('data-compact',fitted&&coachViewport.height<400);
 if(fitted){
  coachDrawer.style.setProperty('--coach-visible-height',Math.floor(coachViewport.height)+'px');
  coachDrawer.style.setProperty('--coach-visible-top',Math.round(coachViewport.offsetTop)+'px');
 }
}
function openChat(){
 const detail=$('material-detail');
 if(detail.open)detail.close();
 if(!coachDrawer.open){
  chatReturn=document.activeElement;
  if(mobileCoach.matches)coachDrawer.showModal();else coachDrawer.show();
 }
 fitCoachDrawer();
}
coachViewport?.addEventListener('resize',fitCoachDrawer);
coachViewport?.addEventListener('scroll',fitCoachDrawer);
window.addEventListener('resize',fitCoachDrawer);
window.addEventListener('pageshow',fitCoachDrawer);
$('coach-drawer').addEventListener('close',()=>{const target=chatReturn?.isConnected&&chatReturn.getClientRects().length?chatReturn:$('open-coach');target?.focus({preventScroll:true});});
function showChartFallback(){chartsFailed=true;['price-chart-fallback','nav-chart-fallback'].forEach(id=>{const host=$(id);if(host)host.hidden=false;});}
document.addEventListener('factorlab:charts-failed',showChartFallback);document.addEventListener('factorlab:charts-ready',()=>{chartsFailed=false;['price-chart-fallback','nav-chart-fallback'].forEach(id=>{const host=$(id);if(host)host.hidden=true;});});
function sync(){if(!app())return;const s=view();renderAssets();const key=JSON.stringify([s.day,s.phase,ui().lang,ui().campaignEpoch,ui().profileId]);if(key!==lastKey){lastKey=key;renderEvidence();renderReview();renderFactors();}if(chartsFailed)showChartFallback();renderAllocation();}
function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});}
$('open-assets').onclick=()=>{$('asset-sheet').showModal();renderAssets();};$('close-assets').onclick=()=>$('asset-sheet').close();const resize=()=>{$('asset-sheet').dataset.size=$('asset-sheet').dataset.size==='large'?'medium':'large';setTimeout(renderAssets,310);};let dragged=false;$('asset-resize').onclick=()=>{if(dragged){dragged=false;return;}resize();};$('asset-details-toggle').onclick=resize;let startY=null;$('asset-resize').onpointerdown=e=>{startY=e.clientY;e.target.setPointerCapture(e.pointerId);};$('asset-resize').onpointerup=e=>{if(startY!==null&&Math.abs(e.clientY-startY)>25){dragged=true;$('asset-sheet').dataset.size=e.clientY<startY?'large':'medium';setTimeout(renderAssets,310);}startY=null;};$('close-material').onclick=()=>$('material-detail').close();$('expand-coach').onclick=()=>$('coach-drawer').classList.toggle('expanded');
document.querySelectorAll('[data-evidence-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.evidenceTab;window.FactorLabWorkspace.setEvidenceTab(tab);window.FactorLabWorkspace.go('research').then(renderEvidence);});
document.addEventListener('factorlab:charts-ready',renderAllocation);document.addEventListener('factorlab:render',queue);document.addEventListener('factorlab:draft',queue);document.addEventListener('factorlab:view',()=>{renderEvidence();renderAllocation();renderReview();renderFactors();});window.addEventListener('resize',queue);$('coach-drawer').addEventListener('keydown',e=>{if(e.key==='Escape')$('coach-drawer').close();});window.FactorLabStudio={openReference,openChat,securityName,referenceLabel:ref=>title(ref),render:sync};sync();
})();

;
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
    let introduction=false;
    try{introduction=!localStorage.getItem('factorlab-companion-introduction-v1')&&window.FactorLabApp.getState().day===0;}catch{}
    const charts=()=>load('echarts.min.js').then(ok=>{
      document.dispatchEvent(new Event(ok&&window.echarts?'factorlab:charts-ready':'factorlab:charts-failed'));
      if(!ok||!window.echarts){const timer=setInterval(()=>{if(window.echarts){clearInterval(timer);document.dispatchEvent(new Event('factorlab:charts-ready'));}},1200);setTimeout(()=>clearInterval(timer),30000);}
    });
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(introduction)setTimeout(charts,700);else void charts();
    }));
  }
  const observer=new MutationObserver(start);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  document.addEventListener('factorlab:render',start);
  document.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)void load('anime.js');},{once:true});
  window.FactorLabEnhancements={loadBadge:()=>load('lottie.js'),loadCharts:()=>load('echarts.min.js')};
  start();
})();

;
(() => {
  'use strict';
  const valid = value => typeof value === 'string' && /^[a-f\d]{12,64}$/i.test(value);
  const installed = document.querySelector('meta[name="factorlab-version"]')?.content;
  if (!valid(installed)) return;

  const endpoint = new URL('./version.json', location.href);
  if (endpoint.origin !== location.origin) return;
  const firstCheck = Date.now() + 20000;
  let timer = null, pending = null, timeout = null, lastCheck = -Infinity;
  let available = '', dismissed = '', notice = null, message = null, apply = null, exportButton = null, later = null;
  let saving = false, failed = false, activePage = true;
  const visible = () => activePage && document.visibilityState === 'visible';
  const translations = {
    'zh-CN': {ready:'有新版本，可保存进度后更新。', action:'保存并更新', saving:'正在保存到此浏览器…', failed:'保存失败。请先导出进度并确认文件已保存，再手动刷新。', export:'导出进度', later:'稍后更新'},
    en: {ready:'A new version is available. Save progress before updating.', action:'Save and update', saving:'Saving to this browser…', failed:'Save failed. Export progress and confirm the file is saved before refreshing manually.', export:'Export progress', later:'Update later'}
  };
  function translate() {
    if (!notice) return;
    const lang = window.FactorLabApp?.getUI?.().lang || document.documentElement.lang;
    const text = translations[lang] || translations['zh-CN'];
    message.textContent = text[failed ? 'failed' : 'ready'];
    apply.textContent = text[saving ? 'saving' : 'action'];
    exportButton.textContent = text.export;
    exportButton.hidden = !failed;
    later.textContent = text.later;
  }
  function update() {
    if (saving || !available) return;
    saving = true; failed = false; apply.disabled = true; translate();
    let saved = null;
    const acknowledge = event => { saved = event.detail; };
    document.addEventListener('factorlab:save', acknowledge);
    try {
      const button = document.getElementById('save-now');
      if (!button || button.disabled) throw Error('Save unavailable');
      button.click();
      const ui = window.FactorLabApp?.getUI?.();
      if (!saved || ui?.writable !== true || saved.profileId !== ui.profileId) throw Error('Save not confirmed');
      const destination = new URL(location.href);
      destination.searchParams.set('build', available);
      location.assign(destination.href);
    } catch {
      saving = false; failed = true; apply.disabled = false; translate();
    } finally {
      document.removeEventListener('factorlab:save', acknowledge);
    }
  }
  function show(version) {
    available = version;
    if (version === dismissed) { if (notice) notice.hidden = true; return; }
    if (!notice) {
      notice = document.createElement('aside'); notice.id = 'pages-update';
      notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite');
      message = document.createElement('p'); message.id = 'pages-update-message';
      apply = document.createElement('button'); apply.id = 'pages-update-apply'; apply.type = 'button';
      exportButton = document.createElement('button'); exportButton.id = 'pages-update-export'; exportButton.type = 'button';
      later = document.createElement('button'); later.id = 'pages-update-later'; later.type = 'button';
      apply.addEventListener('click', update);
      exportButton.addEventListener('click', () => document.getElementById('export-save')?.click());
      later.addEventListener('click', () => { dismissed = available; notice.hidden = true; });
      notice.append(message, apply, exportButton, later); document.body.append(notice);
    }
    notice.hidden = false;
    translate();
  }
  function schedule(delay) {
    clearTimeout(timer); timer = null;
    if (visible() && !pending) timer = setTimeout(check, delay);
  }
  function wake() {
    schedule(Math.max(0, firstCheck - Date.now(), lastCheck + 15000 - Date.now()));
  }
  async function check() {
    timer = null;
    if (!visible() || pending) return;
    lastCheck = Date.now();
    const controller = new AbortController(); pending = controller;
    timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(endpoint.href, {cache:'no-store', mode:'same-origin', credentials:'same-origin', redirect:'error', signal:controller.signal});
      if (!response.ok) return;
      if (response.url && new URL(response.url).origin !== location.origin) return;
      const result = await response.json();
      if (controller.signal.aborted || !visible() || !valid(result?.id)) return;
      if (result.id.toLowerCase() !== installed.toLowerCase()) show(result.id.toLowerCase());
    } catch {
    } finally {
      clearTimeout(timeout); timeout = null; pending = null;
      schedule(60000);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (visible()) wake();
    else { clearTimeout(timer); timer = null; clearTimeout(timeout); timeout = null; pending?.abort(); }
  });
  document.addEventListener('factorlab:render', translate);
  window.addEventListener('focus', () => { if (visible()) wake(); });
  window.addEventListener('pagehide', () => { activePage = false; clearTimeout(timer); clearTimeout(timeout); pending?.abort(); });
  window.addEventListener('pageshow', () => { activePage = true; wake(); });
  schedule(20000);
})();
