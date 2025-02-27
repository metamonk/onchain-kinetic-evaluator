import * as z from "zod"
import { CompleteTrackedWallet, relatedTrackedWalletSchema } from "./index"

export const userSchema = z.object({
  id: z.string(),
  privyId: z.string(),
  walletAddress: z.string(),
  isAdmin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof userSchema> {
  createdWallets: CompleteTrackedWallet[]
}

/**
 * relatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => userSchema.extend({
  createdWallets: relatedTrackedWalletSchema.array(),
}))
