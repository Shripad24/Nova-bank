export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  aadhaar?: string;
  pan?: string;
  kycStatus?: 'Verified' | 'Pending' | 'Not Started';
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string; // Masked in UI
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export enum LoginStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}