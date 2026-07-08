#!/usr/bin/env bash
# Stops stale APP13 Vite dev servers and ensures port 5173 is free before dev:web.
# Dev tooling only — no product/runtime changes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=5173
VITE_PATTERN="${ROOT}/apps/web/node_modules/.bin/vite"

collect_vite_pids() {
  pgrep -f "$VITE_PATTERN" 2>/dev/null || true
}

stop_pid() {
  local pid="$1"
  kill "$pid" 2>/dev/null || true
}

force_stop_pid() {
  local pid="$1"
  kill -9 "$pid" 2>/dev/null || true
}

pids="$(collect_vite_pids)"
if [[ -n "$pids" ]]; then
  echo "==> Stopping stale AN ACT Vite dev server(s): $(echo "$pids" | tr '\n' ' ')"
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && stop_pid "$pid"
  done <<< "$pids"
  sleep 0.4
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null && force_stop_pid "$pid"
  done <<< "$(collect_vite_pids)"
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "ERROR: Port $PORT is still in use by a non-APP13 process:" >&2
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >&2 || true
  echo "Free port $PORT or stop the process above, then rerun npm run dev:web." >&2
  exit 1
fi

echo "==> Port $PORT is ready for AN ACT web dev server"
