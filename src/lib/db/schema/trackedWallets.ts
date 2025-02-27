import { trackedWalletSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getTrackedWallets } from "@/lib/api/trackedWallets/queries";

// Base schema: omit Prisma-managed timestamps
const baseSchema = trackedWalletSchema.omit(timestamps);

// Schema for inserting new tracked wallets
export const insertTrackedWalletSchema = baseSchema.omit({ id: true, userId: true });

// Params for API requests (normalized to match Prisma)
export const insertTrackedWalletParams = baseSchema.extend({
  address: z.string().min(1),
  label: z.string().min(1)
}).omit({ 
  id: true,
  userId: true,
  chain: true
});

// Schema for updating tracked wallets
// export const updateTrackedWalletSchema = baseSchema;
export const updateTrackedWalletSchema = baseSchema.omit({ userId: true });

// Params for updating tracked wallets
export const updateTrackedWalletParams = updateTrackedWalletSchema.extend({
  address: z.string().min(1),
  label: z.string().min(1)
}).omit({
  chain: true
});

// Schema for tracked wallet ID
export const trackedWalletIdSchema = baseSchema.pick({ id: true });

// Types for TypeScript
export type TrackedWallet = z.infer<typeof trackedWalletSchema>;
export type NewTrackedWallet = z.infer<typeof insertTrackedWalletSchema>;
export type NewTrackedWalletParams = z.infer<typeof insertTrackedWalletParams>;
export type UpdateTrackedWalletParams = z.infer<typeof updateTrackedWalletParams>;
export type TrackedWalletId = z.infer<typeof trackedWalletIdSchema>["id"];

// Type for complete tracked wallet with joins
export type CompleteTrackedWallet = Awaited<ReturnType<typeof getTrackedWallets>>["trackedWallets"][number]