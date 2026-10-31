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
    const node = $('account-browser-state');
    if (node) node.textContent = t(app().getUI().writable ? 'browserSaved' : 'browserBlocked');
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
    return `<div class="account-library-heading"><div><span class="source-tag">${t('account')} · ${esc(session.user.username)}</span><h3>${t('slots')} <span class="account-count">${saves.length} / 12</span></h3></div><button data-account-action="refresh">${t('refresh')}</button></div><p id="account-server-state" class="account-service-note"></p><form id="account-new-save-form" class="account-new-save"><label for="account-save-name">${t('saveName')}</label><div><input id="account-save-name" maxlength="60" required placeholder="${t('savePlaceholder')}" ${saves.length >= 12 ? 'disabled' : ''}><button type="submit" id="account-create-save" class="primary" ${saves.length >= 12 ? 'disabled' : ''}>${t('createSave')}</button></div><small>${t(saves.length >= 12 ? 'quota' : 'nameHint')}</small></form><div id="account-slot-list" class="account-slot-list">${saves.length ? saves.map(save => `<article><div><h4>${esc(save.name)}</h4><p>${esc(t('day', { day: save.day, round: save.round }))} · ${esc(t(save.scenario))}</p><small>${esc(date(save.updatedAt))} · ${esc(t('version', { revision: save.revision }))}</small></div><div class="account-slot-actions"><button data-account-action="load" data-save-id="${esc(save.id)}">${t('load')}</button><button data-account-action="overwrite" data-save-id="${esc(save.id)}">${t('overwrite')}</button></div></article>`).join('') : `<p class="account-empty">${t('empty')}</p>`}</div>${pending ? `<section class="account-confirm" aria-label="${t('confirmLoad')}"><strong>${esc(pending.name || '')}</strong><p>${t(pending.type === 'overwrite' ? 'overwriteWarning' : 'loadWarning')}</p><div><button id="account-confirm-action" class="primary" data-account-action="confirm">${t(pending.type === 'overwrite' ? 'confirmUpdate' : 'confirmLoad')}</button><button data-account-action="cancel">${t('cancel')}</button></div></section>` : ''}<div class="account-transfer"><button data-account-action="export">${t('export')}</button>${hasRecovery() ? `<button data-account-action="recover">${t('restore')}</button>` : ''}</div>`;
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
        const next = action.type === 'recover' ? JSON.parse(localStorage.getItem(recoveryKey())) : (await request('/api/saves/' + encodeURIComponent(action.id))).save?.envelope;
        if (!next) throw Object.assign(new Error('save'), { status: 422 });
        try { if (!['factorlab-ui-v2', 'factorlab-ui-v3'].includes(next.version)) throw Error('version'); studioEngine.restore(next.game); }
        catch { throw Object.assign(new Error('save'), { status: 422 }); }
        preserveDraft(); app().loadEnvelope(next); lastSaved = null; notify(action.type === 'recover' ? 'restored' : 'loaded');
      }
      pending = null;
    } catch (error) { if (error.backup) notify('backupFailed', true); else failure(error); }
    finally { busy = false; renderDialog(); }
  }
  function exportProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(app().getEnvelope(), null, 2)], { type: 'application/json' }));
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
