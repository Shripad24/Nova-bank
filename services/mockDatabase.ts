import { Account, AccountType, Transaction, User } from '../types';

// Initial Seed Data
const MOCK_USER: User = {
  id: 'user_123',
  name: 'Alex Mercer',
  email: 'alex@novabank.com',
  phone: '+91 98765 43210',
  aadhaar: '1234 5678 9000',
  pan: 'ABCDE1234F',
  kycStatus: 'Verified'
};

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    userId: 'user_123',
    type: AccountType.CHECKING,
    name: 'Everyday Checking',
    balance: 74200.50,
    currency: 'INR',
    accountNumber: '****4582'
  },
  {
    id: 'acc_2',
    userId: 'user_123',
    type: AccountType.SAVINGS,
    name: 'High Yield Savings',
    balance: 215000.0,
    currency: 'INR',
    accountNumber: '****9921'
  },
  {
    id: 'acc_3',
    userId: 'user_123',
    type: AccountType.CREDIT,
    name: 'Platinum Visa',
    balance: -15500.25,
    currency: 'INR',
    accountNumber: '****1122'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', accountId: 'acc_1', amount: -1450.0, date: new Date(Date.now() - 86400000).toISOString(), description: 'Big Bazaar Groceries', type: 'DEBIT' },
  { id: 'tx_2', accountId: 'acc_1', amount: -499.0, date: new Date(Date.now() - 172800000).toISOString(), description: 'OTT Subscription', type: 'DEBIT' },
  { id: 'tx_3', accountId: 'acc_1', amount: 78500.0, date: new Date(Date.now() - 259200000).toISOString(), description: 'Salary Credit', type: 'CREDIT' },
  { id: 'tx_4', accountId: 'acc_2', amount: 950.75, date: new Date(Date.now() - 604800000).toISOString(), description: 'Quarterly Interest', type: 'CREDIT' },
];

// Helper for latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class BankingService {
  private accounts: Account[] = [...MOCK_ACCOUNTS];
  private transactions: Transaction[] = [...MOCK_TRANSACTIONS];
  private user: User = { ...MOCK_USER };

  async login(email: string, password: string): Promise<User> {
    await delay(800);
    if (email && password) {
      return { ...this.user };
    }
    throw new Error('Invalid credentials');
  }

  async updateKyc(userId: string, aadhaar: string, pan: string): Promise<User> {
    await delay(600);
    if (userId !== this.user.id) throw new Error('User not found');
    this.user = {
      ...this.user,
      aadhaar,
      pan,
      kycStatus: 'Verified'
    };
    return { ...this.user };
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await delay(500);
    if (userId !== this.user.id) throw new Error('User not found');
    this.user = {
      ...this.user,
      ...data,
    };
    return { ...this.user };
  }

  async getAccounts(userId: string): Promise<Account[]> {
    await delay(400);
    return this.accounts.filter(a => a.userId === userId);
  }

  async getTransactions(userId: string, limit: number = 5): Promise<Transaction[]> {
    await delay(400);
    const accountIds = this.accounts.filter(a => a.userId === userId).map(a => a.id);
    return this.transactions
      .filter(t => accountIds.includes(t.accountId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async transferFunds(userId: string, fromType: string, toType: string, amount: number): Promise<{ success: boolean; message: string }> {
    await delay(1000); // Simulate processing

    const fromAccount = this.accounts.find(a => a.userId === userId && a.name.toLowerCase().includes(fromType.toLowerCase()) || a.type.toLowerCase() === fromType.toLowerCase());
    const toAccount = this.accounts.find(a => a.userId === userId && a.name.toLowerCase().includes(toType.toLowerCase()) || a.type.toLowerCase() === toType.toLowerCase());

    if (!fromAccount || !toAccount) {
      return { success: false, message: 'Could not find one of the specified accounts.' };
    }

    if (fromAccount.balance < amount) {
      return { success: false, message: 'Insufficient funds.' };
    }

    // Perform Update
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Record Transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: fromAccount.id,
      amount: -amount,
      date: new Date().toISOString(),
      description: `Transfer to ${toAccount.name}`,
      type: 'DEBIT'
    };
    this.transactions.unshift(newTx);

    return { success: true, message: `Successfully transferred $${amount} from ${fromAccount.name} to ${toAccount.name}.` };
  }
}

export const bankingService = new BankingService();
