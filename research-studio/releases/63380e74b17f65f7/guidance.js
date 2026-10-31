(function (root) {
  'use strict';
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
    else if (state.ledger && ui.gate?.canConfirm) task = make('confirm','调整比例后即可确认。','Adjust the weights, then confirm.','portfolio');
    else if (ui.gate?.status === 'ready') task = make('confirm','记录已齐。核对配置、现金和费用后，由你确认并锁定本轮。','Your record is ready. Check allocation, cash and costs, then confirm and lock this round.','portfolio');
    else if (ui.gate?.status === 'need_falsifier') task = make('falsifier','写清什么新信息会推翻这次判断，再核对配置。','State what new evidence would invalidate your judgment, then check the allocation.','portfolio');
    else if (ui.gate?.status === 'blocked') task = make('allocation','先修正配置或必填记录，再核对证据与可推翻条件。','Correct the allocation or required record, then check evidence and your invalidation condition.','portfolio');
    else task = make('evidence','阅读本轮公开线索，引用至少一条支持判断的证据。','Read the disclosed clues and cite at least one piece of evidence for your judgment.','research');
    const reminders = [task];
    if (progress.dirty) reminders.push(make('research-dirty','因子偏好已变化；当前图表仍是上次结果，重新回测后才能用于本次检验。','Factor preferences changed. The chart still shows the previous result; rerun the backtest for the current preferences.','backtest',false));
    if ((!progress.hasRun || !progress.hasEfficacy) && state.phase !== 'complete') reminders.push(make('course','本轮回测可选；最终课程练习仍需完成一次因子回测并查看功效。','Backtesting is optional each round. The final course exercise still requires a backtest and an efficacy review.','backtest',false));
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

  const api = {derive,feedback,createSession};
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  root.FactorLabGuidance = api;
  const $ = id => document.getElementById(id), session = createSession();
  let identity = null, focus = false, lastFeedback = null, lastFeedbackAt = 0, lastFeedbackEvent = null, snapshot = null;
  const feedbackShown = new Map();
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const preferenceKey = () => 'factorlab-guidance-focus:' + (root.FactorLabApp?.getUI().profileId ?? 'guest');
  function reset() {
    session.reset(); feedbackShown.clear(); lastFeedback = null; lastFeedbackEvent = null;
    try { focus = localStorage.getItem(preferenceKey()) === 'on'; } catch { focus = false; }
  }
  function sync(event) {
    const app = root.FactorLabApp; if (!app) return;
    const state = app.getState(), ui = app.getUI(), lang = ui.lang, en = lang === 'en';
    if (event && ((event.campaignEpoch !== undefined && event.campaignEpoch !== ui.campaignEpoch) || (event.round !== undefined && event.round !== state.round))) return;
    const nextIdentity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (identity !== nextIdentity) { identity = nextIdentity; reset(); }
    const progress = root.FactorLabWorkspace?.getResearchProgress?.() || ui.researchProgress || {};
    const plan = derive(state,ui,progress,lang), now = Date.now();
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
    const task = $('partner-task');
    if (task) {
      task.hidden=state.phase==='decision';
      const html = `<span class="step-kicker">${en ? 'PROGRESS' : '当前进度'}</span><p>${esc(snapshot.task.text)}</p><div class="partner-actions"><button class="text-button" data-open-view="${snapshot.task.view}">${en ? 'Go to task' : '前往当前任务'}</button><button class="text-button" data-open-partner>${en ? 'Ask the research helper' : '询问研究助手'}</button></div>`;
      if (task.innerHTML !== html) task.innerHTML = html;
    }
    const list = $('partner-reminders');
    if (list) {
      const html = snapshot.reminders.map(item=>`<li data-guidance-kind="${esc(item.kind)}"><p>${esc(item.text)}</p><button class="text-button" data-dismiss-guidance="${esc(item.key)}" aria-label="${en ? 'Dismiss reminder' : '收起这条提示'}">${en ? 'Dismiss' : '收起'}</button></li>`).join('');
      if (list.innerHTML !== html) list.innerHTML = html;
      list.hidden = !snapshot.reminders.length;
    }
    document.dispatchEvent(new CustomEvent('factorlab:guidance',{detail:{...snapshot,feedback:announced,activeFeedback:lastFeedback}}));
  }
  document.addEventListener('click',event=>{
    if (event.target.closest('[data-open-partner]')) $('open-coach')?.click();
    const dismiss = event.target.closest('[data-dismiss-guidance]');
    if (dismiss) { session.dismiss(dismiss.dataset.dismissGuidance); sync(); }
  });
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
  sync();
})(typeof globalThis !== 'undefined' ? globalThis : this);
