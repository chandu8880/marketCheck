#!/bin/bash
# Start both backend and frontend

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting NSE Market Screener..."

# Backend
cd "$ROOT/backend"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠️  Created backend/.env — add your API keys before running!"
fi

if [ ! -d "venv" ]; then
  python3 -m venv venv
  venv/bin/pip install -r requirements.txt -q
fi

echo "  → Backend:  http://localhost:8000"
venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Frontend
cd "$ROOT/frontend"
if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "  → Frontend: http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers running. Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
