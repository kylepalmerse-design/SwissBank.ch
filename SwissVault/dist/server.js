// server/index-prod.ts
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// server/lib/users-data.ts
import { randomUUID } from "crypto";
var generateId = () => randomUUID();
var daysAgo = (days) => {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};
var users = {
  "john.smith": {
    password: "mypassword123",
    name: "John Smith",
    accounts: [
      {
        id: "acc-js-1",
        type: "Private Account",
        iban: "CH5604835012345678000",
        balance: 185e4,
        currency: "CHF",
        performanceChange: 1.2
      },
      {
        id: "acc-js-2",
        type: "Savings Account",
        iban: "CH3108339000987654321",
        balance: 32e5,
        currency: "CHF",
        performanceChange: 2.15
      },
      {
        id: "acc-js-3",
        type: "Investment Portfolio",
        iban: "CH4487890123456789001",
        balance: 745e4,
        currency: "CHF",
        performanceChange: 5.8
      }
    ],
    transactions: [
      // Private Account - Daily Charges
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "incoming",
        amount: 15e3,
        counterpartyName: "Salary - Tech Corp AG",
        counterpartyIban: "CH9300762011623852957",
        reference: "Monthly salary December 2024",
        date: daysAgo(2),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "outgoing",
        amount: 2500,
        counterpartyName: "Rent Payment",
        counterpartyIban: "CH1234567890123456789",
        reference: "Apartment rent December",
        date: daysAgo(5),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "outgoing",
        amount: 89.5,
        counterpartyName: "Coop Supermarket",
        counterpartyIban: "CH8912345678901234567",
        reference: "Groceries",
        date: daysAgo(1),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "outgoing",
        amount: 145,
        counterpartyName: "Swisscom AG",
        counterpartyIban: "CH1200762011623852957",
        reference: "Mobile & Internet subscription",
        date: daysAgo(3),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "outgoing",
        amount: 62.4,
        counterpartyName: "Restaurant Avalon",
        counterpartyIban: "CH3332211043210987654",
        reference: "Dinner reservation",
        date: daysAgo(4),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-1",
        type: "outgoing",
        amount: 120,
        counterpartyName: "Spotify Premium",
        counterpartyIban: "CH4543210987654321098",
        reference: "Music streaming subscription",
        date: daysAgo(6),
        fee: 0
      },
      // Savings Account - Monthly Additions from Private
      {
        id: generateId(),
        accountId: "acc-js-2",
        type: "incoming",
        amount: 5e3,
        counterpartyName: "Transfer from Private Account",
        counterpartyIban: "CH5604835012345678000",
        reference: "Monthly savings transfer",
        date: daysAgo(1),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-2",
        type: "incoming",
        amount: 3400,
        counterpartyName: "Interest Payment - Monthly",
        counterpartyIban: "CH3108339000987654321",
        reference: "2.15% annual interest",
        date: daysAgo(10),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-2",
        type: "incoming",
        amount: 5e3,
        counterpartyName: "Transfer from Private Account",
        counterpartyIban: "CH5604835012345678000",
        reference: "Monthly savings transfer",
        date: daysAgo(30),
        fee: 0
      },
      // Investment Portfolio - Stock & Crypto Trading
      {
        id: generateId(),
        accountId: "acc-js-3",
        type: "outgoing",
        amount: 125e3,
        counterpartyName: "Tesla Inc. Stock Purchase",
        counterpartyIban: "CH9876543210987654321",
        reference: "2500 shares @ CHF 50",
        date: daysAgo(3),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-3",
        type: "incoming",
        amount: 45e3,
        counterpartyName: "Dividend Payment - Nestl\xE9",
        counterpartyIban: "CH9876543210987654321",
        reference: "Dividend distribution Q4 2024",
        date: daysAgo(7),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-3",
        type: "outgoing",
        amount: 85e3,
        counterpartyName: "Bitcoin Purchase",
        counterpartyIban: "CH5555666677778888999",
        reference: "2.5 BTC @ CHF 34000",
        date: daysAgo(12),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-js-3",
        type: "incoming",
        amount: 12500,
        counterpartyName: "Stock Sale - Microsoft",
        counterpartyIban: "CH9876543210987654321",
        reference: "500 shares sold @ CHF 25",
        date: daysAgo(20),
        fee: 0
      }
    ]
  },
  "alexander.weber": {
    password: "123456",
    name: "Alexander Weber",
    accounts: [
      {
        id: "acc-aw-1",
        type: "Private Account",
        iban: "CH9300762011623852957",
        balance: 275e4,
        currency: "CHF",
        performanceChange: 0.85
      },
      {
        id: "acc-aw-2",
        type: "Savings Account",
        iban: "CH5789012345678901234",
        balance: 41e5,
        currency: "CHF",
        performanceChange: 2.15
      },
      {
        id: "acc-aw-3",
        type: "Investment Portfolio",
        iban: "CH2345678901234567890",
        balance: 89e5,
        currency: "CHF",
        performanceChange: 6.45
      }
    ],
    transactions: [
      // Private Account - Daily Charges
      {
        id: generateId(),
        accountId: "acc-aw-1",
        type: "incoming",
        amount: 25e3,
        counterpartyName: "Consulting Fee",
        counterpartyIban: "CH1111222233334444555",
        reference: "November consulting services",
        date: daysAgo(3),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-1",
        type: "outgoing",
        amount: 8500,
        counterpartyName: "Luxury Car Payment",
        counterpartyIban: "CH6666777788889999000",
        reference: "Mercedes lease December",
        date: daysAgo(10),
        fee: 12
      },
      {
        id: generateId(),
        accountId: "acc-aw-1",
        type: "outgoing",
        amount: 245.8,
        counterpartyName: "Michelin Restaurant",
        counterpartyIban: "CH2211334455667788990",
        reference: "Fine dining experience",
        date: daysAgo(2),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-1",
        type: "outgoing",
        amount: 1200,
        counterpartyName: "Art Gallery Purchase",
        counterpartyIban: "CH3322445566778899001",
        reference: "Contemporary artwork",
        date: daysAgo(5),
        fee: 0
      },
      // Savings Account - Monthly Additions
      {
        id: generateId(),
        accountId: "acc-aw-2",
        type: "incoming",
        amount: 1e4,
        counterpartyName: "Transfer from Private Account",
        counterpartyIban: "CH9300762011623852957",
        reference: "Monthly savings transfer",
        date: daysAgo(1),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-2",
        type: "incoming",
        amount: 3500,
        counterpartyName: "Interest Payment",
        counterpartyIban: "CH5789012345678901234",
        reference: "Quarterly interest 2.15%",
        date: daysAgo(15),
        fee: 0
      },
      // Investment Portfolio - Stock & Crypto
      {
        id: generateId(),
        accountId: "acc-aw-3",
        type: "outgoing",
        amount: 2e5,
        counterpartyName: "Google Stock Purchase",
        counterpartyIban: "CH2345678901234567890",
        reference: "1500 shares @ CHF 133.33",
        date: daysAgo(2),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-3",
        type: "incoming",
        amount: 125e3,
        counterpartyName: "Portfolio Growth",
        counterpartyIban: "CH2345678901234567890",
        reference: "Q4 asset appreciation",
        date: daysAgo(20),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-3",
        type: "outgoing",
        amount: 15e4,
        counterpartyName: "Ethereum Purchase",
        counterpartyIban: "CH5555666677778888999",
        reference: "100 ETH @ CHF 1500",
        date: daysAgo(8),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-aw-3",
        type: "incoming",
        amount: 45e3,
        counterpartyName: "Dividend Payment - Apple",
        counterpartyIban: "CH2345678901234567890",
        reference: "Dividend distribution Dec 2024",
        date: daysAgo(18),
        fee: 0
      }
    ]
  },
  "marina.berger": {
    password: "secret2025",
    name: "Marina Berger",
    accounts: [
      {
        id: "acc-mb-1",
        type: "Private Account",
        iban: "CH4208704048075000000",
        balance: 365e4,
        currency: "CHF"
      },
      {
        id: "acc-mb-2",
        type: "Savings Account",
        iban: "CH7604835012345678999",
        balance: 52e5,
        currency: "CHF"
      },
      {
        id: "acc-mb-3",
        type: "Investment Portfolio",
        iban: "CH3609000000000000001",
        balance: 125e5,
        currency: "CHF"
      }
    ],
    transactions: [
      {
        id: generateId(),
        accountId: "acc-mb-1",
        type: "incoming",
        amount: 35e3,
        counterpartyName: "Director Salary",
        counterpartyIban: "CH9999888877776666555",
        reference: "Executive compensation December",
        date: daysAgo(1),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-mb-1",
        type: "outgoing",
        amount: 15e3,
        counterpartyName: "Private School Tuition",
        counterpartyIban: "CH1234509876543210987",
        reference: "Winter semester fees",
        date: daysAgo(6),
        fee: 12
      },
      {
        id: generateId(),
        accountId: "acc-mb-3",
        type: "incoming",
        amount: 28e4,
        counterpartyName: "Real Estate Income",
        counterpartyIban: "CH7777666655554444333",
        reference: "Property rental Q4 2024",
        date: daysAgo(12),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-mb-2",
        type: "incoming",
        amount: 5600,
        counterpartyName: "Savings Interest",
        counterpartyIban: "CH7604835012345678999",
        reference: "Annual interest payment",
        date: daysAgo(18),
        fee: 0
      }
    ]
  },
  "thomas.mueller": {
    password: "password123",
    name: "Thomas M\xFCller",
    accounts: [
      {
        id: "acc-tm-1",
        type: "Private Account",
        iban: "CH1234567890123456789",
        balance: 89e4,
        currency: "CHF"
      },
      {
        id: "acc-tm-2",
        type: "Savings Account",
        iban: "CH9876543210987654321",
        balance: 145e4,
        currency: "CHF"
      },
      {
        id: "acc-tm-3",
        type: "Investment Portfolio",
        iban: "CH5555444433332222111",
        balance: 385e4,
        currency: "CHF"
      }
    ],
    transactions: [
      {
        id: generateId(),
        accountId: "acc-tm-1",
        type: "incoming",
        amount: 12e3,
        counterpartyName: "Freelance Project",
        counterpartyIban: "CH1111222233334444555",
        reference: "Web development November",
        date: daysAgo(4),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-tm-1",
        type: "outgoing",
        amount: 3200,
        counterpartyName: "Mortgage Payment",
        counterpartyIban: "CH9999000011112222333",
        reference: "Monthly mortgage December",
        date: daysAgo(8),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-tm-3",
        type: "incoming",
        amount: 18500,
        counterpartyName: "Stock Dividends",
        counterpartyIban: "CH5555444433332222111",
        reference: "Quarterly dividend payout",
        date: daysAgo(14),
        fee: 0
      }
    ]
  },
  "sophie.laurent": {
    password: "secure456",
    name: "Sophie Laurent",
    accounts: [
      {
        id: "acc-sl-1",
        type: "Private Account",
        iban: "CH6789012345678901234",
        balance: 425e4,
        currency: "CHF"
      },
      {
        id: "acc-sl-2",
        type: "Savings Account",
        iban: "CH3456789012345678901",
        balance: 68e5,
        currency: "CHF"
      },
      {
        id: "acc-sl-3",
        type: "Investment Portfolio",
        iban: "CH8901234567890123456",
        balance: 152e5,
        currency: "CHF"
      }
    ],
    transactions: [
      {
        id: generateId(),
        accountId: "acc-sl-1",
        type: "incoming",
        amount: 45e3,
        counterpartyName: "Business Profits",
        counterpartyIban: "CH2222333344445555666",
        reference: "Q4 company distribution",
        date: daysAgo(5),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-sl-1",
        type: "outgoing",
        amount: 28e3,
        counterpartyName: "Luxury Travel",
        counterpartyIban: "CH7777888899990000111",
        reference: "Maldives vacation package",
        date: daysAgo(9),
        fee: 25
      },
      {
        id: generateId(),
        accountId: "acc-sl-3",
        type: "incoming",
        amount: 32e4,
        counterpartyName: "Investment Gains",
        counterpartyIban: "CH8901234567890123456",
        reference: "Portfolio rebalancing profit",
        date: daysAgo(16),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-sl-2",
        type: "incoming",
        amount: 7300,
        counterpartyName: "Interest Earnings",
        counterpartyIban: "CH3456789012345678901",
        reference: "Semi-annual interest",
        date: daysAgo(22),
        fee: 0
      }
    ]
  },
  "david.zhang": {
    password: "banking789",
    name: "David Zhang",
    accounts: [
      {
        id: "acc-dz-1",
        type: "Private Account",
        iban: "CH1111222233334444555",
        balance: 192e4,
        currency: "CHF"
      },
      {
        id: "acc-dz-2",
        type: "Savings Account",
        iban: "CH6666777788889999000",
        balance: 285e4,
        currency: "CHF"
      },
      {
        id: "acc-dz-3",
        type: "Investment Portfolio",
        iban: "CH3333222211110000999",
        balance: 675e4,
        currency: "CHF"
      }
    ],
    transactions: [
      {
        id: generateId(),
        accountId: "acc-dz-1",
        type: "incoming",
        amount: 22e3,
        counterpartyName: "Tech Startup Salary",
        counterpartyIban: "CH4444555566667777888",
        reference: "CTO compensation December",
        date: daysAgo(3),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-dz-1",
        type: "outgoing",
        amount: 5500,
        counterpartyName: "Office Lease",
        counterpartyIban: "CH9999888877776666555",
        reference: "Co-working space monthly",
        date: daysAgo(11),
        fee: 12
      },
      {
        id: generateId(),
        accountId: "acc-dz-3",
        type: "incoming",
        amount: 95e3,
        counterpartyName: "Crypto Profits",
        counterpartyIban: "CH3333222211110000999",
        reference: "Digital asset trading gains",
        date: daysAgo(17),
        fee: 0
      },
      {
        id: generateId(),
        accountId: "acc-dz-2",
        type: "incoming",
        amount: 3050,
        counterpartyName: "Savings Interest",
        counterpartyIban: "CH6666777788889999000",
        reference: "Quarterly interest 2.15%",
        date: daysAgo(25),
        fee: 0
      }
    ]
  }
};

// server/index-prod.ts
import { randomUUID as randomUUID2 } from "crypto";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 1e4;
var MemoryStoreSession = MemoryStore(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  store: new MemoryStoreSession({ checkPeriod: 864e5 }),
  secret: process.env.SESSION_SECRET || "swiss-bank-secret-2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3,
    sameSite: "lax"
  }
}));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const userData = users[username];
    if (!userData || userData.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.username = username;
    res.json({
      success: true,
      user: {
        username,
        name: userData.name,
        accounts: userData.accounts,
        transactions: userData.transactions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
});
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});
app.get("/api/user", (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const userData = users[req.session.username];
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      username: req.session.username,
      name: userData.name,
      accounts: userData.accounts,
      transactions: userData.transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to get user" });
  }
});
app.post("/api/transfers", (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { sourceAccountId, recipientIban, recipientName, amount, reference } = req.body;
    const userData = users[req.session.username];
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const sourceAccount = userData.accounts.find((acc) => acc.id === sourceAccountId);
    if (!sourceAccount) {
      return res.status(400).json({ message: "Source account not found" });
    }
    let fee = 25;
    let isInternalCheck = false;
    for (const udata of Object.values(users)) {
      if (udata.accounts.some((acc) => acc.iban === recipientIban)) {
        isInternalCheck = true;
        break;
      }
    }
    if (isInternalCheck) {
      fee = 0;
    } else if (recipientIban.startsWith("CH")) {
      fee = 12;
    }
    const totalAmount = amount + fee;
    if (sourceAccount.balance < totalAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    sourceAccount.balance -= totalAmount;
    const outgoingTransaction = {
      id: randomUUID2(),
      accountId: sourceAccountId,
      type: "outgoing",
      amount,
      counterpartyName: recipientName || "External Transfer",
      counterpartyIban: recipientIban,
      reference: reference || "",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      fee
    };
    userData.transactions.push(outgoingTransaction);
    let isInternal = false;
    let recipientUser = null;
    let recipientAccount = null;
    for (const [uname, udata] of Object.entries(users)) {
      const account = udata.accounts.find((acc) => acc.iban === recipientIban);
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
        id: randomUUID2(),
        accountId: recipientAccount.id,
        type: "incoming",
        amount,
        counterpartyName: userData.name,
        counterpartyIban: sourceAccount.iban,
        reference: reference || "",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        fee: 0
      };
      users[recipientUser].transactions.push(incomingTransaction);
    }
    res.json({
      success: true,
      transaction: outgoingTransaction,
      isInternal
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Transfer failed" });
  }
});
app.use(express.static(path.join(__dirname, "../dist/public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
