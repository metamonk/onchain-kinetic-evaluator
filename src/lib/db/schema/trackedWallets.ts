import { trackedWalletSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getTrackedWallets } from "@/lib/api/trackedWallets/queries";


// Schema for trackedWallets - used to validate API requests
const baseSchema = trackedWalletSchema.omit(timestamps)

export const insertTrackedWalletSchema = baseSchema.omit({ id: true, userId: true });
export const insertTrackedWalletParams = baseSchema.extend({
  address: z.string().min(1),
  label: z.string().min(1)
}).omit({ 
  id: true,
  userId: true
});

export const updateTrackedWalletSchema = baseSchema.omit({ userId: true });
export const updateTrackedWalletParams = updateTrackedWalletSchema.extend({
  address: z.string().min(1),
  label: z.string().min(1)
});
export const trackedWalletIdSchema = baseSchema.pick({ id: true });

// Types for trackedWallets - used to type API request params and within Components
export type TrackedWallet = z.infer<typeof trackedWalletSchema>;
export type NewTrackedWallet = z.infer<typeof insertTrackedWalletSchema>;
export type NewTrackedWalletParams = z.infer<typeof insertTrackedWalletParams>;
export type UpdateTrackedWalletParams = z.infer<typeof updateTrackedWalletParams>;
export type TrackedWalletId = z.infer<typeof trackedWalletIdSchema>["id"];
    
// this type infers the return from getTrackedWallets() - meaning it will include any joins
export type CompleteTrackedWallet = Awaited<ReturnType<typeof getTrackedWallets>>["trackedWallets"][number];

