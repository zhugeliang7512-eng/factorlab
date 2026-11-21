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
