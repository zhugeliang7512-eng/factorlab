'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const R = require('./research.js');
const RP = require('./researchPublic.js');
const fs = require('node:fs');
const path = require('node:path');

const FORBIDDEN = /efficac|alpha/i;

function collectKeys(value, out = new Set()) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach(item => collectKeys(item, out));
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    out.add(k);
    collectKeys(v, out);
  }
  return out;
}

/** Tiny injected history: 8 months, 4 tickers; fundamentals with explicit availableAt. */
function makeHistory() {
  const tickers = ['AAA', 'BBB', 'CCC', 'DDD'];
  const history = [];
  for (let t = 0; t < 8; t++) {
    const returns = {};
    const fundamentals = {};
    tickers.forEach((id, i) => {
      // Distinct cross-section each month
      returns[id] = 0.01 * (i + 1) + 0.002 * t * (i % 2 === 0 ? 1 : -1);
      fundamentals[id] = {
        ep: 0.04 + i * 0.01 + 0.001 * t,
        roe: 0.10 + i * 0.02,
        observedAt: t,          // numeric month index
        availableAt: t          // available same month-end (≤ decision)
      };
    });
    history.push({
      monthIndex: t,
      monthDate: `2020-${String(t + 1).padStart(2, '0')}-28`,
      decisionTime: t,
      returns,
      fundamentals
    });
  }
  return history;
}

test('analyzePublic scoring/IC smoke on injected history', () => {
  const history = makeHistory();
  const out = RP.analyzePublic({ preferences: { Momentum: 1, Value: 1, Quality: 1, LowVol: 1 } }, history);
  assert.equal(out.dataProvenance, 'public_real');
  assert.equal(out.factorUniverseVersion, 'factors-public-v1');
  assert.ok(out.sampleCount >= 1);
  assert.equal(out.factors.length, 4);
  for (const f of out.factors) {
    assert.ok(['Momentum', 'Value', 'Quality', 'LowVol'].includes(f.id));
    assert.ok('meanIC' in f);
    assert.equal(typeof f.validMonths, 'number');
  }
  // At least Momentum/LowVol should have some finite IC months on this toy panel
  const mom = out.factors.find(f => f.id === 'Momentum');
  assert.ok(mom.validMonths >= 1);
  assert.ok(Number.isFinite(mom.meanIC));
});

test('look-ahead rejection: fundamental availableAt > decisionTime must not affect signal', () => {
  const history = makeHistory();
  // Signal at monthIndex=6 uses decisionTime from history[5] (=5).
  const decisionIdx = 6;
  const decisionTime = history[decisionIdx - 1].decisionTime; // 5
  assert.equal(decisionTime, 5);
  // Clear all CCC fundamentals, then plant one that arrives AFTER decision.
  for (let t = 0; t < history.length; t++) {
    delete history[t].fundamentals.CCC;
  }
  history[decisionIdx - 1].fundamentals.CCC = {
    ep: 0.99,
    roe: 0.99,
    observedAt: decisionTime,
    availableAt: decisionTime + 1 // 6 > 5 → must reject
  };

  const rankings = RP.signalsPublic(
    history,
    decisionIdx,
    { Quality: 1 },
    { priceOnly: false, tickers: ['AAA', 'BBB', 'CCC', 'DDD'] }
  );
  const ccc = rankings.find(r => r.id === 'CCC');
  assert.ok(ccc);
  assert.equal(ccc.raw.Quality, null, 'late fundamental must not enter Quality raw');
  assert.equal(ccc.scores.Quality, null);

  // Control: same ROE with availableAt <= decisionTime should be used
  history[decisionIdx - 1].fundamentals.CCC = {
    ep: 0.99,
    roe: 0.99,
    observedAt: decisionTime,
    availableAt: decisionTime
  };
  const rankingsOk = RP.signalsPublic(
    history,
    decisionIdx,
    { Quality: 1 },
    { priceOnly: false, tickers: ['AAA', 'BBB', 'CCC', 'DDD'] }
  );
  const cccOk = rankingsOk.find(r => r.id === 'CCC');
  assert.equal(cccOk.raw.Quality, 0.99);
  assert.ok(Number.isFinite(cccOk.scores.Quality));
});

test('analyzePublic output has no efficacy/alpha keys', () => {
  const out = RP.analyzePublic({}, makeHistory());
  const keys = [...collectKeys(out)];
  for (const key of keys) {
    assert.equal(FORBIDDEN.test(key), false, `forbidden key: ${key}`);
  }
  const empty = RP.analyzePublic({}, []);
  for (const key of collectKeys(empty)) {
    assert.equal(FORBIDDEN.test(key), false, `forbidden key in empty: ${key}`);
  }
  assert.equal(empty.factorUniverseVersion, 'factors-public-price-v1');
  assert.equal(empty.sampleCount, 0);
  for (const f of empty.factors) {
    assert.equal(f.meanIC, null);
    assert.equal(f.validMonths, 0);
  }
  assert.ok(empty.factors.every(f => ['Momentum', 'LowVol'].includes(f.id)));
  assert.match(empty.note, /Value\/Quality 未测|interim/i);
});

test('rankIC returns null for <3 pairs or constant scores', () => {
  assert.equal(RP.rankIC([1, 2], [0.1, 0.2]), null);
  assert.equal(RP.rankIC([1, 1, 1], [0.1, 0.2, 0.3]), null);
  const ic = RP.rankIC([1, 2, 3], [0.1, 0.2, 0.3]);
  assert.ok(Number.isFinite(ic));
  assert.ok(ic > 0.99);
});

test('research.js synthetic analyze still works', () => {
  const a = R.analyze({ Momentum: 1 });
  assert.equal(a.dataVersion, 'investigation-synthetic-v1');
  assert.equal(a.sampleCount, 36);
  assert.ok(Array.isArray(a.factors));
  assert.equal(a.factors.length, 4);
  assert.match(a.note, /不证明现实有效/);
});

test('price-only interim uses factors-public-price-v1', () => {
  const history = makeHistory().map(row => ({
    ...row,
    fundamentals: {} // strip fundamentals
  }));
  const out = RP.analyzePublic({ priceOnly: true }, history);
  assert.equal(out.factorUniverseVersion, 'factors-public-price-v1');
  assert.equal(out.interim, true);
  assert.ok(out.factors.every(f => ['Momentum', 'LowVol'].includes(f.id)));
  assert.match(out.note, /Value\/Quality 未测|interim/);
});

test('four-factor public_data fundamentals yield Value/Quality IC months', () => {
  const fundDir = path.join(__dirname, 'public-data', 'fundamentals');
  const n = fs.existsSync(fundDir)
    ? fs.readdirSync(fundDir).filter(f => f.endsWith('.json')).length
    : 0;
  if (n === 0) {
    // offline/empty environments: skip soft
    return;
  }
  const out = RP.analyzePublic({
    publicDataDir: path.join(__dirname, 'public-data'),
    industryTrack: 'both',
    sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' }
  });
  assert.equal(out.factorUniverseVersion, 'factors-public-v1');
  assert.equal(out.interim, false);
  assert.ok(out.factors.some(f => f.id === 'Value'));
  assert.ok(out.factors.some(f => f.id === 'Quality'));
  const value = out.factors.find(f => f.id === 'Value');
  const quality = out.factors.find(f => f.id === 'Quality');
  assert.ok(value.validMonths >= 1, 'Value should have ≥1 measured month when fundamentals present');
  assert.ok(quality.validMonths >= 1);
  assert.ok(Number.isFinite(value.meanIC));
  assert.ok(Number.isFinite(quality.meanIC));
});
