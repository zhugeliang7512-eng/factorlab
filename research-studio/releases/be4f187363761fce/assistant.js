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
  function offlineReply(state, question, lang = 'zh-CN', history = []) {
    const en = lang === 'en', q = String(question || '').trim().slice(0, 1000);
    const answer = (summary, detail = '', references = []) => ({ summary, detail, references, mode: 'example' });
    if (/^(你好|您好|嗨|哈[喽啰]|早上好|晚上好|hello|hi|hey)[！!。.\s]*$/i.test(q)) return answer(en ? 'Hello! Would you like help getting started, or is there a term you want to unpack?' : '你好！想先了解怎么玩，还是有哪个词想让我讲明白？');
    if (/^(谢谢|多谢|感谢|thanks|thank you)[！!。.\s]*$/i.test(q)) return answer(en ? 'You are welcome. We can take the next step when you are ready.' : '不客气。准备好了，我们接着看下一步。');
    if (/你是谁|什么模型|连接|在线|who are you|which model|online|connected/i.test(q)) return answer(en ? 'I am the offline learning helper here. These replies are prepared guidance, not a live DeepSeek conversation.' : '现在是离线学习助手，回答来自预设教学提示；当前这条回复没有调用 DeepSeek。', en ? 'A live conversation needs the server-side AI connection. You can still ask about the workflow, backtests, factors or risk.' : '在线自由对话需要服务器接通 AI。这里仍可以解释流程、回测、因子和风险。');
    if (/开始|下一步|怎么玩|怎么做|怎么操作|从哪|what.*next|how.*start|getting started|walkthrough/i.test(q)) {
      const steps = {
        decision: ['先到研究台读线索并引用证据，再回到配置页写下理由与可推翻条件，核对比例后确认。本轮回测可选；最终课程练习仍需完成回测与因子功效查看。', 'Read and cite the research evidence, then record your rationale and invalidation condition before confirming the allocation. Backtesting is optional each round; the final course exercise still requires a backtest and an efficacy review.'],
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
  const api = { offlineReply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FactorLabAssistant = api;
})(typeof window === 'undefined' ? globalThis : window);
