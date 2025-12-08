import { bankingService } from "./mockDatabase";
import { Account, Transaction } from "../types";

// --- Banking Knowledge Base ---
const bankingKnowledge: Record<string, string> = {
  'credit card': `A credit card is a payment card that allows you to borrow money from the card issuer to pay for purchases. You then repay the borrowed amount, usually with interest if you don't pay the full balance. Key features include:
• Credit limit - Maximum amount you can spend
• Interest rate (APR) - Cost of borrowing
• Rewards - Cash back, points, or miles
• Grace period - Interest-free borrowing period
• Minimum payment - Required monthly payment

Credit cards help build credit history and offer fraud protection.`,

  'debit card': `A debit card is a payment card that draws money directly from your bank account. It works like a check but instantly. Key features include:
• No debt - You can only spend what you have
• No interest - No borrowing costs
• PIN protection - Security measure
• Daily limits - Maximum withdrawal/spending limits
• No credit history impact

Debit cards are safer than carrying cash but don't help build credit.`,

  'interest rate': `An interest rate is the percentage of money charged or earned over time. In banking:
• APR (Annual Percentage Rate) - Yearly interest cost on credit cards/loans
• Lower rates are better for borrowers
• Higher rates are better for savers
• Rates vary based on credit score, loan type, and market conditions
• Fixed rates stay the same, variable rates change over time`,

  'loan': `A loan is money borrowed from a bank that must be repaid with interest. Types include:
• Personal loans - Unsecured, flexible use
• Home loans (Mortgage) - Secured by property
• Auto loans - For vehicle purchase
• Student loans - For education
• Business loans - For business purposes

Loans have terms, interest rates, and monthly payments.`,

  'savings account': `A savings account is a bank account designed to store money and earn interest. Features:
• Safety - Insured by FDIC up to $250,000
• Interest - Earn money on your balance
• Liquidity - Easy access to funds
• Low risk - Principal protected
• Limitations - May have withdrawal limits or require minimum balance

Perfect for emergency funds or short-term savings goals.`,

  'checking account': `A checking account is a transaction account for daily banking. Features:
• Unlimited transactions - Deposit and withdraw freely
• Debit card access - Easy spending
• Check writing - Traditional payment method
• Direct deposit - Salary payments
• Online banking - Manage from anywhere
• No interest - Usually no interest earned

Best for regular spending and bill payments.`,

  'overdraft': `An overdraft occurs when you withdraw more money than available in your account. Details:
• Overdraft fee - Charged by bank (typically $25-$35)
• Overdraft protection - Links accounts to prevent overdrafts
• Can damage credit score
• Should be avoided
• Some banks charge multiple fees per day

It's like a short-term loan from the bank.`,

  'atm': `An ATM (Automated Teller Machine) allows you to access your bank account without a teller. You can:
• Withdraw cash
• Deposit checks and cash
• Check balance
• Transfer funds
• Change PIN
• Use 24/7
• Incurs fees at out-of-network ATMs

Always use secure, well-lit ATMs for safety.`,

  'wire transfer': `A wire transfer is a method of sending money electronically. Details:
• Fast - Often completed within hours
• Secure - Money goes directly to recipient
• Higher fees - Typically $15-$30
• Irreversible - Money can't be recalled
• Requires account details - Routing and account numbers
• International available - Can send worldwide

Used for large transactions and urgent payments.`,

  'mobile banking': `Mobile banking allows you to manage your account via smartphone app. You can:
• Check balance
• Transfer money
• Pay bills
• Deposit checks (mobile deposit)
• View transactions
• Set up alerts
• 24/7 access
• Enhanced security - Biometric login

Convenient and secure way to bank on the go.`,
};

// --- Service ---

export class GeminiService {
  private apiKey: string = 'AIzaSyCrZIMoJmH-iUL9oUjL5dV21zWOVroEYpM';
  private model: string = "gemini-2.5-flash";
  private userId: string;
  private apiEndpoint: string = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(userId: string) {
    this.apiKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
    if (this.apiKey) {
      console.log('✓ Gemini API key loaded successfully');
    } else {
      console.warn('⚠️ VITE_GEMINI_API_KEY not found in environment variables');
    }
    this.userId = userId;
  }

  private async sendWithRetry<T>(fn: () => Promise<T>, retries: number = 2): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = (err?.status === 429) || /\b429\b|Too\s+Many\s+Requests/i.test(String(err?.message || ''));
      if (retries > 0 && is429) {
        const attempt = 3 - retries;
        const delay = Math.min(2000, 500 * Math.pow(2, attempt));
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return this.sendWithRetry(fn, retries - 1);
      }
      throw err;
    }
  }

  isReady(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(
    history: { role: string; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ No API key available - using fallback');
        return this.getFallbackResponse(message);
      }

      // Prepend enhanced system context to the user's message with account awareness
      const contextualMessage = `You are Nova, an intelligent AI banking assistant for NovaBank. Your responsibilities:
1. Answer general banking questions accurately and professionally
2. When user account information is provided (account type, balance, account number), reference it to answer specific account-related questions
3. Provide helpful financial advice
4. Be friendly and professional in all interactions

Now, please answer this user question:

${message}`;

      // Build conversation content
      const contents = history.slice(-10).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts.map(p => ({ text: p.text }))
      }));

      // Add current user message with context
      contents.push({
        role: 'user',
        parts: [{ text: contextualMessage }]
      });

      console.log('📤 Sending request to Gemini API...');
      console.log('Message:', message);
      console.log('API Key present:', !!this.apiKey);
      console.log('Request contents length:', contents.length);

      // Call Gemini API with proper request format
      const response = await this.sendWithRetry(() =>
        fetch(
          `${this.apiEndpoint}/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: contents,
              generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
              }
            })
          }
        )
      );

      console.log('📥 API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error Response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          const errorMsg = errorData.error?.message || 'Unknown API error';
          console.error('Error details:', errorMsg);
          throw new Error(`API Error ${response.status}: ${errorMsg}`);
        } catch (parseError) {
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Full API Response:', data);

      // Extract text from response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        
        // Check for blocked content
        if (candidate.finishReason === 'SAFETY') {
          console.warn('⚠️ Response blocked by safety filters');
          return "I appreciate your question, but I'm unable to provide an answer on this topic right now.";
        }

        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const textPart = candidate.content.parts[0];
          if (textPart.text) {
            console.log('✅ Successfully got response from Gemini');
            return textPart.text;
          }
        }
      }

      console.warn('⚠️ No valid response from Gemini API');
      return "I'm sorry, I didn't receive a valid response. Please try again.";

    } catch (error: any) {
      console.error('❌ Error in sendMessage:', error.message);
      console.error('Full error:', error);
      
      // Log detailed error info
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response body:', error.response.body);
      }
      
      // Try fallback only if API completely fails
      console.log('Attempting fallback response...');
      return this.getFallbackResponse(message);
    }
  }

  private async getFallbackResponse(message: string): Promise<string> {
    const lower = message.toLowerCase();
    
    try {
      console.log('📚 Using fallback response system...');
      
      // Check for balance inquiry
      if (lower.includes('balance') || lower.includes('account balance') || lower.includes('how much do i have')) {
        console.log('Fetching account balances...');
        const accounts = await bankingService.getAccounts(this.userId);
        const parts = accounts.map(a => {
          const symbol = a.currency === 'USD' ? '$' : a.currency;
          const amt = a.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return `${a.name}: ${symbol}${amt}`;
        });
        return `Here are your account balances:\n${parts.join('\n')}`;
      }
      
      // Check for transaction inquiry
      if (lower.includes('transaction') || lower.includes('history') || lower.includes('recent') || lower.includes('spent')) {
        console.log('Fetching transactions...');
        const txs = await bankingService.getTransactions(this.userId, 5);
        const lines = txs.map(t => {
          const amt = Math.abs(t.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          const sign = t.amount > 0 ? '+' : '-';
          const date = new Date(t.date).toLocaleDateString();
          return `${date} ${t.description}: ${sign}${amt}`;
        });
        return lines.length ? `Here are your recent transactions:\n${lines.join('\n')}` : 'No recent transactions found.';
      }

      // For any other question, return helpful message
      console.log('No specific account query found, returning help message');
      const responses = [
        "I'm sorry, I'm having trouble reaching the AI service right now. Your account data is available - you can ask me about your balance or transactions. Please try again shortly.",
        "I apologize, but I'm unable to answer that right now. I can help you with your account balances and transaction history. Please try again in a moment.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error('❌ Fallback response error:', error);
      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    }
  }
}
