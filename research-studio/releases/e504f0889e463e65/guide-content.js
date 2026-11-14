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
