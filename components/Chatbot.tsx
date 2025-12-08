import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Account } from '../types';
import { GeminiService } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { bankingService } from '../services/mockDatabase';

type PendingAction = 'none' | 'kyc_aadhaar' | 'kyc_pan' | 'profile_name' | 'profile_phone';

export const Chatbot: React.FC = () => {
  const { user, updateKyc, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am Nova, your AI banking assistant. How can I help you with your accounts today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>('none');
  const [pendingKyc, setPendingKyc] = useState<{ aadhaar?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize Gemini Service Ref to persist across renders
  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    if (user && !geminiRef.current) {
        geminiRef.current = new GeminiService(user.id);
    }
    // Fetch account data when user is available
    if (user) {
      bankingService.getAccounts(user.id).then(accs => {
        setAccounts(accs);
        console.log('📊 Chatbot loaded user accounts:', accs);
      }).catch(err => console.error('Failed to load accounts for chatbot:', err));
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getAccountContext = (): string => {
    if (accounts.length === 0) return '';
    
    const accountSummary = accounts.map(acc => 
      `${acc.type} Account: ${acc.name} (${acc.accountNumber}), Balance: ${acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`
    ).join('\n');
    
    return `\n\nUser's Account Information:\n${accountSummary}`;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !geminiRef.current) return;

    const userText = inputValue;
    setInputValue('');

    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Handle pending guided flows first
      const lower = userText.toLowerCase();

      // Pending KYC Aadhaar step
      if (pendingAction === 'kyc_aadhaar') {
        const clean = userText.replace(/\s+/g, '');
        const valid = /^\d{12}$/.test(clean);
        if (!valid) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: 'Aadhaar must be 12 digits. Please re-enter your Aadhaar number.',
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
        setPendingKyc({ aadhaar: clean });
        setPendingAction('kyc_pan');
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'model',
          text: 'Got it. Please provide your PAN (format: ABCDE1234F).',
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      // Pending KYC PAN step
      if (pendingAction === 'kyc_pan') {
        const panClean = userText.toUpperCase();
        const panValid = /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panClean);
        if (!panValid) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: 'PAN must match pattern ABCDE1234F. Please re-enter your PAN.',
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
        try {
          const aadhaar = pendingKyc.aadhaar || '';
          await updateKyc(aadhaar, panClean);
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: 'Your KYC has been updated successfully. ✅',
            timestamp: new Date()
          }]);
        } catch (err: any) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: err?.message || 'Failed to update KYC. Please try again.',
            timestamp: new Date()
          }]);
        }
        setPendingAction('none');
        setPendingKyc({});
        setIsTyping(false);
        return;
      }

      // Pending profile phone update
      if (pendingAction === 'profile_phone') {
        const phoneClean = userText.replace(/\s+/g, '');
        const phoneValid = /^\+?[0-9]{10,12}$/.test(phoneClean);
        if (!phoneValid) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: 'Please enter a valid phone number (10-12 digits, optional +).',
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
        try {
          await updateProfile({ phone: phoneClean });
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: 'Your phone number has been updated successfully. ✅',
            timestamp: new Date()
          }]);
        } catch (err: any) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: err?.message || 'Failed to update profile. Please try again.',
            timestamp: new Date()
          }]);
        }
        setPendingAction('none');
        setIsTyping(false);
        return;
      }

      // Pending profile name update
      if (pendingAction === 'profile_name') {
        const name = userText.trim();
        if (name.length < 2) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: 'Name looks too short. Please enter your full name.',
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
        try {
          await updateProfile({ name });
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: 'Your name has been updated successfully. ✅',
            timestamp: new Date()
          }]);
        } catch (err: any) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: err?.message || 'Failed to update profile. Please try again.',
            timestamp: new Date()
          }]);
        }
        setPendingAction('none');
        setIsTyping(false);
        return;
      }

      // Detect intents before Gemini
      if (lower.includes('update kyc') || lower.includes('kyc')) {
        setPendingAction('kyc_aadhaar');
        setPendingKyc({});
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Sure, let’s update your KYC. Please provide your Aadhaar number (12 digits).',
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      if (lower.includes('update phone') || lower.includes('change phone') || lower.includes('update mobile')) {
        setPendingAction('profile_phone');
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Please provide your new phone number (10-12 digits, optional +).',
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      if (lower.includes('update name') || lower.includes('change name')) {
        setPendingAction('profile_name');
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'What is your new full name?',
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      // If no special flow, call Gemini
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const userMessageWithContext = accounts.length > 0 
        ? userText + getAccountContext()
        : userText;

      console.log('💬 User Query:', userText);
      console.log('💰 Account Context Available:', accounts.length > 0);

      const responseText = await geminiRef.current.sendMessage(history, userMessageWithContext);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble communicating with the secure server. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // UI Components
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${geminiRef.current?.isReady() ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
          <h3 className="font-semibold">Nova Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <span className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};