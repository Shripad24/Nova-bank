# Gemini API Setup Guide

## Environment Configuration

Your `.env.local` file has been properly configured with:
```
VITE_GEMINI_API_KEY=AIzaSyCrZIMoJmH-iUL9oUjL5dV21zWOVroEYpM
```

## How It Works

### 1. REST API Implementation
The chatbot now uses a simpler, more reliable REST API approach instead of the SDK:
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Method**: POST
- **Authentication**: API key in query parameter

### 2. Fallback Mechanism
If the Gemini API is unavailable:
- The chatbot can still answer **balance inquiries** using mock data
- The chatbot can still answer **transaction inquiries** using mock data
- Generic responses are provided for other questions

## Testing the Connection

### Browser Console (Press F12)
You'll see helpful logs:

```
✓ Gemini API key loaded successfully       // API key found
⚠️ VITE_GEMINI_API_KEY not found            // API key missing
✓ Gemini service ready                     // Service initialized
⚠️ Gemini service not ready                 // Fallback mode active
Sending request to Gemini API...           // API call in progress
API Response: {...}                        // Successful response
Error in sendMessage: ...                  // Error occurred
```

### Test Cases

**1. Test with Gemini API:**
```
User: "What's my account balance?"
Expected: Gemini AI responds with account information
```

**2. Test with Fallback (Balance):**
```
User: "Check my balance"
Expected: Mock data response showing accounts
```

**3. Test with Fallback (Transactions):**
```
User: "Show me my recent transactions"
Expected: Mock data response showing transactions
```

**4. Test Generic Response:**
```
User: "Hello"
Expected: Generic greeting from fallback system
```

## Troubleshooting

### Issue: "VITE_GEMINI_API_KEY not found"
**Solution**: Ensure `.env.local` exists in the project root with the correct variable name (must start with `VITE_`)

### Issue: "API Error: 401 - API key is invalid"
**Solution**: Check that your API key is valid and enabled for Generative Language API

### Issue: "API Error: 403 - Billing disabled"
**Solution**: Enable billing on your Google Cloud project for the Generative Language API

### Issue: "API Error: 429 - Too Many Requests"
**Solution**: The app automatically retries with exponential backoff (up to 2 retries)

## Architecture

```
Chatbot.tsx
    ↓
GeminiService.ts
    ↓
Gemini REST API ──→ [Success] → AI Response
    ↓
    └──→ [Failure] → getFallbackResponse()
        ├── Balance inquiry → bankingService
        ├── Transaction inquiry → bankingService
        └── Generic → Random response
```

## API Response Structure

Successful response from Gemini:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Here's your account information..."
          }
        ]
      }
    }
  ]
}
```

## Files Modified

1. **vite.config.ts** - Configured to properly load VITE_ prefixed env vars
2. **services/geminiService.ts** - Rewritten to use REST API approach
3. **components/Chatbot.tsx** - Enhanced logging and error handling
4. **.env.local** - Environment variable configuration (already present)

## Next Steps

1. Open http://localhost:3000 in your browser
2. Click the chat button (bottom right)
3. Type a message and send
4. Check browser console (F12) for detailed logs
5. The chatbot should respond either via Gemini API or fallback system

