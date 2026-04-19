#!/bin/bash

# Test CrustData People Search API
# This tests the search functionality before running the full app

API_KEY="d197581bdc85491c6c8022ee9321909e3d1623b2"
API_URL="https://api.crustdata.com"

echo "🧪 Testing CrustData People Search API..."
echo "=========================================="
echo ""

# Test 1: Search for Software Engineer
echo "Test 1: Searching for 'Software Engineer'..."
curl -X POST "${API_URL}/screener/persondb/search" \
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
  --silent --show-error --write-out "\nHTTP Status: %{http_code}\n" | jq '.'

echo ""
echo "=========================================="
echo ""

# Test 2: Search for Product Manager
echo "Test 2: Searching for 'Product Manager'..."
curl -X POST "${API_URL}/screener/persondb/search" \
  -H "Authorization: Token ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "filters": {
      "column": "current_employers.title",
      "type": "(.)",
      "value": "Product Manager"
    },
    "limit": 5
  }' \
  --silent --show-error --write-out "\nHTTP Status: %{http_code}\n" | jq '.'

echo ""
echo "=========================================="
echo ""

# Test 3: Search for CEO (exact match)
echo "Test 3: Searching for 'CEO' (exact match)..."
curl -X POST "${API_URL}/screener/persondb/search" \
  -H "Authorization: Token ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "filters": {
      "column": "current_employers.title",
      "type": "=",
      "value": "CEO"
    },
    "limit": 5
  }' \
  --silent --show-error --write-out "\nHTTP Status: %{http_code}\n" | jq '.'

echo ""
echo "=========================================="
echo ""

# Test 4: Check if preview mode works (0 credits)
echo "Test 4: Preview mode test (0 credits)..."
curl -X POST "${API_URL}/screener/persondb/search" \
  -H "Authorization: Token ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "filters": {
      "column": "current_employers.title",
      "type": "(.)",
      "value": "Engineer"
    },
    "limit": 3,
    "preview": true
  }' \
  --silent --show-error --write-out "\nHTTP Status: %{http_code}\n" | jq '.'

echo ""
echo "✅ Tests complete!"
echo ""
echo "Expected results:"
echo "- HTTP Status: 200 for all tests"
echo "- 'data' array with profiles"
echo "- Each profile should have 'name', 'current_employers', etc."
