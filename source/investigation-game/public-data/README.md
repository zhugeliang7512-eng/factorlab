# public-data · FactorLab Phase A (public_real)

**Current sample (`fixtures/public-real-studyresult-sample.json`):** `studyId=public-real-four-factor-v1`, `factorUniverseVersion=factors-public-v1` — Momentum/LowVol from monthly prices; Value (E/P) and Quality (ROE) from Yahoo annual+quarterly statements. V/Q `validMonths` are sparse because free Yahoo history is shallow. Never hand-fills IC. The prior interim Momentum+LowVol pack is preserved as `fixtures/public-real-interim-price-v1-sample.json` (main sample is four-factor). Softr must not wire unreviewed packs into efficacy KPIs.

Frozen US ticker universe + Yahoo/`yfinance` download helpers for teaching Rank IC on public market history.

**Interim marker:** tonight’s reviewable StudyResult uses `factorUniverseVersion=factors-public-price-v1` (Momentum + LowVol only). Value / Quality are **not measured** until fundamentals snapshots are available; empty or blocked downloads produce honest `meanIC: null` (never hand-filled fake IC).

## Layout

| Path | Role |
| --- | --- |
| `universe-factors-public-v1.json` | Frozen ~60-ticker universe (`frozenAsOf=2019-07-31`) |
| `download_yahoo.py` | Monthly adj-close → `prices/`; best-effort EPS/ROE → `fundamentals/`; `manifest.json` + `checksums.sha256` |
| `prices/` | Per-ticker monthly adjusted close CSV/JSON snapshots |
| `fundamentals/` | Per-ticker fundamental rows with disclosure / availableAt |
| `snapshots/` | Optional combined history cache for Node loaders |
| `.venv/` | Local venv (gitignored) |

## Reproduce (online)

```sh
cd source/investigation-game/public-data
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python download_yahoo.py          # network Yahoo download
# or dry-run (no network writes):
.venv/bin/python download_yahoo.py --dry-run
```

After a **successful** download:

```sh
cd ..
node public-data/build_studyresult_from_snapshot.cjs
```

This rewrites `fixtures/public-real-studyresult-sample.json` from `researchPublic.analyzePublic` → `studyResult.toPublicStudyResult`.

## Offline / rate-limit

Yahoo Finance via `yfinance` is frequently **rate-limited or 403** in CI/cloud boxes. Stooq TLS may also fail in some environments.

```sh
.venv/bin/python download_yahoo.py --offline          # reuse prices/fundamentals only
.venv/bin/python download_yahoo.py --allow-empty       # exit 0 with empty manifest if blocked
```

If Yahoo fails without `--allow-empty`, the script logs clearly and exits **non-zero**.

### Stooq fallback (hook only)

`download_yahoo.py` documents `fetch_stooq_monthly_adj_close(ticker)` as a **stub / shrink path**. Wire a working Stooq client when TLS/network allows; do not invent prices labeled as real market data.

## Survivor bias

The universe is frozen at `2019-07-31` from liquid advanced-manufacturing ∪ frontier-tech names. Survivorship and selection bias remain; spin-offs (e.g. CARR/OTIS) keep public ticker continuity and are not a claim of point-in-time index membership. Transaction costs = 0 in Rank IC measurements.

## Rebuild StudyResult without prices

If `prices/` is empty (network blocked), the build script writes an **honest empty-measurement** public_real pack: `meanIC: null`, `validMonths: 0` for Momentum/LowVol under `factors-public-price-v1`, with `publicSourceRefs` stating source, asOf, and the rate-limit/failure fact. Value/Quality are omitted and called out in `note`.
