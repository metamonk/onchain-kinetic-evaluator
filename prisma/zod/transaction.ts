import * as z from "zod"
import { Chain, TransactionType, TransactionStatus } from "@prisma/client"
import { CompleteTrackedWallet, relatedTrackedWalletSchema } from "./index"

export const transactionSchema = z.object({
  id: z.string(),
  hash: z.string(),
  chain: z.nativeEnum(Chain),
  from: z.string(),
  to: z.string().nullish(),
  blockTime: z.bigint(),
  blockNumber: z.bigint(),
  fee: z.bigint().nullish(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  value: z.string().nullish(),
  tokenAmount: z.number().nullish(),
  tokenAddress: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteTransaction extends z.infer<typeof transactionSchema> {
  wallets: CompleteTrackedWallet[]
}

/**
 * relatedTransactionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTransactionSchema: z.ZodSchema<CompleteTransaction> = z.lazy(() => transactionSchema.extend({
  wallets: relatedTrackedWalletSchema.array(),
}))
