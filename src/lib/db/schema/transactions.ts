import { transactionSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getTransactions } from "@/lib/api/transactions/queries";


// Schema for transactions - used to validate API requests
const baseSchema = transactionSchema.omit(timestamps)

export const insertTransactionSchema = baseSchema.omit({ id: true });
export const insertTransactionParams = baseSchema.extend({
  walletId: z.string().min(1),
  signature: z.string().min(1),
  timestamp: z.date(),
  type: z.string().min(1),
  status: z.string().min(1),
  raw: z.any()
}).omit({ 
  id: true
});

export const updateTransactionSchema = baseSchema;
export const updateTransactionParams = updateTransactionSchema.extend({
  walletId: z.string().min(1),
  signature: z.string().min(1),
  timestamp: z.date(),
  type: z.string().min(1),
  status: z.string().min(1),
  raw: z.any()
})
export const transactionIdSchema = baseSchema.pick({ id: true });

// Types for transactions - used to type API request params and within Components
export type Transaction = z.infer<typeof transactionSchema>;
export type NewTransaction = z.infer<typeof insertTransactionSchema>;
export type NewTransactionParams = z.infer<typeof insertTransactionParams>;
export type UpdateTransactionParams = z.infer<typeof updateTransactionParams>;
export type TransactionId = z.infer<typeof transactionIdSchema>["id"];
    
// this type infers the return from getTransactions() - meaning it will include any joins
export type CompleteTransaction = Awaited<ReturnType<typeof getTransactions>>["transactions"][number];

