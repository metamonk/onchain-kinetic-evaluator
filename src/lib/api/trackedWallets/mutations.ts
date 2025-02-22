import { getUserAndUserData } from "@/lib/auth"
import { db } from "@/lib/db/index";
import { 
  TrackedWalletId, 
  NewTrackedWalletParams,
  UpdateTrackedWalletParams, 
  updateTrackedWalletSchema,
  insertTrackedWalletSchema, 
  trackedWalletIdSchema 
} from "@/lib/db/schema/trackedWallets";
import { categorizeWalletAddress } from "@/lib/utils"

export const createTrackedWallet = async (trackedWallet: NewTrackedWalletParams) => {
  // Require userData when first creating a trackedWallet
  const { userData } = await getUserAndUserData();

  const chain = categorizeWalletAddress(trackedWallet.address);

  console.log({ chain });
  
  if (chain === 'INVALID') {
    throw { error: 'Invalid wallet address' };
  }

  const newTrackedWallet = insertTrackedWalletSchema.parse({
    ...trackedWallet,
    chain
  });

  console.log({newTrackedWallet});

  try {
    const t = await db.trackedWallet.create({ 
      data: {
        ...newTrackedWallet,
        userId: userData?.id ?? ""
      } 
    });
    return { trackedWallet: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateTrackedWallet = async (id: TrackedWalletId, trackedWallet: UpdateTrackedWalletParams) => {
  const { id: trackedWalletId } = trackedWalletIdSchema.parse({ id });
  const newTrackedWallet = updateTrackedWalletSchema.parse(trackedWallet);
  try {
    const t = await db.trackedWallet.update({ where: { id: trackedWalletId }, data: newTrackedWallet})
    return { trackedWallet: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteTrackedWallet = async (id: TrackedWalletId) => {
  const { id: trackedWalletId } = trackedWalletIdSchema.parse({ id });
  try {
    const t = await db.trackedWallet.delete({ where: { id: trackedWalletId }})
    return { trackedWallet: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

