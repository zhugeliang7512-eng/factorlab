(function(root) {
  const rules = {
    pressure: (weights, cap) => Math.round(weights[4] / cap * 100),
    mission(round, weights, before, cap) {
      return round === 1
        ? {title: '守住参考预算', description: '执行时 AI 暴露不超过策略参考上限。', passed: weights[4] <= cap + 1e-10}
        : {title: '保留缓冲空间', description: '执行时 Cash 比例不低于本轮开始；不要求本轮盈利。', passed: weights[5] >= before[5] - 1e-10};
    },
    collect(paths, id, nodes) {
      return [...new Set([...(Array.isArray(paths) ? paths : []), id])].filter(key => nodes[key]?.profile);
    },
    badges: ledger => [...new Set(ledger.filter(r => r.reward.quality === 'recognized').map(r => r.reward.badge))]
  };
  if (typeof module !== 'undefined') module.exports = rules;
  else root.FACTORLAB_PROGRESS = rules;
})(typeof window === 'undefined' ? globalThis : window);
