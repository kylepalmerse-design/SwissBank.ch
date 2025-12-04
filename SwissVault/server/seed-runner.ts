import { db } from "./db";
import { users as usersTable, accounts as accountsTable, transactions as transactionsTable } from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;

// Helper to generate transaction ID
const generateId = () => randomUUID();

// Helper to generate date in the past
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const seedData = [
  {
    username: "john.smith",
    password: "mypassword123",
    name: "John Smith",
    accounts: [
      {
        id: "acc-js-1",
        type: "Private Account",
        iban: "CH5604835012345678000",
        balance: 1850000,
      },
      {
        id: "acc-js-2",
        type: "Savings Account",
        iban: "CH3108339000987654321",
        balance: 3200000,
      },
      {
        id: "acc-js-3",
        type: "Investment Portfolio",
        iban: "CH4487890123456789001",
        balance: 7450000,
      },
    ],
    transactions: [
      {
        accountId: "acc-js-1",
        type: "incoming" as const,
        amount: 15000,
        counterpartyName: "Salary - Tech Corp AG",
        counterpartyIban: "CH9300762011623852957",
        reference: "Monthly salary December 2024",
        date: daysAgo(2),
        fee: 0,
      },
      {
        accountId: "acc-js-1",
        type: "outgoing" as const,
        amount: 2500,
        counterpartyName: "Rent Payment",
        counterpartyIban: "CH1234567890123456789",
        reference: "Apartment rent December",
        date: daysAgo(5),
        fee: 0,
      },
    ],
  },
  {
    username: "alexander.weber",
    password: "123456",
    name: "Alexander Weber",
    accounts: [
      {
        id: "acc-aw-1",
        type: "Private Account",
        iban: "CH9300762011623852957",
        balance: 2750000,
      },
      {
        id: "acc-aw-2",
        type: "Savings Account",
        iban: "CH5789012345678901234",
        balance: 4100000,
      },
      {
        id: "acc-aw-3",
        type: "Investment Portfolio",
        iban: "CH2345678901234567890",
        balance: 8900000,
      },
    ],
    transactions: [
      {
        accountId: "acc-aw-1",
        type: "incoming" as const,
        amount: 25000,
        counterpartyName: "Consulting Fee",
        counterpartyIban: "CH1111222233334444555",
        reference: "November consulting services",
        date: daysAgo(3),
        fee: 0,
      },
    ],
  },
  {
    username: "marina.berger",
    password: "secret2025",
    name: "Marina Berger",
    accounts: [
      {
        id: "acc-mb-1",
        type: "Private Account",
        iban: "CH4208704048075000000",
        balance: 3650000,
      },
      {
        id: "acc-mb-2",
        type: "Savings Account",
        iban: "CH7604835012345678999",
        balance: 5200000,
      },
      {
        id: "acc-mb-3",
        type: "Investment Portfolio",
        iban: "CH3609000000000000001",
        balance: 12500000,
      },
    ],
    transactions: [],
  },
  {
    username: "thomas.mueller",
    password: "password123",
    name: "Thomas Müller",
    accounts: [
      {
        id: "acc-tm-1",
        type: "Private Account",
        iban: "CH1234567890123456789",
        balance: 890000,
      },
      {
        id: "acc-tm-2",
        type: "Savings Account",
        iban: "CH9876543210987654321",
        balance: 1450000,
      },
      {
        id: "acc-tm-3",
        type: "Investment Portfolio",
        iban: "CH5555444433332222111",
        balance: 3850000,
      },
    ],
    transactions: [],
  },
  {
    username: "sophie.laurent",
    password: "secure456",
    name: "Sophie Laurent",
    accounts: [
      {
        id: "acc-sl-1",
        type: "Private Account",
        iban: "CH6789012345678901234",
        balance: 4250000,
      },
      {
        id: "acc-sl-2",
        type: "Savings Account",
        iban: "CH3456789012345678901",
        balance: 6800000,
      },
      {
        id: "acc-sl-3",
        type: "Investment Portfolio",
        iban: "CH8901234567890123456",
        balance: 15200000,
      },
    ],
    transactions: [],
  },
  {
    username: "david.zhang",
    password: "banking789",
    name: "David Zhang",
    accounts: [
      {
        id: "acc-dz-1",
        type: "Private Account",
        iban: "CH1111222233334444555",
        balance: 1920000,
      },
      {
        id: "acc-dz-2",
        type: "Savings Account",
        iban: "CH6666777788889999000",
        balance: 2850000,
      },
      {
        id: "acc-dz-3",
        type: "Investment Portfolio",
        iban: "CH3333222211110000999",
        balance: 6750000,
      },
    ],
    transactions: [],
  },
];

export async function seed() {
  console.log("Starting database seed...");

  try {
    // Clear existing data
    await db.delete(transactionsTable);
    await db.delete(accountsTable);
    await db.delete(usersTable);
    console.log("Cleared existing data");

    // Seed users
    for (const userData of seedData) {
      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

      const [user] = await db
        .insert(usersTable)
        .values({
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
        })
        .returning();

      console.log(`Created user: ${userData.username}`);

      // Seed accounts
      for (const account of userData.accounts) {
        await db.insert(accountsTable).values({
          id: account.id,
          userId: user.id,
          accountType: account.type,
          iban: account.iban,
          balance: account.balance.toString(),
          currency: "CHF",
        });
      }

      console.log(`Created ${userData.accounts.length} accounts for ${userData.username}`);

      // Seed transactions
      for (const tx of userData.transactions) {
        await db.insert(transactionsTable).values({
          accountId: tx.accountId,
          type: tx.type,
          amount: tx.amount.toString(),
          counterpartyName: tx.counterpartyName,
          counterpartyIban: tx.counterpartyIban,
          reference: tx.reference,
          date: tx.date,
          fee: tx.fee.toString(),
        });
      }

      if (userData.transactions.length > 0) {
        console.log(`Created ${userData.transactions.length} transactions for ${userData.username}`);
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seed();
