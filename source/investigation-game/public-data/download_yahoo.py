#!/usr/bin/env python3
"""Download monthly adj-close + best-effort fundamentals for factors-public-v1.

Offline-capable: --offline reuses prices/ and fundamentals/ only.
On Yahoo failure: log clearly and exit non-zero unless --allow-empty.
--dry-run prints the plan without network or writes.

Stooq fallback: see fetch_stooq_monthly_adj_close (stub / shrink-path hook).
Do NOT invent fake prices labeled as real market data.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def json_safe(obj):
    """Replace NaN/Inf with None for strict JSON."""
    import math
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [json_safe(v) for v in obj]
    return obj

UNIVERSE_PATH = ROOT / "universe-factors-public-v1.json"
PRICES_DIR = ROOT / "prices"
FUND_DIR = ROOT / "fundamentals"
SNAPSHOTS_DIR = ROOT / "snapshots"
MANIFEST_PATH = ROOT / "manifest.json"
CHECKSUMS_PATH = ROOT / "checksums.sha256"

SAMPLE_START = "2019-01-01"  # lookback buffer before frozenAsOf
SAMPLE_END = "2024-12-31"


def load_universe() -> dict:
    with UNIVERSE_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def fetch_stooq_monthly_adj_close(ticker: str):
    """Stooq shrink-path hook (stub).

    Intended fallback when Yahoo is rate-limited/403. In this environment Stooq
    TLS often fails; do not call until a working client is wired. Returns None.
    """
    # Stub only — real implementation would hit https://stooq.com/q/d/l/?s={ticker}.us&i=m
    _ = ticker
    return None


def month_end_adj_close_from_yf(ticker: str, start: str, end: str):
    """Fetch daily history via yfinance and resample to month-end adj close."""
    import yfinance as yf  # local .venv

    t = yf.Ticker(ticker)
    # auto_adjust=True → Close is adjusted; keep Adj Close when present
    hist = t.history(start=start, end=end, auto_adjust=True, actions=False)
    if hist is None or hist.empty:
        return None
    col = "Close" if "Close" in hist.columns else None
    if col is None:
        return None
    monthly = hist[col].resample("ME").last().dropna()
    rows = []
    for ts, val in monthly.items():
        rows.append({"date": ts.strftime("%Y-%m-%d"), "adjClose": float(val)})
    return rows


def fundamentals_best_effort(ticker: str, price_rows: list | None = None) -> list:
    """Best-effort E/P and ROE with disclosure dates for availableAt logic.

    Value ep := Diluted EPS / adjClose near periodEnd (earnings yield), NOT raw EPS.
    Quality roe := Net Income / Stockholders Equity.
    availableAt = earnings/disclosure date when known, else periodEnd + 45 calendar days.
    Returns [] on failure (never invents numbers). Omits trailing "as-of-today" info rows
    that would look-ahead contaminate the sample window.
    """
    import math
    import pandas as pd
    import yfinance as yf

    t = yf.Ticker(ticker)
    rows = []
    pmap = {}
    if price_rows:
        for r in price_rows:
            if r and r.get("date") is not None and r.get("adjClose") is not None:
                try:
                    pmap[str(r["date"])[:10]] = float(r["adjClose"])
                except (TypeError, ValueError):
                    pass

    def nearest_price(date_str: str, window: int = 40):
        if not pmap:
            return None
        target = pd.Timestamp(date_str)
        best = None
        best_delta = None
        for d, px in pmap.items():
            ts = pd.Timestamp(d)
            if ts <= target and (target - ts).days <= window:
                delta = (target - ts).days
                if best_delta is None or delta < best_delta:
                    best, best_delta = px, delta
        if best is not None:
            return best
        for d, px in pmap.items():
            ts = pd.Timestamp(d)
            if ts > target and (ts - target).days <= window:
                delta = (ts - target).days
                if best_delta is None or delta < best_delta:
                    best, best_delta = px, delta
        return best

    def pick_label(index, cands):
        for c in cands:
            if c in index:
                return c
        return None

    def finite(x):
        try:
            v = float(x)
        except (TypeError, ValueError):
            return None
        if math.isnan(v) or math.isinf(v):
            return None
        return v

    try:
        ed = t.get_earnings_dates(limit=40)
    except Exception:
        ed = None

    def stmt_rows(fin, bs, freq: str):
        out = []
        if fin is None or getattr(fin, "empty", True):
            return out
        ni_label = pick_label(
            fin.index,
            (
                "Net Income Common Stockholders",
                "Net Income",
                "Net Income From Continuing Operation Net Minority Interest",
                "NetIncome",
            ),
        )
        eps_label = pick_label(fin.index, ("Diluted EPS", "Basic EPS"))
        equity_label = None
        if bs is not None and not getattr(bs, "empty", True):
            equity_label = pick_label(
                bs.index,
                (
                    "Stockholders Equity",
                    "Common Stock Equity",
                    "Total Stockholder Equity",
                    "Total Equity Gross Minority Interest",
                ),
            )
        for col in fin.columns:
            pe = col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)[:10]
            ep = None
            roe = None
            ni = finite(fin.loc[ni_label, col]) if ni_label is not None else None
            equity = None
            if equity_label is not None and bs is not None and col in bs.columns:
                equity = finite(bs.loc[equity_label, col])
            if ni is not None and equity not in (None, 0):
                roe = ni / equity
            eps = finite(fin.loc[eps_label, col]) if eps_label is not None else None
            px = nearest_price(pe)
            if eps is not None and px not in (None, 0):
                ep = eps / px
            available_at = None
            if ed is not None and hasattr(ed, "index"):
                try:
                    pe_ts = pd.Timestamp(pe)
                    for idx in ed.index:
                        d = pd.Timestamp(idx)
                        if getattr(d, "tzinfo", None) is not None:
                            d = d.tz_localize(None)
                        if d >= pe_ts and (d - pe_ts).days <= 120:
                            available_at = d.strftime("%Y-%m-%d")
                            break
                except Exception:
                    available_at = None
            if available_at is None:
                try:
                    available_at = (pd.Timestamp(pe) + pd.Timedelta(days=45)).strftime("%Y-%m-%d")
                except Exception:
                    available_at = pe
            if ep is None and roe is None:
                continue
            out.append(
                {
                    "ticker": ticker,
                    "periodEnd": pe,
                    "ep": ep,
                    "roe": roe,
                    "observedAt": pe,
                    "availableAt": available_at,
                    "source": f"yfinance-{freq}",
                }
            )
        return out

    try:
        qfin = t.quarterly_income_stmt
        qbs = t.quarterly_balance_sheet
    except Exception:
        qfin, qbs = None, None
    rows.extend(stmt_rows(qfin, qbs, "quarterly"))
    try:
        afin = t.income_stmt
        abs_ = t.balance_sheet
    except Exception:
        afin, abs_ = None, None
    rows.extend(stmt_rows(afin, abs_, "annual"))

    by_pe = {}
    for r in rows:
        pe = r["periodEnd"]
        prev = by_pe.get(pe)
        if prev is None or (
            str(prev.get("source", "")).endswith("annual")
            and str(r.get("source", "")).endswith("quarterly")
        ):
            by_pe[pe] = r
    return [by_pe[k] for k in sorted(by_pe.keys())]



def write_price_file(ticker: str, rows: list) -> Path:
    PRICES_DIR.mkdir(parents=True, exist_ok=True)
    path = PRICES_DIR / f"{ticker}.json"
    payload = {
        "ticker": ticker,
        "frequency": "month",
        "field": "adjClose",
        "source": "yahoo-yfinance",
        "rows": rows,
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


def write_fund_file(ticker: str, rows: list) -> Path:
    FUND_DIR.mkdir(parents=True, exist_ok=True)
    path = FUND_DIR / f"{ticker}.json"
    payload = json_safe({"ticker": ticker, "source": "yahoo-yfinance", "rows": rows})
    path.write_text(json.dumps(payload, indent=2, allow_nan=False), encoding="utf-8")
    return path


def existing_price_tickers() -> list[str]:
    if not PRICES_DIR.exists():
        return []
    return sorted(p.stem for p in PRICES_DIR.glob("*.json"))


def build_manifest(universe: dict, downloaded: list, errors: list, mode: str) -> dict:
    return {
        "version": universe.get("version"),
        "frozenAsOf": universe.get("frozenAsOf"),
        "sampleWindow": universe.get("sampleWindow"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "tickersRequested": [t["ticker"] for t in universe["tickers"]],
        "tickersWithPrices": downloaded,
        "errors": errors,
        "interimNote": (
            "factors-public-price-v1 measures Momentum+LowVol only until fundamentals "
            "are present; Value/Quality untested in price-only interim."
        ),
    }


def write_checksums(paths: list[Path]) -> None:
    lines = []
    for p in sorted(paths, key=lambda x: str(x)):
        if p.is_file():
            rel = p.relative_to(ROOT).as_posix()
            lines.append(f"{sha256_file(p)}  {rel}")
    CHECKSUMS_PATH.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="FactorLab public_real Yahoo download")
    ap.add_argument("--offline", action="store_true", help="Reuse prices/fundamentals snapshots only")
    ap.add_argument("--dry-run", action="store_true", help="Print plan; no network; no writes")
    ap.add_argument(
        "--allow-empty",
        action="store_true",
        help="Exit 0 even when no prices obtained (honest empty path)",
    )
    ap.add_argument("--sleep", type=float, default=0.35, help="Delay between Yahoo calls")
    ap.add_argument("--stooq-fallback", action="store_true", help="Try Stooq stub after Yahoo miss (no-op stub)")
    args = ap.parse_args(argv)

    universe = load_universe()
    tickers = [t["ticker"] for t in universe["tickers"]]
    print(f"[download_yahoo] universe={universe.get('version')} n={len(tickers)}", flush=True)

    if args.dry_run:
        print("[download_yahoo] DRY-RUN — would fetch monthly adj close for:", flush=True)
        for t in tickers:
            print(f"  - {t}", flush=True)
        print(
            "[download_yahoo] DRY-RUN complete (no network, no writes). "
            "Stooq hook: fetch_stooq_monthly_adj_close (stub).",
            flush=True,
        )
        return 0

    if args.offline:
        have = existing_price_tickers()
        print(f"[download_yahoo] OFFLINE reuse: {len(have)} price files", flush=True)
        manifest = build_manifest(universe, have, [], mode="offline")
        MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        paths = [MANIFEST_PATH] + list(PRICES_DIR.glob("*.json")) + list(FUND_DIR.glob("*.json"))
        write_checksums(paths)
        if not have and not args.allow_empty:
            print(
                "[download_yahoo] ERROR: offline mode found no price snapshots under prices/. "
                "Pass --allow-empty for honest empty measurement, or run online download.",
                flush=True,
            )
            return 1
        print("[download_yahoo] offline manifest written", flush=True)
        return 0

    # Online path
    try:
        import yfinance  # noqa: F401
        import pandas  # noqa: F401
    except ImportError as e:
        print(
            f"[download_yahoo] ERROR: missing dependency in this interpreter: {e}. "
            "Use public-data/.venv: `.venv/bin/pip install -r requirements.txt`",
            flush=True,
        )
        return 1

    downloaded: list[str] = []
    errors: list[dict] = []
    written: list[Path] = []

    for i, ticker in enumerate(tickers):
        print(f"[download_yahoo] ({i+1}/{len(tickers)}) {ticker} …", flush=True)
        try:
            rows = month_end_adj_close_from_yf(ticker, SAMPLE_START, SAMPLE_END)
            if not rows and args.stooq_fallback:
                print(f"[download_yahoo] Yahoo miss for {ticker}; Stooq stub → None", flush=True)
                rows = fetch_stooq_monthly_adj_close(ticker)
            if not rows:
                raise RuntimeError("empty price history (Yahoo miss; Stooq not wired)")
            p = write_price_file(ticker, rows)
            written.append(p)
            try:
                frows = fundamentals_best_effort(ticker, rows)
                if frows:
                    written.append(write_fund_file(ticker, frows))
            except Exception as fe:
                errors.append({"ticker": ticker, "stage": "fundamentals", "error": str(fe)})
            downloaded.append(ticker)
        except Exception as e:
            msg = str(e)
            errors.append({"ticker": ticker, "stage": "prices", "error": msg})
            print(f"[download_yahoo] FAIL {ticker}: {msg}", flush=True)
            # Detect rate-limit / 403 class errors for clearer logging
            low = msg.lower()
            if "403" in low or "rate" in low or "too many" in low or "unauthorized" in low:
                print(
                    "[download_yahoo] Yahoo rate-limit/403 detected. "
                    "Retry later, use --offline with a cache, or --allow-empty for honest null StudyResult.",
                    flush=True,
                )
        time.sleep(max(0.0, args.sleep))

    mode = "online"
    manifest = build_manifest(universe, downloaded, errors, mode=mode)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    written.append(MANIFEST_PATH)
    write_checksums(written + list(PRICES_DIR.glob("*.json")) + list(FUND_DIR.glob("*.json")))

    if not downloaded:
        print(
            "[download_yahoo] ERROR: no tickers downloaded. "
            "Network Yahoo/yfinance appears blocked or empty. "
            "Do not invent prices. Use --allow-empty for honest empty fixture rebuild.",
            flush=True,
        )
        if args.allow_empty:
            print("[download_yahoo] --allow-empty: exiting 0 with empty prices", flush=True)
            return 0
        return 2

    print(f"[download_yahoo] done: {len(downloaded)}/{len(tickers)} with prices", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception:
        traceback.print_exc()
        raise SystemExit(1)
