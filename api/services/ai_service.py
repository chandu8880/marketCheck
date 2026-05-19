import os
import json
from datetime import datetime
from openai import OpenAI

_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

SYSTEM_PROMPT = (
    "You are an expert stock market analyst specializing in Indian equities (NSE/BSE). "
    "Analyze data objectively and return only valid JSON."
)

USER_PROMPT_TEMPLATE = """
Analyze the following NSE-listed stocks based on their technical indicators and recent news.

Your task:
1. Identify the TOP 5 STRONG BUY stocks
2. Identify the TOP 5 STRONG SELL stocks

Evaluation criteria:
- RSI (oversold <35 = bullish, overbought >65 = bearish)
- MACD crossover and histogram direction
- Price vs SMA20 and SMA50 (above = bullish trend)
- 1-day, 5-day, 1-month price momentum
- Volume ratio (>1.5 = unusual activity)
- Recent news sentiment

Return ONLY this JSON structure (no extra text):
{{
  "strong_buy": [
    {{
      "ticker": "TICKER.NS",
      "name": "Company Name",
      "current_price": 0.00,
      "change_1d": 0.00,
      "change_5d": 0.00,
      "change_1m": 0.00,
      "rsi": 0.00,
      "signal": "STRONG BUY",
      "confidence": "High",
      "reasoning": "Concise 2-3 sentence reasoning",
      "key_factors": ["factor1", "factor2", "factor3"],
      "technical_score": 0,
      "news": []
    }}
  ],
  "strong_sell": [
    {{
      "ticker": "TICKER.NS",
      "name": "Company Name",
      "current_price": 0.00,
      "change_1d": 0.00,
      "change_5d": 0.00,
      "change_1m": 0.00,
      "rsi": 0.00,
      "signal": "STRONG SELL",
      "confidence": "High",
      "reasoning": "Concise 2-3 sentence reasoning",
      "key_factors": ["factor1", "factor2", "factor3"],
      "technical_score": 0,
      "news": []
    }}
  ],
  "market_summary": "1-2 sentence overview of current NSE market conditions",
  "analysis_timestamp": "{timestamp}"
}}

STOCK DATA (include news in the response for each picked stock):
{stock_data}
"""


def analyze_stocks(stocks: list[dict]) -> dict:
    stock_data_str = json.dumps(stocks, indent=2)
    timestamp = datetime.now().isoformat()

    response = _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": USER_PROMPT_TEMPLATE.format(
                    stock_data=stock_data_str,
                    timestamp=timestamp,
                ),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=4096,
    )

    result = json.loads(response.choices[0].message.content)
    result["analysis_timestamp"] = timestamp
    return result
