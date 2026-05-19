import os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

NEWS_API_KEY = os.getenv("NEWSAPI_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"


def _fetch_news(company_name: str, ticker: str) -> tuple[str, list[dict]]:
    if not NEWS_API_KEY:
        return ticker, []

    clean_ticker = ticker.replace(".NS", "")
    query = f'"{company_name}" OR "{clean_ticker}" stock NSE India'

    try:
        resp = requests.get(
            NEWS_API_URL,
            params={
                "q": query,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 5,
                "apiKey": NEWS_API_KEY,
            },
            timeout=10,
        )
        articles = resp.json().get("articles", [])
        news = [
            {
                "title": a.get("title", ""),
                "description": a.get("description", ""),
                "url": a.get("url", ""),
                "source": a.get("source", {}).get("name", ""),
                "published_at": a.get("publishedAt", ""),
                "image": a.get("urlToImage", ""),
            }
            for a in articles[:5]
            if a.get("title") and "[Removed]" not in a.get("title", "")
        ]
        return ticker, news
    except Exception as e:
        print(f"News error for {company_name}: {e}")
        return ticker, []


def fetch_news_for_stocks(stocks: list[dict]) -> dict[str, list[dict]]:
    news_map: dict[str, list[dict]] = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(_fetch_news, s["name"], s["ticker"]): s
            for s in stocks
        }
        for future in as_completed(futures):
            ticker, articles = future.result()
            news_map[ticker] = articles
    return news_map
