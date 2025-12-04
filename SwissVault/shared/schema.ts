import { z } from "zod";
import { pgTable, text, uuid, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Drizzle Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountType: text("account_type").notNull(),
  iban: text("iban").notNull().unique(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("CHF"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  counterpartyName: text("counterparty_name").notNull(),
  counterpartyIban: text("counterparty_iban").notNull(),
  reference: text("reference").notNull(),
  date: timestamp("date", { mode: "string" }).notNull(),
  fee: decimal("fee", { precision: 15, scale: 2 }).notNull().default("0"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts);
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type SelectUser = typeof users.$inferSelect;
export type SelectAccount = typeof accounts.$inferSelect;
export type SelectTransaction = typeof transactions.$inferSelect;

// Legacy interfaces for compatibility
export interface Account {
  id: string;
  type: "Private Account" | "Savings Account" | "Investment Portfolio";
  iban: string;
  balance: number;
  currency: "CHF";
  performanceChange?: number; // Percentage change over period
}

export interface Transaction {
  id: string;
  accountId: string;
  type: "incoming" | "outgoing";
  amount: number;
  counterpartyName: string;
  counterpartyIban: string;
  reference: string;
  date: string;
  fee: number;
}

export interface UserData {
  password: string;
  name: string;
  accounts: Account[];
  transactions: Transaction[];
}

export interface User {
  username: string;
  name: string;
  accounts: Account[];
  transactions: Transaction[];
}

// Login request schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Transfer request schema
export const transferSchema = z.object({
  sourceAccountId: z.string().min(1, "Source account is required"),
  recipientIban: z.string()
    .regex(/^[A-Z]{2}\d{2}/, "Invalid IBAN format")
    .min(15, "Valid IBAN required")
    .max(34, "IBAN too long"),
  recipientName: z.string().optional(),
  amount: z.number()
    .positive("Amount must be positive")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  reference: z.string().max(140, "Reference must be 140 characters or less"),
});

export type TransferRequest = z.infer<typeof transferSchema>;

// Transfer response
export interface TransferResponse {
  success: boolean;
  transaction: Transaction;
  isInternal: boolean;
}
