#!/usr/bin/env node
'use strict';
/**
 * Rebuild fixtures/public-real-studyresult-sample.json from public-data snapshots.
 * - prices + usable fundamentals → factors-public-v1 (4 factors), interim=false when V/Q measured
 * - prices only → factors-public-price-v1 interim (M+LV)
 * - no prices → honest empty pack
 * Never hand-fills fake IC.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const GAME = path.join(ROOT, '..');
const PRICES = path.join(ROOT, 'prices');
const FUNDS = path.join(ROOT, 'fundamentals');
const OUT = path.join(GAME, 'fixtures', 'public-real-studyresult-sample.json');
const META_PRICE = path.join(ROOT, 'cache', 'FETCH_META_YAHOO.json');
const META_FUND = path.join(ROOT, 'cache', 'FETCH_META_FUNDAMENTALS.json');

const ResearchPublic = require('../researchPublic.js');
const StudyResult = require('../studyResult.js');

function readJsonAsOf(p, fallback) {
  try {
    const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
    const meta = JSON.parse(raw);
    if (meta && meta.asOf) return String(meta.asOf);
  } catch (_) {}
  return fallback || new Date().toISOString().slice(0, 10);
}

function countJsonFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
}

function sourceRefs(opts) {
  const asOf = opts.asOf;
  const refs = [
    {
      title: 'Yahoo Finance chart API v8 monthly — primary public price source',
      url: 'https://query1.finance.yahoo.com/v8/finance/chart/',
      asOf
    },
    {
      title: 'Yahoo Finance / yfinance — annual+quarterly income & balance for E/P and ROE',
      url: 'https://finance.yahoo.com/',
      asOf: opts.fundAsOf || asOf
    },
    {
      title: 'FactorLab universe factors-public-v1 / factors-public-price-v1',
      url: 'https://github.com/zhugeliang7512-eng/factorlab',
      asOf: '2019-07-31'
    },
    {
      title:
        'Survivorship: fixed 2019-07-31 intent; priced cache is still-listed approximate high-end manufacturing ∪ frontier tech; ' +
        'fundamentals depth limited by free Yahoo history (sparse V/Q validMonths expected)',
      url: 'https://github.com/zhugeliang7512-eng/factorlab',
      asOf
    }
  ];
  if (opts.blocked) {
    refs.push({
      title: 'Download blocked — honest empty measurement; no invented IC.',
      url: 'https://finance.yahoo.com/',
      asOf
    });
  }
  return refs;
}

function writePack(pack) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(pack, null, 2) + '\n', 'utf8');
  console.log('[build_studyresult] wrote', path.relative(GAME, OUT));
}

function main() {
  const nPrices = countJsonFiles(PRICES);
  const nFunds = countJsonFiles(FUNDS);
  const asOf = readJsonAsOf(META_PRICE, '2026-10-29');
  const fundAsOf = readJsonAsOf(META_FUND, asOf);
  console.log('[build_studyresult] prices=', nPrices, 'fundamentals=', nFunds, 'asOf=', asOf);

  if (nPrices === 0) {
    const empty = ResearchPublic.emptyMeasurementResult(
      { industryTrack: 'both', sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' } },
      'prices/ empty.'
    );
    writePack(StudyResult.toPublicStudyResult({
      studyId: 'public-real-interim-empty-v1',
      dataProvenance: 'public_real',
      factorUniverseVersion: 'factors-public-price-v1',
      sampleWindow: empty.sampleWindow,
      sampleCount: 0,
      factors: empty.factors.map(f => ({ id: f.id, meanIC: null, validMonths: 0 })),
      publicSourceRefs: sourceRefs({ asOf, blocked: true }),
      industryTrack: 'both',
      lookback: 6,
      interim: true,
      note: empty.note
    }));
    return 0;
  }

  const analyzed = ResearchPublic.analyzePublic({
    publicDataDir: ROOT,
    industryTrack: 'both',
    sampleWindow: { start: '2019-07-31', end: '2024-12-31', frequency: 'month' }
    // auto-detect priceOnly vs four-factor from fundamentals presence
  });

  console.log(
    '[build_studyresult]',
    analyzed.factorUniverseVersion,
    'interim=',
    !!analyzed.interim,
    analyzed.factors.map(f => f.id + ':' + f.meanIC + '@' + f.validMonths).join(',')
  );

  const four = analyzed.factorUniverseVersion === 'factors-public-v1';
  const pack = StudyResult.toPublicStudyResult({
    studyId: four ? 'public-real-four-factor-v1' : 'public-real-interim-price-v1',
    dataProvenance: 'public_real',
    factorUniverseVersion: analyzed.factorUniverseVersion,
    sampleWindow: analyzed.sampleWindow,
    sampleCount: analyzed.sampleCount,
    factors: analyzed.factors.map(f => ({
      id: f.id,
      meanIC: f.meanIC,
      validMonths: f.validMonths
    })),
    publicSourceRefs: sourceRefs({ asOf, fundAsOf }),
    industryTrack: analyzed.industryTrack || 'both',
    lookback: analyzed.lookback || 6,
    interim: !!analyzed.interim,
    note:
      (analyzed.note || '') +
      ' 价量 Yahoo chart cache asOf=' +
      asOf +
      '；基本面 yfinance annual+quarterly asOf=' +
      fundAsOf +
      '；Value=E/P=DilutedEPS/adjClose；Quality=ROE=NI/Equity；availableAt=披露日或 periodEnd+45；' +
      'V/Q 历史深度受免费源限制（validMonths 可能远少于 Momentum/LowVol）；幸存者偏差已披露；交易成本=0；不证明投资功效。'
  });
  writePack(pack);
  return 0;
}

process.exit(main());
