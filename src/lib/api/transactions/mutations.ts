import { db } from "@/lib/db/index";
import { 
  TransactionId, 
  NewTransactionParams,
  UpdateTransactionParams, 
  updateTransactionSchema,
  insertTransactionSchema, 
  transactionIdSchema 
} from "@/lib/db/schema/transactions";

export const createTransaction = async (transaction: NewTransactionParams) => {
  const newTransaction = insertTransactionSchema.parse(transaction);
  try {
    const t = await db.transaction.create({ data: newTransaction });
    return { transaction: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateTransaction = async (id: TransactionId, transaction: UpdateTransactionParams) => {
  const { id: transactionId } = transactionIdSchema.parse({ id });
  const newTransaction = updateTransactionSchema.parse(transaction);
  try {
    const t = await db.transaction.update({ where: { id: transactionId }, data: newTransaction})
    return { transaction: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteTransaction = async (id: TransactionId) => {
  const { id: transactionId } = transactionIdSchema.parse({ id });
  try {
    const t = await db.transaction.delete({ where: { id: transactionId }})
    return { transaction: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

