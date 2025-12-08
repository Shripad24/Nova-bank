# Gemini API Testing & Troubleshooting Guide

## ✅ What Was Fixed

### 1. **Proper Gemini API Integration**
- Fixed `systemInstruction` format - now uses a string instead of object
- Added `generationConfig` for temperature and token control
- Improved error handling with detailed logging
- Better response parsing and validation

### 2. **Enhanced Error Logging**
The console now shows:
- `📤 Sending request...` - When API call starts
- `📥 API Response Status` - Response code
- `✅ Successfully got response` - When API succeeds
- `❌ Error messages` - Detailed error info
- `📚 Using fallback response` - When using backup system

### 3. **Fallback System**
If Gemini API fails:
- Still checks for account balance queries
- Still checks for transaction queries
- Uses banking knowledge base
- Returns helpful responses

## 🧪 How to Test

### Step 1: Open Browser Console
1. Go to http://localhost:3000
2. Press **F12** (or right-click → Inspect → Console)
3. Keep console open while testing

### Step 2: Test Gemini API Connection

**Test Case 1: Simple Question**
```
Type: "What is a credit card?"
Expected: See "📤 Sending request..." in console
Expected: Gemini AI provides detailed answer about credit cards
```

**Test Case 2: Banking Question**
```
Type: "Tell me about savings accounts"
Expected: Gemini AI explains savings accounts
```

**Test Case 3: General Question**
```
Type: "How do loans work?"
Expected: Gemini AI explains different types of loans
```

**Test Case 4: Account Balance**
```
Type: "What's my balance?"
Expected: Shows your account balances (from mock data or API)
```

**Test Case 5: Transactions**
```
Type: "Show my recent transactions"
Expected: Lists your last 5 transactions
```

### Step 3: Monitor Console Output

**Successful Flow:**
```
📤 Sending request to Gemini API...
Message: What is a credit card?
📥 API Response Status: 200
✅ Full API Response: {...}
✅ Successfully got response from Gemini
```

**Fallback Flow:**
```
❌ Error in sendMessage: {error message}
Attempting fallback response...
📚 Using fallback response system...
Found match in knowledge base: credit card
```

## 🔍 Common Issues & Solutions

### Issue 1: "API key is invalid"
```
Error: API Error 401: API key is invalid
```
**Solution:**
1. Check `.env.local` file exists in project root
2. Verify `VITE_GEMINI_API_KEY=YOUR_KEY` is correct
3. Restart dev server (stop with Ctrl+C, run `npm run dev` again)

### Issue 2: "Billing disabled"
```
Error: API Error 403: Billing disabled on this API
```
**Solution:**
1. Go to Google Cloud Console
2. Enable billing on your project
3. Enable "Generative Language API"
4. Wait a few minutes for changes to propagate

### Issue 3: "Too Many Requests" (429)
```
Error: API Error 429: Rate limit exceeded
```
**Solution:**
- The app automatically retries with exponential backoff
- If persists, wait a few minutes before retrying
- Check your API quota in Google Cloud Console

### Issue 4: "VITE_GEMINI_API_KEY not found"
```
⚠️ VITE_GEMINI_API_KEY not found in environment variables
```
**Solution:**
1. Verify `.env.local` exists
2. Verify the variable name starts with `VITE_`
3. Restart dev server
4. Verify file is in the **project root** (not in a subfolder)

### Issue 5: No Response from Gemini
```
No console output, chatbot shows generic response
```
**Solution:**
1. Check console (F12) for errors
2. Verify API key is valid
3. Check network tab to see actual API request/response
4. Clear browser cache (Ctrl+Shift+Delete)

## 📊 Expected Console Output

### For ANY question:
```
✓ Gemini API key loaded successfully
Initializing Gemini service...
✓ Gemini service ready
```

### When sending a message:
```
📤 Sending request to Gemini API...
Message: [user's question]
📥 API Response Status: 200
📥 Full API Response: {...response data...}
✅ Successfully got response from Gemini
```

## 🛠️ How to Debug

### 1. Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Send a message
4. Look for request to `generativelanguage.googleapis.com`
5. Click on it to see request/response details

### 2. Check Response Structure
The API response should look like:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Response from Gemini..."
          }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

### 3. Verify Request Body
Network tab → Request body should contain:
```json
{
  "contents": [{...}],
  "systemInstruction": "You are Nova...",
  "generationConfig": {...},
  "safetySettings": [...]
}
```

## 🎯 Success Criteria

✅ **Gemini API is working when:**
1. Console shows "✅ Successfully got response from Gemini"
2. Chatbot responds to ANY question (not just banking)
3. Responses are contextual and specific to the question
4. Response time is reasonable (1-3 seconds)

✅ **Fallback is being used when:**
1. Console shows "❌ Error in sendMessage"
2. But still gets a response (from fallback system)
3. Response is either from knowledge base or generic

## 📝 API Endpoint Details

- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Method**: POST
- **Auth**: API key in query parameter
- **Timeout**: 30 seconds (includes retries)

## 🚀 Quick Test Command

Open browser console and paste:
```javascript
console.log('API Key present:', import.meta.env.VITE_GEMINI_API_KEY ? '✅' : '❌');
```

If you see ✅, the API key is loaded!

