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
