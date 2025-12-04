import { type User, type Transaction, type TransferRequest, type TransferResponse } from "@shared/schema";
import { users as usersTable, accounts as accountsTable, transactions as transactionsTable } from "@shared/schema";
import { users } from "./lib/users-data";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  authenticateUser(username: string, password: string): Promise<User | null>;
  getUser(username: string): Promise<User | null>;
  createTransfer(username: string, transfer: TransferRequest): Promise<TransferResponse>;
}

export class MemStorage implements IStorage {
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const userData = users[username];
    if (!userData || userData.password !== password) {
      return null;
    }

    return {
      username,
      name: userData.name,
      accounts: userData.accounts,
      transactions: userData.transactions,
    };
  }

  async getUser(username: string): Promise<User | null> {
    const userData = users[username];
    if (!userData) {
      return null;
    }

    return {
      username,
      name: userData.name,
      accounts: userData.accounts,
      transactions: userData.transactions,
    };
  }

  async createTransfer(username: string, transfer: TransferRequest): Promise<TransferResponse> {
    const userData = users[username];
    if (!userData) {
      throw new Error("User not found");
    }

    const sourceAccount = userData.accounts.find(acc => acc.id === transfer.sourceAccountId);
    if (!sourceAccount) {
      throw new Error("Source account not found");
    }

    // Calculate fee: Internal = 0, Swiss external = 12, International = 25
    let fee = 25; // Default international fee
    
    // Check if internal transfer first
    let isInternalCheck = false;
    for (const udata of Object.values(users)) {
      if (udata.accounts.some(acc => acc.iban === transfer.recipientIban)) {
        isInternalCheck = true;
        break;
      }
    }
    
    if (isInternalCheck) {
      fee = 0; // Internal transfers are free
    } else if (transfer.recipientIban.startsWith("CH")) {
      fee = 12; // Swiss external IBAN
    }
    
    const totalAmount = transfer.amount + fee;

    if (sourceAccount.balance < totalAmount) {
      throw new Error("Insufficient funds");
    }

    // Check if recipient is another user in the system (internal transfer)
    let isInternal = false;
    let recipientUser: string | null = null;
    let recipientAccount: any = null;

    for (const [uname, udata] of Object.entries(users)) {
      const account = udata.accounts.find(acc => acc.iban === transfer.recipientIban);
      if (account) {
        isInternal = true;
        recipientUser = uname;
        recipientAccount = account;
        break;
      }
    }

    // Deduct from source account
    sourceAccount.balance -= totalAmount;

    // Create outgoing transaction for sender
    const outgoingTransaction: Transaction = {
      id: randomUUID(),
      accountId: transfer.sourceAccountId,
      type: "outgoing",
      amount: transfer.amount,
      counterpartyName: transfer.recipientName || (isInternal ? users[recipientUser!].name : "External Transfer"),
      counterpartyIban: transfer.recipientIban,
      reference: transfer.reference,
      date: new Date().toISOString(),
      fee,
    };

    userData.transactions.push(outgoingTransaction);

    // If internal transfer, add to recipient's account and create incoming transaction
    if (isInternal && recipientUser && recipientAccount) {
      recipientAccount.balance += transfer.amount;

      const incomingTransaction: Transaction = {
        id: randomUUID(),
        accountId: recipientAccount.id,
        type: "incoming",
        amount: transfer.amount,
        counterpartyName: userData.name,
        counterpartyIban: sourceAccount.iban,
        reference: transfer.reference,
        date: new Date().toISOString(),
        fee: 0,
      };

      users[recipientUser].transactions.push(incomingTransaction);
    }

    return {
      success: true,
      transaction: outgoingTransaction,
      isInternal,
    };
  }
}

export class DbStorage implements IStorage {
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!user || user.password !== password) {
      return null;
    }

    return this.getUser(username);
  }

  async getUser(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!user) {
      return null;
    }

    const userAccounts = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, user.id));

    const accountIds = userAccounts.map(acc => acc.id);
    
    let userTransactions: any[] = [];
    if (accountIds.length > 0) {
      userTransactions = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.accountId, accountIds[0]));
      
      for (let i = 1; i < accountIds.length; i++) {
        const txs = await db
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable.accountId, accountIds[i]));
        userTransactions.push(...txs);
      }
    }

    return {
      username: user.username,
      name: user.name,
      accounts: userAccounts.map(acc => ({
        id: acc.id,
        type: acc.accountType as "Private Account" | "Savings Account" | "Investment Portfolio",
        iban: acc.iban,
        balance: parseFloat(acc.balance),
        currency: "CHF" as const,
      })),
      transactions: userTransactions.map(tx => ({
        id: tx.id,
        accountId: tx.accountId,
        type: tx.type as "incoming" | "outgoing",
        amount: parseFloat(tx.amount),
        counterpartyName: tx.counterpartyName,
        counterpartyIban: tx.counterpartyIban,
        reference: tx.reference,
        date: tx.date,
        fee: parseFloat(tx.fee),
      })),
    };
  }

  async createTransfer(username: string, transfer: TransferRequest): Promise<TransferResponse> {
    const user = await this.getUser(username);
    if (!user) {
      throw new Error("User not found");
    }

    const sourceAccount = user.accounts.find(acc => acc.id === transfer.sourceAccountId);
    if (!sourceAccount) {
      throw new Error("Source account not found");
    }

    // Check if recipient is an internal account
    const [recipientAccount] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.iban, transfer.recipientIban))
      .limit(1);

    const isInternal = !!recipientAccount;
    
    // Calculate fee
    let fee = 25;
    if (isInternal) {
      fee = 0;
    } else if (transfer.recipientIban.startsWith("CH")) {
      fee = 12;
    }

    const totalAmount = transfer.amount + fee;

    if (sourceAccount.balance < totalAmount) {
      throw new Error("Insufficient funds");
    }

    // Update source account balance
    const newSourceBalance = sourceAccount.balance - totalAmount;
    await db
      .update(accountsTable)
      .set({ balance: newSourceBalance.toString() })
      .where(eq(accountsTable.id, transfer.sourceAccountId));

    // Get recipient name for transaction
    let counterpartyName = transfer.recipientName || "External Transfer";
    if (isInternal && recipientAccount) {
      const [recipientUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, recipientAccount.userId))
        .limit(1);
      
      if (recipientUser) {
        counterpartyName = recipientUser.name;
      }
    }

    // Create outgoing transaction
    const [outgoingTx] = await db
      .insert(transactionsTable)
      .values({
        accountId: transfer.sourceAccountId,
        type: "outgoing",
        amount: transfer.amount.toString(),
        counterpartyName,
        counterpartyIban: transfer.recipientIban,
        reference: transfer.reference,
        date: new Date().toISOString(),
        fee: fee.toString(),
      })
      .returning();

    // If internal transfer, update recipient account and create incoming transaction
    if (isInternal && recipientAccount) {
      const newRecipientBalance = parseFloat(recipientAccount.balance) + transfer.amount;
      await db
        .update(accountsTable)
        .set({ balance: newRecipientBalance.toString() })
        .where(eq(accountsTable.id, recipientAccount.id));

      const [senderUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1);

      await db
        .insert(transactionsTable)
        .values({
          accountId: recipientAccount.id,
          type: "incoming",
          amount: transfer.amount.toString(),
          counterpartyName: senderUser?.name || username,
          counterpartyIban: sourceAccount.iban,
          reference: transfer.reference,
          date: new Date().toISOString(),
          fee: "0",
        });
    }

    return {
      success: true,
      transaction: {
        id: outgoingTx.id,
        accountId: outgoingTx.accountId,
        type: "outgoing",
        amount: parseFloat(outgoingTx.amount),
        counterpartyName: outgoingTx.counterpartyName,
        counterpartyIban: outgoingTx.counterpartyIban,
        reference: outgoingTx.reference,
        date: outgoingTx.date,
        fee: parseFloat(outgoingTx.fee),
      },
      isInternal,
    };
  }
}

// Use MemStorage as fallback - if your Neon database doesn't have data, change this to: new MemStorage()
// To use Neon database: new DbStorage()
export const storage = new MemStorage();
