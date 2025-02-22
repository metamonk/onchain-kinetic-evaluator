import * as z from "zod"
import { Chain } from "@prisma/client"
import { CompleteUser, relatedUserSchema, CompleteTransaction, relatedTransactionSchema } from "./index"

export const trackedWalletSchema = z.object({
  id: z.string(),
  address: z.string(),
  label: z.string().nullish(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  chain: z.nativeEnum(Chain),
})

export interface CompleteTrackedWallet extends z.infer<typeof trackedWalletSchema> {
  createdBy: CompleteUser
  transactions: CompleteTransaction[]
}

/**
 * relatedTrackedWalletSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTrackedWalletSchema: z.ZodSchema<CompleteTrackedWallet> = z.lazy(() => trackedWalletSchema.extend({
  createdBy: relatedUserSchema,
  transactions: relatedTransactionSchema.array(),
}))
