import { transactionSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getTransactions } from "@/lib/api/transactions/queries";

// Base schema: omit Prisma-managed timestamps
const baseSchema = transactionSchema.omit(timestamps);

// Schema for inserting new transactions
export const insertTransactionSchema = baseSchema.omit({ id: true });

// Params for API requests (normalized to match Prisma, with chain inferred server-side)
export const insertTransactionParams = baseSchema.extend({
  wallets: z.array(z.string().min(1)), // Override to use wallet addresses
}).omit({
  id: true,
  chain: true,
});

export const validateTransactionParams = baseSchema.extend({
  wallets: z.array(z.string().min(1)), // Override to use wallet addresses
  blockTime: z.string(),           // Accept string from Solana server
  blockNumber: z.string(),
  fee: z.string().nullable(),      // Accept string or null
}).omit({
  id: true,
  chain: true,
});

// Schema for updating transactions
export const updateTransactionSchema = baseSchema;

// Params for updating transactions
export const updateTransactionParams = baseSchema.extend({
  wallets: z.array(z.string().min(1)), // Override to use wallet addresses
  blockTime: z.string(),
  blockNumber: z.string(),
  fee: z.string().nullable(),
}).omit({
  chain: true,
});

// Schema for transaction ID
export const transactionIdSchema = baseSchema.pick({ id: true });

// Types for TypeScript
export type Transaction = z.infer<typeof transactionSchema>;
export type NewTransaction = z.infer<typeof insertTransactionSchema>;
export type NewTransactionParams = z.infer<typeof insertTransactionParams>;
export type ValidateTransactionParams = z.infer<typeof validateTransactionParams>;
export type UpdateTransactionParams = z.infer<typeof updateTransactionParams>;
export type TransactionId = z.infer<typeof transactionIdSchema>["id"];

// Type for complete transaction with joins
export type CompleteTransaction = Awaited<ReturnType<typeof getTransactions>>["transactions"][number];