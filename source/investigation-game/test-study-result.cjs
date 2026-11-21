'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const R = require('./research.js');
const S = require('./studyResult.js');

const FORBIDDEN = /efficac|alpha/i;

function collectKeys(value, out = new Set(), prefix = '') {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectKeys(item, out, `${prefix}[${i}]`));
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    out.add(k);
    collectKeys(v, out, prefix ? `${prefix}.${k}` : k);
  }
  return out;
}

test('toStudyResult freezes synthetic StudyResult with 7 required fields', () => {
  const pack = S.exportStudyResult();
  assert.equal(pack.schemaVersion, 'studyresult/1');
  assert.equal(typeof pack.studyId, 'string');
  assert.ok(pack.studyId.length > 0);
  assert.equal(pack.dataProvenance, 'synthetic');
  assert.equal(pack.factorUniverseVersion, 'factors-teaching-v1');
  assert.equal(typeof pack.sampleWindow, 'object');
  assert.equal(pack.sampleWindow.frequency, 'month');
  assert.equal(pack.sampleCount, 36);
  assert.ok(Array.isArray(pack.factors));
  assert.equal(pack.factors.length, 4);
  for (const f of pack.factors) {
    assert.ok(['Momentum', 'Value', 'Quality', 'LowVol'].includes(f.id));
    assert.ok('meanIC' in f);
    assert.equal(typeof f.validMonths, 'number');
    assert.ok(!('efficacy' in f));
    assert.ok(!('alpha' in f));
  }
  assert.match(pack.note, /不证明现实有效/);
});

test('StudyResult JSON keys never use efficacy/alpha naming', () => {
  const pack = S.toStudyResult(R.analyze({ Momentum: 1 }));
  const keys = [...collectKeys(pack)];
  for (const key of keys) {
    assert.equal(FORBIDDEN.test(key), false, `forbidden key: ${key}`);
  }
  assert.ok(!('strategyTotalReturn' in pack) || pack.dataProvenance === 'synthetic');
  // Must not copy strategy.totalReturn into a frozen efficacy-shaped field
  assert.ok(!('efficacy' in pack));
  assert.ok(!('alpha' in pack));
  assert.ok(!('totalReturn' in pack));
});

test('analyze boundary note remains available via StudyResult', () => {
  const a = R.analyze();
  assert.match(a.note, /不证明现实有效/);
  const pack = S.toStudyResult(a);
  assert.match(pack.note, /不证明现实有效/);
});

test('optional DemoNavSeries fixture is synthetic-demo labeled', () => {
  const series = S.buildDemoNavSeries();
  assert.equal(series.tag, 'synthetic-demo');
  assert.equal(series.dataProvenance, 'synthetic');
  assert.match(series.disclaimer, /≠ 实盘或已验证因子功效/);
  assert.ok(series.points.length >= 2);
  const fixturePath = path.join(__dirname, 'fixtures', 'synthetic-demo-nav-series.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.tag, 'synthetic-demo');
  assert.equal(fixture.dataProvenance, 'synthetic');
  assert.ok(Array.isArray(fixture.points));
  assert.ok(fixture.points.length >= 2);
  assert.match(fixture.disclaimer, /合成/);
});


test('toPublicStudyResult builds public_real pack with required refs', () => {
  const pack = S.toPublicStudyResult({
    sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' },
    sampleCount: 60,
    factors: [
      { id: 'Momentum', meanIC: 0.02, validMonths: 54 },
      { id: 'Value', meanIC: null, validMonths: 40 },
      { id: 'Quality', meanIC: 0.01, validMonths: 40 },
      { id: 'LowVol', meanIC: 0.015, validMonths: 54 }
    ],
    publicSourceRefs: [
      { title: 'Yahoo Finance', url: 'https://finance.yahoo.com/', asOf: '2026-10-29' }
    ],
    industryTrack: 'both',
    lookback: 6
  });
  assert.equal(pack.schemaVersion, 'studyresult/1');
  assert.equal(pack.dataProvenance, 'public_real');
  assert.equal(pack.factorUniverseVersion, 'factors-public-v1');
  assert.equal(pack.sampleCount, 60);
  assert.ok(Array.isArray(pack.publicSourceRefs));
  assert.ok(pack.publicSourceRefs.length >= 1);
  assert.equal(pack.publicSourceRefs[0].title, 'Yahoo Finance');
  assert.equal(pack.industryTrack, 'both');
  assert.match(pack.note, /不证明投资功效|Rank IC/);
  const keys = [...collectKeys(pack)];
  for (const key of keys) {
    assert.equal(FORBIDDEN.test(key), false, `forbidden key: ${key}`);
  }
});

test('toPublicStudyResult rejects empty publicSourceRefs', () => {
  assert.throws(() => S.toPublicStudyResult({
    sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' },
    sampleCount: 12,
    factors: [{ id: 'Momentum', meanIC: 0.01, validMonths: 10 }],
    publicSourceRefs: []
  }), /publicSourceRefs/);
});

test('public-real fixture is valid via toPublicStudyResult', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'public-real-studyresult-sample.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.dataProvenance, 'public_real');
  assert.ok(
    fixture.factorUniverseVersion === 'factors-public-v1'
      || fixture.factorUniverseVersion === 'factors-public-price-v1'
  );
  const pack = S.toPublicStudyResult(fixture);
  assert.equal(pack.dataProvenance, 'public_real');
  assert.equal(pack.factorUniverseVersion, fixture.factorUniverseVersion);
  assert.ok(pack.publicSourceRefs.length >= 1);
  assert.ok(pack.factors.length >= 2);
  assert.ok(pack.factors.every(f => ['Momentum', 'Value', 'Quality', 'LowVol'].includes(f.id)));
  // interim price-only: no hand-filled fake IC when sampleCount is 0;
  // when prices loaded, meanIC must be finite (recomputed, not hand-filled)
  if (pack.sampleCount === 0) {
    for (const f of pack.factors) {
      assert.equal(f.meanIC, null);
      assert.equal(f.validMonths, 0);
    }
  } else {
    assert.ok(pack.sampleCount > 0);
    for (const f of pack.factors) {
      assert.ok(Number.isFinite(f.meanIC), f.id + ' meanIC must be finite when sampleCount>0');
      assert.ok(f.validMonths >= 1, f.id + ' validMonths');
    }
  }
});

test('toPublicStudyResult accepts factors-public-price-v1 interim', () => {
  const pack = S.toPublicStudyResult({
    factorUniverseVersion: 'factors-public-price-v1',
    sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' },
    sampleCount: 0,
    factors: [
      { id: 'Momentum', meanIC: null, validMonths: 0 },
      { id: 'LowVol', meanIC: null, validMonths: 0 }
    ],
    publicSourceRefs: [
      { title: 'Yahoo Finance', url: 'https://finance.yahoo.com/', asOf: '2026-10-29' }
    ],
    industryTrack: 'both',
    lookback: 6,
    interim: true,
    note: 'interim: Value/Quality 未测；诚实空测量'
  });
  assert.equal(pack.factorUniverseVersion, 'factors-public-price-v1');
  assert.equal(pack.sampleCount, 0);
  assert.equal(pack.interim, true);
  assert.equal(pack.factors.length, 2);
  assert.equal(pack.factors[0].meanIC, null);
});

test('interim price-v1 sibling fixture preserved alongside four-factor sample', () => {
  const interimPath = path.join(__dirname, 'fixtures', 'public-real-interim-price-v1-sample.json');
  assert.ok(fs.existsSync(interimPath), 'interim sibling must exist for reproducibility');
  const fixture = JSON.parse(fs.readFileSync(interimPath, 'utf8'));
  assert.equal(fixture.dataProvenance, 'public_real');
  assert.equal(fixture.factorUniverseVersion, 'factors-public-price-v1');
  assert.equal(fixture.interim, true);
  const pack = S.toPublicStudyResult(fixture);
  assert.equal(pack.factorUniverseVersion, 'factors-public-price-v1');
  assert.ok(pack.factors.every(f => ['Momentum', 'LowVol'].includes(f.id)));
});
