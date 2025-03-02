import { db } from "@/lib/db/index";
import { type TransactionId, transactionIdSchema } from "@/lib/db/schema/transactions";

export const getTransactions = async () => {
  const t = await db.transaction.findMany({include: { wallets: true}});
  return { transactions: t };
};

export const getTransactionById = async (id: TransactionId) => {
  const { id: transactionId } = transactionIdSchema.parse({ id });
  const t = await db.transaction.findFirst({
    where: { id: transactionId},
    include: { wallets: true }
  });
  return { transaction: t };
};


