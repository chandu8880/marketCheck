import os
import sys
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Make services importable when running via Vercel or uvicorn from root
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from services.stock_service import fetch_all_stocks
from services.news_service import fetch_news_for_stocks
from services.ai_service import analyze_stocks

app = FastAPI(title="NSE Market Screener", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/api/analyze")
async def analyze():
    try:
        print("[1/3] Fetching stock data...")
        all_stocks = fetch_all_stocks()

        if not all_stocks:
            raise HTTPException(status_code=503, detail="Failed to fetch stock data. Try again.")

        all_stocks.sort(key=lambda x: abs(x["technical_score"]), reverse=True)
        top_candidates = all_stocks[:20]

        print(f"[2/3] Fetching news for {len(top_candidates)} candidates...")
        news_map = fetch_news_for_stocks(top_candidates)
        for stock in top_candidates:
            stock["news"] = news_map.get(stock["ticker"], [])

        print("[3/3] Running AI analysis...")
        result = analyze_stocks(top_candidates)
        result["analysis_timestamp"] = datetime.now().isoformat()

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
