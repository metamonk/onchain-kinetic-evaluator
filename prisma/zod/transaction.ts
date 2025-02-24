import * as z from "zod"
import { Chain } from "@prisma/client"
import { CompleteTrackedWallet, relatedTrackedWalletSchema } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const transactionSchema = z.object({
  id: z.string(),
  signature: z.string(),
  from: z.string(),
  to: z.string(),
  walletId: z.string(),
  timestamp: z.date(),
  type: z.string(),
  amount: z.number().nullish(),
  token: z.string().nullish(),
  status: z.string(),
  raw: jsonSchema,
  chain: z.nativeEnum(Chain),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteTransaction extends z.infer<typeof transactionSchema> {
  wallet: CompleteTrackedWallet
}

/**
 * relatedTransactionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTransactionSchema: z.ZodSchema<CompleteTransaction> = z.lazy(() => transactionSchema.extend({
  wallet: relatedTrackedWalletSchema,
}))
