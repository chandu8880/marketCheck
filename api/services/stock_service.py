import warnings
import yfinance as yf
import pandas as pd

warnings.filterwarnings("ignore")

NIFTY_STOCKS = [
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries"},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services"},
    {"ticker": "HDFCBANK.NS", "name": "HDFC Bank"},
    {"ticker": "INFY.NS", "name": "Infosys"},
    {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank"},
    {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank"},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel"},
    {"ticker": "ITC.NS", "name": "ITC Limited"},
    {"ticker": "AXISBANK.NS", "name": "Axis Bank"},
    {"ticker": "LT.NS", "name": "Larsen & Toubro"},
    {"ticker": "SBIN.NS", "name": "State Bank of India"},
    {"ticker": "BAJFINANCE.NS", "name": "Bajaj Finance"},
    {"ticker": "ASIANPAINT.NS", "name": "Asian Paints"},
    {"ticker": "MARUTI.NS", "name": "Maruti Suzuki"},
    {"ticker": "HCLTECH.NS", "name": "HCL Technologies"},
    {"ticker": "WIPRO.NS", "name": "Wipro"},
    {"ticker": "SUNPHARMA.NS", "name": "Sun Pharmaceutical"},
    {"ticker": "TITAN.NS", "name": "Titan Company"},
    {"ticker": "ULTRACEMCO.NS", "name": "UltraTech Cement"},
    {"ticker": "TECHM.NS", "name": "Tech Mahindra"},
    {"ticker": "NESTLEIND.NS", "name": "Nestle India"},
    {"ticker": "POWERGRID.NS", "name": "Power Grid Corporation"},
    {"ticker": "NTPC.NS", "name": "NTPC Limited"},
    {"ticker": "ONGC.NS", "name": "ONGC"},
    {"ticker": "TATASTEEL.NS", "name": "Tata Steel"},
    {"ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv"},
    {"ticker": "ADANIPORTS.NS", "name": "Adani Ports"},
    {"ticker": "DIVISLAB.NS", "name": "Divi's Laboratories"},
    {"ticker": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories"},
    {"ticker": "CIPLA.NS", "name": "Cipla"},
    {"ticker": "BPCL.NS", "name": "BPCL"},
    {"ticker": "JSWSTEEL.NS", "name": "JSW Steel"},
    {"ticker": "INDUSINDBK.NS", "name": "IndusInd Bank"},
    {"ticker": "M&M.NS", "name": "Mahindra & Mahindra"},
    {"ticker": "HEROMOTOCO.NS", "name": "Hero MotoCorp"},
    {"ticker": "EICHERMOT.NS", "name": "Eicher Motors"},
    {"ticker": "TATACONSUM.NS", "name": "Tata Consumer Products"},
    {"ticker": "BRITANNIA.NS", "name": "Britannia Industries"},
    {"ticker": "GRASIM.NS", "name": "Grasim Industries"},
]


def _compute_rsi(closes: pd.Series, period: int = 14) -> float:
    delta = closes.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return round(float(rsi.iloc[-1]), 2)


def _compute_macd(closes: pd.Series) -> dict:
    ema12 = closes.ewm(span=12, adjust=False).mean()
    ema26 = closes.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    hist = macd_line - signal_line
    return {
        "macd": round(float(macd_line.iloc[-1]), 4),
        "signal": round(float(signal_line.iloc[-1]), 4),
        "histogram": round(float(hist.iloc[-1]), 4),
        "bullish_crossover": bool(macd_line.iloc[-1] > signal_line.iloc[-1]),
    }


def _score(rsi: float, macd: dict, price: float, sma20: float, sma50: float, chg5d: float, vol_ratio: float) -> int:
    s = 0
    if rsi < 30:
        s += 3
    elif rsi < 40:
        s += 2
    elif rsi < 50:
        s += 1
    elif rsi > 70:
        s -= 3
    elif rsi > 60:
        s -= 2
    elif rsi > 55:
        s -= 1

    s += 2 if macd["bullish_crossover"] else -2
    s += 1 if macd["histogram"] > 0 else -1
    s += 1 if price > sma50 else -1
    s += 1 if price > sma20 else -1

    if chg5d > 5:
        s += 2
    elif chg5d > 2:
        s += 1
    elif chg5d < -5:
        s -= 2
    elif chg5d < -2:
        s -= 1

    if vol_ratio > 1.5:
        s += 1
    return s


def _pct(closes: pd.Series, n: int) -> float:
    if len(closes) > n:
        prev = float(closes.iloc[-n - 1])
        cur = float(closes.iloc[-1])
        return round((cur - prev) / prev * 100, 2) if prev else 0.0
    return 0.0


def fetch_all_stocks() -> list[dict]:
    ticker_list = [s["ticker"] for s in NIFTY_STOCKS]
    name_map = {s["ticker"]: s["name"] for s in NIFTY_STOCKS}

    print(f"  Downloading batch data for {len(ticker_list)} tickers...")
    raw = yf.download(
        ticker_list,
        period="3mo",
        auto_adjust=True,
        progress=False,
        threads=True,
    )

    if raw.empty:
        return []

    # yfinance 1.x: MultiIndex columns (Price, Ticker)
    close_df: pd.DataFrame = raw["Close"]
    volume_df: pd.DataFrame = raw["Volume"]

    results = []
    for ticker in ticker_list:
        try:
            if ticker not in close_df.columns:
                continue

            closes = close_df[ticker].dropna()
            volumes = volume_df[ticker].dropna()

            if len(closes) < 30:
                continue

            price = round(float(closes.iloc[-1]), 2)
            rsi = _compute_rsi(closes)
            macd = _compute_macd(closes)

            sma20 = round(float(closes.rolling(20).mean().iloc[-1]), 2)
            sma50 = round(float(closes.rolling(min(50, len(closes))).mean().iloc[-1]), 2)

            chg1d = _pct(closes, 1)
            chg5d = _pct(closes, 5)
            chg1m = _pct(closes, 21)

            vol_now = float(volumes.iloc[-1]) if not volumes.empty else 0
            avg_vol = float(volumes.rolling(10).mean().iloc[-1]) if len(volumes) >= 10 else vol_now
            vol_ratio = round(vol_now / avg_vol, 2) if avg_vol > 0 else 1.0

            tech_score = _score(rsi, macd, price, sma20, sma50, chg5d, vol_ratio)

            results.append({
                "ticker": ticker,
                "name": name_map[ticker],
                "current_price": price,
                "change_1d": chg1d,
                "change_5d": chg5d,
                "change_1m": chg1m,
                "rsi": rsi,
                "macd": macd,
                "sma20": sma20,
                "sma50": sma50,
                "volume_ratio": vol_ratio,
                "technical_score": tech_score,
            })
        except Exception as e:
            print(f"  Error processing {ticker}: {e}")

    print(f"  Successfully processed {len(results)} stocks")
    return results
