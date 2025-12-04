import { db } from "../db.ts";
import { users, accounts, transactions } from "../../shared/schema.ts";
import { users as usersData } from "./users-data.ts";

export async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(accounts);
    await db.delete(users);

    console.log("Cleared existing data");

    // Insert users and their data
    for (const [username, userData] of Object.entries(usersData)) {
      // Insert user
      const [insertedUser] = await db.insert(users).values({
        username,
        password: userData.password,
        name: userData.name,
      }).returning();

      console.log(`Inserted user: ${username}`);

      // Insert accounts for this user
      for (const account of userData.accounts) {
        await db.insert(accounts).values({
          id: account.id,
          userId: insertedUser.id,
          accountType: account.type,
          iban: account.iban,
          balance: account.balance.toString(),
          currency: account.currency,
        });
      }

      console.log(`Inserted ${userData.accounts.length} accounts for ${username}`);

      // Insert transactions for this user
      for (const transaction of userData.transactions) {
        await db.insert(transactions).values({
          id: transaction.id,
          accountId: transaction.accountId,
          type: transaction.type,
          amount: transaction.amount.toString(),
          counterpartyName: transaction.counterpartyName,
          counterpartyIban: transaction.counterpartyIban,
          reference: transaction.reference,
          date: transaction.date,
          fee: transaction.fee.toString(),
        });
      }

      console.log(`Inserted ${userData.transactions.length} transactions for ${username}`);
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
