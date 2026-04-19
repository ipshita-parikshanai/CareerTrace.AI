# API Fix Guide - PersonDB Search

## Root cause (resolved): Response key is `profiles`, not `data`

The PersonDB search endpoint returns results in a **`profiles`** array. The app was reading **`data`**, so it always saw **zero** results even when the API returned hundreds of thousands of matches.

**Fix (in `lib/api/crustdata.ts`):** use `data.profiles ?? data.data ?? []`.

Verified with curl: `Senior Software Engineer` returns `profile_count: 5` for `limit: 5` and `total_count` in the hundreds of thousands.

---

## Earlier issue: `column` vs `filter_type`

The CrustData API docs use both shapes in different sections; **`column`** works for PersonDB search (see `people.md` examples).

### What Was Wrong

```javascript
// ❌ WRONG - Using "filter_type"
{
  "filter_type": "current_employers.title",
  "type": "(.)",
  "value": "Software Engineer"
}
```

### What's Correct

```javascript
// ✅ CORRECT - Using "column"
{
  "column": "current_employers.title",
  "type": "(.)",
  "value": "Software Engineer"
}
```

---

## 🔧 Fix Applied

**File:** `lib/api/crustdata.ts`

Changed all instances of `filter_type` to `column`:

```typescript
// Before
searchFilters.push({
  filter_type: 'current_employers.title',  // ❌ Wrong
  type: '(.)',
  value: filters.current_title,
});

// After
searchFilters.push({
  column: 'current_employers.title',  // ✅ Correct
  type: '(.)',
  value: filters.current_title,
});
```

---

## 🧪 Testing with Curl

### Test Script Created

Two test scripts have been created in the root directory:

1. **`TEST_API.sh`** - Simple test (recommended)
2. **`TEST_CURL.sh`** - Detailed test with multiple scenarios

### Run the Simple Test

```bash
cd /Users/ipshitasinghal/Desktop/PeopleLikeMe
./TEST_API.sh
```

### Expected Output

```
🧪 Testing CrustData People Search API...
==========================================

Test: Searching for 'Software Engineer'...

{"data":[...profiles...],"cursor":"..."}

HTTP Status Code: 200
==========================================
✅ If you see HTTP Status Code: 200 and JSON data, the API is working!
```

### What to Look For

✅ **Success Indicators:**
- `HTTP Status Code: 200`
- JSON response with `"data": [...]`
- Array of profile objects
- Each profile has fields like `name`, `current_employers`, etc.

❌ **Failure Indicators:**
- `HTTP Status Code: 400` - Bad request format
- `HTTP Status Code: 404` - Endpoint not found or no results
- `HTTP Status Code: 401` - Authentication failed
- Empty `data` array: `"data": []`

---

## 🎨 Custom Error UI

### New Error Display

The error message now shows:
- 🚨 Clear error icon and title
- 📝 Descriptive error message
- 💡 Helpful suggestions
- 🎯 Quick-select buttons for popular job titles

### Visual Design

```
┌─────────────────────────────────────────┐
│ 🔴  No Career Paths Found               │
│                                         │
│ No profiles found matching the goal... │
│                                         │
│ 💡 Try these popular titles:           │
│ [Senior Software Engineer] [Product...] │
└─────────────────────────────────────────┘
```

### Features

1. **Visual Hierarchy**
   - Red gradient background
   - Icon with red accent
   - Clear title and message

2. **Quick Actions**
   - Clickable job title buttons
   - Auto-fills the goal input
   - Saves user time

3. **Better UX**
   - Shows suggestions before user gets frustrated
   - Makes it easy to try alternatives
   - Educational about what works

---

## 📋 Testing Checklist

### Step 1: Test the Curl Command

```bash
cd /Users/ipshitasinghal/Desktop/PeopleLikeMe
./TEST_API.sh
```

**Expected:** HTTP 200 with profile data

### Step 2: Restart Your Dev Server

```bash
# From the repo root — stop the server if running (Ctrl+C)
npm run dev
```

### Step 3: Test in UI

1. Go to http://localhost:3000
2. Enter a LinkedIn URL: `https://www.linkedin.com/in/ayushman-panda-2ab51a1a6/`
3. Try these job titles:
   - ✅ "Senior Software Engineer"
   - ✅ "Product Manager"
   - ✅ "Data Scientist"
   - ✅ "Engineering Manager"

### Step 4: Test Error UI

1. Enter an obscure title like: "Software Developer Level 3"
2. Click submit
3. Should see custom error UI with suggestions
4. Click a suggested title
5. Submit again - should work!

---

## 🎯 Job Titles That Work

### ✅ Recommended Titles

**Engineering:**
- Senior Software Engineer
- Staff Engineer
- Principal Engineer
- Engineering Manager
- Director of Engineering

**Product:**
- Product Manager
- Senior Product Manager
- Director of Product
- VP of Product

**Data:**
- Data Scientist
- Senior Data Scientist
- Data Engineer
- ML Engineer

**Design:**
- Product Designer
- UX Designer
- Senior Designer

**Leadership:**
- CEO
- CTO
- VP of Engineering

### ❌ Titles That May Not Work

- "Software Developer" (use "Software Engineer")
- "Programmer" (use "Software Engineer")
- "Developer" (use specific type)
- Very specific titles with numbers (e.g., "Level 3 Engineer")

---

## 🔍 Understanding the Search

### Match Types

The API uses `type: "(.)` which means **substring match**:

```javascript
// Searches for titles containing "Software Engineer"
{
  "column": "current_employers.title",
  "type": "(.)",  // Substring match
  "value": "Software Engineer"
}
```

**Matches:**
- "Senior Software Engineer"
- "Software Engineer"
- "Lead Software Engineer"
- "Principal Software Engineer"

### Exact Match

For exact matching, use `type: "="`:

```javascript
{
  "column": "current_employers.title",
  "type": "=",  // Exact match
  "value": "CEO"
}
```

---

## 🐛 Troubleshooting

### Issue: Still Getting 0 Results

**Check:**
1. Is the job title too specific?
2. Try a more generic title
3. Use the autocomplete API to find valid titles

**Solution:**
```bash
# Use autocomplete to find valid titles
curl -X POST 'https://api.crustdata.com/screener/persondb/autocomplete' \
  -H 'Authorization: Token d197581bdc85491c6c8022ee9321909e3d1623b2' \
  -H 'Content-Type: application/json' \
  -d '{
    "field": "current_employers.title",
    "query": "software",
    "limit": 10
  }'
```

### Issue: API Returns 400 Error

**Check:**
1. Is `column` spelled correctly?
2. Is the JSON format valid?
3. Is the API key correct?

**Debug:**
```bash
# Add -v flag to see full request/response
curl -v -X POST 'https://api.crustdata.com/screener/persondb/search' \
  -H 'Authorization: Token d197581bdc85491c6c8022ee9321909e3d1623b2' \
  -H 'Content-Type: application/json' \
  -d '{"filters":{"column":"current_employers.title","type":"(.)",value":"Engineer"},"limit":5}'
```

### Issue: API Works in Curl But Not in App

**Check:**
1. Did you restart the dev server after making changes?
2. Check browser console for JavaScript errors
3. Check terminal for API errors
4. Verify .env.local has correct API key

---

## 📊 API Response Structure

### Successful Response

```json
{
  "data": [
    {
      "person_id": 123456,
      "name": "John Doe",
      "current_employers": [
        {
          "name": "Google",
          "title": "Senior Software Engineer",
          "start_date": "2020-01-01"
        }
      ],
      "linkedin_profile_url": "https://linkedin.com/in/johndoe",
      "region": "San Francisco Bay Area"
    }
  ],
  "cursor": "next_page_token",
  "credits_used": 3
}
```

### Empty Response (No Results)

```json
{
  "data": [],
  "cursor": null,
  "credits_used": 0
}
```

---

## 🎉 Summary

### What Was Fixed

1. ✅ Changed `filter_type` to `column` in API calls
2. ✅ Created test scripts for easy validation
3. ✅ Improved error UI with helpful suggestions
4. ✅ Added quick-select buttons for common titles

### What to Do Next

1. **Run the curl test:** `./TEST_API.sh`
2. **Restart dev server:** `npm run dev`
3. **Test in browser:** Try different job titles
4. **Verify error UI:** Test with obscure titles

### Files Modified

- `lib/api/crustdata.ts` - Fixed API call
- `app/page.tsx` - Improved error UI
- `TEST_API.sh` - Simple test script
- `TEST_CURL.sh` - Detailed test script

---

**Ready to test!** Run `./TEST_API.sh` to verify the fix works. 🚀
