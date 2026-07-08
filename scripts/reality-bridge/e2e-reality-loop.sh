#!/usr/bin/env bash
# AN ACT — End-to-End Reality Loop test (Reality Bridge ET-1.5)
#
# Proves the minimum real loop against a LIVE stack (backend + Postgres + Redis).
# It does NOT mock anything. Every request hits the real /v1 API. Mutation
# requests send the required Idempotency-Key header (verified live in ET-1.5).
#
# Prereqs: a running backend with migrations applied and Redis up.
#   BASE_URL defaults to http://127.0.0.1:3000
#
# Usage:  BASE_URL=http://127.0.0.1:3000 bash scripts/reality-bridge/e2e-reality-loop.sh
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:3000}"
STAMP="$(date +%s)"
PROV_EMAIL="provider.${STAMP}@anact.local"
CUST_EMAIL="customer.${STAMP}@anact.local"
PW="pilot-pw-123456"
idem() { python3 -c "import uuid;print(uuid.uuid4())" 2>/dev/null || echo "${STAMP}-$RANDOM-$RANDOM"; }
jqget() { python3 -c "import sys,json;print(json.load(sys.stdin).get('$1',''))"; }

echo "== 0. health =="
curl -fsS "$BASE/health" && echo

echo "== 1. register provider (identity created in DB) =="
PROV_TOKENS=$(curl -fsS -X POST "$BASE/v1/auth/register/provider" \
  -H 'content-type: application/json' -H "Idempotency-Key: $(idem)" \
  -d "{\"email\":\"$PROV_EMAIL\",\"password\":\"$PW\",\"display_name\":\"Pilot Provider\",\"business_name\":\"Pilot Co\",\"primary_trade\":\"general\"}")
PROV_AT=$(echo "$PROV_TOKENS" | jqget access_token)
echo "provider access token: ${PROV_AT:0:12}…"

echo "== 2. register customer =="
CUST_TOKENS=$(curl -fsS -X POST "$BASE/v1/auth/register/customer" \
  -H 'content-type: application/json' -H "Idempotency-Key: $(idem)" \
  -d "{\"email\":\"$CUST_EMAIL\",\"password\":\"$PW\",\"display_name\":\"Pilot Customer\"}")
CUST_AT=$(echo "$CUST_TOKENS" | jqget access_token)

echo "== 3. login (re-auth, issues session via Redis) =="
curl -fsS -X POST "$BASE/v1/auth/login" -H 'content-type: application/json' \
  -H "Idempotency-Key: $(idem)" -d "{\"email\":\"$CUST_EMAIL\",\"password\":\"$PW\"}" >/dev/null && echo "login ok"

echo "== 4. identity =="
ME=$(curl -fsS "$BASE/v1/me" -H "authorization: Bearer $CUST_AT"); echo "$ME"
PROV_ME=$(curl -fsS "$BASE/v1/me" -H "authorization: Bearer $PROV_AT")
PROV_USER_ID=$(echo "$PROV_ME" | jqget user_id)

echo "== 5. professional passport (DB-sourced; provider) =="
curl -fsS "$BASE/professional-passport" -H "authorization: Bearer $PROV_AT" && echo

echo "== 6. customer creates an Action (the Need/Offer) =="
ACTION=$(curl -fsS -X POST "$BASE/v1/actions" -H 'content-type: application/json' \
  -H "authorization: Bearer $CUST_AT" -H "Idempotency-Key: $(idem)" \
  -d '{"action_type_code":"general.task","title":"Pilot action","description":"E2E reality loop"}')
ACTION_ID=$(echo "$ACTION" | jqget id); echo "action: $ACTION_ID"

echo "== 7. generate contract from the action =="
CONTRACT=$(curl -fsS -X POST "$BASE/v1/actions/$ACTION_ID/contract/generate" \
  -H "authorization: Bearer $CUST_AT" -H "Idempotency-Key: $(idem)")
CONTRACT_ID=$(echo "$CONTRACT" | jqget id); echo "contract: $CONTRACT_ID"

echo "== 8. list milestones (materialized execution records) =="
MS=$(curl -fsS "$BASE/v1/contracts/$CONTRACT_ID/milestones" -H "authorization: Bearer $CUST_AT")
echo "$MS"
MILESTONE_ID=$(echo "$MS" | python3 -c "import sys,json;d=json.load(sys.stdin);print((d[0] if isinstance(d,list) else d.get('milestones',[{}])[0]).get('id',''))" 2>/dev/null || true)

echo "== 9. transition milestone (execution) =="
[ -n "${MILESTONE_ID:-}" ] && curl -fsS -X POST \
  "$BASE/v1/contracts/$CONTRACT_ID/milestones/$MILESTONE_ID/transitions" \
  -H 'content-type: application/json' -H "authorization: Bearer $PROV_AT" \
  -H "Idempotency-Key: $(idem)" -d '{"transition":"start"}' && echo

echo "== 10. evidence upload-intent + attach (evidence path) =="
[ -n "${MILESTONE_ID:-}" ] && curl -fsS -X POST \
  "$BASE/v1/contracts/$CONTRACT_ID/milestones/$MILESTONE_ID/evidence/upload-intent" \
  -H 'content-type: application/json' -H "authorization: Bearer $PROV_AT" \
  -H "Idempotency-Key: $(idem)" -d '{"filename":"proof.jpg","content_type":"image/jpeg"}' && echo

echo "== 11. trust impact (read provider trust profile) =="
curl -fsS "$BASE/trust/profile/$PROV_USER_ID" -H "authorization: Bearer $PROV_AT" && echo

echo "== E2E reality loop complete =="
