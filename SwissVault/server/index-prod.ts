import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { users } from './lib/users-data.js';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const MemoryStoreSession = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  store: new MemoryStoreSession({ checkPeriod: 86400000 }),
  secret: process.env.SESSION_SECRET || 'swiss-bank-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

declare module 'express-session' {
  interface SessionData {
    username: string;
  }
}

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const userData = users[username];
    if (!userData || userData.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.username = username;
    res.json({
      success: true,
      user: {
        username,
        name: userData.name,
        accounts: userData.accounts,
        transactions: userData.transactions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Get current user endpoint
app.get('/api/user', (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userData = users[req.session.username];
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: req.session.username,
      name: userData.name,
      accounts: userData.accounts,
      transactions: userData.transactions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get user' });
  }
});

// Create transfer endpoint
app.post('/api/transfers', (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { sourceAccountId, recipientIban, recipientName, amount, reference } = req.body;

    const userData = users[req.session.username];
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sourceAccount = userData.accounts.find((acc: any) => acc.id === sourceAccountId);
    if (!sourceAccount) {
      return res.status(400).json({ message: 'Source account not found' });
    }

    let fee = 25;
    let isInternalCheck = false;

    for (const udata of Object.values(users)) {
      if ((udata as any).accounts.some((acc: any) => acc.iban === recipientIban)) {
        isInternalCheck = true;
        break;
      }
    }

    if (isInternalCheck) {
      fee = 0;
    } else if (recipientIban.startsWith('CH')) {
      fee = 12;
    }

    const totalAmount = amount + fee;

    if (sourceAccount.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    sourceAccount.balance -= totalAmount;

    const outgoingTransaction = {
      id: randomUUID(),
      accountId: sourceAccountId,
      type: 'outgoing' as const,
      amount,
      counterpartyName: recipientName || 'External Transfer',
      counterpartyIban: recipientIban,
      reference: reference || '',
      date: new Date().toISOString(),
      fee,
    };

    userData.transactions.push(outgoingTransaction);

    let isInternal = false;
    let recipientUser: string | null = null;
    let recipientAccount: any = null;

    for (const [uname, udata] of Object.entries(users)) {
      const account = (udata as any).accounts.find((acc: any) => acc.iban === recipientIban);
      if (account) {
        isInternal = true;
        recipientUser = uname;
        recipientAccount = account;
        break;
      }
    }

    if (isInternal && recipientUser && recipientAccount) {
      recipientAccount.balance += amount;

      const incomingTransaction = {
        id: randomUUID(),
        accountId: recipientAccount.id,
        type: 'incoming' as const,
        amount,
        counterpartyName: userData.name,
        counterpartyIban: sourceAccount.iban,
        reference: reference || '',
        date: new Date().toISOString(),
        fee: 0,
      };

      users[recipientUser].transactions.push(incomingTransaction);
    }

    res.json({
      success: true,
      transaction: outgoingTransaction,
      isInternal,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Transfer failed' });
  }
});

app.use(express.static(path.join(__dirname, '../dist/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
