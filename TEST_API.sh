#!/bin/bash

# Simple API test without jq dependency
API_KEY="d197581bdc85491c6c8022ee9321909e3d1623b2"
API_URL="https://api.crustdata.com"

echo "🧪 Testing CrustData People Search API..."
echo "=========================================="
echo ""

echo "Test: Searching for 'Software Engineer'..."
echo ""

RESPONSE=$(curl -sS --max-time 60 -X POST "${API_URL}/screener/persondb/search" \
  -H "Authorization: Token ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "filters": {
      "column": "current_employers.title",
      "type": "(.)",
      "value": "Software Engineer"
    },
    "limit": 5
  }' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_BODY="${RESPONSE%%HTTP_STATUS:*}"
HTTP_CODE="${RESPONSE##*HTTP_STATUS:}"

echo "$HTTP_BODY" | head -c 1200
echo ""
echo "..."
echo ""
echo "HTTP Status Code: $HTTP_CODE"
echo ""
if command -v python3 >/dev/null 2>&1; then
  echo "$HTTP_BODY" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    profiles = d.get('profiles') or d.get('data') or []
    print('Response keys:', list(d.keys())[:6])
    print('profiles count:', len(profiles))
    print('total_count:', d.get('total_count'))
except Exception as e:
    print('parse error:', e)
" 2>/dev/null || true
fi

echo ""
echo "=========================================="
echo ""
echo "✅ PersonDB returns results under key \"profiles\" (not \"data\")."
echo "✅ HTTP 200 + profiles array with length > 0 means the API is working."
