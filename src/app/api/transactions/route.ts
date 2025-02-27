import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/api/transactions/mutations";
import { 
  transactionIdSchema,
  insertTransactionParams,
  updateTransactionParams,
  validateTransactionParams
} from "@/lib/db/schema/transactions";
import { categorizeWalletAddress } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const transactionData = await req.json();
    const validatedData = validateTransactionParams.parse(transactionData);
    const chain = categorizeWalletAddress(validatedData.from);
    if (chain === 'INVALID') {
      throw new Error(`Invalid wallet address: ${validatedData.from}`);
    }

    // Convert string fields to BigInt before passing to createTransaction
    const transactionPayload = {
      ...validatedData,
      chain,
      blockTime: BigInt(validatedData.blockTime),
      blockNumber: BigInt(validatedData.blockNumber),
      fee: validatedData.fee !== null ? BigInt(validatedData.fee) : null,
    };

    const { transaction } = await createTransaction(transactionPayload);

    revalidatePath("/transactions");
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Validation errors:', err.issues);
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      console.error('Server error:', err);
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateTransactionParams.parse(await req.json());
    const validatedParams = transactionIdSchema.parse({ id });

    const { transaction } = await updateTransaction(validatedParams.id, validatedData);

    return NextResponse.json(transaction, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = transactionIdSchema.parse({ id });
    const { transaction } = await deleteTransaction(validatedParams.id);

    return NextResponse.json(transaction, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}