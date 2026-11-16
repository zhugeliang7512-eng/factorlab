(function () {
  'use strict';
  const scriptBase = new URL('.', document.currentScript.src);
  const mediaBase = new URL('assets/guide/', scriptBase);
  const guideContent = window.FactorLabGuideContent;
  const content = guideContent.cues;
  const $ = id => document.getElementById(id);
  const selectedCharacter = () => $('research-pet')?.value === 'kurumi' ? 'kurumi' : 'knight';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seenKey = 'factorlab-companion-introduction-v1';
  const soundKey = 'factorlab-companion-sound-v1';
  const voiceKey = 'factorlab-companion-voice-v1';
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key,value); } catch {} };
  const audio = new Audio();
  audio.preload = 'auto';
  let voice = read(voiceKey,'en');
  if (!['en','zh'].includes(voice)) voice = 'en';
  let sound = read(soundKey,'on') !== 'off', sessionMuted = false;
  let panel, dock, task, activeKey = '', subtitleIndex = -1, revision = 0;
  let opening = false, triedOpening = false, initialized = false, destroyed = false;
  let animation, positionFrame, metadata, identity, currentPhase, lastEventKey = '';
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
  function position() {
    positionFrame = null;
    if (!panel || panel.hidden || dock.hidden) return;
    const rect = dock.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
    const top = viewport?.offsetTop || 0, left = viewport?.offsetLeft || 0;
    const mobile = width < 768;
    panel.style.maxWidth = Math.min(370,width-24)+'px';
    panel.style.left = (mobile ? left+12 : Math.min(rect.right+14,left+width-382))+'px';
    panel.style.bottom = (mobile ? Math.max(12,innerHeight-rect.top+10) : Math.max(18,innerHeight-rect.bottom))+'px';
    panel.style.maxHeight = Math.max(160,Math.min(height*.5,rect.top-top-12))+'px';
  }
  function queuePosition() {
    if (!positionFrame) positionFrame = requestAnimationFrame(position);
  }
  function labels() {
    const en = document.documentElement.lang === 'en';
    $('guide-title').textContent = en ? 'Your research companion' : '你的研究伙伴';
    $('guide-skip').textContent = en ? 'Skip' : '跳过';
    $('guide-close').setAttribute('aria-label',en?'Close introduction':'关闭引导');
    $('guide-mute').textContent = sound && !sessionMuted ? (en?'Mute':'静音') : (en?'Sound on':'开启声音');
    $('guide-mute').setAttribute('aria-pressed',String(!sound || sessionMuted));
    $('guide-read').textContent = en ? 'Play guidance' : '听引导';
    $('guide-direct').textContent = en ? 'Go straight to allocation' : '直接配置';
    $('guide-direct').hidden = task?.kind !== 'evidence';
    $('guide-action').textContent = window.FactorLabGuidance.actionLabel(task,document.documentElement.lang);
    $('guide-voice').value = voice;
    $('guide-audio-enabled').checked = sound;
  }
  function finishOpening() {
    if (!opening) return;
    opening = false;
    write(seenKey,'seen');
    document.body.removeAttribute('data-companion-intro');
    animation?.cancel();
    showTaskText();
    queuePosition();
  }
  async function speak() {
    stopAudio();
    if (!sound || document.hidden || panel.hidden || destroyed) return;
    const token = revision;
    void loadMetadata();
    const key = opening ? 'intro' : task.clip;
    const character = selectedCharacter();
    activeKey = key;
    subtitleIndex = -1;
    subtitle(0);
    $('guide-status').textContent = '';
    $('guide-read').hidden = false;
    const valid = () => token === revision && !panel.hidden && !document.hidden && !destroyed;
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
  function show(introduction = false, speakNow = false) {
    if (!initialized || document.hidden || document.querySelector('dialog[open]')) return;
    stopAudio();
    opening = introduction;
    panel.hidden = false;
    document.body.toggleAttribute('data-companion-intro',introduction);
    labels(); showTaskText(); position();
    if (introduction) {
      performance.mark('factorlab-guide-visible');
      document.dispatchEvent(new CustomEvent('factorlab:guide-visible',{detail:{at:performance.now()}}));
      if (!reduced.matches && $('character-motion').checked && dock.animate) {
        animation?.cancel();
        animation = dock.animate([
          {transform:'translateY(12px) scale(.6,.58)',opacity:.5,offset:0},
          {transform:'translateY(15px) scale(.67,.53)',opacity:1,offset:.15},
          {transform:'translateY(-24px) rotate(-5deg) scale(1.04)',offset:.52},
          {transform:'translateY(3px) rotate(2deg) scale(1.02,.97)',offset:.8},
          {transform:'translateY(0) rotate(0) scale(1)',offset:1}
        ],{duration:650,easing:'cubic-bezier(.22,.75,.3,1)'});
        const entrance = animation;
        const settle = () => {if (animation === entrance && !destroyed) queuePosition();};
        entrance.finished.then(settle,settle);
        panel.animate([{opacity:0,transform:'translateY(10px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:220,delay:300,fill:'backwards',easing:'ease-out'});
      }
    }
    if (speakNow && sound && !sessionMuted) void speak();
  }
  function close(muteSession = false) {
    if (!panel) return;
    if (muteSession) sessionMuted = true;
    stopAudio(); finishOpening();
    panel.hidden = true;
    document.body.removeAttribute('data-companion-intro');
    animation?.cancel();
  }
  function sync(snapshot) {
    if (!snapshot?.task || destroyed) return;
    task = snapshot.task;
    if (!initialized) return;
    labels();
    if (!panel.hidden && !opening && activeKey !== task.clip) {stopAudio();showTaskText();queuePosition();}
    const state = window.FactorLabApp.getState();
    const profile = window.FactorLabApp.getUI();
    const nextIdentity = JSON.stringify([profile.profileId,profile.campaignEpoch]);
    if (identity && identity !== nextIdentity) {close();triedOpening=false;lastEventKey='';}
    identity = nextIdentity;
    if (currentPhase === 'event' && state.phase !== 'event' && !opening) close();
    const newEvent = state.phase==='event' && task.key!==lastEventKey;
    if (newEvent && currentPhase !== undefined) {
      lastEventKey = task.key;
      if (!snapshot.focus) show(false,sound&&!sessionMuted);
    }
    currentPhase = state.phase;
    tryOpening();
  }
  function tryOpening() {
    if (!initialized || triedOpening || !window.FactorLabAccounts?.ready || document.documentElement.hasAttribute('data-auth-pending') || document.hidden) return;
    triedOpening = true;
    const state = window.FactorLabApp.getState();
    if (read(seenKey,'') || state.day>0 || state.seen?.length || state.phase!=='decision') return;
    show(true,true);
  }
  function initialize() {
    if (initialized || !window.FactorLabApp || !$('pet-dock')?.querySelector('.pet-picture') || !window.FactorLabGuidance.getState()) return;
    initialized = true;
    dock = $('pet-dock');
    panel = document.createElement('section');
    panel.id = 'companion-guide'; panel.hidden = true;
    panel.setAttribute('role','region'); panel.setAttribute('aria-labelledby','guide-title');
    panel.innerHTML = '<div class="guide-heading"><strong id="guide-title"></strong><button id="guide-close" class="guide-icon" type="button">×</button></div><div class="guide-captions"><p id="guide-caption-en" lang="en"></p><p id="guide-caption-zh" lang="zh-CN"></p></div><div class="guide-actions"><button id="guide-action" type="button" class="primary" data-guide-action></button><button id="guide-direct" type="button" class="text-button"></button></div><div class="guide-controls"><button id="guide-read" type="button"></button><button id="guide-mute" type="button"></button><select id="guide-voice" aria-label="Voice language 语音语言"><option value="en">English</option><option value="zh">中文</option></select><button id="guide-skip" type="button"></button></div><p id="guide-status" role="status"></p>';
    document.body.append(panel);
    $('guide-close').onclick = () => close(true);
    $('guide-skip').onclick = () => close(true);
    $('guide-action').onclick = () => close();
    $('guide-direct').onclick = () => {close();window.FactorLabGuidance.skip();void window.FactorLabWorkspace.go('portfolio',{focus:true});};
    $('guide-read').onclick = () => {sound=true;sessionMuted=false;write(soundKey,'on');labels();void speak();};
    $('guide-mute').onclick = () => {sound=!(sound&&!sessionMuted);sessionMuted=false;write(soundKey,sound?'on':'off');labels();if(sound)void speak();else{stopAudio();showTaskText();}};
    $('guide-voice').onchange = () => {voice=$('guide-voice').value;write(voiceKey,voice);if(sound&&!sessionMuted)void speak();};
    $('research-pet').addEventListener('change',()=>{if(panel.hidden)return;stopAudio();showTaskText();if(sound&&!sessionMuted)void speak();});
    $('replay-opening').onclick = () => {$('settings-dialog').close();sessionMuted=false;show(true,true);};
    $('guide-audio-enabled').onchange = event => {sound=event.target.checked;write(soundKey,sound?'on':'off');if(!sound)stopAudio();labels();};
    dock.addEventListener('click',()=>{if(dock.dataset.dragging)return;show(false,false);});
    sync(window.FactorLabGuidance.getState());
  }
  document.addEventListener('factorlab:guidance',event=>{initialize();sync(event.detail);});
  document.addEventListener('factorlab:render',()=>{initialize();tryOpening();});
  document.addEventListener('focusin',event=>{if(!panel?.contains(event.target)&&event.target.matches('input,textarea,[contenteditable="true"]'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();else tryOpening();});
  const authObserver = new MutationObserver(()=>{initialize();tryOpening();});
  authObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  const modalObserver = new MutationObserver(()=>{if(document.querySelector('dialog[open]'))close();});
  modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('resize',queuePosition);
  window.visualViewport?.addEventListener('resize',queuePosition);
  window.visualViewport?.addEventListener('scroll',queuePosition);
  reduced.addEventListener?.('change',()=>{animation?.cancel();});
  window.addEventListener('pagehide',event=>{
    close();
    if (event.persisted) return;
    destroyed=true;authObserver.disconnect();modalObserver.disconnect();cancelAnimationFrame(positionFrame);
    window.removeEventListener('resize',queuePosition);
    window.visualViewport?.removeEventListener('resize',queuePosition);
    window.visualViewport?.removeEventListener('scroll',queuePosition);
  });
  window.FactorLabCompanionGuide = {replay:()=>show(true,true),close:()=>close(true),dismiss:()=>close(),getState:()=>({opening,voice,character:selectedCharacter(),sound,sessionMuted,activeKey,visible:!!panel&&!panel.hidden,audioSource:audio.currentSrc||audio.src,audioTime:audio.currentTime,audioDuration:audio.duration,audioPaused:audio.paused})};
  initialize();
})();
